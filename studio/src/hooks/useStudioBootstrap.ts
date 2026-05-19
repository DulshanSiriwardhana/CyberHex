/**
 * CyberHex Studio — Application Bootstrap Hook
 * Initializes engines, default scenes, keyboard shortcuts, and performance monitoring.
 */
import { useEffect, useCallback } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useWebcam, useScreenShare, useMicrophone } from '@/hooks/useMediaDevices';
import { AudioEngine } from '@/ai/audio/denoiser/AudioEngine';
import { SceneManager } from '@/engine/scene/SceneManager';
import { LayoutTemplateType, ViewMode, AudioFilterType } from '@/types';
import { v4 as uuid } from 'uuid';

const audioEngine = new AudioEngine();
const sceneManager = SceneManager.getInstance();

export function useStudioBootstrap() {
  const addFeed = useStudioStore((s) => s.addFeed);
  const addScene = useStudioStore((s) => s.addScene);
  const setAudioPipeline = useStudioStore((s) => s.setAudioPipeline);
  const addToast = useStudioStore((s) => s.addToast);
  const openCommandPalette = useStudioStore((s) => s.openCommandPalette);
  const closeCommandPalette = useStudioStore((s) => s.closeCommandPalette);
  const commandPaletteOpen = useStudioStore((s) => s.commandPaletteOpen);
  const updateFluencyConfig = useStudioStore((s) => s.updateFluencyConfig);

  const webcam = useWebcam();
  const screenShare = useScreenShare();
  const microphone = useMicrophone();

  useEffect(() => {
    if (useStudioStore.getState().scenes.length === 0) {
      addScene({
        name: 'Default Studio',
        layout: {
          width: 1920,
          height: 1080,
          gridCols: 2,
          gridRows: 2,
          gap: 8,
          padding: 16,
          background: '#0a0a1a',
          overlays: [],
        },
        template: LayoutTemplateType.ZOOM_SPEAKER,
        feeds: [],
        order: 0,
      });
    }
  }, [addScene]);

  const addWebcamFeed = useCallback(async () => {
    try {
      const stream = await webcam.start();
      const id = addFeed({
        type: 'webcam',
        sourceId: webcam.activeDeviceId ?? 'default',
        stream,
        position: { x: 0, y: 0, width: 640, height: 360, zIndex: 1 },
        layout: { opacity: 1, borderRadius: 12, mirrored: true, fit: 'cover' },
        activeFilters: [],
        muted: true,
        pinned: false,
        label: 'WEBCAM',
        enabled: true,
      });
      addToast({ type: 'success', title: 'Webcam', message: 'Feed connected', dismissible: true, duration: 2500 });
      return id;
    } catch {
      addToast({ type: 'error', title: 'Webcam', message: webcam.error ?? 'Access denied', dismissible: true });
    }
  }, [webcam, addFeed, addToast]);

  const addScreenFeed = useCallback(async () => {
    try {
      const stream = await screenShare.start();
      addFeed({
        type: 'screen',
        sourceId: 'screen',
        stream,
        position: { x: 640, y: 0, width: 640, height: 360, zIndex: 0 },
        layout: { opacity: 1, borderRadius: 8, mirrored: false, fit: 'contain' },
        activeFilters: [],
        muted: true,
        pinned: false,
        label: 'SCREEN',
        enabled: true,
      });
      addToast({ type: 'success', title: 'Screen', message: 'Screen share active', dismissible: true, duration: 2500 });
    } catch {
      addToast({ type: 'info', title: 'Screen', message: 'Share cancelled', dismissible: true, duration: 2000 });
    }
  }, [screenShare, addFeed, addToast]);

  const initAudio = useCallback(async () => {
    try {
      const stream = await microphone.start();
      await audioEngine.initialize(
        { sampleRate: 48000, bufferSize: 4096, channels: 1, enableWorkers: true, latencyTarget: 0.01 },
        stream
      );

      setAudioPipeline({
        id: uuid(),
        name: 'Neural Audio',
        stages: [
          { id: 'denoise', type: AudioFilterType.DENOISER, name: 'Denoiser', enabled: true, params: { threshold: 0.01 }, node: null },
          { id: 'comp', type: AudioFilterType.COMPRESSOR, name: 'Compressor', enabled: true, params: { threshold: -24, ratio: 4 }, node: null },
          { id: 'enhance', type: AudioFilterType.ENHANCER, name: 'Enhancer', enabled: true, params: {}, node: null },
        ],
        bypass: false,
        solo: false,
        gain: 1,
      });

      updateFluencyConfig({ enabled: true, generateSubtitles: true });
      audioEngine.setFluencyConfig(useStudioStore.getState().fluencyConfig);

      addToast({ type: 'success', title: 'Audio', message: 'Neural audio pipeline ready', dismissible: true, duration: 2500 });
    } catch {
      addToast({ type: 'error', title: 'Microphone', message: microphone.error ?? 'Access denied', dismissible: true });
    }
  }, [microphone, setAudioPipeline, updateFluencyConfig, addToast]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        commandPaletteOpen ? closeCommandPalette() : openCommandPalette();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        addWebcamFeed();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        addScreenFeed();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        initAudio();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette, addWebcamFeed, addScreenFeed, initAudio]);

  return {
    addWebcamFeed,
    addScreenFeed,
    initAudio,
    audioEngine,
    sceneManager,
    webcam,
    screenShare,
    microphone,
  };
}

export { audioEngine, sceneManager };
