import { useState, useEffect, useCallback } from 'react';
import { useModelData, useLossData } from './hooks/useModelData';
import ArchitectureOverview from './components/views/ArchitectureOverview';
import NeuronNetwork2D from './components/views/NeuronNetwork2D';
import WeightHeatmapView from './components/views/WeightHeatmapView';
import Network3DView from './components/views/Network3DView';
import RealTimeTrainingView from './components/views/RealTimeTrainingView';
import LossChartView from './components/views/LossChartView';
import DistributionView from './components/views/DistributionView';

type TabId = 'architecture' | 'network2d' | 'heatmap' | 'network3d' | 'distribution' | 'loss' | 'realtime';

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
  { id: 'architecture', label: 'Architecture', icon: '🏗️', description: 'Layer-by-layer model summary' },
  { id: 'network2d', label: '2D Network', icon: '🕸️', description: 'Interactive neuron & connection canvas' },
  { id: 'heatmap', label: 'Weight Heatmap', icon: '🔥', description: 'Per-layer weight matrix visualization' },
  { id: 'network3d', label: '3D Network', icon: '🌐', description: 'Three.js neural network render' },
  { id: 'distribution', label: 'Distribution', icon: '📊', description: 'Weight/bias histograms & stats' },
  { id: 'loss', label: 'Loss Curve', icon: '📉', description: 'Epoch vs loss from CSV data' },
  { id: 'realtime', label: 'Real-Time', icon: '📡', description: 'Live WebSocket training dashboard' },
];

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${5 + Math.random() * 7}s`,
          }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin pulse-ring" />
      <p className="text-sm text-slate-400 animate-pulse">Loading model layers...</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
        ⚠️
      </div>
      <div className="text-red-400 text-lg font-medium">Failed to load data</div>
      <div className="text-slate-400 text-sm max-w-md text-center">{message}</div>
      <button
        onClick={onRetry}
        className="mt-2 px-5 py-2 bg-slate-800 text-slate-200 border border-slate-600 rounded-lg text-sm hover:bg-slate-700 hover:border-slate-500 transition-all"
      >
        Retry
      </button>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { architecture, loadState, errorMessage, progress } = useModelData();
  const { data: lossData, loadState: lossLoadState } = useLossData();

  const isLoading = loadState === 'loading';
  const isError = loadState === 'error';
  const isLoaded = loadState === 'loaded' && architecture;

  const layers = architecture?.layers ?? [];

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const keyMap: Record<string, TabId> = {
        '1': 'architecture',
        '2': 'network2d',
        '3': 'heatmap',
        '4': 'network3d',
        '5': 'distribution',
        '6': 'loss',
        '7': 'realtime',
      };
      if (e.key === '?' || e.key === 'h') {
        setShowShortcuts(s => !s);
        return;
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const tab = keyMap[e.key];
      if (tab) setActiveTab(tab);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const exportSummary = useCallback(() => {
    if (!architecture) return;
    const summary = {
      exportedAt: new Date().toISOString(),
      inputSize: architecture.inputSize,
      outputSize: architecture.outputSize,
      totalParams: architecture.totalParams,
      numLayers: architecture.layers.length,
      layers: architecture.layers.map((l, i) => ({
        index: i,
        type: l.layerType,
        inputShape: l.inputShape,
        outputShape: l.outputShape,
        weightShape: [l.weights.length, l.weights[0]?.length ?? 0],
        biasSize: l.bias.length,
        weightMean: (l.weights.flat().reduce((a, b) => a + b, 0) / l.weights.flat().length).toFixed(6),
        weightStd: Math.sqrt(l.weights.flat().reduce((s, w) => {
          const mean = l.weights.flat().reduce((a, b) => a + b, 0) / l.weights.flat().length;
          return s + (w - mean) ** 2;
        }, 0) / l.weights.flat().length).toFixed(6),
      })),
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-summary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [architecture]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      {/* Animated background */}
      <div className="fixed inset-0 bg-grid z-0" aria-hidden="true" />
      <FloatingParticles />

      {/* Ambient glow orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/3 blur-[120px] z-0 pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-[120px] z-0 pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center text-base">
              🧠
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                <span className="gradient-text">CyberHex</span>
                <span className="text-white ml-1.5">Model Inspector</span>
              </h1>
              {isLoaded && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {architecture.layers.length} layers · {architecture.totalParams.toLocaleString()} params
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            {isLoading && (
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-3 h-3 border border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
                Loading layers... {Math.round(progress)}%
              </span>
            )}
            {isError && <span className="text-red-400">● Error loading data</span>}
            {isLoaded && (
              <>
                <button
                  onClick={exportSummary}
                  className="px-2.5 py-1 bg-slate-900/60 border border-slate-700 rounded text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors flex items-center gap-1"
                  title="Export model summary as JSON"
                >
                  📥 JSON
                </button>
                <button
                  onClick={() => setShowShortcuts(s => !s)}
                  className="px-2 py-1 bg-slate-900/60 border border-slate-700 rounded text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
                  title="Keyboard shortcuts (? or h)"
                >
                  ?
                </button>
                <span className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400">
                    {architecture.inputSize} <span className="text-slate-600">→</span> {architecture.outputSize}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="max-w-[1600px] mx-auto px-6 pb-2 flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-white border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border border-transparent'
                }`}
                title={tab.description}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">
        {isLoading && <Spinner />}
        {isError && <ErrorScreen message={errorMessage} onRetry={() => window.location.reload()} />}

        {isLoaded && (
          <div className="animate-in fade-in duration-300">
            {activeTab === 'architecture' && <ArchitectureOverview architecture={architecture} />}

            {activeTab === 'network2d' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">2D Neuron & Connection Visualization</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Hover over neurons to highlight connections. Scroll to zoom, drag to pan.
                    <span className="text-cyan-400"> Cyan</span> = excitatory,{' '}
                    <span className="text-red-400">Red</span> = inhibitory.
                  </p>
                </div>
                <div className="card-gradient rounded-xl overflow-hidden">
                  <NeuronNetwork2D layers={layers} />
                </div>
              </section>
            )}

            {activeTab === 'heatmap' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">Weight Matrix Heatmap</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Hover over cells to inspect exact weight values. Select layers via the buttons above.
                  </p>
                </div>
                <div className="card-gradient rounded-xl p-5">
                  <WeightHeatmapView layers={layers} />
                </div>
              </section>
            )}

            {activeTab === 'network3d' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">3D Neural Network</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Orbit, zoom, and pan the 3D view. Auto-rotation can be paused. Connections colored by weight sign.
                  </p>
                </div>
                <div className="card-gradient rounded-xl overflow-hidden">
                  <Network3DView layers={layers} />
                </div>
              </section>
            )}

            {activeTab === 'distribution' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">Weight & Bias Distribution</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Histograms of weight and bias values per layer. Compare distributions across all layers or view stats table.
                  </p>
                </div>
                <div className="card-gradient rounded-xl p-5">
                  <DistributionView layers={layers} />
                </div>
              </section>
            )}

            {activeTab === 'loss' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">Training Loss Curve</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Data loaded from <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">epoch_losses.csv</code>.
                    Toggle log scale for better visibility on small losses.
                  </p>
                </div>
                <div className={`card-gradient rounded-xl p-5 ${lossLoadState === 'loading' ? 'animate-pulse' : ''}`}>
                  {lossLoadState === 'loading' ? (
                    <div className="flex items-center justify-center h-80 text-sm text-slate-400">
                      Loading loss data...
                    </div>
                  ) : lossLoadState === 'error' ? (
                    <div className="flex items-center justify-center h-80 text-sm text-red-400">
                      Failed to load loss data
                    </div>
                  ) : (
                    <LossChartView data={lossData} />
                  )}
                </div>
              </section>
            )}

            {activeTab === 'realtime' && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white">Real-Time Training Monitor</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect to the C++ WSServer (
                    <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">ws://localhost:9002</code>
                    ) for live per-epoch metrics during training.
                  </p>
                </div>
                <div className="card-gradient rounded-xl p-5">
                  <RealTimeTrainingView layers={layers} />
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              {TABS.map((tab, i) => (
                <div key={tab.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/40">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span>{tab.icon}</span>
                    {tab.label}
                  </span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">{i + 1}</kbd>
                </div>
              ))}
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/40 mt-3 border-t border-slate-800 pt-3">
                <span className="text-slate-300">Toggle shortcuts</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">?</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/40">
                <span className="text-slate-300">Export JSON</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono text-[10px]">📥</kbd>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-4 text-center">Press Escape to close</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-4 text-[10px] text-slate-600 flex items-center justify-between">
          <span>
            <span className="gradient-text font-medium">CyberHex</span> Model Inspector v2.0
          </span>
          <span>Data source: /public/layer_*.json · /public/epoch_losses.csv</span>
        </div>
      </footer>
    </div>
  );
}