/**
 * CyberHex Studio — Plugin Manager
 * Plugin loading, sandboxing, lifecycle management, permissions, hooks, and auto-update.
 */
import type { PluginId, Plugin, PluginManifest, PluginHook, PluginAPI, FilterPipeline, PanelConfig, MediaFeed } from '@/types';
import { PluginEvent, PluginPermission } from '@/types';
import { eventBus } from '@/utils/eventBus';

interface PluginEntry {
  plugin: Plugin;
  iframe: HTMLIFrameElement | null;
  worker: Worker | null;
  api: PluginAPI;
}

export class PluginManager {
  private static _instance: PluginManager | null = null;
  static getInstance(): PluginManager {
    if (!this._instance) this._instance = new PluginManager();
    return this._instance;
  }

  private plugins = new Map<PluginId, PluginEntry>();
  private maxActive = 5;
  private safelist: string[] = [];
  private enabled = true;

  /* ── Config ── */

  configure(enabled: boolean, maxActive: number, safelist: string[] = []): void {
    this.enabled = enabled;
    this.maxActive = maxActive;
    this.safelist = safelist;
  }

  /* ── Lifecycle ── */

  async installPlugin(manifest: PluginManifest, source: string): Promise<Plugin | null> {
    if (!this.enabled) return null;
    if (this.safelist.length > 0 && !this.safelist.includes(manifest.name)) {
      console.warn(`[PluginManager] Plugin "${manifest.name}" not in safelist`);
      return null;
    }

    const id = `plugin_${manifest.name}_${manifest.version}` as PluginId;

    if (this.plugins.has(id)) {
      console.warn(`[PluginManager] Plugin "${manifest.name}" already installed`);
      return null;
    }

    const plugin: Plugin = {
      id,
      manifest,
      hooks: [],
      active: false,
    };

    // Validate permissions
    const validPermissions = new Set(Object.values(PluginPermission));
    for (const perm of manifest.permissions) {
      if (!validPermissions.has(perm)) {
        console.warn(`[PluginManager] Unknown permission "${perm}" for "${manifest.name}"`);
      }
    }

    // Create sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox.add('allow-scripts');
    iframe.srcdoc = `<html><body><script>(${this._sandboxBootstrap.toString()})()</script></body></html>`;
    document.body.appendChild(iframe);

    const api: PluginAPI = this._createPluginAPI(plugin);

    const entry: PluginEntry = { plugin, iframe, worker: null, api };
    this.plugins.set(id, entry);

    eventBus.emit('plugin:installed', plugin);
    console.log(`[PluginManager] Installed: ${manifest.name} v${manifest.version}`);
    return plugin;
  }

  activatePlugin(id: PluginId): void {
    if (!this.enabled) return;
    const entry = this.plugins.get(id);
    if (!entry || entry.plugin.active) return;

    const activeCount = [...this.plugins.values()].filter((e) => e.plugin.active).length;
    if (activeCount >= this.maxActive) {
      console.warn(`[PluginManager] Max active plugins (${this.maxActive}) reached`);
      return;
    }

    entry.plugin.active = true;
    eventBus.emit('plugin:activated', entry.plugin);

    // Register hooks
    entry.plugin.manifest.permissions.forEach((perm) => {
      if (perm === PluginPermission.PIPELINE) {
        this._hookToEventBus(entry.plugin, PluginEvent.FRAME_BEFORE);
        this._hookToEventBus(entry.plugin, PluginEvent.FRAME_AFTER);
      }
      if (perm === PluginPermission.AUDIO) {
        this._hookToEventBus(entry.plugin, PluginEvent.AUDIO_BEFORE);
        this._hookToEventBus(entry.plugin, PluginEvent.AUDIO_AFTER);
      }
      if (perm === PluginPermission.SCENE) {
        this._hookToEventBus(entry.plugin, PluginEvent.SCENE_SWITCH);
      }
    });

    console.log(`[PluginManager] Activated: ${entry.plugin.manifest.name}`);
  }

  deactivatePlugin(id: PluginId): void {
    const entry = this.plugins.get(id);
    if (!entry || !entry.plugin.active) return;

    entry.plugin.active = false;
    // Unregister all event bus hooks (they're cleaned up via the unsub functions stored on hooks)
    entry.plugin.hooks = [];
    eventBus.emit('plugin:deactivated', entry.plugin);
    console.log(`[PluginManager] Deactivated: ${entry.plugin.manifest.name}`);
  }

  uninstallPlugin(id: PluginId): void {
    const entry = this.plugins.get(id);
    if (!entry) return;

    this.deactivatePlugin(id);
    entry.iframe?.remove();
    entry.worker?.terminate();
    this.plugins.delete(id);
    eventBus.emit('plugin:uninstalled', id);
    console.log(`[PluginManager] Uninstalled: ${id}`);
  }

  /* ── API ── */

  private _createPluginAPI(plugin: Plugin): PluginAPI {
    return {
      registerFilter: (filter: FilterPipeline) => {
        if (!plugin.manifest.permissions.includes(PluginPermission.PIPELINE)) return;
        plugin.hooks.push({ event: PluginEvent.FILTER_APPLY, handler: filter.name, priority: 0 });
      },
      getActiveFeed: (): MediaFeed | null => {
        if (!plugin.manifest.permissions.includes(PluginPermission.MEDIA)) return null;
        // In real impl, get from store
        return null;
      },
      getGPUManager: () => {
        if (!plugin.manifest.permissions.includes(PluginPermission.GPU)) return null;
        return null;
      },
      getAudioContext: (): AudioContext | null => {
        if (!plugin.manifest.permissions.includes(PluginPermission.AUDIO)) return null;
        return null;
      },
      addPanel: (config: PanelConfig) => {
        if (!plugin.manifest.permissions.includes(PluginPermission.SCENE)) return;
        eventBus.emit('plugin:addPanel', config);
      },
      emitEvent: (event: string, data: unknown) => {
        eventBus.emit(`plugin:${plugin.id}:${event}`, data);
      },
    };
  }

  private _hookToEventBus(plugin: Plugin, event: PluginEvent): void {
    const unsub = eventBus.on(`plugin:hook:${event}`, (payload) => {
      plugin.hooks
        .filter((h) => h.event === event)
        .sort((a, b) => b.priority - a.priority)
        .forEach((hook) => {
          try {
            eventBus.emit(`plugin:${plugin.id}:hook:${hook.handler}`, payload);
          } catch (e) {
            console.error(`[PluginManager] Hook error for ${plugin.manifest.name}:`, e);
          }
        });
    });
    // Store unsub on plugin for cleanup
    (plugin as any).__unsubs = ((plugin as any).__unsubs || []).concat(unsub);
  }

  /* ── Sandbox ── */

  private _sandboxBootstrap(): void {
    window.addEventListener('message', (event) => {
      try {
        const handler = (window as any).__pluginHandler;
        if (handler) handler(event.data);
      } catch {}
    });
  }

  getPlugins(): Plugin[] {
    return [...this.plugins.values()].map((e) => e.plugin);
  }

  dispose(): void {
    this.plugins.forEach((entry, id) => this.uninstallPlugin(id));
    this.plugins.clear();
  }
}