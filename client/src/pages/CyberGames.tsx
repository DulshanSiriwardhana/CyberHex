import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import { useWebSocket } from "@/hooks/useWebSocket"
import { PageLayout } from "@/components/ui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Play, Square, RefreshCw, Cpu, TrendingDown } from "lucide-react"

interface LossData {
  epoch: number
  loss: number
}

const CyberGames = () => {
  const [lossData, setLossData] = useState<LossData[]>([])
  const [isTraining, setIsTraining] = useState(false)

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === "loss_update") {
      setLossData(prev => [...prev, { epoch: data.epoch, loss: data.loss }])
    }
  }, [])

  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws"
  const websocketUrl = `${wsProtocol}://${window.location.host}`
  useWebSocket(websocketUrl, handleWebSocketMessage)

  const currentLoss = lossData.length > 0 ? lossData[lossData.length - 1].loss.toFixed(4) : "—"
  const totalEpochs = lossData.length

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-spectral text-3xl font-extrabold text-white">
                ML Training Dashboard
              </h1>
              <p className="text-neutral-400 text-sm">
                Real-time model training visualization and monitoring
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-neutral-500">
                <Activity className="w-4 h-4" />
                Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isTraining ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
                <span className="text-white font-semibold">{isTraining ? "Training" : "Idle"}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-neutral-500">
                <TrendingDown className="w-4 h-4" />
                Current Loss
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-white">{currentLoss}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-neutral-500">
                <RefreshCw className="w-4 h-4" />
                Epochs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-white">{totalEpochs}</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card glow>
            <CardHeader>
              <CardTitle className="text-white text-lg">Training Loss Curve</CardTitle>
              <CardDescription>
                Real-time loss progression across training epochs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lossData.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Activity className="w-12 h-12 text-neutral-700 mx-auto" />
                    <div>
                      <p className="text-neutral-500 font-medium">No training data yet</p>
                      <p className="text-neutral-600 text-sm mt-1">Connect a training session to see live metrics</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis
                        dataKey="epoch"
                        stroke="#525252"
                        tick={{ fill: "#a3a3a3", fontSize: 12 }}
                        label={{ value: "Epoch", position: "bottom", fill: "#737373", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#525252"
                        tick={{ fill: "#a3a3a3", fontSize: 12 }}
                        label={{ value: "Loss", angle: -90, position: "left", fill: "#737373", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          border: "1px solid #262626",
                          borderRadius: "8px",
                          color: "#fafafa",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: "#a3a3a3", fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="loss"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#dc2626" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <Button
            variant="cyber"
            size="lg"
            onClick={() => setIsTraining(true)}
            disabled={isTraining}
            aria-label="Start Training"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Training
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsTraining(false)}
            disabled={!isTraining}
            aria-label="Stop Training"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setLossData([])}
            disabled={lossData.length === 0}
            aria-label="Reset Data"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  )
}

export default CyberGames