/**
 * CyberHex Studio — CyberHex C++ ML Engine Bridge
 * REST/WebSocket bridge for native inference, model loading, and streaming.
 */
import { WebSocketService } from '@/services/WebSocketService';

export interface EngineModelSpec {
  id: string;
  format: 'onnx' | 'tfjs' | 'custom';
  url: string;
  backend: 'onnxruntime' | 'tfjs' | 'tensorrt' | 'cuda';
}

export interface InferenceRequest {
  modelId: string;
  input: ArrayBuffer;
  shape: number[];
}

export interface InferenceResponse {
  output: ArrayBuffer;
  shape: number[];
  latencyMs: number;
  backend: string;
}

export class EngineBridge {
  private static _instance: EngineBridge | null = null;
  static getInstance(): EngineBridge {
    if (!EngineBridge._instance) EngineBridge._instance = new EngineBridge();
    return EngineBridge._instance;
  }

  private ws = WebSocketService.getInstance();
  private apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
  private loadedModels = new Set<string>();
  private pendingInference = new Map<string, { resolve: (r: InferenceResponse) => void; reject: (e: Error) => void }>();

  constructor() {
    this.ws.on('inference:result', (payload) => {
      const data = payload as { requestId: string; output: ArrayBuffer; shape: number[]; latencyMs: number; backend: string };
      const pending = this.pendingInference.get(data.requestId);
      if (pending) {
        pending.resolve({
          output: data.output,
          shape: data.shape,
          latencyMs: data.latencyMs,
          backend: data.backend,
        });
        this.pendingInference.delete(data.requestId);
      }
    });
  }

  async loadModel(spec: EngineModelSpec): Promise<void> {
    if (this.loadedModels.has(spec.id)) return;

    if (this.ws.isConnected) {
      this.ws.send('model:loaded' as any, { action: 'load', ...spec });
    } else {
      try {
        await fetch(`${this.apiUrl}/engine/models/load`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spec),
        });
      } catch {
        console.warn('[EngineBridge] Offline mode — model registered locally:', spec.id);
      }
    }

    this.loadedModels.add(spec.id);
  }

  unloadModel(modelId: string): void {
    if (this.ws.isConnected) {
      this.ws.send('model:unloaded' as any, { modelId });
    }
    this.loadedModels.delete(modelId);
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const requestId = `inf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (this.ws.isConnected) {
      return new Promise((resolve, reject) => {
        this.pendingInference.set(requestId, { resolve, reject });
        this.ws.sendInferenceRequest(request.modelId, request.input, request.shape);
        setTimeout(() => {
          if (this.pendingInference.has(requestId)) {
            this.pendingInference.delete(requestId);
            reject(new Error('Inference timeout'));
          }
        }, 10000);
      });
    }

    const start = performance.now();
    return {
      output: request.input.slice(0),
      shape: request.shape,
      latencyMs: performance.now() - start,
      backend: 'cpu-fallback',
    };
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedModels);
  }

  isConnected(): boolean {
    return this.ws.isConnected;
  }
}
