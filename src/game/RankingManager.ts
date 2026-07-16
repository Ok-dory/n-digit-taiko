import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  Timestamp,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getFirestoreDb } from "@/utils/firebaseClient";
import { LocalRankingStore } from "@/game/LocalRankingStore";
import type { Base, PlayerStats, RankingBoard, RankingEntry } from "@/types/game";

const RANKING_COLLECTION = "ranking";
const RANKING_WINDOW_DAYS = 7;
const TOP_N = 20;
/**
 * Firestore requires the first orderBy to match a field with a range
 * filter, so the weekly query is ordered by created_at (not score) and
 * re-sorted by score client-side after fetching. This cap keeps that
 * fetch bounded even if a base gets a busy week.
 */
const WEEKLY_FETCH_CAP = 200;
const ADMIN_FETCH_CAP = 200;

function sevenDaysAgo(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RANKING_WINDOW_DAYS);
  return cutoff;
}

function docToEntry(doc: QueryDocumentSnapshot<DocumentData>): RankingEntry {
  const data = doc.data();
  return {
    id: doc.id,
    player_name: data.player_name,
    score: data.score,
    accuracy: data.accuracy,
    combo: data.combo,
    hps: data.hps,
    base: data.base,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : undefined,
  };
}

/**
 * Reads/writes the ranking collection, one board per base. Uses Firestore
 * when configured (shared, cross-device leaderboard); otherwise falls
 * back to a localStorage-backed store so the leaderboard works with zero
 * setup, matching the original game's local rankings.json file.
 */
export class RankingManager {
  static async submitScore(entry: RankingEntry): Promise<{ error: string | null }> {
    const db = getFirestoreDb();
    if (!db) {
      LocalRankingStore.submit(entry);
      return { error: null };
    }
    try {
      await addDoc(collection(db, RANKING_COLLECTION), {
        player_name: entry.player_name,
        score: entry.score,
        accuracy: entry.accuracy,
        combo: entry.combo,
        hps: entry.hps,
        base: entry.base,
        created_at: Timestamp.now(),
      });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Unknown error" };
    }
  }

  /**
   * Rank 1 is the all-time best for this base (never expires); the rest
   * is the current week's top scores, re-fetched every 7-day window.
   */
  static async getBoard(base: Base, limit: number = TOP_N): Promise<RankingBoard> {
    const db = getFirestoreDb();
    if (!db) return LocalRankingStore.getBoard(base, limit);

    try {
      const bestQuery = query(
        collection(db, RANKING_COLLECTION),
        where("base", "==", base),
        orderBy("score", "desc"),
        fsLimit(1)
      );
      const weeklyQuery = query(
        collection(db, RANKING_COLLECTION),
        where("base", "==", base),
        where("created_at", ">=", Timestamp.fromDate(sevenDaysAgo())),
        orderBy("created_at", "desc"),
        fsLimit(WEEKLY_FETCH_CAP)
      );

      const [bestSnap, weeklySnap] = await Promise.all([getDocs(bestQuery), getDocs(weeklyQuery)]);

      const allTimeBest = bestSnap.empty ? null : docToEntry(bestSnap.docs[0]);
      const weekly = weeklySnap.docs
        .map(docToEntry)
        .filter((e) => e.id !== allTimeBest?.id)
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
        .slice(0, limit);

      return { allTimeBest, weekly };
    } catch {
      return { allTimeBest: null, weekly: [] };
    }
  }

  /** Most recent entries for moderation — optionally scoped to one base, newest first. */
  static async listForAdmin(base: Base | null): Promise<RankingEntry[]> {
    const db = getFirestoreDb();
    if (!db) return LocalRankingStore.getRecent(base, ADMIN_FETCH_CAP);

    const constraints = base !== null ? [where("base", "==", base)] : [];
    const q = query(
      collection(db, RANKING_COLLECTION),
      ...constraints,
      orderBy("created_at", "desc"),
      fsLimit(ADMIN_FETCH_CAP)
    );
    const snap = await getDocs(q);
    return snap.docs.map(docToEntry);
  }

  static async deleteEntry(id: string): Promise<{ error: string | null }> {
    const db = getFirestoreDb();
    if (!db) {
      LocalRankingStore.delete(id);
      return { error: null };
    }
    try {
      await deleteDoc(doc(db, RANKING_COLLECTION, id));
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Unknown error" };
    }
  }

  static async getPlayerStats(playerName: string): Promise<PlayerStats | null> {
    const db = getFirestoreDb();
    const rows = db
      ? await (async () => {
          try {
            const q = query(collection(db, RANKING_COLLECTION), where("player_name", "==", playerName));
            const snap = await getDocs(q);
            return snap.docs.map(docToEntry);
          } catch {
            return null;
          }
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
