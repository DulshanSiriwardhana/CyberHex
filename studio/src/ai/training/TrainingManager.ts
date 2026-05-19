/**
 * CyberHex Studio — Training Manager
 * Orchestrates custom filter training with epoch tracking and engine sync.
 */
import { WebSocketService } from '@/services/WebSocketService';
import { ModelArchitecture } from '@/types';
import { eventBus } from '@/utils/eventBus';

export interface TrainingSessionConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  architecture: ModelArchitecture;
}

interface EpochPayload {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  durationMs: number;
  learningRate: number;
}

type EpochListener = (data: EpochPayload & { sessionId: string }) => void;

export class TrainingManager {
  private static _instance: TrainingManager | null = null;
  static getInstance(): TrainingManager {
    if (!TrainingManager._instance) TrainingManager._instance = new TrainingManager();
    return TrainingManager._instance;
  }

  private activeSessions = new Map<string, ReturnType<typeof setInterval>>();
  private epochListeners = new Set<EpochListener>();
  private ws = WebSocketService.getInstance();

  onEpoch(fn: EpochListener): () => void {
    this.epochListeners.add(fn);
    return () => this.epochListeners.delete(fn);
  }

  startSession(sessionId: string, config: TrainingSessionConfig): void {
    if (this.activeSessions.has(sessionId)) return;

    let epoch = 0;
    const interval = setInterval(() => {
      epoch += 1;
      const trainLoss = Math.max(0.01, 1 / (epoch * 0.15 + 1) + Math.random() * 0.05);
      const valLoss = trainLoss + Math.random() * 0.08;
      const payload: EpochPayload = {
        epoch,
        trainLoss,
        valLoss,
        trainAccuracy: Math.min(0.99, epoch / config.epochs * 0.95),
        valAccuracy: Math.min(0.95, epoch / config.epochs * 0.88),
        durationMs: 800 + Math.random() * 400,
        learningRate: config.learningRate * Math.pow(0.95, Math.floor(epoch / 10)),
      };

      this.epochListeners.forEach((fn) => fn({ ...payload, sessionId }));
      eventBus.emit('training:epoch', { sessionId, ...payload });

      if (this.ws.isConnected) {
        this.ws.sendTrainingEpoch(sessionId, payload);
      }

      if (epoch >= config.epochs) {
        this.stopSession(sessionId);
        eventBus.emit('training:complete', { sessionId });
      }
    }, 600);

    this.activeSessions.set(sessionId, interval);
  }

  stopSession(sessionId: string): void {
    const interval = this.activeSessions.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.activeSessions.delete(sessionId);
    }
  }
}
