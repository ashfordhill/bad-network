package com.badnetwork.trafficsim.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "traffic")
@Data
public class TrafficProperties {

    private int entityCount = 10;
    private long publishIntervalMs = 1000L;
    private String instanceId = "";
    private Kafka kafka = new Kafka();
    private Path path = new Path();

    @Data
    public static final class Kafka {
        private String topic = "traffic-events";
    }

    @Data
    public static final class Path {
        private String shape = "circle";
        private double centerLat = 40.0;
        private double centerLon = -74.0;
        private double radiusKm = 0.5;
    }
}
