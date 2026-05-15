import { useEffect, useRef } from 'react';

interface TrainingChartProps {
  epochs: number[];
  trainLoss: number[];
  valLoss?: number[];
  height?: number;
}

export default function TrainingChart({ epochs, trainLoss, valLoss, height = 300 }: TrainingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, rect.width, height);

    const allLosses = [...trainLoss, ...(valLoss || [])].filter((v) => isFinite(v));
    if (allLosses.length === 0) return;

    const minLoss = Math.floor(Math.min(0, ...allLosses) * 100) / 100;
    const maxLoss = Math.ceil(Math.max(...allLosses) * 100) / 100;
    const lossRange = maxLoss - minLoss || 1;

    const scaleX = (i: number) => padding.left + (i / Math.max(epochs.length - 1, 1)) * chartW;
    const scaleY = (v: number) => padding.top + chartH - ((v - minLoss) / lossRange) * chartH;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      const val = maxLoss - (lossRange * i) / 5;
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(2), padding.left - 8, y + 4);
    }

    for (let i = 0; i <= Math.min(epochs.length, 10); i++) {
      const epochIdx = Math.floor((i / Math.min(epochs.length, 10)) * (epochs.length - 1));
      const x = scaleX(epochIdx);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillStyle = '#6B7280';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(epochs[epochIdx] || 0), x, padding.top + chartH + 16);
    }

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Epoch', padding.left + chartW / 2, height - 4);

    const drawLine = (data: number[], color: string, width: number) => {
      if (data.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = scaleX(i);
        const y = scaleY(data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawLine(trainLoss, '#818CF8', 2);

    if (valLoss && valLoss.length > 0) {
      drawLine(valLoss, '#34D399', 2);
    }

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#818CF8';
    ctx.textAlign = 'left';
    ctx.fillText('Train Loss', padding.left, padding.top - 6);

    if (valLoss && valLoss.length > 0) {
      ctx.fillStyle = '#34D399';
      ctx.fillText('Val Loss', padding.left + 95, padding.top - 6);
    }
  }, [epochs, trainLoss, valLoss, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}