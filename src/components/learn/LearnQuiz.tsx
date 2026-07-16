"use client";

import { useEffect, useMemo, useState } from "react";
import { BaseConverter } from "@/game/BaseConverter";
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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
        <span>
          정답률 <span className="font-mono text-orange-400">{accuracy}%</span>
        </span>
        <span>
          평균 시간 <span className="font-mono text-orange-400">{avgSeconds}s</span>
        </span>
        <span>
          문제 수 <span className="font-mono text-orange-400">{stats.total}</span>
        </span>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-400">목표 진법: {base}진수</h2>
        <input
          type="range"
          min={2}
          max={16}
          value={base}
          onChange={(e) => nextRound(Number(e.target.value) as Base)}
          className="w-full accent-orange-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <div className="text-xs text-slate-500">10진수</div>
        <div className="font-mono text-4xl font-bold">{decimal}</div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">{base}진수로 변환해서 입력하세요</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={result !== null}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-lg tracking-widest outline-none focus:border-orange-500"
          placeholder={`허용 문자: ${validChars.join(", ")}`}
        />
        {result === null ? (
          <button
            onClick={submit}
            className="rounded-lg bg-orange-500 py-2 font-semibold text-white transition-colors hover:bg-orange-400"
          >
            확인
          </button>
        ) : (
          <button
            onClick={() => nextRound()}
            className="rounded-lg bg-slate-800 py-2 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            다음 문제
          </button>
        )}
      </div>

      {result && (
        <div
          className={`rounded-xl border p-4 ${
            result === "correct" ? "border-emerald-700 bg-emerald-950/40" : "border-rose-700 bg-rose-950/40"
          }`}
        >
          <p className={`mb-3 font-semibold ${result === "correct" ? "text-emerald-400" : "text-rose-400"}`}>
            {result === "correct" ? "정답입니다!" : `오답입니다. 정답: ${correctDigits}`}
          </p>
          <div className="space-y-1 font-mono text-sm text-slate-400">
            {steps.map((step, i) => (
              <div key={i}>
                {step.dividend} ÷ {base} = {step.quotient} 나머지{" "}
                <span className="text-orange-400">{BaseConverter.digitToSymbol(step.remainder)}</span>
              </div>
            ))}
            <div className="pt-1 text-slate-300">
              → 나머지를 아래에서 위로 읽으면{" "}
              <span className="font-bold text-orange-400">{correctDigits}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
