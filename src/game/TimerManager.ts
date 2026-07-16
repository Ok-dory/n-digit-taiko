import type { GameMode, TimeAttackDuration } from "@/types/game";

export type TimerTickListener = (secondsRemaining: number | null) => void;
export type TimerEndListener = () => void;

/**
 * Drives the countdown for Time Attack, tracks elapsed time for
 * Practice/Endless (no limit), and supports small time bonuses on
 * correct answers. Framework-agnostic: consumers subscribe to ticks.
 */
export class TimerManager {
  private mode: GameMode;
  private remainingMs: number | null;
  private elapsedMs = 0;
  private lastTickAt = 0;
  private rafId: number | null = null;
  private tickListeners = new Set<TimerTickListener>();
  private endListeners = new Set<TimerEndListener>();

  constructor(mode: GameMode, duration?: TimeAttackDuration) {
    this.mode = mode;
    this.remainingMs = mode === "timeAttack" ? (duration ?? 60) * 1000 : null;
  }

  start(): void {
    this.lastTickAt = performance.now();
    const loop = (now: number) => {
      const delta = now - this.lastTickAt;
      this.lastTickAt = now;
      this.elapsedMs += delta;

      if (this.remainingMs !== null) {
        this.remainingMs = Math.max(0, this.remainingMs - delta);
        if (this.remainingMs === 0) {
          this.notifyTick();
          this.stop();
          for (const listener of this.endListeners) listener();
          return;
        }
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
    if (this.remainingMs === null) return;
    this.remainingMs += seconds * 1000;
    this.notifyTick();
  }

  getElapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  getRemainingSeconds(): number | null {
    return this.remainingMs === null ? null : this.remainingMs / 1000;
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
    const remaining = this.getRemainingSeconds();
    for (const listener of this.tickListeners) listener(remaining);
  }
}
