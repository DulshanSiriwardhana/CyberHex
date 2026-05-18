/**
 * CyberHex Studio — Main Application Shell
 * Futuristic HUD interface with glassmorphism panels, neural gradients,
 * dockable layout, real-time performance monitor, and AI pipeline integration.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Video, Mic, Monitor, Settings, Layout, Sparkles,
  Music, MessageSquare, Zap, Layers, Cpu, Gauge,
  PanelLeftClose, PanelLeft, Command, X, Activity,
  Sliders, Brain, Wand2, Wifi, WifiOff, Film,
} from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { GPUManager } from '@/engine/gpu/GPUManager';
import { WebSocketService } from '@/services/WebSocketService';
import type { Toast, FeedId, SceneId, FilterAssignment, CorrectionResult } from '@/types';

/* ─── Props ──────────────────────────────── */

interface AppProps {
  initialGpuAvailable: boolean;
}

/* ─── Components ─────────────────────────── */

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const colors: Record<string, string> = {
    info: 'border-neon-cyan/30 bg-neon-cyan/5',
    success: 'border-neon-green/30 bg-neon-green/5',
    warning: 'border-neon-yellow/30 bg-neon-yellow/5',
    error: 'border-red-400/30 bg-red-400/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`glass-panel-heavy p-4 min-w-[320px] max-w-[420px] border-l-2 ${colors[toast.type]} flex items-start gap-3`}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-white/90">{toast.title}</p>
        <p className="text-xs text-white/60 mt-0.5">{toast.message}</p>
      </div>
      {toast.dismissible && (
        <button onClick={() => onDismiss(toast.id)} className="text-white/40 hover:text-white/80 transition-colors">
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
};

const PerformanceMonitor: React.FC = () => {
  const performance = useStudioStore((s) => s.performance);
  const fps = performance.fps;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full glass-panel text-xs font-mono">
      <Activity size={12} className={fps >= 55 ? 'text-neon-green' : fps >= 30 ? 'text-neon-yellow' : 'text-red-400'} />
      <span className={fps >= 55 ? 'text-neon-green' : fps >= 30 ? 'text-neon-yellow' : 'text-red-400'}>
        {fps} FPS
      </span>
      <span className="text-white/40">|</span>
      <span className="text-white/60">{performance.frameTimeMs.toFixed(1)}ms</span>
      <span className="text-white/40">|</span>
      <span className="text-white/60">{(performance.gpu.utilization * 100).toFixed(0)}% GPU</span>
    </div>
  );
};

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative group flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-neon-cyan/15 text-neon-cyan shadow-glow'
        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-magenta text-white text-[9px] flex items-center justify-center font-bold">
        {badge}
      </span>
    )}
  </button>
);

const Sidebar: React.FC = () => {
  const sidebarOpen = useStudioStore((s) => s.sidebarOpen);
  const toggleSidebar = useStudioStore((s) => s.toggleSidebar);
  const openCommandPalette = useStudioStore((s) => s.openCommandPalette);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -64, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -64, opacity: 0 }}
          className="w-[68px] h-full glass-panel-heavy flex flex-col items-center py-4 gap-1 shrink-0 z-40"
        >
          <ToolbarButton icon={<Layout size={18} />} label="Layout" active />
          <ToolbarButton icon={<Video size={18} />} label="Video" />
          <ToolbarButton icon={<Mic size={18} />} label="Audio" />
          <ToolbarButton icon={<Wand2 size={18} />} label="Filters" />
          <ToolbarButton icon={<Brain size={18} />} label="AI" />
          <ToolbarButton icon={<Sliders size={18} />} label="Mixer" />
          <ToolbarButton icon={<Monitor size={18} />} label="Scenes" />
          <ToolbarButton icon={<Layers size={18} />} label="Nodes" />
          <ToolbarButton icon={<Film size={18} />} label="Record" />

          <div className="flex-1" />

          <ToolbarButton icon={<Command size={18} />} label="Cmd" onClick={openCommandPalette} />
          <ToolbarButton icon={<Settings size={18} />} label="Prefs" />

          <button
            onClick={toggleSidebar}
            className="mt-3 p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <PanelLeftClose size={16} />
          </button>
        </motion.aside>
      )}

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute left-0 top-4 z-50 p-2 glass-panel text-white/50 hover:text-white/80 transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      )}
    </AnimatePresence>
  );
};

const TopBar: React.FC = () => {
  const wsConnected = useStudioStore((s) => s.wsConnected);
  const wsLatency = useStudioStore((s) => s.wsLatency);

  return (
    <header className="h-12 glass-panel-heavy border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold tracking-wider bg-gradient-to-r from-neon-cyan via-white to-neon-magenta bg-clip-text text-transparent">
              CYBERHEX STUDIO
            </h1>
          </div>
        </div>
        <span className="text-[10px] text-white/30 font-mono tracking-widest px-2 py-0.5 rounded border border-white/10">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        <PerformanceMonitor />

        <div className="flex items-center gap-1.5 text-xs">
          {wsConnected ? (
            <>
              <Wifi size={12} className="text-neon-green" />
              <span className="text-neon-green font-mono">{wsLatency}ms</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-400" />
              <span className="text-red-400 font-mono">OFFLINE</span>
            </>
          )}
        </div>

        <button className="glass-panel px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
          <Cpu size={12} />
          <span>Engine</span>
        </button>
      </div>
    </header>
  );
};

const MainStage: React.FC = () => {
  const feeds = useStudioStore((s) => s.feeds);
  const activeFeedId = useStudioStore((s) => s.activeFeedId);

  return (
    <div className="flex-1 relative overflow-hidden bg-neural-gradient">
      {/* Neural grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none scan-line-overlay" />

      {/* Particle effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-neon-cyan/40 rounded-full animate-particle-drift"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Feed viewport */}
      {feeds.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4">
          <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neural-hud">
            <Video size={36} className="text-neon-cyan/30" />
          </div>
          <p className="text-sm font-mono">NO ACTIVE FEEDS</p>
          <p className="text-xs text-white/20">Press ⌘K to add a feed or scene</p>
        </div>
      ) : (
        <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-3 auto-rows-fr">
          {feeds.map((feed) => (
            <motion.div
              key={feed.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-xl overflow-hidden border ${
                feed.id === activeFeedId
                  ? 'border-neon-cyan shadow-glow'
                  : 'border-white/10'
              } glass-panel`}
            >
              <video
                autoPlay
                playsInline
                muted={feed.muted}
                ref={(el) => {
                  if (el && feed.stream && el.srcObject !== feed.stream) {
                    el.srcObject = feed.stream;
                  }
                }}
                className="w-full h-full object-cover"
                style={{
                  transform: feed.layout.mirrored ? 'scaleX(-1)' : undefined,
                  opacity: feed.layout.opacity,
                  borderRadius: feed.layout.borderRadius,
                  objectFit: feed.layout.fit,
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-xs font-mono text-white/80 bg-black/50 backdrop-blur px-2 py-0.5 rounded">
                  {feed.label}
                </span>
                {feed.activeFilters.length > 0 && (
                  <span className="text-[10px] font-mono text-neon-cyan bg-black/50 backdrop-blur px-2 py-0.5 rounded">
                    {feed.activeFilters.length} FILTERS
                  </span>
                )}
              </div>
              {feed.muted && (
                <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  MUTED
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const BottomBar: React.FC = () => {
  const toasts = useStudioStore((s) => s.toasts);
  const removeToast = useStudioStore((s) => s.removeToast);

  return (
    <div className="h-10 glass-panel-heavy border-t border-white/5 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green/60" />
          RENDER
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60" />
          INFERENCE
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta/60" />
          AUDIO
        </span>
        <span className="text-white/20">|</span>
        <span>LN 1, COL 1</span>
      </div>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
        <span>CyberHex Engine v3.2.1</span>
      </div>
    </div>
  );
};

const CommandPalette: React.FC = () => {
  const open = useStudioStore((s) => s.commandPaletteOpen);
  const close = useStudioStore((s) => s.closeCommandPalette);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? close() : useStudioStore.getState().openCommandPalette();
      }
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[560px] max-w-[95vw]"
          >
            <div className="glass-panel-heavy neural-hud p-2">
              <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
                <Command size={16} className="text-neon-cyan" />
                <input
                  ref={inputRef}
                  placeholder="Search commands, filters, scenes..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-mono"
                />
                <kbd className="text-[10px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded">ESC</kbd>
              </div>
              <div className="py-2 max-h-[300px] overflow-y-auto">
                {[
                  { label: 'Add Webcam Feed', shortcut: '⌘W', icon: <Video size={14} /> },
                  { label: 'Add Screen Share', shortcut: '⌘S', icon: <Monitor size={14} /> },
                  { label: 'Add Microphone', shortcut: '⌘M', icon: <Mic size={14} /> },
                  { label: 'Toggle Filters Panel', shortcut: '⌘F', icon: <Wand2 size={14} /> },
                  { label: 'Switch Scene', shortcut: '⌘1-9', icon: <Layers size={14} /> },
                  { label: 'Open Training Dashboard', shortcut: '⌘T', icon: <Brain size={14} /> },
                  { label: 'Performance Monitor', shortcut: '⌘P', icon: <Gauge size={14} /> },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-white/40">{item.icon}</span>
                    <span className="text-sm text-white/80 flex-1">{item.label}</span>
                    <kbd className="text-[10px] text-white/30 font-mono">{item.shortcut}</kbd>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─── App Shell ──────────────────────────── */

export const App: React.FC<AppProps> = ({ initialGpuAvailable }) => {
  const setGpuStatus = useStudioStore((s) => s.setGpuStatus);
  const setWsConnected = useStudioStore((s) => s.setWsConnected);
  const addToast = useStudioStore((s) => s.addToast);
  const wsConnected = useStudioStore((s) => s.wsConnected);

  /* ── Initialize GPU ── */
  useEffect(() => {
    setGpuStatus(initialGpuAvailable, false);

    GPUManager.getInstance()
      .initialize()
      .then(() => setGpuStatus(true, true))
      .catch(() => setGpuStatus(false, false));
  }, [initialGpuAvailable, setGpuStatus]);

  /* ── Initialize WS ── */
  useEffect(() => {
    try {
      WebSocketService.getInstance().connect({
        url: import.meta.env.VITE_WS_URL ?? 'http://localhost:4000',
        path: '/ws',
        autoReconnect: true,
      });

      const unsub = WebSocketService.getInstance().on('connected', () => {
        setWsConnected(true, 0);
        addToast({ type: 'success', title: 'Connected', message: 'CyberHex Engine linked', dismissible: true, duration: 3000 });
      });

      const unsub2 = WebSocketService.getInstance().on('disconnected', () => {
        setWsConnected(false, 0);
      });

      return () => {
        unsub();
        unsub2();
      };
    } catch {
      // WS not critical; continue in offline mode
    }
  }, [setWsConnected, addToast]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a1a] text-white overflow-hidden select-none">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainStage />
      </div>
      <BottomBar />
      <CommandPalette />
    </div>
  );
};