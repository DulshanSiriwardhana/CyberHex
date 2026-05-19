/**
 * CyberHex Studio — WebSocket Communication Service
 * Handles signaling, model streaming, training updates, and real-time events.
 */
import { io, Socket } from 'socket.io-client';

/* ─── Types ────────────────────────────── */

export interface WSConfig {
  url: string;
  path?: string;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  auth?: Record<string, string>;
}

export type WSEvent =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting'
  | 'frame:processed'
  | 'filter:changed'
  | 'scene:switched'
  | 'model:loaded'
  | 'model:unloaded'
  | 'model:error'
  | 'audio:processed'
  | 'perf:update'
  | 'training:epoch'
  | 'training:complete'
  | 'training:error'
  | 'fluency:result'
  | 'signal:offer'
  | 'signal:answer'
  | 'signal:ice-candidate'
  | 'signal:bye'
  | 'inference:request'
  | 'inference:result'
  | 'stream:start'
  | 'stream:stop';

export interface WSMessage {
  event: WSEvent;
  payload: unknown;
  timestamp: number;
  id: string;
}

type EventHandler = (payload: unknown) => void;

/* ─── WebSocketService ──────────────────── */

export class WebSocketService {
  private static _instance: WebSocketService | null = null;

  static getInstance(): WebSocketService {
    if (!WebSocketService._instance) {
      WebSocketService._instance = new WebSocketService();
    }
    return WebSocketService._instance;
  }

  private socket: Socket | null = null;
  private config: WSConfig | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectCount = 0;

  private constructor() {}

  /* ── Connection ── */

  connect(config: WSConfig): void {
    this.config = {
      path: '/ws',
      autoReconnect: true,
      reconnectAttempts: 10,
      reconnectDelay: 2000,
      ...config,
    };

    this._connect();
  }

  private _connect(): void {
    if (!this.config) return;
    if (this.socket?.connected) return;

    this.socket = io(this.config.url, {
      path: this.config.path,
      auth: this.config.auth,
      reconnection: false, // Handled manually
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectCount = 0;
      this._emitToHandlers('connected', { timestamp: Date.now() });
      console.log('[WebSocketService] Connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      this.connected = false;
      this._emitToHandlers('disconnected', { reason, timestamp: Date.now() });

      if (this.config?.autoReconnect && reason !== 'io client disconnect') {
        this._scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (err: Error) => {
      console.warn('[WebSocketService] Connection error:', err.message);
      if (this.reconnectCount === 0) {
        this._emitToHandlers('error', { message: err.message });
      }
    });

    /* ── Application events ── */
    const appEvents: WSEvent[] = [
      'frame:processed', 'filter:changed', 'scene:switched',
      'model:loaded', 'model:unloaded', 'model:error',
      'audio:processed', 'perf:update',
      'training:epoch', 'training:complete', 'training:error',
      'fluency:result',
      'signal:offer', 'signal:answer', 'signal:ice-candidate', 'signal:bye',
      'inference:result', 'stream:start', 'stream:stop',
    ];

    appEvents.forEach((event) => {
      this.socket?.on(event, (payload: unknown) => {
        this._emitToHandlers(event, payload);
      });
    });
  }

  private _scheduleReconnect(): void {
    if (this.reconnectCount >= (this.config?.reconnectAttempts ?? 10)) {
      console.warn('[WebSocketService] Max reconnect attempts reached');
      return;
    }

    this.reconnectCount++;
    const delay = (this.config?.reconnectDelay ?? 2000) * Math.min(this.reconnectCount, 5);

    this._emitToHandlers('reconnecting', {
      attempt: this.reconnectCount,
      maxAttempts: this.config?.reconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this._connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.config = null;
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
    this.reconnectCount = 0;
  }

  /* ── Event Handling ── */

  on(event: WSEvent, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: WSEvent, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  private _emitToHandlers(event: string, payload: unknown): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[WebSocketService] Handler error for ${event}:`, err);
      }
    });
  }

  /* ── Send ── */

  send(event: WSEvent, payload: unknown): void {
    if (!this.socket?.connected) {
      console.warn(`[WebSocketService] Cannot send "${event}" — not connected`);
      return;
    }

    this.socket.emit(event, {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      event,
      payload,
      timestamp: Date.now(),
    });
  }

  /* ── Stream-specific ── */

  sendInferenceRequest(modelId: string, input: ArrayBuffer, shape: number[]): void {
    this.send('inference:request', {
      modelId,
      input,
      shape,
    });
  }

  sendSignalOffer(to: string, offer: RTCSessionDescriptionInit): void {
    this.send('signal:offer', { to, sdp: offer });
  }

  sendSignalAnswer(to: string, answer: RTCSessionDescriptionInit): void {
    this.send('signal:answer', { to, sdp: answer });
  }

  sendSignalIceCandidate(to: string, candidate: RTCIceCandidateInit): void {
    this.send('signal:ice-candidate', { to, candidate });
  }

  sendTrainingEpoch(sessionId: string, data: unknown): void {
    this.send('training:epoch', { sessionId, data });
  }

  /* ── State ── */

  get isConnected(): boolean {
    return this.connected;
  }

  get latency(): number {
    // Socket.io doesn't expose ping directly; use 0
    return 0;
  }
}