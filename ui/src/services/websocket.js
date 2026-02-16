import { io } from 'socket.io-client';

export class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(url, topic) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.emitToListeners('connect', { connected: true });
      
      if (topic) {
        this.socket.emit('subscribe', { topic });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.emitToListeners('disconnect', { connected: false });
    });

    this.socket.on('traffic', (data) => {
      this.emitToListeners('traffic', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emitToListeners('error', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  subscribeTopic(topic) {
    if (this.socket && this.connected) {
      this.socket.emit('subscribe', { topic });
    }
  }

  unsubscribeTopic(topic) {
    if (this.socket && this.connected) {
      this.socket.emit('unsubscribe', { topic });
    }
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
