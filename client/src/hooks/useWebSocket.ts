import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
}

export const useWebSocket = (
    url: string,
    onMessage: (data: any) => void,
    options: WebSocketOptions = {}
) => {
    const {
        maxRetries = 5,
        initialDelay = 1000,
        maxDelay = 30000
    } = options;

    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onMessageRef = useRef(onMessage);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const getBackoffDelay = useCallback(() => {
        const delay = Math.min(
            initialDelay * Math.pow(2, reconnectAttempts.current),
            maxDelay
        );
        return delay + Math.random() * 1000;
    }, [initialDelay, maxDelay]);

    const connect = useCallback(() => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = url.startsWith('ws') ? url : `${protocol}//${window.location.host}${url}`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessageRef.current(data);
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                    setError('Failed to parse message');
                }
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);

                if (reconnectAttempts.current < maxRetries) {
                    const delay = getBackoffDelay();
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxRetries})`);
                    reconnectAttempts.current += 1;

                    reconnectTimeout.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else {
                    setError('Max reconnection attempts reached');
                    console.error('Max WebSocket reconnection attempts reached');
                }
            };

            ws.current.onerror = (err) => {
                console.error('WebSocket error:', err);
                setError('WebSocket connection error');
            };
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to create WebSocket connection');
        }
    }, [url, maxRetries, getBackoffDelay]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    const send = useCallback((data: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                ws.current.send(JSON.stringify(data));
            } catch (err) {
                console.error('Failed to send WebSocket message:', err);
                setError('Failed to send message');
            }
        } else {
            setError('WebSocket not connected');
        }
    }, []);

    const reconnect = useCallback(() => {
        reconnectAttempts.current = 0;
        setError(null);
        if (ws.current) {
            ws.current.close();
        }
        connect();
    }, [connect]);

    return {
        isConnected,
        error,
        send,
        reconnect,
        ws: ws.current
    };
};
