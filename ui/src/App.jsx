import { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  Chip,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { CesiumMapProvider } from './services/map/CesiumMapProvider';
import { EntityManager } from './services/entityManager';
import websocketService from './services/websocket';
import MapView from './components/MapView';
import ChaosControlPanel from './components/ChaosControlPanel';
import ConnectionPanel from './components/ConnectionPanel';
import './App.css';

function App() {
  const [mapProvider] = useState(() => new CesiumMapProvider('cesiumContainer'));
  const entityManagerRef = useRef(null);
  const [useDelta, setUseDelta] = useState(false);
  const [mapOptimization, setMapOptimization] = useState(false);
  const [websocketUrl, setWebsocketUrl] = useState(
    import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:7990/traffic'
  );
  const [topic, setTopic] = useState(import.meta.env.VITE_TOPIC || 'traffic-delta');
  const [connected, setConnected] = useState(false);
  const [entityCount, setEntityCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    entityManagerRef.current = new EntityManager(mapProvider);
    
    websocketService.on('connect', () => setConnected(true));
    websocketService.on('disconnect', () => setConnected(false));
    websocketService.on('traffic', handleTrafficData);
    
    // Connect to websocket on mount
    websocketService.connect(websocketUrl);

    return () => {
      websocketService.disconnect();
      if (mapProvider) {
        mapProvider.destroy();
      }
    };
  }, [mapProvider, websocketUrl]);

  useEffect(() => {
    if (entityManagerRef.current) {
      entityManagerRef.current.setUseDelta(useDelta);
    }
  }, [useDelta]);

  useEffect(() => {
    if (mapProvider) {
      mapProvider.setOptimization(mapOptimization);
    }
  }, [mapOptimization, mapProvider]);

  const handleTrafficData = (data) => {
    if (entityManagerRef.current) {
      entityManagerRef.current.handleTrafficEvent(data);
      setEntityCount(entityManagerRef.current.getEntityCount());
    }
  };

  const handleConnect = () => {
    if (connected) {
      websocketService.disconnect();
    } else {
      websocketService.connect(websocketUrl);
    }
  };

  const handleTopicChange = () => {
    if (connected) {
      websocketService.subscribeTopic(topic);
    }
  };

  const handleClearEntities = () => {
    if (entityManagerRef.current) {
      entityManagerRef.current.clearAll();
      setEntityCount(0);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Traffic Visualization
          </Typography>
          <Chip
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
            sx={{ mr: 2 }}
          />
          <Chip
            label={`Entities: ${entityCount}`}
            color="primary"
            size="small"
            sx={{ mr: 2 }}
          />
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setDrawerOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapView mapProvider={mapProvider} />
      </Box>

      <Box
        sx={{
          height: '250px',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <ChaosControlPanel />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 350 }}>
          <ConnectionPanel
            websocketUrl={websocketUrl}
            setWebsocketUrl={setWebsocketUrl}
            topic={topic}
            setTopic={setTopic}
            connected={connected}
            onConnect={handleConnect}
            onSubscribeTopic={handleTopicChange}
            useDelta={useDelta}
            setUseDelta={setUseDelta}
            mapOptimization={mapOptimization}
            setMapOptimization={setMapOptimization}
            onClearEntities={handleClearEntities}
          />
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;
