/**
 * CyberHex Studio — AI Model Management Panel
 */
import React from 'react';
import { Brain, Download, Trash2, Zap } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { ModelRegistry } from '@/ai/models/ModelRegistry';
import { Button } from '@/components/ui/button';
import { ModelStatus } from '@/types';

const registry = ModelRegistry.getInstance();

export const ModelPanel: React.FC = () => {
  const models = useStudioStore((s) => s.models);
  const loadedModels = useStudioStore((s) => s.loadedModels);
  const loadModel = useStudioStore((s) => s.loadModel);
  const unloadModel = useStudioStore((s) => s.unloadModel);
  const gpuReady = useStudioStore((s) => s.gpuReady);

  const catalog = registry.getCatalog();

  const handleLoad = async (modelId: string) => {
    const model = catalog.find((m) => m.id === modelId);
    if (!model) return;
    loadModel({ ...model, status: ModelStatus.LOADING });
    try {
      await registry.loadModel(modelId);
      loadModel({ ...model, status: ModelStatus.READY, loadedAt: Date.now() });
    } catch {
      loadModel({ ...model, status: ModelStatus.ERROR, error: 'Load failed' });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full text-xs">
      <div className="flex items-center gap-2 text-white/50 font-mono uppercase">
        <Brain size={14} className="text-neon-purple" />
        Model Registry
        <span className={`ml-auto text-[10px] ${gpuReady ? 'text-neon-green' : 'text-white/30'}`}>
          {gpuReady ? 'WebGPU' : 'CPU/WASM'}
        </span>
      </div>

      <p className="text-[10px] text-white/30">{loadedModels.length} loaded • ONNX / TF.js / TensorRT-ready</p>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {catalog.map((model) => {
          const state = models[model.id];
          const isLoaded = loadedModels.includes(model.id);
          return (
            <div key={model.id} className="glass-panel p-2 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-white/80">{model.name}</p>
                  <p className="text-[10px] text-white/30">{model.architecture} • {model.format}</p>
                  <p className="text-[10px] text-white/20">{(model.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  isLoaded ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-white/40'
                }`}>
                  {state?.status ?? 'idle'}
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                {!isLoaded ? (
                  <Button size="xs" variant="outline" leftIcon={<Download size={10} />} onClick={() => handleLoad(model.id)}>
                    Load
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<Trash2 size={10} />}
                    onClick={() => {
                      registry.unloadModel(model.id);
                      unloadModel(model.id);
                    }}
                  >
                    Unload
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-2 text-[10px] text-white/30 flex items-center gap-1">
        <Zap size={10} className="text-neon-yellow" />
        Hot-swap supported during live streaming
      </div>
    </div>
  );
};
