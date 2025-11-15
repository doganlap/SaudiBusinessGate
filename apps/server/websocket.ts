import { Server } from 'socket.io';
import { createServer } from 'http';
import { query } from '../lib/db/connection';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active connections by tenant
const tenantConnections = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  const { tenantId, workflowId, userId } = socket.handshake.query as {
    tenantId?: string;
    workflowId?: string;
    userId?: string;
  };
  
  // Join tenant room
  if (tenantId) {
    socket.join(`tenant:${tenantId}`);
    
    // Track connection
    if (!tenantConnections.has(tenantId)) {
      tenantConnections.set(tenantId, new Set());
    }
    tenantConnections.get(tenantId)!.add(socket.id);
    
    console.log(`📡 Client joined tenant room: tenant:${tenantId}`);
  }
  
  // Join workflow room
  if (workflowId) {
    socket.join(`workflow:${workflowId}`);
    console.log(`📊 Client joined workflow room: workflow:${workflowId}`);
  }
  
  // Join user room
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`👤 Client joined user room: user:${userId}`);
  }
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    
    // Remove from tenant connections
    if (tenantId && tenantConnections.has(tenantId)) {
      tenantConnections.get(tenantId)!.delete(socket.id);
      if (tenantConnections.get(tenantId)!.size === 0) {
        tenantConnections.delete(tenantId);
      }
    }
  });
  
  // Handle custom events
  socket.on('workflow:subscribe', (data: { workflowId: string }) => {
    socket.join(`workflow:${data.workflowId}`);
    console.log(`📊 Subscribed to workflow: ${data.workflowId}`);
  });
  
  socket.on('workflow:unsubscribe', (data: { workflowId: string }) => {
    socket.leave(`workflow:${data.workflowId}`);
    console.log(`📊 Unsubscribed from workflow: ${data.workflowId}`);
  });
});

// Export functions to emit events
export function emitWorkflowUpdate(tenantId: string, workflow: any) {
  io.to(`tenant:${tenantId}`).emit('workflow:update', workflow);
  console.log(`📤 Emitted workflow:update to tenant:${tenantId}`);
}

export function emitStepUpdate(
  tenantId: string,
  workflowId: string,
  step: any
) {
  io.to(`tenant:${tenantId}`).emit('workflow:step:update', {
    workflowId,
    step
  });
  console.log(`📤 Emitted step update for workflow:${workflowId}`);
}

export function emitWorkflowCreated(tenantId: string, workflow: any) {
  io.to(`tenant:${tenantId}`).emit('workflow:created', workflow);
  console.log(`📤 Emitted workflow:created to tenant:${tenantId}`);
}

export function emitNotification(userId: string, notification: any) {
  io.to(`user:${userId}`).emit('notification', notification);
  console.log(`📤 Emitted notification to user:${userId}`);
}

export function getActiveConnections(tenantId: string): number {
  return tenantConnections.get(tenantId)?.size || 0;
}

export function broadcastToTenant(tenantId: string, event: string, data: any) {
  io.to(`tenant:${tenantId}`).emit(event, data);
  console.log(`📤 Broadcast ${event} to tenant:${tenantId}`);
}

// Start server
const PORT = process.env.WS_PORT || 3051;

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 CORS origin: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing WebSocket server...');
  io.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, closing WebSocket server...');
  io.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

export default io;
