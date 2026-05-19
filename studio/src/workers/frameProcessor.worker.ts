/**
 * CyberHex Studio — Frame Preprocessing Worker
 * OffscreenCanvas-compatible frame extraction and batching.
 */
import { WorkerMessageType } from '@/types';

interface PreprocessMessage {
  id: string;
  type: WorkerMessageType.PREPROCESS_FRAME;
  payload: {
    buffer: ArrayBuffer;
    width: number;
    height: number;
    normalize: boolean;
  };
}

self.onmessage = (event: MessageEvent<PreprocessMessage>) => {
  const { id, payload } = event.data;
  const start = performance.now();
  const { buffer, width, height, normalize } = payload;
  const pixels = new Uint8ClampedArray(buffer);

  if (normalize) {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = (pixels[i] / 255) * 255;
      pixels[i + 1] = (pixels[i + 1] / 255) * 255;
      pixels[i + 2] = (pixels[i + 2] / 255) * 255;
    }
  }

  self.postMessage(
    {
      id,
      type: WorkerMessageType.ENCODE_RESULT,
      timestamp: Date.now(),
      payload: {
        buffer: pixels.buffer,
        width,
        height,
        latencyMs: performance.now() - start,
      },
    },
    [pixels.buffer]
  );
};

export {};
