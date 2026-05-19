/**
 * CyberHex Studio — Custom Filter Training Dashboard
 */
import React, { useEffect, useState } from 'react';
import { Brain, Upload, Play, Pause, BarChart3 } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { TrainingManager } from '@/ai/training/TrainingManager';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ModelArchitecture } from '@/types';

const trainingManager = TrainingManager.getInstance();

interface TrainingPanelProps {
  fullWidth?: boolean;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ fullWidth }) => {
  const trainingSessions = useStudioStore((s) => s.trainingSessions);
  const startTraining = useStudioStore((s) => s.startTraining);
  const updateEpoch = useStudioStore((s) => s.updateEpoch);
  const endTraining = useStudioStore((s) => s.endTraining);
  const gpuReady = useStudioStore((s) => s.gpuReady);

  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.001);
  const [architecture, setArchitecture] = useState<ModelArchitecture>(ModelArchitecture.CYCLEGAN);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const sessions = Object.values(trainingSessions);
  const activeSession = activeSessionId ? trainingSessions[activeSessionId] : sessions.find((s) => s.status === 'running');

  useEffect(() => {
    const unsub = trainingManager.onEpoch((data) => {
      const sid = data.sessionId;
      updateEpoch(sid, {
        currentEpoch: data.epoch,
        metrics: {
          ...useStudioStore.getState().trainingSessions[sid]?.metrics,
          lossHistory: [
            ...(useStudioStore.getState().trainingSessions[sid]?.metrics.lossHistory ?? []),
            { step: data.epoch, loss: data.trainLoss, accuracy: data.trainAccuracy, timestamp: Date.now() },
          ],
          epochs: [
            ...(useStudioStore.getState().trainingSessions[sid]?.metrics.epochs ?? []),
            {
              epoch: data.epoch,
              trainLoss: data.trainLoss,
              valLoss: data.valLoss,
              trainAccuracy: data.trainAccuracy,
              valAccuracy: data.valAccuracy,
              durationMs: data.durationMs,
              learningRate: data.learningRate,
            },
          ],
          bestLoss: Math.min(useStudioStore.getState().trainingSessions[sid]?.metrics.bestLoss ?? Infinity, data.trainLoss),
          bestAccuracy: Math.max(useStudioStore.getState().trainingSessions[sid]?.metrics.bestAccuracy ?? 0, data.trainAccuracy),
        },
      });
    });
    return unsub;
  }, [updateEpoch]);

  const handleStart = () => {
    const sessionId = startTraining({
      modelName: `CustomFilter_${Date.now()}`,
      config: {
        modelArchitecture: architecture,
        epochs,
        batchSize,
        learningRate,
        optimizer: 'adam',
        lossFunction: 'mse',
        validationSplit: 0.2,
        earlyStopping: { patience: 5, minDelta: 0.001 },
        augmentation: true,
        mixedPrecision: gpuReady,
      },
      dataset: {
        name: 'User Dataset',
        totalSamples: 0,
        trainSamples: 0,
        valSamples: 0,
        testSamples: 0,
        inputShape: [256, 256, 3],
        classes: ['style'],
        augmentation: ['flip', 'rotate', 'color_jitter'],
        format: 'image/png',
      },
      status: 'running',
      startedAt: Date.now(),
      currentEpoch: 0,
      totalEpochs: epochs,
      metrics: {
        bestLoss: Infinity,
        bestAccuracy: 0,
        totalTime: 0,
        epochsPerSecond: 0,
        gpuUtilization: gpuReady ? 0.85 : 0.2,
        memoryUsageMB: 512,
        lossHistory: [],
        epochs: [],
      },
      checkpoints: [],
    });
    setActiveSessionId(sessionId);
    trainingManager.startSession(sessionId, { epochs, batchSize, learningRate, architecture });
  };

  const handleStop = () => {
    if (activeSessionId) {
      trainingManager.stopSession(activeSessionId);
      endTraining(activeSessionId, true);
    }
  };

  const lossHistory = activeSession?.metrics.lossHistory ?? [];
  const maxLoss = Math.max(...lossHistory.map((l) => l.loss), 1);

  return (
    <div className={`flex flex-col gap-4 text-xs ${fullWidth ? 'h-full' : ''}`}>
      <div className="flex items-center gap-2 font-mono text-white/50 uppercase">
        <Brain size={14} className="text-neon-cyan" />
        Filter Training Dashboard
      </div>

      <div className={`grid gap-4 ${fullWidth ? 'grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-white/40">Architecture</label>
            <select
              className="w-full mt-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white/70"
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value as ModelArchitecture)}
            >
              {Object.values(ModelArchitecture).map((a) => (
                <option key={a} value={a}>{a.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-white/40">Epochs: {epochs}</label>
            <Slider value={[epochs]} onValueChange={([v]) => setEpochs(v)} min={10} max={200} step={5} variant="neon" />
          </div>

          <div>
            <label className="text-[10px] text-white/40">Batch Size: {batchSize}</label>
            <Slider value={[batchSize]} onValueChange={([v]) => setBatchSize(v)} min={4} max={64} step={4} variant="neon" />
          </div>

          <div>
            <label className="text-[10px] text-white/40">Learning Rate: {learningRate.toFixed(4)}</label>
            <Slider value={[learningRate * 10000]} onValueChange={([v]) => setLearningRate(v / 10000)} min={1} max={100} step={1} variant="neon" />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" leftIcon={<Upload size={12} />}>Import Dataset</Button>
            {activeSession?.status === 'running' ? (
              <Button size="sm" variant="destructive" leftIcon={<Pause size={12} />} onClick={handleStop}>Stop</Button>
            ) : (
              <Button size="sm" leftIcon={<Play size={12} />} onClick={handleStart}>Start Training</Button>
            )}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-lg">
          <p className="text-[10px] text-white/40 font-mono uppercase mb-2 flex items-center gap-1">
            <BarChart3 size={10} /> Loss Visualization
          </p>
          {activeSession ? (
            <>
              <p className="text-neon-cyan font-mono mb-2">
                Epoch {activeSession.currentEpoch}/{activeSession.totalEpochs}
              </p>
              <div className="h-24 flex items-end gap-0.5">
                {lossHistory.slice(-40).map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-neon-cyan/80 to-neon-purple/40 rounded-t-sm min-w-[2px]"
                    style={{ height: `${Math.max(4, (1 - point.loss / maxLoss) * 100)}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                <div><span className="text-white/40">GPU</span> <span className="text-neon-green">{(activeSession.metrics.gpuUtilization * 100).toFixed(0)}%</span></div>
                <div><span className="text-white/40">Memory</span> <span className="text-white/70">{activeSession.metrics.memoryUsageMB}MB</span></div>
              </div>
            </>
          ) : (
            <p className="text-white/30 text-center py-8">No active training session</p>
          )}
        </div>
      </div>
    </div>
  );
};
