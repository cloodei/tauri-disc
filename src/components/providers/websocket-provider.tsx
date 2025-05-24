import { useEffect } from 'react';
import { useWebSocketStore } from '@/lib/websocket';
import { useAuth } from '@/hooks/use-auth';

export function WebSocketProvider({ children }: React.PropsWithChildren) {
  const { isConnected, connect, disconnect } = useWebSocketStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      // const wsUrl = process.env.NODE_ENV === 'production'
      //   ? 'wss://your-production-ws-server.com'
      //   : 'ws://localhost:8080';
      
      connect('ws://localhost:9001');
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isAuthenticated, isConnected, connect, disconnect]);

  return <>{children}</>;
}
