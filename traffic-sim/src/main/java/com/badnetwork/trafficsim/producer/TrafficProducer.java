package com.badnetwork.trafficsim.producer;

import com.badnetwork.trafficsim.config.TrafficProperties;
import com.badnetwork.trafficsim.model.TrafficEvent;
import com.badnetwork.trafficsim.path.PathStrategy;
import com.badnetwork.trafficsim.path.PathStrategyFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.util.UUID;

@Component
public class TrafficProducer {

    private static final Logger log = LoggerFactory.getLogger(TrafficProducer.class);

    private final TrafficProperties properties;
    private final PathStrategy pathStrategy;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String effectiveInstanceId;

    public TrafficProducer(TrafficProperties properties,
                           PathStrategyFactory pathStrategyFactory,
                           KafkaTemplate<String, String> kafkaTemplate,
                           ObjectMapper objectMapper) {
        this.properties = properties;
        this.pathStrategy = pathStrategyFactory.create();
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.effectiveInstanceId = resolveInstanceId(properties.getInstanceId());
        log.info("Traffic producer started with instance-id={}, entity-count={}, topic={}",
                effectiveInstanceId, properties.getEntityCount(), properties.getKafka().getTopic());
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

    @Scheduled(fixedRateString = "${traffic.publish-interval-ms}")
    public void publishPositions() {
        long now = System.currentTimeMillis();
        String topic = properties.getKafka().getTopic();
        int count = properties.getEntityCount();

        for (int i = 0; i < count; i++) {
            String entityId = effectiveInstanceId + "-" + i;
            double[] pos = pathStrategy.position(i, now);
            TrafficEvent event = new TrafficEvent(entityId, pos[0], pos[1], now);
            try {
                String json = objectMapper.writeValueAsString(event);
                kafkaTemplate.send(topic, entityId, json);
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize event for entity {}: {}", entityId, e.getMessage());
            }
        }
    }
}
