"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import type { Base, RankingBoard } from "@/types/game";

const BASES: Base[] = Array.from({ length: 15 }, (_, i) => (i + 2) as Base);

export default function RankingPage() {
  const [base, setBase] = useState<Base>(2);
  const [board, setBoard] = useState<RankingBoard | null>(null);

  useEffect(() => {
    // Reset to the loading state whenever the selected base changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(null);
    RankingManager.getBoard(base, 20).then(setBoard);
  }, [base]);

  const rows = board
    ? [
        ...(board.allTimeBest ? [{ ...board.allTimeBest, isAllTime: true }] : []),
        ...board.weekly.map((e) => ({ ...e, isAllTime: false })),
      ]
    : [];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)]">
        <div className="flex items-center justify-between bg-coral px-6 py-5 text-white">
          <Link href="/" className="font-bold">
            ‹
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">랭킹</h1>
          <div className="w-4" />
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex justify-center">
            <select
              value={base}
              onChange={(e) => setBase(Number(e.target.value) as Base)}
              className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-2.5 text-sm font-bold text-ink outline-none focus:border-coral"
            >
              {BASES.map((b) => (
                <option key={b} value={b}>
                  {b}진수
                </option>
              ))}
            </select>
          </div>

          <p className="text-center text-xs font-bold text-ink-muted">
            1위는 역대 최고 기록으로 계속 유지되고, 나머지는 최근 7일 기록입니다.
          </p>

          {board === null && <p className="text-center text-sm font-bold text-ink-muted">불러오는 중...</p>}

          {board !== null && rows.length === 0 && (
            <p className="text-center text-sm font-bold text-ink-muted">
              아직 {base}진수 기록이 없습니다. Firebase가 설정되지 않았다면 .env.local에 환경변수를 추가하세요.
            </p>
          )}

          {board !== null && rows.length > 0 && (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-cream-soft text-ink-muted">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-display font-bold">순위</th>
                    <th className="px-3 py-2.5 text-left font-display font-bold">이름</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">점수</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">정확도</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">최대콤보</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">HPS</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry, i) => (
                    <tr key={entry.id ?? i} className={entry.isAllTime ? "bg-gold/25" : "bg-cream-card"}>
                      <td className="px-3 py-2.5 font-mono font-bold text-coral">{entry.isAllTime ? "🏆" : i + 1}</td>
                      <td className="px-3 py-2.5 font-bold text-ink">{entry.player_name}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink-muted">{entry.accuracy}%</td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink-muted">{entry.combo}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink-muted">
                        {entry.hps?.toFixed(1) ?? "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right text-ink-faint">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
