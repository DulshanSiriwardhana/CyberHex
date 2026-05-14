import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { useExperimentsStore } from '../stores/experiments';
import type { Experiment } from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    experiments,
    activeJobs,
    pagination,
    loading,
    error,
    fetchExperiments,
    deleteExperiment,
    startTraining,
    stopTraining,
    fetchActiveJobs,
    clearError,
  } = useExperimentsStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchExperiments(params);
    fetchActiveJobs();
  }, [statusFilter, fetchExperiments, fetchActiveJobs]);

  useEffect(() => {
    const poll = setInterval(() => fetchActiveJobs(), 5000);
    return () => clearInterval(poll);
  }, [fetchActiveJobs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experiment?')) return;
    await deleteExperiment(id);
  };

  const handleStartTraining = async (id: string) => {
    try {
      await startTraining(id);
      fetchActiveJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStopTraining = async (id: string) => {
    await stopTraining(id);
    fetchActiveJobs();
  };

  const isTraining = (experimentId: string) =>
    activeJobs.some((j) => j.experimentId === experimentId && j.status === 'running');

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-700 text-gray-300',
      training: 'bg-blue-700 text-blue-200 animate-pulse',
      completed: 'bg-green-700 text-green-200',
      failed: 'bg-red-700 text-red-200',
      stopped: 'bg-yellow-700 text-yellow-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.username}</p>
          </div>
          <button
            onClick={() => navigate('/experiments/new')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            + New Experiment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {(['draft', 'training', 'completed', 'failed'] as const).map((s) => {
            const count = experiments.filter((e) => e.status === s).length;
            return (
              <div
                key={s}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4"
              >
                <p className="text-sm text-gray-400 capitalize">{s}</p>
                <p className="text-2xl font-bold text-white mt-1">{count}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'draft', 'training', 'completed', 'failed', 'stopped'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading && experiments.length === 0 && (
          <div className="text-center py-12 text-gray-400">Loading experiments...</div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4 flex justify-between items-center">
            <span className="text-red-200">{error}</span>
            <button onClick={clearError} className="text-red-300 hover:text-red-100 text-sm">
              Dismiss
            </button>
          </div>
        )}

        {!loading && experiments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🧪</div>
            <p className="text-gray-400 text-lg mb-4">No experiments yet</p>
            <button
              onClick={() => navigate('/experiments/new')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              Create your first experiment
            </button>
          </div>
        )}

        <div className="space-y-3">
          {experiments.map((exp: Experiment) => (
            <div
              key={exp._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => navigate(`/experiments/${exp._id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{exp.name}</h3>
                    {statusBadge(exp.status)}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {exp.description || 'No description'} &middot;{' '}
                    {exp.config?.modelType || 'neural_network'} &middot;{' '}
                    {exp.config?.epochs || 0} epochs &middot;{' '}
                    {exp.config?.layers ? `${exp.config.layers.length} layers` : 'N/A'}
                  </p>
                  {exp.results?.finalTrainLoss !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Final loss: {exp.results.finalTrainLoss.toFixed(4)}
                      {exp.results.finalValLoss !== undefined
                        ? ` | Val loss: ${exp.results.finalValLoss.toFixed(4)}`
                        : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {exp.status === 'training' || isTraining(exp._id) ? (
                    <button
                      onClick={() => handleStopTraining(exp._id)}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTraining(exp._id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors"
                    >
                      Train
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchExperiments({ page: String(page) })}
                className={`px-3 py-1 rounded text-sm ${
                  page === pagination.page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}