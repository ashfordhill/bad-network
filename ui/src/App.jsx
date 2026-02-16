import { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Drawer,
  IconButton,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { CesiumMapProvider } from './services/map/CesiumMapProvider';
import { EntityManager } from './services/entityManager';
import websocketService from './services/websocket';
import MapView from './components/MapView';
import ChaosControlPanel from './components/ChaosControlPanel';
import './App.css';

function App() {
  const [mapProvider] = useState(() => new CesiumMapProvider('cesiumContainer'));
  const entityManagerRef = useRef(null);
  const [useDelta, setUseDelta] = useState(false);
  const [mapOptimization, setMapOptimization] = useState(false);
  const [websocketUrl, setWebsocketUrl] = useState(
    import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001'
  );
  const [topic, setTopic] = useState(import.meta.env.VITE_TOPIC || 'traffic');
  const [connected, setConnected] = useState(false);
  const [entityCount, setEntityCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    entityManagerRef.current = new EntityManager(mapProvider);
    
    websocketService.on('connect', () => setConnected(true));
    websocketService.on('disconnect', () => setConnected(false));
    websocketService.on('traffic', handleTrafficData);

    return () => {
      websocketService.disconnect();
      if (mapProvider) {
        mapProvider.destroy();
      }
    };
  }, [mapProvider]);

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
      websocketService.connect(websocketUrl, topic);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
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
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapView mapProvider={mapProvider} />
        </Box>

        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            label="WebSocket URL"
            value={websocketUrl}
            onChange={(e) => setWebsocketUrl(e.target.value)}
            disabled={connected}
            sx={{ minWidth: 250 }}
          />
          
          <TextField
            size="small"
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          
          <Button
            variant="contained"
            onClick={handleConnect}
            color={connected ? 'error' : 'primary'}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </Button>

          {connected && (
            <Button variant="outlined" onClick={handleTopicChange}>
              Subscribe to Topic
            </Button>
          )}

          <Button variant="outlined" onClick={handleClearEntities}>
            Clear Entities
          </Button>

          <FormControlLabel
            control={
              <Switch
                checked={useDelta}
                onChange={(e) => setUseDelta(e.target.checked)}
              />
            }
            label="Use Delta Traffic"
          />

          <FormControlLabel
            control={
              <Switch
                checked={mapOptimization}
                onChange={(e) => setMapOptimization(e.target.checked)}
              />
            }
            label="Map Optimization"
          />
        </Box>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <ChaosControlPanel />
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;
