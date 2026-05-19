/**
 * CyberHex Studio — Neural Pipeline Hook
 * Connects media feeds to FilterEngine with GPU-aware frame processing.
 */
import { useEffect, useRef, useCallback } from 'react';
import { FilterEngine } from '@/ai/video/filters/FilterEngine';
import { useStudioStore } from '@/stores/studioStore';
import type { FeedId, NeuralFilterType } from '@/types';
import { StudioEvent } from '@/types';
import { eventBus } from '@/utils/eventBus';

const filterEngine = new FilterEngine();

export function useNeuralPipeline(feedId: FeedId | null) {
  const feeds = useStudioStore((s) => s.feeds);
  const activeFilterPipeline = useStudioStore((s) => s.activeFilterPipeline);
  const updatePerformance = useStudioStore((s) => s.updatePerformance);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef(0);
  const processingRef = useRef(false);
  const engineReady = useRef(false);

  const feed = feeds.find((f) => f.id === feedId);
  const filters = feedId ? activeFilterPipeline[feedId] ?? [] : [];

  useEffect(() => {
    filterEngine.initialize().then(() => {
      engineReady.current = true;
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!feed?.stream) return;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = feed.stream;
    video.play().catch(() => {});
    videoRef.current = video;
    return () => {
      video.srcObject = null;
      videoRef.current = null;
    };
  }, [feed?.stream]);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || processingRef.current || !engineReady.current) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    let imageData = ctx.getImageData(0, 0, w, h);
    const start = performance.now();

    if (filters.length > 0) {
      processingRef.current = true;
      try {
        const stages = filters
          .filter((f) => f.config.enabled !== false)
          .sort((a, b) => a.order - b.order)
          .map((f) => ({
            filterType: f.filterType as NeuralFilterType,
            intensity: f.intensity,
            params: Object.fromEntries(
              Object.entries(f.config.params).filter(([, v]) => typeof v === 'number')
            ) as Record<string, number>,
          }));

        const result = await filterEngine.applyPipeline({ data: imageData, width: w, height: h }, stages);
        imageData = result.data;
      } finally {
        processingRef.current = false;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const frameTimeMs = performance.now() - start;
    updatePerformance({
      fps: Math.round(Math.min(60, frameTimeMs > 0 ? 1000 / frameTimeMs : 60)),
      frameTimeMs,
      pipelineLatency: {
        captureMs: 1,
        encodeMs: 0,
        transferMs: 0,
        processMs: frameTimeMs,
        decodeMs: 0,
        renderMs: 2,
        totalMs: frameTimeMs + 3,
      },
    });

    eventBus.emit(StudioEvent.FRAME_PROCESSED, { feedId, frameTimeMs });
  }, [filters, feedId, updatePerformance]);

  useEffect(() => {
    if (!feed?.stream || !feed.enabled) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    let lastTime = 0;
    const targetInterval = 1000 / 30;

    const loop = (now: number) => {
      if (now - lastTime >= targetInterval) {
        processFrame();
        lastTime = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [feed?.stream, feed?.enabled, processFrame]);

  return { canvasRef, filterEngine };
}

export { filterEngine };
