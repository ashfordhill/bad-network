package com.badnetwork.trafficscrambler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChaosConfig {
    
    private double lossPercent = 0.0;
    private int burstLossSeconds = 0;
    private int burstLossEverySeconds = 0;
    private int jitterMs = 0;
    private int fixedLatencyMs = 0;
    private double outOfOrderPercent = 0.0;
    private long bandwidthBytesPerSec = 0;
    private int maxQueueSize = 10000;
    private DropPolicy dropPolicy = DropPolicy.DROP_OLDEST;
    private double corruptCoordinatesPercent = 0.0;
    private double maxCorruptionMeters = 0.0;
    
    public enum DropPolicy {
        DROP_OLDEST,
        DROP_NEWEST,
        COALESCE_BY_ID
    }
}
