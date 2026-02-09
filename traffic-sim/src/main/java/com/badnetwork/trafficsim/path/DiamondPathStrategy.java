package com.badnetwork.trafficsim.path;

import com.badnetwork.trafficsim.config.TrafficProperties;

/**
 * Path along a diamond (four segments): N -> E -> S -> W -> N.
 * Size derived from path radius-km; each entity has a phase offset.
 */
public class DiamondPathStrategy implements PathStrategy {

    private static final double KM_PER_DEG_LAT = 111.0;
    private static final long PERIOD_MS = 60_000; // one full lap per minute

    private final TrafficProperties.Path path;

    public DiamondPathStrategy(TrafficProperties.Path path) {
        this.path = path;
    }

    @Override
    public double[] position(int entityIndex, long currentTimeMillis) {
        double centerLat = path.getCenterLat();
        double centerLon = path.getCenterLon();
        double radiusKm = path.getRadiusKm();

        double halfDegLat = radiusKm / KM_PER_DEG_LAT;
        double halfDegLon = radiusKm / (KM_PER_DEG_LAT * Math.cos(Math.toRadians(centerLat)));

        // Corners: N, E, S, W
        double nLat = centerLat + halfDegLat;
        double sLat = centerLat - halfDegLat;
        double eLon = centerLon + halfDegLon;
        double wLon = centerLon - halfDegLon;

        // t in [0, 1): one full loop
        double t = ((currentTimeMillis % PERIOD_MS) / (double) PERIOD_MS + entityIndex * 0.1) % 1.0;

        double lat;
        double lon;
        double s0 = t * 4; // segment 0..4
        int seg = (int) s0;
        double u = s0 - seg;

        switch (seg % 4) {
            case 0 -> { // N -> E
                lat = nLat + u * (centerLat - nLat);
                lon = centerLon + u * (eLon - centerLon);
            }
            case 1 -> { // E -> S
                lat = centerLat + u * (sLat - centerLat);
                lon = eLon + u * (centerLon - eLon);
            }
            case 2 -> { // S -> W
                lat = sLat + u * (centerLat - sLat);
                lon = centerLon + u * (wLon - centerLon);
            }
            default -> { // W -> N
                lat = centerLat + u * (nLat - centerLat);
                lon = wLon + u * (centerLon - wLon);
            }
        }

        return new double[]{ lat, lon };
    }
}
