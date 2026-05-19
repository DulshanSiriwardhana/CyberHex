# CyberHex Studio — Architecture

Production-grade standalone frontend for the CyberHex Platform: a next-generation AI communication and neural rendering studio.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CyberHex Studio (React)                          │
├──────────────┬──────────────────┬──────────────────┬────────────────────┤
│  UI Layer    │  State (Zustand) │  Media Pipeline  │  AI Inference      │
│  StudioShell │  studioStore     │  NeuralPipeline  │  FilterEngine      │
│  Panels      │  Immer           │  WebRTC          │  AudioEngine       │
│  Node Editor │  Event Bus       │  MediaDevices    │  ModelRegistry     │
├──────────────┴──────────────────┴──────────────────┴────────────────────┤
│                    Workers (Comlink / Web Workers)                       │
│         inference.worker.ts  │  frameProcessor.worker.ts                 │
├─────────────────────────────────────────────────────────────────────────┤
│              EngineBridge ── WebSocket ── REST API                       │
│                    CyberHex C++ ML Engine (ONNX / TensorRT / CUDA)       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
studio/
├── electron/              # Desktop shell (Electron)
├── src/
│   ├── ai/
│   │   ├── audio/denoiser/   AudioEngine — fluency, denoise, mastering
│   │   ├── models/           ModelRegistry — ONNX/TF.js catalog
│   │   ├── training/         TrainingManager — fine-tuning workflows
│   │   └── video/filters/    FilterEngine — 14+ neural filters
│   ├── components/
│   │   ├── layout/           StudioShell, ResizablePanel
│   │   ├── panels/           Filter, Audio, Scene, Training, etc.
│   │   ├── stage/            VideoFeed — canvas neural rendering
│   │   └── ui/               Radix + Tailwind design system
│   ├── engine/
│   │   ├── gpu/              GPUManager — WebGPU/WebGL2
│   │   ├── pipeline/         NeuralPipeline — ring buffer, 30–60 FPS
│   │   ├── scene/            SceneManager — multi-scene workflow
│   │   ├── webrtc/           WebRTCManager
│   │   ├── plugin/           PluginManager
│   │   └── scheduler/        TaskScheduler
│   ├── hooks/                useMediaDevices, useNeuralPipeline, useStudioBootstrap
│   ├── media/                LayoutTemplates
│   ├── services/             WebSocketService, EngineBridge
│   ├── stores/               studioStore (Zustand)
│   ├── types/                Complete TypeScript domain model
│   ├── workers/              Off-thread inference & preprocessing
│   └── styles/               Glassmorphism / neural HUD CSS
├── Dockerfile
├── .github/workflows/ci.yml
└── vite.config.ts
```

## Video AI Pipeline

1. **Capture** — `getUserMedia` / `getDisplayMedia` via `useMediaDevices`
2. **Ring buffer** — `NeuralPipeline` with frame skipping under load
3. **Filter chain** — `FilterEngine.applyPipeline()` (CPU + TF.js/WebGPU path)
4. **Render** — `VideoFeed` canvas at 30 FPS target
5. **Optional offload** — Workers + `EngineBridge.infer()` for ONNX models

### Supported Filters

Cartoon, Anime, Pencil Sketch, Oil Painting, Cyberpunk, Background Blur/Replace, Edge Enhancement, Super Resolution, Face Relighting, Low Light, Motion Smoothing, Custom Style Transfer, AI Avatar.

## Audio AI Pipeline

1. **Capture** — microphone stream → `AudioContext`
2. **Stages** — denoiser, compressor, enhancer, isolator (graph nodes)
3. **Fluency AI** — Web Speech API + heuristic/transformer correction
4. **Output** — processed `MediaStreamDestination` + live subtitles

## English Fluency AI

- Speech-to-text via browser `SpeechRecognition`
- Real-time grammar correction (`AudioEngine._correctEnglish`)
- Subtitle generation with original vs corrected text
- Metrics: WPM, filler words, fluency/clarity scores
- Engine integration for transformer models via `fluency_transformer` ONNX

## Training System

- `TrainingPanel` — architecture selection, hyperparameters, loss charts
- `TrainingManager` — epoch simulation + WebSocket sync to C++ engine
- Dataset import, checkpoint export, GPU utilization metrics

## Multi-Layout System

8 layout templates: Zoom Grid/Speaker, Streamer, Presenter, Interview, Classroom, Podcast, AI Cinematic.

Scenes + workspace presets persisted in Zustand store (localForage-ready).

## Performance Strategy

| Technique | Implementation |
|-----------|----------------|
| GPU acceleration | WebGPU → WebGL2 → WASM → CPU fallback |
| Threading | Web Workers for inference & preprocessing |
| Frame skipping | Ring buffer utilisation > 80% |
| OffscreenCanvas | NeuralPipeline offscreen context |
| Batch inference | Tensor batching in GPUManager |
| Model cache | ModelRegistry max 3 hot models |

## Engine Integration

`EngineBridge` communicates with CyberHex C++ engine:

- **WebSocket** — streaming inference, training epochs, signaling
- **REST** — `/api/v1/engine/models/load`
- **Formats** — ONNX (primary), TF.js, TensorRT-ready architecture

## Security

- COOP/COEP headers for SharedArrayBuffer (vite dev server)
- Plugin sandboxing (`studioConfig.security.sandboxPlugins`)
- Optional media encryption
- No secrets in client bundle — `.env` for URLs only

## Deployment

```bash
# Web
yarn build && docker build -t cyberhex-studio .

# Desktop
yarn electron:build

# CI
.github/workflows/ci.yml — lint, type-check, test, build
```

## Future Roadmap

- [ ] MediaPipe hand/pose tracking integration
- [ ] Diffusion filter real-time distillation
- [ ] Shared memory bridge with native engine
- [ ] Multi-peer WebRTC rooms
- [ ] Cloud model registry + federated training
- [ ] TTS voice-preserving speech synthesis
