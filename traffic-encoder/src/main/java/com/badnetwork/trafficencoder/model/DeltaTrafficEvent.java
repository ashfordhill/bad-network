package com.badnetwork.trafficencoder.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeltaTrafficEvent {

    private String id;
    private double deltaLat;
    private double deltaLong;
    private long timestamp;
    private boolean newEntity;
}
