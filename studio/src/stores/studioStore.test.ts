import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './studioStore';
import { ModelStatus, ModelArchitecture, type ModelId } from '@/types';

describe('studioStore', () => {
  beforeEach(() => {
    useStudioStore.getState().resetStudio();
  });

  it('deduplicates loaded models', () => {
    const model = {
      id: 'test_model' as ModelId,
      name: 'Test',
      version: '1',
      architecture: ModelArchitecture.CUSTOM,
      format: 'onnx' as const,
      url: '/m.onnx',
      size: 1,
      hash: 'x',
      metadata: {
        author: 't',
        license: 'MIT',
        description: '',
        tags: [],
        inputShape: [],
        outputShape: [],
        quantized: false,
        framework: 'onnx',
        createdAt: '',
      },
      status: ModelStatus.READY,
      performance: {
        avgInferenceMs: 1,
        p95InferenceMs: 1,
        peakMemoryMB: 1,
        avgMemoryMB: 1,
        operationsPerSec: 1,
        throughput: 1,
      },
    };

    useStudioStore.getState().loadModel(model);
    useStudioStore.getState().loadModel(model);

    expect(useStudioStore.getState().loadedModels.filter((id) => id === model.id)).toHaveLength(1);
  });
});
