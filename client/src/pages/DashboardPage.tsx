import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Command, Activity, Maximize2, Zap, Layers, Cpu, Database,
  FlaskConical, BrainCircuit, Library, BookOpen, LineChart, Code,
  Settings, Bot
} from 'lucide-react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCommandPaletteStore } from '@/stores/commandPalette';
import { useAuth } from '@/contexts/auth';
import { ExperimentsListContent as ExperimentsListPage } from './ExperimentsListPage';
import ModelsPage from './ModelsPage';

const OsPanelHeader = ({ icon: Icon, title, action, active = false }: any) => (
  <div className={`h-10 px-3 flex items-center justify-between border-b 
    ${active ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20 text-green-400'
      : 'bg-white/[0.02] border-white/5 text-neutral-400'}`}>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-mono font-medium tracking-wide">{title}</span>
    </div>
    {action}
  </div>
);

export default function AIWorkspace() {
  const { user } = useAuth();
  const setCommandPaletteOpen = useCommandPaletteStore((s) => s.open);
  const navigate = useNavigate();
  const { module } = useParams();

  const activeTab = module || 'data';

  const WORKSPACE_MODULES = [
    { id: 'data', icon: Database, label: 'Data Science Workbench', color: 'text-blue-400' },
    { id: 'notebook', icon: BookOpen, label: 'Notebook System', color: 'text-amber-400' },
    { id: 'math', icon: BrainCircuit, label: 'Mathematical Engine', color: 'text-violet-400' },
    { id: 'research', icon: Library, label: 'Research Mode', color: 'text-emerald-400' },
    { id: 'experiments', icon: FlaskConical, label: 'Experiment System', color: 'text-rose-400' },
    { id: 'mlops', icon: Activity, label: 'MLOps Center', color: 'text-cyan-400' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#050508] relative overflow-hidden">

      {/* Omni-Search Top Bar */}
      <div className="h-12 shrink-0 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-between px-4 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 transition-colors"
            onClick={() => setCommandPaletteOpen()}>
            <Command className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-mono text-neutral-300">Universal Command Center...</span>
            <span className="ml-4 text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 rounded border border-white/5">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 tracking-wider">CLUSTER ALIVE</span>
          </div>
          <div className="h-7 w-7 rounded-sm bg-neutral-800 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition">
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Modern Sidebar */}
        <div className="w-16 md:w-64 shrink-0 bg-[#0A0A0F] border-r border-white/5 flex flex-col items-center md:items-stretch py-2 z-10 shadow-2xl">
          <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest px-4 mb-4 hidden md:block mt-2">OMNI-MODULES</div>
          <div className="flex flex-col gap-1 w-full px-2">
            {WORKSPACE_MODULES.map(mod => {
              const isActive = activeTab === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => navigate(mod.id === 'experiments' ? '/experiments' : mod.id === 'mlops' ? '/models' : `/workspace/${mod.id}`)}
                  className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                        ${isActive ? 'bg-white/10 border border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.1)]' : 'hover:bg-white/5 border border-transparent'}
                     `}
                >
                  <mod.icon className={`h-5 w-5 ${isActive ? mod.color : 'text-neutral-500'}`} />
                  <span className={`text-[13px] font-medium hidden md:block ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                    {mod.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto px-2 w-full mb-2">
            <Link to="/experiments/new">
              <div
                className="flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-amber-500/90 hover:bg-amber-500/10 border border-transparent transition-all duration-200"
              >
                <Zap className="h-5 w-5" />
                <span className="text-[13px] font-medium hidden md:block">Initialize Training</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Dynamic Main Workspace Plane */}
        <div className="flex-1 relative bg-gradient-to-br from-[#0c0c11] to-[#040406] overflow-hidden flex flex-col p-4">
          {/* Rendering specific active tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full flex flex-col"
            >
              {activeTab === 'notebook' && (
                <div className="h-full flex flex-col border border-white/5 bg-[#08080c] rounded-xl shadow-2xl overflow-hidden">
                  <OsPanelHeader icon={BookOpen} title="CyberHex Advanced Notebook Engine" active />
                  <div className="p-6 flex-1 overflow-auto flex flex-col gap-4 bg-[url('/noise.png')]">
                    {/* Markdown Block */}
                    <div className="w-full bg-[#111116] border border-white/10 rounded-lg p-5 shadow-inner">
                      <h1 className="text-2xl font-bold text-white mb-2 font-spectral">CyberHex Architecture Note</h1>
                      <p className="text-neutral-400 text-sm">Training an advanced causal language model using <strong className="text-amber-500">AdamW</strong> optimization with FlashAttention mechanisms. This notebook bridges markdown math and execution seamlessly.</p>
                    </div>
                    {/* Code Block */}
                    <div className="w-full bg-[#0a0a0e] border border-neutral-800 rounded-lg overflow-hidden shadow-2xl mt-2">
                      <div className="bg-neutral-900/80 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-neutral-500 border-b border-black">
                        <div className="flex gap-2 items-center">
                          <Code className="h-3 w-3" />
                          <span>Cell [1] - C++ [Deep Core]</span>
                        </div>
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Execution Complete (0.8s)</span>
                      </div>
                      <div className="p-5 font-mono text-[13px] leading-relaxed text-neutral-300 whitespace-pre bg-[#040406]">
                        <span className="text-pink-400">import</span> torch<br />
                        <span className="text-pink-400">from</span> torch.optim <span className="text-pink-400">import</span> AdamW<br /><br />
                        model = Transformer(d_model=<span className="text-amber-400">4096</span>, layers=<span className="text-amber-400">32</span>)<br />
                        optimizer = AdamW(model.parameters(), lr=<span className="text-amber-400">3e-4</span>)<br />
                      </div>
                    </div>
                    {/* Output block */}
                    <div className="w-full flex gap-4 mt-2">
                      <div className="flex-1 bg-black border border-white/5 rounded-lg p-5 flex flex-col shadow-inner">
                        <span className="text-neutral-500 text-[10px] font-mono mb-3 uppercase flex items-center gap-2"><Activity className="h-3 w-3 text-cyan-400" /> STDOUT PORT 8080</span>
                        <div className="text-emerald-400/80 font-mono text-xs leading-relaxed">
                          ❯ Initializing Cluster Compute... OK<br />
                          ❯ Allocating 4x H100 GPUs... OK<br />
                          ❯ Applying Model Distribution Policy... OK<br />
                          ❯ FlashAttention Enabled.<br />
                          ❯ Ready for `optimizer.step()`.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'math' && (
                <div className="h-full flex flex-col border border-violet-500/20 bg-[#08080c] rounded-xl shadow-[0_0_50px_rgba(139,92,246,0.05)] overflow-hidden relative group">
                  <OsPanelHeader icon={BrainCircuit} title="Mathematical Exploration Engine" active />
                  <div className="p-8 flex-1 overflow-auto flex flex-col gap-8 relative z-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-4xl font-light text-white tracking-tight mb-2 font-spectral">Stochastic Gradient Descent</h2>
                        <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">Interactive optimization landscape visualization. Manipulate learning rates, momentum, and view structural gradient flows across an arbitrary topology.</p>
                      </div>
                      <Button className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-violet-400/50">
                        <Maximize2 className="h-4 w-4 mr-2" /> Full 3D Vector Space
                      </Button>
                    </div>

                    <div className="flex gap-6 h-[400px]">
                      {/* Visual Engine Space */}
                      <div className="flex-1 rounded-xl bg-gradient-to-br from-[#0c051a] to-[#04020a] border border-violet-500/30 relative overflow-hidden flex items-center justify-center group-hover:border-violet-500/50 transition-colors shadow-2xl">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf61a_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf61a_1px,transparent_1px)] bg-[size:40px_40px] perspective-1000 transform scale-150 rotate-x-60"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-violet-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                        <span className="relative z-10 text-violet-300 font-mono text-xs tracking-widest border border-violet-500/50 px-4 py-2 rounded bg-violet-950/60 backdrop-blur-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">WebGPU Canvas Render Target</span>
                      </div>

                      {/* Interactivity Plane */}
                      <div className="w-80 flex flex-col gap-5 bg-white/[0.02] border border-white/5 rounded-xl p-5 shadow-inner">
                        <h4 className="text-neutral-200 font-semibold mb-2 font-spectral">Hyperplane Controls</h4>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[11px] font-mono text-neutral-400 flex justify-between mb-2 uppercase">Learning Rate <span className="text-violet-400">0.003</span></label>
                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden mb-1"><div className="h-full w-1/3 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] rounded-full"></div></div>
                          </div>
                          <div>
                            <label className="text-[11px] font-mono text-neutral-400 flex justify-between mb-2 uppercase">Momentum <span className="text-violet-400">0.9</span></label>
                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden mb-1"><div className="h-full w-[90%] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] rounded-full"></div></div>
                          </div>
                          <div>
                            <label className="text-[11px] font-mono text-neutral-400 flex justify-between mb-2 uppercase">Weight Decay <span className="text-violet-400">1e-4</span></label>
                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden mb-1"><div className="h-full w-1/6 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] rounded-full"></div></div>
                          </div>
                        </div>
                        <div className="mt-auto bg-black border border-violet-500/30 p-4 rounded-lg shadow-inner">
                          <div className="text-[13px] font-mono text-violet-300 font-bold tracking-wide">
                            {"θ_{t+1} = θ_t - η ∇L(θ_t)"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="h-full flex flex-col border border-blue-500/20 bg-[#08080c] rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.05)] overflow-hidden relative">
                  <OsPanelHeader icon={Database} title="Data Science Workbench" active />
                  <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
                    <div className="grid grid-cols-4 gap-4">
                      {['Data Profiling', 'Feature Engineering', 'Outlier Repair', 'Encodings & Scaling'].map((title, i) => (
                        <div key={i} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-blue-500/40 cursor-pointer transition-all p-5 rounded-xl shadow-lg flex flex-col justify-between h-32 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)]">
                          <span className="text-sm font-semibold text-neutral-200">{title}</span>
                          <Activity className="h-6 w-6 text-blue-500 opacity-60 self-end" />
                        </div>
                      ))}
                    </div>

                    <div className="flex-1 bg-[#050508] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                      <div className="h-10 px-4 border-b border-white/10 flex items-center gap-6 bg-[#0a0a0f]">
                        {['training_data_v7.csv', 'customer_segments.parquet', 'financials.json'].map((f, i) => (
                          <span key={i} className={`text-[12px] font-mono cursor-pointer transition-colors ${i === 0 ? 'text-blue-400 font-bold border-b-2 border-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}>{f}</span>
                        ))}
                      </div>
                      <div className="flex-1 p-0 overflow-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 text-[10px] font-mono text-neutral-400 tracking-wider">
                              <th className="p-4 border-b border-white/10 uppercase font-semibold">id</th>
                              <th className="p-4 border-b border-white/10 uppercase font-semibold">feature_x <span className="text-blue-500 bg-blue-500/10 px-1 rounded ml-1">F32</span></th>
                              <th className="p-4 border-b border-white/10 uppercase font-semibold">feature_y <span className="text-blue-500 bg-blue-500/10 px-1 rounded ml-1">F32</span></th>
                              <th className="p-4 border-b border-white/10 uppercase font-semibold">category <span className="text-amber-500 bg-amber-500/10 px-1 rounded ml-1">CAT</span></th>
                              <th className="p-4 border-b border-white/10 uppercase font-semibold">target <span className="text-rose-500 bg-rose-500/10 px-1 rounded ml-1">BOOL</span></th>
                            </tr>
                          </thead>
                          <tbody className="text-[12px] text-neutral-300/80 font-mono">
                            {Array.from({ length: 15 }).map((_, i) => (
                              <tr key={i} className="hover:bg-blue-500/5 transition-colors border-b border-white/[0.03]">
                                <td className="px-4 py-3 opacity-50">{1000 + i}</td>
                                <td className="px-4 py-3">{(Math.random() * 4).toFixed(4)}</td>
                                <td className="px-4 py-3">{(Math.random() * -2).toFixed(4)}</td>
                                <td className="px-4 py-3"><span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 border border-neutral-700 font-semibold">Level_{Math.floor(Math.random() * 4)}</span></td>
                                <td className="px-4 py-3">{Math.random() > 0.5 ? <span className="text-rose-400">1</span> : <span className="text-neutral-500">0</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'research' && (
                <div className="h-full flex flex-col border border-emerald-500/20 bg-[#08080c] rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.05)] overflow-hidden relative">
                  <OsPanelHeader icon={Library} title="Scientific Research Hub" active />
                  <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                    <div className="w-[350px] bg-[#050508] border border-white/10 rounded-xl flex flex-col p-5 shadow-lg">
                      <h3 className="text-neutral-200 font-semibold mb-4 font-spectral">Paper References</h3>
                      <input placeholder="Search ArXiv Database..." className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white mb-5 outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-colors placeholder:text-neutral-600" />
                      <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-hide">
                        {[
                          "Attention Is All You Need (Vaswani et al.)",
                          "AdamW Optimizer (Loshchilov et al.)",
                          "FlashAttention (Dao et al.)",
                          "Deep Residual Learning (He et al.)",
                          "Generative Adversarial Nets (Goodfellow et al.)"
                        ].map((p, i) => (
                          <div key={i} className="p-4 rounded-lg border border-white/5 hover:border-emerald-500/50 bg-[#0a0a0f] cursor-pointer group shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                            <h4 className="text-[13px] font-medium text-emerald-100/90 group-hover:text-emerald-400 transition-colors mb-2 leading-snug">{p}</h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 group-hover:text-emerald-500/70 transition-colors">Cite | BibTeX | PDF</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-[#06110c] to-[#040605] border border-emerald-500/20 rounded-xl p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]"></div>
                      <h2 className="text-6xl font-spectral font-light text-emerald-400 mb-6 tracking-tight z-10 drop-shadow-md">Export to LaTeX</h2>
                      <p className="text-neutral-400 max-w-lg text-center z-10 mb-10 text-lg leading-relaxed font-light">Generate a mathematically rigorous, publication-ready scientific report corresponding to your current experiment tracking history automatically.</p>
                      <div className="flex gap-5 z-10">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-6 text-md shadow-[0_0_20px_rgba(16,185,129,0.3)]">IEEE Proceedings</Button>
                        <Button variant="outline" className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/40 px-8 py-6 text-md">Nature Journal</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seamless integration of list components inside OS Workspace panel */}
              {activeTab === 'experiments' && (
                <div className="h-full flex flex-col relative w-full overflow-hidden">
                  <ExperimentsListPage />
                </div>
              )}

              {activeTab === 'mlops' && (
                <div className="h-full flex flex-col relative w-full overflow-hidden">
                  <ModelsPage />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Omni Foot Navbar */}
      <div className="h-7 shrink-0 bg-[#030305] border-t border-white/5 flex items-center justify-between px-4 text-[9px] font-mono text-neutral-600 uppercase tracking-widest z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-emerald-500" /> ENGINE ONLINE</span>
          <span className="text-neutral-500">Node: A100-80GB x8</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">CyberHex 7.0Local.mini</span>
        </div>
      </div>
    </div>
  );
}
