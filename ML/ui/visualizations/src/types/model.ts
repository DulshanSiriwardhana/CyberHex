export interface LayerInfo {
  layerType: string;
  inputShape: number;
  outputShape: number;
  weights: number[][];
  bias: number[];
}

export interface NetworkArchitecture {
  layers: LayerInfo[];
  totalParams: number;
  inputSize: number;
  outputSize: number;
}

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';