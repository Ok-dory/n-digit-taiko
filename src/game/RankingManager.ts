import { getSupabaseClient } from "@/utils/supabaseClient";
import { LocalRankingStore } from "@/game/LocalRankingStore";
import type { PlayerStats, RankingEntry } from "@/types/game";

const RANKING_TABLE = "ranking";
const RANKING_WINDOW_DAYS = 7;
const TOP_N = 20;

function sevenDaysAgoIso(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RANKING_WINDOW_DAYS);
  return cutoff.toISOString();
}

/**
 * Reads/writes the weekly ranking table. Uses Supabase when configured
 * (shared, cross-device leaderboard); otherwise falls back to a
 * localStorage-backed store so the leaderboard works with zero setup,
 * matching the original game's local rankings.json file.
 */
export class RankingManager {
  static async submitScore(entry: RankingEntry): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      LocalRankingStore.submit(entry);
      return { error: null };
    }
    const { error } = await supabase.from(RANKING_TABLE).insert(entry);
    return { error: error?.message ?? null };
  }

  static async getWeeklyTop(limit: number = TOP_N): Promise<RankingEntry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return LocalRankingStore.getWeeklyTop(limit);

    const { data, error } = await supabase
      .from(RANKING_TABLE)
      .select("*")
      .gte("created_at", sevenDaysAgoIso())
      .order("score", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data as RankingEntry[];
  }

  static async getPlayerStats(playerName: string): Promise<PlayerStats | null> {
    const supabase = getSupabaseClient();
    const rows = supabase
      ? await (async () => {
          const { data, error } = await supabase
            .from(RANKING_TABLE)
            .select("score, accuracy, combo, hps")
            .eq("player_name", playerName);
          return error ? null : data;
        })()
      : LocalRankingStore.getByPlayer(playerName);

    if (!rows || rows.length === 0) return null;

    const totalPlays = rows.length;
    const averageAccuracy = rows.reduce((sum, r) => sum + r.accuracy, 0) / totalPlays;
    const bestScore = Math.max(...rows.map((r) => r.score));
    const averageCombo = rows.reduce((sum, r) => sum + r.combo, 0) / totalPlays;
    const averageHps = rows.reduce((sum, r) => sum + (r.hps ?? 0), 0) / totalPlays;

    return { averageAccuracy, bestScore, totalPlays, averageCombo, averageHps };
  }
}
