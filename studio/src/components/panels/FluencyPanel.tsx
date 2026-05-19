/**
 * CyberHex Studio — Fluency & Live Transcription Panel
 */
import React, { useEffect, useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { audioEngine } from '@/hooks/useStudioBootstrap';
import { useStudioStore } from '@/stores/studioStore';
import type { CorrectionResult, TranscriptSegment, FluencyMetrics } from '@/types';

export const FluencyPanel: React.FC = () => {
  const fluencyConfig = useStudioStore((s) => s.fluencyConfig);
  const [corrections, setCorrections] = useState<CorrectionResult[]>([]);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [metrics, setMetrics] = useState<FluencyMetrics | null>(null);

  useEffect(() => {
    const unsub1 = audioEngine.onCorrection((r) => {
      setCorrections((prev) => [r, ...prev].slice(0, 20));
    });
    const unsub2 = audioEngine.onTranscript((s) => {
      setSegments((prev) => [s, ...prev].slice(0, 30));
    });
    const unsub3 = audioEngine.onFluencyMetrics((m) => setMetrics(m));
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const demoCorrect = () => {
    const result = audioEngine.correctText('Yesterday I go market and buy many thing');
    setCorrections((prev) => [result, ...prev]);
  };

  return (
    <div className="flex flex-col gap-3 h-full text-xs overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="font-mono text-white/50 uppercase tracking-wider flex items-center gap-1">
          <MessageSquare size={12} /> English Fluency AI
        </span>
        <button type="button" onClick={demoCorrect} className="text-[10px] text-neon-cyan hover:underline font-mono">
          Demo
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-panel p-2">
            <p className="text-[10px] text-white/40">Fluency</p>
            <p className="text-neon-green font-mono">{(metrics.fluencyScore * 100).toFixed(0)}%</p>
          </div>
          <div className="glass-panel p-2">
            <p className="text-[10px] text-white/40">Clarity</p>
            <p className="text-neon-cyan font-mono">{(metrics.clarityScore * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {!fluencyConfig.enabled && (
        <p className="text-white/30 text-center py-2">Enable fluency AI in Audio panel (⌘M)</p>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {corrections.map((c, i) => (
          <div key={`${c.original}-${i}`} className="glass-panel p-2 rounded-lg border border-white/5">
            <p className="text-white/40 line-through">{c.original}</p>
            <p className="text-neon-green flex items-center gap-1 mt-1">
              <Sparkles size={10} />
              {c.corrected}
            </p>
            {c.corrections.length > 0 && (
              <p className="text-[10px] text-white/30 mt-1">{c.corrections[0].explanation}</p>
            )}
          </div>
        ))}

        {segments.map((s) => (
          <div key={s.id} className="text-[10px] text-white/50 border-l-2 border-neon-magenta/30 pl-2">
            {s.corrected || s.original}
          </div>
        ))}
      </div>
    </div>
  );
};
