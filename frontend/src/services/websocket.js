class WebSocketService {
  constructor() {
    this.connections = {};
    this.reconnectAttempts = {};
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isReconnecting = {};
  }

  connect(channel, onMessage, onError, onClose) {
    if (this.connections[channel]) {
      this.connections[channel].close();
    }

    if (this.isReconnecting[channel]) {
      console.log(`Already reconnecting to ${channel}, skipping`);
      return null;
    }

    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8000/ws/${channel}`;

    try {
      const ws = new WebSocket(wsUrl, [], {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      ws.onopen = () => {
        console.log(`WebSocket connected to ${channel}`);
        this.reconnectAttempts[channel] = 0;
        this.isReconnecting[channel] = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error on ${channel}:`, error);
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected from ${channel}`);
        if (onClose) {
          onClose(event);
        }

        // Only attempt to reconnect if not a normal closure
        if (event.code !== 1000 && !this.isReconnecting[channel] && this.reconnectAttempts[channel] < this.maxReconnectAttempts) {
          this.attemptReconnect(channel, onMessage, onError, onClose);
        }
      };

      this.connections[channel] = ws;
      return ws;
    } catch (error) {
      console.error(`Failed to connect to WebSocket ${channel}:`, error);
      if (onError) {
        onError(error);
      }
      return null;
    }
  }

  attemptReconnect(channel, onMessage, onError, onClose) {
    if (this.isReconnecting[channel]) {
      return;
    }

    this.isReconnecting[channel] = true;
    this.reconnectAttempts[channel] = (this.reconnectAttempts[channel] || 0) + 1;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts[channel] - 1), 30000);

    console.log(`Attempting to reconnect to ${channel} in ${delay}ms (attempt ${this.reconnectAttempts[channel]}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.isReconnecting[channel] = false;
      this.connect(channel, onMessage, onError, onClose);
    }, delay);
  }

  disconnect(channel) {
    if (this.connections[channel]) {
      this.connections[channel].close(1000, 'Client disconnecting');
      delete this.connections[channel];
      this.isReconnecting[channel] = false;
    }
  }

  disconnectAll() {
    Object.keys(this.connections).forEach(channel => {
      this.disconnect(channel);
    });
  }

  send(channel, data) {
    if (this.connections[channel] && this.connections[channel].readyState === WebSocket.OPEN) {
      this.connections[channel].send(JSON.stringify(data));
    } else {
      console.warn(`WebSocket ${channel} is not connected`);
    }
  }

  isConnected(channel) {
    return this.connections[channel] && this.connections[channel].readyState === WebSocket.OPEN;
  }

  // Connect to admin dashboard with authentication
  connectAdminDashboard(onMessage, onError, onClose) {
    return this.connect('admin-dashboard', onMessage, onError, onClose);
  }

  // Disconnect from admin dashboard
  disconnectAdminDashboard() {
    this.disconnect('admin-dashboard');
  }
}

// Create and export singleton instance
const websocketService = new WebSocketService();
export default websocketService;