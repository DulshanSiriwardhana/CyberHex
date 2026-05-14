import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Brain, Layers, TrendingDown, Clock, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const demoModels = [
  {
    id: "1",
    name: "MNIST Classifier v2",
    description: "Handwritten digit recognition using a 3-layer dense network",
    layers: 3,
    totalParams: 128450,
    accuracy: 97.8,
    status: "completed",
    lastTrained: "2026-05-10",
    architecture: ["784 → 128", "128 → 64", "64 → 10"],
    activations: ["ReLU", "ReLU", "Softmax"],
  },
  {
    id: "2",
    name: "Sentiment Analyzer",
    description: "Binary sentiment classification with dense embedding projection",
    layers: 2,
    totalParams: 52432,
    accuracy: 85.4,
    status: "running",
    lastTrained: "2026-05-13",
    architecture: ["512 → 256", "256 → 2"],
    activations: ["ReLU", "Sigmoid"],
  },
  {
    id: "3",
    name: "XOR Network",
    description: "Simple XOR logic function verification network",
    layers: 2,
    totalParams: 421,
    accuracy: 100.0,
    status: "completed",
    lastTrained: "2026-04-28",
    architecture: ["2 → 4", "4 → 1"],
    activations: ["ReLU", "Sigmoid"],
  },
  {
    id: "4",
    name: "Fashion MNIST",
    description: "Fashion item classification with deeper architecture",
    layers: 4,
    totalParams: 198304,
    accuracy: 91.2,
    status: "failed",
    lastTrained: "2026-05-08",
    architecture: ["784 → 256", "256 → 128", "128 → 64", "64 → 10"],
    activations: ["ReLU", "ReLU", "ReLU", "Softmax"],
  },
]

const statusVariant = (status: string): "default" | "success" | "warning" | "danger" | "neutral" => {
  switch (status) {
    case "running": return "success"
    case "completed": return "neutral"
    case "failed": return "danger"
    default: return "default"
  }
}

const ModelsPage = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h1 className="font-spectral text-3xl font-extrabold text-white">Models</h1>
                <p className="text-neutral-400 text-sm">Browse, compare, and manage your trained models</p>
              </div>
            </div>
            <Link to="/experiments/new">
              <Button variant="cyber" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <p className="text-text-tertiary text-sm mb-1">Total Models</p>
              <p className="font-spectral font-bold text-3xl text-white">{demoModels.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-text-tertiary text-sm mb-1">Avg Accuracy</p>
              <p className="font-spectral font-bold text-3xl text-green-400">
                {(demoModels.reduce((acc, m) => acc + m.accuracy, 0) / demoModels.length).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-text-tertiary text-sm mb-1">Completed</p>
              <p className="font-spectral font-bold text-3xl text-white">
                {demoModels.filter((m) => m.status === "completed").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-text-tertiary text-sm mb-1">Active</p>
              <p className="font-spectral font-bold text-3xl text-green-500">
                {demoModels.filter((m) => m.status === "running").length}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {demoModels.map((model) => (
            <Card key={model.id} glow className="group hover:border-neutral-700 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-red-400 transition-colors">
                      {model.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  <Badge variant={statusVariant(model.status)}>{model.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Architecture */}
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Architecture
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {model.architecture.map((layer, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-300 font-mono bg-neutral-800 px-2 py-1 rounded-md">
                            {layer}
                          </span>
                          {i < model.architecture.length - 1 && (
                            <span className="text-neutral-600 text-xs">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-900 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Accuracy</p>
                      <p className={`text-sm font-bold ${model.accuracy >= 90 ? "text-green-400" : model.accuracy >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                        {model.accuracy}%
                      </p>
                    </div>
                    <div className="bg-neutral-900 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Params</p>
                      <p className="text-sm font-bold text-white">{model.totalParams.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-900 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Layers</p>
                      <p className="text-sm font-bold text-white">{model.layers}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {model.lastTrained}
                    </span>
                    <Link
                      to={`/experiments/${model.id}`}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
                    >
                      View Details
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default ModelsPage