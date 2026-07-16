import type { RankingEntry } from "@/types/game";

const STORAGE_KEY = "n-digit-taiko:local-rankings";
const MAX_STORED_ENTRIES = 200;
const RANKING_WINDOW_DAYS = 7;

function readAll(): RankingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RankingEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: RankingEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_STORED_ENTRIES)));
}

/**
 * Browser-local fallback for the ranking board, mirroring the original
 * game's local rankings.json file. Used automatically when Supabase isn't
 * configured, so the leaderboard works with zero setup; scores stay on
 * this device/browser only.
 */
export class LocalRankingStore {
  static submit(entry: RankingEntry): void {
    const entries = readAll();
    entries.push({ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    writeAll(entries);
  }

  static getWeeklyTop(limit: number): RankingEntry[] {
    const cutoff = Date.now() - RANKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return readAll()
      .filter((e) => (e.created_at ? new Date(e.created_at).getTime() >= cutoff : true))
      .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
      .slice(0, limit);
  }

  static getByPlayer(playerName: string): RankingEntry[] {
    return readAll().filter((e) => e.player_name === playerName);
  }
}
