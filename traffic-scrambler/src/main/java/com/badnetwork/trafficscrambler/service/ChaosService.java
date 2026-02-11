package com.badnetwork.trafficscrambler.service;

import com.badnetwork.trafficscrambler.config.ScramblerProperties;
import com.badnetwork.trafficscrambler.model.ChaosConfig;
import com.badnetwork.trafficscrambler.model.ChaosMetrics;
import com.badnetwork.trafficscrambler.model.DeltaTrafficEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ChaosService {

    private static final Logger log = LoggerFactory.getLogger(ChaosService.class);

    private final ScramblerProperties properties;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    private ChaosConfig chaosConfig = new ChaosConfig();
    
    private final ConcurrentLinkedQueue<QueuedMessage> messageQueue = new ConcurrentLinkedQueue<>();
    private final ConcurrentLinkedQueue<QueuedMessage> reorderBuffer = new ConcurrentLinkedQueue<>();
    
    private final AtomicLong droppedCount = new AtomicLong(0);
    private final AtomicLong reorderedCount = new AtomicLong(0);
    private final AtomicLong corruptedCount = new AtomicLong(0);
    private final ConcurrentLinkedQueue<Long> latencies = new ConcurrentLinkedQueue<>();
    private final AtomicLong bytesThisSecond = new AtomicLong(0);
    
    private volatile long lastBurstTime = System.currentTimeMillis();
    private volatile boolean inBurst = false;

    public ChaosService(ScramblerProperties properties,
                        KafkaTemplate<String, String> kafkaTemplate,
                        ObjectMapper objectMapper) {
        this.properties = properties;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        
        scheduler.scheduleAtFixedRate(this::processBandwidthReset, 1, 1, TimeUnit.SECONDS);
        scheduler.scheduleAtFixedRate(this::processDelayedMessages, 10, 10, TimeUnit.MILLISECONDS);
        
        log.info("ChaosService initialized - will consume from: {}", properties.getKafka().getSourceTopic());
    }

    @KafkaListener(topics = "${scrambler.kafka.source-topic}", groupId = "${scrambler.kafka.consumer-group-id}")
    public void consume(String message) {
        log.debug("Received message: {}", message);
        
        try {
            DeltaTrafficEvent event = objectMapper.readValue(message, DeltaTrafficEvent.class);
            processChaos(event, message);
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize delta traffic event: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing chaos event: {}", e.getMessage(), e);
        }
    }

    private void processChaos(DeltaTrafficEvent event, String originalMessage) {
        if (shouldDrop()) {
            droppedCount.incrementAndGet();
            log.debug("Dropped message for entity: {}", event.getId());
            return;
        }
        
        if (shouldCorrupt()) {
            corruptCoordinates(event);
            corruptedCount.incrementAndGet();
            try {
                originalMessage = objectMapper.writeValueAsString(event);
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize corrupted event", e);
            }
        }
        
        int delayMs = calculateDelay();
        
        if (delayMs > 0 || shouldReorder()) {
            QueuedMessage qm = new QueuedMessage(
                event.getId(),
                originalMessage,
                System.currentTimeMillis() + delayMs,
                originalMessage.length()
            );
            
            if (shouldReorder()) {
                reorderBuffer.offer(qm);
                reorderedCount.incrementAndGet();
            } else {
                messageQueue.offer(qm);
            }
        } else {
            sendMessage(event.getId(), originalMessage, originalMessage.length());
        }
    }

    private boolean shouldDrop() {
        if (chaosConfig.getBurstLossSeconds() > 0 && chaosConfig.getBurstLossEverySeconds() > 0) {
            long now = System.currentTimeMillis();
            long elapsed = now - lastBurstTime;
            long burstInterval = chaosConfig.getBurstLossEverySeconds() * 1000L;
            long burstDuration = chaosConfig.getBurstLossSeconds() * 1000L;
            
            if (elapsed >= burstInterval) {
                lastBurstTime = now;
                inBurst = true;
            }
            
            if (inBurst && elapsed < burstDuration) {
                return true;
            } else if (elapsed >= burstDuration) {
                inBurst = false;
            }
        }
        
        return random.nextDouble() < chaosConfig.getLossPercent();
    }

    private boolean shouldReorder() {
        return random.nextDouble() < chaosConfig.getOutOfOrderPercent();
    }

    private boolean shouldCorrupt() {
        return random.nextDouble() < chaosConfig.getCorruptCoordinatesPercent();
    }

    private void corruptCoordinates(DeltaTrafficEvent event) {
        double maxMeters = chaosConfig.getMaxCorruptionMeters();
        if (maxMeters > 0) {
            double deltaLat = (random.nextDouble() - 0.5) * 2 * (maxMeters / 111000.0);
            double deltaLon = (random.nextDouble() - 0.5) * 2 * (maxMeters / 111000.0);
            event.setDeltaLat(event.getDeltaLat() + deltaLat);
            event.setDeltaLong(event.getDeltaLong() + deltaLon);
        }
    }

    private int calculateDelay() {
        int delay = chaosConfig.getFixedLatencyMs();
        if (chaosConfig.getJitterMs() > 0) {
            delay += random.nextInt(chaosConfig.getJitterMs());
        }
        return delay;
    }

    private void processDelayedMessages() {
        long now = System.currentTimeMillis();
        
        List<QueuedMessage> reordered = new ArrayList<>();
        QueuedMessage qm;
        while ((qm = reorderBuffer.poll()) != null) {
            reordered.add(qm);
        }
        Collections.shuffle(reordered);
        for (QueuedMessage msg : reordered) {
            messageQueue.offer(msg);
        }
        
        while ((qm = messageQueue.peek()) != null) {
            if (qm.getSendTime() <= now) {
                messageQueue.poll();
                
                if (exceedsQueueSize()) {
                    applyDropPolicy(qm);
                } else {
                    sendMessage(qm.getEntityId(), qm.getMessage(), qm.getSize());
                }
            } else {
                break;
            }
        }
    }

    private boolean exceedsQueueSize() {
        return messageQueue.size() > chaosConfig.getMaxQueueSize();
    }

    private void applyDropPolicy(QueuedMessage message) {
        if (chaosConfig.getDropPolicy() == ChaosConfig.DropPolicy.DROP_OLDEST) {
            droppedCount.incrementAndGet();
            log.debug("Dropped oldest message (queue full)");
        } else if (chaosConfig.getDropPolicy() == ChaosConfig.DropPolicy.DROP_NEWEST) {
            sendMessage(message.getEntityId(), message.getMessage(), message.getSize());
        } else if (chaosConfig.getDropPolicy() == ChaosConfig.DropPolicy.COALESCE_BY_ID) {
            Map<String, QueuedMessage> coalesced = new HashMap<>();
            messageQueue.forEach(qm -> coalesced.put(qm.getEntityId(), qm));
            messageQueue.clear();
            messageQueue.addAll(coalesced.values());
        }
    }

    private void sendMessage(String entityId, String message, int size) {
        if (chaosConfig.getBandwidthBytesPerSec() > 0) {
            long currentBytes = bytesThisSecond.addAndGet(size);
            if (currentBytes > chaosConfig.getBandwidthBytesPerSec()) {
                messageQueue.offer(new QueuedMessage(
                    entityId, 
                    message, 
                    System.currentTimeMillis() + 100,
                    size
                ));
                return;
            }
        }
        
        long startTime = System.currentTimeMillis();
        kafkaTemplate.send(properties.getKafka().getChaosTopic(), entityId, message);
        long latency = System.currentTimeMillis() - startTime;
        latencies.offer(latency);
        
        if (latencies.size() > 1000) {
            latencies.poll();
        }
        
        log.debug("Sent chaos message for entity: {}", entityId);
    }

    private void processBandwidthReset() {
        bytesThisSecond.set(0);
    }

    public void updateChaosConfig(ChaosConfig config) {
        this.chaosConfig = config;
        log.info("Chaos configuration updated: {}", config);
    }

    public ChaosConfig getChaosConfig() {
        return chaosConfig;
    }

    public ChaosMetrics getMetrics() {
        List<Long> latencyList = new ArrayList<>(latencies);
        long avgLatency = latencyList.isEmpty() ? 0 : 
            (long) latencyList.stream().mapToLong(Long::longValue).average().orElse(0);
        
        Collections.sort(latencyList);
        long p95Latency = latencyList.isEmpty() ? 0 : 
            latencyList.get((int) (latencyList.size() * 0.95));
        
        return new ChaosMetrics(
            droppedCount.get(),
            reorderedCount.get(),
            messageQueue.size(),
            bytesThisSecond.get(),
            avgLatency,
            p95Latency,
            corruptedCount.get()
        );
    }

    @Data
    private static class QueuedMessage {
        private final String entityId;
        private final String message;
        private final long sendTime;
        private final int size;
    }
}
