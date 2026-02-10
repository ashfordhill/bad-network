package com.badnetwork.trafficencoder.service;

import com.badnetwork.trafficencoder.config.EncoderProperties;
import com.badnetwork.trafficencoder.model.DeltaTrafficEvent;
import com.badnetwork.trafficencoder.model.TrafficEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class TrafficEncoderService {

    private static final Logger log = LoggerFactory.getLogger(TrafficEncoderService.class);

    private final EncoderProperties properties;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Position> lastPositions = new ConcurrentHashMap<>();

    public TrafficEncoderService(EncoderProperties properties,
                                  KafkaTemplate<String, String> kafkaTemplate,
                                  ObjectMapper objectMapper) {
        this.properties = properties;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        log.info("TrafficEncoderService initialized - will consume from: {}", properties.getKafka().getSourceTopic());
    }

    @KafkaListener(topics = "${encoder.kafka.source-topic}", groupId = "${encoder.kafka.consumer-group-id}")
    public void consume(String message) {
        log.info("Received message: {}", message);
        try {
            TrafficEvent event = objectMapper.readValue(message, TrafficEvent.class);
            log.info("Parsed event for entity: {}", event.getId());
            
            publishOriginal(event, message);
            publishDelta(event);
            
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize traffic event: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing traffic event: {}", e.getMessage(), e);
        }
    }

    private void publishOriginal(TrafficEvent event, String originalMessage) {
        String topic = properties.getKafka().getOriginalTopic();
        kafkaTemplate.send(topic, event.getId(), originalMessage);
        log.debug("Published original event for entity {} to {}", event.getId(), topic);
    }

    private void publishDelta(TrafficEvent event) {
        String entityId = event.getId();
        Position lastPos = lastPositions.get(entityId);
        
        double deltaLat;
        double deltaLon;
        boolean isNew = lastPos == null;
        
        if (isNew) {
            deltaLat = 0.0;
            deltaLon = 0.0;
        } else {
            deltaLat = event.getLat() - lastPos.getLat();
            deltaLon = event.getLon() - lastPos.getLon();
        }
        
        lastPositions.put(entityId, new Position(event.getLat(), event.getLon()));
        
        DeltaTrafficEvent deltaEvent = new DeltaTrafficEvent(
                entityId,
                deltaLat,
                deltaLon,
                event.getTimestamp(),
                isNew
        );
        
        try {
            String json = objectMapper.writeValueAsString(deltaEvent);
            String topic = properties.getKafka().getDeltaTopic();
            kafkaTemplate.send(topic, entityId, json);
            log.debug("Published delta event for entity {} to {} (deltaLat={}, deltaLon={})",
                    entityId, topic, deltaLat, deltaLon);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize delta event for entity {}: {}", entityId, e.getMessage());
        }
    }

    @Data
    private static class Position {
        private final double lat;
        private final double lon;
    }
}
