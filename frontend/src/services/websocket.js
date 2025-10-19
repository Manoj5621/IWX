class WebSocketService {
  constructor() {
    this.connections = {};
    this.reconnectAttempts = {};
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(channel, onMessage, onError, onClose) {
    if (this.connections[channel]) {
      this.connections[channel].close();
    }

    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8000/ws/${channel}${token ? `?token=${token}` : ''}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected to ${channel}`);
        this.reconnectAttempts[channel] = 0;
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

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts[channel] < this.maxReconnectAttempts) {
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
    this.reconnectAttempts[channel] = (this.reconnectAttempts[channel] || 0) + 1;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts[channel] - 1);

    console.log(`Attempting to reconnect to ${channel} in ${delay}ms (attempt ${this.reconnectAttempts[channel]}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(channel, onMessage, onError, onClose);
    }, delay);
  }

  disconnect(channel) {
    if (this.connections[channel]) {
      this.connections[channel].close(1000, 'Client disconnecting');
      delete this.connections[channel];
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
}

// Create and export singleton instance
const websocketService = new WebSocketService();
export default websocketService;