import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Stack, Flex } from "@/components/ui/layout";

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const exp = {
    id,
    name: `Experiment #${id}`,
    status: "running" as const,
    accuracy: 87.2,
    loss: 0.342,
    epochs: { current: 23, total: 50 },
    layers: ["Dense(128, relu)", "Dense(64, relu)", "Dense(10, softmax)"],
    dataset: "MNIST",
    learningRate: 0.001,
    batchSize: 32,
    startedAt: "2 hours ago",
    estimatedCompletion: "~45 min",
  };

  const lossData = [0.89, 0.72, 0.58, 0.45, 0.38, 0.34, 0.32, 0.31, 0.29];
  const accuracyData = [42, 58, 71, 79, 84, 87, 88, 89, 90];

  return (
    <Container className="py-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link
          to="/experiments"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All experiments
        </Link>
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-cyan-400" />
              {exp.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="default">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                </span>
                {exp.status}
              </Badge>
              <span className="text-xs text-neutral-500">{exp.dataset}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" size="lg">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <Button variant="outline" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button size="lg">
              <Download className="h-4 w-4 mr-2" />
              Export Model
            </Button>
          </div>
        </Flex>
      </motion.div>

      {/* Stats row */}
      <Grid cols={4} gap="md" className="mb-8">
        {[
          { icon: BarChart3, label: "Accuracy", value: `${exp.accuracy}%` },
          { icon: TrendingDown, label: "Loss", value: exp.loss.toFixed(4) },
          { icon: Clock, label: "Progress", value: `Epoch ${exp.epochs.current}/${exp.epochs.total}` },
          { icon: Cpu, label: "ETA", value: exp.estimatedCompletion },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <StatCard>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">{stat.value}</div>
            </StatCard>
          </motion.div>
        ))}
      </Grid>

      <Grid cols={2} gap="md">
        {/* Loss chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                Loss Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {lossData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-rose-500/80 to-rose-400/40"
                    style={{ height: `${(val / lossData[0]) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-600">
                <span>Epoch 1</span>
                <span>Epoch {lossData.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accuracy chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {accuracyData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/80 to-emerald-400/40"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-600">
                <span>Epoch 1</span>
                <span>Epoch {accuracyData.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {/* Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-400" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {exp.layers.map((layer, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-sm font-mono text-cyan-400">
                    {layer}
                  </div>
                  {i < exp.layers.length - 1 && (
                    <ArrowLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}