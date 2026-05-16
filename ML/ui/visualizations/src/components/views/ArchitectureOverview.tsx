import { useEffect, useState, useRef } from 'react';
import type { NetworkArchitecture } from '../../types/model';

interface ArchitectureOverviewProps {
  architecture: NetworkArchitecture;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = value;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="animate-count">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function ArchitectureOverview({ architecture }: ArchitectureOverviewProps) {
  const { layers, totalParams, inputSize, outputSize } = architecture;

  const paramBreakdown = layers.map((layer, i) => {
    const wCols = layer.weights[0]?.length ?? 0;
    const paramCount = layer.weights.length * wCols + layer.bias.length;
    const pct = totalParams > 0 ? (paramCount / totalParams) * 100 : 0;
    return { index: i, layer, paramCount, pct };
  });

  return (
    <div className="space-y-5">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center text-[10px]">📦</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Layers</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <AnimatedCounter value={layers.length} />
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">Fully connected dense layers</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center text-[10px]">⚙️</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Params</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono glow-text-cyan">
            <AnimatedCounter value={totalParams} />
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">Weights + biases</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-[10px]">⬇️</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Input</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <AnimatedCounter value={inputSize} />
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">Feature dimension</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded bg-rose-500/10 flex items-center justify-center text-[10px]">⬆️</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Output</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono glow-text-purple">
            <AnimatedCounter value={outputSize} />
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">Prediction dimension</div>
        </div>
      </div>

      {/* Parameter distribution bar */}
      <div className="card-gradient rounded-xl p-5">
        <h3 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Parameter Distribution</h3>
        <div className="flex h-5 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
          {paramBreakdown.map(({ index, pct }) => (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(180deg, rgba(6,182,212,${0.3 + index * 0.2}) 0%, rgba(6,182,212,${0.1 + index * 0.1}) 100%)`,
                minWidth: pct > 0 ? '2px' : '0',
              }}
              title={`Layer ${index}: ${pct.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2 flex-wrap">
          {paramBreakdown.map(({ index, pct, paramCount }) => (
            <div key={index} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `rgba(6,182,212,${0.3 + index * 0.2})` }}
              />
              <span className="text-slate-500">L{index}</span>
              <span className="text-slate-300 font-mono">{pct.toFixed(1)}%</span>
              <span className="text-slate-600">({paramCount.toLocaleString()})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-900/80">
              <th className="text-left py-3 px-4 font-medium text-slate-500 w-12">#</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Input</th>
              <th className="text-center py-3 px-4 font-medium text-slate-700 w-8">→</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Output</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Weights</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Params</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {layers.map((layer, i) => {
              const wRows = layer.weights.length;
              const wCols = layer.weights[0]?.length ?? 0;
              const paramCount = wRows * wCols + layer.bias.length;
              const pctTotal = totalParams > 0 ? ((paramCount / totalParams) * 100).toFixed(1) : '0';
              return (
                <tr key={i} className="hover:bg-slate-900/40 transition-colors group">
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{i}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 font-mono text-[10px] text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                      {layer.layerType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">{layer.inputShape}</td>
                  <td className="py-3 px-4 text-center text-slate-700">→</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">{layer.outputShape}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    {wRows}×{wCols}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-slate-300">{paramCount.toLocaleString()}</span>
                    <span className="text-slate-600 ml-1.5 text-[10px]">({pctTotal}%)</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      <div className="flex justify-end items-center gap-2 text-xs text-slate-500">
        <span>Total parameters:</span>
        <span className="text-slate-200 font-mono font-medium">{totalParams.toLocaleString()}</span>
      </div>
    </div>
  );
}