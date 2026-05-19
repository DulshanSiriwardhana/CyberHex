/**
 * CyberHex Studio — AI Model Registry
 * Manages ONNX/TF.js model catalog, loading, caching, and hot-swap.
 */
import type { AIModel, ModelId } from '@/types';
import { ModelArchitecture, ModelStatus } from '@/types';
import { EngineBridge } from '@/services/EngineBridge';

export class ModelRegistry {
  private static _instance: ModelRegistry | null = null;
  static getInstance(): ModelRegistry {
    if (!ModelRegistry._instance) ModelRegistry._instance = new ModelRegistry();
    return ModelRegistry._instance;
  }

  private loaded = new Map<ModelId, AIModel>();
  private engine = EngineBridge.getInstance();

  private catalog: AIModel[] = [
    {
      id: 'style_cartoon_v1' as ModelId,
      name: 'Cartoon Style Transfer',
      version: '1.0.0',
      architecture: ModelArchitecture.CYCLEGAN,
      format: 'onnx',
      url: '/models/cartoon.onnx',
      size: 12_000_000,
      hash: 'abc123',
      metadata: {
        author: 'CyberHex',
        license: 'MIT',
        description: 'Real-time cartoon style transfer',
        tags: ['style', 'cartoon'],
        inputShape: [1, 256, 256, 3],
        outputShape: [1, 256, 256, 3],
        quantized: true,
        framework: 'onnx',
        createdAt: '2025-01-01',
      },
      status: ModelStatus.IDLE,
      performance: { avgInferenceMs: 18, p95InferenceMs: 28, peakMemoryMB: 128, avgMemoryMB: 96, operationsPerSec: 55, throughput: 55 },
    },
    {
      id: 'bg_segment_v2' as ModelId,
      name: 'U-Net Segmentation',
      version: '2.1.0',
      architecture: ModelArchitecture.UNET,
      format: 'onnx',
      url: '/models/segmentation.onnx',
      size: 8_500_000,
      hash: 'def456',
      metadata: {
        author: 'CyberHex',
        license: 'MIT',
        description: 'Background segmentation for blur/replace',
        tags: ['segmentation', 'background'],
        inputShape: [1, 512, 512, 3],
        outputShape: [1, 512, 512, 1],
        quantized: true,
        framework: 'onnx',
        createdAt: '2025-02-01',
      },
      status: ModelStatus.IDLE,
      performance: { avgInferenceMs: 22, p95InferenceMs: 35, peakMemoryMB: 256, avgMemoryMB: 180, operationsPerSec: 45, throughput: 45 },
    },
    {
      id: 'super_res_espcn' as ModelId,
      name: 'ESPCN Super Resolution',
      version: '1.2.0',
      architecture: ModelArchitecture.ESPCN,
      format: 'tfjs',
      url: '/models/espcn/model.json',
      size: 2_100_000,
      hash: 'ghi789',
      metadata: {
        author: 'CyberHex',
        license: 'Apache-2.0',
        description: '2x neural upscaling',
        tags: ['enhancement', 'super-resolution'],
        inputShape: [1, 128, 128, 3],
        outputShape: [1, 256, 256, 3],
        quantized: false,
        framework: 'tensorflow.js',
        createdAt: '2025-03-01',
      },
      status: ModelStatus.IDLE,
      performance: { avgInferenceMs: 12, p95InferenceMs: 20, peakMemoryMB: 64, avgMemoryMB: 48, operationsPerSec: 80, throughput: 80 },
    },
    {
      id: 'fluency_transformer' as ModelId,
      name: 'English Fluency Transformer',
      version: '0.9.0',
      architecture: ModelArchitecture.TRANSFORMER,
      format: 'onnx',
      url: '/models/fluency.onnx',
      size: 45_000_000,
      hash: 'jkl012',
      metadata: {
        author: 'CyberHex',
        license: 'MIT',
        description: 'Real-time grammar correction NLP',
        tags: ['nlp', 'fluency', 'speech'],
        inputShape: [1, 128],
        outputShape: [1, 128],
        quantized: true,
        framework: 'onnx',
        createdAt: '2025-04-01',
      },
      status: ModelStatus.IDLE,
      performance: { avgInferenceMs: 45, p95InferenceMs: 80, peakMemoryMB: 512, avgMemoryMB: 384, operationsPerSec: 22, throughput: 22 },
    },
  ];

  getCatalog(): AIModel[] {
    return [...this.catalog];
  }

  async loadModel(modelId: string): Promise<AIModel> {
    const model = this.catalog.find((m) => m.id === modelId);
    if (!model) throw new Error(`Model not found: ${modelId}`);

    await this.engine.loadModel({
      id: modelId,
      format: model.format,
      url: model.url,
      backend: model.format === 'onnx' ? 'onnxruntime' : 'tfjs',
    });

    const loaded = { ...model, status: ModelStatus.READY, loadedAt: Date.now() };
    this.loaded.set(model.id, loaded);
    return loaded;
  }

  unloadModel(modelId: ModelId): void {
    this.engine.unloadModel(modelId);
    this.loaded.delete(modelId);
  }

  getLoadedModels(): AIModel[] {
    return Array.from(this.loaded.values());
  }

  isLoaded(modelId: ModelId): boolean {
    return this.loaded.has(modelId);
  }
}
