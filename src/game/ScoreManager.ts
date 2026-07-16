import type { Judgment, ScoreState } from "@/types/game";

const CORRECT_POINTS = 10;
const WRONG_PENALTY = 5;

export type ScoreChangeListener = (state: ScoreState) => void;

/**
 * Tracks score, combo, and accuracy for the current run. Every keypress is
 * judged immediately as correct or wrong (no timing window) — combo resets
 * on a wrong digit and score can go negative, matching the original game.
 */
export class ScoreManager {
  private state: ScoreState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    totalCount: 0,
    accuracy: 100,
  };
  private listeners = new Set<ScoreChangeListener>();

  register(judgment: Judgment): ScoreState {
    const s = this.state;
    s.totalCount += 1;

    if (judgment === "correct") {
      s.combo += 1;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      s.correctCount += 1;
      s.score += CORRECT_POINTS;
    } else {
      s.combo = 0;
      s.wrongCount += 1;
      s.score -= WRONG_PENALTY;
    }

    s.accuracy = s.totalCount === 0 ? 100 : Math.round((s.correctCount / s.totalCount) * 1000) / 10;

    this.state = { ...s };
    this.notify();
    return this.state;
  }

  /** Adds bonus points earned from completing a problem with no mistakes. */
  addBonus(points: number): ScoreState {
    this.state = { ...this.state, score: this.state.score + points };
    this.notify();
    return this.state;
  }

  getState(): ScoreState {
    return this.state;
  }

  reset(): void {
    this.state = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      totalCount: 0,
      accuracy: 100,
    };
    this.notify();
  }

  onChange(listener: ScoreChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}
