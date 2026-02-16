import { useState, useEffect } from 'react';
import {
  Box,
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
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">
          Chaos Configuration
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="contained" color="primary" onClick={handleApply}>
            Apply
          </Button>
          <Button size="small" variant="outlined" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Loss %"
            type="number"
            value={config.lossPercent}
            onChange={(e) => handleChange('lossPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Out of Order %"
            type="number"
            value={config.outOfOrderPercent}
            onChange={(e) => handleChange('outOfOrderPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Burst Loss (s)"
            type="number"
            value={config.burstLossSeconds}
            onChange={(e) => handleChange('burstLossSeconds', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Burst Every (s)"
            type="number"
            value={config.burstLossEverySeconds}
            onChange={(e) => handleChange('burstLossEverySeconds', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Jitter (ms)"
            type="number"
            value={config.jitterMs}
            onChange={(e) => handleChange('jitterMs', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Latency (ms)"
            type="number"
            value={config.fixedLatencyMs}
            onChange={(e) => handleChange('fixedLatencyMs', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Bandwidth (B/s)"
            type="number"
            value={config.bandwidthBytesPerSec}
            onChange={(e) => handleChange('bandwidthBytesPerSec', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Queue Size"
            type="number"
            value={config.maxQueueSize}
            onChange={(e) => handleChange('maxQueueSize', parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Drop Policy</InputLabel>
            <Select
              value={config.dropPolicy}
              label="Drop Policy"
              onChange={(e) => handleChange('dropPolicy', e.target.value)}
            >
              <MenuItem value="DROP_OLDEST">Oldest</MenuItem>
              <MenuItem value="DROP_NEWEST">Newest</MenuItem>
              <MenuItem value="COALESCE_BY_ID">Coalesce</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Corrupt %"
            type="number"
            value={config.corruptCoordinatesPercent}
            onChange={(e) => handleChange('corruptCoordinatesPercent', parseFloat(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Max Corrupt (m)"
            type="number"
            value={config.maxCorruptionMeters}
            onChange={(e) => handleChange('maxCorruptionMeters', parseFloat(e.target.value))}
            inputProps={{ step: 1, min: 0 }}
          />
        </Grid>

        {metrics && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                Dropped: <strong>{metrics.dropped}</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                Reordered: <strong>{metrics.reordered}</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                Queued: <strong>{metrics.queued}</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                B/s: <strong>{metrics.bytesPerSec}</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                Avg: <strong>{metrics.avgLatencyMs}ms</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                P95: <strong>{metrics.p95LatencyMs}ms</strong>
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">
                Corrupted: <strong>{metrics.corrupted}</strong>
              </Typography>
            </Grid>
          </>
        )}
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
