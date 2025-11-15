/**
 * Financial WebSocket Service
 * Handles real-time financial data updates and analytics
 */

import { WebSocketClient } from '@/lib/websocket/client';

interface FinancialUpdate {
  type: 'transaction' | 'account' | 'metric' | 'kpi';
  data: any;
  timestamp: Date;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'refresh';
}

interface KPIUpdate {
  id: string;
  value: number;
  previousValue: number;
  change: number;
  timestamp: Date;
  metadata?: any;
}

class FinancialWebSocketService {
  private client: WebSocketClient;
  private isConnected: boolean = false;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.client = new WebSocketClient({
      serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
      autoReconnect: true,
      reconnectInterval: 5000,
    });

    this.initialize();
  }

  private initialize() {
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Financial WebSocket connected');
      this.notifySubscribers('connection', { status: 'connected' });
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
      console.log('Financial WebSocket disconnected');
      this.notifySubscribers('connection', { status: 'disconnected' });
    });

    this.client.on('error', (error) => {
      console.error('Financial WebSocket error:', error);
      this.notifySubscribers('error', { error });
    });

    // Listen for financial updates
    this.client.on('financial-update', this.handleFinancialUpdate.bind(this));
    this.client.on('kpi-update', this.handleKPIUpdate.bind(this));
    this.client.on('transaction-update', this.handleTransactionUpdate.bind(this));
    this.client.on('account-update', this.handleAccountUpdate.bind(this));
  }

  // Subscribe to specific financial events
  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    this.subscribers.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, callback);
    };
  }

  unsubscribe(channel: string, callback: (data: any) => void): void {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(callback);
      if (channelSubscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  private handleFinancialUpdate(update: FinancialUpdate): void {
    console.log('Financial update received:', update);
    this.notifySubscribers('financial-update', update);
    
    // Also notify specific type channels
    this.notifySubscribers(`${update.type}-update`, update);
  }

  private handleKPIUpdate(update: KPIUpdate): void {
    console.log('KPI update received:', update);
    this.notifySubscribers('kpi-update', update);
    this.notifySubscribers(`kpi-${update.id}`, update);
  }

  private handleTransactionUpdate(update: any): void {
    console.log('Transaction update received:', update);
    this.notifySubscribers('transaction-update', update);
    this.notifySubscribers(`transaction-${update.entityId}`, update);
  }

  private handleAccountUpdate(update: any): void {
    console.log('Account update received:', update);
    this.notifySubscribers('account-update', update);
    this.notifySubscribers(`account-${update.entityId}`, update);
  }

  // Send financial commands
  async refreshMetrics(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    await this.client.send('refresh-metrics', {});
  }

  async subscribeToAccount(accountId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    await this.client.send('subscribe-account', { accountId });
  }

  async unsubscribeFromAccount(accountId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    await this.client.send('unsubscribe-account', { accountId });
  }

  async subscribeToTransactions(filters?: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    await this.client.send('subscribe-transactions', { filters });
  }

  // Get current connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Connect and disconnect methods
  connect(): void {
    this.client.connect();
  }

  disconnect(): void {
    this.client.disconnect();
  }
}

// Singleton instance
export const financialWebSocketService = new FinancialWebSocketService();

// React hook for using financial WebSocket
export const useFinancialWebSocket = (channel: string, callback: (data: any) => void) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = financialWebSocketService.subscribe(channel, (update) => {
      callback(update);
      setData(update);
    });

    return unsubscribe;
  }, [channel, callback]);

  return data;
};

// Utility functions for common financial updates
export const financialWebSocketUtils = {
  // Format currency values for display
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  // Calculate percentage change
  calculateChange: (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Generate mock data for testing
  generateMockUpdate: (type: FinancialUpdate['type'], action: FinancialUpdate['action']): FinancialUpdate => ({
    type,
    action,
    entityId: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    data: {
      amount: Math.random() * 10000,
      description: `${action} ${type}`,
      status: action === 'create' ? 'pending' : 'completed',
    },
  }),

  // Simulate real-time updates for demo purposes
  startDemoMode: (interval: number = 3000): () => void => {
    const types: FinancialUpdate['type'][] = ['transaction', 'account', 'metric', 'kpi'];
    const actions: FinancialUpdate['action'][] = ['create', 'update', 'delete', 'refresh'];

    const intervalId = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const update = financialWebSocketUtils.generateMockUpdate(randomType, randomAction);
      financialWebSocketService['handleFinancialUpdate'](update);
    }, interval);

    return () => clearInterval(intervalId);
  },
};