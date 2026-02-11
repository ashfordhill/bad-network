package com.badnetwork.trafficscrambler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChaosMetrics {
    
    private long dropped;
    private long reordered;
    private long queued;
    private long bytesPerSec;
    private long avgLatencyMs;
    private long p95LatencyMs;
    private long corrupted;
}
