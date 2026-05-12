
import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url: string, onMessage: (data: any) => void) => {
  const ws = useRef<WebSocket | null>(null);
  
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  const stableOnMessage = useCallback((data: any) => {
    onMessageRef.current(data);
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        stableOnMessage(data);
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error', err);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [url, stableOnMessage]);
};