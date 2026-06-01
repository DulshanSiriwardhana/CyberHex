import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  ChevronLeft,
  Sliders,
  Database,
  Grid2X2,
  Sparkles,
  Info,
  CheckCircle2,
  Upload,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Stack, Flex, SectionHeading } from "@/components/ui/layout";
import { experimentsApi, datasetsApi } from "@/lib/api";

interface Layer {
  id: string;
  type: "Dense" | "ReLU" | "Sigmoid" | "Tanh" | "LayerNormalization" | "MultiHeadSelfAttention" | "TransformerEncoderBlock";
  units: number;
  activation: "relu" | "sigmoid" | "tanh" | "softmax" | "linear";
  params?: {
    num_heads?: number;
    ffn_dim?: number;
  };
}

interface DatasetSpec {
  id: string;
  name: string;
  description: string;
  taskType: "classification" | "regression";
  totalRows: number;
  features: { name: string; type: string; min: number; max: number; mean: number }[];
  targets: string[];
}

const DATASETS: DatasetSpec[] = [
  {
    id: "cyber_intrusion",
    name: "Cyber-Attack Threat Signals (Intrusion Packet Logs)",
    description: "Real-time network packet statistics mapping anomalous protocol behaviors, payload sizes, and connection duration anomalies.",
    taskType: "classification",
    totalRows: 25000,
    features: [
      { name: "packet_size", type: "float", min: 40, max: 65535, mean: 1420 },
      { name: "port_destination", type: "int", min: 1, max: 65535, mean: 443 },
      { name: "connection_duration", type: "float", min: 0.001, max: 3600, mean: 42.12 },
      { name: "payload_entropy", type: "float", min: 0.1, max: 7.99, mean: 4.87 },
      { name: "syn_flags", type: "int (binary)", min: 0, max: 1, mean: 0.32 },
      { name: "ack_flags", type: "int (binary)", min: 0, max: 1, mean: 0.68 },
      { name: "packet_rate", type: "float", min: 0.1, max: 150000, mean: 842.5 },
      { name: "fin_flags", type: "int (binary)", min: 0, max: 1, mean: 0.04 },
      { name: "urg_flags", type: "int (binary)", min: 0, max: 1, mean: 0.01 },
    ],
    targets: ["is_intrusion", "severity_index"],
  },
  {
    id: "ddos_traffic",
    name: "DDoS Flow Logs (Traffic Volume Patterns)",
    description: "Flow frequency telemetry recording volumetric TCP SYN/ACK flood signatures to train real-time edge firewall mitigators.",
    taskType: "classification",
    totalRows: 50500,
    features: [
      { name: "flow_duration", type: "float", min: 0.005, max: 1800, mean: 12.8 },
      { name: "packet_length_variance", type: "float", min: 0, max: 45000, mean: 2840 },
      { name: "syn_ack_ratio", type: "float", min: 0.01, max: 99.9, mean: 1.05 },
      { name: "bytes_per_second", type: "float", min: 100, max: 120000000, mean: 5400000 },
      { name: "packets_per_second", type: "float", min: 1, max: 850000, mean: 32000 },
      { name: "rst_flags", type: "int (binary)", min: 0, max: 1, mean: 0.15 },
    ],
    targets: ["is_ddos", "anomaly_score"],
  },
  {
    id: "iiot_sensor",
    name: "Industrial IoT Sensor Telemetry (Fault Diagnosis)",
    description: "Critical multi-axis physical sensor streams capturing voltage anomalies, rotational vibrations, and heat signatures.",
    taskType: "regression",
    totalRows: 15000,
    features: [
      { name: "temperature_celsius", type: "float", min: 15.2, max: 124.8, mean: 68.4 },
      { name: "vibration_amplitude", type: "float", min: 0.01, max: 9.8, mean: 1.25 },
      { name: "voltage_draw", type: "float", min: 110, max: 245, mean: 220.4 },
      { name: "noise_decibels", type: "float", min: 45, max: 115, mean: 72.3 },
      { name: "pressure_psi", type: "float", min: 10, max: 350, mean: 145.2 },
      { name: "rotational_speed_rpm", type: "float", min: 200, max: 6000, mean: 2850 },
      { name: "humidity_percent", type: "float", min: 20, max: 95, mean: 55.4 },
      { name: "air_flow_rate", type: "float", min: 0.5, max: 25.0, mean: 5.2 },
    ],
    targets: ["failure_severity", "device_fault_type"],
  },
  {
    id: "custom",
    name: "Custom Data Matrix (CSV)",
    description: "Upload a CSV or paste your own telemetry streams to train a specialized model on unique datasets.",
    taskType: "classification",
    totalRows: 0,
    features: [],
    targets: [],
  },
];

export default function ExperimentBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("Cyber Threat Classifier");
  const [selectedDatasetId, setSelectedDatasetId] = useState("cyber_intrusion");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "packet_size",
    "port_destination",
    "connection_duration",
    "payload_entropy",
    "syn_flags",
    "ack_flags",
  ]);
  const [targetFeatures, setTargetFeatures] = useState<string[]>(["is_intrusion"]);

  const [trainSplit, setTrainSplit] = useState(80);
  const [valSplit, setValSplit] = useState(10);
  const [testSplit, setTestSplit] = useState(10);

  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", type: "Dense", units: 32, activation: "relu" },
    { id: "2", type: "Dense", units: 16, activation: "relu" },
  ]);

  useEffect(() => {
    const state = location.state as any;
    if (state?.prebuiltLayers) {
      const designerLayers = state.prebuiltLayers;
      const mapped: Layer[] = [];

      for (let i = 0; i < designerLayers.length; i++) {
        const current = designerLayers[i];
        if (current.type === "Dense") {
          const next = designerLayers[i + 1];
          let activation: any = "relu";
          if (next && ["ReLU", "Sigmoid", "Tanh", "Softmax"].includes(next.type)) {
            activation = next.type.toLowerCase();
            i++;
          }
          mapped.push({
            id: current.id,
            type: "Dense",
            units: current.params?.out_features || 32,
            activation
          });
        } else if (["ReLU", "Sigmoid", "Tanh", "Softmax", "GELU"].includes(current.type)) {

        } else {
          mapped.push({
            id: current.id,
            type: current.type as any,
            units: current.params?.out_features || 64,
            activation: "linear",
            params: current.params
          });
        }
      }

      if (mapped.length > 0) setLayers(mapped);

      if (state.prebuiltParams) {
        if (state.prebuiltParams.optimizer) setOptimizer(state.prebuiltParams.optimizer.toLowerCase());
        if (state.prebuiltParams.learningRate) setLearningRate(state.prebuiltParams.learningRate);
        if (state.prebuiltParams.name) setName(state.prebuiltParams.name);
      }
      setCurrentStep(4);
    }
  }, [location.state]);

  const [epochs, setEpochs] = useState(100);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [optimizer, setOptimizer] = useState("adamw");
  const [lrSchedule, setLrSchedule] = useState("cosine");
  const [loss, setLoss] = useState("bce");
  const [earlyStopping, setEarlyStopping] = useState(true);
  const [patience, setPatience] = useState(15);

  const [dropoutRate, setDropoutRate] = useState(0.0);
  const [useBatchNorm, setUseBatchNorm] = useState(false);
  const [gradientClip, setGradientClip] = useState(5.0);
  const [labelSmoothing, setLabelSmoothing] = useState(0.0);
  const [weightDecay, setWeightDecay] = useState(0.0001);
  const [warmupEpochs, setWarmupEpochs] = useState(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [customCsv, setCustomCsv] = useState("");
  const [customFeatures, setCustomFeatures] = useState<{ name: string; type: string; min: number; max: number; mean: number }[]>([]);
  const [customTargets, setCustomTargets] = useState<string[]>([]);
  const [customTaskType, setCustomTaskType] = useState<"classification" | "regression">("classification");
  const [isParsingCsv, setIsParsingCsv] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDataset = DATASETS.find((d) => d.id === selectedDatasetId) || DATASETS[0];

  useEffect(() => {
    const firstTarget = selectedDatasetId === "custom" ? (customTargets[0] || "") : activeDataset.targets[0];
    const initialFeatures = selectedDatasetId === "custom"
      ? customFeatures.map(f => f.name)
      : activeDataset.features.map(f => f.name);

    // Default to first 6 features that are NOT the target
    const filteredFeatures = initialFeatures
      .filter(f => f !== firstTarget)
      .slice(0, 6);

    setSelectedFeatures(filteredFeatures);
    setTargetFeatures([firstTarget]);

    const taskType = selectedDatasetId === "custom" ? customTaskType : activeDataset.taskType;
    setLoss(taskType === "classification" ? "bce" : "mse");
  }, [selectedDatasetId, customFeatures, customTargets, customTaskType, activeDataset]);

  const handleCsvInput = (csv: string) => {
    setCustomCsv(csv);
    if (!csv.trim()) return;

    setIsParsingCsv(true);
    try {
      const lines = csv.trim().split("\n");
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map(h => h.trim());
      if (headers.length < 2) return;

      const allCols = headers.map(h => ({
        name: h,
        type: "float",
        min: 0,
        max: 1,
        mean: 0.5
      }));

      setCustomFeatures(allCols);
      setCustomTargets(headers);
      setFeedbackMsg({ type: "success", text: `Successfully parsed ${headers.length} columns from CSV. Select your target column in Step 2.` });
    } catch (e) {
      setFeedbackMsg({ type: "error", text: "Failed to parse CSV. Ensure it has a header row." });
    } finally {
      setIsParsingCsv(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setFeedbackMsg(null);

    try {
      const res = await datasetsApi.upload(file, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      setUploadedFilePath(res.data.path);
      setCustomCsv("");
      setFeedbackMsg({ type: "success", text: `File "${file.name}" uploaded successfully. Ready for training.` });

      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim());
          if (headers.length >= 2) {
            const allCols = headers.map(h => ({ name: h, type: "float", min: 0, max: 1, mean: 0.5 }));
            setCustomFeatures(allCols);
            setCustomTargets(headers);
          }
        };
        reader.readAsText(file.slice(0, 1024 * 10));
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  const activeDatasetObj = selectedDatasetId === "custom"
    ? {
      id: "custom",
      name: "Custom Data Matrix",
      description: "User provided dataset",
      taskType: customTaskType,
      totalRows: customCsv.split("\n").length - 1,
      features: customFeatures,
      targets: customTargets
    }
    : activeDataset;

  const addLayer = () => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type: "Dense",
      units: 16,
      activation: "relu",
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((l) => l.id !== id));
  };

  const updateLayerUnits = (id: string, units: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, units: Math.max(1, units) } : l)));
  };

  const updateLayerActivation = (id: string, act: Layer["activation"]) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, activation: act } : l)));
  };

  const toggleFeature = (featName: string) => {
    if (selectedFeatures.includes(featName)) {
      if (selectedFeatures.length <= 1) return;
      setSelectedFeatures(selectedFeatures.filter((f) => f !== featName));
    } else {
      setSelectedFeatures([...selectedFeatures, featName]);
      setTargetFeatures(targetFeatures.filter((f) => f !== featName));
    }
  };

  const toggleTarget = (tgName: string) => {
    if (targetFeatures.includes(tgName)) {
      if (targetFeatures.length <= 1) return;
      setTargetFeatures(targetFeatures.filter((f) => f !== tgName));
    } else {
      setTargetFeatures([...targetFeatures, tgName]);
      setSelectedFeatures(selectedFeatures.filter((f) => f !== tgName));
    }
  };

  const handleSplitChange = (val: number) => {
    setTrainSplit(val);
    const remainder = 100 - val;
    if (remainder > 0) {
      setValSplit(Math.round(remainder / 2));
      setTestSplit(remainder - Math.round(remainder / 2));
    } else {
      setValSplit(0);
      setTestSplit(0);
    }
  };

  const getExperimentPayload = () => {
    const hiddenUnits = layers.map((l) => l.units);
    const inputSize = selectedFeatures.length;
    const outputSize = targetFeatures.length;
    const activations = layers.map((l) => l.activation);
    activations.push(activeDatasetObj.taskType === 'classification' ? 'sigmoid' : 'linear');

    return {
      name,
      description: `Training pipeline for ${activeDatasetObj.name} using custom input features.`,
      status: 'draft' as const,
      config: {
        task: activeDatasetObj.taskType,
        modelType: 'neural_network' as const,
        layers: [inputSize, ...hiddenUnits, outputSize],
        activations,
        loss: loss.toUpperCase(),
        batchSize,
        epochs,
        learningRate,
        optimizer: optimizer,
        lrSchedule,
        warmupEpochs,
        validationSplit: valSplit / 100,
        testSplit: testSplit / 100,
        earlyStopping,
        patience,

        dropoutRate,
        useBatchNorm,
        gradientClip,
        labelSmoothing,
        weightDecay,
        dataPath: selectedDatasetId === 'custom' ? uploadedFilePath : null,
        datasetName: selectedDatasetId,
        selectedFeatures,
        targetFeatures,
        customData: selectedDatasetId === 'custom' && !uploadedFilePath ? customCsv : null,
        seed: 42,
      },
    };
  };

  const saveDraft = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const payload = getExperimentPayload();
      await experimentsApi.create(payload);
      setFeedbackMsg({ type: "success", text: "Pipeline draft saved successfully to database." });
      setTimeout(() => navigate("/experiments"), 1500);
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e.message || "Failed to save draft." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTraining = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const payload = getExperimentPayload();
      const res = await experimentsApi.create(payload);
      if (res.experiment && res.experiment._id) {
        await experimentsApi.startTraining(res.experiment._id);
        setFeedbackMsg({ type: "success", text: "Job successfully enqueued. Launching training process..." });
        setTimeout(() => navigate(`/experiments/${res.experiment._id}`), 1500);
      }
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e.message || "Failed to start training process." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateParameters = () => {
    let params = 0;
    let prev = selectedFeatures.length;
    for (const l of layers) {
      params += prev * l.units + l.units;
      prev = l.units;
    }
    params += prev * 1 + 1;
    return params;
  };

  const steps = [
    { num: 1, label: "Dataset Selection", icon: Database },
    { num: 2, label: "Features & Targets", icon: Grid2X2 },
    { num: 3, label: "Splitting Ratio", icon: Sliders },
    { num: 4, label: "Engine configuration", icon: Settings2 },
  ];

  return (
    <Container className="py-8 pt-24 max-w-[1440px]">
      { }
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/40 pb-6"
      >
        <div>
          <Link
            to="/experiments"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-green-400 transition-colors mb-2 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Experiments
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/20 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-neutral-800 focus:border-green-500 focus:outline-none text-2xl font-extrabold text-white tracking-tight w-72 transition-colors py-0.5"
              />
              <p className="text-xs text-neutral-500">Pipeline Manifest Builder</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" onClick={saveDraft} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-neutral-950 font-bold" onClick={startTraining} disabled={isSubmitting}>
            <Play className="h-4 w-4 mr-2 fill-neutral-950" />
            Start Training
          </Button>
        </div>
      </motion.div>

      { }
      <div className="mb-10 bg-neutral-900/30 border border-neutral-850 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-neutral-800 -translate-y-1/2 z-0" />
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isActive = currentStep === st.num;
            return (
              <div
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className="flex flex-col items-center relative z-10 cursor-pointer group"
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center border font-mono font-bold text-sm transition-all duration-300 ${isActive
                    ? "bg-green-500 border-green-400 text-neutral-950 shadow-[0_0_15px_rgba(34,197,94,0.35)]"
                    : isCompleted
                      ? "bg-neutral-850 border-green-500/40 text-green-400"
                      : "bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:border-neutral-700"
                    }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold tracking-wide uppercase transition-colors hidden sm:block ${isActive ? "text-green-400" : "text-neutral-500 group-hover:text-neutral-400"
                    }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${feedbackMsg.type === "success"
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/5 border-rose-500/20 text-rose-400"
            }`}
        >
          <Info className="h-4 w-4 shrink-0" />
          {feedbackMsg.text}
        </motion.div>
      )}

      { }
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <SectionHeading
                title="Select Input Dataset"
                description="Choose the training dataset telemetry for compiling your specialized model."
              />
              <Grid cols={3} gap="md">
                {DATASETS.map((ds) => (
                  <Card
                    key={ds.id}
                    onClick={() => setSelectedDatasetId(ds.id)}
                    className={`group cursor-pointer border transition-all duration-300 ${selectedDatasetId === ds.id
                      ? "border-green-500 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.06)]"
                      : "border-neutral-850 bg-neutral-900/10 hover:border-neutral-700"
                      }`}
                  >
                    <CardHeader className="pb-2">
                      <Flex justify="between" className="mb-2">
                        <Badge variant={selectedDatasetId === ds.id ? "default" : "secondary"}>
                          {ds.taskType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-neutral-500 font-mono">
                          {ds.totalRows.toLocaleString()} rows
                        </span>
                      </Flex>
                      <CardTitle className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                        {ds.id === "cyber_intrusion" ? "Intrusion Packets" : ds.id === "ddos_traffic" ? "DDoS Traffic" : ds.id === "iiot_sensor" ? "IIoT Telemetry" : "My Custom Data"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-400 mb-4 line-clamp-3">
                        {ds.description}
                      </p>
                      <div className="border-t border-neutral-850 pt-3 flex justify-between items-center text-xs text-neutral-500">
                        <span>Input Features: <strong className="text-neutral-300 font-mono">{ds.id === 'custom' ? customFeatures.length : ds.features.length}</strong></span>
                        <span>Targets: <strong className="text-neutral-300 font-mono">{ds.id === 'custom' ? customTargets.length : ds.targets.length}</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Grid>

              {selectedDatasetId === "custom" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-green-400" />
                          CSV Data Input
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">Task:</span>
                            <select
                              value={customTaskType}
                              onChange={(e) => setCustomTaskType(e.target.value as any)}
                              className="bg-neutral-900 border border-neutral-800 text-[10px] rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                            >
                              <option value="classification">Classification</option>
                              <option value="regression">Regression</option>
                            </select>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            {isUploading ? `Uploading ${uploadProgress}%` : "Upload File"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {uploadedFilePath ? (
                        <div className="flex flex-col items-center justify-center h-48 bg-neutral-950 border border-neutral-800 rounded-xl border-dashed border-green-500/30">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                          <p className="text-sm font-medium text-white">File Uploaded Successfully</p>
                          <p className="text-xs text-neutral-500 mt-1">{uploadedFilePath.split('/').pop()}</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-green-400 text-[10px] mt-2"
                            onClick={() => setUploadedFilePath(null)}
                          >
                            Remove and use text input
                          </Button>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={customCsv}
                            onChange={(e) => handleCsvInput(e.target.value)}
                            placeholder="Paste your CSV here (first row as header, last column as target)..."
                            className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-green-500/90 focus:outline-none focus:border-green-500/50 resize-none"
                            disabled={isUploading}
                          />
                          {isUploading && (
                            <div className="absolute inset-x-8 bottom-20">
                              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-green-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-[10px] text-neutral-500 italic">
                          {uploadedFilePath
                            ? "* File data will be streamed directly to the ML engine."
                            : "* Ensure the last column is the target variable (Y) and all other columns are numerical features (X)."}
                        </p>
                        {(isParsingCsv || isUploading) && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                            <span className="text-[10px] text-green-400">
                              {isUploading ? `Uploading ${uploadProgress}%` : "Parsing..."}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              { }
              <Card className="mt-6 border-neutral-850 bg-neutral-900/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-green-400/10 to-violet-500/10 border border-green-500/15 flex items-center justify-center">
                      <Database className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{activeDatasetObj.name}</h4>
                      <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
                        This dataset supports <strong>{activeDatasetObj.taskType}</strong>. It will be loaded from {selectedDatasetId === 'custom' ? 'user input' : 'secure storage'} into the C++ compiled runtime.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <SectionHeading
                title="Schema & Columns Selection Matrix"
                description="Check columns to allocate them as features inside the network input vector, and select your target output."
              />
              <Grid cols={3} gap="lg">
                { }
                <div className="col-span-2 space-y-4">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Grid2X2 className="h-4 w-4 text-green-400" />
                    Available Features ({selectedFeatures.length} selected)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {activeDatasetObj.features.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.name);
                      return (
                        <div
                          key={feat.name}
                          onClick={() => toggleFeature(feat.name)}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 ${isChecked
                            ? "bg-green-500/5 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.02)]"
                            : "bg-neutral-900/25 border-neutral-850 hover:border-neutral-800"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-green-500 border-green-400" : "border-neutral-700 bg-neutral-900"
                                }`}
                            >
                              {isChecked && <div className="h-2 w-2 rounded-sm bg-neutral-950" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white font-mono">{feat.name}</p>
                              <p className="text-xs text-neutral-500 uppercase">{feat.type}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                { }
                <div className="space-y-6">
                  <Card className="border-neutral-850">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        Target Output Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {activeDatasetObj.targets.map((tg) => {
                          const isChecked = targetFeatures.includes(tg);
                          return (
                            <div
                              key={tg}
                              onClick={() => toggleTarget(tg)}
                              className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 ${isChecked
                                ? "bg-violet-500/5 border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.02)]"
                                : "bg-neutral-900/25 border-neutral-850 hover:border-neutral-800"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-violet-500 border-violet-400" : "border-neutral-700 bg-neutral-900"
                                    }`}
                                >
                                  {isChecked && <div className="h-2 w-2 rounded-sm bg-neutral-950" />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white font-mono">{tg}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-xl bg-neutral-950/40 p-4 border border-neutral-850 space-y-3">
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Choosing targets updates the loss and final layer metrics. Selecting <strong>{targetFeatures.join(", ")}</strong> implies a <strong>{activeDatasetObj.taskType}</strong> task with {targetFeatures.length} output node(s).
                        </p>
                        <Badge variant="secondary" className="w-fit">
                          Recommended Loss: {activeDatasetObj.taskType === "classification" ? "BCE / Categorical CE" : "MSE"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  { }
                  <Card className="border-neutral-850 bg-neutral-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Feature Stats Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Inputs Locked</span>
                        <span className="text-green-400">{selectedFeatures.length} Nodes</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Output Locked</span>
                        <span className="text-violet-400">{targetFeatures.length} Node{targetFeatures.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Task Mode</span>
                        <span className="text-neutral-300 capitalize">{activeDatasetObj.taskType}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <SectionHeading
                title="Splitting Ratios & Validation Strategy"
                description="Allocate records to training, validation, and test arrays to verify performance and avoid overfitting."
              />
              <Grid cols={3} gap="lg">
                <div className="col-span-2 space-y-6">
                  { }
                  <Card className="border-neutral-850 p-6">
                    <div className="space-y-6">
                      <Flex justify="between" className="mb-2">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          Training Split Ratio
                        </span>
                        <span className="text-lg font-bold text-green-400 font-mono">{trainSplit}%</span>
                      </Flex>

                      <div className="relative pt-1">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={trainSplit}
                          onChange={(e) => handleSplitChange(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                      </div>

                      { }
                      <Grid cols={3} gap="md" className="pt-4 border-t border-neutral-850">
                        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 text-center">
                          <p className="text-xs text-neutral-400 uppercase tracking-wide">Training</p>
                          <p className="text-xl font-bold font-mono text-green-400 mt-1">{trainSplit}%</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {Math.round((activeDatasetObj.totalRows * trainSplit) / 100).toLocaleString()} samples
                          </p>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center">
                          <p className="text-xs text-neutral-400 uppercase tracking-wide">Validation</p>
                          <p className="text-xl font-bold font-mono text-amber-400 mt-1">{valSplit}%</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {Math.round((activeDatasetObj.totalRows * valSplit) / 100).toLocaleString()} samples
                          </p>
                        </div>
                        <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 text-center">
                          <p className="text-xs text-neutral-400 uppercase tracking-wide">Testing</p>
                          <p className="text-xl font-bold font-mono text-violet-400 mt-1">{testSplit}%</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {Math.round((activeDatasetObj.totalRows * testSplit) / 100).toLocaleString()} samples
                          </p>
                        </div>
                      </Grid>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="border-neutral-850 bg-neutral-900/15">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <Info className="h-4.5 w-4.5 text-green-400" />
                        Splitting Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-neutral-400 leading-relaxed space-y-3">
                      <p>
                        * **Training Set**: Used to optimize model weights by minimizing the computed loss.
                      </p>
                      <p>
                        * **Validation Set**: Monitored after each epoch. Used for hyperparameter tuning and triggers **Early Stopping** if loss diverges.
                      </p>
                      <p>
                        * **Testing Set**: Evaluated post-training to generate un-biased final validation statistics.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <Grid cols={3} gap="lg">
                { }
                <div className="col-span-2 space-y-6">
                  <SectionHeading
                    title="Engine Network Architecture"
                    description="Configure nodes and activation triggers to construct your deep learning pipeline."
                  />
                  <Card className="border-neutral-850 p-6">
                    <Flex justify="between" className="mb-4">
                      <CardTitle className="text-md font-bold text-white flex items-center gap-2">
                        <Layers className="h-4.5 w-4.5 text-green-400" />
                        Network Graph (SVG Representation)
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addLayer}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Hidden Layer
                      </Button>
                    </Flex>

                    { }
                    <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-850 flex items-center justify-center overflow-x-auto min-h-[220px]">
                      <svg width="600" height="200" className="max-w-full">
                        { }
                        {selectedFeatures.slice(0, 4).map((_, i) => (
                          <g key={`in-${i}`}>
                            <circle cx="50" cy={40 + i * 40} r="7" className="fill-green-500/80 stroke-green-400 stroke-2 animate-pulse" />
                            {i === 3 && selectedFeatures.length > 4 && (
                              <text x="45" y="180" className="fill-neutral-500 font-mono text-[9px]">+{selectedFeatures.length - 4} more</text>
                            )}
                          </g>
                        ))}
                        <text x="30" y="20" className="fill-neutral-400 font-mono text-[10px] uppercase font-semibold">Inputs ({selectedFeatures.length})</text>

                        { }
                        {selectedFeatures.slice(0, 4).map((_, i) =>
                          layers[0] && Array.from({ length: Math.min(layers[0].units, 4) }).map((_, j) => (
                            <line
                              key={`c-in-1-${i}-${j}`}
                              x1="57"
                              y1={40 + i * 40}
                              x2="200"
                              y2={30 + j * 35}
                              className="stroke-neutral-800/40"
                              strokeWidth="0.8"
                            />
                          ))
                        )}

                        { }
                        {layers.map((ly, lIdx) => {
                          const xPos = 200 + lIdx * 150;
                          return (
                            <g key={`l-${ly.id}`}>
                              <text x={xPos - 40} y="20" className="fill-neutral-400 font-mono text-[10px] uppercase font-semibold">
                                Layer {lIdx + 1} ({ly.units})
                              </text>
                              {Array.from({ length: Math.min(ly.units, 4) }).map((_, i) => (
                                <circle
                                  key={`node-${lIdx}-${i}`}
                                  cx={xPos}
                                  cy={30 + i * 35}
                                  r="8"
                                  className="fill-green-500/20 stroke-green-500 stroke-2"
                                />
                              ))}
                              {ly.units > 4 && (
                                <text x={xPos - 12} y="175" className="fill-neutral-500 font-mono text-[9px]">
                                  +{ly.units - 4} nodes
                                </text>
                              )}

                              { }
                              {layers[lIdx + 1] && Array.from({ length: Math.min(ly.units, 4) }).map((_, i) =>
                                Array.from({ length: Math.min(layers[lIdx + 1].units, 4) }).map((_, j) => (
                                  <line
                                    key={`c-${lIdx}-${lIdx + 1}-${i}-${j}`}
                                    x1={xPos + 8}
                                    y1={30 + i * 35}
                                    x2={xPos + 150 - 8}
                                    y2={30 + j * 35}
                                    className="stroke-neutral-800/40"
                                    strokeWidth="0.8"
                                  />
                                ))
                              )}
                            </g>
                          );
                        })}

                        { }
                        {layers.length > 0 && Array.from({ length: Math.min(layers[layers.length - 1].units, 4) }).map((_, i) => {
                          const lastX = 200 + (layers.length - 1) * 150;
                          return (
                            <line
                              key={`c-last-out-${i}`}
                              x1={lastX + 8}
                              y1={30 + i * 35}
                              x2="520"
                              y2="90"
                              className="stroke-violet-500/25"
                              strokeWidth="1.0"
                            />
                          );
                        })}

                        { }
                        <circle cx="520" cy="90" r="9" className="fill-violet-500/20 stroke-violet-400 stroke-2" />
                        <text x="490" y="20" className="fill-neutral-400 font-mono text-[10px] uppercase font-semibold">Output (1)</text>
                      </svg>
                    </div>

                    { }
                    <div className="space-y-3 mt-4">
                      {layers.map((layer, idx) => (
                        <div
                          key={layer.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-850 bg-neutral-900/10 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400 font-mono">
                              H{idx + 1}
                            </div>
                            <span className="text-sm font-semibold text-white">Dense Layer</span>
                          </div>

                          <Flex gap="md" className="flex-1 sm:justify-end">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-neutral-500 font-mono">Nodes:</span>
                              <input
                                type="number"
                                value={layer.units}
                                onChange={(e) => updateLayerUnits(layer.id, Number(e.target.value))}
                                className="input-cyber w-16 text-center text-xs py-1"
                                min={1}
                                max={256}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-neutral-500 font-mono">Activation:</span>
                              <select
                                value={layer.activation}
                                onChange={(e) => updateLayerActivation(layer.id, e.target.value as any)}
                                className="bg-neutral-950 border border-neutral-800 text-xs rounded-lg py-1 px-2 focus:outline-none focus:border-green-500 text-white"
                              >
                                <option value="relu">ReLU</option>
                                <option value="gelu">GELU ⚡</option>
                                <option value="swish">Swish</option>
                                <option value="mish">Mish</option>
                                <option value="sigmoid">Sigmoid</option>
                                <option value="tanh">Tanh</option>
                                <option value="linear">Linear</option>
                              </select>
                            </div>
                            <button
                              onClick={() => removeLayer(layer.id)}
                              disabled={layers.length <= 1}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Flex>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  { }
                  <Card className="border-neutral-850">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <Settings2 className="h-4.5 w-4.5 text-violet-400" />
                        Hyperparameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Epochs</label>
                        <input type="number" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="input-cyber w-full py-1.5 text-sm" min={1} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Learning Rate</label>
                        <input type="number" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} className="input-cyber w-full py-1.5 text-sm" step={0.0001} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Batch Size</label>
                        <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="input-cyber w-full py-1.5 text-sm" min={1} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Optimizer</label>
                        <select value={optimizer} onChange={(e) => setOptimizer(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-green-500 text-white">
                          <option value="adamw">AdamW ⚡ (recommended)</option>
                          <option value="radam">RAdam</option>
                          <option value="lion">Lion 🦁</option>
                          <option value="adam">Adam</option>
                          <option value="rmsprop">RMSProp</option>
                          <option value="sgd">SGD + Momentum</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">LR Schedule</label>
                        <select value={lrSchedule} onChange={(e) => setLrSchedule(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-green-500 text-white">
                          <option value="cosine">Cosine Annealing ✦</option>
                          <option value="cosine_warm">Cosine Warm Restarts</option>
                          <option value="step">Step Decay</option>
                          <option value="none">Constant</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Warmup Epochs</label>
                        <input type="number" value={warmupEpochs} onChange={(e) => setWarmupEpochs(Number(e.target.value))} className="input-cyber w-full py-1.5 text-sm" min={0} max={20} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-400">Early-Stop Patience</label>
                        <input type="number" value={patience} onChange={(e) => setPatience(Number(e.target.value))} className="input-cyber w-full py-1.5 text-sm" min={1} max={50} />
                      </div>

                      { }
                      <div className="border-t border-neutral-800/50 pt-3 mt-1">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Ultra-Pro Regularization</p>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-400">Dropout Rate: <span className="text-green-400 font-mono">{dropoutRate.toFixed(2)}</span></label>
                            <input type="range" min={0} max={0.8} step={0.05} value={dropoutRate} onChange={(e) => setDropoutRate(Number(e.target.value))} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-400">Gradient Clip: <span className="text-amber-400 font-mono">{gradientClip.toFixed(1)}</span></label>
                            <input type="range" min={0.5} max={10} step={0.5} value={gradientClip} onChange={(e) => setGradientClip(Number(e.target.value))} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-400">Label Smoothing: <span className="text-violet-400 font-mono">{labelSmoothing.toFixed(2)}</span></label>
                            <input type="range" min={0} max={0.3} step={0.01} value={labelSmoothing} onChange={(e) => setLabelSmoothing(Number(e.target.value))} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-neutral-950/40 p-3 border border-neutral-850">
                            <div>
                              <span className="text-xs text-neutral-300 font-medium">Batch Normalization</span>
                              <p className="text-[10px] text-neutral-600">Normalizes activations per-batch</p>
                            </div>
                            <input type="checkbox" checked={useBatchNorm} onChange={(e) => setUseBatchNorm(e.target.checked)} className="h-4 w-4 accent-green-500 cursor-pointer" />
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-neutral-950/40 p-3 border border-neutral-850">
                            <div>
                              <span className="text-xs text-neutral-300 font-medium">Early Stopping</span>
                              <p className="text-[10px] text-neutral-600">Halts when val_loss stagnates</p>
                            </div>
                            <input type="checkbox" checked={earlyStopping} onChange={(e) => setEarlyStopping(e.target.checked)} className="h-4 w-4 accent-green-500 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  { }
                  <Card className="border-neutral-850 bg-neutral-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Compile Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Loss Metric</span>
                        <span className="text-white uppercase">{loss}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Weight Count</span>
                        <span className="text-white">{calculateParameters().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Est. Train Time</span>
                        <span className="text-white">~{Math.round(epochs * 0.45)}s</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      { }
      <div className="mt-8 pt-6 border-t border-neutral-800/40 flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Step
        </Button>
        {currentStep < 4 ? (
          <Button
            size="lg"
            className="bg-neutral-800 hover:bg-neutral-750 text-white font-semibold"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next Step
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-neutral-950 font-bold"
            onClick={startTraining}
            disabled={isSubmitting}
          >
            <Play className="h-4 w-4 mr-2 fill-neutral-950" />
            Launch Experiment
          </Button>
        )}
      </div>
    </Container>
  );
}
