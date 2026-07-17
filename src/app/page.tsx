"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Base } from "@/types/game";
import { SettingsManager } from "@/game/SettingsManager";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { Mascot } from "@/components/Mascot";
import { BaseSlider } from "@/components/ui/BaseSlider";

export default function Home() {
  const router = useRouter();
  const isTouch = useIsTouchDevice();
  const [name, setName] = useState("");
  const [base, setBase] = useState<Base>(2);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(SettingsManager.loadPlayerName());
  }, []);

  const startGame = () => {
    if (!name.trim()) return;
    SettingsManager.savePlayerName(name.trim());
    const params = new URLSearchParams({ base: String(base), name: name.trim() });
    router.push(`/play?${params.toString()}`);
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[44px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] lg:max-w-xl">
        <div
          className="relative flex h-[280px] flex-col items-center justify-center gap-2 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 25% 15%, oklch(83% 0.15 95), transparent 42%), radial-gradient(circle at 75% 85%, oklch(60% 0.12 195), transparent 45%), oklch(64% 0.2 25)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, oklch(100% 0 0 / .06) 0 18px, transparent 18px 36px)",
            }}
          />
          <div
            className="animate-bob absolute top-7 left-8 h-3 w-3 rotate-45 bg-gold"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="animate-bob absolute top-14 right-11 h-[9px] w-[9px] rotate-45 bg-white"
            style={{ animationDelay: ".3s" }}
          />

          <Mascot scale={1} className="absolute right-4 bottom-2" />

          <div className="font-display text-[15px] font-extrabold tracking-[0.3em] text-white/90">N진수</div>
          <div
            className="-mt-2 font-display text-[44px] font-extrabold tracking-wide text-white"
            style={{ textShadow: "0 4px 0 oklch(40% 0.15 20 / .6)" }}
          >
            태고
          </div>
        </div>

        <div className="-mt-6 flex flex-col gap-5 rounded-t-[28px] bg-cream-card px-6 pt-7 pb-6">
          <p className="text-center text-[13px] leading-relaxed font-bold text-ink-muted">
            숫자가 나오면 그 진법 조합을 30초 안에
            <br />
            최대한 빠르고 정확하게 완성하세요.
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-[13px] font-bold text-ink">이름</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startGame()}
              placeholder="이름을 입력하세요"
              maxLength={20}
              className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-3 font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink-faint focus:border-coral"
            />
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[13px] font-bold text-ink">진법</h2>
              <span className="font-display text-[15px] font-extrabold text-coral">{base}진수</span>
            </div>
            <BaseSlider value={base} min={2} max={16} onChange={(v) => setBase(v as Base)} accent="coral" />
            <div className="flex justify-between font-mono text-[11px] font-bold text-ink-muted">
              <span>2</span>
              <span>16</span>
            </div>
          </section>

          <button
            onClick={startGame}
            disabled={!name.trim()}
            className="rounded-2xl py-3.5 font-display text-[19px] font-extrabold tracking-wide text-white shadow-[0_6px_0_var(--color-coral-shadow),0_14px_24px_oklch(30%_0.1_25_/_0.35)] transition-transform active:translate-y-0.5 active:shadow-[0_3px_0_var(--color-coral-shadow)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, var(--color-coral-strong), var(--color-coral-dark))" }}
          >
            게임 시작
          </button>

          <nav className="mt-1 flex flex-wrap justify-center gap-2.5">
            <Link
              href="/learn"
              className="rounded-full bg-gold px-3.5 py-2 text-xs font-bold text-gold-ink transition-opacity hover:opacity-80"
            >
              학습 모드
            </Link>
            <Link
              href="/ranking"
              className="rounded-full bg-cream-softer px-3.5 py-2 text-xs font-bold text-ink-faint transition-opacity hover:opacity-80"
            >
              랭킹
            </Link>
            <Link
              href="/stats"
              className="rounded-full bg-cream-softer px-3.5 py-2 text-xs font-bold text-ink-faint transition-opacity hover:opacity-80"
            >
              통계
            </Link>
            {!isTouch && (
              <Link
                href="/settings"
                className="rounded-full bg-cream-softer px-3.5 py-2 text-xs font-bold text-ink-faint transition-opacity hover:opacity-80"
              >
                키 설정
              </Link>
            )}
          </nav>
        </div>
      </div>
    </main>
  );
}
