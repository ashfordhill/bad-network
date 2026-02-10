package com.badnetwork.trafficsim.producer;

import com.badnetwork.trafficsim.config.TrafficProperties;
import com.badnetwork.trafficsim.model.TrafficEvent;
import com.badnetwork.trafficsim.path.PathStrategy;
import com.badnetwork.trafficsim.path.PathStrategyFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class TrafficProducer {

    private static final Logger log = LoggerFactory.getLogger(TrafficProducer.class);

    private final TrafficProperties properties;
    private final PathStrategy pathStrategy;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String effectiveInstanceId;
    private ScheduledExecutorService scheduler;

    public TrafficProducer(TrafficProperties properties,
                           PathStrategyFactory pathStrategyFactory,
                           KafkaTemplate<String, String> kafkaTemplate,
                           ObjectMapper objectMapper) {
        this.properties = properties;
        this.pathStrategy = pathStrategyFactory.create();
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.effectiveInstanceId = resolveInstanceId(properties.getInstanceId());
    }

    @PostConstruct
    public void start() {
        int entityCount = properties.getEntityCount();
        long intervalMs = properties.getPublishIntervalMs();
        String topic = properties.getKafka().getTopic();

        log.info("Starting traffic producer: instance-id={}, entity-count={}, interval={}ms, topic={}",
                effectiveInstanceId, entityCount, intervalMs, topic);

        scheduler = Executors.newScheduledThreadPool(Math.min(entityCount, 10));

        for (int i = 0; i < entityCount; i++) {
            final int entityIndex = i;
            final String entityId = effectiveInstanceId + "-" + entityIndex;

            scheduler.scheduleAtFixedRate(
                    () -> publishPosition(entityId, entityIndex, topic),
                    0,
                    intervalMs,
                    TimeUnit.MILLISECONDS
            );
        }

        log.info("Scheduled {} entities across thread pool", entityCount);
    }

    @PreDestroy
    public void stop() {
        log.info("Shutting down traffic producer...");
        if (scheduler != null) {
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        log.info("Traffic producer stopped");
    }

    private void publishPosition(String entityId, int entityIndex, String topic) {
        try {
            long now = System.currentTimeMillis();
            double[] pos = pathStrategy.position(entityIndex, now);
            TrafficEvent event = new TrafficEvent(entityId, pos[0], pos[1], now);
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, entityId, json);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize event for entity {}: {}", entityId, e.getMessage());
        } catch (Exception e) {
            log.error("Error publishing position for entity {}: {}", entityId, e.getMessage());
        }
    }

    private static String resolveInstanceId(String configured) {
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }
        try {
            String hostname = InetAddress.getLocalHost().getHostName();
            if (hostname != null && !hostname.isBlank()) {
                return hostname;
            }
        } catch (Exception ignored) {
        }
        return "traffic-sim-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
