/**
 * CyberHex Studio — Neural Video Filter Engine
 * Real-time AI-powered video transformation system.
 * Applies neural style transfer, segmentation, enhancement, and artistic filters.
 */
import * as tf from '@tensorflow/tfjs';
import type { NeuralFilterType, FilterConfig } from '@/types';

/* ─── Types ────────────────────────────── */

export interface VideoFrameInput {
  data: ImageData;
  width: number;
  height: number;
}

export interface FilterModule {
  type: NeuralFilterType;
  name: string;
  category: string;
  supported: boolean;
  apply: (input: VideoFrameInput, intensity: number, params: Record<string, number>) => Promise<VideoFrameInput>;
  dispose: () => void;
}

export interface FilterPipelineStage {
  filterType: NeuralFilterType;
  intensity: number;
  params: Record<string, number>;
}

/* ─── CPU Filter Utilities ─────────────── */

function getPixels(data: ImageData): Float32Array {
  const pixels = new Float32Array(data.width * data.height * 4);
  const src = data.data;
  for (let i = 0; i < src.length; i++) pixels[i] = src[i] / 255;
  return pixels;
}

function setPixels(data: ImageData, pixels: Float32Array): void {
  const dst = data.data;
  for (let i = 0; i < dst.length; i++) dst[i] = Math.round(Math.max(0, Math.min(1, pixels[i])) * 255);
}

function lum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* ─── Filter Implementations ────────────── */

function applyCartoon(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);

  const edgeThreshold = 0.15 * (1 - intensity * 0.8);
  const quantLevels = Math.round(4 + intensity * 8);

  for (let y = 1; y < input.height - 1; y++) {
    for (let x = 1; x < input.width - 1; x++) {
      const idx = (y * input.width + x) * 4;
      const tl = lum(px[idx - input.width * 4 - 4], px[idx - input.width * 4 - 3], px[idx - input.width * 4 - 2]);
      const tm = lum(px[idx - input.width * 4], px[idx - input.width * 4 + 1], px[idx - input.width * 4 + 2]);
      const tr = lum(px[idx - input.width * 4 + 4], px[idx - input.width * 4 + 5], px[idx - input.width * 4 + 6]);
      const ml = lum(px[idx - 4], px[idx - 3], px[idx - 2]);
      const mr = lum(px[idx + 4], px[idx + 5], px[idx + 6]);
      const bl = lum(px[idx + input.width * 4 - 4], px[idx + input.width * 4 - 3], px[idx + input.width * 4 - 2]);
      const bm = lum(px[idx + input.width * 4], px[idx + input.width * 4 + 1], px[idx + input.width * 4 + 2]);
      const br = lum(px[idx + input.width * 4 + 4], px[idx + input.width * 4 + 5], px[idx + input.width * 4 + 6]);

      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
      const edge = Math.sqrt(gx * gx + gy * gy) > edgeThreshold ? 1 : 0;

      for (let c = 0; c < 3; c++) {
        const val = px[idx + c];
        const quantized = Math.round(val * quantLevels) / quantLevels;
        op[idx + c] = edge ? quantized * 0.3 : quantized;
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyAnime(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const levels = 3 + Math.round(intensity * 3);

  for (let i = 0; i < px.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const val = px[i + c];
      op[i + c] = Math.round(val * levels) / levels;
    }
    const l = lum(px[i], px[i + 1], px[i + 2]);
    const edge = Math.abs(l - 0.5) > 0.3 - intensity * 0.2 ? 0.15 : 0;
    op[i] = Math.max(op[i] * 1.1, edge);
    op[i + 1] = Math.max(op[i + 1] * 1.05, edge);
    op[i + 2] = Math.max(op[i + 2] * 0.95, edge);
    op[i + 3] = 1;
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyPencilSketch(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);

  for (let y = 1; y < input.height - 1; y++) {
    for (let x = 1; x < input.width - 1; x++) {
      const idx = (y * input.width + x) * 4;
      const c = lum(px[idx], px[idx + 1], px[idx + 2]);
      const tr = lum(px[idx - input.width * 4 + 4], px[idx - input.width * 4 + 5], px[idx - input.width * 4 + 6]);
      const bl = lum(px[idx + input.width * 4 - 4], px[idx + input.width * 4 - 3], px[idx + input.width * 4 - 2]);
      const edge = Math.abs(tr - bl);

      const gray = 1 - Math.min(1, edge * (2 + intensity * 4));
      const hatch = Math.sin(x * 0.5) * Math.cos(y * 0.5) > 0.3 ? 0.05 : 0;
      const val = Math.max(0, gray - hatch * intensity);

      op[idx] = val;
      op[idx + 1] = val;
      op[idx + 2] = val;
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyOilPainting(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const radius = Math.round(1 + intensity * 3);

  for (let y = radius; y < input.height - radius; y++) {
    for (let x = radius; x < input.width - radius; x++) {
      const idx = (y * input.width + x) * 4;
      const bins: number[][] = Array.from({ length: 16 }, () => [0, 0, 0, 0]);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nIdx = ((y + dy) * input.width + (x + dx)) * 4;
          const binIdx = Math.floor(lum(px[nIdx], px[nIdx + 1], px[nIdx + 2]) * 15);
          for (let c = 0; c < 3; c++) bins[binIdx][c] += px[nIdx + c];
          bins[binIdx][3]++;
        }
      }

      let maxBin = 0;
      for (let b = 1; b < 16; b++) {
        if (bins[b][3] > bins[maxBin][3]) maxBin = b;
      }

      for (let c = 0; c < 3; c++) {
        op[idx + c] = bins[maxBin][c] / bins[maxBin][3];
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyCyberpunk(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];

    // Split tone: blues/cyans in shadows, magenta/pink in highlights
    const l = lum(r, g, b);
    const cyan = Math.max(0, (1 - l) * intensity);
    const magenta = Math.max(0, l * intensity);

    op[i] = r * (1 - magenta * 0.3) + magenta * 0.6;       // R
    op[i + 1] = g * (1 - cyan * 0.2) + cyan * 0.4;           // G
    op[i + 2] = b * (1 - cyan * 0.2) + cyan * 0.7 + magenta * 0.3; // B

    // Glow effect
    const glow = Math.pow(l, 2) * intensity * 0.4;
    op[i] += glow * 0.1;
    op[i + 1] += glow * 0.2;
    op[i + 2] += glow * 0.5;

    op[i] = Math.min(1, op[i]);
    op[i + 1] = Math.min(1, op[i + 1]);
    op[i + 2] = Math.min(1, op[i + 2]);
    op[i + 3] = 1;
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyBackgroundBlur(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const blurRadius = Math.round(3 + intensity * 20);

  // Simple center-weighted blur (simulates face detection with center focus)
  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      const idx = (y * input.width + x) * 4;
      const dx = (x - input.width / 2) / (input.width / 2);
      const dy = (y - input.height / 2) / (input.height / 2);
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const blurAmount = Math.min(1, Math.max(0, distFromCenter - 0.15)) * intensity;

      if (blurAmount < 0.05) {
        for (let c = 0; c < 4; c++) op[idx + c] = px[idx + c];
        continue;
      }

      const r = Math.round(blurAmount * blurRadius);
      let sum = [0, 0, 0, 0];
      let count = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const ny = Math.min(input.height - 1, Math.max(0, y + dy));
          const nx = Math.min(input.width - 1, Math.max(0, x + dx));
          const nidx = (ny * input.width + nx) * 4;
          for (let c = 0; c < 4; c++) sum[c] += px[nidx + c];
          count++;
        }
      }
      for (let c = 0; c < 4; c++) op[idx + c] = sum[c] / count;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyBackgroundReplacement(input: VideoFrameInput, intensity: number): VideoFrameInput {
  // Simplified: replace darker/similar edges with green tint (simulated chroma key)
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const bgColor = [0.05, 0.1, 0.1] as const; // dark cyber blue

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      const idx = (y * input.width + x) * 4;
      const dx = (x - input.width / 2) / (input.width / 2);
      const dy = (y - input.height / 2) / (input.height / 2);
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const bgFactor = Math.min(1, Math.max(0, distFromCenter - 0.2)) * intensity;

      for (let c = 0; c < 3; c++) {
        op[idx + c] = px[idx + c] * (1 - bgFactor) + bgColor[c] * bgFactor;
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyEdgeEnhancement(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const sharpAmount = 0.5 + intensity * 1.5;

  for (let y = 1; y < input.height - 1; y++) {
    for (let x = 1; x < input.width - 1; x++) {
      const idx = (y * input.width + x) * 4;
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nidx = ((y + ky) * input.width + (x + kx)) * 4;
          const l = lum(px[nidx], px[nidx + 1], px[nidx + 2]);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += l * sobelX[ki];
          gy += l * sobelY[ki];
        }
      }

      const edge = Math.min(1, Math.sqrt(gx * gx + gy * gy));
      for (let c = 0; c < 3; c++) {
        op[idx + c] = px[idx + c] + edge * sharpAmount * (px[idx + c] - 0.5);
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyLowLight(input: VideoFrameInput, intensity: number): VideoFrameInput {
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const boost = 1 + intensity * 2;
  const gamma = 1 - intensity * 0.3;

  for (let i = 0; i < px.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const val = Math.pow(px[i + c] * boost, gamma);
      // Denoise: clamp low values
      op[i + c] = val < 0.02 ? 0 : Math.min(1, val);
    }
    op[i + 3] = 1;
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applySuperResolution(input: VideoFrameInput, intensity: number): VideoFrameInput {
  // Simple bicubic-like upscaling simulation via sharpening
  // For true super-res, an ONNX/TF.js model would be loaded
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const sharpAmount = 0.8 + intensity * 1.2;

  for (let y = 1; y < input.height - 1; y++) {
    for (let x = 1; x < input.width - 1; x++) {
      const idx = (y * input.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = px[idx + c];
        const neighbors =
          px[((y - 1) * input.width + x) * 4 + c] +
          px[((y + 1) * input.width + x) * 4 + c] +
          px[(y * input.width + (x - 1)) * 4 + c] +
          px[(y * input.width + (x + 1)) * 4 + c];
        op[idx + c] = Math.min(1, center + (center - neighbors / 4) * sharpAmount);
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyFaceRelighting(input: VideoFrameInput, intensity: number): VideoFrameInput {
  // Simulated face-aware relighting: brighten center, vignette edges
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      const idx = (y * input.width + x) * 4;
      const dx = (x - input.width * 0.45) / (input.width * 0.35);
      const dy = (y - input.height * 0.4) / (input.height * 0.35);
      const distFromFace = Math.sqrt(dx * dx + dy * dy);
      const faceMask = Math.max(0, 1 - distFromFace);

      const lightBoost = faceMask * intensity * 0.4;
      const vignette = (1 - Math.min(1, Math.max(Math.abs(x - input.width / 2) / (input.width / 2), Math.abs(y - input.height / 2) / (input.height / 2)) * 0.4)) * intensity * 0.15;

      for (let c = 0; c < 3; c++) {
        op[idx + c] = Math.min(1, px[idx + c] + lightBoost - vignette);
      }
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

function applyMotionSmoothing(input: VideoFrameInput, intensity: number): VideoFrameInput {
  // Frame temporal smoothing — in a real implementation this would use frame buffering
  // Here we apply a spatial equivalent (bilateral-style smoothing)
  const out = new ImageData(input.width, input.height);
  const px = getPixels(input.data);
  const op = new Float32Array(px.length);
  const sigmaSpatial = 1 + intensity * 3;
  const sigmaRange = 0.05 + intensity * 0.1;

  for (let y = 1; y < input.height - 1; y++) {
    for (let x = 1; x < input.width - 1; x++) {
      const idx = (y * input.width + x) * 4;
      let sum = [0, 0, 0];
      let weightSum = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * input.width + (x + dx)) * 4;
          const spatialDist = Math.sqrt(dx * dx + dy * dy);
          const rangeDist = Math.abs(lum(px[idx], px[idx + 1], px[idx + 2]) - lum(px[nIdx], px[nIdx + 1], px[nIdx + 2]));

          const weight = Math.exp(-spatialDist / sigmaSpatial - rangeDist / sigmaRange);

          for (let c = 0; c < 3; c++) sum[c] += px[nIdx + c] * weight;
          weightSum += weight;
        }
      }

      for (let c = 0; c < 3; c++) op[idx + c] = sum[c] / weightSum;
      op[idx + 3] = 1;
    }
  }
  setPixels(out, op);
  return { data: out, width: input.width, height: input.height };
}

/* ─── FilterEngine ──────────────────────── */

export class FilterEngine {
  private filters: Map<NeuralFilterType, FilterModule> = new Map();
  private initialized = false;
  private tfReady = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await tf.ready();
      const backend = tf.getBackend();
      console.log(`[FilterEngine] TF backend: ${backend}`);
      this.tfReady = true;
    } catch (e) {
      console.warn('[FilterEngine] TF.js not available, using CPU fallback:', e);
    }

    this._registerFilters();
    this.initialized = true;
    console.log('[FilterEngine] Initialized with', this.filters.size, 'filters');
  }

  private _registerFilters(): void {
    const supported = true;

    this.filters.set(NeuralFilterType.CARTOON, {
      type: NeuralFilterType.CARTOON,
      name: 'Cartoon',
      category: 'artistic',
      supported,
      apply: (input, intensity) => Promise.resolve(applyCartoon(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.ANIME, {
      type: NeuralFilterType.ANIME,
      name: 'Anime',
      category: 'artistic',
      supported,
      apply: (input, intensity) => Promise.resolve(applyAnime(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.PENCIL_SKETCH, {
      type: NeuralFilterType.PENCIL_SKETCH,
      name: 'Pencil Sketch',
      category: 'artistic',
      supported,
      apply: (input, intensity) => Promise.resolve(applyPencilSketch(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.OIL_PAINTING, {
      type: NeuralFilterType.OIL_PAINTING,
      name: 'Oil Painting',
      category: 'artistic',
      supported,
      apply: (input, intensity) => Promise.resolve(applyOilPainting(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.CYBERPUNK, {
      type: NeuralFilterType.CYBERPUNK,
      name: 'Cyberpunk',
      category: 'style_transfer',
      supported,
      apply: (input, intensity) => Promise.resolve(applyCyberpunk(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.BACKGROUND_BLUR, {
      type: NeuralFilterType.BACKGROUND_BLUR,
      name: 'Background Blur',
      category: 'segmentation',
      supported,
      apply: (input, intensity) => Promise.resolve(applyBackgroundBlur(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.BACKGROUND_REPLACEMENT, {
      type: NeuralFilterType.BACKGROUND_REPLACEMENT,
      name: 'Background Replacement',
      category: 'segmentation',
      supported,
      apply: (input, intensity) => Promise.resolve(applyBackgroundReplacement(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.EDGE_ENHANCEMENT, {
      type: NeuralFilterType.EDGE_ENHANCEMENT,
      name: 'Edge Enhancement',
      category: 'enhancement',
      supported,
      apply: (input, intensity) => Promise.resolve(applyEdgeEnhancement(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.LOW_LIGHT, {
      type: NeuralFilterType.LOW_LIGHT,
      name: 'Low Light Enhancement',
      category: 'enhancement',
      supported,
      apply: (input, intensity) => Promise.resolve(applyLowLight(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.SUPER_RESOLUTION, {
      type: NeuralFilterType.SUPER_RESOLUTION,
      name: 'Super Resolution',
      category: 'enhancement',
      supported,
      apply: (input, intensity) => Promise.resolve(applySuperResolution(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.FACE_RELIGHTING, {
      type: NeuralFilterType.FACE_RELIGHTING,
      name: 'Face Relighting',
      category: 'enhancement',
      supported,
      apply: (input, intensity) => Promise.resolve(applyFaceRelighting(input, intensity)),
      dispose: () => {},
    });

    this.filters.set(NeuralFilterType.MOTION_SMOOTHING, {
      type: NeuralFilterType.MOTION_SMOOTHING,
      name: 'Motion Smoothing',
      category: 'enhancement',
      supported,
      apply: (input, intensity) => Promise.resolve(applyMotionSmoothing(input, intensity)),
      dispose: () => {},
    });
  }

  /* ── Public API ── */

  async applyFilter(
    type: NeuralFilterType,
    input: VideoFrameInput,
    intensity: number = 1.0,
    params: Record<string, number> = {}
  ): Promise<VideoFrameInput> {
    if (!this.initialized) await this.initialize();

    const filter = this.filters.get(type);
    if (!filter) {
      console.warn(`[FilterEngine] Unknown filter: ${type}`);
      return input;
    }

    const start = performance.now();
    const result = await filter.apply(input, Math.max(0, Math.min(1, intensity)), params);
    const elapsed = performance.now() - start;

    if (elapsed > 16) {
      console.debug(`[FilterEngine] ${filter.name} took ${elapsed.toFixed(1)}ms`);
    }

    return result;
  }

  async applyPipeline(
    input: VideoFrameInput,
    stages: FilterPipelineStage[]
  ): Promise<VideoFrameInput> {
    let current = input;

    for (const stage of stages) {
      current = await this.applyFilter(stage.filterType, current, stage.intensity, stage.params);
    }

    return current;
  }

  getAvailableFilters(): NeuralFilterType[] {
    return Array.from(this.filters.keys());
  }

  getFilterInfo(type: NeuralFilterType): FilterModule | undefined {
    return this.filters.get(type);
  }

  isFilterAvailable(type: NeuralFilterType): boolean {
    return this.filters.has(type);
  }

  dispose(): void {
    this.filters.forEach((f) => f.dispose());
    this.filters.clear();
    this.initialized = false;
  }
}