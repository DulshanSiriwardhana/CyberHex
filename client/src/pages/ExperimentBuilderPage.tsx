import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperimentsStore } from '../stores/experiments';
import type { ExperimentConfig } from '../lib/api';

const defaultConfig: ExperimentConfig = {
  task: 'regression',
  modelType: 'neural_network',
  layers: [64, 32, 1],
  activations: ['relu', 'relu', 'linear'],
  loss: 'mse',
  batchSize: 32,
  epochs: 100,
  learningRate: 0.001,
  optimizer: 'adam',
  validationSplit: 0.2,
  earlyStopping: true,
  patience: 10,
  dataPath: null,
  seed: 42,
};

export default function ExperimentBuilderPage() {
  const navigate = useNavigate();
  const { createExperiment, loading, error, clearError } = useExperimentsStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<ExperimentConfig>({ ...defaultConfig });
  const [localError, setLocalError] = useState<string | null>(null);

  const updateConfig = (key: keyof ExperimentConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleLayersChange = (value: string) => {
    const layers = value
      .split(',')
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v > 0);
    updateConfig('layers', layers.length > 0 ? layers : [1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError('Experiment name is required');
      return;
    }

    try {
      const experiment = await createExperiment({
        name: name.trim(),
        description: description.trim(),
        config,
      });
      navigate(`/experiments/${experiment._id}`);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create experiment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">New Experiment</h1>
        </div>

        {(error || localError) && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-red-200">{error || localError}</span>
            <button
              onClick={() => {
                clearError();
                setLocalError(null);
              }}
              className="text-red-300 hover:text-red-100 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">Basic Info</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Experiment"
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                maxLength={500}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">Model Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model Type</label>
                <select
                  value={config.modelType}
                  onChange={(e) => updateConfig('modelType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="neural_network">Neural Network</option>
                  <option value="linear_regression">Linear Regression</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Task</label>
                <select
                  value={config.task}
                  onChange={(e) => updateConfig('task', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="regression">Regression</option>
                  <option value="classification">Classification</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Layers (comma-separated, e.g. 64,32,1)
              </label>
              <input
                type="text"
                value={config.layers.join(',')}
                onChange={(e) => handleLayersChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Epochs</label>
                <input
                  type="number"
                  value={config.epochs}
                  onChange={(e) => updateConfig('epochs', parseInt(e.target.value) || 1)}
                  min={1}
                  max={10000}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={config.batchSize}
                  onChange={(e) => updateConfig('batchSize', parseInt(e.target.value) || 1)}
                  min={1}
                  max={1024}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Learning Rate</label>
                <input
                  type="number"
                  value={config.learningRate}
                  onChange={(e) => updateConfig('learningRate', parseFloat(e.target.value) || 0)}
                  step={0.0001}
                  min={0.00001}
                  max={1}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Optimizer</label>
                <select
                  value={config.optimizer}
                  onChange={(e) => updateConfig('optimizer', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Loss</label>
                <select
                  value={config.loss}
                  onChange={(e) => updateConfig('loss', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mse">MSE</option>
                  <option value="mae">MAE</option>
                  <option value="binary_crossentropy">Binary Crossentropy</option>
                  <option value="categorical_crossentropy">Categorical Crossentropy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Validation Split</label>
                <input
                  type="number"
                  value={config.validationSplit}
                  onChange={(e) => updateConfig('validationSplit', parseFloat(e.target.value) || 0)}
                  step={0.05}
                  min={0}
                  max={0.5}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.earlyStopping}
                  onChange={(e) => updateConfig('earlyStopping', e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
                />
                <label className="text-sm text-gray-400">Early Stopping</label>
              </div>
              {config.earlyStopping && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Patience</label>
                  <input
                    type="number"
                    value={config.patience}
                    onChange={(e) => updateConfig('patience', parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Experiment'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}