/**
 * CyberHex Studio — Task Scheduler
 * Priority-based async task scheduling with frame-budget awareness,
 * idle callback integration, cancellation, and timeout handling.
 */

export enum TaskPriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  IDLE = 4,
}

export interface ScheduledTask<T = unknown> {
  id: string;
  priority: TaskPriority;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout: number;
  createdAt: number;
  cancelled: boolean;
}

export class TaskScheduler {
  private static _instance: TaskScheduler | null = null;
  static getInstance(): TaskScheduler {
    if (!this._instance) this._instance = new TaskScheduler();
    return this._instance;
  }

  private queue: ScheduledTask[] = [];
  private running = false;
  private frameBudgetMs = 8; // 8ms per frame for tasks
  private idleCallbackId: number | null = null;
  private counter = 0;
  private activeTasks = 0;
  private maxConcurrent = 4;

  /* ── Schedule ── */

  schedule<T>(execute: () => Promise<T>, priority: TaskPriority = TaskPriority.NORMAL, timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: ScheduledTask<T> = {
        id: `task_${++this.counter}_${Date.now()}`,
        priority,
        execute,
        resolve,
        reject,
        timeout,
        createdAt: performance.now(),
        cancelled: false,
      };

      this.queue.push(task);
      this.queue.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);

      if (!this.running) this._runLoop();
    });
  }

  cancel(taskId: string): void {
    const task = this.queue.find((t) => t.id === taskId);
    if (task) task.cancelled = true;
  }

  /* ── Run Loop ── */

  private _runLoop(): void {
    if (this.running) return;
    this.running = true;

    const processSlice = async () => {
      if (!this.running) return;

      const sliceStart = performance.now();
      const tasksToProcess = this.queue.splice(0, Math.min(4, this.queue.length));

      const promises = tasksToProcess
        .filter((t) => !t.cancelled)
        .map((task) => this._executeWithTimeout(task));

      await Promise.allSettled(promises);

      if (this.queue.length === 0) {
        this.running = false;
        return;
      }

      const elapsed = performance.now() - sliceStart;
      if (elapsed < this.frameBudgetMs) {
        processSlice();
      } else {
        this.idleCallbackId = (typeof requestIdleCallback !== 'undefined'
          ? requestIdleCallback(() => processSlice(), { timeout: 50 })
          : setTimeout(() => processSlice(), 1)) as unknown as number;
      }
    };

    processSlice();
  }

  private async _executeWithTimeout(task: ScheduledTask): Promise<void> {
    this.activeTasks++;

    try {
      const result = await Promise.race([
        task.execute(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Task ${task.id} timed out after ${task.timeout}ms`)), task.timeout)
        ),
      ]);
      task.resolve(result as any);
    } catch (err) {
      task.reject(err instanceof Error ? err : new Error(String(err)));
    } finally {
      this.activeTasks--;
    }
  }

  /* ── Stats ── */

  get queueSize(): number { return this.queue.length; }
  get activeCount(): number { return this.activeTasks; }

  dispose(): void {
    this.running = false;
    if (this.idleCallbackId) {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(this.idleCallbackId);
      else clearTimeout(this.idleCallbackId);
    }
    this.queue.forEach((t) => { t.cancelled = true; t.reject(new Error('Scheduler disposed')); });
    this.queue = [];
  }
}