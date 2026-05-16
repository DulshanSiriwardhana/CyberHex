import { useEffect, useRef, useState, useCallback } from 'react';
import type { LayerInfo } from '../../types/model';

interface WeightHeatmapViewProps {
  layers: LayerInfo[];
}

export default function WeightHeatmapView({ layers }: WeightHeatmapViewProps) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number; val: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width: Math.max(width - 32, 200), height: Math.max(height - 32, 200) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  const layer = layers[selectedLayer];
  const weights = layer?.weights ?? [];
  const rows = weights.length;
  const cols = weights[0]?.length ?? 0;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows === 0 || cols === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;

    // Padding for labels
    const padLeft = 60;
    const padTop = 30;
    const padRight = 20;
    const padBottom = 50;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(padLeft, padTop, plotW, plotH);

    const cellW = plotW / cols;
    const cellH = plotH / rows;

    // Find value range
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = weights[r][c];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal), 0.001);

    // Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = weights[r][c];
        const norm = val / absMax; // -1 to 1
        const x = padLeft + c * cellW;
        const y = padTop + r * cellH;

        if (norm >= 0) {
          const intensity = Math.min(1, norm);
          ctx.fillStyle = `rgba(6, 182, 212, ${intensity * 0.9 + 0.05})`;
        } else {
          const intensity = Math.min(1, -norm);
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.9 + 0.05})`;
        }
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      }
    }

    // Hover highlight
    if (hoverCell && hoverCell.row < rows && hoverCell.col < cols) {
      const x = padLeft + hoverCell.col * cellW;
      const y = padTop + hoverCell.row * cellH;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellW, cellH);
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    // X axis: show every Nth column label
    const xStep = Math.max(1, Math.floor(cols / 20));
    for (let c = 0; c < cols; c += xStep) {
      const x = padLeft + c * cellW + cellW / 2;
      ctx.fillText(`${c}`, x, padTop + plotH + 14);
    }

    // Y axis: show every Nth row label
    ctx.textAlign = 'right';
    const yStep = Math.max(1, Math.floor(rows / 15));
    for (let r = 0; r < rows; r += yStep) {
      const y = padTop + r * cellH + cellH / 2 + 3;
      ctx.fillText(`${r}`, padLeft - 6, y);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Layer ${selectedLayer}: ${layer.layerType} [${rows}×${cols}]`, w / 2, 16);

    // Color bar
    const barX = padLeft + plotW + 8;
    const barW = 10;
    const barH = plotH;
    const barY = padTop;
    for (let i = 0; i < barH; i++) {
      const t = 1 - i / barH;
      const norm = t * 2 - 1;
      if (norm >= 0) {
        const intensity = norm;
        ctx.fillStyle = `rgba(6, 182, 212, ${intensity * 0.9 + 0.1})`;
      } else {
        const intensity = -norm;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.9 + 0.1})`;
      }
      ctx.fillRect(barX, barY + i, barW, 1);
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.font = '9px monospace';
    ctx.fillText(`+${absMax.toFixed(2)}`, barX + barW + 4, barY + 8);
    ctx.fillText(`0`, barX + barW + 4, barY + barH / 2 + 3);
    ctx.fillText(`${(-absMax).toFixed(2)}`, barX + barW + 4, barY + barH - 4);
  }, [weights, dimensions, selectedLayer, layer, hoverCell, rows, cols]);

  useEffect(() => {
    draw();
  }, [draw]);

  if (layers.length === 0) {
    return <div className="text-gray-500 p-6 text-center text-sm">No layer data available.</div>;
  }

  return (
    <div className="w-full">
      {/* Layer selector */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-gray-400">Layer:</span>
        {layers.map((l, i) => (
          <button
            key={i}
            onClick={() => setSelectedLayer(i)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              i === selectedLayer
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {l.layerType} [{l.weights.length}×{l.weights[0]?.length}]
          </button>
        ))}
      </div>

      {/* Heatmap canvas */}
      <div
        ref={containerRef}
        className="w-full min-h-[420px] relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden"
        onMouseMove={e => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect || rows === 0 || cols === 0) return;
          const padLeft = 60;
          const padTop = 30;
          const padRight = 20;
          const padBottom = 50;
          const plotW = dimensions.width - padLeft - padRight;
          const plotH = dimensions.height - padTop - padBottom;
          const cellW = plotW / cols;
          const cellH = plotH / rows;
          const mx = e.clientX - rect.left - padLeft;
          const my = e.clientY - rect.top - padTop;
          const col = Math.floor(mx / cellW);
          const row = Math.floor(my / cellH);
          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            setHoverCell({ row, col, val: weights[row][col] });
          } else {
            setHoverCell(null);
          }
        }}
        onMouseLeave={() => setHoverCell(null)}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        {hoverCell && (
          <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-200 z-10">
            W[{hoverCell.row}][{hoverCell.col}] ={' '}
            <span className={hoverCell.val >= 0 ? 'text-cyan-400' : 'text-red-400'}>
              {hoverCell.val.toFixed(6)}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-3 text-xs text-gray-500">
        <span>
          Shape: <span className="text-gray-300 font-mono">{rows} × {cols}</span>
        </span>
        <span>
          Params: <span className="text-gray-300 font-mono">{(rows * cols).toLocaleString()}</span>
        </span>
        <span>
          Bias size: <span className="text-gray-300 font-mono">{layer.bias.length.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}