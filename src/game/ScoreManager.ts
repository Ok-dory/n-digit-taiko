import type { Judgment, ScoreState } from "@/types/game";

const JUDGMENT_POINTS: Record<Judgment, number> = {
  perfect: 100,
  good: 50,
  miss: 0,
};

const COMBO_MULTIPLIER_STEP = 0.02;
const MAX_COMBO_MULTIPLIER = 3;

export type ScoreChangeListener = (state: ScoreState) => void;

/** Tracks score, combo, and accuracy for the current run. Pure state, no rendering. */
export class ScoreManager {
  private state: ScoreState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    totalCount: 0,
    accuracy: 100,
  };
  private listeners = new Set<ScoreChangeListener>();

  register(judgment: Judgment): ScoreState {
    const s = this.state;
    s.totalCount += 1;

    if (judgment === "miss") {
      s.combo = 0;
      s.missCount += 1;
    } else {
      s.combo += 1;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      if (judgment === "perfect") s.perfectCount += 1;
      else s.goodCount += 1;

      const multiplier = Math.min(1 + s.combo * COMBO_MULTIPLIER_STEP, MAX_COMBO_MULTIPLIER);
      s.score += Math.round(JUDGMENT_POINTS[judgment] * multiplier);
    }

    const hit = s.perfectCount + s.goodCount;
    s.accuracy = s.totalCount === 0 ? 100 : Math.round((hit / s.totalCount) * 1000) / 10;

    this.state = { ...s };
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
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
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
