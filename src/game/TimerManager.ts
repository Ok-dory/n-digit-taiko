export type TimerTickListener = (secondsRemaining: number) => void;
export type TimerEndListener = () => void;

/**
 * Drives the fixed-duration countdown (matching the original game's 30s
 * timer) and supports small time bonuses on correct answers.
 * Framework-agnostic: consumers subscribe to ticks.
 */
export class TimerManager {
  private remainingMs: number;
  private elapsedMs = 0;
  private lastTickAt = 0;
  private rafId: number | null = null;
  private tickListeners = new Set<TimerTickListener>();
  private endListeners = new Set<TimerEndListener>();

  constructor(durationSeconds: number) {
    this.remainingMs = durationSeconds * 1000;
  }

  start(): void {
    this.lastTickAt = performance.now();
    const loop = (now: number) => {
      const delta = now - this.lastTickAt;
      this.lastTickAt = now;
      this.elapsedMs += delta;
      this.remainingMs = Math.max(0, this.remainingMs - delta);

      if (this.remainingMs === 0) {
        this.notifyTick();
        this.stop();
        for (const listener of this.endListeners) listener();
        return;
      }
      this.notifyTick();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  addBonusSeconds(seconds: number): void {
    this.remainingMs += seconds * 1000;
    this.notifyTick();
  }

  getElapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  getRemainingSeconds(): number {
    return this.remainingMs / 1000;
  }

  onTick(listener: TimerTickListener): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  onEnd(listener: TimerEndListener): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  private notifyTick(): void {
    for (const listener of this.tickListeners) listener(this.getRemainingSeconds());
  }
}
