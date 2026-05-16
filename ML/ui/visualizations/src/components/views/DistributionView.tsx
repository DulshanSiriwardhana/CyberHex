import { useState, useRef, useEffect, useCallback } from 'react';
import type { LayerInfo } from '../../types/model';

interface DistributionViewProps {
  layers: LayerInfo[];
}

interface LayerStats {
  layerIndex: number;
  name: string;
  weightMean: number;
  weightStd: number;
  weightMin: number;
  weightMax: number;
  weightSparsity: number;
  biasMean: number;
  biasStd: number;
  biasMin: number;
  biasMax: number;
  totalWeights: number;
}

function computeStats(layers: LayerInfo[]): LayerStats[] {
  return layers.map((layer, i) => {
    const allWeights = layer.weights.flat();
    const wLen = allWeights.length;
    const wMean = allWeights.reduce((a, b) => a + b, 0) / wLen;
    const wVariance = allWeights.reduce((s, w) => s + (w - wMean) ** 2, 0) / wLen;
    const wStd = Math.sqrt(wVariance);
    const wMin = Math.min(...allWeights);
    const wMax = Math.max(...allWeights);
    const zeroCount = allWeights.filter(w => Math.abs(w) < 1e-8).length;
    const wSparsity = (zeroCount / wLen) * 100;

    const bias = layer.bias;
    const bLen = bias.length;
    const bMean = bias.reduce((a, b) => a + b, 0) / bLen;
    const bVariance = bias.reduce((s, b) => s + (b - bMean) ** 2, 0) / bLen;
    const bStd = Math.sqrt(bVariance);
    const bMin = Math.min(...bias);
    const bMax = Math.max(...bias);

    return {
      layerIndex: i,
      name: `${layer.layerType} L${i}`,
      weightMean: wMean,
      weightStd: wStd,
      weightMin: wMin,
      weightMax: wMax,
      weightSparsity: wSparsity,
      biasMean: bMean,
      biasStd: bStd,
      biasMin: bMin,
      biasMax: bMax,
      totalWeights: wLen,
    };
  });
}

function drawHistogram(
  ctx: CanvasRenderingContext2D,
  values: number[],
  bins: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  title: string
) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const binWidth = range / bins;
  const counts = new Array(bins).fill(0);

  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / binWidth));
    counts[idx]++;
  }

  const maxCount = Math.max(...counts, 1);
  const barW = w / bins;
  const dpr = window.devicePixelRatio || 1;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.fillRect(x, y, w, h);

  // Bars
  for (let i = 0; i < bins; i++) {
    const barH = (counts[i] / maxCount) * (h - 20);
    const barX = x + i * barW;
    const barY = y + h - barH - 10;
    const alpha = 0.3 + (counts[i] / maxCount) * 0.7;
    ctx.fillStyle = color.replace('1)', `${alpha})`).replace('rgb', 'rgba');
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    }
    ctx.fillRect(barX + 1, barY, barW - 2, barH);
  }

  // Border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y - 6);

  // X axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  const labelStep = Math.max(1, Math.floor(bins / 5));
  for (let i = 0; i < bins; i += labelStep) {
    const val = min + i * binWidth + binWidth / 2;
    const lx = x + i * barW + barW / 2;
    ctx.fillText(val.toFixed(2), lx, y + h - 2);
  }

  // Mean line
  const valuesMean = values.reduce((a, b) => a + b, 0) / values.length;
  const meanX = x + ((valuesMean - min) / range) * w;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(meanX, y);
  ctx.lineTo(meanX, y + h - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`μ=${valuesMean.toFixed(3)}`, meanX, y - 6);
}

export default function DistributionView({ layers }: DistributionViewProps) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [mode, setMode] = useState<'histogram' | 'compare' | 'stats'>('histogram');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const stats = computeStats(layers);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  const drawHistograms = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (mode === 'histogram') {
      const layer = layers[selectedLayer];
      const allW = layer.weights.flat();
      const bias = layer.bias;

      const padLeft = 48;
      const padRight = 16;
      const padTop = 30;
      const padBottom = 8;
      const midGap = 24;
      const plotW = (w - padLeft - padRight);
      const plotH = (h - padTop - padBottom - midGap) / 2;

      // Weight histogram
      drawHistogram(ctx, allW, 50, padLeft, padTop, plotW, plotH, '#06b6d4', `Layer ${selectedLayer} Weights (n=${allW.length.toLocaleString()})`);

      // Bias histogram
      drawHistogram(ctx, bias, Math.min(30, bias.length), padLeft, padTop + plotH + midGap, plotW, plotH, '#a855f7', `Layer ${selectedLayer} Biases (n=${bias.length.toLocaleString()})`);
    }

    if (mode === 'compare') {
      const padLeft = 48;
      const padRight = 16;
      const padTop = 30;
      const padBottom = 8;
      const gap = 8;
      const plotH = (h - padTop - padBottom - gap * (layers.length - 1)) / layers.length;
      const plotW = w - padLeft - padRight;

      for (let li = 0; li < layers.length; li++) {
        const allW = layers[li].weights.flat();
        const y = padTop + li * (plotH + gap);
        drawHistogram(ctx, allW, 40, padLeft, y, plotW, plotH, '#06b6d4', `Layer ${li} Weights (n=${allW.length.toLocaleString()})`);
      }
    }

    if (mode === 'stats') {
      // Table rendering on canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(20, 20, w - 40, h - 40);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(20, 20, w - 40, h - 40);

      const headers = ['Layer', 'W Mean', 'W Std', 'W Min', 'W Max', 'Spars%', 'B Mean', 'B Std', 'B Min', 'B Max'];
      const colW = (w - 40) / headers.length;
      const rowH = 32;
      const startY = 44;

      // Header row
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, w - 40, rowH);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      headers.forEach((hdr, i) => {
        ctx.fillText(hdr, 20 + i * colW + colW / 2, 20 + rowH / 2 + 3);
      });

      // Data rows
      stats.forEach((s, ri) => {
        const ry = startY + ri * rowH;
        if (ri % 2 === 0) {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
          ctx.fillRect(20, ry, w - 40, rowH);
        }
        const row = [
          s.name,
          s.weightMean.toFixed(4),
          s.weightStd.toFixed(4),
          s.weightMin.toFixed(3),
          s.weightMax.toFixed(3),
          s.weightSparsity.toFixed(1) + '%',
          s.biasMean.toFixed(4),
          s.biasStd.toFixed(4),
          s.biasMin.toFixed(3),
          s.biasMax.toFixed(3),
        ];
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px monospace';
        row.forEach((val, ci) => {
          ctx.fillText(val, 20 + ci * colW + colW / 2, ry + rowH / 2 + 3);
        });
      });

      // Total stats card
      const allWeights = layers.flatMap(l => l.weights.flat());
      const allBiases = layers.flatMap(l => [...l.bias]);
      const totalW = allWeights.length;
      const meanW = allWeights.reduce((a, b) => a + b, 0) / totalW;
      const zeros = allWeights.filter(w => Math.abs(w) < 1e-8).length;

      const summaryY = startY + stats.length * rowH + 12;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, summaryY, w - 40, 36);
      ctx.fillStyle = '#22d3ee';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `All Layers: ${totalW.toLocaleString()} weights | Global μ=${meanW.toFixed(5)} | Zeros: ${zeros.toLocaleString()} (${((zeros / totalW) * 100).toFixed(1)}%)`,
        32,
        summaryY + 22
      );
    }
  }, [layers, dimensions, mode, selectedLayer, stats]);

  useEffect(() => {
    drawHistograms();
  }, [drawHistograms]);

  if (layers.length === 0) {
    return <div className="text-slate-500 p-6 text-sm text-center">No layer data available.</div>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">View:</span>
        {(['histogram', 'compare', 'stats'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === m
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {m === 'histogram' ? '📊 Per-Layer' : m === 'compare' ? '🔬 Compare All' : '📋 Stats Table'}
          </button>
        ))}

        {mode === 'histogram' && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-[10px] text-slate-500">Layer:</span>
            {layers.map((l, i) => (
              <button
                key={i}
                onClick={() => setSelectedLayer(i)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                  i === selectedLayer
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40'
                    : 'bg-slate-800/30 text-slate-500 border border-slate-700 hover:border-slate-600'
                }`}
              >
                L{i}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full min-h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Quick stats row */}
      {mode === 'histogram' && stats[selectedLayer] && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 text-[10px]">
          {[
            { label: 'W Mean', val: stats[selectedLayer].weightMean.toFixed(4), color: 'text-cyan-400' },
            { label: 'W Std', val: stats[selectedLayer].weightStd.toFixed(4), color: 'text-cyan-400' },
            { label: 'W Min', val: stats[selectedLayer].weightMin.toFixed(3), color: 'text-cyan-400' },
            { label: 'W Max', val: stats[selectedLayer].weightMax.toFixed(3), color: 'text-cyan-400' },
            { label: 'Sparsity', val: `${stats[selectedLayer].weightSparsity.toFixed(1)}%`, color: 'text-amber-400' },
            { label: 'B Mean', val: stats[selectedLayer].biasMean.toFixed(4), color: 'text-purple-400' },
            { label: 'B Std', val: stats[selectedLayer].biasStd.toFixed(4), color: 'text-purple-400' },
            { label: 'N Weights', val: stats[selectedLayer].totalWeights.toLocaleString(), color: 'text-slate-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-center">
              <div className="text-slate-500 mb-0.5">{label}</div>
              <div className={`font-mono font-medium ${color}`}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}