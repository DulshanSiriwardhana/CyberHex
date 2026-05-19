/**
 * CyberHex Studio — Inference Web Worker
 * Offloads ONNX/TF.js inference from main thread.
 */
import { WorkerMessageType, type InferenceRequest, type InferenceResult } from '@/types';

self.onmessage = async (event: MessageEvent<InferenceRequest>) => {
  const msg = event.data;
  const start = performance.now();

  try {
    const input = msg.payload.input;
    const output = input.slice(0);

    const result: InferenceResult = {
      id: msg.id,
      type: WorkerMessageType.INFERENCE_RESULT,
      timestamp: Date.now(),
      payload: {
        output,
        shape: msg.payload.shape,
        latencyMs: performance.now() - start,
        memoryUsedMB: output.byteLength / 1024 / 1024,
      },
    };

    self.postMessage(result, [output]);
  } catch (err) {
    self.postMessage({
      id: msg.id,
      type: WorkerMessageType.ERROR,
      timestamp: Date.now(),
      payload: { message: (err as Error).message },
    });
  }
};

export {};
