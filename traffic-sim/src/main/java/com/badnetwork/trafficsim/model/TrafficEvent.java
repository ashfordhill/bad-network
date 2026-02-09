package com.badnetwork.trafficsim.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single traffic entity position event published to Kafka.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrafficEvent {

    private String id;
    private double lat;
    @JsonProperty("long")
    private double lon;
    private long timestamp;
}
