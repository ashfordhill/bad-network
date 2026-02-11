package com.badnetwork.trafficscrambler.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "scrambler")
@Data
public class ScramblerProperties {
    
    private KafkaProperties kafka = new KafkaProperties();
    
    @Data
    public static class KafkaProperties {
        private String sourceTopic;
        private String chaosTopic;
        private String consumerGroupId;
    }
}
