/**
 * CyberHex Studio — Engine WebSocket connection hook
 */
import { useEffect } from 'react';
import { WebSocketService } from '@/services/WebSocketService';
import { useStudioStore } from '@/stores/studioStore';

export function useEngineConnection() {
  const setWsConnected = useStudioStore((s) => s.setWsConnected);
  const updatePerformance = useStudioStore((s) => s.updatePerformance);
  const addToast = useStudioStore((s) => s.addToast);

  useEffect(() => {
    const ws = WebSocketService.getInstance();

    ws.connect({
      url: import.meta.env.VITE_WS_URL ?? 'http://localhost:5000',
      path: '/ws',
      autoReconnect: true,
    });

    const unsubConnected = ws.on('connected', () => {
      setWsConnected(true, ws.latency);
      addToast({
        type: 'success',
        title: 'Engine Connected',
        message: 'CyberHex ML engine linked',
        dismissible: true,
        duration: 3000,
      });
    });

    const unsubDisconnected = ws.on('disconnected', () => {
      setWsConnected(false, 0);
    });

    const unsubPerf = ws.on('perf:update', (payload) => {
      const data = payload as { fps?: number; gpu?: number; memoryMB?: number };
      if (data.fps != null) {
        updatePerformance({
          fps: data.fps,
          gpu: {
            ...useStudioStore.getState().performance.gpu,
            utilization: data.gpu ?? useStudioStore.getState().performance.gpu.utilization,
            memoryUsedMB: data.memoryMB ?? useStudioStore.getState().performance.gpu.memoryUsedMB,
          },
        });
      }
    });

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubPerf();
    };
  }, [setWsConnected, updatePerformance, addToast]);
}
