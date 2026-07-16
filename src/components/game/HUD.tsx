import type { Base, ScoreState } from "@/types/game";

interface HUDProps {
  scoreState: ScoreState;
  base: Base;
  secondsRemaining: number | null;
  elapsedSeconds: number;
}

export function HUD({ scoreState, base, secondsRemaining, elapsedSeconds }: HUDProps) {
  const timeLabel = secondsRemaining !== null ? `${Math.ceil(secondsRemaining)}초` : `${Math.floor(elapsedSeconds)}초`;

  return (
    <div className="flex items-center justify-between px-6 py-3 text-sm sm:text-base">
      <div className="flex gap-6">
        <Stat label="점수" value={scoreState.score.toLocaleString()} />
        <Stat label="콤보" value={`${scoreState.combo}`} accent={scoreState.combo > 0} />
        <Stat label="정확도" value={`${scoreState.accuracy}%`} />
      </div>
      <div className="flex gap-6">
        <Stat label="시간" value={timeLabel} />
        <Stat label={`${base}진수`} value="BASE" accent />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-mono text-lg font-bold ${accent ? "text-orange-400" : "text-slate-100"}`}>{value}</div>
    </div>
  );
}
