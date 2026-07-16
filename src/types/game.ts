export type Base = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const MIN_BASE: Base = 2;
export const MAX_BASE: Base = 16;

export type GameMode = "binary" | "nbase" | "practice" | "timeAttack" | "endless" | "learn";

export type TimeAttackDuration = 60 | 90 | 120;

export type Difficulty = "easy" | "medium" | "hard" | "insane";

export interface DifficultySettings {
  minDigits: number;
  maxDigits: number;
  /** pixels per second the falling note travels */
  noteSpeed: number;
  /** ms allowed to hit a digit before it counts as Miss */
  hitWindowMs: number;
  timeBonusPerDigit: number;
}

export type Judgment = "perfect" | "good" | "miss";

export interface DigitProblem {
  id: string;
  base: Base;
  decimalValue: number;
  digits: string[];
}

export interface GameConfig {
  mode: GameMode;
  base: Base;
  difficulty: Difficulty;
  duration?: TimeAttackDuration;
}

export interface JudgmentEvent {
  judgment: Judgment;
  expected: string;
  received: string;
  timestamp: number;
}

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  totalCount: number;
  accuracy: number;
}

export type DigitSymbol =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "A" | "B" | "C" | "D" | "E" | "F";

/** Logical input action identifiers, independent of physical device. */
export type InputAction = DigitSymbol;

export interface KeyBindingMap {
  [action: string]: string;
}

export interface RankingEntry {
  id?: string;
  player_name: string;
  score: number;
  accuracy: number;
  combo: number;
  base: Base;
  difficulty: Difficulty;
  created_at?: string;
}

export interface PlayerStats {
  averageAccuracy: number;
  bestScore: number;
  totalPlays: number;
  averageCombo: number;
}
