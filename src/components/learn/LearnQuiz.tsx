"use client";

import { useEffect, useMemo, useState } from "react";
import { BaseConverter } from "@/game/BaseConverter";
import { BaseSlider } from "@/components/ui/BaseSlider";
import type { Base } from "@/types/game";

interface DivisionStep {
  dividend: number;
  quotient: number;
  remainder: number;
}

function divisionSteps(decimal: number, base: Base): DivisionStep[] {
  if (decimal === 0) return [{ dividend: 0, quotient: 0, remainder: 0 }];
  const steps: DivisionStep[] = [];
  let n = decimal;
  while (n > 0) {
    const quotient = Math.floor(n / base);
    const remainder = n % base;
    steps.push({ dividend: n, quotient, remainder });
    n = quotient;
  }
  return steps;
}

function randomDecimal(base: Base): number {
  const maxDigits = base <= 4 ? 5 : base <= 8 ? 4 : 3;
  const max = Math.min(9999, base ** maxDigits - 1);
  return Math.floor(Math.random() * Math.min(max, 500)) + 1;
}

export function LearnQuiz() {
  const [base, setBase] = useState<Base>(2);
  // Deterministic placeholder so server and client render the same markup;
  // the real random problem is rolled client-side once mounted.
  const [decimal, setDecimal] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0, totalMs: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecimal(randomDecimal(2));
    setStartedAt(Date.now());
  }, []);

  const correctDigits = useMemo(() => BaseConverter.toBaseDigits(decimal, base).join(""), [decimal, base]);
  const steps = useMemo(() => divisionSteps(decimal, base), [decimal, base]);

  const validChars = "0123456789ABCDEF".slice(0, base).split("");

  const nextRound = (nextBase: Base = base) => {
    setBase(nextBase);
    setDecimal(randomDecimal(nextBase));
    setInput("");
    setResult(null);
    setStartedAt(Date.now());
  };

  const submit = () => {
    if (!input) return;
    const isCorrect = input.toUpperCase() === correctDigits;
    const elapsedMs = Date.now() - startedAt;
    setStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      totalMs: s.totalMs + elapsedMs,
    }));
    setResult(isCorrect ? "correct" : "incorrect");
  };

  const avgSeconds = stats.total > 0 ? (stats.totalMs / stats.total / 1000).toFixed(1) : "-";
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 1000) / 10 : 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between rounded-2xl bg-cream-soft px-4 py-3.5">
        <MiniStat label="정답률" value={`${accuracy}%`} success />
        <MiniStat label="평균 시간" value={`${avgSeconds}s`} />
        <MiniStat label="문제 수" value={`${stats.total}`} />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between">
          <h2 className="font-display text-[13px] font-bold text-ink">목표 진법</h2>
          <span className="font-display text-sm font-extrabold text-teal">{base}진수</span>
        </div>
        <BaseSlider value={base} min={2} max={16} onChange={(v) => nextRound(v as Base)} accent="teal" />
      </div>

      <div className="rounded-[20px] bg-navy px-6 py-7 text-center">
        <div className="text-xs font-bold text-navy-text-muted">10진수</div>
        <div className="font-mono text-[44px] font-extrabold text-white">{decimal}</div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-ink">{base}진수로 변환해서 입력하세요</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={result !== null}
          className="rounded-2xl border-2 border-cream-border bg-cream-soft px-4 py-3.5 font-mono text-[13px] font-bold tracking-widest text-ink-muted outline-none focus:border-teal"
          placeholder={`허용 문자: ${validChars.join(", ")}`}
        />
        {result === null ? (
          <button
            onClick={submit}
            className="rounded-2xl py-3.5 font-display text-base font-extrabold text-white shadow-[0_5px_0_var(--color-teal-shadow)] transition-transform active:translate-y-0.5 active:shadow-none"
            style={{ background: "linear-gradient(180deg, var(--color-teal-strong), var(--color-teal-dark))" }}
          >
            확인
          </button>
        ) : (
          <button
            onClick={() => nextRound()}
            className="rounded-2xl bg-cream-softer py-3.5 font-display text-base font-extrabold text-ink transition-opacity active:opacity-80"
          >
            다음 문제
          </button>
        )}
      </div>

      {result && (
        <div className={`rounded-2xl p-4 ${result === "correct" ? "bg-teal/10" : "bg-rose-950/10"}`}>
          <p className={`mb-3 font-display font-bold ${result === "correct" ? "text-teal" : "text-rose-500"}`}>
            {result === "correct" ? "정답입니다!" : `오답입니다. 정답: ${correctDigits}`}
          </p>
          <div className="space-y-1 font-mono text-sm font-bold text-ink-muted">
            {steps.map((step, i) => (
              <div key={i}>
                {step.dividend} ÷ {base} = {step.quotient} 나머지{" "}
                <span className="text-coral">{BaseConverter.digitToSymbol(step.remainder)}</span>
              </div>
            ))}
            <div className="pt-1 text-ink">
              → 나머지를 아래에서 위로 읽으면 <span className="font-bold text-coral">{correctDigits}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <span className="text-xs font-bold text-ink-muted">
      {label} <span className={`font-mono ${success ? "text-success" : "text-teal"}`}>{value}</span>
    </span>
  );
}
