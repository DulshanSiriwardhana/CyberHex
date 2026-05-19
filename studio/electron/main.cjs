/**
 * CyberHex Studio — Electron Main Process
 * Desktop integration: native window management, system tray, global shortcuts,
 * GPU preference, auto-updater, and system-level audio controls.
 */

const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, systemPreferences, ipcMain, screen, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');

/* ─── Globals ────────────────────────────── */

let mainWindow = null;
let tray = null;
let isQuitting = false;

const isDev = !app.isPackaged;
const preloadPath = path.join(__dirname, 'preload.cjs');

/* ─── Window Creation ────────────────────── */

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1600, width),
    height: Math.min(1000, height),
    minWidth: 1024,
    minHeight: 680,
    title: 'CyberHex Studio',
    icon: path.join(__dirname, '../public/studio-icon.png'),
    backgroundColor: '#0a0a1a',
    darkTheme: true,
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'darwin',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webgl: true,
      experimentalFeatures: true,
      backgroundThrottling: false,
    },
  });

  /* GPU preference detection */
  app.commandLine.appendSwitch('enable-webgl2-compute-context');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  /* Window state persistence */
  try {
    const statePath = path.join(app.getPath('userData'), 'window-state.json');
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      if (state.x !== undefined) mainWindow.setBounds(state);
    }
  } catch { /* ignore */ }

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    } else {
      /* Save window state */
      try {
        const bounds = mainWindow.getBounds();
        fs.writeFileSync(
          path.join(app.getPath('userData'), 'window-state.json'),
          JSON.stringify(bounds)
        );
      } catch { /* ignore */ }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /* Prevent title from showing "Electron" */
  mainWindow.on('page-title-updated', (e) => e.preventDefault());

  return mainWindow;
}

/* ─── System Tray ────────────────────────── */

function createTray() {
  const iconSize = process.platform === 'darwin' ? 16 : 24;
  const trayIcon = nativeImage.createEmpty();
  // In production, load actual icon file

  tray = new Tray(trayIcon);
  tray.setToolTip('CyberHex Studio');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Capture Screen',
      click: () => mainWindow?.webContents.send('tray:capture-screen'),
    },
    {
      label: 'Toggle Filters',
      click: () => mainWindow?.webContents.send('tray:toggle-filters'),
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => mainWindow?.webContents.send('tray:open-settings'),
    },
    { type: 'separator' },
    {
      label: 'Quit CyberHex Studio',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
    }
  });
}

/* ─── Global Shortcuts ───────────────────── */

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+K', () => {
    mainWindow?.webContents.send('shortcut:command-palette');
  });

  globalShortcut.register('CommandOrControl+Shift+F', () => {
    mainWindow?.webContents.send('shortcut:toggle-filters');
  });

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.webContents.send('shortcut:screen-share');
  });

  globalShortcut.register('CommandOrControl+Shift+W', () => {
    mainWindow?.webContents.send('shortcut:webcam');
  });

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('shortcut:media-play-pause');
  });
}

/* ─── IPC Handlers ───────────────────────── */

function registerIPC() {
  ipcMain.handle('get-gpu-info', async () => {
    try {
      const gpuInfo = await app.getGPUInfo('basic');
      return { success: true, data: gpuInfo };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: app.getVersion(),
      displays: screen.getAllDisplays(),
    };
  });

  ipcMain.handle('get-media-permission', async (_, mediaType) => {
    try {
      const granted = await systemPreferences.askForMediaAccess(mediaType);
      return { granted };
    } catch {
      return { granted: false };
    }
  });

  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.on('window:hide', () => mainWindow?.hide());
}

/* ─── App Lifecycle ──────────────────────── */

app.whenReady().then(async () => {
  /* Register protocol for secure loading */
  registerIPC();
  createMainWindow();
  createTray();
  registerShortcuts();

  /* macOS: re-open from dock */
  app.on('activate', () => {
    if (!mainWindow) {
      createMainWindow();
    } else {
      mainWindow.show();
    }
  });

  /* Power events */
  powerMonitor.on('suspend', () => {
    mainWindow?.webContents.send('system:suspend');
  });
  powerMonitor.on('resume', () => {
    mainWindow?.webContents.send('system:resume');
  });

  console.log('[CyberHex Studio] Desktop ready');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});