import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FlaskConical,
  Play,
  Save,
  Plus,
  Trash2,
  Layers,
  Brain,
  Settings2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Stack, Flex } from "@/components/ui/layout";

interface Layer {
  id: string;
  type: string;
  units: number;
  activation: string;
}

export default function ExperimentBuilderPage() {
  const [name, setName] = useState("Untitled Experiment");
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", type: "Dense", units: 128, activation: "relu" },
    { id: "2", type: "Dense", units: 64, activation: "relu" },
    { id: "3", type: "Dense", units: 10, activation: "softmax" },
  ]);
  const [epochs, setEpochs] = useState(50);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);

  const addLayer = () => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type: "Dense",
      units: 32,
      activation: "relu",
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
  };

  return (
    <Container className="py-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Flex justify="between" wrap>
          <div>
            <Link
              to="/experiments"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to experiments
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-green-400" />
              {name}
            </h1>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Training
            </Button>
          </div>
        </Flex>
      </motion.div>

      <Grid cols={2} gap="md">
        {/* Layer builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <Flex justify="between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-green-400" />
                  Layers
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={addLayer}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Layer
                </Button>
              </Flex>
            </CardHeader>
            <CardContent>
              <Stack gap="sm">
                {layers.map((layer, i) => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-850/50 px-4 py-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xs font-bold text-green-400 font-mono">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {layer.type}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {layer.units} units · {layer.activation}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-violet-400" />
                Hyperparameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">
                    Experiment Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-cyber"
                  />
                </div>
                <Grid cols={3} gap="sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400">
                      Epochs
                    </label>
                    <input
                      type="number"
                      value={epochs}
                      onChange={(e) => setEpochs(Number(e.target.value))}
                      className="input-cyber"
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400">
                      LR
                    </label>
                    <input
                      type="number"
                      value={learningRate}
                      onChange={(e) => setLearningRate(Number(e.target.value))}
                      className="input-cyber"
                      step={0.0001}
                      min={0.0001}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      className="input-cyber"
                      min={1}
                    />
                  </div>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="sm">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Total layers</span>
                  <span className="text-white font-mono">{layers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Total params</span>
                  <span className="text-white font-mono">
                    {(layers.reduce((sum, l) => sum + l.units * (layers.indexOf(l) > 0 ? layers[layers.indexOf(l) - 1].units : 784), 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Estimated time</span>
                  <span className="text-white font-mono">
                    ~{Math.round(epochs * 0.6)}s
                  </span>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Container>
  );
}