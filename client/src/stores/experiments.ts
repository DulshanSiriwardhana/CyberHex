import { create } from 'zustand';
import { api } from '@/lib/api';

interface Experiment {
  _id: string;
  name: string;
  status: string;
  config: any;
  lastMetrics: any;
  createdAt: string;
}

interface CreateExperimentPayload {
  name: string
  config: {
    layers?: Array<{ units: number; activation: string }>
    batchSize?: number
    epochs?: number
    learningRate?: number
    optimizer?: string
  }
}

interface ExperimentsStore {
  experiments: Experiment[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: CreateExperimentPayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useExperimentsStore = create<ExperimentsStore>((set) => ({
  experiments: [],
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.experiments.list();
      set({ experiments: data.data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  create: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.experiments.create(payload);
      // Optimistic: add a temporary experiment to the list
      set((s) => ({
        experiments: [{
          _id: Date.now().toString(),
          name: payload.name,
          status: 'queued',
          config: payload.config,
          lastMetrics: null,
          createdAt: new Date().toISOString(),
        }, ...s.experiments],
        loading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.experiments.delete(id);
      set((s) => ({ experiments: s.experiments.filter((e) => e._id !== id), loading: false }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
