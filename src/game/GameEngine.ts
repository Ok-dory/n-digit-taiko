import { BaseConverter, DIFFICULTY_PRESETS } from "@/game/BaseConverter";
import { InputManager, KeyboardInput } from "@/game/InputManager";
import { ScoreManager } from "@/game/ScoreManager";
import { TimerManager } from "@/game/TimerManager";
import { AudioManager } from "@/game/AudioManager";
import { SettingsManager } from "@/game/SettingsManager";
import type {
  DigitEntry,
  DigitProblem,
  GameConfig,
  Judgment,
  JudgmentEvent,
  ScoreState,
} from "@/types/game";

/** Last N seconds of a Time Attack run bump the digit count for extra challenge. */
const BONUS_WINDOW_SECONDS = 10;
/** Digits per problem stay static; input is unlimited-time (no timing judgment). */
const NEXT_PROBLEM_DELAY_MS = 300;

export interface BonusEvent {
  points: number;
  seconds: number;
  timestamp: number;
}

export interface GameEngineCallbacks {
  onScoreChange?: (state: ScoreState) => void;
  onJudgment?: (event: JudgmentEvent) => void;
  onProblemChange?: (problem: DigitProblem, digitIndex: number, entries: DigitEntry[]) => void;
  onTick?: (secondsRemaining: number | null, elapsedSeconds: number, hps: number, bonusActive: boolean) => void;
  onBonus?: (bonus: BonusEvent) => void;
  onGameOver?: (finalScore: ScoreState) => void;
}

/**
 * Orchestrates a single play session: as fast as possible, correctly key in
 * the base-N digits of a randomly generated number. There is no timing
 * window — every keypress is judged right or wrong immediately, and the
 * player's speed is measured via combo and hits-per-second. Contains no
 * JSX/React and no rendering; UI reads state entirely through callbacks.
 */
export class GameEngine {
  private config: GameConfig;
  private callbacks: GameEngineCallbacks;

  private inputManager: InputManager;
  private scoreManager = new ScoreManager();
  private timerManager: TimerManager;
  private audioManager = new AudioManager();

  private currentProblem: DigitProblem | null = null;
  private digitIndex = 0;
  private entries: DigitEntry[] = [];
  private totalHits = 0;
  private bonusActive = false;
  private nextProblemTimeout: ReturnType<typeof setTimeout> | null = null;
  private unsubscribeInput: (() => void) | null = null;
  private unsubscribeTick: (() => void) | null = null;
  private unsubscribeEnd: (() => void) | null = null;
  private running = false;

  constructor(config: GameConfig, callbacks: GameEngineCallbacks = {}) {
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
    this.unsubscribeTick = this.timerManager.onTick(() => this.handleTick());
    this.unsubscribeEnd = this.timerManager.onEnd(() => this.endGame());

    this.timerManager.start();
    this.nextProblem();
  }

  stop(): void {
    this.running = false;
    if (this.nextProblemTimeout !== null) clearTimeout(this.nextProblemTimeout);
    this.nextProblemTimeout = null;
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

  /** Feeds a digit press from a non-keyboard source (e.g. an on-screen button). */
  manualInput(symbol: string): void {
    this.handleAction(symbol, performance.now());
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

  private handleTick(): void {
    const elapsed = this.timerManager.getElapsedSeconds();
    const remaining = this.timerManager.getRemainingSeconds();
    const hps = elapsed > 0.5 ? this.totalHits / elapsed : 0;

    this.bonusActive =
      this.config.mode === "timeAttack" && remaining !== null && remaining <= BONUS_WINDOW_SECONDS && remaining > 0;

    this.callbacks.onTick?.(remaining, elapsed, hps, this.bonusActive);
  }

  private nextProblem(): void {
    const preset = DIFFICULTY_PRESETS[this.config.difficulty];
    const digitCount = this.bonusActive ? preset.bonusDigitCount : preset.digitCount;
    this.currentProblem = BaseConverter.generateProblem(this.config.base, digitCount);
    this.digitIndex = 0;
    this.entries = [];
    this.callbacks.onProblemChange?.(this.currentProblem, this.digitIndex, this.entries);
  }

  private handleAction(action: string, timestamp: number): void {
    if (!this.currentProblem || this.digitIndex >= this.currentProblem.digits.length) return;

    let digitValue: number;
    try {
      digitValue = BaseConverter.symbolToDigit(action);
    } catch {
      return;
    }
    if (digitValue >= this.config.base) return;

    const expected = this.currentProblem.digits[this.digitIndex];
    const judgment: Judgment = action === expected ? "correct" : "wrong";

    this.entries[this.digitIndex] = { digit: action, judgment };
    this.digitIndex += 1;
    this.totalHits += 1;

    const scoreState = this.scoreManager.register(judgment);
    this.callbacks.onScoreChange?.(scoreState);
    this.callbacks.onJudgment?.({
      judgment,
      expected,
      received: action,
      digitIndex: this.digitIndex - 1,
      timestamp,
    });
    this.audioManager.play(judgment);
    this.callbacks.onProblemChange?.(this.currentProblem, this.digitIndex, this.entries);

    if (this.digitIndex >= this.currentProblem.digits.length) {
      this.completeProblem();
    }
  }

  private completeProblem(): void {
    if (!this.currentProblem) return;
    const allCorrect = this.entries.every((e) => e.judgment === "correct");

    if (allCorrect) {
      const combo = this.scoreManager.getState().combo;
      const cross = BaseConverter.countTransitions(this.currentProblem.digits);
      const ratio = Math.floor((combo + 1) / 6);
      const bonusPoints = ratio * 3 * (cross + 1);

      let bonusSeconds = 0;
      if (this.config.mode === "timeAttack") {
        this.timerManager.addBonusSeconds(2);
        bonusSeconds = 2;
      }

      if (bonusPoints > 0) {
        const scoreState = this.scoreManager.addBonus(bonusPoints);
        this.callbacks.onScoreChange?.(scoreState);
        this.audioManager.play("bonus");
      }

      if (bonusPoints > 0 || bonusSeconds > 0) {
        this.callbacks.onBonus?.({ points: bonusPoints, seconds: bonusSeconds, timestamp: performance.now() });
      }
    }

    this.currentProblem = null;
    this.nextProblemTimeout = setTimeout(() => {
      if (this.running) this.nextProblem();
    }, NEXT_PROBLEM_DELAY_MS);
  }

  private endGame(): void {
    this.stop();
    this.audioManager.play("gameOver");
    this.callbacks.onGameOver?.(this.scoreManager.getState());
  }
}
