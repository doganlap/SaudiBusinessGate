/**
 * WebSocket Client for Real-Time Analytics
 * Provides real-time data updates for enterprise dashboards
 */

import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('📡 WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('📡 WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('📡 WebSocket connection error:', error);
      this.isConnected = false;
      this.handleReconnection();
    });

    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.log(`📡 WebSocket reconnection attempt ${attempt}`);
      this.reconnectAttempts = attempt;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('📡 WebSocket reconnection failed after maximum attempts');
    });

    // Custom event listeners for real-time data
    this.socket.on('kpi-update', (data: any) => {
      this.emit('kpi-update', data);
    });

    this.socket.on('financial-update', (data: any) => {
      this.emit('financial-update', data);
    });

    this.socket.on('transaction-update', (data: any) => {
      this.emit('transaction-update', data);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.socket?.connect();
      }, this.reconnectDelay);
    }
  }

  public connect(): void {
    this.socket?.connect();
  }

  public disconnect(): void {
    this.socket?.disconnect();
  }

  public subscribe(channel: string, callback: (data: any) => void): void {
    this.socket?.on(channel, callback);
  }

  public unsubscribe(channel: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(channel, callback);
    } else {
      this.socket?.off(channel);
    }
  }

  public emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Create singleton instance
export const webSocketClient = new WebSocketClient();

export default webSocketClient;