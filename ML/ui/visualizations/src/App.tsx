import { useState } from 'react';
import { useModelData, useLossData } from './hooks/useModelData';
import ArchitectureOverview from './components/views/ArchitectureOverview';
import NeuronNetwork2D from './components/views/NeuronNetwork2D';
import WeightHeatmapView from './components/views/WeightHeatmapView';
import Network3DView from './components/views/Network3DView';
import RealTimeTrainingView from './components/views/RealTimeTrainingView';
import LossChartView from './components/views/LossChartView';

type TabId = 'architecture' | 'network2d' | 'heatmap' | 'network3d' | 'loss' | 'realtime';

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
  { id: 'architecture', label: 'Architecture', icon: '🏗️', description: 'Layer-by-layer model summary' },
  { id: 'network2d', label: '2D Network', icon: '🕸️', description: 'Interactive neuron & connection canvas' },
  { id: 'heatmap', label: 'Weight Heatmap', icon: '🔥', description: 'Per-layer weight matrix visualization' },
  { id: 'network3d', label: '3D Network', icon: '🌐', description: 'Three.js neural network render' },
  { id: 'loss', label: 'Loss Curve', icon: '📉', description: 'Epoch vs loss from CSV data' },
  { id: 'realtime', label: 'Real-Time', icon: '📡', description: 'Live WebSocket training dashboard' },
];

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
      <span className="text-sm text-slate-500 animate-pulse">Loading model data...</span>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-red-400 text-lg">Failed to load data</div>
      <div className="text-slate-500 text-sm max-w-md text-center">{message}</div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded text-sm hover:bg-slate-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const { architecture, loadState, errorMessage, progress } = useModelData();
  const { data: lossData, loadState: lossLoadState } = useLossData();

  const isLoading = loadState === 'loading';
  const isError = loadState === 'error';
  const isLoaded = loadState === 'loaded' && architecture;

  const layers = architecture?.layers ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🧠</span>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight">
                CyberHex Model Inspector
              </h1>
              {isLoaded && (
                <p className="text-[10px] text-slate-500">
                  {architecture.layers.length} layers · {architecture.totalParams.toLocaleString()} params
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            {isLoading && <span>Loading layers... {Math.round(progress)}%</span>}
            {isError && <span className="text-red-400">Error loading data</span>}
            {isLoaded && (
              <span className="text-emerald-500">
                ●{' '}
                <span className="text-slate-500">
                  {architecture.inputSize} → {architecture.outputSize}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="max-w-[1600px] mx-auto px-6 pb-2 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-inner shadow-slate-900/50'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
              title={tab.description}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Loading */}
        {isLoading && <Spinner />}

        {/* Error */}
        {isError && <ErrorScreen message={errorMessage} onRetry={() => window.location.reload()} />}

        {/* Loaded content */}
        {isLoaded && (
          <div className="animate-in fade-in duration-300">
            {activeTab === 'architecture' && <ArchitectureOverview architecture={architecture} />}

            {activeTab === 'network2d' && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-slate-300">2D Neuron & Connection Visualization</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hover over neurons to highlight connections. Scroll to zoom, drag to pan.
                    Cyan = positive weights (excitatory), Red = negative (inhibitory).
                  </p>
                </div>
                <NeuronNetwork2D layers={layers} />
              </section>
            )}

            {activeTab === 'heatmap' && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-slate-300">Weight Matrix Heatmap</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hover over cells to inspect weight values. Select layers to switch views.
                  </p>
                </div>
                <WeightHeatmapView layers={layers} />
              </section>
            )}

            {activeTab === 'network3d' && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-slate-300">3D Neural Network</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Orbit, zoom, and pan the 3D view. Excitatory (cyan) and inhibitory (red) connections shown.
                  </p>
                </div>
                <Network3DView layers={layers} />
              </section>
            )}

            {activeTab === 'loss' && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-slate-300">Training Loss Curve</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Loss data loaded from epoch_losses.csv. Toggle log scale for better visibility.
                  </p>
                </div>
                <div className={`bg-slate-950 rounded-lg border border-slate-800 p-5 ${lossLoadState === 'loading' ? 'animate-pulse' : ''}`}>
                  {lossLoadState === 'loading' ? (
                    <div className="flex items-center justify-center h-80 text-sm text-slate-500">
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
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-slate-300">Real-Time Training Monitor</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Connect to a WebSocket server (e.g., the C++ backend's WSServer on port 9002)
                    to receive live training metrics per epoch.
                  </p>
                </div>
                <RealTimeTrainingView layers={layers} />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-3 text-[10px] text-slate-600 flex items-center justify-between">
          <span>CyberHex Model Inspector v2.0</span>
          <span>Data source: /public/layer_*.json · /public/epoch_losses.csv</span>
        </div>
      </footer>
    </div>
  );
}