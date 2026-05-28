import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  Gauge,
  Brain,
  Sparkles,
  Save,
  Upload,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container, Grid, Stack, Flex } from '@/components/ui/layout';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/toaster';
import { experimentsApi, engineApi, modelsApi, type TrainingStatus, type Experiment } from '@/lib/api';
import Terminal from '@/components/terminal/Terminal';

interface LivePoint {
  epoch: number;
  loss: number;
  valLoss?: number;
  accuracy?: number;
  f1?: number;
  precision?: number;
  recall?: number;
  lr?: number;
}


const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 10,
  fontSize: 11,
  color: '#d4d4d8',
};

const AXIS_TICK = { fontSize: 10, fill: '#71717a' };
const GRID_COLOR = '#27272a';


const STATUS_VARIANT: Record<string, string> = {
  training: 'default',
  completed: 'success',
  failed: 'destructive',
  stopped: 'warning',
  idle: 'muted',
};


function PulseDot({ color = 'bg-green-400' }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <StatCard className="hover:border-green-500/20 transition-all duration-300 relative overflow-hidden">
        { }
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent"
          animate={{ y: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${color}`}>{value}</div>
          {sub && <div className="text-[10px] text-neutral-600 mt-1">{sub}</div>}
        </div>
      </StatCard>
    </motion.div>
  );
}


type TabKey = 'loss' | 'accuracy' | 'lr' | 'radar';

function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'loss', label: 'Loss Curves' },
    { key: 'accuracy', label: 'Accuracy / F1' },
    { key: 'lr', label: 'LR Schedule' },
    { key: 'radar', label: 'Metrics Radar' },
  ];
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-900/50 p-1 border border-neutral-800/60">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${active === t.key
            ? 'bg-green-500/15 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
            : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}


export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [status, setStatus] = useState<'idle' | 'training' | 'completed' | 'failed' | 'stopped'>('idle');
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(100);
  const [lossData, setLossData] = useState<LivePoint[]>([]);
  const [bestLoss, setBestLoss] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [engineBusy, setEngineBusy] = useState<'export' | 'infer' | null>(null);
  const [lastPredictions, setLastPredictions] = useState<string | null>(null);
  const [inferenceInputs, setInferenceInputs] = useState<string>('');
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('loss');
  const [isSaving, setIsSaving] = useState(false);


  const latest = lossData[lossData.length - 1];
  const initialLoss = lossData[0]?.loss ?? 0;
  const improvement = initialLoss > 0
    ? ((initialLoss - (latest?.loss ?? 0)) / initialLoss * 100).toFixed(1)
    : '0';
  const peakF1 = Math.max(...lossData.map(d => d.f1 ?? 0), 0);
  const peakAccuracy = Math.max(...lossData.map(d => d.accuracy ?? 0), 0);
  const peakPrecision = Math.max(...lossData.map(d => d.precision ?? 0), 0);
  const peakRecall = Math.max(...lossData.map(d => d.recall ?? 0), 0);


  const radarData = [
    { metric: 'Accuracy', value: +(peakAccuracy * 100).toFixed(1) },
    { metric: 'F1 Score', value: +(peakF1 * 100).toFixed(1) },
    { metric: 'Precision', value: +(peakPrecision * 100).toFixed(1) },
    { metric: 'Recall', value: +(peakRecall * 100).toFixed(1) },
    { metric: 'Stability', value: bestLoss !== null ? Math.max(0, +(100 - bestLoss * 100).toFixed(1)) : 0 },
  ];

  const fetchExperiment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await experimentsApi.get(id);
      setExperiment(data.experiment);
      setTotalEpochs(data.experiment.config.epochs);


      const r = data.experiment.results;
      if (r?.epochs?.length) {
        const pts: LivePoint[] = r.epochs.map((e: number, i: number) => ({
          epoch: e,
          loss: r.trainLoss?.[i] ?? 0,
          valLoss: r.valLoss?.[i],
          accuracy: r.accuracy?.[i],
          f1: r.f1?.[i],
          precision: r.precision?.[i],
          recall: r.recall?.[i],
          lr: r.learningRates?.[i],
        }));
        setLossData(pts);
        setBestLoss(r.bestValLoss ?? Math.min(...(r.trainLoss || [0])));
        setCurrentEpoch(r.epochs.length);
      }
      if (r?.modelPath) setModelPath(r.modelPath);
    } catch (err) {
      console.error('Failed to fetch experiment:', err);
      toast('error', 'Error', 'Failed to load experiment details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchExperiment(); }, [fetchExperiment]);

  useEffect(() => {
    if (!id) return;
    experimentsApi.getTrainingStatus(id)
      .then(data => {
        if (data.metrics) {
          const pts: LivePoint[] = data.metrics.epochs.map((e: number, i: number) => ({
            epoch: e,
            loss: data.metrics!.train_loss[i] ?? 0,
            valLoss: data.metrics!.val_loss?.[i],
            accuracy: data.metrics!.accuracy?.[i],
            f1: data.metrics!.f1?.[i],
            precision: data.metrics!.precision?.[i],
            recall: data.metrics!.recall?.[i],
            lr: data.metrics!.learning_rates?.[i],
          }));
          setLossData(pts);
          setBestLoss(data.metrics.best_val_loss ?? Math.min(...data.metrics.train_loss));
          setCurrentEpoch(data.metrics.epochs.length);
        }
        setStatus(data.status as typeof status);
        if (data.results?.modelPath) setModelPath(data.results.modelPath);
      })
      .catch(() => generateDemoData());
  }, [id]);

  function weightsPrefix(p: string) {
    return p.endsWith('_weights') ? p.slice(0, -'_weights'.length) : p;
  }

  async function handleExportOnnx() {
    if (!modelPath) { toast('error', 'No trained model', 'Complete training before exporting ONNX'); return; }
    setEngineBusy('export');
    try {
      const res = await engineApi.exportOnnx({ weightsPrefix: weightsPrefix(modelPath), task: 'regression' });
      toast('success', 'ONNX exported', res.onnxPath);
    } catch { toast('error', 'Export failed', 'Ensure onnx is installed and weights exist'); }
    finally { setEngineBusy(null); }
  }

  async function handleRunInference() {
    if (!modelPath) { toast('error', 'No trained model', 'Complete training first'); return; }
    setEngineBusy('infer');
    try {
      let features: number[][];
      if (inferenceInputs.trim()) {
        try {
          const parsed = JSON.parse(inferenceInputs);
          features = Array.isArray(parsed) ? (Array.isArray(parsed[0]) ? parsed : [parsed]) : [[parsed]];
        } catch (e) {
          // Try parsing as CSV
          const lines = inferenceInputs.trim().split('\n').filter(l => l.trim().length > 0);
          features = lines.map(line =>
            line.split(',')
              .map(v => v.trim())
              .filter(v => v !== '')
              .map(Number)
              .filter(v => !isNaN(v))
          );
          // Only use rows that match the expected input dimension if possible, 
          // or at least ensure they are not empty
          features = features.filter(row => row.length > 0);
        }
      } else {
        features = [Array.from({ length: experiment?.config.layers[0] ?? 5 }, (_, i) => 0.1 * (i + 1))];
      }
      const res = await engineApi.inference({ modelPath, features, task: experiment?.config.task ?? 'regression' });
      setLastPredictions(JSON.stringify(res.predictions, null, 2));
      toast('success', 'Inference complete', `Backend: ${res.backend} (${res.latencyMs}ms)`);
    } catch (err: any) {
      toast('error', 'Inference failed', err.message || 'Check engine health and model artifacts');
    }
    finally { setEngineBusy(null); }
  }

  async function handleSaveModel() {
    if (!id || status !== 'completed') return;
    setIsSaving(true);
    try {
      await modelsApi.saveFromExperiment(id);
      toast('success', 'Model Saved', 'Check the Models page to view your saved assets');
    } catch (err: any) {
      toast('error', 'Save Failed', err.message || 'Could not save model');
    } finally {
      setIsSaving(false);
    }
  }

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
      const accuracy = data.accuracy;
      const f1 = data.f1;
      const precision = data.precision;
      const recall = data.recall;
      const lr = data.lr;

      setCurrentEpoch(epoch);
      setLossData(prev => {
        const filtered = prev.filter(p => p.epoch !== epoch);
        return [...filtered, { epoch, loss, valLoss, accuracy, f1, precision, recall, lr }]
          .sort((a, b) => a.epoch - b.epoch);
      });
      if (valLoss !== undefined && (bestLoss === null || valLoss < bestLoss)) {
        setBestLoss(valLoss);
      }
      if (data.status) setStatus(data.status);
    }
    if (data.type === 'training_complete') {
      setStatus('completed');
      const m = data.metrics;
      if (m?.model_path) setModelPath(m.model_path);
      toast('success', 'Training Complete', `Best val_loss: ${data.metrics?.best_val_loss?.toFixed(4) ?? '—'}`);
    }
    if (data.type === 'training_error') {
      setStatus('failed');
      toast('error', 'Training Failed', data.message ?? 'An error occurred during training');
    }
  }, [bestLoss, id, toast]);

  const wsBase = import.meta.env.VITE_WS_URL ?? 'ws://localhost:5000';
  const { isConnected, reconnect } = useWebSocket(`${wsBase}?experimentId=${id}`, handleWsMessage, { maxRetries: 3 });

  useEffect(() => {
    setWsConnected(isConnected);
    if (isConnected) toast('info', 'Connected', 'Live training stream active');
  }, [isConnected, toast]);

  function generateDemoData() {
    const n = 30;
    const epochs = Array.from({ length: n }, (_, i) => i + 1);
    const trainLoss = epochs.map(e => 0.88 * Math.exp(-e * 0.09) + 0.08 + Math.random() * 0.03);
    const valLoss = epochs.map(e => 0.92 * Math.exp(-e * 0.08) + 0.10 + Math.random() * 0.04);
    const accuracy = epochs.map(e => 1 - 0.8 * Math.exp(-e * 0.08) + Math.random() * 0.02);
    const f1 = accuracy.map(a => a * 0.97 + Math.random() * 0.02);
    const lrArr = epochs.map(e => 0.001 * Math.max(0.1, Math.cos(Math.PI * e / n)));
    setLossData(epochs.map((e, i) => ({
      epoch: e, loss: trainLoss[i], valLoss: valLoss[i],
      accuracy: accuracy[i], f1: f1[i], lr: lrArr[i],
    })));
    setBestLoss(Math.min(...valLoss));
    setCurrentEpoch(n);
    setStatus('training');
  }

  function handleStartTraining() {
    if (!id) return;
    experimentsApi.startTraining(id)
      .then(() => { setStatus('training'); toast('success', 'Training Started', 'Enqueued to ML engine'); })
      .catch(() => toast('error', 'Failed to start', 'Is the backend running?'));
  }

  function handleStopTraining() {
    if (!id) return;
    experimentsApi.stopTraining(id)
      .then(() => { setStatus('stopped'); toast('warning', 'Training Stopped', 'Job terminated via SIGTERM'); })
      .catch(() => toast('error', 'Failed to stop', 'Could not stop training'));
  }

  const taskIsClassification = experiment?.config.task === 'classification';


  return (
    <Container className="py-8 pt-24">
      { }
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link to="/experiments" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-green-400 transition-colors mb-3 group">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All Experiments
        </Link>
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-green-400" />
              {experiment?.name || `Experiment #${id}`}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant={STATUS_VARIANT[status] as any}>
                {status === 'training' && <PulseDot />}
                <span className={status === 'training' ? 'ml-1.5' : ''}>{status}</span>
              </Badge>
              <span className="text-xs text-neutral-500 font-mono">{experiment?.config.datasetName || 'Custom Dataset'}</span>
              <span className="text-xs text-neutral-600">·</span>
              <span className="text-xs text-neutral-500 font-mono">Y: {experiment?.config.targetFeatures?.join(", ") || 'none'}</span>
              <span className="text-xs text-neutral-600">·</span>
              <span className="text-xs text-neutral-500 capitalize">{experiment?.config.optimizer || 'adamw'}</span>
              {wsConnected && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <PulseDot color="bg-emerald-400" /> Live WebSocket
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0 flex-wrap">
            {status === 'training' ? (
              <Button variant="destructive" size="lg" onClick={handleStopTraining}>
                <Square className="h-4 w-4 mr-2" /> Stop
              </Button>
            ) : (
              <Button variant="success" size="lg" onClick={handleStartTraining}>
                <Play className="h-4 w-4 mr-2 fill-neutral-950" /> Start Training
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={fetchExperiment}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button size="lg" disabled={!modelPath || engineBusy !== null} onClick={handleExportOnnx}>
              <Download className="h-4 w-4 mr-2" />
              {engineBusy === 'export' ? 'Exporting…' : 'Export ONNX'}
            </Button>
            <Button variant="outline" size="lg" disabled={!modelPath || engineBusy !== null} onClick={handleRunInference}>
              <Cpu className="h-4 w-4 mr-2" />
              {engineBusy === 'infer' ? 'Running…' : 'Run Inference'}
            </Button>
            {status === 'completed' && (
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" size="lg" disabled={isSaving} onClick={handleSaveModel}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save as Model'}
              </Button>
            )}
          </div>
        </Flex>
      </motion.div>


      <div className={`grid gap-3 mb-8 ${taskIsClassification ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 md:grid-cols-4'}`}>
        <MetricCard icon={BarChart3} label="Best Val Loss" value={bestLoss?.toFixed(4) ?? '—'} color="text-emerald-400" />
        <MetricCard icon={TrendingDown} label="Current Loss" value={latest?.loss?.toFixed(4) ?? '—'} color="text-rose-400" />
        <MetricCard icon={Clock} label="Progress" value={`${currentEpoch}/${totalEpochs}`} color="text-green-400" sub="epochs" />
        <MetricCard icon={Zap} label="Loss Drop" value={`${improvement}%`} color="text-amber-400" />
        {taskIsClassification && <>
          <MetricCard icon={Target} label="Peak Accuracy" value={peakAccuracy > 0 ? `${(peakAccuracy * 100).toFixed(1)}%` : '—'} color="text-violet-400" />
          <MetricCard icon={Gauge} label="Peak F1" value={peakF1 > 0 ? peakF1.toFixed(3) : '—'} color="text-cyan-400" />
          <MetricCard icon={Sparkles} label="Ensemble Size" value={experiment?.results?.ensembleSize?.toString() ?? '0'} color="text-pink-400" sub="checkpoints" />
        </>}
      </div>


      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Grid cols={2} gap="md">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {activeTab === 'loss' && <><TrendingDown className="h-4 w-4 text-rose-400" /> Loss Curves</>}
                    {activeTab === 'accuracy' && <><Target className="h-4 w-4 text-violet-400" /> Accuracy & F1</>}
                    {activeTab === 'lr' && <><Activity className="h-4 w-4 text-amber-400" /> Learning Rate Schedule</>}
                    {activeTab === 'radar' && <><Gauge className="h-4 w-4 text-cyan-400" /> Performance Radar</>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lossData.length > 0 ? (
                    <>
                      {activeTab === 'loss' && (
                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={lossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="gradTrain" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="epoch" stroke="#52525b" tick={AXIS_TICK} />
                            <YAxis stroke="#52525b" tick={AXIS_TICK} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [(v as number).toFixed(5)]} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="loss" stroke="#818cf8" fill="url(#gradTrain)" strokeWidth={2} dot={false} name="Train Loss" />
                            {lossData.some(d => d.valLoss !== undefined) && (
                              <Area type="monotone" dataKey="valLoss" stroke="#34d399" fill="url(#gradVal)" strokeWidth={2} dot={false} name="Val Loss" />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      )}

                      {activeTab === 'accuracy' && (
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={lossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="epoch" stroke="#52525b" tick={AXIS_TICK} />
                            <YAxis stroke="#52525b" tick={AXIS_TICK} domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`${((v as number) * 100).toFixed(2)}%`]} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="accuracy" stroke="#a78bfa" strokeWidth={2} dot={false} name="Accuracy" />
                            <Line type="monotone" dataKey="f1" stroke="#22c55e" strokeWidth={2} dot={false} name="F1 Score" />
                            <Line type="monotone" dataKey="precision" stroke="#38bdf8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Precision" />
                            <Line type="monotone" dataKey="recall" stroke="#fb923c" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Recall" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}

                      {activeTab === 'lr' && (
                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={lossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="gradLR" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                            <XAxis dataKey="epoch" stroke="#52525b" tick={AXIS_TICK} />
                            <YAxis stroke="#52525b" tick={AXIS_TICK} tickFormatter={(v: number) => v.toExponential(1)} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [(v as number).toExponential(4)]} />
                            <Area type="monotone" dataKey="lr" stroke="#f59e0b" fill="url(#gradLR)" strokeWidth={2} dot={false} name="Learning Rate" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}

                      {activeTab === 'radar' && (
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                            <PolarGrid stroke={GRID_COLOR} />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <Radar name="Model" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-neutral-600 gap-3">
                      <AlertTriangle className="h-8 w-8" />
                      <p className="text-sm">No training data yet. Start training to see metrics.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>


            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-green-400" />
                    Epoch Log
                    {status === 'training' && (
                      <span className="ml-auto text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <PulseDot color="bg-emerald-400" /> streaming
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto space-y-1 font-mono text-xs pr-1">
                    {lossData.length > 0 ? (
                      lossData.slice(-30).reverse().map((p) => (
                        <div
                          key={p.epoch}
                          className="flex items-start justify-between py-1.5 px-3 rounded-lg bg-neutral-800/25 hover:bg-neutral-800/50 transition-colors"
                        >
                          <span className="text-neutral-500 shrink-0">ep {String(p.epoch).padStart(3, '0')}</span>
                          <div className="flex gap-3 flex-wrap justify-end">
                            <span className="text-indigo-400">loss {p.loss.toFixed(4)}</span>
                            {p.valLoss !== undefined && (
                              <span className="text-emerald-400">val {p.valLoss.toFixed(4)}</span>
                            )}
                            {p.accuracy !== undefined && (
                              <span className="text-violet-400">acc {(p.accuracy * 100).toFixed(1)}%</span>
                            )}
                            {p.f1 !== undefined && (
                              <span className="text-green-400">f1 {p.f1.toFixed(3)}</span>
                            )}
                            {p.lr !== undefined && (
                              <span className="text-amber-400/70">lr {p.lr.toExponential(2)}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-neutral-600">
                        <Brain className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </motion.div>
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <Grid cols={2} gap="md">
          <Card>
            <CardHeader>
              <Flex justify="between">
                <CardTitle className="flex items-center gap-2 text-sm text-green-400">
                  <Terminal className="h-4 w-4" /> Inference Input
                </CardTitle>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="inference-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      setInferenceInputs(text);
                      toast('info', 'CSV Loaded', 'CSV content loaded into inference buffer');
                    }}
                  />
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => document.getElementById('inference-upload')?.click()}>
                    <Upload className="h-3 w-3 mr-1" />
                    Load CSV
                  </Button>
                </div>
              </Flex>
            </CardHeader>
            <CardContent>
              <textarea
                value={inferenceInputs}
                onChange={(e) => setInferenceInputs(e.target.value)}
                placeholder={JSON.stringify(Array.from({ length: experiment?.config.layers?.[0] ?? 5 }, (_, i) => 0.1 * (i + 1)))}
                className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-green-500 focus:outline-none focus:border-green-500/50 resize-none"
              />
              <p className="text-[10px] text-neutral-500 mt-2 italic">
                Input features as a JSON array or CSV text. Default sample used if empty.
              </p>
            </CardContent>
          </Card>

          <Card className={lastPredictions ? 'border-green-500/30 font-mono' : 'opacity-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-emerald-400" /> Predictions & Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 overflow-y-auto font-mono text-xs text-green-400/90 bg-neutral-950/40 rounded-xl p-4 border border-neutral-800/50">
                {lastPredictions ? (
                  <pre className="whitespace-pre-wrap">{lastPredictions}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-700">
                    Awaiting inference execution...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </motion.div>


      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-violet-400" /> Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            {experiment?.config.modelType === 'neural_network' ? (
              <>
                <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-2">
                  {experiment.config.layers.map((units: number, i: number) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <div className={`rounded-xl border px-3 py-2 text-xs font-mono transition-all duration-200 hover:scale-105 ${i === 0
                        ? 'border-sky-500/30 bg-sky-500/5 text-sky-400'
                        : i === experiment.config.layers.length - 1
                          ? 'border-violet-500/30 bg-violet-500/5 text-violet-400'
                          : 'border-green-500/20 bg-green-500/5 text-green-400'
                        }`}>
                        <div className="text-[9px] text-neutral-500 uppercase mb-0.5 tracking-wide">
                          {i === 0 ? 'Input' : i === experiment.config.layers.length - 1 ? 'Output' : `L${i}`}
                        </div>
                        <div className="font-bold">{units}</div>
                        {i > 0 && (
                          <div className="text-[9px] text-neutral-600 mt-0.5">
                            [{experiment.config.activations?.[i - 1] || 'gelu'}]
                          </div>
                        )}
                      </div>
                      {i < experiment.config.layers.length - 1 && (
                        <div className="text-neutral-700 text-xs">→</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-white/5">
                  {[
                    { label: 'Learning Rate', value: experiment.config.learningRate },
                    { label: 'Batch Size', value: experiment.config.batchSize },
                    { label: 'Optimizer', value: experiment.config.optimizer },
                    { label: 'LR Schedule', value: (experiment.config as any).lrSchedule ?? 'cosine' },
                    { label: 'Dropout', value: (experiment.config as any).dropoutRate ?? '0.0' },
                    { label: 'BatchNorm', value: (experiment.config as any).useBatchNorm ? 'yes' : 'no' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-xs text-neutral-500">
                      {label}: <span className="text-neutral-300 font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-neutral-400 py-4">
                <Badge variant="outline" className="mb-3 capitalize">
                  {experiment?.config.modelType?.replace('_', ' ')}
                </Badge>
                <div className="grid grid-cols-3 gap-3 text-xs text-neutral-500">
                  <span>LR: <span className="text-neutral-300 font-mono">{experiment?.config.learningRate}</span></span>
                  <span>Batch: <span className="text-neutral-300 font-mono">{experiment?.config.batchSize}</span></span>
                  <span>Task: <span className="text-neutral-300 capitalize">{experiment?.config.task}</span></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
