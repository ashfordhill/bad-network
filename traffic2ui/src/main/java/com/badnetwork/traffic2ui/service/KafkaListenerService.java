package com.badnetwork.traffic2ui.service;

import com.badnetwork.traffic2ui.handler.TrafficWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaListenerService {

    private final TrafficWebSocketHandler webSocketHandler;

    @KafkaListener(
            topics = "${traffic2ui.kafka.topic}",
            groupId = "${traffic2ui.kafka.consumer-group-id}"
    )
    public void listen(String message) {
        log.debug("Received message from Kafka: {}", message);
        webSocketHandler.broadcast(message);
    }
}
