import { getSupabaseClient } from "@/utils/supabaseClient";
import { LocalRankingStore } from "@/game/LocalRankingStore";
import type { Base, PlayerStats, RankingBoard, RankingEntry } from "@/types/game";

const RANKING_TABLE = "ranking";
const RANKING_WINDOW_DAYS = 7;
const TOP_N = 20;

function sevenDaysAgoIso(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RANKING_WINDOW_DAYS);
  return cutoff.toISOString();
}

/**
 * Reads/writes the ranking table, one board per base. Uses Supabase when
 * configured (shared, cross-device leaderboard); otherwise falls back to
 * a localStorage-backed store so the leaderboard works with zero setup,
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

  /**
   * Rank 1 is the all-time best for this base (never expires); the rest
   * is the current week's top scores, re-fetched every 7-day window.
   */
  static async getBoard(base: Base, limit: number = TOP_N): Promise<RankingBoard> {
    const supabase = getSupabaseClient();
    if (!supabase) return LocalRankingStore.getBoard(base, limit);

    const [bestResult, weeklyResult] = await Promise.all([
      supabase
        .from(RANKING_TABLE)
        .select("*")
        .eq("base", base)
        .order("score", { ascending: false })
        .limit(1),
      supabase
        .from(RANKING_TABLE)
        .select("*")
        .eq("base", base)
        .gte("created_at", sevenDaysAgoIso())
        .order("score", { ascending: false })
        .limit(limit),
    ]);

    const allTimeBest = (bestResult.data?.[0] as RankingEntry | undefined) ?? null;
    const weekly = bestResult.error || weeklyResult.error
      ? []
      : (weeklyResult.data as RankingEntry[]).filter((e) => e.id !== allTimeBest?.id);

    return { allTimeBest, weekly };
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
