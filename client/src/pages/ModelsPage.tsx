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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Flex } from "@/components/ui/layout";

const models = [
  { id: 1, name: "MNIST Classifier v3", accuracy: 98.7, size: "2.4 MB", framework: "Custom C++", created: "3 days ago", status: "deployed" },
  { id: 2, name: "Sentiment LSTM", accuracy: 87.2, size: "5.1 MB", framework: "Custom C++", created: "1 week ago", status: "ready" },
  { id: 3, name: "Price Predictor", accuracy: 94.1, size: "1.8 MB", framework: "Custom C++", created: "2 weeks ago", status: "deployed" },
  { id: 4, name: "Image GAN", accuracy: 76.4, size: "12.3 MB", framework: "Custom C++", created: "3 weeks ago", status: "archived" },
];

const statusBadges: Record<string, { variant: "success" | "default" | "muted"; label: string }> = {
  deployed: { variant: "success", label: "Deployed" },
  ready: { variant: "default", label: "Ready" },
  archived: { variant: "muted", label: "Archived" },
};

export default function ModelsPage() {
  return (
    <Container className="py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Brain className="h-7 w-7 text-violet-400" />
              Models
            </h1>
            <p className="mt-1 text-neutral-400">Trained models ready for inference</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/experiments/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Train New Model
              </Button>
            </Link>
          </div>
        </Flex>
      </motion.div>

      <Grid cols={2} gap="md">
        {models.map((model, i) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="group h-full">
              <CardHeader>
                <Flex justify="between" align="start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-violet-400" />
                      {model.name}
                    </CardTitle>
                    <p className="text-xs text-neutral-500 mt-1">
                      {model.framework} · {model.size}
                    </p>
                  </div>
                  <Badge variant={statusBadges[model.status].variant as any} size="sm">
                    {statusBadges[model.status].label}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <span className="text-neutral-300 font-mono">{model.accuracy}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-500">{model.created}</span>
                  </div>
                </div>
                <Flex gap="sm">
                  <Link to={`/experiments/${model.id}`}>
                    <Button variant="outline" size="sm">
                      <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                      Details
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Flex>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Grid>

      {/* Empty state */}
      {models.length === 0 && (
        <div className="text-center py-20">
          <Brain className="h-16 w-16 text-neutral-800 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400">No models yet</h3>
          <p className="text-sm text-neutral-600 mt-1 mb-6">Train your first model to see it here</p>
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