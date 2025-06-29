/**
 * WebSocket Server for Real-time Notifications
 * Handles WebSocket connections and real-time communication
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // userId -> WebSocket
    this.heartbeatInterval = 30000; // 30 seconds
    this.connectionTimeout = 10000; // 10 seconds

    this.initialize();
  }

  /**
   * Initialize WebSocket server
   */
  initialize() {
    console.log('🔌 WebSocket server initialized');

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    console.log('🔗 New WebSocket connection attempt');

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!ws.userId) {
        console.log('⏰ Connection timeout - no authentication');
        ws.close(1008, 'Authentication timeout');
      }
    }, this.connectionTimeout);

    // Set up connection
    ws.isAlive = true;
    ws.userId = null;

    // Handle messages
    ws.on('message', (message) => {
      this.handleMessage(ws, message, connectionTimeout);
    });

    // Handle close
    ws.on('close', (code, reason) => {
      this.handleDisconnection(ws, code, reason);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.handleDisconnection(ws, 1011, 'Internal error');
    });

    // Handle pong
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      message: 'Connected to UniPool WebSocket server',
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(ws, message, connectionTimeout) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'authentication':
          this.authenticateClient(ws, data.token, connectionTimeout);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
          
        case 'subscribe':
          this.handleSubscription(ws, data);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(ws, data);
          break;
          
        default:
          console.log('❓ Unknown message type:', data.type);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Unknown message type',
            messageType: data.type
          }));
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format'
      }));
    }
  }

  /**
   * Authenticate WebSocket client
   */
  authenticateClient(ws, token, connectionTimeout) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Clear connection timeout
      clearTimeout(connectionTimeout);
      
      // Set user ID
      ws.userId = decoded.userId;
      
      // Register client
      this.clients.set(decoded.userId, ws);
      
      console.log(`✅ WebSocket client authenticated for user ${decoded.userId}`);
      
      // Send authentication success
      ws.send(JSON.stringify({
        type: 'authentication',
        status: 'success',
        userId: decoded.userId,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('❌ WebSocket authentication failed:', error);
      
      ws.send(JSON.stringify({
        type: 'authentication',
        status: 'failed',
        error: 'Invalid token',
        timestamp: new Date().toISOString()
      }));
      
      // Close connection after failed authentication
      setTimeout(() => {
        ws.close(1008, 'Authentication failed');
      }, 1000);
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(ws, code, reason) {
    if (ws.userId) {
      console.log(`🔌 WebSocket client disconnected for user ${ws.userId}`);
      this.clients.delete(ws.userId);
    } else {
      console.log('🔌 WebSocket client disconnected (unauthenticated)');
    }
  }

  /**
   * Handle subscription requests
   */
  handleSubscription(ws, data) {
    if (!ws.userId) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Authentication required for subscriptions'
      }));
      return;
    }

    // Handle different subscription types
    switch (data.channel) {
      case 'notifications':
        ws.subscribedToNotifications = true;
        break;
      case 'rides':
        ws.subscribedToRides = true;
        break;
      case 'bookings':
        ws.subscribedToBookings = true;
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Unknown subscription channel',
          channel: data.channel
        }));
        return;
    }

    ws.send(JSON.stringify({
      type: 'subscription',
      status: 'subscribed',
      channel: data.channel,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Handle unsubscription requests
   */
  handleUnsubscription(ws, data) {
    if (!ws.userId) {
      return;
    }

    switch (data.channel) {
      case 'notifications':
        ws.subscribedToNotifications = false;
        break;
      case 'rides':
        ws.subscribedToRides = false;
        break;
      case 'bookings':
        ws.subscribedToBookings = false;
        break;
    }

    ws.send(JSON.stringify({
      type: 'unsubscription',
      status: 'unsubscribed',
      channel: data.channel,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Send notification to specific user
   */
  sendNotification(userId, notification) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN && ws.subscribedToNotifications) {
      try {
        ws.send(JSON.stringify({
          type: 'notification',
          payload: notification,
          timestamp: new Date().toISOString()
        }));
        return true;
      } catch (error) {
        console.error('❌ Error sending notification:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Send ride update to specific user
   */
  sendRideUpdate(userId, rideUpdate) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN && ws.subscribedToRides) {
      try {
        ws.send(JSON.stringify({
          type: 'ride_update',
          payload: rideUpdate,
          timestamp: new Date().toISOString()
        }));
        return true;
      } catch (error) {
        console.error('❌ Error sending ride update:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Send booking update to specific user
   */
  sendBookingUpdate(userId, bookingUpdate) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN && ws.subscribedToBookings) {
      try {
        ws.send(JSON.stringify({
          type: 'booking_update',
          payload: bookingUpdate,
          timestamp: new Date().toISOString()
        }));
        return true;
      } catch (error) {
        console.error('❌ Error sending booking update:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message, filter = null) {
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (!filter || filter(userId, ws)) {
          try {
            ws.send(JSON.stringify({
              ...message,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('❌ Error broadcasting message:', error);
          }
        }
      }
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log('💀 Terminating dead connection');
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, this.heartbeatInterval);
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.wss.clients.size,
      authenticatedConnections: this.clients.size,
      serverTime: new Date().toISOString()
    };
  }

  /**
   * Close all connections
   */
  closeAll() {
    this.wss.clients.forEach((ws) => {
      ws.close(1000, 'Server shutdown');
    });
  }
}

module.exports = WebSocketServer; 