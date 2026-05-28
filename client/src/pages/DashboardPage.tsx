import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  FlaskConical,
  PlusCircle,
  TrendingUp,
  Clock,
  Cpu,
  Zap,
  ArrowRight,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonPage } from "@/components/ui/skeleton";
import { Container, Grid, Stack, Flex, SectionHeading } from "@/components/ui/layout";
import { useAuth } from "@/contexts/auth";



import { useExperimentsStore } from "@/stores/experiments";
import { useEffect } from "react";

const statusColors: Record<string, string> = {
  completed: "success",
  training: "default",
  failed: "destructive",
  stopped: "warning",
  draft: "secondary",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { experiments, fetchExperiments } = useExperimentsStore();

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  if (!user) {
    return <SkeletonPage rows={4} />;
  }

  const recentExperiments = experiments.slice(0, 5);

  const stats = [
    { icon: Brain, label: "Total Models", value: experiments.filter(e => e.status === 'completed').length.toString(), change: "Released" },
    { icon: FlaskConical, label: "Experiments", value: experiments.length.toString(), change: "Total Runs" },
    { icon: TrendingUp, label: "Avg Loss", value: experiments.filter(e => e.results?.finalTrainLoss !== undefined).length > 0 ? (experiments.filter(e => e.results?.finalTrainLoss !== undefined).reduce((acc, e) => acc + (e.results?.finalTrainLoss || 0), 0) / experiments.filter(e => e.results?.finalTrainLoss !== undefined).length).toFixed(3) : "N/A", change: "Training Metric" },
    { icon: Clock, label: "Active Jobs", value: experiments.filter(e => e.status === 'training').length.toString(), change: "Running Now" },
  ];

  return (
    <Container className="py-8 pt-24 relative">
      <div className="absolute inset-0 cyber-grid-overlay opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-10 relative z-10"
      >
        <Flex justify="between" align="end" wrap className="gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">System Online</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              <span className="text-gradient-max uppercase">Command Center / </span>
              <span className="text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                {user.username}
              </span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-lg">
              Synchronizing neural nodes and monitoring real-time training telemetry. All systems within nominal parameters.
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/experiments/new">
              <Button size="lg" className="bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] font-bold">
                <PlusCircle className="h-4 w-4 mr-2" />
                INITIATE EXPERIMENT
              </Button>
            </Link>
            <Link to="/models">
              <Button size="lg" variant="outline" className="border-neutral-800 bg-neutral-900/50 backdrop-blur-md hover:border-neutral-700 font-bold">
                <Brain className="h-4 w-4 mr-2 text-violet-400" />
                SINGULARITY CORE
              </Button>
            </Link>
          </div>
        </Flex>
      </motion.div>

      <Grid cols={4} gap="lg" className="mb-10 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="cyber-card-max p-6 group cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 group-hover:border-green-500/50 transition-colors">
                  <stat.icon className="h-5 w-5 text-green-400" />
                </div>
                <div className="h-1 w-12 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500/40 animate-scan-line" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500/80" />
                  <span className="text-[9px] font-bold text-green-500/70 uppercase">{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </Grid>

      <Grid cols={3} gap="lg" className="mb-10 relative z-10">
        <div className="col-span-2">
          <Card className="cyber-card-max border-none overflow-hidden h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <Flex justify="between" align="center">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  LIVE FEED / RECENT ACTIVITY
                </CardTitle>
                <Link to="/experiments">
                  <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-white hover:bg-white/5">
                    ARCHIVE
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </Flex>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentExperiments.map((exp, idx) => (
                  <motion.div
                    key={exp._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.05) }}
                  >
                    <Link
                      to={`/experiments/${exp._id}`}
                      className="group flex items-center justify-between rounded-2xl px-5 py-4 bg-neutral-900/30 border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${exp.status === "training" ? "bg-green-500/20 text-green-400" :
                          exp.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-neutral-800 text-neutral-500"
                          }`}>
                          <FlaskConical className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors uppercase tracking-tight">{exp.name}</p>
                          <p className="text-[10px] font-mono text-neutral-500 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(exp.createdAt).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        {exp.results?.finalTrainLoss !== undefined && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-neutral-600 uppercase mb-0.5">Final Loss</p>
                            <span className="text-xs font-mono font-bold text-neutral-300">
                              {exp.results.finalTrainLoss.toFixed(4)}
                            </span>
                          </div>
                        )}
                        <Badge
                          variant={statusColors[exp.status] as any}
                          className={`
                            px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-tighter
                            ${exp.status === 'training' ? 'animate-pulse' : ''}
                          `}
                        >
                          {exp.status}
                        </Badge>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {recentExperiments.length === 0 && (
                  <div className="py-20 text-center opacity-40">
                    <div className="h-16 w-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                      <FlaskConical className="h-8 w-8 text-neutral-700" />
                    </div>
                    <p className="text-sm font-medium italic text-neutral-500">NO ACTIVE SIGNAL FOUND</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="cyber-card-max border-none h-full flex flex-col overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-gradient-shift" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="h-3 w-3 text-green-500" />
                Live Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-neutral-400">Memory Cluster A-1</span>
                    <span className="text-green-500">32% / 128GB</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: '32%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-neutral-400">Compute Load</span>
                    <span className="text-violet-500">14.2 GFLOPS</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className="h-full bg-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: '58%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-neutral-950/60 border border-white/5 font-mono text-[10px] text-neutral-500 space-y-1">
                <p className="text-green-500/60"># SYSTEM_BOOT_SEQUENCE_OK</p>
                <p className="text-neutral-600"># CORE_SYNC_MASTER: 0x4FEE2</p>
                <p className="text-neutral-600"># WASM_ENV: INITIALIZED</p>
                <p className="animate-pulse"># LISTENING_FOR_SIGNAL...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Grid>

      <Grid cols={3} gap="lg" className="relative z-10">
        <Link to="/experiments/new">
          <Card className="cyber-card-max border-none group cursor-pointer h-full">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all duration-300">
                <Zap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Quick Experiment</h3>
              <p className="text-sm text-neutral-500 font-medium">Launch a pre-configured training run in 2 clicks</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/designer">
          <Card className="cyber-card-max border-none group cursor-pointer h-full">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300">
                <Layers className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Visual Designer</h3>
              <p className="text-sm text-neutral-500 font-medium">Assemble layers visually, configure nodes, export code</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/models">
          <Card className="cyber-card-max border-none group cursor-pointer h-full">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300">
                <Cpu className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">C++ Inference</h3>
              <p className="text-sm text-neutral-500 font-medium">Deploy a trained model to the native inference engine</p>
            </CardContent>
          </Card>
        </Link>
      </Grid>
    </Container>
  );
}

