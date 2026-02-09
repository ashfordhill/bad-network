package com.badnetwork.trafficsim.path;

import com.badnetwork.trafficsim.config.TrafficProperties;

/**
 * Path along a circle around the configured center with given radius.
 * Each entity is offset in phase so they are spread around the circle.
 */
public class CirclePathStrategy implements PathStrategy {

    private static final double KM_PER_DEG_LAT = 111.0;
    private static final long PERIOD_MS = 60_000; // one full lap per minute

    private final TrafficProperties.Path path;

    public CirclePathStrategy(TrafficProperties.Path path) {
        this.path = path;
    }

    @Override
    public double[] position(int entityIndex, long currentTimeMillis) {
        double centerLat = path.getCenterLat();
        double centerLon = path.getCenterLon();
        double radiusKm = path.getRadiusKm();

        // Angle: time-based + per-entity phase offset so entities don't overlap
        double t = (currentTimeMillis % PERIOD_MS) / (double) PERIOD_MS + entityIndex * 0.1;
        double angleRad = 2 * Math.PI * (t % 1.0);

        // Approx: 1° lat ≈ 111 km; 1° lon ≈ 111*cos(lat) km
        double degLatPerKm = 1.0 / KM_PER_DEG_LAT;
        double degLonPerKm = 1.0 / (KM_PER_DEG_LAT * Math.cos(Math.toRadians(centerLat)));

        double lat = centerLat + radiusKm * degLatPerKm * Math.cos(angleRad);
        double lon = centerLon + radiusKm * degLonPerKm * Math.sin(angleRad);

        return new double[]{ lat, lon };
    }
}
