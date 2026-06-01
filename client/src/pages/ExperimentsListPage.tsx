import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  PlusCircle,
  Search,
  ArrowRight,
  Clock,
  Activity,
  GitCommit,
  Hash,
  Database,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { experimentsApi, type Experiment } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';

const statusVariant: Record<string, { color: string; label: string; icon: any }> = {
  completed: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'COMPLETED', icon: Activity },
  training: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'TRAINING', icon: Cpu },
  failed: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', label: 'FAILED', icon: Activity },
  stopped: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'STOPPED', icon: Activity },
  draft: { color: 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20', label: 'DRAFT', icon: GitCommit },
};

export function ExperimentsListContent() {
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    experimentsApi.list()
      .then(data => setExperiments(data.experiments))
      .catch(() => setExperiments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = experiments.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-emerald-500 border-r-2 border-transparent animate-spin rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          <span className="text-[10px] font-mono text-emerald-500 tracking-[0.2em] uppercase">Loading Telemetry</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030305] relative overflow-hidden">
      {/* Top Banner Control */}
      <div className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#060608]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Active Experiments</h2>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono text-neutral-500">
            {filtered.length} RUN{filtered.length !== 1 ? 'S' : ''} DETECTED
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 group pl-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder="Query by hash or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
            />
          </div>
          <Link to="/experiments/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-emerald-400/20 text-xs font-mono uppercase tracking-widest px-4 py-1.5 h-auto transition-all">
              <PlusCircle className="h-3.5 w-3.5 mr-2" />
              Initialize Run
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="h-10 shrink-0 border-b border-white/5 flex items-center px-6 gap-2 bg-[#040406]">
        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest mr-2">State Filter:</span>
        {['all', 'training', 'completed', 'failed', 'stopped'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest transition-all ${statusFilter === s
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_rgba(16,185,129,0.1)]'
                : 'text-neutral-500 hover:text-neutral-300 border border-transparent hover:bg-white/5'
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto flex flex-col p-6">
        {filtered.length === 0 ? (
          <div className="m-auto flex flex-col items-center flex-1 justify-center max-w-sm text-center">
            <div className="w-16 h-16 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center mb-4 relative shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl animate-pulse" />
              <Database className="h-8 w-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2 tracking-tight">Empty Telemetry Stream</h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed mb-6">
              {search ? "No runs matching your query in the current state filter." : "The tracking module requires an initialized training run to begin recording metrics."}
            </p>
            {!search && (
              <Link to="/experiments/new">
                <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono uppercase tracking-widest px-6">
                  Deploy Model
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0f] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  <th className="py-3 px-4 font-semibold w-1/3">Run Architecture</th>
                  <th className="py-3 px-4 font-semibold w-1/4">Status</th>
                  <th className="py-3 px-4 font-semibold w-1/6">Launch Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-mono text-neutral-300">
                <AnimatePresence>
                  {filtered.map((exp, i) => {
                    const statusInfo = statusVariant[exp.status] || statusVariant.draft;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.tr
                        key={exp._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        <td className="py-4 px-4 align-middle">
                          <Link to={`/experiments/${exp._id}`} className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-neutral-600" />
                              <span className="font-semibold text-emerald-100/90 group-hover:text-emerald-400 transition-colors">
                                {exp.name}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-600">
                              <span className="text-neutral-500">{exp._id.slice(-8).toUpperCase()}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${statusInfo.color} font-bold text-[9px] tracking-widest`}>
                            {exp.status === 'training' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                            {statusInfo.label}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                            <Clock className="h-3 w-3" />
                            {exp.createdAt}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-middle text-right">
                          <Link to={`/experiments/${exp._id}`}>
                            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-neutral-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                              Analyze <ArrowRight className="h-3 w-3" />
                            </div>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExperimentsListPageWrapper() {
  return (
    <div className="h-full max-h-screen pt-[3.5rem] bg-[#050508] max-w-[1440px] mx-auto">
      <ExperimentsListContent />
    </div>
  );
}
