/**
 * CyberHex Studio — Neural Rendering Pipeline
 * Real-time frame processing engine with ring buffer, WebGL/WebGPU rendering,
 * multi-stage filter chaining, and performance monitoring.
 */
import { GPUManager } from '@/engine/gpu/GPUManager';

/* ─── Types ────────────────────────────── */

export type PipelineStageType = 'preprocess' | 'inference' | 'postprocess' | 'render';

export interface PipelineConfig {
  width: number;
  height: number;
  maxFPS: number;
  enableFrameSkipping: boolean;
  maxRingBufferSize: number;
  outputCanvas: HTMLCanvasElement;
  preferredBackend: 'webgpu' | 'webgl' | 'cpu';
  workerUrl?: string;
}

export interface PipelineStage {
  id: string;
  type: PipelineStageType;
  name: string;
  enabled: boolean;
  process: (input: ImageData | HTMLVideoElement | HTMLCanvasElement) => Promise<ImageData>;
  config: Record<string, unknown>;
}

export interface FrameSource {
  type: 'video' | 'canvas' | 'imagedata' | 'bitmap';
  element?: HTMLVideoElement | HTMLCanvasElement;
  data?: ImageData;
  bitmap?: ImageBitmap;
  timestamp: number;
}

export interface FrameResult {
  id: number;
  data: ImageData | null;
  width: number;
  height: number;
  timestamp: number;
  totalMs: number;
  stageMs: Record<string, number>;
  dropped: boolean;
}

export interface PipelineMetrics {
  fps: number;
  avgTotalMs: number;
  avgStageMs: Record<string, number>;
  droppedFrames: number;
  processedFrames: number;
  ringBufferUtilisation: number;
}

/* ─── Ring Buffer ──────────────────────── */

interface FrameEntry {
  id: number;
  source: FrameSource;
  timestamp: number;
  processed: boolean;
  dropped: boolean;
}

class RingBuffer {
  private buffer: (FrameEntry | null)[];
  private head = 0;
  private tail = 0;
  private count = 0;
  private seq = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity).fill(null);
  }

  push(source: FrameSource): FrameEntry | null {
    if (this.count >= this.capacity) return null; // full, frame skipped
    const entry: FrameEntry = {
      id: ++this.seq,
      source,
      timestamp: source.timestamp,
      processed: false,
      dropped: false,
    };
    this.buffer[this.tail] = entry;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return entry;
  }

  pop(): FrameEntry | null {
    if (this.count === 0) return null;
    const entry = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return entry;
  }

  peek(): FrameEntry | null {
    return this.count > 0 ? this.buffer[this.head] : null;
  }

  get utilisation(): number {
    return this.count / this.capacity;
  }

  clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

/* ─── NeuralPipeline ───────────────────── */

export class NeuralPipeline {
  private config!: PipelineConfig;
  private ringBuffer!: RingBuffer;
  private stages: PipelineStage[] = [];
  private outputCtx: CanvasRenderingContext2D | null = null;
  private running = false;
  private rafId = 0;
  private lastFrameTime = 0;
  private targetFrameInterval = 0;

  /* Metrics */
  private fpsSamples: number[] = [];
  private totalTimeSamples: number[] = [];
  private stageTimeSamples: Map<string, number[]> = new Map();
  private droppedCount = 0;
  private processedCount = 0;
  private frameId = 0;

  /* GPU */
  private gpu: GPUManager;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

  constructor() {
    this.gpu = GPUManager.getInstance();
  }

  /* ── Initialize ── */

  async initialize(config: PipelineConfig): Promise<void> {
    this.config = config;
    this.ringBuffer = new RingBuffer(config.maxRingBufferSize);
    this.targetFrameInterval = 1000 / config.maxFPS;

    this.outputCtx = config.outputCanvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!this.outputCtx) throw new Error('Cannot create output canvas 2D context');

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = config.width;
    this.offscreenCanvas.height = config.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!this.offscreenCtx) throw new Error('Cannot create offscreen canvas context');

    await this.gpu.initialize();

    console.log(`[NeuralPipeline] Initialized ${config.width}x${config.height} @ ${config.maxFPS}fps`);
  }

  /* ── Stages ── */

  addStage(stage: PipelineStage): void {
    this.stages.push(stage);
    this.stageTimeSamples.set(stage.id, []);
  }

  removeStage(stageId: string): void {
    this.stages = this.stages.filter((s) => s.id !== stageId);
    this.stageTimeSamples.delete(stageId);
  }

  reorderStages(newOrder: string[]): void {
    const map = new Map(this.stages.map((s) => [s.id, s]));
    this.stages = newOrder.map((id) => map.get(id)!).filter(Boolean);
  }

  setStageConfig(stageId: string, config: Record<string, unknown>): void {
    const stage = this.stages.find((s) => s.id === stageId);
    if (stage) Object.assign(stage.config, config);
  }

  /* ── Frame Processing ── */

  async processFrame(source: FrameSource): Promise<FrameResult> {
    const start = performance.now();
    const id = ++this.frameId;

    if (this.config.enableFrameSkipping && this.ringBuffer.utilisation > 0.8) {
      this.droppedCount++;
      return {
        id, data: null, width: this.config.width, height: this.config.height,
        timestamp: source.timestamp, totalMs: 0, stageMs: {}, dropped: true,
      };
    }

    this.ringBuffer.push(source);

    let imageData: ImageData | null = null;
    const stageMs: Record<string, number> = {};

    try {
      imageData = this._extractImageData(source);

      for (const stage of this.stages) {
        if (!stage.enabled) continue;
        const stageStart = performance.now();

        if (imageData) {
          imageData = await stage.process(imageData);
        }

        const elapsed = performance.now() - stageStart;
        stageMs[stage.id] = elapsed;
        this._recordStageSample(stage.id, elapsed);
      }
    } catch (err) {
      console.error('[NeuralPipeline] Frame processing error:', err);
    }

    this.processedCount++;
    const totalMs = performance.now() - start;
    this.totalTimeSamples.push(totalMs);
    if (this.totalTimeSamples.length > 120) this.totalTimeSamples.shift();

    return {
      id, data: imageData, width: this.config.width, height: this.config.height,
      timestamp: source.timestamp, totalMs, stageMs, dropped: false,
    };
  }

  private _extractImageData(source: FrameSource): ImageData | null {
    if (source.data) return source.data;
    if (!this.offscreenCtx) return null;

    const ctx = this.offscreenCtx;
    ctx.clearRect(0, 0, this.config.width, this.config.height);

    if (source.element) {
      ctx.drawImage(source.element, 0, 0, this.config.width, this.config.height);
    } else if (source.bitmap) {
      ctx.drawImage(source.bitmap, 0, 0, this.config.width, this.config.height);
    }

    return ctx.getImageData(0, 0, this.config.width, this.config.height);
  }

  /* ── Render Loop ── */

  startRenderLoop(onFrame: (result: FrameResult) => void): void {
    if (this.running) return;
    this.running = true;

    const loop = async (now: number) => {
      if (!this.running) return;

      const elapsed = now - this.lastFrameTime;
      if (elapsed >= this.targetFrameInterval) {
        const entry = this.ringBuffer.pop();
        if (entry && !entry.dropped) {
          const result = await this.processFrame(entry.source);
          if (result.data && this.outputCtx) {
            this.outputCtx.putImageData(result.data, 0, 0);
          }
          onFrame(result);
          this._updateFPS();
        }
        this.lastFrameTime = now;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stopRenderLoop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  /* ── Metrics ── */

  private _updateFPS(): void {
    const now = performance.now();
    this.fpsSamples.push(now);
    while (this.fpsSamples.length > 0 && this.fpsSamples[0] < now - 1000) {
      this.fpsSamples.shift();
    }
  }

  private _recordStageSample(stageId: string, ms: number): void {
    const samples = this.stageTimeSamples.get(stageId) ?? [];
    samples.push(ms);
    if (samples.length > 60) samples.shift();
    this.stageTimeSamples.set(stageId, samples);
  }

  private _avg(arr: number[]): number {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  getMetrics(): PipelineMetrics {
    const stageAverages: Record<string, number> = {};
    this.stageTimeSamples.forEach((samples, id) => {
      stageAverages[id] = this._avg(samples);
    });

    return {
      fps: this.fpsSamples.length,
      avgTotalMs: this._avg(this.totalTimeSamples),
      avgStageMs: stageAverages,
      droppedFrames: this.droppedCount,
      processedFrames: this.processedCount,
      ringBufferUtilisation: this.ringBuffer.utilisation,
    };
  }

  /* ── Dispose ── */

  dispose(): void {
    this.stopRenderLoop();
    this.stages = [];
    this.ringBuffer.clear();
    this.stageTimeSamples.clear();
    this.fpsSamples = [];
    this.totalTimeSamples = [];
    this.offscreenCanvas?.remove();
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.outputCtx = null;
  }
}