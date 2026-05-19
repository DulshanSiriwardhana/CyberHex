/**
 * CyberHex Studio — Scene Manager
 * Manages scene CRUD, switching with transitions, layout,
 * feed assignment, duplication, import/export, and preview.
 */
import type { SceneId, Scene, SceneLayout, SceneTransition, LayoutTemplateType, FeedId } from '@/types';
import { eventBus } from '@/utils/eventBus';

export class SceneManager {
  private static _instance: SceneManager | null = null;
  static getInstance(): SceneManager {
    if (!this._instance) this._instance = new SceneManager();
    return this._instance;
  }

  private scenes: Map<SceneId, Scene> = new Map();
  private _activeSceneId: SceneId | null = null;
  private _transitioning = false;
  private order: SceneId[] = [];

  get activeSceneId(): SceneId | null { return this._activeSceneId; }
  get activeScene(): Scene | undefined { return this._activeSceneId ? this.scenes.get(this._activeSceneId) : undefined; }
  get isTransitioning(): boolean { return this._transitioning; }

  /* ── CRUD ── */

  createScene(name: string, template: LayoutTemplateType = 'zoom_speaker' as LayoutTemplateType, layout?: Partial<SceneLayout>): Scene {
    const id = `scene_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` as SceneId;

    const scene: Scene = {
      id,
      name,
      template,
      order: this.scenes.size,
      feeds: [],
      layout: {
        width: 1920,
        height: 1080,
        gridCols: template === 'zoom_grid' ? 3 : 1,
        gridRows: template === 'zoom_grid' ? 3 : 1,
        gap: 8,
        padding: 16,
        background: '#0a0a1a',
        overlays: [],
        ...layout,
      },
    };

    this.scenes.set(id, scene);
    this.order.push(id);

    if (!this._activeSceneId) this._activeSceneId = id;

    eventBus.emit('scene:created', scene);
    return scene;
  }

  getScene(id: SceneId): Scene | undefined { return this.scenes.get(id); }

  getAllScenes(): Scene[] { return this.order.map((id) => this.scenes.get(id)!).filter(Boolean); }

  updateScene(id: SceneId, updates: Partial<Scene>): void {
    const scene = this.scenes.get(id);
    if (!scene) return;
    Object.assign(scene, updates);
    eventBus.emit('scene:updated', scene);
  }

  deleteScene(id: SceneId): void {
    if (this.scenes.size <= 1) return; // Keep at least one scene
    this.scenes.delete(id);
    this.order = this.order.filter((oid) => oid !== id);
    if (this._activeSceneId === id) {
      this._activeSceneId = this.order[0] ?? null;
    }
    eventBus.emit('scene:deleted', id);
  }

  duplicateScene(id: SceneId): Scene | undefined {
    const source = this.scenes.get(id);
    if (!source) return;
    return this.createScene(`${source.name} (Copy)`, source.template, source.layout);
  }

  /* ── Feeds ── */

  addFeedToScene(sceneId: SceneId, feedId: FeedId): void {
    const scene = this.scenes.get(sceneId);
    if (!scene || scene.feeds.includes(feedId)) return;
    scene.feeds.push(feedId);
    eventBus.emit('scene:feed:added', { sceneId, feedId });
  }

  removeFeedFromScene(sceneId: SceneId, feedId: FeedId): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;
    scene.feeds = scene.feeds.filter((f) => f !== feedId);
    eventBus.emit('scene:feed:removed', { sceneId, feedId });
  }

  /* ── Switching ── */

  async switchScene(id: SceneId, transition?: SceneTransition): Promise<void> {
    if (!this.scenes.has(id) || this._activeSceneId === id) return;
    if (this._transitioning) return;

    this._transitioning = true;
    const fromId = this._activeSceneId;
    const toId = id;

    const trans: SceneTransition = transition ?? { type: 'cut', durationMs: 0, easing: 'ease' };

    eventBus.emit('scene:transition:start', { from: fromId, to: toId, transition: trans });

    if (trans.type === 'fade') {
      await this._delay(trans.durationMs / 2);
    }

    this._activeSceneId = id;

    eventBus.emit('scene:switched', { from: fromId, to: toId });

    if (trans.type === 'fade') {
      await this._delay(trans.durationMs / 2);
    }

    this._transitioning = false;
    eventBus.emit('scene:transition:end', { from: fromId, to: toId });
  }

  /* ── Layout ── */

  setSceneLayout(id: SceneId, layout: Partial<SceneLayout>): void {
    const scene = this.scenes.get(id);
    if (!scene) return;
    Object.assign(scene.layout, layout);
    eventBus.emit('scene:layout:changed', scene);
  }

  reorderScenes(newOrder: SceneId[]): void {
    const valid = newOrder.filter((id) => this.scenes.has(id));
    this.order = valid;
    valid.forEach((id, idx) => {
      const scene = this.scenes.get(id);
      if (scene) scene.order = idx;
    });
    eventBus.emit('scene:reordered', this.order);
  }

  /* ── Import/Export ── */

  exportScene(id: SceneId): string | null {
    const scene = this.scenes.get(id);
    if (!scene) return null;
    return JSON.stringify({ ...scene, id: undefined }, null, 2);
  }

  importScene(json: string): Scene | undefined {
    try {
      const data = JSON.parse(json);
      return this.createScene(data.name ?? 'Imported Scene', data.template, data.layout);
    } catch {
      return;
    }
  }

  /* ── Helpers ── */

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  dispose(): void {
    this.scenes.clear();
    this.order = [];
    this._activeSceneId = null;
  }
}