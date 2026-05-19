type Listener = (payload: unknown) => void;

class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, fn: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, payload?: unknown): void {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error(`[EventBus] ${event} handler error:`, e); }
    });
  }

  off(event: string, fn: Listener): void {
    this.listeners.get(event)?.delete(fn);
  }

  clear(): void { this.listeners.clear(); }
}

export const eventBus = new EventBus();