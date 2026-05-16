import { useRef, useEffect, useState, useCallback } from 'react';
import type { LayerInfo } from '../../types/model';

interface NeuronNetwork2DProps {
  layers: LayerInfo[];
}

interface NeuronPos {
  x: number;
  y: number;
  layer: number;
  index: number;
  weight: number;
}

const MAX_DISPLAY_NEURONS = 64;
const NEURON_RADIUS = 6;
const LAYER_GAP = 180;
const VERTICAL_PADDING = 40;

export default function NeuronNetwork2D({ layers }: NeuronNetwork2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<{
    layer: number;
    index: number;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // Subsample large layers for display
  const displayNeurons = layers.map(l =>
    Math.min(l.outputShape, MAX_DISPLAY_NEURONS)
  );

  const totalWidth = layers.length * LAYER_GAP + 100;
  const maxNeurons = Math.max(...displayNeurons);
  const layerHeight = maxNeurons * (NEURON_RADIUS * 2 + 4) + VERTICAL_PADDING * 2;

  // Resize
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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';
    ctx.scale(dpr, dpr);

    const w = dimensions.width;
    const h = dimensions.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    const cx = w / 2 + offset.x;
    const cy = h / 2 + offset.y;

    // Precompute neuron positions
    const allNeurons: NeuronPos[][] = [];
    for (let li = 0; li < layers.length; li++) {
      const lx = cx - (totalWidth * scale) / 2 + li * LAYER_GAP * scale + 60 * scale;
      const neuronCount = displayNeurons[li];
      const totalH = neuronCount * (NEURON_RADIUS * 2 + 4) * scale;
      const startY = cy - totalH / 2;
      const neurons: NeuronPos[] = [];
      for (let ni = 0; ni < neuronCount; ni++) {
        const y = startY + ni * (NEURON_RADIUS * 2 + 4) * scale;
        // Get representative weight (first input weight, or 0)
        const weight =
          layers[li].weights[0]?.[ni % layers[li].weights[0]?.length] ?? 0;
        neurons.push({ x: lx, y, layer: li, index: ni, weight });
      }
      allNeurons.push(neurons);
    }

    // Draw connections (sampled for performance)
    for (let li = 0; li < allNeurons.length - 1; li++) {
      const src = allNeurons[li];
      const dst = allNeurons[li + 1];
      const step = Math.max(1, Math.floor(src.length / 16));
      for (let si = 0; si < src.length; si += step) {
        for (let di = 0; di < dst.length; di += step) {
          const weightVal =
            layers[li].weights[si % layers[li].weights.length]?.[
              di % layers[li].weights[0]?.length
            ] ?? 0;
          const alpha = Math.min(0.25, Math.abs(weightVal) * 0.3);
          const color = weightVal >= 0
            ? `rgba(6,182,212,${alpha})`
            : `rgba(239,68,68,${alpha})`;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(src[si].x, src[si].y);
          ctx.lineTo(dst[di].x, dst[di].y);
          ctx.stroke();
        }
      }
    }

    // Highlight hovered connections
    if (hoveredNeuron && hoveredNeuron.layer < allNeurons.length - 1) {
      const srcNeurons = allNeurons[hoveredNeuron.layer];
      const dstNeurons = allNeurons[hoveredNeuron.layer + 1];
      const si = hoveredNeuron.index;
      if (srcNeurons[si]) {
        const step = Math.max(1, Math.floor(dstNeurons.length / 16));
        for (let di = 0; di < dstNeurons.length; di += step) {
          const weightVal =
            layers[hoveredNeuron.layer].weights[
              si % layers[hoveredNeuron.layer].weights.length
            ]?.[di % layers[hoveredNeuron.layer].weights[0]?.length] ?? 0;
          const alpha = Math.min(0.7, Math.abs(weightVal) * 1.5 + 0.15);
          const color = weightVal >= 0
            ? `rgba(34,211,238,${alpha})`
            : `rgba(248,113,113,${alpha})`;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(srcNeurons[si].x, srcNeurons[si].y);
          ctx.lineTo(dstNeurons[di].x, dstNeurons[di].y);
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    for (const layerNeurons of allNeurons) {
      for (const n of layerNeurons) {
        const intensity = Math.min(1, Math.abs(n.weight) * 0.6 + 0.4);
        const isHovered =
          hoveredNeuron?.layer === n.layer && hoveredNeuron?.index === n.index;
        const r = isHovered ? NEURON_RADIUS * 1.5 * scale : NEURON_RADIUS * scale;

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
        grad.addColorStop(0, n.weight >= 0
          ? `rgba(6,182,212,${0.6 * intensity})`
          : `rgba(239,68,68,${0.6 * intensity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = n.weight >= 0
          ? `rgba(6,182,212,${intensity})`
          : `rgba(239,68,68,${intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Border for hovered
        if (isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // Layer labels
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = 'center';
    for (let li = 0; li < allNeurons.length; li++) {
      const lx = allNeurons[li][0]?.x ?? 0;
      const topY = cy - (layerHeight * scale) / 2 - 15;
      ctx.fillStyle = '#64748b';
      ctx.fillText(
        `${layers[li].layerType} ${layers[li].inputShape}→${layers[li].outputShape}`,
        lx,
        topY
      );
    }
  }, [layers, dimensions, scale, offset, hoveredNeuron, displayNeurons, totalWidth, layerHeight]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getNeuronAt = (
    mx: number,
    my: number
  ): { layer: number; index: number } | null => {
    const w = dimensions.width;
    const h = dimensions.height;
    const cx = w / 2 + offset.x;
    const cy = h / 2 + offset.y;

    for (let li = 0; li < layers.length; li++) {
      const lx = cx - (totalWidth * scale) / 2 + li * LAYER_GAP * scale + 60 * scale;
      const neuronCount = displayNeurons[li];
      const totalH = neuronCount * (NEURON_RADIUS * 2 + 4) * scale;
      const startY = cy - totalH / 2;
      for (let ni = 0; ni < neuronCount; ni++) {
        const ny = startY + ni * (NEURON_RADIUS * 2 + 4) * scale;
        if (Math.hypot(mx - lx, my - ny) < NEURON_RADIUS * scale + 4) {
          return { layer: li, index: ni };
        }
      }
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 cursor-grab active:cursor-grabbing"
      onWheel={e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(s => Math.min(5, Math.max(0.3, s * delta)));
      }}
      onMouseDown={e => {
        isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseMove={e => {
        if (isPanning.current) {
          const dx = e.clientX - lastPan.current.x;
          const dy = e.clientY - lastPan.current.y;
          setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
          lastPan.current = { x: e.clientX, y: e.clientY };
          return;
        }
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setHoveredNeuron(getNeuronAt(mx, my));
      }}
      onMouseUp={() => { isPanning.current = false; }}
      onMouseLeave={() => { isPanning.current = false; setHoveredNeuron(null); }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded border border-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Excitatory (+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Inhibitory (-)
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">Scroll to zoom · Drag to pan</span>
      </div>
      {hoveredNeuron && (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono">
          Layer {hoveredNeuron.layer} ({layers[hoveredNeuron.layer]?.layerType})
          — Neuron {hoveredNeuron.index}
        </div>
      )}
    </div>
  );
}