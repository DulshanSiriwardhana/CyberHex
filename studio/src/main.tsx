/**
 * CyberHex Studio — Application Entry Point
 * Bootstraps React 18 with strict mode, initializes GPU detection,
 * and mounts the root application shell.
 */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import '@/styles/globals.css';

/* ─── Performance Mark ─────────────────── */

if (performance?.mark) {
  performance.mark('studio:boot');
}

/* ─── GPU Early Detection ─────────────── */

async function detectGPU(): Promise<boolean> {
  try {
    if ('gpu' in navigator) {
      const adapter = await (navigator as any).gpu.requestAdapter();
      return adapter !== null;
    }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    canvas.remove();
    return gl !== null;
  } catch {
    return false;
  }
}

/* ─── Mount ─────────────────────────────── */

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in DOM');
}

const root = createRoot(rootElement);

async function boot(): Promise<void> {
  const gpuAvailable = await detectGPU();

  root.render(
    <StrictMode>
      <App initialGpuAvailable={gpuAvailable} />
    </StrictMode>
  );

  if (performance?.mark) {
    performance.mark('studio:ready');
    performance.measure('studio:bootTime', 'studio:boot', 'studio:ready');
  }
}

boot().catch((err) => {
  console.error('[CyberHex Studio] Boot failure:', err);
  rootElement.innerHTML = `
    <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0a1a;color:#fff;font-family:sans-serif;">
      <h1 style="color:#00f0ff;font-size:2rem;margin-bottom:1rem;">CyberHex Studio</h1>
      <p style="color:#ff0066;">Failed to initialize: ${err.message}</p>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.75rem 1.5rem;background:rgba(0,240,255,0.15);border:1px solid rgba(0,240,255,0.3);color:#00f0ff;border-radius:8px;cursor:pointer;">Retry</button>
    </div>
  `;
});