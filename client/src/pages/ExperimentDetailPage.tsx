import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FlaskConical,
  Play,
  Square,
  RefreshCw,
  TrendingDown,
  BarChart3,
  Clock,
  Layers,
  Cpu,
  Download,
  Activity,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container, Grid, Stack, Flex } from '@/components/ui/layout';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/toaster';
import { experimentsApi, engineApi, type TrainingStatus } from '@/lib/api';

interface LivePoint {
  epoch: number;
  loss: number;
  valLoss?: number;
}

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'training' | 'completed' | 'failed' | 'stopped'>('idle');
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(50);
  const [lossData, setLossData] = useState<LivePoint[]>([]);
  const [bestLoss, setBestLoss] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [engineBusy, setEngineBusy] = useState<'export' | 'infer' | null>(null);
  const [lastPredictions, setLastPredictions] = useState<string | null>(null);

  const exp = {
    id,
    name: `Experiment #${id}`,
    dataset: 'MNIST',
    layers: ['Dense(128, relu)', 'Dense(64, relu)', 'Dense(10, softmax)'],
    learningRate: 0.001,
    batchSize: 32,
    startedAt: '2 hours ago',
  };

  // Fetch initial training status
  useEffect(() => {
    if (!id) return;
    experimentsApi.getTrainingStatus(id)
      .then(data => {
        if (data.metrics) {
          const points: LivePoint[] = data.metrics.epochs.map((e, i) => ({
            epoch: e,
            loss: data.metrics!.train_loss[i] ?? 0,
            valLoss: data.metrics!.val_loss[i],
          }));
          setLossData(points);
          setBestLoss(data.metrics.best_val_loss ?? Math.min(...data.metrics.train_loss));
          setCurrentEpoch(data.metrics.epochs.length);
        }
        setStatus(data.status as typeof status);
        const mp = data.results?.modelPath;
        if (mp) setModelPath(mp);
      })
      .catch(() => {
        // Backend may not be running — use demo data
        generateDemoData();
      });
  }, [id]);

  function weightsPrefix(path: string) {
    return path.endsWith('_weights') ? path.slice(0, -'_weights'.length) : path;
  }

  async function handleExportOnnx() {
    if (!modelPath) {
      toast('error', 'No trained model', 'Complete training before exporting ONNX');
      return;
    }
    setEngineBusy('export');
    try {
      const result = await engineApi.exportOnnx({
        weightsPrefix: weightsPrefix(modelPath),
        task: 'regression',
      });
      toast('success', 'ONNX exported', result.onnxPath);
    } catch {
      toast('error', 'Export failed', 'Ensure onnx is installed and weights exist on the server');
    } finally {
      setEngineBusy(null);
    }
  }

  async function handleRunInference() {
    if (!modelPath) {
      toast('error', 'No trained model', 'Complete training before running inference');
      return;
    }
    setEngineBusy('infer');
    try {
      const features = [Array.from({ length: 5 }, (_, i) => 0.1 * (i + 1))];
      const result = await engineApi.inference({
        modelPath,
        features,
        task: 'regression',
      });
      setLastPredictions(JSON.stringify(result.predictions));
      toast('success', 'Inference complete', `Backend: ${result.backend} (${result.latencyMs}ms)`);
    } catch {
      toast('error', 'Inference failed', 'Check engine health and model artifacts');
    } finally {
      setEngineBusy(null);
    }
  }

  // WebSocket for live updates
  const handleWsMessage = useCallback((data: any) => {
    if (
      data.type === 'training_metrics' ||
      data.type === 'training_metric' ||
      data.type === 'epoch' ||
      data.epoch !== undefined
    ) {
      const epoch = data.epoch ?? data.currentEpoch ?? 0;
      const loss = data.loss ?? data.trainLoss ?? data.train_loss ?? 0;
      const valLoss = data.valLoss ?? data.val_loss;
      setCurrentEpoch(epoch);
      setLossData(prev => {
        const filtered = prev.filter(p => p.epoch !== epoch);
        return [...filtered, { epoch, loss, valLoss }].sort((a, b) => a.epoch - b.epoch);
      });
      if (valLoss !== undefined && (bestLoss === null || valLoss < bestLoss)) {
        setBestLoss(valLoss);
      }
      if (data.status) setStatus(data.status);
    }
    if (data.type === 'training_complete') {
      setStatus('completed');
      toast('success', 'Training Complete', `Experiment #${id} finished training`);
    }
    if (data.type === 'training_error') {
      setStatus('failed');
      toast('error', 'Training Failed', data.message ?? 'An error occurred during training');
    }
  }, [bestLoss, id, toast]);

  const wsBase = import.meta.env.VITE_WS_URL ?? 'ws://localhost:5000';
  const { isConnected, send, reconnect } = useWebSocket(
    `${wsBase}?experimentId=${id}`,
    handleWsMessage,
    { maxRetries: 3 }
  );

  useEffect(() => {
    setWsConnected(isConnected);
    if (isConnected) {
      toast('info', 'Connected', 'Live training updates active');
    }
  }, [isConnected, toast]);

  function generateDemoData() {
    const epochs = Array.from({ length: 25 }, (_, i) => i + 1);
    const trainLoss = epochs.map(e => 0.9 * Math.exp(-e * 0.08) + 0.1 + Math.random() * 0.05);
    const valLoss = epochs.map(e => 0.95 * Math.exp(-e * 0.07) + 0.12 + Math.random() * 0.06);
    setLossData(epochs.map((e, i) => ({ epoch: e, loss: trainLoss[i], valLoss: valLoss[i] })));
    setBestLoss(Math.min(...valLoss));
    setCurrentEpoch(23);
    setStatus('training');
  }

  function handleStartTraining() {
    if (!id) return;
    experimentsApi.startTraining(id)
      .then(() => {
        setStatus('training');
        toast('success', 'Training Started', `Experiment #${id} is now training`);
      })
      .catch(() => {
        toast('error', 'Failed to start', 'Could not start training. Is the backend running?');
      });
  }

  function handleStopTraining() {
    if (!id) return;
    experimentsApi.stopTraining(id)
      .then(() => {
        setStatus('stopped');
        toast('warning', 'Training Stopped', `Experiment #${id} was manually stopped`);
      })
      .catch(() => toast('error', 'Failed to stop', 'Could not stop training'));
  }

  const latest = lossData[lossData.length - 1];
  const initialLoss = lossData[0]?.loss ?? 0;
  const improvement = initialLoss > 0 ? ((initialLoss - (latest?.loss ?? 0)) / initialLoss * 100).toFixed(1) : '0';

  return (
    <Container className="py-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link to="/experiments" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          All experiments
        </Link>
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-green-400" />
              {exp.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={status === 'training' ? 'default' : status === 'completed' ? 'success' : status === 'failed' ? 'destructive' : 'muted'}>
                {status === 'training' && (
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                  </span>
                )}
                {status}
              </Badge>
              <span className="text-xs text-neutral-500">{exp.dataset}</span>
              {wsConnected && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Activity className="h-3 w-3" /> Live
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {status === 'training' ? (
              <Button variant="destructive" size="lg" onClick={handleStopTraining}>
                <Square className="h-4 w-4 mr-2" /> Stop
              </Button>
            ) : (
              <Button variant="success" size="lg" onClick={handleStartTraining}>
                <Play className="h-4 w-4 mr-2" /> Start Training
              </Button>
            )}
            <Button variant="outline" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" /> Restart
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!modelPath || engineBusy !== null}
              onClick={handleExportOnnx}
            >
              <Download className="h-4 w-4 mr-2" />
              {engineBusy === 'export' ? 'Exporting…' : 'Export ONNX'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={!modelPath || engineBusy !== null}
              onClick={handleRunInference}
            >
              <Cpu className="h-4 w-4 mr-2" />
              {engineBusy === 'infer' ? 'Running…' : 'Run Inference'}
            </Button>
          </div>
        </Flex>
      </motion.div>

      {/* Stats row */}
      <Grid cols={4} gap="md" className="mb-8">
        {[
          { icon: BarChart3, label: 'Best Loss', value: bestLoss?.toFixed(4) ?? '—', color: 'text-emerald-400' },
          { icon: TrendingDown, label: 'Current Loss', value: latest?.loss?.toFixed(4) ?? '—', color: 'text-rose-400' },
          { icon: Clock, label: 'Progress', value: `Epoch ${currentEpoch}/${totalEpochs}`, color: 'text-green-400' },
          { icon: Zap, label: 'Improvement', value: `${improvement}%`, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <StatCard>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`text-xl font-extrabold font-mono ${stat.color}`}>{stat.value}</div>
            </StatCard>
          </motion.div>
        ))}
      </Grid>

      {/* Training charts */}
      <Grid cols={2} gap="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                Loss Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lossData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={lossData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="epoch" stroke="#52525b" tick={{ fontSize: 10, fill: '#71717a' }} />
                    <YAxis stroke="#52525b" tick={{ fontSize: 10, fill: '#71717a' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#d4d4d8',
                      }}
                      formatter={(value: unknown) => [(value as number).toFixed(4)]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="loss" stroke="#818cf8" strokeWidth={2} dot={false} name="Train Loss" />
                    {lossData.some(d => d.valLoss !== undefined) && (
                      <Line type="monotone" dataKey="valLoss" stroke="#34d399" strokeWidth={2} dot={false} name="Val Loss" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-neutral-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  No training data yet. Start training to see metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Training Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto space-y-2 font-mono text-xs">
                {lossData.length > 0 ? (
                  lossData.slice(-20).reverse().map((p) => (
                    <div key={p.epoch} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-neutral-800/30">
                      <span className="text-neutral-400">Epoch {p.epoch}</span>
                      <div className="flex gap-4">
                        <span className="text-indigo-400">Loss: {p.loss.toFixed(4)}</span>
                        {p.valLoss !== undefined && (
                          <span className="text-emerald-400">Val: {p.valLoss.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-600">
                    No logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {lastPredictions && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-green-400" />
                Latest engine inference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono text-neutral-400 overflow-x-auto">{lastPredictions}</pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Architecture */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-400" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Flex gap="sm" wrap>
              {exp.layers.map((layer, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-sm font-mono text-green-400">
                    {layer}
                  </div>
                  {i < exp.layers.length - 1 && <ArrowLeft className="h-4 w-4 text-neutral-700 rotate-180" />}
                </div>
              ))}
            </Flex>
            <Grid cols={3} gap="sm" className="mt-4">
              <div className="text-xs text-neutral-500">Learning Rate: <span className="text-neutral-300 font-mono">{exp.learningRate}</span></div>
              <div className="text-xs text-neutral-500">Batch Size: <span className="text-neutral-300 font-mono">{exp.batchSize}</span></div>
              <div className="text-xs text-neutral-500">Dataset: <span className="text-neutral-300 font-mono">{exp.dataset}</span></div>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}