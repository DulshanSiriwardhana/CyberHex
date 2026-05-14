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

interface ExperimentsStore {
  experiments: Experiment[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  remove: (id: string) => void;
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
  remove: (id) =>
    set((s) => ({ experiments: s.experiments.filter((e) => e._id !== id) })),
}));