/**
 * CyberHex Studio — Main Application Store
 * Zustand + Immer — production-grade state management
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  FeedId,
  SceneId,
  PanelId,
  PluginId,
  ModelId,
  MediaFeed,
  Scene,
  PanelConfig,
  FilterAssignment,
  FilterPreset,
  AIModel,
  AudioPipeline,
  AudioEnhancer,
  TrainingSession,
  PerformanceMetrics,
  RTCPeer,
  Toast,
  Plugin,
  FilterConfig,
  FeedPosition,
  DockLayout,
  WorkspacePreset,
  TrainingConfig,
  DatasetConfig,
  StudioConfig,
  ConnectionState,
  ModelPerformance,
  FluencyConfig,
} from '@/types';
import {
  NeuralFilterType,
  LayoutTemplateType,
  GPUProvider,
  ViewMode,
  FluencyAction,
  ModelStatus,
} from '@/types';

/* ─── State Interface ────────────────── */

interface StudioState {
  /* Media */
  feeds: MediaFeed[];
  activeFeedId: FeedId | null;
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  microphoneStream: MediaStream | null;
  systemAudioStream: MediaStream | null;

  /* Scenes */
  scenes: Scene[];
  currentSceneId: SceneId | null;
  workspacePresets: WorkspacePreset[];

  /* Panels */
  panels: PanelConfig[];
  dockLayout: DockLayout;

  /* Neural Filters */
  filterPresets: FilterPreset[];
  activeFilterPipeline: Record<FeedId, FilterAssignment[]>;

  /* AI Models */
  models: Record<ModelId, AIModel>;
  loadedModels: ModelId[];

  /* Audio Pipeline */
  audioPipeline: AudioPipeline | null;
  fluencyConfig: FluencyConfig;

  /* Training */
  trainingSessions: Record<string, TrainingSession>;

  /* Performance */
  performance: PerformanceMetrics;
  gpuSupported: boolean;
  gpuReady: boolean;

  /* UI */
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  modal: string | null;
  toasts: Toast[];

  /* Connection */
  webrtcPeers: RTCPeer[];
  wsConnected: boolean;
  wsLatency: number;

  /* Plugins */
  plugins: Plugin[];
  studioConfig: StudioConfig;
}

/* ─── Action Interface ───────────────── */

interface StudioActions {
  /* Media */
  addFeed: (feed: Omit<MediaFeed, 'id'>) => FeedId;
  removeFeed: (id: FeedId) => void;
  updateFeedPosition: (id: FeedId, position: Partial<FeedPosition>) => void;
  setActiveFeed: (id: FeedId | null) => void;
  setWebcamStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  setMicrophoneStream: (stream: MediaStream | null) => void;
  muteFeed: (id: FeedId) => void;
  unmuteFeed: (id: FeedId) => void;

  /* Scenes */
  addScene: (scene: Omit<Scene, 'id'>) => SceneId;
  removeScene: (id: SceneId) => void;
  switchScene: (id: SceneId) => void;
  saveWorkspacePreset: (name: string) => void;
  loadWorkspacePreset: (presetId: string) => void;
  deleteWorkspacePreset: (presetId: string) => void;

  /* Panels */
  openPanel: (panel: Omit<PanelConfig, 'id'>) => PanelId;
  closePanel: (id: PanelId) => void;
  movePanel: (id: PanelId, position: { x: number; y: number }) => void;
  resizePanel: (id: PanelId, size: { width: number; height: number }) => void;
  setDockLayout: (layout: Partial<DockLayout>) => void;

  /* Neural Filters */
  setFilter: (feedId: FeedId, assignment: FilterAssignment) => void;
  removeFilter: (feedId: FeedId, filterType: NeuralFilterType) => void;
  updateFilterIntensity: (feedId: FeedId, filterType: NeuralFilterType, intensity: number) => void;
  saveFilterPreset: (preset: FilterPreset) => void;
  deleteFilterPreset: (presetId: string) => void;
  applyFilterPreset: (feedId: FeedId, presetId: string) => void;

  /* AI Models */
  loadModel: (model: AIModel) => void;
  unloadModel: (id: ModelId) => void;
  setModelStatus: (id: ModelId, status: ModelStatus, error?: string) => void;
  setModelPerformance: (id: ModelId, performance: ModelPerformance) => void;

  /* Audio */
  setAudioPipeline: (pipeline: AudioPipeline) => void;
  addAudioStage: (stage: AudioEnhancer) => void;
  removeAudioStage: (stageId: string) => void;
  updateFluencyConfig: (config: Partial<FluencyConfig>) => void;

  /* Training */
  startTraining: (session: Omit<TrainingSession, 'id'>) => string;
  updateEpoch: (sessionId: string, epochData: unknown) => void;
  endTraining: (sessionId: string, success: boolean) => void;

  /* Performance */
  updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
  setGpuStatus: (supported: boolean, ready: boolean) => void;

  /* UI */
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setModal: (modal: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;

  /* Connection */
  addRTCPeer: (peer: RTCPeer) => void;
  removeRTCPeer: (id: string) => void;
  setWsConnected: (connected: boolean, latency?: number) => void;

  /* Plugins */
  installPlugin: (plugin: Plugin) => void;
  activatePlugin: (id: PluginId) => void;
  deactivatePlugin: (id: PluginId) => void;
  removePlugin: (id: PluginId) => void;

  /* Studio */
  setStudioConfig: (config: Partial<StudioConfig>) => void;
  resetStudio: () => void;
}

/* ─── Default State ───────────────────── */

const defaultPerformance: PerformanceMetrics = {
  fps: 60,
  frameTimeMs: 16.67,
  pipelineLatency: {
    captureMs: 0,
    encodeMs: 0,
    transferMs: 0,
    processMs: 0,
    decodeMs: 0,
    renderMs: 0,
    totalMs: 0,
  },
  memory: { totalMB: 0, usedMB: 0, freeMB: 0, tensorMB: 0, textureMB: 0, bufferMB: 0 },
  gpu: {
    provider: GPUProvider.WEBGPU,
    vendor: '',
    renderer: '',
    maxTextureSize: 0,
    maxBufferSize: 0,
    computeSupported: false,
    utilization: 0,
    memoryUsedMB: 0,
    memoryTotalMB: 0,
    temperature: 0,
  },
  audio: { inputMs: 0, processMs: 0, outputMs: 0, totalMs: 0 },
  network: { rttMs: 0, jitterMs: 0, uploadMbps: 0, downloadMbps: 0 },
};

const defaultStudioConfig: StudioConfig = {
  theme: { mode: 'dark', accent: '#00f0ff', fontSize: 'medium', interfaceScale: 1, reducedMotion: false, highContrast: false },
  layout: { defaultViewMode: ViewMode.STUDIO, defaultTemplate: LayoutTemplateType.ZOOM_SPEAKER, autoSaveInterval: 300, enableAnimations: true },
  performance: { targetFPS: 60, maxResolution: { width: 1920, height: 1080 }, preferGPU: true, enableWorkers: true, frameSkipping: false, maxBatchSize: 4, modelCacheSize: 3 },
  security: { encryptMedia: false, sandboxPlugins: true, requireAuth: false, auditLogging: false },
  plugins: { enabled: true, autoUpdate: true, maxActive: 5, safelist: [] },
};

const initialState: StudioState = {
  feeds: [],
  activeFeedId: null,
  webcamStream: null,
  screenStream: null,
  microphoneStream: null,
  systemAudioStream: null,
  scenes: [],
  currentSceneId: null,
  workspacePresets: [],
  panels: [],
  dockLayout: { main: [], left: [], right: [], bottom: [], floating: [] },
  filterPresets: [],
  activeFilterPipeline: {},
  models: {} as Record<ModelId, AIModel>,
  loadedModels: [],
  audioPipeline: null,
  fluencyConfig: {
    enabled: false,
    mode: FluencyAction.CORRECTION,
    targetLanguage: 'en',
    preservePersonality: true,
    confidenceThreshold: 0.7,
    correctionStyle: 'balanced',
    synthesizeSpeech: false,
    generateSubtitles: true,
  },
  trainingSessions: {},
  performance: defaultPerformance,
  gpuSupported: false,
  gpuReady: false,
  theme: 'dark',
  sidebarOpen: true,
  commandPaletteOpen: false,
  modal: null,
  toasts: [],
  webrtcPeers: [],
  wsConnected: false,
  wsLatency: 0,
  plugins: [],
  studioConfig: defaultStudioConfig,
};

/* ─── Store ────────────────────────────── */

export const useStudioStore = create<StudioState & StudioActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      /* ── Media ── */
      addFeed: (feed) => {
        const id = uuid() as FeedId;
        set((s) => {
          s.feeds.push({ ...feed, id });
          if (!s.activeFeedId) s.activeFeedId = id;
        });
        return id;
      },
      removeFeed: (id) =>
        set((s) => {
          s.feeds = s.feeds.filter((f) => f.id !== id);
          delete s.activeFilterPipeline[id];
          if (s.activeFeedId === id) s.activeFeedId = s.feeds[0]?.id ?? null;
        }),
      updateFeedPosition: (id, pos) =>
        set((s) => {
          const feed = s.feeds.find((f) => f.id === id);
          if (feed) Object.assign(feed.position, pos);
        }),
      setActiveFeed: (id) => set((s) => { s.activeFeedId = id; }),
      setWebcamStream: (stream) => set((s) => { s.webcamStream = stream; }),
      setScreenStream: (stream) => set((s) => { s.screenStream = stream; }),
      setMicrophoneStream: (stream) => set((s) => { s.microphoneStream = stream; }),
      muteFeed: (id) => set((s) => { const f = s.feeds.find((x) => x.id === id); if (f) f.muted = true; }),
      unmuteFeed: (id) => set((s) => { const f = s.feeds.find((x) => x.id === id); if (f) f.muted = false; }),

      /* ── Scenes ── */
      addScene: (scene) => {
        const id = uuid() as SceneId;
        set((s) => {
          s.scenes.push({ ...scene, id });
          if (!s.currentSceneId) s.currentSceneId = id;
        });
        return id;
      },
      removeScene: (id) =>
        set((s) => {
          s.scenes = s.scenes.filter((sc) => sc.id !== id);
          if (s.currentSceneId === id) s.currentSceneId = s.scenes[0]?.id ?? null;
        }),
      switchScene: (id) => set((s) => { s.currentSceneId = id; }),
      saveWorkspacePreset: (name) =>
        set((s) => {
          s.workspacePresets.push({
            id: uuid(),
            name,
            scenes: [...s.scenes],
            panels: [...s.panels],
            dockLayout: { ...s.dockLayout },
            activeFilters: { ...s.activeFilterPipeline },
            createdAt: Date.now(),
          });
        }),
      loadWorkspacePreset: (presetId) =>
        set((s) => {
          const preset = s.workspacePresets.find((p) => p.id === presetId);
          if (!preset) return;
          s.scenes = preset.scenes;
          s.panels = preset.panels;
          s.dockLayout = preset.dockLayout;
          s.activeFilterPipeline = preset.activeFilters;
          s.currentSceneId = preset.scenes[0]?.id ?? null;
        }),
      deleteWorkspacePreset: (presetId) =>
        set((s) => { s.workspacePresets = s.workspacePresets.filter((p) => p.id !== presetId); }),

      /* ── Panels ── */
      openPanel: (panel) => {
        const id = uuid() as PanelId;
        set((s) => {
          s.panels.push({ ...panel, id });
          s.dockLayout.main.push(id);
        });
        return id;
      },
      closePanel: (id) =>
        set((s) => {
          s.panels = s.panels.filter((p) => p.id !== id);
          ['main', 'left', 'right', 'bottom', 'floating'].forEach((zone) => {
            (s.dockLayout as Record<string, PanelId[]>)[zone] = (s.dockLayout as Record<string, PanelId[]>)[zone].filter((pid) => pid !== id);
          });
        }),
      movePanel: (id, pos) =>
        set((s) => { const p = s.panels.find((x) => x.id === id); if (p) p.position = pos; }),
      resizePanel: (id, size) =>
        set((s) => { const p = s.panels.find((x) => x.id === id); if (p) p.size = size; }),
      setDockLayout: (layout) =>
        set((s) => { Object.assign(s.dockLayout, layout); }),

      /* ── Neural Filters ── */
      setFilter: (feedId, assignment) =>
        set((s) => {
          if (!s.activeFilterPipeline[feedId]) s.activeFilterPipeline[feedId] = [];
          const idx = s.activeFilterPipeline[feedId].findIndex((a) => a.filterType === assignment.filterType);
          if (idx >= 0) s.activeFilterPipeline[feedId][idx] = assignment;
          else s.activeFilterPipeline[feedId].push(assignment);
        }),
      removeFilter: (feedId, filterType) =>
        set((s) => {
          const arr = s.activeFilterPipeline[feedId];
          if (arr) s.activeFilterPipeline[feedId] = arr.filter((a) => a.filterType !== filterType);
        }),
      updateFilterIntensity: (feedId, filterType, intensity) =>
        set((s) => {
          const item = s.activeFilterPipeline[feedId]?.find((a) => a.filterType === filterType);
          if (item) item.intensity = Math.max(0, Math.min(1, intensity));
        }),
      saveFilterPreset: (preset) =>
        set((s) => { s.filterPresets.push(preset); }),
      deleteFilterPreset: (presetId) =>
        set((s) => { s.filterPresets = s.filterPresets.filter((p) => p.id !== presetId); }),
      applyFilterPreset: (feedId, presetId) =>
        set((s) => {
          const preset = s.filterPresets.find((p) => p.id === presetId);
          if (preset) s.activeFilterPipeline[feedId] = [...preset.filters];
        }),

      /* ── AI Models ── */
      loadModel: (model) =>
        set((s) => {
          s.models[model.id] = { ...model, status: model.status ?? ModelStatus.READY, loadedAt: model.loadedAt ?? Date.now() };
          if (!s.loadedModels.includes(model.id)) s.loadedModels.push(model.id);
        }),
      unloadModel: (id) =>
        set((s) => { if (s.models[id]) s.models[id].status = ModelStatus.UNLOADED; s.loadedModels = s.loadedModels.filter((mid) => mid !== id); }),
      setModelStatus: (id, status, error) =>
        set((s) => { if (s.models[id]) { s.models[id].status = status; if (error) s.models[id].error = error; } }),
      setModelPerformance: (id, perf) =>
        set((s) => { if (s.models[id]) s.models[id].performance = perf; }),

      /* ── Audio ── */
      setAudioPipeline: (pipeline) => set((s) => { s.audioPipeline = pipeline; }),
      addAudioStage: (stage) =>
        set((s) => { if (s.audioPipeline) s.audioPipeline.stages.push(stage); }),
      removeAudioStage: (stageId) =>
        set((s) => { if (s.audioPipeline) s.audioPipeline.stages = s.audioPipeline.stages.filter((st) => st.id !== stageId); }),
      updateFluencyConfig: (config) =>
        set((s) => { Object.assign(s.fluencyConfig, config); }),

      /* ── Training ── */
      startTraining: (session) => {
        const id = uuid();
        set((s) => { s.trainingSessions[id] = { ...session, id } as TrainingSession; });
        return id;
      },
      updateEpoch: (sessionId, epochData) =>
        set((s) => { if (s.trainingSessions[sessionId]) { Object.assign(s.trainingSessions[sessionId], epochData); } }),
      endTraining: (sessionId, success) =>
        set((s) => { if (s.trainingSessions[sessionId]) { s.trainingSessions[sessionId].status = success ? 'completed' : 'failed'; } }),

      /* ── Performance ── */
      updatePerformance: (metrics) =>
        set((s) => { Object.assign(s.performance, metrics); }),
      setGpuStatus: (supported, ready) =>
        set((s) => { s.gpuSupported = supported; s.gpuReady = ready; }),

      /* ── UI ── */
      toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen; }),
      openCommandPalette: () => set((s) => { s.commandPaletteOpen = true; }),
      closeCommandPalette: () => set((s) => { s.commandPaletteOpen = false; }),
      setModal: (modal) => set((s) => { s.modal = modal; }),
      addToast: (toast) => {
        const id = uuid();
        set((s) => { s.toasts.push({ ...toast, id }); });
        return id;
      },
      removeToast: (id) =>
        set((s) => { s.toasts = s.toasts.filter((t) => t.id !== id); }),

      /* ── Connection ── */
      addRTCPeer: (peer) =>
        set((s) => { s.webrtcPeers.push(peer); }),
      removeRTCPeer: (id) =>
        set((s) => { s.webrtcPeers = s.webrtcPeers.filter((p) => p.id !== id); }),
      setWsConnected: (connected, latency = 0) =>
        set((s) => { s.wsConnected = connected; s.wsLatency = latency; }),

      /* ── Plugins ── */
      installPlugin: (plugin) =>
        set((s) => { s.plugins.push(plugin); }),
      activatePlugin: (id) =>
        set((s) => { const p = s.plugins.find((x) => x.id === id); if (p) p.active = true; }),
      deactivatePlugin: (id) =>
        set((s) => { const p = s.plugins.find((x) => x.id === id); if (p) p.active = false; }),
      removePlugin: (id) =>
        set((s) => { s.plugins = s.plugins.filter((x) => x.id !== id); }),

      /* ── Studio Config ── */
      setStudioConfig: (config) =>
        set((s) => { Object.assign(s.studioConfig, config); }),

      /* ── Reset ── */
      resetStudio: () => set(() => ({ ...initialState })),
    })),
    { name: 'cyberhex-studio' }
  )
);