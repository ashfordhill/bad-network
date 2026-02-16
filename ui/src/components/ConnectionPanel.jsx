import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';

export default function ConnectionPanel({ 
  websocketUrl, 
  setWebsocketUrl, 
  topic, 
  setTopic, 
  connected, 
  onConnect,
  onSubscribeTopic,
  useDelta,
  setUseDelta,
  mapOptimization,
  setMapOptimization,
  onClearEntities,
}) {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Connection Settings
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="WebSocket URL"
          value={websocketUrl}
          onChange={(e) => setWebsocketUrl(e.target.value)}
          disabled={connected}
        />
        
        <TextField
          fullWidth
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={onConnect}
          color={connected ? 'error' : 'primary'}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </Button>

        {connected && (
          <Button fullWidth variant="outlined" onClick={onSubscribeTopic}>
            Subscribe to Topic
          </Button>
        )}

        <Button fullWidth variant="outlined" onClick={onClearEntities}>
          Clear Entities
        </Button>

        <Divider sx={{ my: 1 }} />

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
    </Paper>
  );
}
