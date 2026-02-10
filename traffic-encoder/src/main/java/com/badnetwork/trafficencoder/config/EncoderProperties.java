package com.badnetwork.trafficencoder.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@ConfigurationProperties(prefix = "encoder")
@Data
public class EncoderProperties {

    private Kafka kafka = new Kafka();

    @Data
    public static final class Kafka {
        private String sourceTopic = "traffic-events";
        private String originalTopic = "traffic-original";
        private String deltaTopic = "traffic-delta";
        private String consumerGroupId = "traffic-encoder";
    }
}
