import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { LayerInfo } from '../../types/model';

interface Network3DViewProps {
  layers: LayerInfo[];
}

const MAX_NEURONS = 32;
const LAYER_SPACING = 5;
const NEURON_SPACING = 1.2;
const NEURON_RADIUS = 0.2;

function NeuronParticles({ layers }: { layers: LayerInfo[] }) {
  const displayCounts = layers.map(l => Math.min(l.outputShape, MAX_NEURONS));

  // Compute positions and colors
  const neurons = useMemo(() => {
    const result: { pos: [number, number, number]; color: string; layer: number; index: number }[] = [];
    const totalWidth = (layers.length - 1) * LAYER_SPACING;
    const startX = -totalWidth / 2;

    for (let li = 0; li < layers.length; li++) {
      const count = displayCounts[li];
      const totalH = (count - 1) * NEURON_SPACING;
      const startY = totalH / 2;
      const x = startX + li * LAYER_SPACING;
      const weightsRow = layers[li].weights[0] ?? [];

      for (let ni = 0; ni < count; ni++) {
        const y = startY - ni * NEURON_SPACING;
        const z = 0;
        const weight = weightsRow[ni % weightsRow.length] ?? 0;
        const norm = Math.tanh(Math.abs(weight) * 2);
        const color = weight >= 0
          ? `#${Math.floor(6 + norm * 0).toString(16).padStart(2, '0')}${Math.floor(182 - norm * 100).toString(16).padStart(2, '0')}${Math.floor(212).toString(16).padStart(2, '0')}`
          : `#${Math.floor(239).toString(16).padStart(2, '0')}${Math.floor(68 + norm * 100).toString(16).padStart(2, '0')}${Math.floor(68).toString(16).padStart(2, '0')}`;
        result.push({ pos: [x, y, z], color, layer: li, index: ni });
      }
    }
    return result;
  }, [layers, displayCounts]);

  return (
    <group>
      {neurons.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[NEURON_RADIUS, 16, 16]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Connections({ layers }: { layers: LayerInfo[] }) {
  const displayCounts = layers.map(l => Math.min(l.outputShape, MAX_NEURONS));
  const totalWidth = (layers.length - 1) * LAYER_SPACING;
  const startX = -totalWidth / 2;

  const lines = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number]; color: string; opacity: number }[] = [];

    for (let li = 0; li < layers.length - 1; li++) {
      const srcCount = displayCounts[li];
      const dstCount = displayCounts[li + 1];
      const srcTotalH = (srcCount - 1) * NEURON_SPACING;
      const srcStartY = srcTotalH / 2;
      const dstTotalH = (dstCount - 1) * NEURON_SPACING;
      const dstStartY = dstTotalH / 2;
      const srcX = startX + li * LAYER_SPACING;
      const dstX = startX + (li + 1) * LAYER_SPACING;
      const srcStep = Math.max(1, Math.floor(srcCount / 8));
      const dstStep = Math.max(1, Math.floor(dstCount / 8));

      for (let si = 0; si < srcCount; si += srcStep) {
        for (let di = 0; di < dstCount; di += dstStep) {
          const weightVal = layers[li].weights[si % layers[li].weights.length]?.[di % layers[li].weights[0]?.length] ?? 0;
          const opacity = Math.min(0.5, Math.abs(weightVal) * 1.5 + 0.05);
          const color = weightVal >= 0 ? '#06b6d4' : '#ef4444';
          result.push({
            start: [srcX, srcStartY - si * NEURON_SPACING, 0] as [number, number, number],
            end: [dstX, dstStartY - di * NEURON_SPACING, 0] as [number, number, number],
            color,
            opacity,
          });
        }
      }
    }
    return result;
  }, [layers, displayCounts]);

  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      // Subtle pulse
      ref.current.children.forEach((child, i) => {
        if (child instanceof THREE.Line) {
          const mat = child.material as THREE.LineBasicMaterial;
          mat.opacity = lines[i % lines.length]?.opacity ?? 0.1;
        }
      });
    }
  });

  return (
    <group ref={ref}>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={[l.start, l.end]}
          color={l.color}
          lineWidth={0.5}
          transparent
          opacity={l.opacity}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

function LayerLabels({ layers }: { layers: LayerInfo[] }) {
  const totalWidth = (layers.length - 1) * LAYER_SPACING;
  const startX = -totalWidth / 2;
  const displayCounts = layers.map(l => Math.min(l.outputShape, MAX_NEURONS));

  return (
    <group>
      {layers.map((l, i) => {
        const totalH = (displayCounts[i] - 1) * NEURON_SPACING;
        const topY = totalH / 2 + 0.8;
        const x = startX + i * LAYER_SPACING;
        return (
          <Html key={i} position={[x, topY, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-slate-950/80 px-1.5 py-0.5 rounded">
              {l.layerType}<br />
              <span className="text-[9px] text-slate-500">{l.inputShape}→{l.outputShape}</span>
            </div>
          </Html>
        );
      })}
    </group>
  );
}

export default function Network3DView({ layers }: Network3DViewProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  if (layers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-sm text-gray-500">
        No layer data for 3D view
      </div>
    );
  }

  return (
    <div className="w-full h-[550px] relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 14], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#020617' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[-10, -5, -5]} intensity={0.4} color="#ef4444" />
        <spotLight position={[0, 8, 8]} angle={0.5} penumbra={0.5} intensity={0.6} />

        <NeuronParticles layers={layers} />
        <Connections layers={layers} />
        <LayerLabels layers={layers} />

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.1}
          minDistance={4}
          maxDistance={25}
        />
        <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -4, 0]} />
      </Canvas>

      <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded border border-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Excitatory
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Inhibitory
        </span>
      </div>

      <button
        onClick={() => setAutoRotate(r => !r)}
        className={`absolute bottom-3 right-3 px-3 py-1.5 rounded text-[10px] border transition-colors ${
          autoRotate
            ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50'
            : 'bg-slate-800/50 text-slate-400 border-slate-700'
        }`}
      >
        {autoRotate ? '⏸ Pause Rotation' : '▶ Auto Rotate'}
      </button>
    </div>
  );
}