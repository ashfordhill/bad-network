import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

export default function MapView({ mapProvider, onMapReady }) {
  const mapContainerRef = useRef(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (mapContainerRef.current && !mapInitialized.current && mapProvider) {
      mapInitialized.current = true;
      
      try {
        const viewer = mapProvider.initialize();
        if (onMapReady) {
          onMapReady(viewer);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }

    return () => {
      if (mapProvider && mapInitialized.current) {
        mapProvider.destroy();
        mapInitialized.current = false;
      }
    };
  }, [mapProvider, onMapReady]);

  return (
    <Box
      ref={mapContainerRef}
      id="cesiumContainer"
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
}
