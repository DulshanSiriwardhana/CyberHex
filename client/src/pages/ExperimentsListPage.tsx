import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Play,
  Square,
  Trash2,
  Clock,
  BarChart3,
  Zap,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container, Grid, Flex, Stack } from '@/components/ui/layout';
import { SkeletonPage } from '@/components/ui/skeleton';
import { experimentsApi, type Experiment } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';

const statusVariant: Record<string, 'success' | 'default' | 'destructive' | 'warning' | 'muted'> = {
  completed: 'success',
  training: 'default',
  failed: 'destructive',
  stopped: 'warning',
  draft: 'muted',
};

export default function ExperimentsListPage() {
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    experimentsApi.list()
      .then(data => {
        setExperiments(data.experiments);
      })
      .catch(() => {
        // Backend not available — load demo data
        setExperiments([
          { _id: '1', userId: '', name: 'MNIST Classifier v3', description: '', status: 'completed', config: {} as any, createdAt: '2h ago', updatedAt: '2h ago' },
          { _id: '2', userId: '', name: 'Sentiment LSTM', description: '', status: 'training', config: {} as any, createdAt: '5h ago', updatedAt: '5h ago' },
          { _id: '3', userId: '', name: 'Image GAN', description: '', status: 'failed', config: {} as any, createdAt: '1d ago', updatedAt: '1d ago' },
          { _id: '4', userId: '', name: 'Price Predictor', description: '', status: 'completed', config: {} as any, createdAt: '2d ago', updatedAt: '2d ago' },
          { _id: '5', userId: '', name: 'Draft Network', description: '', status: 'draft', config: {} as any, createdAt: '3d ago', updatedAt: '3d ago' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = experiments.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <Container className="py-8 pt-24">
        <SkeletonPage rows={5} />
      </Container>
    );
  }

  return (
    <Container className="py-8 pt-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-green-400" />
              Experiments
            </h1>
            <p className="mt-1 text-neutral-400">Manage and monitor your ML training experiments</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/experiments/new">
              <Button size="lg">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </Link>
          </div>
        </Flex>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Flex gap="md" wrap>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-cyber pl-10"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'training', 'completed', 'failed', 'draft'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-600 self-center ml-auto">
            {filtered.length} experiment{filtered.length !== 1 ? 's' : ''}
          </span>
        </Flex>
      </motion.div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FlaskConical className="h-16 w-16 text-neutral-800 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400">No experiments found</h3>
          <p className="text-sm text-neutral-600 mt-1 mb-6">
            {search ? 'Try a different search term' : 'Create your first experiment'}
          </p>
          <Link to="/experiments/new">
            <Button>
              <Zap className="h-4 w-4 mr-2" /> Start an Experiment
            </Button>
          </Link>
        </div>
      ) : (
        <Stack gap="sm">
          {filtered.map((exp, i) => (
            <motion.div
              key={exp._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/experiments/${exp._id}`}
                className="block group"
              >
                <Card className="hover:border-green-500/20 hover:shadow-[0_0_25px_rgba(34, 197, 94,0.05)] cursor-pointer transition-all duration-300">
                  <CardContent className="p-5">
                    <Flex justify="between" gap="md" wrap>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          exp.status === 'training' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                          exp.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          exp.status === 'failed' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                          'bg-neutral-800/50 border border-neutral-700/30 text-neutral-500'
                        }`}>
                          <FlaskConical className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                            {exp.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {exp.createdAt}
                            </span>
                            {exp.status === 'training' && (
                              <span className="flex items-center gap-1 text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={statusVariant[exp.status] as any} size="sm">
                          {exp.status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Flex>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </Stack>
      )}
    </Container>
  );
}