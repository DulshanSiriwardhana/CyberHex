/**
 * CyberHex Studio — Main Shell
 * Dockable panel layout with scene stage, neural HUD, and multi-view modes.
 */
import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Video, Mic, Monitor, Settings, Layout, Sparkles,
  Wand2, Layers, Cpu, Gauge, PanelLeftClose, PanelLeft,
  Command, X, Activity, Sliders, Brain, Wifi, WifiOff,
  Film, MessageSquare, Music, Zap,
} from 'lucide-react';
import {
  PanelGroup,
  Panel,
  ResizeHandle,
} from '@/components/layout/ResizablePanel';
import { VideoFeed } from '@/components/stage/VideoFeed';
import { FilterPanel } from '@/components/panels/FilterPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { ScenePanel } from '@/components/panels/ScenePanel';
import { TrainingPanel } from '@/components/panels/TrainingPanel';
import { ModelPanel } from '@/components/panels/ModelPanel';
import { FluencyPanel } from '@/components/panels/FluencyPanel';
import { NodeEditorPanel } from '@/components/panels/NodeEditorPanel';
import { useStudioStore } from '@/stores/studioStore';
import { useStudioBootstrap } from '@/hooks/useStudioBootstrap';
import { ViewMode } from '@/types';
import type { Toast } from '@/types';

type SidebarTab = 'layout' | 'video' | 'audio' | 'filters' | 'ai' | 'mixer' | 'scenes' | 'nodes' | 'record';

interface StudioShellProps {
  initialGpuAvailable?: boolean;
}

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
      className={`glass-panel-heavy p-3 min-w-[280px] border-l-2 ${colors[toast.type]} flex items-start gap-2`}
    >
      <motion.div className="flex-1">
        <p className="text-sm font-semibold text-white/90">{toast.title}</p>
        <p className="text-xs text-white/60">{toast.message}</p>
      </motion.div>
      {toast.dismissible && (
        <button type="button" onClick={() => onDismiss(toast.id)} className="text-white/40 hover:text-white/80">
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
    <motion.div className="flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-mono">
      <Activity size={12} className={fps >= 55 ? 'text-neon-green' : fps >= 30 ? 'text-neon-yellow' : 'text-red-400'} />
      <span className={fps >= 55 ? 'text-neon-green' : fps >= 30 ? 'text-neon-yellow' : 'text-red-400'}>{fps} FPS</span>
      <span className="text-white/30">|</span>
      <span className="text-white/60">{performance.frameTimeMs.toFixed(1)}ms</span>
      <span className="text-white/30">|</span>
      <span className="text-white/60">{(performance.gpu.utilization * 100).toFixed(0)}% GPU</span>
    </motion.div>
  );
};

export const StudioShell: React.FC<StudioShellProps> = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('layout');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.STUDIO);

  const feeds = useStudioStore((s) => s.feeds);
  const sidebarOpen = useStudioStore((s) => s.sidebarOpen);
  const toggleSidebar = useStudioStore((s) => s.toggleSidebar);
  const wsConnected = useStudioStore((s) => s.wsConnected);
  const wsLatency = useStudioStore((s) => s.wsLatency);
  const gpuReady = useStudioStore((s) => s.gpuReady);
  const toasts = useStudioStore((s) => s.toasts);
  const removeToast = useStudioStore((s) => s.removeToast);
  const commandPaletteOpen = useStudioStore((s) => s.commandPaletteOpen);
  const openCommandPalette = useStudioStore((s) => s.openCommandPalette);
  const closeCommandPalette = useStudioStore((s) => s.closeCommandPalette);
  const { addWebcamFeed, addScreenFeed, initAudio } = useStudioBootstrap();

  const toolbarItems: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: 'layout', icon: <Layout size={18} />, label: 'Layout' },
    { id: 'video', icon: <Video size={18} />, label: 'Video' },
    { id: 'audio', icon: <Mic size={18} />, label: 'Audio' },
    { id: 'filters', icon: <Wand2 size={18} />, label: 'Filters' },
    { id: 'ai', icon: <Brain size={18} />, label: 'AI' },
    { id: 'mixer', icon: <Sliders size={18} />, label: 'Mixer' },
    { id: 'scenes', icon: <Monitor size={18} />, label: 'Scenes' },
    { id: 'nodes', icon: <Layers size={18} />, label: 'Nodes' },
    { id: 'record', icon: <Film size={18} />, label: 'Record' },
  ];

  const renderRightPanel = () => {
    switch (activeTab) {
      case 'filters':
        return <FilterPanel />;
      case 'audio':
      case 'mixer':
        return <AudioPanel />;
      case 'scenes':
      case 'layout':
        return <ScenePanel />;
      case 'ai':
        return <ModelPanel />;
      case 'nodes':
        return <NodeEditorPanel />;
      case 'video':
        return <FluencyPanel />;
      default:
        return <ScenePanel />;
    }
  };

  const runCommand = useCallback(
    (action: string) => {
      closeCommandPalette();
      switch (action) {
        case 'webcam':
          addWebcamFeed();
          break;
        case 'screen':
          addScreenFeed();
          break;
        case 'mic':
          initAudio();
          break;
        case 'training':
          setViewMode(ViewMode.TRAINING);
          setActiveTab('ai');
          break;
        case 'nodes':
          setViewMode(ViewMode.NODE_EDITOR);
          setActiveTab('nodes');
          break;
        case 'perf':
          setViewMode(ViewMode.PERFORMANCE);
          break;
        default:
          break;
      }
    },
    [addWebcamFeed, addScreenFeed, initAudio, closeCommandPalette]
  );

  return (
    <motion.div className="h-screen w-screen flex flex-col bg-[#09090b] text-white overflow-hidden select-none">
      {/* Top bar */}
      <header className="h-12 glass-panel-heavy border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-sm font-semibold tracking-wide bg-gradient-to-r from-neon-cyan via-white to-neon-magenta bg-clip-text text-transparent">
            CyberHex Studio
          </h1>
          <span className="text-[10px] text-white/30 font-mono px-2 py-0.5 rounded border border-white/10">NEURAL v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <PerformanceMonitor />
          <div className="flex items-center gap-1 text-xs">
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
          <button
            type="button"
            className={`glass-panel px-3 py-1 text-xs font-medium flex items-center gap-1.5 ${gpuReady ? 'text-neon-green' : 'text-white/50'}`}
          >
            <Cpu size={12} />
            {gpuReady ? 'GPU Ready' : 'CPU Mode'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -68, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -68, opacity: 0 }}
              className="w-[68px] glass-panel-heavy flex flex-col items-center py-3 gap-0.5 shrink-0 z-40"
            >
              {toolbarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'nodes') setViewMode(ViewMode.NODE_EDITOR);
                    else if (item.id === 'ai') setViewMode(ViewMode.TRAINING);
                    else setViewMode(ViewMode.STUDIO);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all ${
                    activeTab === item.id ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="text-[9px] font-medium">{item.label}</span>
                </button>
              ))}
              <div className="flex-1" />
              <button type="button" onClick={openCommandPalette} className="p-2 text-white/40 hover:text-neon-cyan">
                <Command size={16} />
              </button>
              <button type="button" onClick={toggleSidebar} className="p-2 text-white/30 hover:text-white/60">
                <PanelLeftClose size={16} />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <button type="button" onClick={toggleSidebar} className="absolute left-0 top-14 z-50 p-2 glass-panel text-white/50">
            <PanelLeft size={16} />
          </button>
        )}

        {/* Main dock */}
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={72} minSize={50}>
            <div className="h-full flex flex-col bg-neural-gradient relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />

              {viewMode === ViewMode.NODE_EDITOR ? (
                <div className="flex-1 p-2">
                  <NodeEditorPanel fullWidth />
                </div>
              ) : viewMode === ViewMode.TRAINING ? (
                <div className="flex-1 p-2 overflow-auto">
                  <TrainingPanel fullWidth />
                </div>
              ) : feeds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4">
                  <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neural-hud">
                    <Video size={36} className="text-neon-cyan/30" />
                  </div>
                  <p className="text-sm font-mono">NO ACTIVE FEEDS</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addWebcamFeed()} className="px-4 py-2 glass-panel text-neon-cyan text-xs font-mono hover:bg-neon-cyan/10">
                      + Webcam
                    </button>
                    <button type="button" onClick={() => addScreenFeed()} className="px-4 py-2 glass-panel text-white/70 text-xs font-mono hover:bg-white/5">
                      + Screen
                    </button>
                    <button type="button" onClick={() => initAudio()} className="px-4 py-2 glass-panel text-neon-magenta text-xs font-mono hover:bg-neon-magenta/10">
                      + Mic
                    </button>
                  </div>
                  <p className="text-xs text-white/20">⌘K — Command palette</p>
                </div>
              ) : (
                <div className="flex-1 p-3 grid gap-3 auto-rows-fr overflow-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
                  {feeds.map((feed) => (
                    <VideoFeed key={feed.id} feed={feed} />
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <ResizeHandle />

          <Panel defaultSize={28} minSize={18} maxSize={45}>
            <div className="h-full glass-panel-heavy flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5 text-[11px] font-mono text-white/50 uppercase tracking-wider">
                {activeTab} panel
              </div>
              <motion.div className="flex-1 overflow-hidden p-2">{renderRightPanel()}</motion.div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Bottom bar */}
      <footer className="h-9 glass-panel-heavy border-t border-white/5 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-white/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon-green/60" />RENDER</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60" />INFERENCE</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon-magenta/60" />AUDIO</span>
        </div>
        <AnimatePresence>
          {toasts.slice(-2).map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
        <span>CyberHex Engine • ONNX / TensorRT-ready</span>
      </footer>

      {/* Command palette */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeCommandPalette} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              className="fixed top-[18%] left-1/2 -translate-x-1/2 z-50 w-[520px] glass-panel-heavy neural-hud"
            >
              <motion.div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                <Command size={16} className="text-neon-cyan" />
                <input placeholder="Commands…" className="flex-1 bg-transparent text-sm outline-none font-mono" autoFocus />
              </motion.div>
              <div className="py-1 max-h-[280px] overflow-y-auto">
                {[
                  { id: 'webcam', label: 'Add Webcam Feed', shortcut: '⌘W', icon: <Video size={14} /> },
                  { id: 'screen', label: 'Add Screen Share', shortcut: '⌘S', icon: <Monitor size={14} /> },
                  { id: 'mic', label: 'Initialize Microphone + Audio AI', shortcut: '⌘M', icon: <Mic size={14} /> },
                  { id: 'training', label: 'Open Training Dashboard', shortcut: '⌘T', icon: <Brain size={14} /> },
                  { id: 'nodes', label: 'Node Processing Editor', shortcut: '⌘N', icon: <Layers size={14} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => runCommand(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left"
                  >
                    <span className="text-white/40">{item.icon}</span>
                    <span className="text-sm text-white/80 flex-1">{item.label}</span>
                    <kbd className="text-[10px] text-white/30">{item.shortcut}</kbd>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
