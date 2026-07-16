import { getSupabaseClient } from "@/utils/supabaseClient";
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
 * Reads/writes the weekly ranking table in Supabase. Old rows are never
 * deleted — every query filters to `created_at >= now() - 7 days` so
 * stale entries just fall out of view.
 */
export class RankingManager {
  static async submitScore(entry: RankingEntry): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Supabase is not configured" };
    const { error } = await supabase.from(RANKING_TABLE).insert(entry);
    return { error: error?.message ?? null };
  }

  static async getWeeklyTop(limit: number = TOP_N): Promise<RankingEntry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
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
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(RANKING_TABLE)
      .select("score, accuracy, combo")
      .eq("player_name", playerName);
    if (error || !data || data.length === 0) return null;

    const totalPlays = data.length;
    const averageAccuracy = data.reduce((sum, r) => sum + r.accuracy, 0) / totalPlays;
    const bestScore = Math.max(...data.map((r) => r.score));
    const averageCombo = data.reduce((sum, r) => sum + r.combo, 0) / totalPlays;

    return { averageAccuracy, bestScore, totalPlays, averageCombo };
  }
}
