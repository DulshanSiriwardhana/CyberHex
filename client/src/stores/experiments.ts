import { create } from 'zustand';
import { experimentsApi, Experiment, TrainingStatus, ActiveJob } from '../lib/api';

interface ExperimentsState {
  experiments: Experiment[];
  activeJobs: ActiveJob[];
  pagination: { page: number; limit: number; total: number; pages: number };
  loading: boolean;
  error: string | null;
  currentExperiment: Experiment | null;
  trainingStatus: TrainingStatus | null;

  fetchExperiments: (params?: Record<string, string>) => Promise<void>;
  fetchExperiment: (id: string) => Promise<void>;
  createExperiment: (data: Partial<Experiment>) => Promise<Experiment>;
  updateExperiment: (id: string, data: Partial<Experiment>) => Promise<void>;
  deleteExperiment: (id: string) => Promise<void>;
  startTraining: (id: string) => Promise<void>;
  stopTraining: (id: string) => Promise<void>;
  fetchTrainingStatus: (id: string) => Promise<void>;
  fetchActiveJobs: () => Promise<void>;
  clearError: () => void;
}

export const useExperimentsStore = create<ExperimentsState>((set, get) => ({
  experiments: [],
  activeJobs: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  currentExperiment: null,
  trainingStatus: null,

  fetchExperiments: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await experimentsApi.list(params);
      set({ experiments: data.experiments, pagination: data.pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchExperiment: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await experimentsApi.get(id);
      set({ currentExperiment: data.experiment, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createExperiment: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await experimentsApi.create(data);
      set((state) => ({ experiments: [result.experiment, ...state.experiments], loading: false }));
      return result.experiment;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateExperiment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const result = await experimentsApi.update(id, data);
      set((state) => ({
        experiments: state.experiments.map((e) => (e._id === id ? result.experiment : e)),
        currentExperiment: state.currentExperiment?._id === id ? result.experiment : state.currentExperiment,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteExperiment: async (id) => {
    set({ loading: true, error: null });
    try {
      await experimentsApi.delete(id);
      set((state) => ({
        experiments: state.experiments.filter((e) => e._id !== id),
        currentExperiment: state.currentExperiment?._id === id ? null : state.currentExperiment,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  startTraining: async (id) => {
    set({ loading: true, error: null });
    try {
      await experimentsApi.startTraining(id);
      set((state) => ({
        experiments: state.experiments.map((e) => (e._id === id ? { ...e, status: 'training' as const } : e)),
        loading: false,
      }));
      get().fetchActiveJobs();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  stopTraining: async (id) => {
    set({ loading: true, error: null });
    try {
      await experimentsApi.stopTraining(id);
      set((state) => ({
        experiments: state.experiments.map((e) => (e._id === id ? { ...e, status: 'stopped' as const } : e)),
        loading: false,
      }));
      get().fetchActiveJobs();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTrainingStatus: async (id) => {
    try {
      const data = await experimentsApi.getTrainingStatus(id);
      set({ trainingStatus: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchActiveJobs: async () => {
    try {
      const data = await experimentsApi.getActiveJobs();
      set({ activeJobs: data.jobs });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null }),
}));