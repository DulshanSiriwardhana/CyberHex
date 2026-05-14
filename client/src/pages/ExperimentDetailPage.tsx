import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExperimentsStore } from '../stores/experiments';
import TrainingChart from '../components/TrainingChart';
import type { Experiment } from '../lib/api';

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentExperiment,
    trainingStatus,
    loading,
    error,
    fetchExperiment,
    fetchTrainingStatus,
    startTraining,
    stopTraining,
    clearError,
  } = useExperimentsStore();

  const [wsConnected, setWsConnected] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<{
    epochs: number[];
    trainLoss: number[];
    valLoss: number[];
  }>({ epochs: [], trainLoss: [], valLoss: [] });

  useEffect(() => {
    if (id) {
      fetchExperiment(id);
      fetchTrainingStatus(id);
    }
  }, [id, fetchExperiment, fetchTrainingStatus]);

  useEffect(() => {
    if (!id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    const ws = new WebSocket(`${protocol}://${host}:5000?experimentId=${id}`);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'training_metric' && data.experimentId === id) {
          setLiveMetrics((prev) => ({
            epochs: [...prev.epochs, data.epoch],
            trainLoss: [...prev.trainLoss, data.train_loss],
            valLoss: data.val_loss
              ? [...prev.valLoss, data.val_loss]
              : prev.valLoss,
          }));
        }
        if (data.type === 'training_complete' && data.experimentId === id) {
          fetchExperiment(id);
          fetchTrainingStatus(id);
          setLiveMetrics({ epochs: [], trainLoss: [], valLoss: [] });
        }
      } catch {}
    };

    return () => ws.close();
  }, [id, fetchExperiment, fetchTrainingStatus]);

  useEffect(() => {
    if (!id) return;
    const poll = setInterval(() => fetchTrainingStatus(id), 3000);
    return () => clearInterval(poll);
  }, [id, fetchTrainingStatus]);

  const handleStartTraining = useCallback(async () => {
    if (!id) return;
    try {
      await startTraining(id);
      fetchTrainingStatus(id);
    } catch (err: any) {
      alert(err.message);
    }
  }, [id, startTraining, fetchTrainingStatus]);

  const handleStopTraining = useCallback(async () => {
    if (!id) return;
    await stopTraining(id);
    fetchTrainingStatus(id);
    fetchExperiment(id);
    setLiveMetrics({ epochs: [], trainLoss: [], valLoss: [] });
  }, [id, stopTraining, fetchTrainingStatus, fetchExperiment]);

  const exp = currentExperiment as Experiment | null;

  if (loading && !exp) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading experiment...</p>
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Experiment not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isRunning =
    trainingStatus?.status === 'running' || exp.status === 'training';
  const hasResults =
    exp.results?.trainLoss?.length || liveMetrics.trainLoss.length > 0;

  const displayMetrics =
    liveMetrics.epochs.length > 0
      ? liveMetrics
      : {
          epochs: exp.results?.epochs || [],
          trainLoss: exp.results?.trainLoss || [],
          valLoss: exp.results?.valLoss || [],
        };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{exp.name}</h1>
            <p className="text-gray-400 mt-1">
              {exp.description || 'No description'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                wsConnected && isRunning
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-gray-600'
              }`}
            />
            <span className="text-xs text-gray-500">
              {wsConnected && isRunning ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-red-200">{error}</span>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Status
            </h3>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                isRunning
                  ? 'bg-blue-700 text-blue-200 animate-pulse'
                  : exp.status === 'completed'
                    ? 'bg-green-700 text-green-200'
                    : exp.status === 'failed'
                      ? 'bg-red-700 text-red-200'
                      : exp.status === 'stopped'
                        ? 'bg-yellow-700 text-yellow-200'
                        : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isRunning ? 'Training' : exp.status}
            </span>

            <div className="mt-6 space-y-2">
              {isRunning ? (
                <button
                  onClick={handleStopTraining}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition-colors"
                >
                  Stop Training
                </button>
              ) : (
                <button
                  onClick={handleStartTraining}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors"
                >
                  {loading ? 'Starting...' : 'Start Training'}
                </button>
              )}
              <button
                onClick={() => navigate('/experiments/new')}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors"
              >
                Clone Config
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Configuration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Model Type</span>
                <span className="text-gray-200">{exp.config?.modelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Task</span>
                <span className="text-gray-200">{exp.config?.task}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Layers</span>
                <span className="text-gray-200">
                  [{exp.config?.layers?.join(', ')}]
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Epochs</span>
                <span className="text-gray-200">{exp.config?.epochs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Batch Size</span>
                <span className="text-gray-200">{exp.config?.batchSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Learning Rate</span>
                <span className="text-gray-200">
                  {exp.config?.learningRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Optimizer</span>
                <span className="text-gray-200">{exp.config?.optimizer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loss</span>
                <span className="text-gray-200">{exp.config?.loss}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Results
            </h3>
            {exp.results?.finalTrainLoss !== undefined ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Final Train Loss</span>
                  <span className="text-green-300">
                    {exp.results.finalTrainLoss.toFixed(4)}
                  </span>
                </div>
                {exp.results.finalValLoss !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Final Val Loss</span>
                    <span className="text-blue-300">
                      {exp.results.finalValLoss.toFixed(4)}
                    </span>
                  </div>
                )}
                {exp.results.bestValLoss !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Best Val Loss</span>
                    <span className="text-yellow-300">
                      {exp.results.bestValLoss.toFixed(4)}
                    </span>
                  </div>
                )}
                {exp.results.epochs && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Epochs Run</span>
                    <span className="text-gray-200">
                      {exp.results.epochs.length}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No results yet</p>
            )}
          </div>
        </div>

        {hasResults && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Training Progress
            </h3>
            <TrainingChart
              epochs={displayMetrics.epochs}
              trainLoss={displayMetrics.trainLoss}
              valLoss={
                displayMetrics.valLoss.length > 0
                  ? displayMetrics.valLoss
                  : undefined
              }
              height={350}
            />
          </div>
        )}

        <div className="mt-8 text-xs text-gray-600 space-y-1">
          <p>ID: {exp._id}</p>
          <p>Created: {new Date(exp.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(exp.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}