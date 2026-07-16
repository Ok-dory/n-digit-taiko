import { BaseConverter, DIFFICULTY_PRESETS } from "@/game/BaseConverter";
import { InputManager, KeyboardInput } from "@/game/InputManager";
import { ScoreManager } from "@/game/ScoreManager";
import { TimerManager } from "@/game/TimerManager";
import { AudioManager } from "@/game/AudioManager";
import { SettingsManager } from "@/game/SettingsManager";
import type {
  DigitProblem,
  GameConfig,
  Judgment,
  JudgmentEvent,
  ScoreState,
} from "@/types/game";

const HIT_LINE_RATIO = 0.82;
const SPAWN_Y_RATIO = 0.05;

interface FallingNote {
  symbol: string;
  spawnTime: number;
  hitTime: number;
}

export interface GameEngineCallbacks {
  onScoreChange?: (state: ScoreState) => void;
  onJudgment?: (event: JudgmentEvent) => void;
  onProblemChange?: (problem: DigitProblem, digitIndex: number) => void;
  onTick?: (secondsRemaining: number | null, elapsedSeconds: number) => void;
  onGameOver?: (finalScore: ScoreState) => void;
}

/**
 * Orchestrates a single play session: generates problems via BaseConverter,
 * reads player input via InputManager, judges timing against a single
 * falling note, and reports state through callbacks. Owns the canvas
 * render loop. Contains no JSX/React.
 */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private callbacks: GameEngineCallbacks;

  private inputManager: InputManager;
  private scoreManager = new ScoreManager();
  private timerManager: TimerManager;
  private audioManager = new AudioManager();

  private currentProblem: DigitProblem | null = null;
  private digitIndex = 0;
  private activeNote: FallingNote | null = null;
  private rafId: number | null = null;
  private unsubscribeInput: (() => void) | null = null;
  private unsubscribeTick: (() => void) | null = null;
  private unsubscribeEnd: (() => void) | null = null;
  private running = false;

  constructor(canvas: HTMLCanvasElement, config: GameConfig, callbacks: GameEngineCallbacks = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.config = config;
    this.callbacks = callbacks;

    this.inputManager = new InputManager(SettingsManager.loadKeyBindings());
    this.inputManager.registerSource(new KeyboardInput());

    this.timerManager = new TimerManager(config.mode, config.duration);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.audioManager.preload();

    this.unsubscribeInput = this.inputManager.onAction((action, timestamp) =>
      this.handleAction(action, timestamp)
    );
    this.unsubscribeTick = this.timerManager.onTick((remaining) =>
      this.callbacks.onTick?.(remaining, this.timerManager.getElapsedSeconds())
    );
    this.unsubscribeEnd = this.timerManager.onEnd(() => this.endGame());

    this.timerManager.start();
    this.nextProblem();
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.timerManager.stop();
    this.unsubscribeInput?.();
    this.unsubscribeTick?.();
    this.unsubscribeEnd?.();
  }

  destroy(): void {
    this.stop();
    this.inputManager.destroy();
    this.audioManager.destroy();
  }

  /** Manually ends the session (used by Practice/Endless, which have no timer-driven end). */
  finish(): void {
    if (!this.running) return;
    this.endGame();
  }

  updateKeyBindings(): void {
    this.inputManager.updateBindings(SettingsManager.loadKeyBindings());
  }

  setMuted(muted: boolean): void {
    this.audioManager.setMuted(muted);
  }

  getScoreState(): ScoreState {
    return this.scoreManager.getState();
  }

  private nextProblem(): void {
    this.currentProblem = BaseConverter.generateProblem(this.config.base, this.config.difficulty);
    this.digitIndex = 0;
    this.callbacks.onProblemChange?.(this.currentProblem, this.digitIndex);
    this.spawnNote();
  }

  private spawnNote(): void {
    if (!this.currentProblem) return;
    const preset = DIFFICULTY_PRESETS[this.config.difficulty];
    const height = this.canvas.height;
    const travelPx = height * (HIT_LINE_RATIO - SPAWN_Y_RATIO);
    const travelMs = (travelPx / preset.noteSpeed) * 1000;
    const now = performance.now();
    this.activeNote = {
      symbol: this.currentProblem.digits[this.digitIndex],
      spawnTime: now,
      hitTime: now + travelMs,
    };
  }

  private handleAction(action: string, timestamp: number): void {
    if (!this.currentProblem || !this.activeNote) return;
    const preset = DIFFICULTY_PRESETS[this.config.difficulty];
    const expected = this.activeNote.symbol;
    const deltaMs = Math.abs(timestamp - this.activeNote.hitTime);

    if (action !== expected) {
      this.judge("miss", expected, action);
      return;
    }

    const perfectWindow = preset.hitWindowMs * 0.4;
    const judgment: Judgment = deltaMs <= perfectWindow ? "perfect" : deltaMs <= preset.hitWindowMs ? "good" : "miss";
    this.judge(judgment, expected, action);
    if (judgment !== "miss") {
      this.timerManager.addBonusSeconds(preset.timeBonusPerDigit / 10);
    }
  }

  private judge(judgment: Judgment, expected: string, received: string): void {
    const state = this.scoreManager.register(judgment);
    this.callbacks.onScoreChange?.(state);
    this.callbacks.onJudgment?.({ judgment, expected, received, timestamp: performance.now() });
    this.audioManager.play(judgment);
    this.advance();
  }

  private advance(): void {
    if (!this.currentProblem) return;
    this.digitIndex += 1;
    if (this.digitIndex >= this.currentProblem.digits.length) {
      this.nextProblem();
    } else {
      this.callbacks.onProblemChange?.(this.currentProblem, this.digitIndex);
      this.spawnNote();
    }
  }

  private endGame(): void {
    this.stop();
    this.audioManager.play("gameOver");
    this.callbacks.onGameOver?.(this.scoreManager.getState());
  }

  private loop = (): void => {
    if (!this.running) return;
    this.checkAutoMiss();
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private checkAutoMiss(): void {
    if (!this.activeNote || !this.currentProblem) return;
    const preset = DIFFICULTY_PRESETS[this.config.difficulty];
    const now = performance.now();
    if (now - this.activeNote.hitTime > preset.hitWindowMs) {
      this.judge("miss", this.activeNote.symbol, "(timeout)");
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;
    const hitY = height * HIT_LINE_RATIO;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(width, hitY);
    ctx.stroke();

    if (this.activeNote) {
      const now = performance.now();
      const totalTravelMs = this.activeNote.hitTime - this.activeNote.spawnTime;
      const elapsed = now - this.activeNote.spawnTime;
      const progress = totalTravelMs > 0 ? elapsed / totalTravelMs : 1;
      const y = height * SPAWN_Y_RATIO + progress * (hitY - height * SPAWN_Y_RATIO);
      const x = width / 2;

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.activeNote.symbol, x, y);
    }
  }
}
