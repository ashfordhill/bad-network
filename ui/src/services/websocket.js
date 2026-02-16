export class WebSocketService {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = Infinity;
    this.reconnectDelay = 1000;
    this.currentUrl = null;
  }

  connect(url) {
    if (this.ws) {
      this.disconnect();
    }

    if (!url) {
      console.error('WebSocket URL is required');
      return null;
    }

    // Convert http/https URLs to ws/wss
    const wsUrl = url.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    this.currentUrl = wsUrl;
    this.reconnectAttempts = 0;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected to', wsUrl);
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emitToListeners('connect', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          this.emitToListeners('traffic', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.emitToListeners('traffic', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emitToListeners('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.emitToListeners('disconnect', { connected: false });
        this.attemptReconnect();
      };

      return this.ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.emitToListeners('error', error);
      return null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUrl) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 5000);
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts}) in ${delay}ms...`);
      setTimeout(() => {
        this.connect(this.currentUrl);
      }, delay);
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  subscribeTopic(topic) {
    // Native WebSocket doesn't support subscribe operation
    console.log('Topic subscription not supported for native WebSocket. Connected to configured endpoint.');
  }

  unsubscribeTopic(topic) {
    // Native WebSocket doesn't support unsubscribe operation
    console.log('Topic unsubscription not supported for native WebSocket.');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
