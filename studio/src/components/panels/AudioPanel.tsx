/**
 * CyberHex Studio — Audio Enhancement Panel
 */
import React, { useEffect, useState } from 'react';
import { Volume2, Waves, Zap } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { audioEngine } from '@/hooks/useStudioBootstrap';
import { Switch } from '@/components/ui/switch';
import type { AudioMetrics } from '@/types';

export const AudioPanel: React.FC = () => {
  const audioPipeline = useStudioStore((s) => s.audioPipeline);
  const fluencyConfig = useStudioStore((s) => s.fluencyConfig);
  const updateFluencyConfig = useStudioStore((s) => s.updateFluencyConfig);
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      try {
        setMetrics(audioEngine.getAudioMetrics());
      } catch {
        /* engine not initialized */
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const stages = audioPipeline?.stages ?? [];

  const toggleStage = (stageId: string, enabled: boolean) => {
    audioEngine.setProcessorEnabled(stageId, enabled);
    setTick((t) => t + 1);
  };

  return (
    <div className="flex flex-col gap-3 h-full text-xs">
      <div className="flex items-center gap-2 text-white/50 font-mono uppercase tracking-wider">
        <Volume2 size={14} className="text-neon-magenta" />
        Neural Audio Engine
      </div>

      {metrics && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'RMS', value: metrics.rms.toFixed(3) },
            { label: 'SNR', value: `${metrics.snr}dB` },
            { label: 'Voice', value: `${(metrics.voiceActivity * 100).toFixed(0)}%` },
          ].map((m) => (
            <div key={m.label} className="glass-panel p-2 text-center">
              <p className="text-[10px] text-white/40">{m.label}</p>
              <p className="text-neon-cyan font-mono">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] text-white/40 font-mono uppercase">Pipeline Stages</p>
        {stages.length === 0 ? (
          <p className="text-white/30 text-center py-4">Press ⌘M to initialize microphone</p>
        ) : (
          stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between glass-panel p-2 rounded-lg">
              <span className="flex items-center gap-2 text-white/70">
                <Waves size={12} className="text-neon-magenta" />
                {stage.name}
              </span>
              <Switch checked={stage.enabled} onCheckedChange={(v) => toggleStage(stage.id, v)} />
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/5 pt-3 space-y-3">
        <p className="text-[10px] text-white/40 font-mono uppercase flex items-center gap-1">
          <Zap size={10} /> English Fluency AI
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Live correction</span>
          <Switch
            checked={fluencyConfig.enabled}
            onCheckedChange={(v) => {
              updateFluencyConfig({ enabled: v });
              audioEngine.setFluencyConfig({ enabled: v });
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Subtitles</span>
          <Switch
            checked={fluencyConfig.generateSubtitles}
            onCheckedChange={(v) => updateFluencyConfig({ generateSubtitles: v })}
          />
        </div>
      </div>
    </div>
  );
};
