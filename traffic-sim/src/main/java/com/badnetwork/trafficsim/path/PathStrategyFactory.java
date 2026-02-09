package com.badnetwork.trafficsim.path;

import com.badnetwork.trafficsim.config.TrafficProperties;
import org.springframework.stereotype.Component;

@Component
public class PathStrategyFactory {

    private final TrafficProperties.Path pathConfig;

    public PathStrategyFactory(TrafficProperties trafficProperties) {
        this.pathConfig = trafficProperties.getPath();
    }

    public PathStrategy create() {
        return switch (pathConfig.getShape().toLowerCase()) {
            case "circle" -> new CirclePathStrategy(pathConfig);
            case "diamond" -> new DiamondPathStrategy(pathConfig);
            default -> new CirclePathStrategy(pathConfig);
        };
    }
}
