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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonPage } from "@/components/ui/skeleton";
import { Container, Grid, Stack, Flex, SectionHeading } from "@/components/ui/layout";
import { useAuth } from "@/contexts/auth";

const recentExperiments = [
  { id: 1, name: "MNIST Classifier v3", status: "completed", accuracy: 98.7, date: "2h ago" },
  { id: 2, name: "Sentiment LSTM", status: "running", accuracy: 87.2, date: "5h ago" },
  { id: 3, name: "Image GAN", status: "failed", accuracy: 0, date: "1d ago" },
  { id: 4, name: "Price Predictor", status: "completed", accuracy: 94.1, date: "2d ago" },
];

const statusColors: Record<string, string> = {
  completed: "success",
  running: "default",
  failed: "destructive",
  queued: "warning",
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <SkeletonPage rows={4} />;
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {user.username}
              </span>
            </h1>
            <p className="mt-1 text-neutral-400">Your ML command center</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/experiments/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </Link>
            <Link to="/models">
              <Button variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                View Models
              </Button>
            </Link>
          </div>
        </Flex>
      </motion.div>

      {/* Stats */}
      <Grid cols={4} gap="md" className="mb-8">
        {[
          { icon: Brain, label: "Total Models", value: "12", change: "+3 this week" },
          { icon: FlaskConical, label: "Experiments", value: "47", change: "+8 today" },
          { icon: TrendingUp, label: "Avg Accuracy", value: "94.2%", change: "+2.1%" },
          { icon: Clock, label: "Training Hours", value: "128h", change: "12h active" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <StatCard>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <stat.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {stat.value}
              </div>
              <span className="text-xs text-cyan-400">{stat.change}</span>
            </StatCard>
          </motion.div>
        ))}
      </Grid>

      {/* Recent experiments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <Flex justify="between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Recent Experiments
              </CardTitle>
              <Link to="/experiments">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </Flex>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentExperiments.map((exp, i) => (
                <Link
                  key={exp.id}
                  to={`/experiments/${exp.id}`}
                  className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      exp.status === "running" ? "bg-cyan-500/10 text-cyan-400" :
                      exp.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-neutral-800 text-neutral-500"
                    }`}>
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{exp.name}</p>
                      <p className="text-xs text-neutral-500">{exp.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {exp.status !== "failed" && (
                      <span className="text-sm font-mono text-neutral-300">
                        {exp.accuracy.toFixed(1)}%
                      </span>
                    )}
                    <Badge variant={statusColors[exp.status] as any} size="sm">
                      {exp.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <Grid cols={2} gap="md" className="mt-8">
        <Link to="/experiments/new">
          <Card className="group border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] cursor-pointer transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Quick Experiment</h3>
                <p className="text-sm text-neutral-400">Launch a pre-configured training run in 2 clicks</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/models">
          <Card className="group border-violet-500/10 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(139,92,246,0.1)] cursor-pointer transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 border border-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Cpu className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">C++ Inference</h3>
                <p className="text-sm text-neutral-400">Deploy a trained model to the native inference engine</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </Grid>
    </Container>
  );
}