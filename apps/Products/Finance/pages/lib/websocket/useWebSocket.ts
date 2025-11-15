/**
 * React Hook for WebSocket Connections
 * Provides real-time data updates and connection management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { financialWebSocketService } from './financialWebSocket';

interface UseWebSocketOptions {
  channel?: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

interface UseWebSocketResult {
  isConnected: boolean;
  data: any;
  send: (type: string, payload?: any) => Promise<void>;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  unsubscribe: (channel: string, callback: (data: any) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  channel,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoConnect = true
}: UseWebSocketOptions = {}): UseWebSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const messageCallbacks = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  // Handle connection status changes
  useEffect(() => {
    const handleConnectionChange = (update: { status: string }) => {
      const connected = update.status === 'connected';
      setIsConnected(connected);
      
      if (connected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    };

    const unsubscribeConnection = financialWebSocketService.subscribe('connection', handleConnectionChange);

    return () => {
      unsubscribeConnection();
    };
  }, [onConnect, onDisconnect]);

  // Handle error events
  useEffect(() => {
    const handleError = (update: { error: Error }) => {
      onError?.(update.error);
    };

    const unsubscribeError = financialWebSocketService.subscribe('error', handleError);

    return () => {
      unsubscribeError();
    };
  }, [onError]);

  // Handle channel-specific messages
  useEffect(() => {
    if (!channel) return;

    const handleChannelMessage = (message: any) => {
      setData(message);
      onMessage?.(message);
    };

    const unsubscribe = financialWebSocketService.subscribe(channel, handleChannelMessage);

    return () => {
      unsubscribe();
    };
  }, [channel, onMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      financialWebSocketService.connect();
    }

    return () => {
      if (autoConnect) {
        financialWebSocketService.disconnect();
      }
    };
  }, [autoConnect]);

  // Send message function
  const send = useCallback(async (type: string, payload?: any) => {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      await financialWebSocketService.send(type, payload);
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      throw error;
    }
  }, [isConnected]);

  // Subscribe to additional channels
  const subscribe = useCallback((subscribeChannel: string, callback: (data: any) => void) => {
    if (!messageCallbacks.current.has(subscribeChannel)) {
      messageCallbacks.current.set(subscribeChannel, new Set());
    }

    messageCallbacks.current.get(subscribeChannel)!.add(callback);

    const unsubscribe = financialWebSocketService.subscribe(subscribeChannel, callback);

    return () => {
      unsubscribe();
      messageCallbacks.current.get(subscribeChannel)?.delete(callback);
    };
  }, []);

  // Unsubscribe from channel
  const unsubscribe = useCallback((unsubscribeChannel: string, callback: (data: any) => void) => {
    financialWebSocketService.unsubscribe(unsubscribeChannel, callback);
    messageCallbacks.current.get(unsubscribeChannel)?.delete(callback);
  }, []);

  // Manual connection management
  const connect = useCallback(() => {
    financialWebSocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    financialWebSocketService.disconnect();
  }, []);

  return {
    isConnected,
    data,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
}

// Hook for specific financial data types
export const useFinancialWebSocket = (channel: string) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleMessage = (message: any) => {
      setData(message);
    };

    const handleConnection = (update: { status: string }) => {
      setIsConnected(update.status === 'connected');
    };

    const unsubscribeMessage = financialWebSocketService.subscribe(channel, handleMessage);
    const unsubscribeConnection = financialWebSocketService.subscribe('connection', handleConnection);

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
    };
  }, [channel]);

  return { data, isConnected };
};

// Utility hook for common financial updates
export const useAccountUpdates = (accountId?: string) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    const handleUpdate = (update: any) => {
      setUpdates(prev => [...prev, update]);
    };

    const handleConnection = (update: { status: string }) => {
      setIsConnected(update.status === 'connected');
    };

    const channel = `account-${accountId}`;
    const unsubscribeUpdate = financialWebSocketService.subscribe(channel, handleUpdate);
    const unsubscribeConnection = financialWebSocketService.subscribe('connection', handleConnection);

    // Subscribe to the specific account
    financialWebSocketService.subscribeToAccount(accountId).catch(console.error);

    return () => {
      unsubscribeUpdate();
      unsubscribeConnection();
      financialWebSocketService.unsubscribeFromAccount(accountId).catch(console.error);
    };
  }, [accountId]);

  return { updates, isConnected };
};

// Hook for transaction updates
export const useTransactionUpdates = (filters?: any) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleUpdate = (update: any) => {
      setUpdates(prev => [...prev, update]);
    };

    const handleConnection = (update: { status: string }) => {
      setIsConnected(update.status === 'connected');
    };

    const unsubscribeUpdate = financialWebSocketService.subscribe('transaction-update', handleUpdate);
    const unsubscribeConnection = financialWebSocketService.subscribe('connection', handleConnection);

    // Subscribe to transactions with optional filters
    financialWebSocketService.subscribeToTransactions(filters).catch(console.error);

    return () => {
      unsubscribeUpdate();
      unsubscribeConnection();
    };
  }, [filters]);

  return { updates, isConnected };
};