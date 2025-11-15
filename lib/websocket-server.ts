/**
 * WebSocket Server for Real-time Features
 * Saudi Store Platform
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'url';

interface SocketData {
  userId?: string;
  tenantId?: string;
  role?: string;
}

interface RedFlagEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  data: any;
  timestamp: string;
}

interface WorkflowEvent {
  id: string;
  workflowId: string;
  stepName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  timestamp: string;
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  tenantId: string;
  timestamp: string;
}

class WebSocketServer {
  private io: SocketIOServer;
  private server: any;
  private port: number;

  constructor(port: number = 3051) {
    this.port = port;
    this.server = createServer();
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: ["http://localhost:3050", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: SocketData) => {
        socket.data = data;
        
        // Join tenant room
        if (data.tenantId) {
          socket.join(`tenant:${data.tenantId}`);
          console.log(`👤 User ${data.userId} joined tenant room: ${data.tenantId}`);
        }

        // Join user room
        if (data.userId) {
          socket.join(`user:${data.userId}`);
          console.log(`🔐 User authenticated: ${data.userId} (${data.role})`);
        }

        // Send welcome message
        socket.emit('authenticated', {
          success: true,
          message: 'Successfully authenticated',
          timestamp: new Date().toISOString()
        });
      });

      // Handle red flag events
      socket.on('red-flag:detected', (event: RedFlagEvent) => {
        console.log(`🚩 Red Flag Detected: ${event.type} (${event.severity})`);
        
        // Broadcast to tenant
        if (socket.data?.tenantId) {
          this.io.to(`tenant:${socket.data.tenantId}`).emit('red-flag:new', event);
        }
      });

      // Handle workflow events
      socket.on('workflow:update', (event: WorkflowEvent) => {
        console.log(`⚡ Workflow Update: ${event.workflowId} - ${event.status}`);
        
        // Broadcast to tenant
        if (socket.data?.tenantId) {
          this.io.to(`tenant:${socket.data.tenantId}`).emit('workflow:updated', event);
        }

        // Notify assigned user
        if (event.assignedTo) {
          this.io.to(`user:${event.assignedTo}`).emit('workflow:assigned', event);
        }
      });

      // Handle notifications
      socket.on('notification:send', (notification: NotificationEvent) => {
        console.log(`📢 Notification: ${notification.title}`);
        
        if (notification.userId) {
          // Send to specific user
          this.io.to(`user:${notification.userId}`).emit('notification:new', notification);
        } else {
          // Broadcast to tenant
          this.io.to(`tenant:${notification.tenantId}`).emit('notification:new', notification);
        }
      });

      // Handle AI agent events
      socket.on('ai-agent:status', (data: { agentId: string; status: string; message?: string }) => {
        console.log(`🤖 AI Agent ${data.agentId}: ${data.status}`);
        
        if (socket.data?.tenantId) {
          this.io.to(`tenant:${socket.data.tenantId}`).emit('ai-agent:updated', {
            ...data,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle license events
      socket.on('license:update', (data: { licenseId: string; status: string; message?: string }) => {
        console.log(`📜 License ${data.licenseId}: ${data.status}`);
        
        if (socket.data?.tenantId) {
          this.io.to(`tenant:${socket.data.tenantId}`).emit('license:updated', {
            ...data,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle system events
      socket.on('system:health', () => {
        socket.emit('system:status', {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`🔥 Socket Error: ${socket.id}`, error);
      });
    });
  }

  // Public methods for broadcasting events
  public broadcastRedFlag(tenantId: string, event: RedFlagEvent) {
    this.io.to(`tenant:${tenantId}`).emit('red-flag:new', event);
  }

  public broadcastWorkflowUpdate(tenantId: string, event: WorkflowEvent) {
    this.io.to(`tenant:${tenantId}`).emit('workflow:updated', event);
  }

  public sendNotification(notification: NotificationEvent) {
    if (notification.userId) {
      this.io.to(`user:${notification.userId}`).emit('notification:new', notification);
    } else {
      this.io.to(`tenant:${notification.tenantId}`).emit('notification:new', notification);
    }
  }

  public broadcastAIAgentStatus(tenantId: string, agentId: string, status: string, message?: string) {
    this.io.to(`tenant:${tenantId}`).emit('ai-agent:updated', {
      agentId,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastLicenseUpdate(tenantId: string, licenseId: string, status: string, message?: string) {
    this.io.to(`tenant:${tenantId}`).emit('license:updated', {
      licenseId,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  }

  public getConnectedClients(): number {
    return this.io.engine.clientsCount;
  }

  public getClientsByTenant(tenantId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
    return room ? room.size : 0;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (err?: Error) => {
        if (err) {
          console.error(`❌ Failed to start WebSocket server:`, err);
          reject(err);
        } else {
          console.log(`🚀 WebSocket Server running on port ${this.port}`);
          console.log(`📡 Socket.IO ready for connections`);
          resolve();
        }
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.server.close(() => {
          console.log(`🛑 WebSocket Server stopped`);
          resolve();
        });
      });
    });
  }
}

// Create and export singleton instance
const wsServer = new WebSocketServer(parseInt(process.env.WS_PORT || '3051'));

export default wsServer;

// Auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  wsServer.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    await wsServer.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🔄 Received SIGINT, shutting down gracefully...');
    await wsServer.stop();
    process.exit(0);
  });

  // Demo events for testing
  setTimeout(() => {
    // Simulate red flag detection
    wsServer.broadcastRedFlag('demo-tenant', {
      id: 'rf-demo-1',
      type: 'large_transaction',
      severity: 'high',
      message: 'Large transaction detected: 150,000 SAR',
      data: { amount: 150000, currency: 'SAR' },
      timestamp: new Date().toISOString()
    });

    // Simulate workflow update
    wsServer.broadcastWorkflowUpdate('demo-tenant', {
      id: 'wf-demo-1',
      workflowId: 'workflow-123',
      stepName: 'Compliance Review',
      status: 'completed',
      assignedTo: 'user-1',
      timestamp: new Date().toISOString()
    });

    // Simulate notification
    wsServer.sendNotification({
      id: 'notif-demo-1',
      type: 'info',
      title: 'System Update',
      message: 'New features have been deployed successfully',
      tenantId: 'demo-tenant',
      timestamp: new Date().toISOString()
    });

    console.log('📡 Demo events broadcasted');
  }, 5000);
}
