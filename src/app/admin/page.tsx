"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/utils/firebaseClient";
import { RankingManager } from "@/game/RankingManager";
import type { Base, RankingEntry } from "@/types/game";

const BASES: Base[] = Array.from({ length: 15 }, (_, i) => (i + 2) as Base);

export default function AdminPage() {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  if (!auth) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="font-bold text-ink-muted">Firebase가 설정되지 않아 관리자 기능을 사용할 수 없습니다.</p>
        <Link href="/" className="font-display font-bold text-coral">
          홈으로
        </Link>
      </main>
    );
  }

  if (user === undefined) {
    return <main className="flex flex-1 items-center justify-center font-bold text-ink-muted">확인 중...</main>;
  }

  if (!user) {
    const login = async () => {
      setLoginError(null);
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch {
        setLoginError("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
      }
    };

    return (
      <main className="flex flex-1 items-center justify-center px-0 py-6 sm:px-4 sm:py-8">
        <div className="w-full overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] sm:max-w-sm">
          <div className="bg-coral px-6 py-5 text-center text-white">
            <h1 className="font-display text-[17px] font-extrabold">관리자 로그인</h1>
          </div>
          <div className="flex flex-col gap-3 px-6 py-6">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              type="email"
              className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-3 text-sm font-bold text-ink outline-none focus:border-coral"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="비밀번호"
              type="password"
              className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-3 text-sm font-bold text-ink outline-none focus:border-coral"
            />
            {loginError && <p className="text-center text-sm font-bold text-rose-500">{loginError}</p>}
            <button
              onClick={login}
              className="rounded-2xl py-3.5 font-display text-base font-extrabold text-white shadow-[0_5px_0_var(--color-coral-shadow)] transition-transform active:translate-y-0.5 active:shadow-none"
              style={{ background: "linear-gradient(180deg, var(--color-coral-strong), var(--color-coral-dark))" }}
            >
              로그인
            </button>
            <Link href="/" className="text-center text-sm font-bold text-ink-muted">
              홈으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <EntryModeration auth={auth} email={user.email ?? ""} />;
}

function EntryModeration({ auth, email }: { auth: NonNullable<ReturnType<typeof getFirebaseAuth>>; email: string }) {
  const [base, setBase] = useState<Base | null>(null);
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = () => {
    RankingManager.listForAdmin(base).then(setEntries);
  };

  useEffect(() => {
    // Reset to the loading state whenever the selected base changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(null);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const handleDelete = async (entry: RankingEntry) => {
    if (!entry.id) return;
    if (!window.confirm(`"${entry.player_name}" (${entry.score}점) 기록을 삭제할까요?`)) return;
    setDeletingId(entry.id);
    await RankingManager.deleteEntry(entry.id);
    setDeletingId(null);
    reload();
  };

  return (
    <main className="flex flex-1 items-center justify-center px-0 py-6 sm:px-4 sm:py-12">
      <div className="w-full overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] sm:max-w-3xl lg:max-w-6xl">
        <div className="flex items-center justify-between bg-coral px-6 py-5 text-white">
          <Link href="/" className="font-bold">
            ‹
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">랭킹 관리</h1>
          <button onClick={() => signOut(auth)} className="text-xs font-bold opacity-85">
            로그아웃
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <p className="text-center text-xs font-bold text-ink-muted">{email}로 로그인됨</p>

          <div className="flex justify-center">
            <select
              value={base ?? "all"}
              onChange={(e) => setBase(e.target.value === "all" ? null : (Number(e.target.value) as Base))}
              className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-2.5 text-sm font-bold text-ink outline-none focus:border-coral"
            >
              <option value="all">전체 진법</option>
              {BASES.map((b) => (
                <option key={b} value={b}>
                  {b}진수
                </option>
              ))}
            </select>
          </div>

          {entries === null && <p className="text-center text-sm font-bold text-ink-muted">불러오는 중...</p>}
          {entries !== null && entries.length === 0 && (
            <p className="text-center text-sm font-bold text-ink-muted">기록이 없습니다.</p>
          )}

          {entries !== null && entries.length > 0 && (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-cream-soft text-ink-muted">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-display font-bold">이름</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">진법</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">점수</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">날짜</th>
                    <th className="px-3 py-2.5 text-right font-display font-bold">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="bg-cream-card">
                      <td className="px-3 py-2.5 font-bold text-ink">{entry.player_name}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink-muted">{entry.base}진수</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right text-ink-faint">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleDelete(entry)}
                          disabled={deletingId === entry.id}
                          className="rounded-full bg-rose-600/15 px-3 py-1.5 text-xs font-bold text-rose-600 transition-opacity disabled:opacity-50"
                        >
                          {deletingId === entry.id ? "삭제 중..." : "삭제"}
                        </button>
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
