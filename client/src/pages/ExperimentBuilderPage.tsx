import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Trash2, FlaskConical, Play, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useExperimentsStore } from "@/stores/experiments"

interface LayerConfig {
  units: number
  activation: string
}

const ACTIVATIONS = ["ReLU", "Sigmoid", "Softmax", "Tanh"]

const ExperimentBuilderPage = () => {
  const navigate = useNavigate()
  const { create } = useExperimentsStore()
  const [name, setName] = useState("")
  const [layers, setLayers] = useState<LayerConfig[]>([
    { units: 64, activation: "ReLU" },
    { units: 32, activation: "ReLU" },
  ])
  const [batchSize, setBatchSize] = useState(32)
  const [epochs, setEpochs] = useState(50)
  const [learningRate, setLearningRate] = useState(0.001)
  const [optimizer, setOptimizer] = useState("adam")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const addLayer = () => {
    setLayers([...layers, { units: 32, activation: "ReLU" }])
  }

  const removeLayer = (index: number) => {
    if (layers.length <= 1) return
    setLayers(layers.filter((_, i) => i !== index))
  }

  const updateLayer = (index: number, field: keyof LayerConfig, value: string | number) => {
    const next = [...layers]
    next[index] = { ...next[index], [field]: field === "units" ? Number(value) : value }
    setLayers(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Experiment name is required")
      return
    }

    setIsSubmitting(true)
    try {
      create({
        name: name.trim(),
        config: {
          layers: layers.map((l) => ({ units: l.units, activation: l.activation })),
          batchSize,
          epochs,
          learningRate,
          optimizer,
        },
      })
      navigate("/experiments")
    } catch {
      setError("Failed to create experiment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link
            to="/experiments"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to experiments
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-spectral text-3xl font-extrabold text-white">New Experiment</h1>
              <p className="text-neutral-400 text-sm">Configure your neural network and start training</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white text-lg">Experiment Name</CardTitle>
              <CardDescription>Give your experiment a descriptive name</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MNIST Classifier v2"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
              />
            </CardContent>
          </Card>

          {/* Layers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-neutral-400" />
                    Network Layers
                  </CardTitle>
                  <CardDescription>Add dense layers to your neural network</CardDescription>
                </div>
                <Badge variant="neutral">{layers.length} layers</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {layers.map((layer, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 text-xs font-mono w-6">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-neutral-500 mb-1 block">Units</label>
                        <input
                          type="number"
                          min={1}
                          max={2048}
                          value={layer.units}
                          onChange={(e) => updateLayer(i, "units", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-neutral-700 bg-neutral-800 text-white text-sm focus:border-red-600 outline-none transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-neutral-500 mb-1 block">Activation</label>
                        <select
                          value={layer.activation}
                          onChange={(e) => updateLayer(i, "activation", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-neutral-700 bg-neutral-800 text-white text-sm focus:border-red-600 outline-none transition-all"
                        >
                          {ACTIVATIONS.map((act) => (
                            <option key={act} value={act}>{act}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLayer(i)}
                      disabled={layers.length <= 1}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Remove layer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addLayer} className="mt-4 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Layer
              </Button>
            </CardContent>
          </Card>

          {/* Training Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white text-lg">Training Configuration</CardTitle>
              <CardDescription>Set hyperparameters for training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Batch Size</label>
                  <input
                    type="number"
                    min={1}
                    max={1024}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Epochs</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Learning Rate</label>
                  <input
                    type="number"
                    min={0.00001}
                    max={1}
                    step={0.0001}
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Optimizer</label>
                  <select
                    value={optimizer}
                    onChange={(e) => setOptimizer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  >
                    <option value="adam">ADAM</option>
                    <option value="sgd">SGD</option>
                    <option value="momentum">Momentum</option>
                    <option value="rmsprop">RMSProp</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 text-center">
              {error}
            </motion.p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/experiments")} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="cyber" size="lg" className="flex-1" isLoading={isSubmitting}>
              <Play className="w-4 h-4 mr-2" />
              Create Experiment
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

export default ExperimentBuilderPage