# CyberHex Studio

**AI-Powered Neural Communication & Rendering Platform**

A standalone frontend application combining Zoom, OBS Studio, NVIDIA Broadcast, RunwayML, and real-time neural rendering — built for the CyberHex C++ ML engine.

![CyberHex Studio](https://img.shields.io/badge/CyberHex-Studio-00f0ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square)
![WebGPU](https://img.shields.io/badge/WebGPU-Ready-76B900?style=flat-square)

## Features

### Video AI
- Real-time neural filters (cartoon, anime, cyberpunk, background blur, super-resolution, and more)
- Custom trainable style-transfer models (GAN, U-Net, diffusion-inspired)
- GPU-accelerated pipeline (WebGPU / WebGL / WASM)
- Node-based visual processing editor

### Audio AI
- Neural denoising, compression, voice isolation, mastering
- **English Fluency AI** — live grammar correction and subtitles
- Real-time transcription with confidence metrics

### Studio Workflow
- Multi-scene layouts (Zoom, streamer, presenter, podcast, cinematic)
- Dockable glassmorphism panels
- Webcam + screen share + microphone
- Command palette (⌘K)
- Electron desktop support

## Quick Start

```bash
cd studio
cp .env.example .env
yarn install
yarn dev
```

Open **http://localhost:5174**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Command palette |
| ⌘W | Add webcam feed |
| ⌘S | Screen share |
| ⌘M | Initialize microphone + audio AI |
| ⌘T | Training dashboard |
| ⌘N | Node editor |

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** + **Framer Motion** — glassmorphism neural HUD
- **Zustand** + Immer — state management
- **TensorFlow.js** + **ONNX Runtime Web** — browser inference
- **WebRTC** + **Socket.io** — streaming & engine bridge
- **Electron** — desktop mode

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design, pipeline diagrams, and scalability roadmap.

## Engine Integration

Configure the CyberHex backend:

```env
VITE_WS_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api/v1
```

The studio runs in **offline mode** when the engine is unavailable — CPU filters and local fluency correction still work.

## Build & Deploy

```bash
# Production web build
yarn build

# Docker
docker build -t cyberhex-studio .
docker run -p 8080:80 cyberhex-studio

# Electron desktop
yarn electron:build
```

## Monorepo Context

| App | Path | Purpose |
|-----|------|---------|
| Main client | `/client` | CyberHex platform dashboard |
| **Studio** | `/studio` | Neural video/audio studio (this app) |
| ML engine | `/ML/models/cpp-modules` | C++ inference backend |

## License

MIT — CyberHex Platform
