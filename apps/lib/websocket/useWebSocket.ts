/**
 * React Hook for WebSocket Integration
 * Provides real-time data subscription capabilities
 */

import { useEffect, useState, useCallback } from 'react';
import { webSocketClient } from './client';

interface UseWebSocketOptions {
  channel?: string;
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { channel, onMessage, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(webSocketClient.getConnectionStatus());
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleMessage = useCallback((messageData: any) => {
    setData(messageData);
    onMessage?.(messageData);
  }, [onMessage]);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      webSocketClient.connect();
    }

    // Listen for connection status changes
    const handleConnect = () => handleConnectionChange(true);
    const handleDisconnect = () => handleConnectionChange(false);

    webSocketClient.subscribe('connect', handleConnect);
    webSocketClient.subscribe('disconnect', handleDisconnect);

    // Subscribe to specific channel if provided
    if (channel) {
      webSocketClient.subscribe(channel, handleMessage);
    }

    return () => {
      webSocketClient.unsubscribe('connect', handleConnect);
      webSocketClient.unsubscribe('disconnect', handleDisconnect);
      
      if (channel) {
        webSocketClient.unsubscribe(channel, handleMessage);
      }

      if (autoConnect) {
        webSocketClient.disconnect();
      }
    };
  }, [channel, handleMessage, handleConnectionChange, autoConnect]);

  const send = useCallback((event: string, data?: any) => {
    try {
      webSocketClient.emit(event, data);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const subscribe = useCallback((newChannel: string, callback: (data: any) => void) => {
    webSocketClient.subscribe(newChannel, callback);
  }, []);

  const unsubscribe = useCallback((newChannel: string, callback?: (data: any) => void) => {
    webSocketClient.unsubscribe(newChannel, callback);
  }, []);

  return {
    isConnected,
    data,
    error,
    send,
    subscribe,
    unsubscribe,
    connectionStatus: webSocketClient.getConnectionStatus(),
    reconnectAttempts: webSocketClient.getReconnectAttempts(),
  };
};

export default useWebSocket;