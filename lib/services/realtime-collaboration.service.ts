/**
 * Real-Time Collaboration Service
 * Multi-user editing, presence indicators, live updates
 * 
 * Features:
 * - Presence tracking
 * - Real-time editing
 * - Live cursors
 * - Collaborative comments
 */

import { Server as SocketIOServer } from 'socket.io';

export interface Presence {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  location: {
    path: string;
    module?: string;
    resourceId?: string;
  };
  lastSeen: Date;
}

export interface CollaborationEvent {
  type: 'presence' | 'edit' | 'cursor' | 'comment' | 'selection';
  userId: string;
  resourceId: string;
  module: string;
  data: any;
  timestamp: Date;
}

export class RealtimeCollaborationService {
  private io: SocketIOServer | null = null;
  private presences: Map<string, Presence> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Initialize with Socket.IO server
   */
  initialize(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`✅ Collaboration: Client connected: ${socket.id}`);

      // Handle presence update
      socket.on('presence:update', (data: Presence) => {
        this.updatePresence(data.userId, data);
        
        // Notify room about presence change
        const room = this.getRoomForResource(data.location.module, data.location.resourceId);
        socket.join(room);
        socket.to(room).emit('presence:changed', data);
      });

      // Handle user typing/editing
      socket.on('edit:start', (data: { userId: string; resourceId: string; module: string }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        socket.to(room).emit('edit:started', {
          ...data,
          timestamp: new Date(),
        });
      });

      socket.on('edit:update', (data: {
        userId: string;
        resourceId: string;
        module: string;
        changes: any;
      }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        socket.to(room).emit('edit:updated', {
          ...data,
          timestamp: new Date(),
        });
      });

      socket.on('edit:end', (data: { userId: string; resourceId: string; module: string }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        socket.to(room).emit('edit:ended', {
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle cursor position
      socket.on('cursor:update', (data: {
        userId: string;
        resourceId: string;
        module: string;
        position: { x: number; y: number; line?: number; column?: number };
      }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        socket.to(room).emit('cursor:moved', {
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle selection
      socket.on('selection:update', (data: {
        userId: string;
        resourceId: string;
        module: string;
        selection: any;
      }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        socket.to(room).emit('selection:changed', {
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle comments
      socket.on('comment:add', (data: {
        userId: string;
        resourceId: string;
        module: string;
        comment: {
          id: string;
          text: string;
          position?: any;
        };
      }) => {
        const room = this.getRoomForResource(data.module, data.resourceId);
        this.io!.to(room).emit('comment:added', {
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket.id);
      });

      // Request current presences
      socket.on('presence:request', (data: { module?: string; resourceId?: string }) => {
        const presences = this.getPresencesForResource(data.module, data.resourceId);
        socket.emit('presence:list', presences);
      });
    });
  }

  /**
   * Update user presence
   */
  updatePresence(userId: string, presence: Presence) {
    this.presences.set(userId, presence);

    // Track connection
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set());
    }
  }

  /**
   * Get presences for a resource
   */
  getPresencesForResource(module?: string, resourceId?: string): Presence[] {
    const presences: Presence[] = [];

    for (const presence of this.presences.values()) {
      if (module && presence.location.module !== module) continue;
      if (resourceId && presence.location.resourceId !== resourceId) continue;
      
      // Filter out offline users older than 5 minutes
      if (presence.status === 'offline') {
        const lastSeen = new Date(presence.lastSeen);
        const now = new Date();
        if (now.getTime() - lastSeen.getTime() > 5 * 60 * 1000) {
          continue;
        }
      }

      presences.push(presence);
    }

    return presences;
  }

  /**
   * Broadcast collaboration event
   */
  broadcastEvent(event: CollaborationEvent, excludeUserId?: string) {
    if (!this.io) return;

    const room = this.getRoomForResource(event.module, event.resourceId);
    
    if (excludeUserId) {
      this.io.to(room).except(this.getSocketIdsForUser(excludeUserId)).emit('collaboration:event', event);
    } else {
      this.io.to(room).emit('collaboration:event', event);
    }
  }

  /**
   * Get room name for resource
   */
  private getRoomForResource(module?: string, resourceId?: string): string {
    if (module && resourceId) {
      return `collab:${module}:${resourceId}`;
    } else if (module) {
      return `collab:${module}`;
    }
    return 'collab:global';
  }

  /**
   * Get socket IDs for user
   */
  private getSocketIdsForUser(userId: string): string[] {
    // This would need to track socket IDs per user
    // Implementation depends on how socket.io is configured
    return [];
  }

  /**
   * Handle user disconnection
   */
  private handleDisconnection(socketId: string) {
    // Find user for this socket and update presence
    for (const [userId, sockets] of this.activeConnections.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        
        if (sockets.size === 0) {
          // No more connections for this user
          const presence = this.presences.get(userId);
          if (presence) {
            presence.status = 'offline';
            presence.lastSeen = new Date();
            
            // Broadcast presence change
            const room = this.getRoomForResource(presence.location.module, presence.location.resourceId);
            if (this.io) {
              this.io.to(room).emit('presence:changed', presence);
            }
          }
        }
      }
    }
  }

  /**
   * Get presence statistics
   */
  getStats() {
    const stats = {
      totalUsers: this.presences.size,
      online: 0,
      away: 0,
      busy: 0,
      offline: 0,
      byModule: {} as Record<string, number>,
    };

    for (const presence of this.presences.values()) {
      stats[presence.status]++;
      
      const module = presence.location.module || 'unknown';
      stats.byModule[module] = (stats.byModule[module] || 0) + 1;
    }

    return stats;
  }
}

// Export singleton instance
export const realtimeCollaboration = new RealtimeCollaborationService();

