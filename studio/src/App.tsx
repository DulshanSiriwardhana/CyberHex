/**
 * CyberHex Studio — Main Application Shell
 */
import React, { useEffect } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { GPUManager } from '@/engine/gpu/GPUManager';
import { WebSocketService } from '@/services/WebSocketService';
import { useStudioStore } from '@/stores/studioStore';

interface AppProps {
  initialGpuAvailable: boolean;
}

export const App: React.FC<AppProps> = ({ initialGpuAvailable }) => {
  const setGpuStatus = useStudioStore((s) => s.setGpuStatus);
  const setWsConnected = useStudioStore((s) => s.setWsConnected);
  const addToast = useStudioStore((s) => s.addToast);

  useEffect(() => {
    setGpuStatus(initialGpuAvailable, false);

    GPUManager.getInstance()
      .initialize()
      .then(() => setGpuStatus(true, true))
      .catch(() => setGpuStatus(false, false));
  }, [initialGpuAvailable, setGpuStatus]);

  useEffect(() => {
    try {
      WebSocketService.getInstance().connect({
        url: import.meta.env.VITE_WS_URL ?? 'http://localhost:4000',
        path: '/ws',
        autoReconnect: true,
      });

      const unsub = WebSocketService.getInstance().on('connected', () => {
        setWsConnected(true, 0);
        addToast({
          type: 'success',
          title: 'Engine Connected',
          message: 'CyberHex C++ ML engine linked via WebSocket',
          dismissible: true,
          duration: 3000,
        });
      });

      const unsub2 = WebSocketService.getInstance().on('disconnected', () => {
        setWsConnected(false, 0);
      });

      return () => {
        unsub();
        unsub2();
      };
    } catch {
      /* offline mode */
    }
  }, [setWsConnected, addToast]);

  return <StudioShell initialGpuAvailable={initialGpuAvailable} />;
};
