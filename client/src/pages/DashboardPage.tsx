import { useEffect } from 'react';
import { useExperimentsStore } from '@/stores/experiments';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const statusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (status) {
    case 'running': return 'success';
    case 'completed': return 'neutral';
    case 'failed': return 'danger';
    case 'queued': return 'warning';
    default: return 'default';
  }
};

export default function DashboardPage() {
  const { experiments, loading, error, fetch } = useExperimentsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const running = experiments.filter(e => e.status === 'running').length;
  const completed = experiments.filter(e => e.status === 'completed').length;
  const failed = experiments.filter(e => e.status === 'failed').length;

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="font-spectral font-extrabold text-3xl text-text-primary mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Experiments', value: experiments.length },
            { label: 'Running', value: running },
            { label: 'Completed', value: completed },
            { label: 'Failed', value: failed },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
              <p className="text-text-tertiary text-sm mb-1">{stat.label}</p>
              <p className="font-spectral font-bold text-3xl text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-spectral font-semibold text-xl text-text-primary">Recent Experiments</h2>
          <Link
            to="/experiments"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading && <p className="text-text-tertiary">Loading experiments...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase">Model Type</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {experiments.slice(0, 10).map((exp) => (
                  <tr key={exp._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">{exp.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(exp.status)}>{exp.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {exp.config?.modelType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-tertiary">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {experiments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-tertiary">
                      No experiments yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}