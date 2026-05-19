/**
 * CyberHex Studio — Main Application Shell
 */
import React, { useEffect } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { GPUManager } from '@/engine/gpu/GPUManager';
import { useStudioStore } from '@/stores/studioStore';
import { useEngineConnection } from '@/hooks/useEngineConnection';

interface AppProps {
  initialGpuAvailable: boolean;
}

export const App: React.FC<AppProps> = ({ initialGpuAvailable }) => {
  const setGpuStatus = useStudioStore((s) => s.setGpuStatus);

  useEngineConnection();

  useEffect(() => {
    setGpuStatus(initialGpuAvailable, false);

    GPUManager.getInstance()
      .initialize()
      .then(() => setGpuStatus(true, true))
      .catch(() => setGpuStatus(initialGpuAvailable, false));
  }, [initialGpuAvailable, setGpuStatus]);

  return <StudioShell />;
};
