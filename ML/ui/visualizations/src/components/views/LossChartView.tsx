import { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface LossChartViewProps {
  data: { epoch: number; loss: number }[];
}

export default function LossChartView({ data }: LossChartViewProps) {
  const [logScale, setLogScale] = useState(false);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No loss data available
      </div>
    );
  }

  const minLoss = Math.min(...data.map(d => d.loss));
  const finalLoss = data[data.length - 1].loss;
  const maxLoss = Math.max(...data.map(d => d.loss));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-5 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Min Loss</span>
            <span className="text-emerald-400 font-mono font-medium">{minLoss.toFixed(6)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Final Loss</span>
            <span className="text-cyan-400 font-mono font-medium">{finalLoss.toFixed(6)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Epochs</span>
            <span className="text-white font-mono font-medium">{data.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Δ Loss</span>
            <span className="text-purple-400 font-mono font-medium">
              {(maxLoss - finalLoss).toFixed(4)}
            </span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={logScale}
            onChange={e => setLogScale(e.target.checked)}
            className="accent-cyan-500 w-3 h-3"
          />
          Log Scale
        </label>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
          <XAxis
            dataKey="epoch"
            stroke="#475569"
            tick={{ fontSize: 10, fill: '#64748b' }}
            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#475569', fontSize: 11 }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 10, fill: '#64748b' }}
            scale={logScale ? 'log' : 'linear'}
            domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
            label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)',
            }}
            labelFormatter={(label) => `Epoch ${label}`}
            formatter={(value: unknown) => [(value as number).toFixed(6), 'Loss']}
          />
          <ReferenceLine y={minLoss} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} strokeWidth={1} />
          <Area type="monotone" dataKey="loss" fill="url(#lossGradient)" stroke="none" />
          <Line
            type="monotone"
            dataKey="loss"
            stroke="#22d3ee"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}