import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1';

export const useWebSocket = (onNotification) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  const connect = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws/notifications?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        ws.pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'notification') {
            onNotification?.(message.data);
          } else if (message.type === 'pong') {
            // Keep-alive response
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Clear ping interval
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }

        // Attempt to reconnect with exponential backoff
        if (isAuthenticated && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;

          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      if (wsRef.current.pingInterval) {
        clearInterval(wsRef.current.pingInterval);
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  };

  return {
    isConnected
  };
};
