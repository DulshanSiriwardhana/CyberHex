import { useState, useEffect } from 'react';
import type { LayerInfo, NetworkArchitecture, LoadState } from '../types/model';

function countLayerParams(layer: LayerInfo): number {
  const wCols = layer.weights[0]?.length ?? 0;
  return layer.weights.length * wCols + layer.bias.length;
}

export function useModelData() {
  const [architecture, setArchitecture] = useState<NetworkArchitecture | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const FILES = [0, 1, 2, 3, 4, 5, 6];

    async function loadAll() {
      setLoadState('loading');
      setProgress(0);
      setErrorMessage('');

      try {
        const layers: LayerInfo[] = [];
        let totalParams = 0;

        for (let i = 0; i < FILES.length; i++) {
          if (cancelled) return;
          const idx = FILES[i];
          const resp = await fetch(`/layer_${idx}.json`);
          const contentType = resp.headers.get('content-type') ?? '';
          if (!resp.ok || !contentType.includes('application/json')) {
            if (i === 0) {
              throw new Error(`Failed to load layer_${idx}.json: HTTP ${resp.status}`);
            }
            // Some layer files might not exist — stop collecting
            break;
          }
          const json: LayerInfo = await resp.json();
          layers.push(json);
          totalParams += countLayerParams(json);
          setProgress(((i + 1) / FILES.length) * 100);
        }

        if (cancelled) return;

        if (layers.length === 0) {
          throw new Error('No layer data found');
        }

        setArchitecture({
          layers,
          totalParams,
          inputSize: layers[0].inputShape,
          outputSize: layers[layers.length - 1].outputShape,
        });
        setLoadState('loaded');
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load model data:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setLoadState('error');
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  return { architecture, loadState, errorMessage, progress };
}

export function useLossData() {
  const [data, setData] = useState<{ epoch: number; loss: number }[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      try {
        const resp = await fetch('/epoch_losses.csv');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        const lines = text.split('\n').filter(Boolean);
        if (lines.length <= 1) {
          if (!cancelled) setLoadState('loaded');
          return;
        }
        const rows = lines
          .slice(1)
          .map(line => {
            const [e, l] = line.split(',');
            return { epoch: Number(e), loss: Number(l) };
          })
          .filter(d => !isNaN(d.epoch) && !isNaN(d.loss));

        if (!cancelled) {
          setData(rows);
          setLoadState('loaded');
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
          setLoadState('error');
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loadState, errorMessage };
}