import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import api from '../services/api';

export default function ChaosControlPanel() {
  const [config, setConfig] = useState({
    lossPercent: 0.0,
    burstLossSeconds: 0,
    burstLossEverySeconds: 0,
    jitterMs: 0,
    fixedLatencyMs: 0,
    outOfOrderPercent: 0.0,
    bandwidthBytesPerSec: 0,
    maxQueueSize: 10000,
    dropPolicy: 'DROP_OLDEST',
    corruptCoordinatesPercent: 0.0,
    maxCorruptionMeters: 0.0,
  });

  const [metrics, setMetrics] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadConfig();
    const interval = setInterval(loadMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getChaosConfig();
      setConfig(data);
    } catch (error) {
      showSnackbar('Failed to load chaos config', 'error');
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = async () => {
    try {
      await api.updateChaosConfig(config);
      showSnackbar('Chaos config updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update chaos config', 'error');
    }
  };

  const handleReset = async () => {
    try {
      await api.resetChaosConfig();
      await loadConfig();
      showSnackbar('Chaos config reset to defaults', 'success');
    } catch (error) {
      showSnackbar('Failed to reset chaos config', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Chaos Configuration
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Loss Percent"
            type="number"
            value={config.lossPercent}
            onChange={(e) => handleChange('lossPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Out of Order Percent"
            type="number"
            value={config.outOfOrderPercent}
            onChange={(e) => handleChange('outOfOrderPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Burst Loss Seconds"
            type="number"
            value={config.burstLossSeconds}
            onChange={(e) => handleChange('burstLossSeconds', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Burst Loss Every Seconds"
            type="number"
            value={config.burstLossEverySeconds}
            onChange={(e) => handleChange('burstLossEverySeconds', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Jitter (ms)"
            type="number"
            value={config.jitterMs}
            onChange={(e) => handleChange('jitterMs', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Fixed Latency (ms)"
            type="number"
            value={config.fixedLatencyMs}
            onChange={(e) => handleChange('fixedLatencyMs', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bandwidth (Bytes/sec)"
            type="number"
            value={config.bandwidthBytesPerSec}
            onChange={(e) => handleChange('bandwidthBytesPerSec', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Max Queue Size"
            type="number"
            value={config.maxQueueSize}
            onChange={(e) => handleChange('maxQueueSize', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Drop Policy</InputLabel>
            <Select
              value={config.dropPolicy}
              label="Drop Policy"
              onChange={(e) => handleChange('dropPolicy', e.target.value)}
            >
              <MenuItem value="DROP_OLDEST">Drop Oldest</MenuItem>
              <MenuItem value="DROP_NEWEST">Drop Newest</MenuItem>
              <MenuItem value="COALESCE_BY_ID">Coalesce By ID</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Corrupt Coordinates Percent"
            type="number"
            value={config.corruptCoordinatesPercent}
            onChange={(e) => handleChange('corruptCoordinatesPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Max Corruption (meters)"
            type="number"
            value={config.maxCorruptionMeters}
            onChange={(e) => handleChange('maxCorruptionMeters', parseFloat(e.target.value))}
            inputProps={{ step: 1, min: 0 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleApply}>
              Apply Configuration
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </Box>
        </Grid>

        {metrics && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Metrics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Dropped: <strong>{metrics.dropped}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Reordered: <strong>{metrics.reordered}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Queued: <strong>{metrics.queued}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Bytes/sec: <strong>{metrics.bytesPerSec}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Avg Latency: <strong>{metrics.avgLatencyMs}ms</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                P95 Latency: <strong>{metrics.p95LatencyMs}ms</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary">
                Corrupted: <strong>{metrics.corrupted}</strong>
              </Typography>
            </Grid>
          </>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
