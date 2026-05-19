/**
 * CyberHex Studio — GPU Resource Manager
 * Singleton managing WebGPU/WebGL2 contexts, texture pools, compute pipelines, and memory budgets.
 */
import type {
  GPUInfo,
  MemoryUsage,
  BenchmarkResult,
} from '@/types';
import { GPUProvider } from '@/types';

/* ─── Internal Types ──────────────────── */

export interface GPUCapabilities {
  provider: GPUProvider;
  vendor: string;
  renderer: string;
  maxTextureSize: number;
  maxBufferSize: number;
  maxComputeWorkgroupSize: number;
  maxBindGroups: number;
  computeSupported: boolean;
  features: string[];
}

export interface TextureSize {
  width: number;
  height: number;
  depth?: number;
}

export type TextureFormat = 'rgba8unorm' | 'rgba16float' | 'rgba32float' | 'bgra8unorm' | 'r8unorm' | 'depth32float';

export interface GPUTextureHandle {
  id: string;
  size: TextureSize;
  format: TextureFormat;
  texture: GPUTexture | WebGLTexture | null;
  view: GPUTextureView | null;
  inUse: boolean;
  createdAt: number;
}

export interface BindingLayout {
  binding: number;
  visibility: GPUShaderStage;
  type: 'buffer' | 'texture' | 'sampler' | 'storage';
}

export interface TensorBinding {
  name: string;
  data: Float32Array | Uint8Array | Int32Array;
  shape: number[];
  binding?: number;
}

export type ComputePipelineHandle = string;

interface ComputePipelineEntry {
  id: string;
  pipeline: GPUComputePipeline | null;
  bindGroupLayout: GPUBindGroupLayout | null;
  shaderModule: GPUShaderModule | null;
  bindings: BindingLayout[];
  refCount: number;
}

interface ShaderCacheEntry {
  code: string;
  module: GPUShaderModule | null;
}

interface TexturePoolEntry {
  handle: GPUTextureHandle;
  lastAccessed: number;
}

/* ─── GPUManager Singleton ────────────── */

export class GPUManager {
  private static _instance: GPUManager | null = null;

  static getInstance(): GPUManager {
    if (!GPUManager._instance) GPUManager._instance = new GPUManager();
    return GPUManager._instance;
  }

  /* ── State ── */
  private _provider: GPUProvider = GPUProvider.CPU;
  private _adapter: GPUAdapter | null = null;
  private _device: GPUDevice | null = null;
  private _gl: WebGL2RenderingContext | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _capabilities: GPUCapabilities | null = null;
  private _initialized = false;
  private _initializing = false;

  private _texturePool: Map<string, TexturePoolEntry> = new Map();
  private _maxTextures = 64;
  private _computePipelines: Map<string, ComputePipelineEntry> = new Map();
  private _shaderCache: Map<string, ShaderCacheEntry> = new Map();
  private _handleCounter = 0;

  private _onDeviceLost: (() => void) | null = null;
  private _deviceLostBound = false;

  private constructor() {}

  /* ── Initialize ── */

  async initialize(): Promise<GPUInfo> {
    if (this._initialized) return this._toGPUInfo();
    if (this._initializing) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this._initialized) { clearInterval(check); resolve(this._toGPUInfo()); }
        }, 50);
      });
    }
    this._initializing = true;

    this._canvas = document.createElement('canvas');
    this._canvas.width = 256;
    this._canvas.height = 256;

    this._provider = await this._detectProvider();

    if (this._provider === GPUProvider.WEBGPU) {
      await this._initWebGPU();
    } else if (this._provider === GPUProvider.WEBGL2) {
      await this._initWebGL2();
    }

    this._buildCapabilities();
    this._initialized = true;
    this._initializing = false;
    return this._toGPUInfo();
  }

  private async _detectProvider(): Promise<GPUProvider> {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) return GPUProvider.WEBGPU;
      } catch { /* fall through */ }
    }

    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2');
    if (gl) { testCanvas.remove(); return GPUProvider.WEBGL2; }

    const gl1 = testCanvas.getContext('webgl');
    if (gl1) { testCanvas.remove(); return GPUProvider.WEBGL1; }

    testCanvas.remove();
    return GPUProvider.CPU;
  }

  private async _initWebGPU(): Promise<void> {
    try {
      this._adapter = await (navigator as any).gpu.requestAdapter({
        powerPreference: 'high-performance',
      });
      if (!this._adapter) throw new Error('No WebGPU adapter');

      this._device = await this._adapter.requestDevice({
        requiredFeatures: ['texture-compression-bc', 'timestamp-query'],
        requiredLimits: {
          maxStorageBufferBindingSize: 1024 * 1024 * 1024,
          maxBufferSize: 1024 * 1024 * 1024,
        } as any,
      });

      if (!this._deviceLostBound) {
        this._device.lost.then((info) => {
          console.warn('[GPUManager] WebGPU device lost:', info);
          this._device = null;
          this._adapter = null;
          this._provider = GPUProvider.CPU;
          this._capabilities = null;
          this._initialized = false;
          this._onDeviceLost?.();
        });
        this._deviceLostBound = true;
      }
    } catch (e) {
      console.warn('[GPUManager] WebGPU init failed, falling back:', e);
      this._provider = GPUProvider.CPU;
    }
  }

  private async _initWebGL2(): Promise<void> {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2', {
        powerPreference: 'high-performance',
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        antialias: false,
        depth: false,
        stencil: false,
      });
      if (!gl) throw new Error('WebGL2 not available');
      this._gl = gl;

      const extDebug = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = extDebug ? gl.getParameter(extDebug.UNMASKED_VENDOR_WEBGL) : 'Unknown';
      const renderer = extDebug ? gl.getParameter(extDebug.UNMASKED_RENDERER_WEBGL) : 'Unknown';
      console.log(`[GPUManager] WebGL2: ${vendor} / ${renderer}`);
    } catch (e) {
      console.warn('[GPUManager] WebGL2 init failed:', e);
      this._provider = GPUProvider.CPU;
    }
  }

  private _buildCapabilities(): void {
    if (this._provider === GPUProvider.WEBGPU && this._adapter) {
      const limits = (this._adapter as any).limits;
      this._capabilities = {
        provider: GPUProvider.WEBGPU,
        vendor: (this._adapter as GPUAdapter & { info?: { vendor?: string } }).info?.vendor ?? 'Unknown',
        renderer: (this._adapter as GPUAdapter & { info?: { architecture?: string } }).info?.architecture ?? 'Unknown',
        maxTextureSize: limits?.maxTextureDimension2D ?? 8192,
        maxBufferSize: limits?.maxBufferSize ?? 1024 * 1024 * 1024,
        maxComputeWorkgroupSize: limits?.maxComputeWorkgroupSizeX ?? 256,
        maxBindGroups: limits?.maxBindGroups ?? 4,
        computeSupported: true,
        features: Array.from((this._adapter as any).features ?? []),
      };
    } else if (this._provider === GPUProvider.WEBGL2 && this._gl) {
      const gl = this._gl!;
      const extDebug = gl.getExtension('WEBGL_debug_renderer_info');
      this._capabilities = {
        provider: GPUProvider.WEBGL2,
        vendor: extDebug ? gl.getParameter(extDebug.UNMASKED_VENDOR_WEBGL) : 'Unknown',
        renderer: extDebug ? gl.getParameter(extDebug.UNMASKED_RENDERER_WEBGL) : 'Unknown',
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxBufferSize: gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE) * 8,
        maxComputeWorkgroupSize: 0,
        maxBindGroups: 0,
        computeSupported: false,
        features: ['WEBGL2', 'texture_float', 'texture_half_float'].filter((f) => f === 'WEBGL2' || gl.getExtension(f)),
      };
    } else {
      this._capabilities = {
        provider: GPUProvider.CPU,
        vendor: 'CPU',
        renderer: 'Software',
        maxTextureSize: 4096,
        maxBufferSize: 1024 * 1024 * 1024,
        maxComputeWorkgroupSize: 0,
        maxBindGroups: 0,
        computeSupported: false,
        features: [],
      };
    }
  }

  /* ── Public API ── */

  getCapabilities(): GPUCapabilities {
    if (!this._capabilities) throw new Error('GPUManager not initialized');
    return { ...this._capabilities };
  }

  get provider(): GPUProvider { return this._provider; }
  get device(): GPUDevice | null { return this._device; }
  get glContext(): WebGL2RenderingContext | null { return this._gl; }

  onDeviceLost(cb: () => void): void { this._onDeviceLost = cb; }

  /* ── Texture Pool ── */

  acquireTexture(size: TextureSize, format: TextureFormat): GPUTextureHandle {
    const poolKey = `${size.width}x${size.height}_${format}`;
    const pooled = this._texturePool.get(poolKey);
    if (pooled && !pooled.handle.inUse) {
      pooled.handle.inUse = true;
      pooled.lastAccessed = performance.now();
      return pooled.handle;
    }

    if (this._texturePool.size >= this._maxTextures) this._evictTextures();

    const id = `tex_${++this._handleCounter}_${Date.now()}`;
    let texture: GPUTexture | WebGLTexture | null = null;
    let view: GPUTextureView | null = null;

    if (this._provider === GPUProvider.WEBGPU && this._device) {
      texture = this._device.createTexture({
        size: { width: size.width, height: size.height, depthOrArrayLayers: size.depth ?? 1 },
        format: format as GPUTextureFormat,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING,
      });
      view = (texture as GPUTexture).createView();
    } else if (this._provider === GPUProvider.WEBGL2 && this._gl) {
      const gl = this._gl!;
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    const handle: GPUTextureHandle = { id, size, format, texture, view, inUse: true, createdAt: performance.now() };
    this._texturePool.set(id, { handle, lastAccessed: performance.now() });
    return handle;
  }

  releaseTexture(handle: GPUTextureHandle): void {
    handle.inUse = false;
    const entry = [...this._texturePool.values()].find((e) => e.handle.id === handle.id);
    if (entry) entry.lastAccessed = performance.now();
  }

  private _evictTextures(): void {
    const entries = [...this._texturePool.entries()]
      .filter(([, e]) => !e.handle.inUse)
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    for (const [key, entry] of entries) {
      if (this._provider === GPUProvider.WEBGL2) {
        (entry.handle.texture as WebGLTexture) && this._gl?.deleteTexture(entry.handle.texture as WebGLTexture);
      }
      // WebGPU textures are GC'd automatically
      this._texturePool.delete(key);
    }
  }

  /* ── Compute Pipelines ── */

  createComputePipeline(shaderCode: string, bindings: BindingLayout[]): ComputePipelineHandle {
    const hash = this._hashString(shaderCode + JSON.stringify(bindings));

    if (this._computePipelines.has(hash)) {
      const entry = this._computePipelines.get(hash)!;
      entry.refCount++;
      return hash;
    }

    if (!this._device) throw new Error('WebGPU not available for compute pipelines');

    const shaderModule = this._device.createShaderModule({ code: shaderCode });

    const entryBindings: GPUBindGroupLayoutEntry[] = bindings.map((b, idx) => ({
      binding: idx,
      visibility: GPUShaderStage.COMPUTE,
      ...(b.type === 'buffer' ? { buffer: { type: 'storage' as const } } : {}),
      ...(b.type === 'storage' ? { buffer: { type: 'storage' as const } } : {}),
      ...(b.type === 'texture' ? { texture: { sampleType: 'float' as const } } : {}),
    }));

    const bindGroupLayout = this._device.createBindGroupLayout({ entries: entryBindings });

    const pipeline = this._device.createComputePipeline({
      layout: this._device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      compute: { module: shaderModule, entryPoint: 'main' },
    });

    this._computePipelines.set(hash, {
      id: hash,
      pipeline,
      bindGroupLayout,
      shaderModule,
      bindings,
      refCount: 1,
    });

    return hash;
  }

  async runCompute(handle: ComputePipelineHandle, inputs: TensorBinding[]): Promise<GPUBuffer | null> {
    if (!this._device) throw new Error('WebGPU not available');

    const entry = this._computePipelines.get(handle);
    if (!entry || !entry.pipeline || !entry.bindGroupLayout) throw new Error('Pipeline not found');

    const buffers: { buffer: GPUBuffer; size: number }[] = [];

    const entries: GPUBindGroupEntry[] = inputs.map((input, idx) => {
      const size = input.data.byteLength;
      const padded = Math.ceil(size / 16) * 16;
      const buf = this._device!.createBuffer({
        size: padded,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      });
      this._device!.queue.writeBuffer(buf, 0, input.data.buffer, input.data.byteOffset, size);
      buffers.push({ buffer: buf, size });
      return { binding: idx, resource: { buffer: buf } };
    });

    const bindGroup = this._device.createBindGroup({
      layout: entry.bindGroupLayout,
      entries,
    });

    const resultBuffer = this._device.createBuffer({
      size: 4 * 1024 * 1024,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const commandEncoder = this._device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(entry.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(1, 1, 1);
    passEncoder.end();

    const staging = this._device.createBuffer({
      size: 4 * 1024 * 1024,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    commandEncoder.copyBufferToBuffer(resultBuffer, 0, staging, 0, 4 * 1024 * 1024);

    this._device.queue.submit([commandEncoder.finish()]);

    await staging.mapAsync(GPUMapMode.READ);
    buffers.forEach((b) => b.buffer.destroy());
    resultBuffer.destroy();

    return staging;
  }

  /* ── Memory ── */

  getMemoryUsage(): MemoryUsage {
    const tensorMB = 0; // Would integrate with TF memory tracking
    const textureCount = [...this._texturePool.values()].filter((e) => e.handle.inUse).length;
    const textureMB = textureCount * 4 * 1920 / 1024; // Rough estimate
    const totalMB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory! * 1024
      : 8192;
    const usedMB = textureMB + tensorMB;

    return { totalMB: totalMB ?? 8192, usedMB, freeMB: (totalMB ?? 8192) - usedMB, tensorMB, textureMB, bufferMB: 0 };
  }

  benchmark(name: string, batchSize: number, iterations: number): BenchmarkResult {
    return {
      name,
      provider: this._provider,
      batchSize,
      iterations,
      avgMs: 0,
      minMs: 0,
      maxMs: 0,
      p95Ms: 0,
      throughput: 0,
      memoryMB: 0,
    };
  }

  dispose(): void {
    this._texturePool.clear();
    this._computePipelines.clear();
    this._shaderCache.clear();
    this._device?.destroy();
    this._device = null;
    this._adapter = null;
    this._gl = null;
    this._canvas?.remove();
    this._initialized = false;
    this._capabilities = null;
  }

  /* ── Helpers ── */

  private _toGPUInfo(): GPUInfo {
    return {
      provider: this._provider,
      vendor: this._capabilities?.vendor ?? '',
      renderer: this._capabilities?.renderer ?? '',
      maxTextureSize: this._capabilities?.maxTextureSize ?? 0,
      maxBufferSize: this._capabilities?.maxBufferSize ?? 0,
      computeSupported: this._capabilities?.computeSupported ?? false,
      utilization: 0,
      memoryUsedMB: 0,
      memoryTotalMB: 0,
      temperature: 0,
    };
  }

  private _hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'cp_' + Math.abs(hash).toString(36);
  }
}