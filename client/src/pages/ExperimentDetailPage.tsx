import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Activity, TrendingDown, RefreshCw, Clock, Cpu, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useExperimentsStore } from "@/stores/experiments"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

interface Experiment {
  _id: string
  name: string
  status: string
  createdAt: string
  config?: {
    modelType?: string
    layers?: Array<{ units: number; activation: string }>
    batchSize?: number
    epochs?: number
    learningRate?: number
    optimizer?: string
  }
  metrics?: {
    loss?: number[]
    accuracy?: number[]
    epochs?: number[]
  }
}

const statusVariant = (status: string): "default" | "success" | "warning" | "danger" | "neutral" => {
  switch (status) {
    case "running": return "success"
    case "completed": return "neutral"
    case "failed": return "danger"
    case "queued": return "warning"
    default: return "default"
  }
}

const ExperimentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { experiments, fetch, remove, loading, error } = useExperimentsStore()
  const [experiment, setExperiment] = useState<Experiment | null>(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    const found = experiments.find((e) => e._id === id)
    setExperiment(found || null)
  }, [experiments, id])

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this experiment?")) return
    try {
      await remove(id)
      navigate("/experiments")
    } catch {
      // error handled by store
    }
  }

  const lossData = experiment?.metrics?.epochs?.map((epoch, i) => ({
    epoch,
    loss: experiment.metrics?.loss?.[i] ?? 0,
  })) || []

  if (loading && !experiment) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-neutral-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading experiment...
        </div>
      </div>
    )
  }

  if (!experiment && !loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.2)] flex items-center justify-center">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-spectral font-extrabold text-2xl text-white mb-3">Experiment Not Found</h1>
          <p className="text-neutral-400 text-sm mb-6">The experiment you're looking for doesn't exist or has been deleted.</p>
          <Link to="/experiments" className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition-colors">
            Back to experiments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link
            to="/experiments"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to experiments
          </Link>

          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h1 className="font-spectral text-3xl font-extrabold text-white">{experiment!.name}</h1>
                <p className="text-neutral-400 text-sm mt-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Created {new Date(experiment!.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant(experiment!.status)} className="text-sm px-3 py-1">
                {experiment!.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Loss Chart */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-neutral-400" />
                  Training Loss
                </CardTitle>
                <CardDescription>Loss progression across epochs</CardDescription>
              </CardHeader>
              <CardContent>
                {lossData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-neutral-500">No training data available yet</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="epoch" stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                        <YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            border: "1px solid #262626",
                            borderRadius: "8px",
                            color: "#fafafa",
                          }}
                        />
                        <Line type="monotone" dataKey="loss" stroke="#dc2626" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#dc2626" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Config Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-lg">Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                {experiment!.config?.layers ? (
                  <div className="space-y-2">
                    {experiment!.config.layers.map((layer, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-900">
                        <span className="text-sm text-neutral-300">
                          Layer {i + 1}
                          {i === 0 ? " (Input)" : i === experiment!.config!.layers!.length - 1 ? " (Output)" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">{layer.units} units</span>
                          <Badge variant="default">{layer.activation}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">No architecture config</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white text-lg">Hyperparameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {experiment!.config?.batchSize && (
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-400 text-sm">Batch Size</span>
                      <span className="text-white text-sm font-medium">{experiment!.config.batchSize}</span>
                    </div>
                  )}
                  {experiment!.config?.epochs && (
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-400 text-sm">Epochs</span>
                      <span className="text-white text-sm font-medium">{experiment!.config.epochs}</span>
                    </div>
                  )}
                  {experiment!.config?.learningRate && (
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-400 text-sm">Learning Rate</span>
                      <span className="text-white text-sm font-medium">{experiment!.config.learningRate}</span>
                    </div>
                  )}
                  {experiment!.config?.optimizer && (
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-400 text-sm">Optimizer</span>
                      <Badge>{experiment!.config.optimizer.toUpperCase()}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ExperimentDetailPage