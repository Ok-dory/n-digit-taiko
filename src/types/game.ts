export type Base = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const MIN_BASE: Base = 2;
export const MAX_BASE: Base = 16;

export type GameMode = "practice" | "timeAttack" | "endless";

export type TimeAttackDuration = 30 | 60 | 90 | 120;

export type Difficulty = "easy" | "medium" | "hard" | "insane";

export interface DifficultySettings {
  /** number of digits shown per problem */
  digitCount: number;
  /** digit count used during the bonus round window (timeAttack only) */
  bonusDigitCount: number;
}

/** Immediate per-keypress result: no timing judgment, just right or wrong. */
export type Judgment = "correct" | "wrong";

export interface DigitProblem {
  id: string;
  base: Base;
  decimalValue: number;
  digits: string[];
}

/** What the player actually typed at one digit slot, and whether it matched. */
export interface DigitEntry {
  digit: string;
  judgment: Judgment;
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
  digitIndex: number;
  timestamp: number;
}

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
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
  hps: number;
  base: Base;
  difficulty: Difficulty;
  created_at?: string;
}

export interface PlayerStats {
  averageAccuracy: number;
  bestScore: number;
  totalPlays: number;
  averageCombo: number;
  averageHps: number;
}
