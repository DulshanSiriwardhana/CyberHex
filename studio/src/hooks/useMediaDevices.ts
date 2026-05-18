/**
 * CyberHex Studio — Media Device Hooks
 * Access webcam, screen sharing, microphone, and system audio.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { FeedId } from '@/types';

/* ─── Types ────────────────────────────── */

interface DeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
  kind: MediaDeviceKind;
}

interface UseWebcamOptions {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
}

interface UseWebcamResult {
  stream: MediaStream | null;
  devices: DeviceInfo[];
  activeDeviceId: string | null;
  error: string | null;
  loading: boolean;
  start: (deviceId?: string) => Promise<MediaStream>;
  stop: () => void;
  switchDevice: (deviceId: string) => Promise<MediaStream>;
  refreshDevices: () => Promise<void>;
}

interface UseScreenShareResult {
  stream: MediaStream | null;
  error: string | null;
  loading: boolean;
  start: () => Promise<MediaStream>;
  stop: () => void;
  isSharing: boolean;
}

interface UseMicrophoneOptions {
  deviceId?: string;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

interface UseMicrophoneResult {
  stream: MediaStream | null;
  devices: DeviceInfo[];
  activeDeviceId: string | null;
  error: string | null;
  loading: boolean;
  muted: boolean;
  start: (deviceId?: string) => Promise<MediaStream>;
  stop: () => void;
  toggleMute: () => void;
  switchDevice: (deviceId: string) => Promise<MediaStream>;
}

/* ─── useWebcam ──────────────────────────── */

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamResult {
  const {
    deviceId,
    width = 1920,
    height = 1080,
    frameRate = 30,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(deviceId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
          groupId: d.groupId,
          kind: d.kind,
        }));
      setDevices(videoDevices);
    } catch {
      // Silently fail - devices will be empty
    }
  }, []);

  const start = useCallback(async (targetDeviceId?: string): Promise<MediaStream> => {
    setLoading(true);
    setError(null);

    try {
      const constraints: MediaTrackConstraints = {
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: frameRate },
      };

      if (targetDeviceId || activeDeviceId) {
        constraints.deviceId = { exact: targetDeviceId ?? activeDeviceId! };
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        setActiveDeviceId(track.getSettings().deviceId ?? null);
      }

      await refreshDevices();
      return mediaStream;
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to access webcam';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [width, height, frameRate, activeDeviceId, refreshDevices]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const switchDevice = useCallback(async (newDeviceId: string): Promise<MediaStream> => {
    stop();
    return start(newDeviceId);
  }, [stop, start]);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices);
      stop();
    };
  }, [refreshDevices, stop]);

  return {
    stream,
    devices,
    activeDeviceId,
    error,
    loading,
    start,
    stop,
    switchDevice,
    refreshDevices,
  };
}

/* ─── useScreenShare ─────────────────────── */

export function useScreenShare(): UseScreenShareResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async (): Promise<MediaStream> => {
    setLoading(true);
    setError(null);

    try {
      const mediaStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
          cursor: 'always',
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStream.getVideoTracks()[0].onended = () => {
        streamRef.current = null;
        setStream(null);
      };

      streamRef.current = mediaStream;
      setStream(mediaStream);
      return mediaStream;
    } catch (err: any) {
      const msg = err?.message ?? 'Screen share cancelled or failed';
      if (!err?.message?.includes('cancelled')) {
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    stream,
    error,
    loading,
    start,
    stop,
    isSharing: stream !== null,
  };
}

/* ─── useMicrophone ──────────────────────── */

export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneResult {
  const {
    echoCancellation = true,
    noiseSuppression = true,
    autoGainControl = true,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = allDevices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
          groupId: d.groupId,
          kind: d.kind,
        }));
      setDevices(audioDevices);
    } catch { /* fail silently */ }
  }, []);

  const start = useCallback(async (targetDeviceId?: string): Promise<MediaStream> => {
    setLoading(true);
    setError(null);

    try {
      const constraints: MediaTrackConstraints = {
        echoCancellation,
        noiseSuppression,
        autoGainControl,
        sampleRate: { ideal: 48000 },
        channelCount: { ideal: 1 },
      };

      if (targetDeviceId) {
        constraints.deviceId = { exact: targetDeviceId };
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: constraints,
        video: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      const track = mediaStream.getAudioTracks()[0];
      if (track) {
        setActiveDeviceId(track.getSettings().deviceId ?? null);
      }

      await refreshDevices();
      return mediaStream;
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to access microphone';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [echoCancellation, noiseSuppression, autoGainControl, refreshDevices]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const newMuted = !muted;
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !newMuted;
      });
      setMuted(newMuted);
    }
  }, [muted]);

  const switchDevice = useCallback(async (newDeviceId: string): Promise<MediaStream> => {
    stop();
    return start(newDeviceId);
  }, [stop, start]);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices);
      stop();
    };
  }, [refreshDevices, stop]);

  return {
    stream,
    devices,
    activeDeviceId,
    error,
    loading,
    muted,
    start,
    stop,
    toggleMute,
    switchDevice,
  };
}