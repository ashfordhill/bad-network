package com.badnetwork.trafficsim.path;

/**
 * Computes (lat, lon) for an entity at a given time.
 * Stateless: position is derived from entityIndex and currentTimeMillis.
 */
public interface PathStrategy {

    /**
     * @param entityIndex 0-based index of the entity (for phase offset).
     * @param currentTimeMillis current time in milliseconds (e.g. System.currentTimeMillis()).
     * @return [0] = latitude, [1] = longitude
     */
    double[] position(int entityIndex, long currentTimeMillis);
}
