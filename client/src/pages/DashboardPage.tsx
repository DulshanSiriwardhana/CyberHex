import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import {
  Activity,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Bot,
  Maximize2,
  ChevronRight,
  Network,
  Command,
  Search,
  Grid,
  Menu,
  Settings2,
  Database
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useExperimentsStore } from "@/stores/experiments";
import MatrixBackground from "@/components/dashboard/MatrixBackground";
import WorldThreatMap from "@/components/dashboard/WorldThreatMap";
import { Button } from "@/components/ui/button";

/**
 * REASON FOR EXISTENCE: The DashboardPage is the central nervous system of CyberHex. 
 * It has been upgraded to an "AI OS Workspace" to reflect a multi-pane, highly technical environment.
 * SCALABILITY: Uses react-resizable-panels for native DOM resizing. Can be extended to arbitrary depths.
 * PERFORMANCE: Frame-motion utilized for localized hardware-accelerated updates rather than React re-renders.
 */

// Premium OS-Level Panel Header
const OsPanelHeader = ({ icon: Icon, title, active = false, action }: any) => (
  <div className={`flex items-center justify-between px-3 py-2 border-b border-white/5 bg-neutral-900/40 backdrop-blur-md sticky top-0 z-20 group transition-colors ${active ? 'bg-neutral-800/40 border-b-neutral-700/50' : ''}`}>
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-neutral-400'}`} />
      <span className={`text-[11px] font-semibold tracking-wider uppercase ${active ? 'text-white' : 'text-neutral-400'}`}>
        {title}
      </span>
    </div>
    {action && <div className="opacity-0 group-hover:opacity-100 transition-opacity">{action}</div>}
  </div>
);

// Mac/Linux style window controls
const WindowControls = () => (
  <div className="flex items-center gap-1.5 px-3 py-2">
    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all"></div>
    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all"></div>
    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all"></div>
  </div>
);

// High-Fidelity Resize Handle
const ResizeHandle = () => (
  <PanelResizeHandle className="w-[1px] bg-neutral-800 hover:bg-green-500/50 hover:w-[2px] transition-all duration-150 flex items-center justify-center cursor-col-resize z-30 group relative">
    <div className="w-1 h-12 bg-transparent group-hover:bg-green-400 rounded-full transition-colors absolute" />
  </PanelResizeHandle>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { experiments, fetchExperiments } = useExperimentsStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    fetchExperiments();

    // Global keyboard listener for Command Palette (CMD/CTRL + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchExperiments]);

  if (!user) return null;
  const recentExperiments = experiments.slice(0, 8);

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-[#08080C] font-sans relative selection:bg-green-500/30">

      {/* Background Ambience: Infinite OS Grid & Noise */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-30">
        <MatrixBackground />
      </div>
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-[#08080C]/80 to-[#08080C]"></div>

      {/* Global Command Palette Overlay */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] z-50 rounded-2xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(34,197,94,0.1)] overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5">
              <Search className="h-4 w-4 text-neutral-400 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search resources, commands, or settings..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder-neutral-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500 font-mono border border-white/10 px-1.5 rounded bg-neutral-800/50">ESC</span>
              </div>
            </div>
            <div className="p-2 py-4">
              <div className="text-xs font-semibold text-neutral-500 mb-2 px-2">SUGGESTED ACTIONS</div>
              <div className="space-y-1">
                <div className="px-3 py-2 rounded-lg hover:bg-neutral-800/80 cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-3"><Zap className="h-3 w-3 text-green-400" /><span className="text-sm text-neutral-200">Initialize New Training Run</span></div>
                  <span className="text-[10px] font-mono text-neutral-600 group-hover:text-green-500">T + N</span>
                </div>
                <div className="px-3 py-2 rounded-lg hover:bg-neutral-800/80 cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-3"><Layers className="h-3 w-3 text-violet-400" /><span className="text-sm text-neutral-200">Open Architecture Designer</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Application Bar - OS Style */}
      <div className="h-10 shrink-0 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between relative z-20 px-2 shadow-sm">
        <div className="flex items-center">
          <WindowControls />
          <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
          <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1.5 group">
            <Menu className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
            <span className="text-[11px] font-semibold text-neutral-300">File</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1.5 group">
            <span className="text-[11px] font-semibold text-neutral-300">Edit</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1.5 group">
            <span className="text-[11px] font-semibold text-neutral-300">View</span>
          </motion.div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Command className="h-3 w-3 text-neutral-500" />
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/5 cursor-pointer hover:border-neutral-700 transition-colors" onClick={() => setCommandPaletteOpen(true)}>
            CMD + K to search
          </span>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[10px] font-mono font-medium text-green-400">CLUSTER ONLINE</span>
          </div>
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] cursor-pointer">
            <div className="h-full w-full bg-neutral-900 rounded-full flex items-center justify-center border border-transparent hover:bg-transparent transition-colors">
              <span className="text-[9px] font-bold text-white">{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Tiling Window Manager */}
      <PanelGroup orientation="horizontal" className="flex-1 w-full relative z-10 p-2 gap-2">

        {/* LEFT PANEL: Context / File Tree / Active Runs */}
        <Panel defaultSize={20} minSize={15} maxSize={30} className="flex flex-col bg-[#0D0D12]/60 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

          <OsPanelHeader icon={Grid} title="Explorer" active={true} />

          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-between">
              Active Telemetry
              <Activity className="h-3 w-3 text-neutral-500" />
            </div>

            <div className="space-y-0.5">
              {recentExperiments.length === 0 ? (
                <div className="px-3 py-4 text-[11px] text-neutral-600 italic">No active experiments.</div>
              ) : (
                recentExperiments.map(exp => (
                  <Link key={exp._id} to={`/experiments/${exp._id}`}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 border border-transparent cursor-pointer transition-colors group/item">
                      <div className={`h-1.5 w-1.5 rounded-full ${exp.status === 'training' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]' : 'bg-neutral-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono font-medium text-neutral-300 truncate group-hover/item:text-white">{exp.name}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-6 px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-between">
              Data Assets
              <Database className="h-3 w-3 text-neutral-500" />
            </div>
            <div className="px-3 py-2 text-[11px] font-mono text-neutral-600 hover:text-white cursor-pointer hover:bg-white/5 rounded-md transition-colors flex items-center gap-2">
              <span className="text-violet-400">🗂️</span> production_logs.csv
            </div>
            <div className="px-3 py-2 text-[11px] font-mono text-neutral-600 hover:text-white cursor-pointer hover:bg-white/5 rounded-md transition-colors flex items-center gap-2">
              <span className="text-violet-400">🗂️</span> pcap_samples_01.h5
            </div>
          </div>

          <div className="shrink-0 p-3 bg-neutral-900/50 border-t border-white/5">
            <div className="w-full rounded-lg bg-black/40 border border-white/5 p-3 flex flex-col relative overflow-hidden group/stats hover:border-white/10 transition-colors cursor-default">
              <div className="flex justify-between items-center relative z-10 mb-2">
                <span className="text-[10px] font-semibold uppercase text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="h-3 w-3" /> Compute Node 01
                </span>
                <span className="text-[10px] font-mono text-green-400 group-hover/stats:text-green-300 transition-colors">GPU: 92%</span>
              </div>
              <div className="h-1 w-full bg-neutral-800 rounded-full relative z-10 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 2, ease: "easeOut" }} />
              </div>
            </div>
          </div>
        </Panel>

        <ResizeHandle />

        {/* CENTER PANEL: Infinite Dashboard Engine */}
        <Panel defaultSize={55} className="flex flex-col relative rounded-xl border border-white/5 bg-[#0A0A0F]/60 backdrop-blur-2xl shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none"></div>

          <OsPanelHeader
            icon={Network}
            title="Global Telemetry Engine"
            action={
              <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2 bg-white/5 hover:bg-white/10 text-neutral-300">
                <Maximize2 className="h-3 w-3 mr-1" /> View Full Graph
              </Button>
            }
          />

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide relative z-10 pt-6">

            <div className="grid grid-cols-3 gap-4 shrink-0">
              {/* Premium Card 1 */}
              <Link to="/designer" className="group/card block">
                <div className="h-36 rounded-xl bg-gradient-to-br from-neutral-900/80 to-black/80 border border-white/5 hover:border-amber-500/30 p-4 transition-all duration-300 relative overflow-hidden hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover/card:opacity-10 transition-opacity transform group-hover/card:scale-110 duration-500">
                    <Layers className="h-32 w-32 text-amber-500" />
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                    <Layers className="h-4 w-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-wide mb-1">Architecture Designer</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">Visually engineer graph structures</p>
                </div>
              </Link>

              {/* Premium Card 2 */}
              <Link to="/experiments/new" className="group/card block">
                <div className="h-36 rounded-xl bg-gradient-to-br from-neutral-900/80 to-black/80 border border-white/5 hover:border-green-500/30 p-4 transition-all duration-300 relative overflow-hidden hover:shadow-[0_10px_30px_rgba(34,197,94,0.1)]">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover/card:opacity-10 transition-opacity transform group-hover/card:scale-110 duration-500">
                    <Zap className="h-32 w-32 text-green-500" />
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                    <Zap className="h-4 w-4 text-green-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-wide mb-1">Initialize Training</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">Deploy to K8s compute cluster</p>
                </div>
              </Link>

              {/* Premium Card 3 */}
              <Link to="/models" className="group/card block">
                <div className="h-36 rounded-xl bg-gradient-to-br from-neutral-900/80 to-black/80 border border-white/5 hover:border-violet-500/30 p-4 transition-all duration-300 relative overflow-hidden hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)]">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover/card:opacity-10 transition-opacity transform group-hover/card:scale-110 duration-500">
                    <Cpu className="h-32 w-32 text-violet-500" />
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                    <Cpu className="h-4 w-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-wide mb-1">C++ Compilation</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">Export optimized ONNX/WASM binary</p>
                </div>
              </Link>
            </div>

            {/* Massive Compute Graph / Map Viz area */}
            <div className="flex-1 mt-2 min-h-[300px] w-full rounded-xl border border-white/5 bg-black/50 relative overflow-hidden isolate shadow-inner group/map">
              <WorldThreatMap />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

              <div className="absolute top-4 left-4 p-3 rounded-xl bg-neutral-950/80 border border-white/5 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                  <Activity className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">World Mesh</span>
                </div>
                <div className="text-xs font-mono text-neutral-400 before:content-['>'] before:mr-2 before:text-green-500"><span className="text-white">Active Pipelines: 14</span></div>
              </div>
            </div>

          </div>
        </Panel>

        <ResizeHandle />

        {/* RIGHT PANEL: AI Copilot & Hardware Telemetry */}
        <Panel defaultSize={25} minSize={20} maxSize={40} className="flex flex-col bg-[#0D0D12]/60 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.01] to-transparent pointer-events-none"></div>

          <OsPanelHeader icon={Bot} title="Cybernetic Assistant" />

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 scrollbar-hide">

            <div className="p-4 rounded-xl bg-gradient-to-b from-green-900/10 to-transparent border border-green-500/10 shadow-[0_4px_20px_rgba(34,197,94,0.03)] backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex gap-3 relative z-10">
                <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200 mb-1">System Analyzed</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                    Deep telemetry hook established. Detected sub-optimal gradient flows in Layer 4 of generic ResNet configuration. Shall I optimize?
                  </p>
                  <Button size="sm" className="mt-3 h-6 text-[10px] font-semibold bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black border border-green-500/20 hover:border-transparent transition-all">
                    Apply Patch
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col border border-white/5 rounded-xl bg-black/40 overflow-hidden">
              <div className="px-3 py-2 bg-neutral-900/50 border-b border-white/5 flex items-center gap-2">
                <Terminal className="h-3 w-3 text-neutral-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stream Log</span>
              </div>
              <div className="p-3 font-mono text-[10px] leading-relaxed text-neutral-500 flex-1 overflow-y-auto space-y-1">
                <div className="flex gap-2">
                  <span className="text-neutral-600 shrink-0">12:45:00.1</span>
                  <span><span className="text-green-500">[SYS]</span> WebAssembly execution context ready.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neutral-600 shrink-0">12:45:00.4</span>
                  <span><span className="text-green-500">[SYS]</span> Connected to orchestration pod.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neutral-600 shrink-0">12:45:01.2</span>
                  <span><span className="text-violet-500">[ML_OP]</span> Prefetching tensors (4GB)...</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neutral-600 shrink-0">12:45:04.9</span>
                  <span className="text-amber-500">[WARN] High memory pressure on Node 04.</span>
                </div>
                <div className="flex gap-2 opacity-70">
                  <span className="text-neutral-600 shrink-0">##:##:##.#</span>
                  <span className="animate-pulse">Waiting for execution graph...</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-3 bg-neutral-900/40 border-t border-white/5 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask system array..."
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-[11px] font-mono text-white focus:outline-none focus:border-green-500/50 focus:bg-neutral-950 transition-all placeholder:text-neutral-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Zap className="h-3 w-3 text-neutral-500 cursor-pointer hover:text-green-400 transition-colors" />
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>

      {/* Footer Status Bar - Industrial Style */}
      <div className="h-7 shrink-0 bg-[#08080C] border-t border-white/10 flex items-center justify-between px-4 font-mono text-[10px] tracking-widest z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] text-neutral-500">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><Activity className="h-3 w-3 text-green-500" /> SYSTEM NOMINAL</span>
          <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors text-violet-400"><Network className="h-3 w-3" /> DIST-ORCH: CONNECTED</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="cursor-pointer hover:text-white transition-colors">V_OMEGA_0.2</span>
          <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"><Settings2 className="h-3 w-3 text-neutral-500" /> HARDWARE_ACCEL</span>
        </div>
      </div>
    </div>
  );
}
