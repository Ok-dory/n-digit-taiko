import type { Base, Difficulty, GameConfig, GameMode, TimeAttackDuration } from "@/types/game";

const VALID_MODES: GameMode[] = ["practice", "timeAttack", "endless", "binary", "nbase"];
const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "insane"];
const VALID_DURATIONS: TimeAttackDuration[] = [60, 90, 120];

export function configToSearchParams(config: GameConfig): URLSearchParams {
  const params = new URLSearchParams({
    mode: config.mode,
    base: String(config.base),
    difficulty: config.difficulty,
  });
  if (config.duration) params.set("duration", String(config.duration));
  return params;
}

export function searchParamsToConfig(params: URLSearchParams): GameConfig {
  const modeRaw = params.get("mode");
  const baseRaw = Number(params.get("base"));
  const difficultyRaw = params.get("difficulty");
  const durationRaw = Number(params.get("duration"));

  const mode: GameMode = VALID_MODES.includes(modeRaw as GameMode) ? (modeRaw as GameMode) : "practice";
  const base: Base = baseRaw >= 2 && baseRaw <= 16 ? (baseRaw as Base) : 2;
  const difficulty: Difficulty = VALID_DIFFICULTIES.includes(difficultyRaw as Difficulty)
    ? (difficultyRaw as Difficulty)
    : "easy";
  const duration: TimeAttackDuration = VALID_DURATIONS.includes(durationRaw as TimeAttackDuration)
    ? (durationRaw as TimeAttackDuration)
    : 60;

  return mode === "timeAttack" ? { mode, base, difficulty, duration } : { mode, base, difficulty };
}
