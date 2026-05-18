/**
 * CyberHex Studio — Complete TypeScript Type Definitions
 * AI-Powered Neural Communication & Rendering Platform
 * @module @studio/types
 */

/* ─── Identifiers ─────────────────────────────────────── */
export type FeedId = string & { readonly __brand: 'FeedId' };
export type SceneId = string & { readonly __brand: 'SceneId' };
export type PanelId = string & { readonly __brand: 'PanelId' };
export type PluginId = string & { readonly __brand: 'PluginId' };
export type ModelId = string & { readonly __brand: 'ModelId' };
export type TrainingId = string & { readonly __brand: 'TrainingId' };
export type StageId = string & { readonly __brand: 'StageId' };
export type TextureId = string & { readonly __brand: 'TextureId' };
export type BufferId = string & { readonly __brand: 'BufferId' };

/* ─── Enums ──────────────────────────────────────────── */

/** Neural filter categories */
export enum NeuralFilterType {
  CARTOON = 'cartoon',
  ANIME = 'anime',
  PENCIL_SKETCH = 'pencil_sketch',
  OIL_PAINTING = 'oil_painting',
  CYBERPUNK = 'cyberpunk',
  BACKGROUND_BLUR = 'background_blur',
  BACKGROUND_REPLACEMENT = 'background_replacement',
  DEPTH_ESTIMATION = 'depth_estimation',
  EDGE_ENHANCEMENT = 'edge_enhancement',
  SUPER_RESOLUTION = 'super_resolution',
  FACE_RELIGHTING = 'face_relighting',
  LOW_LIGHT = 'low_light',
  MOTION_SMOOTHING = 'motion_smoothing',
  CUSTOM_STYLE_TRANSFER = 'custom_style_transfer',
  AI_AVATAR = 'ai_avatar',
}

export enum FilterCategory {
  ARTISTIC = 'artistic',
  ENHANCEMENT = 'enhancement',
  SEGMENTATION = 'segmentation',
  STYLE_TRANSFER = 'style_transfer',
  AVATAR = 'avatar',
  CUSTOM = 'custom',
}

export enum ModelArchitecture {
  UNET = 'unet',
  RESNET = 'resnet',
  MOBILENET = 'mobilenet',
  EFFICIENTNET = 'efficientnet',
  ESPCN = 'espcn',
  CYCLEGAN = 'cyclegan',
  PIX2PIX = 'pix2pix',
  TRANSFORMER = 'transformer',
  DIFFUSION = 'diffusion',
  CUSTOM = 'custom',
  VIT = 'vit',
}

export enum ModelStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  RUNNING = 'running',
  ERROR = 'error',
  UNLOADED = 'unloaded',
}

export enum AudioFilterType {
  DENOISER = 'denoiser',
  COMPRESSOR = 'compressor',
  ECHO_CANCEL = 'echo_cancel',
  ISOLATOR = 'isolator',
  ENHANCER = 'enhancer',
  MASTERING = 'mastering',
  BREATH_SUPPRESS = 'breath_suppress',
  LOUDNESS_BALANCER = 'loudness_balancer',
}

export enum FluencyAction {
  CORRECTION = 'correction',
  ENHANCEMENT = 'enhancement',
  TRANSLATION = 'translation',
  SUBTITLES = 'subtitles',
  SYNTHESIS = 'synthesis',
}

export enum EmotionType {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  SURPRISED = 'surprised',
  FEARFUL = 'fearful',
  DISGUSTED = 'disgusted',
  CONFUSED = 'confused',
  CONFIDENT = 'confident',
  NERVOUS = 'nervous',
}

export enum GestureType {
  THUMBS_UP = 'thumbs_up',
  PEACE = 'peace',
  OK = 'ok',
  POINT = 'point',
  OPEN_PALM = 'open_palm',
  FIST = 'fist',
  WAVE = 'wave',
  PINCH = 'pinch',
  NONE = 'none',
}

export enum LayoutTemplateType {
  ZOOM_GRID = 'zoom_grid',
  ZOOM_SPEAKER = 'zoom_speaker',
  STREAMER = 'streamer',
  PRESENTER = 'presenter',
  INTERVIEW = 'interview',
  CLASSROOM = 'classroom',
  PODCAST = 'podcast',
  CINEMATIC = 'cinematic',
  CUSTOM = 'custom',
}

export enum GPUProvider {
  WEBGPU = 'webgpu',
  WEBGL2 = 'webgl2',
  WEBGL1 = 'webgl1',
  CPU = 'cpu',
  WASM = 'wasm',
}

export enum TextureFormat {
  RGBA8 = 'rgba8',
  RGBA16F = 'rgba16f',
  RGBA32F = 'rgba32f',
  BGRA8 = 'bgra8',
  R8 = 'r8',
}

/* ─── Media Types ────────────────────────────────────── */

export interface VideoSource {
  deviceId: string;
  label: string;
  groupId: string;
  kind: 'videoinput';
  capabilities: MediaTrackCapabilities;
}

export interface AudioSource {
  deviceId: string;
  label: string;
  groupId: string;
  kind: 'audioinput';
  capabilities: MediaTrackCapabilities;
}

export interface ScreenSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string;
  displayId?: string;
}

export interface FeedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
}

export interface FeedLayout {
  opacity: number;
  borderRadius: number;
  mirrored: boolean;
  fit: 'cover' | 'contain' | 'fill';
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
}

export interface MediaFeed {
  id: FeedId;
  type: 'webcam' | 'screen' | 'media' | 'avatar';
  sourceId: string;
  stream: MediaStream | null;
  position: FeedPosition;
  layout: FeedLayout;
  activeFilters: FilterAssignment[];
  muted: boolean;
  pinned: boolean;
  label: string;
  enabled: boolean;
}

export interface FilterAssignment {
  filterType: NeuralFilterType;
  intensity: number;
  config: FilterConfig;
  order: number;
}

/* ─── Filter Configuration ────────────────────────────── */

export interface FilterConfig {
  type: NeuralFilterType;
  intensity: number;
  enabled: boolean;
  params: Record<string, number | boolean | string | number[]>;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  category: FilterCategory;
  filters: FilterAssignment[];
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FilterPipeline {
  id: string;
  name: string;
  stages: FilterStage[];
  defaultConfig?: FilterConfig;
}

export interface FilterStage {
  filterType: NeuralFilterType;
  config: FilterConfig;
  enabled: boolean;
}

/* ─── AI Models ──────────────────────────────────────── */

export interface AIModel {
  id: ModelId;
  name: string;
  version: string;
  architecture: ModelArchitecture;
  format: 'tfjs' | 'onnx' | 'custom';
  url: string;
  size: number;
  hash: string;
  metadata: ModelMetadata;
  status: ModelStatus;
  performance: ModelPerformance;
  loadedAt?: number;
  error?: string;
}

export interface ModelMetadata {
  author: string;
  license: string;
  description: string;
  tags: string[];
  inputShape: number[];
  outputShape: number[];
  trainingDataset?: string;
  epochs?: number;
  accuracy?: number;
  quantized: boolean;
  framework: string;
  createdAt: string;
}

export interface ModelPerformance {
  avgInferenceMs: number;
  p95InferenceMs: number;
  peakMemoryMB: number;
  avgMemoryMB: number;
  operationsPerSec: number;
  throughput: number;
}

export interface ModelRegistry {
  models: Map<ModelId, AIModel>;
  activeModels: ModelId[];
  maxModels: number;
  totalMemoryMB: number;
  availableMemoryMB: number;
}

/* ─── Video AI ────────────────────────────────────────── */

export interface VideoFilter {
  id: string;
  type: NeuralFilterType;
  name: string;
  enabled: boolean;
  intensity: number;
  config: FilterConfig;
  performance: { avgMs: number; fps: number };
}

export interface SegmentationConfig {
  model: string;
  threshold: number;
  refineEdges: boolean;
  maskOnly: boolean;
}

export interface BackgroundConfig {
  type: 'blur' | 'image' | 'color' | 'video';
  blurRadius: number;
  imageUrl?: string;
  color?: string;
  videoUrl?: string;
}

export interface DepthConfig {
  model: string;
  minDepth: number;
  maxDepth: number;
  visualise: boolean;
}

export interface SuperResolutionConfig {
  scale: 2 | 3 | 4;
  model: string;
  sharpening: number;
}

export interface RelightConfig {
  lightDirection: { x: number; y: number; z: number };
  lightColor: string;
  ambientIntensity: number;
  specularIntensity: number;
}

export interface AvatarConfig {
  model: string;
  style: 'realistic' | 'anime' | 'cartoon' | 'custom';
  tracking: 'full_body' | 'face_only' | 'upper_body';
  background: 'transparent' | 'custom' | 'original';
}

export interface FaceTrackingData {
  landmarks: Float32Array | number[][];
  rotation: { x: number; y: number; z: number };
  translation: { x: number; y: number; z: number };
  expressions: Record<EmotionType, number>;
}

/* ─── Audio AI ────────────────────────────────────────── */

export interface AudioEnhancer {
  id: string;
  type: AudioFilterType;
  name: string;
  enabled: boolean;
  params: Record<string, number | boolean>;
  node: AudioNode | null;
}

export interface DenoiserConfig {
  model: string;
  threshold: number;
  aggressiveness: number;
  spectralSubtraction: boolean;
}

export interface CompressorConfig {
  threshold: number;
  ratio: number;
  attackMs: number;
  releaseMs: number;
  knee: number;
  makeupGain: number;
}

export interface IsolatorConfig {
  model: string;
  sourceType: 'voice' | 'music' | 'ambient';
  quality: 'fast' | 'balanced' | 'high';
}

export interface AudioPipeline {
  id: string;
  name: string;
  stages: AudioEnhancer[];
  bypass: boolean;
  solo: boolean;
  gain: number;
}

export interface AudioMetrics {
  rms: number;
  peak: number;
  snr: number;
  latencyMs: number;
  noiseLevel: number;
  voiceActivity: number;
  confidence: number;
}

/* ─── English Fluency AI ──────────────────────────────── */

export interface FluencyConfig {
  enabled: boolean;
  mode: FluencyAction;
  targetLanguage: string;
  preservePersonality: boolean;
  confidenceThreshold: number;
  correctionStyle: 'minimal' | 'balanced' | 'strict';
  synthesizeSpeech: boolean;
  generateSubtitles: boolean;
}

export interface GrammarError {
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency';
  original: string;
  correction: string;
  confidence: number;
  position: { start: number; end: number };
  explanation?: string;
}

export interface SpeechToken {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  isInterim: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  original: string;
  corrected: string;
  startTime: number;
  endTime: number;
  confidence: number;
  errors: GrammarError[];
  sentiment: EmotionType;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  corrections: GrammarError[];
  confidence: number;
  latencyMs: number;
  alternativeCorrections: string[];
}

export interface FluencyMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  grammarErrorsPerMinute: number;
  vocabularyRichness: number;
  confidenceScore: number;
  fluencyScore: number;
  clarityScore: number;
}

/* ─── Training System ─────────────────────────────────── */

export interface TrainingConfig {
  modelArchitecture: ModelArchitecture;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adamw';
  lossFunction: string;
  validationSplit: number;
  earlyStopping: { patience: number; minDelta: number };
  augmentation: boolean;
  mixedPrecision: boolean;
}

export interface TrainingSession {
  id: TrainingId;
  modelName: string;
  config: TrainingConfig;
  dataset: DatasetConfig;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  startedAt: number;
  currentEpoch: number;
  totalEpochs: number;
  metrics: TrainingMetrics;
  checkpoints: string[];
}

export interface EpochData {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  durationMs: number;
  learningRate: number;
}

export interface LossData {
  step: number;
  loss: number;
  accuracy: number;
  timestamp: number;
}

export interface DatasetConfig {
  name: string;
  totalSamples: number;
  trainSamples: number;
  valSamples: number;
  testSamples: number;
  inputShape: number[];
  classes: string[];
  augmentation: string[];
  format: string;
}

export interface DatasetSample {
  id: string;
  input: string;
  label: string;
  split: 'train' | 'val' | 'test';
  metadata: Record<string, unknown>;
}

export interface TrainingMetrics {
  bestLoss: number;
  bestAccuracy: number;
  totalTime: number;
  epochsPerSecond: number;
  gpuUtilization: number;
  memoryUsageMB: number;
  lossHistory: LossData[];
  epochs: EpochData[];
}

/* ─── Scene System ────────────────────────────────────── */

export interface Scene {
  id: SceneId;
  name: string;
  layout: SceneLayout;
  template: LayoutTemplateType;
  feeds: FeedId[];
  order: number;
  thumbnail?: string;
  transition?: SceneTransition;
}

export interface SceneLayout {
  width: number;
  height: number;
  gridCols: number;
  gridRows: number;
  gap: number;
  padding: number;
  background: string;
  overlays: LayoutOverlay[];
}

export interface LayoutOverlay {
  id: string;
  type: 'text' | 'image' | 'web' | 'clock';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
}

export interface SceneTransition {
  type: 'cut' | 'fade' | 'slide' | 'zoom' | 'wipe';
  durationMs: number;
  easing: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  type: LayoutTemplateType;
  thumbnail: string;
  gridCols: number;
  gridRows: number;
  defaultPositions: Record<string, FeedPosition>;
}

export interface WorkspacePreset {
  id: string;
  name: string;
  scenes: Scene[];
  panels: PanelConfig[];
  dockLayout: DockLayout;
  activeFilters: Record<FeedId, FilterAssignment[]>;
  createdAt: number;
}

/* ─── Panel / Docking System ──────────────────────────── */

export interface PanelConfig {
  id: PanelId;
  type: string;
  label: string;
  icon?: string;
  position: PanelPosition;
  size: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  docked: DockLocation;
  visible: boolean;
  maximized: boolean;
  floating: boolean;
}

export interface PanelPosition {
  x: number;
  y: number;
}

export interface DockLayout {
  main: PanelId[];
  left: PanelId[];
  right: PanelId[];
  bottom: PanelId[];
  floating: PanelId[];
}

export enum DockLocation {
  MAIN = 'main',
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  FLOATING = 'floating',
}

export enum ViewMode {
  STUDIO = 'studio',
  TRAINING = 'training',
  NODE_EDITOR = 'node_editor',
  PERFORMANCE = 'performance',
  SETTINGS = 'settings',
}

/* ─── WebRTC ──────────────────────────────────────────── */

export interface RTCConfig {
  iceServers: RTCIceServer[];
  maxBitrate: number;
  codec: 'vp9' | 'h264' | 'av1';
  encryption: boolean;
  simulcast: boolean;
  scalableVideoCoding: boolean;
}

export interface RTCPeer {
  id: string;
  connection: RTCPeerConnection;
  state: ConnectionState;
  streams: RTCStream[];
  stats: RTCStats;
}

export interface RTCStream {
  id: string;
  kind: 'video' | 'audio';
  track: MediaStreamTrack;
  quality: 'low' | 'medium' | 'high';
  bitrate: number;
}

export enum ConnectionState {
  NEW = 'new',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  CLOSED = 'closed',
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'bye' | 'chat';
  from: string;
  to: string;
  payload: unknown;
  timestamp: number;
}

export interface RTCStats {
  bytesSent: number;
  bytesReceived: number;
  packetsLost: number;
  roundTripTime: number;
  jitter: number;
  frameRate: number;
  resolution: string;
}

/* ─── Performance ─────────────────────────────────────── */

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  pipelineLatency: PipelineLatency;
  memory: MemoryUsage;
  gpu: GPUInfo;
  audio: AudioLatency;
  network: NetworkLatency;
}

export interface GPUInfo {
  provider: GPUProvider;
  vendor: string;
  renderer: string;
  maxTextureSize: number;
  maxBufferSize: number;
  computeSupported: boolean;
  utilization: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  temperature: number;
}

export interface FrameTiming {
  timestamp: number;
  captureMs: number;
  preprocessMs: number;
  inferenceMs: number;
  postprocessMs: number;
  renderMs: number;
  totalMs: number;
  dropped: boolean;
}

export interface PipelineLatency {
  captureMs: number;
  encodeMs: number;
  transferMs: number;
  processMs: number;
  decodeMs: number;
  renderMs: number;
  totalMs: number;
}

export interface MemoryUsage {
  totalMB: number;
  usedMB: number;
  freeMB: number;
  tensorMB: number;
  textureMB: number;
  bufferMB: number;
}

export interface AudioLatency {
  inputMs: number;
  processMs: number;
  outputMs: number;
  totalMs: number;
}

export interface NetworkLatency {
  rttMs: number;
  jitterMs: number;
  uploadMbps: number;
  downloadMbps: number;
}

export interface BenchmarkResult {
  name: string;
  provider: GPUProvider;
  batchSize: number;
  iterations: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  throughput: number;
  memoryMB: number;
}

/* ─── Plugins ─────────────────────────────────────────── */

export interface Plugin {
  id: PluginId;
  manifest: PluginManifest;
  hooks: PluginHook[];
  active: boolean;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  permissions: PluginPermission[];
  icon: string;
}

export enum PluginPermission {
  MEDIA = 'media',
  GPU = 'gpu',
  NETWORK = 'network',
  STORAGE = 'storage',
  PIPELINE = 'pipeline',
  SCENE = 'scene',
  AUDIO = 'audio',
}

export interface PluginHook {
  event: PluginEvent;
  handler: string;
  priority: number;
}

export enum PluginEvent {
  FRAME_BEFORE = 'frame:before',
  FRAME_AFTER = 'frame:after',
  AUDIO_BEFORE = 'audio:before',
  AUDIO_AFTER = 'audio:after',
  SCENE_SWITCH = 'scene:switch',
  FILTER_APPLY = 'filter:apply',
  MODEL_LOADED = 'model:loaded',
}

export interface PluginAPI {
  registerFilter: (filter: FilterPipeline) => void;
  getActiveFeed: () => MediaFeed | null;
  getGPUManager: () => unknown;
  getAudioContext: () => AudioContext | null;
  addPanel: (config: PanelConfig) => void;
  emitEvent: (event: string, data: unknown) => void;
}

/* ─── AI Avatar ────────────────────────────────────────── */

export interface AvatarPose {
  landmarks: number[][];
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  confidence: number;
}

export interface GestureData {
  type: GestureType;
  confidence: number;
  hand: 'left' | 'right';
  position: { x: number; y: number; z: number };
}

export interface EmotionData {
  dominant: EmotionType;
  scores: Record<EmotionType, number>;
  attention: number;
  fatigue: number;
  engagement: number;
}

/* ─── Studio Configuration ────────────────────────────── */

export interface StudioConfig {
  theme: ThemeConfig;
  layout: LayoutConfig;
  performance: PerformanceConfig;
  security: SecurityConfig;
  plugins: PluginConfig;
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'system';
  accent: string;
  fontSize: 'small' | 'medium' | 'large';
  interfaceScale: number;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface LayoutConfig {
  defaultViewMode: ViewMode;
  defaultTemplate: LayoutTemplateType;
  autoSaveInterval: number;
  enableAnimations: boolean;
}

export interface PerformanceConfig {
  targetFPS: number;
  maxResolution: { width: number; height: number };
  preferGPU: boolean;
  enableWorkers: boolean;
  frameSkipping: boolean;
  maxBatchSize: number;
  modelCacheSize: number;
}

export interface SecurityConfig {
  encryptMedia: boolean;
  sandboxPlugins: boolean;
  requireAuth: boolean;
  auditLogging: boolean;
}

export interface PluginConfig {
  enabled: boolean;
  autoUpdate: boolean;
  maxActive: number;
  safelist: string[];
}

/* ─── Keyboard Shortcuts ──────────────────────────────── */

export interface KeyboardShortcut {
  id: string;
  keys: string;
  description: string;
  category: string;
  action: () => void;
  global: boolean;
}

/* ─── Toast / Notifications ───────────────────────────── */

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  dismissible: boolean;
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

/* ─── Event Bus ───────────────────────────────────────── */

export enum StudioEvent {
  FRAME_PROCESSED = 'frame:processed',
  FILTER_CHANGED = 'filter:changed',
  SCENE_SWITCHED = 'scene:switched',
  MODEL_STATE_CHANGE = 'model:state:change',
  AUDIO_PROCESSED = 'audio:processed',
  PERFORMANCE_UPDATE = 'perf:update',
  ERROR = 'error',
  FEED_ADDED = 'feed:added',
  FEED_REMOVED = 'feed:removed',
  CONNECTION_CHANGE = 'connection:change',
  PLUGIN_EVENT = 'plugin:event',
  TRAINING_UPDATE = 'training:update',
  FLUENCY_RESULT = 'fluency:result',
}

export interface StudioEventData {
  event: StudioEvent;
  timestamp: number;
  payload: unknown;
  source?: string;
}

/* ─── Worker Messages ─────────────────────────────────── */

export enum WorkerMessageType {
  INFERENCE_REQUEST = 'inference:request',
  INFERENCE_RESULT = 'inference:result',
  TRAINING_EPOCH = 'training:epoch',
  TRAINING_COMPLETE = 'training:complete',
  PREPROCESS_FRAME = 'preprocess:frame',
  ENCODE_RESULT = 'encode:result',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
}

export interface WorkerMessage {
  id: string;
  type: WorkerMessageType;
  payload: unknown;
  timestamp: number;
  transfer?: Transferable[];
}

export interface InferenceRequest extends WorkerMessage {
  type: WorkerMessageType.INFERENCE_REQUEST;
  payload: {
    modelId: ModelId;
    input: ArrayBuffer;
    shape: number[];
    config: Record<string, unknown>;
  };
}

export interface InferenceResult extends WorkerMessage {
  type: WorkerMessageType.INFERENCE_RESULT;
  payload: {
    output: ArrayBuffer;
    shape: number[];
    latencyMs: number;
    memoryUsedMB: number;
  };
}

/* ─── Utility Types ───────────────────────────────────── */

export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export interface Dimensions {
  width: number;
  height: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}