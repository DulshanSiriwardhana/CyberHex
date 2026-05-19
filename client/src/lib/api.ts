const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  code: string;
  errors?: unknown[];

  constructor(status: number, message: string, code: string, errors?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

async function request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, params } = options;

  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), fetchOptions);

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
      const retryRes = await fetch(url.toString(), {
        ...fetchOptions,
        headers: { ...fetchOptions.headers as Record<string, string>, ...headers },
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(retryRes.status, err.message || err.error, err.code || 'ERROR', err.errors);
      }
      return retryRes.json();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new ApiError(401, 'Session expired', 'UNAUTHORIZED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, err.message || err.error, err.code || 'ERROR', err.errors);
  }

  return res.json();
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),
  put: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),
  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T = unknown>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export const otpApi = {
  sendOtp: (email: string) =>
    api.post<{ message: string; expiresIn: number; preview?: boolean }>('/api/v1/otp/send', { email }),

  verifyOtp: (email: string, code: string) =>
    api.post<{ message: string; verified: boolean }>('/api/v1/otp/verify', { email, code }),
};

export { ApiError };
export default api;

export interface Experiment {
  _id: string;
  userId: string;
  name: string;
  description: string;
  status: 'draft' | 'training' | 'completed' | 'failed' | 'stopped';
  config: ExperimentConfig;
  results?: ExperimentResults;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentConfig {
  task: 'regression' | 'classification';
  modelType: 'neural_network' | 'linear_regression' | 'decision_tree' | 'random_forest';
  layers: number[];
  activations: string[];
  loss: string;
  batchSize: number;
  epochs: number;
  learningRate: number;
  optimizer: string;
  validationSplit: number;
  earlyStopping: boolean;
  patience: number;
  dataPath: string | null;
  seed: number;
}

export interface ExperimentResults {
  bestTrainLoss?: number;
  bestValLoss?: number;
  finalTrainLoss?: number;
  finalValLoss?: number;
  epochs?: number[];
  trainLoss?: number[];
  valLoss?: number[];
  modelPath?: string;
  completedAt?: string;
}

export interface TrainingStatus {
  experimentId: string;
  status: string;
  metrics?: {
    epochs: number[];
    train_loss: number[];
    val_loss: number[];
    best_val_loss: number;
  };
  results?: ExperimentResults;
  startedAt?: string;
  trainingLogs?: unknown[];
}

export interface EngineInferenceResult {
  success: boolean;
  predictions: number[][];
  shape: number[];
  backend: string;
  latencyMs?: number;
}

export interface EngineExportResult {
  success: boolean;
  manifestPath: string;
  onnxPath: string;
  backend?: string;
}

export const engineApi = {
  health: () =>
    api.get<{ status: string; inference: string; features: string[] }>('/api/v1/engine/health'),

  inference: (body: { modelPath: string; features: number[][]; task?: string; modelId?: string }) =>
    api.post<EngineInferenceResult>('/api/v1/engine/inference', body),

  exportOnnx: (body: { weightsPrefix: string; onnxPath?: string; task?: string }) =>
    api.post<EngineExportResult>('/api/v1/engine/models/export', body),
};

export interface ActiveJob {
  experimentId: string;
  status: string;
  startedAt: string;
  currentEpoch: number;
}

export const experimentsApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ experiments: Experiment[]; pagination: { page: number; limit: number; total: number; pages: number } }>('/api/v1/experiments', params),

  get: (id: string) =>
    api.get<{ experiment: Experiment }>(`/api/v1/experiments/${id}`),

  create: (data: Partial<Experiment>) =>
    api.post<{ message: string; experiment: Experiment }>('/api/v1/experiments', data),

  update: (id: string, data: Partial<Experiment>) =>
    api.put<{ message: string; experiment: Experiment }>(`/api/v1/experiments/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/v1/experiments/${id}`),

  startTraining: (id: string) =>
    api.post<{ message: string; experimentId: string; jobId: string; status: string }>(`/api/v1/ml/experiments/${id}/train`),

  stopTraining: (id: string) =>
    api.post<{ message: string; experimentId: string; status: string }>(`/api/v1/ml/experiments/${id}/stop`),

  getTrainingStatus: (id: string) =>
    api.get<TrainingStatus>(`/api/v1/ml/experiments/${id}/status`),

  getTrainingLogs: (id: string) =>
    api.get<{ experimentId: string; logs: unknown[] }>(`/api/v1/ml/experiments/${id}/logs`),

  getModels: (id: string) =>
    api.get<{ experimentId: string; models: unknown[] }>(`/api/v1/ml/experiments/${id}/models`),

  getActiveJobs: () =>
    api.get<{ jobs: ActiveJob[] }>('/api/v1/ml/jobs/active'),
};