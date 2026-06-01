import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  PlusCircle,
  Cpu,
  Clock,
  BarChart3,
  Download,
  Trash2,
  FlaskConical,
  ArrowRight,
  Zap,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Flex } from "@/components/ui/layout";

import { useState, useEffect } from "react";
import { modelsApi, type SavedModel } from "@/lib/api";

const statusBadges: Record<string, { variant: "success" | "default" | "muted"; label: string }> = {
  deployed: { variant: "success", label: "Deployed" },
  ready: { variant: "default", label: "Ready" },
  archived: { variant: "muted", label: "Archived" },
};

export default function ModelsPage() {
  const [models, setModels] = useState<SavedModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = () => {
    setLoading(true);
    modelsApi.list()
      .then(data => {
        setModels(data.models);
      })
      .catch(() => {

      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleDeleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await modelsApi.delete(id);
      fetchModels();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Container className="py-8 pt-24 relative h-full overflow-auto w-full max-w-full">
      <div className="absolute inset-0 cyber-grid-overlay opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 relative z-10"
      >
        <Flex justify="between" align="end" wrap className="gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-[0.2em]">Singularity Core</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
              <span className="text-gradient-max uppercase">SAVED MODELS /</span>
              <span className="text-violet-400 glow-text-violet">DEVOPS</span>
            </h1>
            <p className="mt-2 text-neutral-500 font-medium max-w-xl">
              Validated neural architectures archived and ready for native C++ inference deployment.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/experiments/new">
              <Button size="lg" className="bg-green-500 text-black hover:bg-green-400 font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <PlusCircle className="h-4 w-4 mr-2" />
                NEW ARCHITECTURE
              </Button>
            </Link>
          </div>
        </Flex>
      </motion.div>

      <Grid cols={2} gap="lg" className="relative z-10">
        {models.map((model, i) => (
          <motion.div
            key={model._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="cyber-card-max border-none group overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-violet-500/50" />
              <CardHeader className="pb-4">
                <Flex justify="between" align="start">
                  <div>
                    <CardTitle className="text-xl font-black text-white hover:text-violet-400 transition-colors uppercase tracking-tight">
                      {model.name}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Archived: {new Date(model.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-bold text-[10px] py-1">READY FOR INFERENCE</Badge>
                </Flex>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Architecture "Ghost" Preview */}
                <div className="h-24 w-full bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center gap-4 relative overflow-hidden px-6">
                  <div className="absolute inset-0 cyber-grid-overlay opacity-20 pointer-events-none" />
                  <div className="h-10 w-10 rounded-full border-2 border-green-500/40 bg-green-500/10 flex items-center justify-center relative z-10">
                    <Database className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="h-px bg-gradient-to-r from-green-500/40 to-violet-500/40 flex-1 relative z-10" />
                  <div className="flex gap-2 relative z-10">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-12 w-3 rounded-full bg-violet-500/20 border border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.1)]" />
                    ))}
                  </div>
                  <div className="h-px bg-gradient-to-r from-violet-500/40 to-amber-500/40 flex-1 relative z-10" />
                  <div className="h-10 w-10 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center relative z-10">
                    <Zap className="h-5 w-5 text-amber-400" />
                  </div>
                </div>

                <Grid cols={3} gap="sm">
                  <div className="p-3 rounded-xl bg-neutral-900/50 border border-white/5">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Accuracy / Metrics</p>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-black text-white font-mono">
                        {model.metrics?.accuracy ? (model.metrics.accuracy * 100).toFixed(1) : (model.metrics?.valLoss ? (1 - model.metrics.valLoss).toFixed(3) : '0.0')}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/50 border border-white/5">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Engine Protocol</p>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-violet-400" />
                      <span className="text-sm font-black text-white font-mono uppercase">C++17</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/50 border border-white/5">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-black text-white font-mono uppercase">Live</span>
                    </div>
                  </div>
                </Grid>

                <Flex gap="md" className="pt-2">
                  <Link to={`/experiments/${model.experimentId}`} className="flex-1">
                    <Button variant="outline" className="w-full border-neutral-800 bg-neutral-900 font-bold hover:border-violet-500/40 hover:text-violet-400 transition-all">
                      <FlaskConical className="h-4 w-4 mr-2" />
                      VIEW ORIGIN
                    </Button>
                  </Link>
                  <Button variant="ghost" className="bg-white/5 font-bold hover:bg-white/10 uppercase tracking-tighter text-xs">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="ghost" className="text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/5" onClick={() => handleDeleteModel(model._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Flex>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Grid>

      {models.length === 0 && !loading && (
        <div className="text-center py-20">
          <Brain className="h-16 w-16 text-neutral-800 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400">No models yet</h3>
          <p className="text-sm text-neutral-600 mt-1 mb-6">Train and save your first model to see it here</p>
          <Link to="/experiments/new">
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Start an Experiment
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
}
