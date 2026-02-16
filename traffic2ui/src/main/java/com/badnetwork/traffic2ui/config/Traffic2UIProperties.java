package com.badnetwork.traffic2ui.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "traffic2ui")
public class Traffic2UIProperties {
    private KafkaConfig kafka = new KafkaConfig();
    private WebSocketConfig websocket = new WebSocketConfig();

    @Data
    public static class KafkaConfig {
        private String topic;
        private String consumerGroupId;
    }

    @Data
    public static class WebSocketConfig {
        private String endpoint;
    }
}
