import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface LossChartViewProps {
  data: { epoch: number; loss: number }[];
}

export default function LossChartView({ data }: LossChartViewProps) {
  const [logScale, setLogScale] = useState(false);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        No loss data available
      </div>
    );
  }

  const minLoss = Math.min(...data.map(d => d.loss));
  const finalLoss = data[data.length - 1].loss;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-4 text-xs">
          <span className="text-gray-400">
            Min Loss: <span className="text-emerald-400 font-mono">{minLoss.toFixed(6)}</span>
          </span>
          <span className="text-gray-400">
            Final Loss: <span className="text-cyan-400 font-mono">{finalLoss.toFixed(6)}</span>
          </span>
          <span className="text-gray-400">
            Epochs: <span className="text-white font-mono">{data.length}</span>
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={logScale}
            onChange={e => setLogScale(e.target.checked)}
            className="accent-cyan-500"
          />
          Log Scale
        </label>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="epoch"
            stroke="#64748b"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            scale={logScale ? 'log' : 'linear'}
            domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
            label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e40af',
              borderRadius: 6,
              fontSize: 12,
              color: '#e2e8f0',
            }}
            labelFormatter={(label) => `Epoch ${label}`}
            formatter={(value: unknown) => [(value as number).toFixed(6), 'Loss']}
          />
          <ReferenceLine y={minLoss} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line
            type="monotone"
            dataKey="loss"
            stroke="#06b6d4"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: '#22d3ee' }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}