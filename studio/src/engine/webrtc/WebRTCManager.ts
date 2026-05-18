/**
 * CyberHex Studio — WebRTC Peer Connection Manager
 * Singleton managing RTCPeerConnection lifecycle, multi-peer orchestration,
 * stream attachment, data channels, and stats collection.
 */
import type { RTCConfig, RTCPeer as RTCPeerType, RTCStream, RTCStats } from '@/types';
import { ConnectionState } from '@/types';

interface PeerEntry {
  id: string;
  pc: RTCPeerConnection;
  streams: RTCStream[];
  state: ConnectionState;
  dataChannel: RTCDataChannel | null;
}

type PeerEvent = 'connectionstatechange' | 'track' | 'datachannel' | 'stats' | 'error';
type PeerEventListener = (peerId: string, data: unknown) => void;

export class WebRTCManager {
  private static _instance: WebRTCManager | null = null;
  static getInstance(): WebRTCManager {
    if (!this._instance) this._instance = new WebRTCManager();
    return this._instance;
  }

  private peers = new Map<string, PeerEntry>();
  private config: RTCConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    maxBitrate: 2500000,
    codec: 'vp9',
    encryption: true,
    simulcast: false,
    scalableVideoCoding: false,
  };
  private listeners = new Map<PeerEvent, Set<PeerEventListener>>();

  async initialize(config: RTCConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log('[WebRTCManager] Initialized');
  }

  createPeer(id: string): RTCPeerType {
    if (this.peers.has(id)) {
      this.closePeer(id);
    }

    const pc = new RTCPeerConnection({
      iceServers: this.config.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    const dataChannel = pc.createDataChannel('cyberhex-data', {
      ordered: true,
      maxRetransmits: 3,
    });

    const entry: PeerEntry = {
      id,
      pc,
      streams: [],
      state: ConnectionState.NEW,
      dataChannel,
    };

    pc.onconnectionstatechange = () => {
      const stateMap: Record<string, ConnectionState> = {
        new: ConnectionState.NEW,
        connecting: ConnectionState.CONNECTING,
        connected: ConnectionState.CONNECTED,
        disconnected: ConnectionState.DISCONNECTED,
        failed: ConnectionState.FAILED,
        closed: ConnectionState.CLOSED,
      };
      entry.state = stateMap[pc.connectionState] ?? ConnectionState.DISCONNECTED;
      this._emit('connectionstatechange', id, entry.state);
    };

    pc.ontrack = (event) => {
      this._emit('track', id, event);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[WebRTCManager] ICE failed for peer ${id}, restarting...`);
        pc.restartIce();
      }
    };

    (dataChannel as RTCDataChannel).onmessage = (event) => {
      this._emit('datachannel', id, event.data);
    };

    this.peers.set(id, entry);
    return {
      id,
      connection: pc,
      state: entry.state,
      streams: [],
      stats: { bytesSent: 0, bytesReceived: 0, packetsLost: 0, roundTripTime: 0, jitter: 0, frameRate: 0, resolution: '' },
    };
  }

  addStream(peerId: string, stream: MediaStream): void {
    const entry = this.peers.get(peerId);
    if (!entry) return;

    stream.getTracks().forEach((track) => {
      entry.pc.addTrack(track, stream);
      entry.streams.push({
        id: track.id,
        kind: track.kind as 'video' | 'audio',
        track,
        quality: 'high',
        bitrate: this.config.maxBitrate,
      });
    });
  }

  removeStream(peerId: string, stream: MediaStream): void {
    const entry = this.peers.get(peerId);
    if (!entry) return;

    stream.getTracks().forEach((track) => {
      const sender = entry.pc.getSenders().find((s) => s.track === track);
      if (sender) entry.pc.removeTrack(sender);
    });
    entry.streams = entry.streams.filter((s) => !stream.getTracks().some((t) => t.id === s.id));
  }

  sendData(peerId: string, data: unknown): void {
    const entry = this.peers.get(peerId);
    if (!entry?.dataChannel || entry.dataChannel.readyState !== 'open') return;
    entry.dataChannel.send(JSON.stringify(data));
  }

  async getStats(peerId: string): Promise<RTCStats> {
    const entry = this.peers.get(peerId);
    if (!entry) return { bytesSent: 0, bytesReceived: 0, packetsLost: 0, roundTripTime: 0, jitter: 0, frameRate: 0, resolution: '' };

    try {
      const stats = await entry.pc.getStats();
      let bytesSent = 0, bytesReceived = 0, packetsLost = 0, rtt = 0, jitter = 0, frameRate = 0;

      stats.forEach((report) => {
        if (report.type === 'outbound-rtp' && report.kind === 'video') {
          bytesSent = report.bytesSent ?? 0;
          packetsLost = report.packetsLost ?? 0;
          frameRate = report.framesPerSecond ?? 0;
        }
        if (report.type === 'inbound-rtp') {
          bytesReceived = report.bytesReceived ?? 0;
          jitter = (report.jitter ?? 0) * 1000;
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime ?? 0;
        }
      });

      const result = {
        bytesSent,
        bytesReceived,
        packetsLost,
        roundTripTime: Math.round(rtt * 1000),
        jitter: Math.round(jitter),
        frameRate: Math.round(frameRate),
        resolution: '1920x1080',
      };

      this._emit('stats', peerId, result);
      return result;
    } catch {
      return { bytesSent: 0, bytesReceived: 0, packetsLost: 0, roundTripTime: 0, jitter: 0, frameRate: 0, resolution: '' };
    }
  }

  closePeer(peerId: string): void {
    const entry = this.peers.get(peerId);
    if (!entry) return;
    entry.dataChannel?.close();
    entry.pc.close();
    this.peers.delete(peerId);
  }

  on(event: PeerEvent, handler: PeerEventListener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  private _emit(event: PeerEvent, peerId: string, data: unknown): void {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(peerId, data); } catch (e) { console.error(`[WebRTCManager] ${event} handler error:`, e); }
    });
  }

  dispose(): void {
    this.peers.forEach((entry) => {
      entry.dataChannel?.close();
      entry.pc.close();
    });
    this.peers.clear();
    this.listeners.clear();
  }
}