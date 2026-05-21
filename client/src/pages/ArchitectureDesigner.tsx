import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  Cpu,
  Plus,
  Trash2,
  Settings2,
  Code,
  Download,
  Play,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, GlowCard } from "@/components/ui/card";
import { Container, Grid, Flex, Stack } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Pause, RotateCw } from "lucide-react";

interface LayerType {
  name: string;
  category: "core" | "activation" | "normalization" | "advanced";
  description: string;
  defaultParams: Record<string, any>;
}

const AVAILABLE_LAYERS: Record<string, LayerType> = {
  Dense: {
    name: "Dense (Fully Connected)",
    category: "core",
    description: "Standard dense linear layer computing Y = XW + b",
    defaultParams: { out_features: 128, init_type: "HE" }
  },
  Conv2D: {
    name: "Conv2D",
    category: "core",
    description: "2D convolutional layer for spatial grid patterns",
    defaultParams: { out_channels: 32, kernel_size: 3, stride: 1, padding: 1 }
  },
  MultiHeadSelfAttention: {
    name: "Multi-Head Attention",
    category: "advanced",
    description: "Scaled dot-product attention block",
    defaultParams: { num_heads: 8 }
  },
  TransformerEncoderBlock: {
    name: "Transformer Encoder",
    category: "advanced",
    description: "MHSA block with Feed-Forward Net and LayerNorms",
    defaultParams: { num_heads: 8, ffn_dim: 2048 }
  },
  LayerNormalization: {
    name: "Layer Normalization",
    category: "normalization",
    description: "Normalizes activations across features",
    defaultParams: { epsilon: 1e-5 }
  },
  BatchNormalization: {
    name: "Batch Normalization",
    category: "normalization",
    description: "Normalizes activations across the batch dimension",
    defaultParams: { epsilon: 1e-5, momentum: 0.9 }
  },
  ReLU: {
    name: "ReLU",
    category: "activation",
    description: "Rectified Linear Unit activation: max(0, x)",
    defaultParams: {}
  },
  GELU: {
    name: "GELU",
    category: "activation",
    description: "Gaussian Error Linear Unit activation",
    defaultParams: {}
  },
  Sigmoid: {
    name: "Sigmoid",
    category: "activation",
    description: "Numerically stable Sigmoid activation function",
    defaultParams: {}
  },
  Softmax: {
    name: "Softmax",
    category: "activation",
    description: "Exponentiated normalized probability distribution",
    defaultParams: {}
  },
  Dropout: {
    name: "Dropout",
    category: "core",
    description: "Applies random zeroing mask during training to avoid overfitting",
    defaultParams: { rate: 0.2 }
  }
};

interface ModelLayer {
  id: string;
  type: string;
  params: Record<string, any>;
}

export default function ArchitectureDesigner() {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState("CyberHex-Custom-Net");
  const [inputFeatures, setInputFeatures] = useState<number>(784); // Default e.g. MNIST
  const [layers, setLayers] = useState<ModelLayer[]>([
    { id: "1", type: "Dense", params: { out_features: 128, init_type: "HE" } },
    { id: "2", type: "ReLU", params: {} },
    { id: "3", type: "Dense", params: { out_features: 10, init_type: "XAVIER" } },
    { id: "4", type: "Softmax", params: {} }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("1");
  const [optimizer, setOptimizer] = useState<string>("Adam");
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [lossFunction, setLossFunction] = useState<string>("Categorical Cross-Entropy");

  const [activeTab, setActiveTab] = useState<"visual" | "cpp" | "json" | "wasm">("visual");

  // WASM simulation states
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [wasmLoading, setWasmLoading] = useState<boolean>(false);
  const [wasmError, setWasmError] = useState<string | null>(null);
  const [wasmModel, setWasmModel] = useState<any>(null);
  const [wasmXMatrix, setWasmXMatrix] = useState<any>(null);
  const [wasmYMatrix, setWasmYMatrix] = useState<any>(null);
  const [isWasmTraining, setIsWasmTraining] = useState<boolean>(false);
  const [wasmEpochs, setWasmEpochs] = useState<number>(250);
  const [currentWasmEpoch, setCurrentWasmEpoch] = useState<number>(0);
  const [wasmLossHistory, setWasmLossHistory] = useState<{ epoch: number; loss: number }[]>([]);
  const [wasmDatasetType, setWasmDatasetType] = useState<"xor" | "circle" | "sine">("xor");
  const [wasmPoints, setWasmPoints] = useState<any[]>([]);

  // Cleanup WASM memory on unmount or replace
  useEffect(() => {
    return () => {
      if (wasmModel) {
        try { wasmModel.delete(); } catch(e) {}
      }
      if (wasmXMatrix) {
        try { wasmXMatrix.delete(); } catch(e) {}
      }
      if (wasmYMatrix) {
        try { wasmYMatrix.delete(); } catch(e) {}
      }
    };
  }, [wasmModel, wasmXMatrix, wasmYMatrix]);

  // Generate 2D dataset
  const generateDataset = (type: "xor" | "circle" | "sine", count: number = 200) => {
    const X: number[] = [];
    const y: number[] = [];
    const points: { x1: number; x2: number; label: number }[] = [];

    for (let i = 0; i < count; i++) {
      const x1 = Math.random() * 3.0 - 1.5;
      const x2 = Math.random() * 3.0 - 1.5;
      let label = 0;

      if (type === "xor") {
        label = (x1 > 0 && x2 > 0) || (x1 < 0 && x2 < 0) ? 1 : 0;
      } else if (type === "circle") {
        label = x1 * x1 + x2 * x2 < 0.64 ? 1 : 0;
      } else { // sine
        const targetVal = Math.sin(x1 * 2) * 0.8;
        label = x2 > targetVal ? 1 : 0; // Classify above/below sine curve
      }

      X.push(x1, x2);
      y.push(label);
      points.push({ x1, x2, label });
    }
    return { X, y, points };
  };

  const drawDecisionBoundary = (module: any, model: any, points: any[]) => {
    const canvas = document.getElementById("wasm-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Predict grid
    const gridSize = 40;
    const gridX: number[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cx = (c / (gridSize - 1)) * 3.0 - 1.5;
        const cy = (1.5 - (r / (gridSize - 1)) * 3.0) - 1.5;
        gridX.push(cx, cy);
      }
    }

    try {
      const grid_mat = new module.Matrix(gridSize * gridSize, 2);
      grid_mat.setData(gridX);
      
      const pred_mat = model.predict(grid_mat);
      const preds = pred_mat.getData();
      
      grid_mat.delete();
      pred_mat.delete();

      // Draw background pixels
      const cellW = width / gridSize;
      const cellH = height / gridSize;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const val = preds[r * gridSize + c];
          
          // Interpolate colors
          let color = "";
          if (val > 0.5) {
            const alpha = Math.min((val - 0.5) * 1.5, 0.45);
            color = `rgba(34, 197, 94, ${alpha})`;
          } else {
            const alpha = Math.min((0.5 - val) * 1.5, 0.45);
            color = `rgba(139, 92, 246, ${alpha})`;
          }

          ctx.fillStyle = color;
          ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    } catch (e) {
      console.error("Boundary prediction failed:", e);
    }

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw training data points
    points.forEach(pt => {
      const cx = ((pt.x1 + 1.5) / 3.0) * width;
      const cy = ((1.5 - pt.x2) / 3.0) * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
      
      if (pt.label === 1) {
        ctx.fillStyle = "#22c55e"; // bright green
        ctx.strokeStyle = "#ffffff";
      } else {
        ctx.fillStyle = "#8b5cf6"; // bright purple
        ctx.strokeStyle = "#ffffff";
      }
      
      ctx.lineWidth = 1.0;
      ctx.fill();
      ctx.stroke();
    });
  };

  const startWasmSimulation = async () => {
    setWasmLoading(true);
    setWasmError(null);
    setIsWasmTraining(false);
    try {
      let module = wasmModule;
      if (!module) {
        module = await new Promise((resolve, reject) => {
          if ((window as any).createCyberHexModule) {
            (window as any).createCyberHexModule().then(resolve).catch(reject);
            return;
          }
          const script = document.createElement("script");
          script.src = "/wasm/cyberhex_wasm.js";
          script.onload = () => {
            (window as any).createCyberHexModule().then(resolve).catch(reject);
          };
          script.onerror = () => reject(new Error("Failed to load WebAssembly library script"));
          document.body.appendChild(script);
        });
        setWasmModule(module);
      }

      if (wasmModel) {
        try { wasmModel.delete(); } catch(e) {}
      }
      if (wasmXMatrix) {
        try { wasmXMatrix.delete(); } catch(e) {}
      }
      if (wasmYMatrix) {
        try { wasmYMatrix.delete(); } catch(e) {}
      }

      const model = new module.Model();

      let prevOut = 2;
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        if (l.type === "Dense") {
          let out = Number(l.params.out_features) || 16;
          const isLastDense = !layers.slice(i + 1).some(ly => ly.type === "Dense");
          if (isLastDense) {
            out = 1;
          }
          
          const initEnum = module.InitType[l.params.init_type || "HE"] || module.InitType.HE;
          const denseLayer = new module.Dense(prevOut, out, initEnum);
          model.add(denseLayer);
          prevOut = out;
        } else if (l.type === "ReLU") {
          model.add(new module.ReLU());
        } else if (l.type === "Sigmoid") {
          model.add(new module.Sigmoid());
        } else if (l.type === "Softmax") {
          model.add(new module.Sigmoid());
        } else if (l.type === "Tanh") {
          model.add(new module.Tanh());
        } else if (l.type === "LayerNormalization") {
          model.add(new module.LayerNormalization(prevOut));
        } else if (l.type === "MultiHeadSelfAttention") {
          model.add(new module.MultiHeadSelfAttention(prevOut, Number(l.params.num_heads) || 4));
        } else if (l.type === "TransformerEncoderBlock") {
          model.add(new module.TransformerEncoderBlock(prevOut, Number(l.params.num_heads) || 4, Number(l.params.ffn_dim) || 128));
        }
      }

      let lossName = "BCE";
      if (lossFunction.includes("Mean Squared") || lossFunction.includes("MSE")) {
        lossName = "MSE";
      } else if (lossFunction.includes("Absolute") || lossFunction.includes("MAE")) {
        lossName = "MAE";
      }
      
      let optName = "Adam";
      if (optimizer === "SGD") optName = "SGD";
      
      model.compileWithLossAndOptimizer(lossName, optName, learningRate);

      const data = generateDataset(wasmDatasetType);
      setWasmPoints(data.points);

      const X_mat = new module.Matrix(data.X.length / 2, 2);
      X_mat.setData(data.X);
      const y_mat = new module.Matrix(data.y.length, 1);
      y_mat.setData(data.y);

      setWasmModel(model);
      setWasmXMatrix(X_mat);
      setWasmYMatrix(y_mat);
      setWasmLossHistory([]);
      setCurrentWasmEpoch(0);
      setWasmLoading(false);
      
      setTimeout(() => drawDecisionBoundary(module, model, data.points), 50);

    } catch (e: any) {
      console.error(e);
      setWasmError(e.message || "An error occurred during WASM initialization");
      setWasmLoading(false);
    }
  };

  // Run wasm training loop step
  useEffect(() => {
    let animationFrameId: number;
    
    const runTrainingStep = () => {
      if (!isWasmTraining || !wasmModel || !wasmXMatrix || !wasmYMatrix) return;
      
      if (currentWasmEpoch >= wasmEpochs) {
        setIsWasmTraining(false);
        return;
      }

      try {
        const loss = wasmModel.trainStep(wasmXMatrix, wasmYMatrix, currentWasmEpoch);
        
        const newEpoch = currentWasmEpoch + 1;
        setCurrentWasmEpoch(newEpoch);
        
        setWasmLossHistory(prev => {
          const updated = [...prev, { epoch: newEpoch, loss: Number(loss.toFixed(6)) }];
          if (updated.length > 100) {
            return updated.filter((_, idx) => idx % 2 === 0 || idx === updated.length - 1);
          }
          return updated;
        });

        if (newEpoch % 5 === 0 || newEpoch === 1) {
          drawDecisionBoundary(wasmModule, wasmModel, wasmPoints);
        }

        animationFrameId = requestAnimationFrame(runTrainingStep);
      } catch (err: any) {
        console.error(err);
        setWasmError("Training loop error: " + err.message);
        setIsWasmTraining(false);
      }
    };

    if (isWasmTraining) {
      animationFrameId = requestAnimationFrame(runTrainingStep);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isWasmTraining, wasmModule, wasmModel, wasmXMatrix, wasmYMatrix, currentWasmEpoch, wasmEpochs, wasmPoints]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;


  const handleAddLayer = (type: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newLayer: ModelLayer = {
      id,
      type,
      params: { ...AVAILABLE_LAYERS[type].defaultParams }
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(id);
  };

  const handleRemoveLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = layers.filter((l) => l.id !== id);
    setLayers(updated);
    if (selectedLayerId === id) {
      setSelectedLayerId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleUpdateParam = (paramName: string, value: any) => {
    if (!selectedLayerId) return;
    setLayers(
      layers.map((l) => {
        if (l.id === selectedLayerId) {
          return {
            ...l,
            params: {
              ...l.params,
              [paramName]: value
            }
          };
        }
        return l;
      })
    );
  };

  // Dimensionality propagation display
  const getShapes = (): number[] => {
    const shapes: number[] = [inputFeatures];
    let current = inputFeatures;
    layers.forEach((l) => {
      if (l.type === "Dense") {
        current = Number(l.params.out_features) || current;
      }
      shapes.push(current);
    });
    return shapes;
  };

  const shapes = getShapes();

  // Code generator helper
  const generateCppCode = (): string => {
    let code = `// Automatically generated by CyberHex Architecture Designer\n`;
    code += `#include "model.h"\n`;
    code += `#include "dense.h"\n`;
    code += `#include "activations.h"\n`;
    code += `#include "transformer.h"\n\n`;
    code += `using namespace cyberhex;\n\n`;
    code += `Model build_model() {\n`;
    code += `    Model model;\n\n`;

    let prevFeatures = inputFeatures;
    layers.forEach((l) => {
      if (l.type === "Dense") {
        const out = l.params.out_features || 64;
        const init = l.params.init_type || "HE";
        code += `    model.add(std::make_unique<Dense>(${prevFeatures}, ${out}, InitType::${init}));\n`;
        prevFeatures = out;
      } else if (l.type === "ReLU") {
        code += `    model.add(std::make_unique<ReLU>());\n`;
      } else if (l.type === "GELU") {
        code += `    model.add(std::make_unique<GELU>());\n`;
      } else if (l.type === "Sigmoid") {
        code += `    model.add(std::make_unique<Sigmoid>());\n`;
      } else if (l.type === "Softmax") {
        code += `    model.add(std::make_unique<Softmax>());\n`;
      } else if (l.type === "Dropout") {
        code += `    model.add(std::make_unique<Dropout>(${l.params.rate || 0.2}));\n`;
      } else if (l.type === "LayerNormalization") {
        code += `    model.add(std::make_unique<LayerNormalization>(${prevFeatures}));\n`;
      } else if (l.type === "BatchNormalization") {
        code += `    model.add(std::make_unique<BatchNormalization>(${prevFeatures}));\n`;
      } else if (l.type === "MultiHeadSelfAttention") {
        code += `    model.add(std::make_unique<MultiHeadSelfAttention>(${prevFeatures}, ${l.params.num_heads || 8}));\n`;
      } else if (l.type === "TransformerEncoderBlock") {
        code += `    model.add(std::make_unique<TransformerEncoderBlock>(${prevFeatures}, ${l.params.num_heads || 8}, ${l.params.ffn_dim || 2048}));\n`;
      }
    });

    code += `\n`;
    let optClass = "AdamOptimizer";
    if (optimizer === "SGD") optClass = "SGDOptimizer";
    else if (optimizer === "RMSprop") optClass = "RMSpropOptimizer";

    let lossEnum = "CCE";
    if (lossFunction === "MSE") lossEnum = "MSE";
    else if (lossFunction === "BCE") lossEnum = "BCE";

    code += `    model.compile(\n`;
    code += `        std::make_unique<${optClass}>(${learningRate}),\n`;
    code += `        std::make_unique<${lossEnum === "MSE" ? "MSELoss" : "CategoricalCrossEntropyLoss"}>()\n`;
    code += `    );\n\n`;
    code += `    return model;\n`;
    code += `}`;
    return code;
  };

  const handleExportJson = () => {
    const data = {
      modelName,
      inputFeatures,
      layers,
      optimizer,
      learningRate,
      lossFunction
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-8 pt-24 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Flex justify="between" align="center" wrap gap="md">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Cpu className="h-7 w-7 text-green-400" />
              Neural Architecture Designer
              <Badge variant="default" size="sm" className="ml-2 bg-violet-500/20 text-violet-400 border border-violet-500/30">
                PRO BUILDER
              </Badge>
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Visually assemble layers, configure hyperparameters, and auto-export production-ready C++ code.
            </p>
          </div>
          <Flex gap="sm" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Config
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // Pre-populate experiment database or navigate with state
                navigate("/experiments/new", {
                  state: {
                    prebuiltLayers: layers,
                    prebuiltParams: { optimizer, learningRate, name: modelName }
                  }
                });
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
            >
              <Play className="h-4 w-4 mr-1.5" />
              Train Model
            </Button>
          </Flex>
        </Flex>
      </motion.div>

      {/* Workspace Grid */}
      <Grid cols={4} gap="md" className="items-stretch">
        
        {/* Left Side: Layer Palette */}
        <div className="col-span-1 space-y-4">
          <Card className="h-full border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-neutral-800/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-400" />
                Add Layer Blocks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-3 max-h-[70vh] overflow-y-auto space-y-4">
              
              {/* Category: Core */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 px-1">
                  Core Layers
                </p>
                <div className="space-y-1.5">
                  {Object.entries(AVAILABLE_LAYERS)
                    .filter(([_, l]) => l.category === "core")
                    .map(([key, layer]) => (
                      <button
                        key={key}
                        onClick={() => handleAddLayer(key)}
                        className="w-full text-left rounded-xl p-2 bg-neutral-850/40 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 group"
                      >
                        <Flex justify="between" align="center" gap="sm">
                          <div>
                            <p className="text-xs font-semibold text-white group-hover:text-green-400 transition-colors">
                              {key}
                            </p>
                            <p className="text-[9px] text-neutral-500 line-clamp-1">
                              {layer.description}
                            </p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-neutral-600 group-hover:text-green-400 transition-all" />
                        </Flex>
                      </button>
                    ))}
                </div>
              </div>

              {/* Category: Activations */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 px-1">
                  Activations
                </p>
                <div className="space-y-1.5">
                  {Object.entries(AVAILABLE_LAYERS)
                    .filter(([_, l]) => l.category === "activation")
                    .map(([key, layer]) => (
                      <button
                        key={key}
                        onClick={() => handleAddLayer(key)}
                        className="w-full text-left rounded-xl p-2 bg-neutral-850/40 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 group"
                      >
                        <Flex justify="between" align="center" gap="sm">
                          <div>
                            <p className="text-xs font-semibold text-white group-hover:text-violet-400 transition-colors">
                              {key}
                            </p>
                            <p className="text-[9px] text-neutral-500 line-clamp-1">
                              {layer.description}
                            </p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-neutral-600 group-hover:text-violet-400 transition-all" />
                        </Flex>
                      </button>
                    ))}
                </div>
              </div>

              {/* Category: Advanced / Transformers */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 px-1">
                  Transformers & Advanced
                </p>
                <div className="space-y-1.5">
                  {Object.entries(AVAILABLE_LAYERS)
                    .filter(([_, l]) => l.category === "advanced" || l.category === "normalization")
                    .map(([key, layer]) => (
                      <button
                        key={key}
                        onClick={() => handleAddLayer(key)}
                        className="w-full text-left rounded-xl p-2 bg-neutral-850/40 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 group"
                      >
                        <Flex justify="between" align="center" gap="sm">
                          <div>
                            <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {key}
                            </p>
                            <p className="text-[9px] text-neutral-500 line-clamp-1">
                              {layer.description}
                            </p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-neutral-600 group-hover:text-amber-400 transition-all" />
                        </Flex>
                      </button>
                    ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Center Pane: The Visual Canvas & Exporters */}
        <div className="col-span-2 space-y-4 flex flex-col">
          {/* Workspace Tabs */}
          <Flex className="border-b border-neutral-800/80 pb-0.5" gap="sm">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-all duration-200 ${
                activeTab === "visual"
                  ? "text-green-400 border-green-500 bg-green-500/5"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              Visual Canvas
            </button>
            <button
              onClick={() => setActiveTab("cpp")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-all duration-200 ${
                activeTab === "cpp"
                  ? "text-green-400 border-green-500 bg-green-500/5"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              C++ Code
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-all duration-200 ${
                activeTab === "json"
                  ? "text-green-400 border-green-500 bg-green-500/5"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              JSON Manifest
            </button>
          </Flex>

          {/* Active Workspace View */}
          <div className="flex-1 min-h-[500px]">
            {activeTab === "visual" && (
              <GlowCard className="p-6 h-full bg-neutral-950/40 relative overflow-hidden flex flex-col">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

                {/* Input node */}
                <div className="relative z-10 mx-auto flex flex-col items-center mb-6">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2 flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">Input Vector</p>
                      <input
                        type="number"
                        value={inputFeatures}
                        onChange={(e) => setInputFeatures(Math.max(1, Number(e.target.value)))}
                        className="bg-transparent border-b border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-green-500 w-16"
                      />
                    </div>
                  </div>
                  <div className="h-6 w-0.5 bg-neutral-800/80 relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-[5px] border-t-neutral-800 border-x-[5px] border-x-transparent" />
                  </div>
                </div>

                {/* Layers Container with Reorder.Group */}
                <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2 z-10">
                  {layers.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-neutral-500">
                      <Layers className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No layers added yet. Click blocks on the left to add!</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={layers} onReorder={setLayers} className="space-y-4">
                      {layers.map((layer, idx) => {
                        const isSelected = selectedLayerId === layer.id;
                        const inShape = shapes[idx];
                        const outShape = shapes[idx + 1];

                        return (
                          <Reorder.Item
                            key={layer.id}
                            value={layer}
                            onClick={() => setSelectedLayerId(layer.id)}
                            className={`cursor-grab active:cursor-grabbing relative flex flex-col items-center transition-all ${
                              isSelected ? "z-25" : "z-10"
                            }`}
                          >
                            {/* Layer card wrapper */}
                            <div
                              className={`w-full max-w-md rounded-2xl border p-3.5 transition-all duration-300 ${
                                isSelected
                                  ? "border-green-500/50 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                              }`}
                            >
                              <Flex justify="between" align="center">
                                <Flex gap="sm">
                                  <div className="h-7 w-7 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-xs font-bold font-mono text-green-400">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                      {layer.type}
                                      {AVAILABLE_LAYERS[layer.type].category === "advanced" && (
                                        <Sparkles className="h-3 w-3 text-amber-400" />
                                      )}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 font-mono">
                                      {inShape} → {outShape} features
                                    </p>
                                  </div>
                                </Flex>

                                <Flex gap="sm">
                                  {/* Trash */}
                                  <button
                                    onClick={(e) => handleRemoveLayer(layer.id, e)}
                                    className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </Flex>
                              </Flex>

                              {/* Parameter micro-previews */}
                              {Object.keys(layer.params).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800/40">
                                  {Object.entries(layer.params).map(([k, v]) => (
                                    <Badge key={k} variant="outline" size="sm" className="text-[9px] py-0 px-1 bg-neutral-800/40 text-neutral-400 font-mono">
                                      {k}: {String(v)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Connector line to next layer */}
                            <div className="h-4 w-0.5 bg-neutral-800/80 relative">
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-[5px] border-t-neutral-800 border-x-[5px] border-x-transparent" />
                            </div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  )}
                </div>

                {/* Output node */}
                <div className="relative z-10 mx-auto flex flex-col items-center mt-2">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase text-center">Output Dim</p>
                    <p className="text-xs text-white font-mono text-center font-bold">
                      [Batch, {shapes[shapes.length - 1]}]
                    </p>
                  </div>
                </div>

              </GlowCard>
            )}

            {activeTab === "cpp" && (
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-2 border-b border-neutral-800/40 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-mono text-neutral-400 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-green-400" />
                    model_architecture.cpp
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateCppCode());
                    }}
                  >
                    Copy Code
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <pre className="p-4 text-xs font-mono text-neutral-300 overflow-auto max-h-[60vh] bg-neutral-950/80 leading-relaxed">
                    <code>{generateCppCode()}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {activeTab === "json" && (
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-2 border-b border-neutral-800/40 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-mono text-neutral-400 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-green-400" />
                    model_config.json
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const data = { modelName, inputFeatures, layers, optimizer, learningRate, lossFunction };
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                    }}
                  >
                    Copy JSON
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <pre className="p-4 text-xs font-mono text-neutral-300 overflow-auto max-h-[60vh] bg-neutral-950/80 leading-relaxed">
                    <code>
                      {JSON.stringify(
                        {
                          modelName,
                          inputFeatures,
                          layers: layers.map(({ type, params }) => ({ type, params })),
                          optimizer,
                          learningRate,
                          lossFunction
                        },
                        null,
                        2
                      )}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Configuration Panel */}
        <div className="col-span-1 space-y-4">
          <Card className="border-neutral-800 bg-neutral-900/60 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-neutral-800/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-violet-400" />
                Configure Node
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5 flex-1 overflow-y-auto">
              
              {/* Layer Selection Specific Controls */}
              <AnimatePresence mode="wait">
                {selectedLayer ? (
                  <motion.div
                    key={selectedLayer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Active Layer block
                      </p>
                      <h4 className="text-sm font-extrabold text-white">
                        {selectedLayer.type}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {AVAILABLE_LAYERS[selectedLayer.type].description}
                      </p>
                    </div>

                    <div className="divider-cyber my-2" />

                    {/* Parameter inputs based on type */}
                    <div className="space-y-3.5">
                      {selectedLayer.type === "Dense" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                              Output Features
                            </label>
                            <input
                              type="number"
                              value={selectedLayer.params.out_features || 128}
                              onChange={(e) => handleUpdateParam("out_features", Number(e.target.value))}
                              className="input-cyber font-mono w-full"
                              min={1}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                              Weight Init Method
                            </label>
                            <select
                              value={selectedLayer.params.init_type || "HE"}
                              onChange={(e) => handleUpdateParam("init_type", e.target.value)}
                              className="input-cyber w-full bg-neutral-900"
                            >
                              <option value="HE">He Normal (HE)</option>
                              <option value="XAVIER">Xavier Normal (Xavier)</option>
                              <option value="LECUN_NORMAL">LeCun Normal</option>
                              <option value="HE_UNIFORM">He Uniform</option>
                              <option value="XAVIER_UNIFORM">Xavier Uniform</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedLayer.type === "Conv2D" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                              Output Channels
                            </label>
                            <input
                              type="number"
                              value={selectedLayer.params.out_channels || 32}
                              onChange={(e) => handleUpdateParam("out_channels", Number(e.target.value))}
                              className="input-cyber font-mono w-full"
                              min={1}
                            />
                          </div>
                          <Grid cols={2} gap="sm">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-neutral-300">
                                Kernel Size
                              </label>
                              <input
                                type="number"
                                value={selectedLayer.params.kernel_size || 3}
                                onChange={(e) => handleUpdateParam("kernel_size", Number(e.target.value))}
                                className="input-cyber font-mono w-full"
                                min={1}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-neutral-300">
                                Stride
                              </label>
                              <input
                                type="number"
                                value={selectedLayer.params.stride || 1}
                                onChange={(e) => handleUpdateParam("stride", Number(e.target.value))}
                                className="input-cyber font-mono w-full"
                                min={1}
                              />
                            </div>
                          </Grid>
                        </>
                      )}

                      {selectedLayer.type === "Dropout" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            Dropout Rate (0.0 - 1.0)
                          </label>
                          <input
                            type="number"
                            value={selectedLayer.params.rate || 0.2}
                            onChange={(e) => handleUpdateParam("rate", parseFloat(e.target.value))}
                            className="input-cyber font-mono w-full"
                            min={0.0}
                            max={0.9}
                            step={0.05}
                          />
                        </div>
                      )}

                      {selectedLayer.type === "MultiHeadSelfAttention" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            Attention Heads
                          </label>
                          <select
                            value={selectedLayer.params.num_heads || 8}
                            onChange={(e) => handleUpdateParam("num_heads", Number(e.target.value))}
                            className="input-cyber w-full bg-neutral-900 font-mono"
                          >
                            <option value="2">2 Heads</option>
                            <option value="4">4 Heads</option>
                            <option value="8">8 Heads</option>
                            <option value="16">16 Heads</option>
                          </select>
                        </div>
                      )}

                      {selectedLayer.type === "TransformerEncoderBlock" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                              Attention Heads
                            </label>
                            <select
                              value={selectedLayer.params.num_heads || 8}
                              onChange={(e) => handleUpdateParam("num_heads", Number(e.target.value))}
                              className="input-cyber w-full bg-neutral-900 font-mono"
                            >
                              <option value="2">2 Heads</option>
                              <option value="4">4 Heads</option>
                              <option value="8">8 Heads</option>
                              <option value="16">16 Heads</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                              FFN Hidden Dimension
                            </label>
                            <input
                              type="number"
                              value={selectedLayer.params.ffn_dim || 2048}
                              onChange={(e) => handleUpdateParam("ffn_dim", Number(e.target.value))}
                              className="input-cyber font-mono w-full"
                              min={128}
                              step={128}
                            />
                          </div>
                        </>
                      )}

                      {AVAILABLE_LAYERS[selectedLayer.type].category === "activation" && (
                        <div className="rounded-xl border border-neutral-850 bg-neutral-900/40 p-3 flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-neutral-400 leading-normal">
                            Activation layers do not alter input shape. They apply element-wise mathematical non-linear transforms to inputs to allow gradient backpropagation.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-neutral-500">
                    <Settings2 className="h-8 w-8 mb-2 opacity-50 animate-pulse" />
                    <p className="text-xs text-center px-4">Select an active layer node on the canvas to configure its parameters.</p>
                  </div>
                )}
              </AnimatePresence>

              <div className="divider-cyber my-6" />

              {/* Global Model training hyperparameters */}
              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                  Model Hyperparameters
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="input-cyber w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Optimizer
                  </label>
                  <select
                    value={optimizer}
                    onChange={(e) => setOptimizer(e.target.value)}
                    className="input-cyber w-full bg-neutral-900"
                  >
                    <option value="Adam">Adam</option>
                    <option value="SGD">Stochastic Gradient Descent (SGD)</option>
                    <option value="RMSprop">RMSprop</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Learning Rate
                  </label>
                  <input
                    type="number"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="input-cyber font-mono w-full"
                    step={0.0001}
                    min={0.00001}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Loss Function
                  </label>
                  <select
                    value={lossFunction}
                    onChange={(e) => setLossFunction(e.target.value)}
                    className="input-cyber w-full bg-neutral-900"
                  >
                    <option value="Categorical Cross-Entropy">Categorical Cross-Entropy (CCE)</option>
                    <option value="Mean Squared Error">Mean Squared Error (MSE)</option>
                    <option value="Binary Cross-Entropy">Binary Cross-Entropy (BCE)</option>
                  </select>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </Grid>
    </Container>
  );
}
