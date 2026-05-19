/**
 * CyberHex Studio — Electron Preload Script
 * Bridges main process and renderer with context isolation.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cyberhexDesktop', {
  /* System */
  getGPUInfo: () => ipcRenderer.invoke('get-gpu-info'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getMediaPermission: (mediaType) => ipcRenderer.invoke('get-media-permission', mediaType),

  /* Window controls */
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  hideWindow: () => ipcRenderer.send('window:hide'),

  /* Event listeners */
  on: (channel, callback) => {
    const validChannels = [
      'tray:capture-screen',
      'tray:toggle-filters',
      'tray:open-settings',
      'shortcut:command-palette',
      'shortcut:toggle-filters',
      'shortcut:screen-share',
      'shortcut:webcam',
      'shortcut:media-play-pause',
      'system:suspend',
      'system:resume',
    ];
    if (validChannels.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  },
});