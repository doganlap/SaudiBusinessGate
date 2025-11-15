/**
 * WebSocket Client
 * Generic WebSocket client with auto-reconnect, message queuing, and event handling
 */

interface WebSocketClientOptions {
  serverUrl: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  messageQueue?: boolean;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp: number;
}

type EventHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isManuallyDisconnected = false;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      messageQueue: true,
      ...options
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isManuallyDisconnected = false;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.options.serverUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleError(error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.reconnectAttempts = 0;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnecting = false;
  }

  send(type: string, payload?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        if (this.options.messageQueue) {
          this.messageQueue.push({
            type,
            payload,
            timestamp: Date.now()
          });
          resolve();
        } else {
          reject(new Error('WebSocket not connected'));
        }
        return;
      }

      try {
        const message: WebSocketMessage = {
          type,
          payload,
          timestamp: Date.now()
        };

        this.ws.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connect');
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit('message', message);
        this.emit(message.type, message.payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error, event.data);
        this.emit('error', { error, rawData: event.data });
      }
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.emit('disconnect', { code: event.code, reason: event.reason });
      
      if (!this.isManuallyDisconnected && this.options.autoReconnect) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.handleError(event);
    };
  }

  private attemptReconnect(): void {
    if (this.isManuallyDisconnected || this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect();
      }
    }, this.options.reconnectInterval);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.type, message.payload).catch(console.error);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  // Utility methods for common operations
  async ping(): Promise<number> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeout);
        this.off('pong', handlePong);
      };

      const handlePong = () => {
        cleanup();
        resolve(Date.now() - startTime);
      };

      this.on('pong', handlePong);
      
      this.send('ping').catch(error => {
        cleanup();
        reject(error);
      });
    });
  }

  // Batch send multiple messages
  async sendBatch(messages: Array<{ type: string; payload?: any }>): Promise<void> {
    const results = await Promise.allSettled(
      messages.map(msg => this.send(msg.type, msg.payload))
    );

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(`Failed to send ${failures.length} messages`);
    }
  }

  // Subscribe to multiple events
  subscribe(events: string[], handler: EventHandler): () => void {
    const unsubscribers = events.map(event => this.on(event, handler));
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Get connection statistics
  getStats() {
    return {
      readyState: this.getReadyState(),
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      eventCount: this.eventHandlers.size,
      totalHandlers: Array.from(this.eventHandlers.values()).reduce((sum, handlers) => sum + handlers.size, 0)
    };
  }
}

// Create a singleton instance for global use
export const globalWebSocketClient = new WebSocketClient({
  serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 20
});

// Utility function to check if WebSocket is supported
export const isWebSocketSupported = (): boolean => {
  return typeof WebSocket !== 'undefined';
};

// Utility function to create a WebSocket client with default options
export const createWebSocketClient = (options: WebSocketClientOptions): WebSocketClient => {
  return new WebSocketClient(options);
};