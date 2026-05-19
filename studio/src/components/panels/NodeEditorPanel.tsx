/**
 * CyberHex Studio — Node-Based Visual Processing Editor
 */
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { NeuralFilterType } from '@/types';

export interface ProcessingNode {
  id: string;
  type: 'input' | 'filter' | 'output' | 'merge';
  label: string;
  filterType?: NeuralFilterType;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
}

const DEFAULT_NODES: ProcessingNode[] = [
  { id: 'in', type: 'input', label: 'Webcam Input', x: 40, y: 120, inputs: [], outputs: ['n1'] },
  { id: 'n1', type: 'filter', label: 'Background Blur', filterType: NeuralFilterType.BACKGROUND_BLUR, x: 220, y: 80, inputs: ['in'], outputs: ['n2'] },
  { id: 'n2', type: 'filter', label: 'Edge Enhance', filterType: NeuralFilterType.EDGE_ENHANCEMENT, x: 400, y: 120, inputs: ['n1'], outputs: ['out'] },
  { id: 'out', type: 'output', label: 'Canvas Output', x: 580, y: 120, inputs: ['n2'], outputs: [] },
];

interface NodeEditorPanelProps {
  fullWidth?: boolean;
}

export const NodeEditorPanel: React.FC<NodeEditorPanelProps> = ({ fullWidth }) => {
  const [nodes, setNodes] = useState<ProcessingNode[]>(DEFAULT_NODES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addFilterNode = () => {
    const id = `n_${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: 'filter',
        label: 'Cyberpunk',
        filterType: NeuralFilterType.CYBERPUNK,
        x: 300 + Math.random() * 100,
        y: 200 + Math.random() * 80,
        inputs: [],
        outputs: [],
      },
    ]);
  };

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id && !n.inputs.includes(id)));
    setSelectedId(null);
  }, []);

  const nodeColor = (type: ProcessingNode['type']) => {
    switch (type) {
      case 'input': return 'border-neon-green/50 bg-neon-green/10';
      case 'output': return 'border-neon-magenta/50 bg-neon-magenta/10';
      case 'filter': return 'border-neon-cyan/50 bg-neon-cyan/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  return (
    <div className={`flex flex-col ${fullWidth ? 'h-full' : 'h-[320px]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-white/50 uppercase flex items-center gap-1">
          <Layers size={12} /> Processing Graph
        </span>
        <button type="button" onClick={addFilterNode} className="text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1 text-[10px]">
          <Plus size={12} /> Node
        </button>
      </div>

      <div className="flex-1 relative rounded-lg border border-white/10 bg-black/30 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.flatMap((node) =>
            node.outputs.map((outId) => {
              const target = nodes.find((n) => n.id === outId);
              if (!target) return null;
              return (
                <line
                  key={`${node.id}-${outId}`}
                  x1={node.x + 100}
                  y1={node.y + 24}
                  x2={target.x}
                  y2={target.y + 24}
                  stroke="rgba(0,240,255,0.3)"
                  strokeWidth={2}
                />
              );
            })
          )}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === node.id ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y } : n
                )
              );
            }}
            onClick={() => setSelectedId(node.id)}
            className={`absolute w-[100px] px-2 py-2 rounded-lg border cursor-move text-[10px] font-mono ${nodeColor(node.type)} ${
              selectedId === node.id ? 'ring-2 ring-neon-cyan/50' : ''
            }`}
            style={{ left: node.x, top: node.y }}
          >
            <p className="text-white/80 truncate">{node.label}</p>
            <p className="text-white/30 text-[9px]">{node.type}</p>
          </motion.div>
        ))}
      </div>

      {selectedId && (
        <div className="mt-2 flex items-center justify-between glass-panel p-2 rounded">
          <span className="text-white/60">{nodes.find((n) => n.id === selectedId)?.label}</span>
          <button type="button" onClick={() => removeNode(selectedId)} className="text-red-400 hover:text-red-300">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
