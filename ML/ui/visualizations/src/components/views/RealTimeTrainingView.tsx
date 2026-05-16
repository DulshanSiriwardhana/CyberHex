import { useState, useEffect, useRef, useCallback } from 'react';
import LossChartView from './LossChartView';
import type { LayerInfo } from '../../types/model';

interface RealTimeTrainingViewProps {
  layers: LayerInfo[];
}

interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy?: number;
  gradNorm?: number;
  learningRate?: number;
  elapsedSeconds?: number;
  timestamp: number;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export default function RealTimeTrainingView(_props: RealTimeTrainingViewProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [wsUrl, setWsUrl] = useState('ws://localhost:9002');
  const [metrics, setMetrics] = useState<TrainingMetric[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');
      setIsLive(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const metric: TrainingMetric = {
          epoch: data.epoch ?? 0,
          loss: data.loss ?? 0,
          accuracy: data.accuracy,
          gradNorm: data.grad_norm,
          learningRate: data.learning_rate,
          elapsedSeconds: data.elapsed_seconds,
          timestamp: Date.now(),
        };
        setMetrics(prev => {
          const exists = prev.some(m => m.epoch === metric.epoch);
          if (exists) {
            return prev.map(m => (m.epoch === metric.epoch ? metric : m));
          }
          return [...prev, metric].slice(-500);
        });
        setCurrentEpoch(metric.epoch);
      } catch {
        // non-JSON messages ignored
      }
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      wsRef.current = null;
      if (isLive) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
    };
  }, [wsUrl, isLive]);

  const disconnect = useCallback(() => {
    setIsLive(false);
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, []);

  const latest = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* Connection controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          value={wsUrl}
          onChange={e => setWsUrl(e.target.value)}
          disabled={connectionState === 'connected'}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-300 w-56 focus:outline-none focus:border-cyan-600 disabled:opacity-50"
          placeholder="ws://..."
        />
        {connectionState !== 'connected' ? (
          <button
            onClick={() => { setIsLive(true); connect(); }}
            disabled={connectionState === 'connecting'}
            className="px-4 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded text-xs hover:bg-cyan-600/30 transition-colors disabled:opacity-50"
          >
            {connectionState === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-4 py-1.5 bg-red-600/20 text-red-400 border border-red-500/50 rounded text-xs hover:bg-red-600/30 transition-colors"
          >
            Disconnect
          </button>
        )}

        {/* Status indicator */}
        <span className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionState === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : connectionState === 'connecting'
                ? 'bg-amber-500 animate-pulse'
                : connectionState === 'error'
                ? 'bg-red-500'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-slate-400 capitalize">{connectionState}</span>
        </span>

        {connectionState === 'connected' && currentEpoch > 0 && (
          <span className="text-xs text-slate-500 ml-auto">
            Epoch <span className="text-cyan-400 font-mono">{currentEpoch}</span>
          </span>
        )}
      </div>

      {/* Live metric cards */}
      {latest && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Loss</div>
            <div className="text-lg font-mono text-red-400">{latest.loss.toFixed(6)}</div>
          </div>
          {latest.accuracy !== undefined && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Accuracy</div>
              <div className="text-lg font-mono text-emerald-400">{(latest.accuracy * 100).toFixed(2)}%</div>
            </div>
          )}
          {latest.gradNorm !== undefined && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Grad Norm</div>
              <div className="text-lg font-mono text-amber-400">{latest.gradNorm.toFixed(4)}</div>
            </div>
          )}
          {latest.learningRate !== undefined && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">LR</div>
              <div className="text-lg font-mono text-purple-400">{latest.learningRate.toExponential(3)}</div>
            </div>
          )}
          {latest.elapsedSeconds !== undefined && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Elapsed</div>
              <div className="text-lg font-mono text-slate-300">{latest.elapsedSeconds.toFixed(1)}s</div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">
            {isLive ? '📡 Live Training Loss' : '📊 Training Loss'}
          </h3>
          {metrics.length > 0 && (
            <span className="text-[10px] text-slate-500">{metrics.length} data points</span>
          )}
        </div>
        <LossChartView data={metrics.map(m => ({ epoch: m.epoch, loss: m.loss }))} />
      </div>

      {/* Simulate button for testing without WebSocket */}
      {!isLive && connectionState !== 'connected' && (
        <div className="text-center">
          <button
            onClick={() => {
              const fakeData: TrainingMetric[] = [];
              for (let i = 1; i <= 20; i++) {
                fakeData.push({
                  epoch: i,
                  loss: Math.exp(-i * 0.3) * 2 + Math.random() * 0.2,
                  timestamp: Date.now(),
                });
              }
              setMetrics(fakeData);
            }}
            className="px-4 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs hover:bg-slate-700 transition-colors"
          >
            📋 Load Sample Data
          </button>
          <p className="text-[10px] text-slate-600 mt-2">
            Connect a WebSocket server broadcasting{' '}
            <code className="text-slate-500">{'{ "epoch": 1, "loss": 0.42 }'}</code> messages,
            or load sample data to preview.
          </p>
        </div>
      )}
    </div>
  );
}