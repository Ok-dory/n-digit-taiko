import Link from "next/link";
import { LearnQuiz } from "@/components/learn/LearnQuiz";

export default function LearnPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-0 py-6 sm:px-4 sm:py-12">
      <div className="w-full overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] sm:max-w-[420px] lg:max-w-4xl">
        <div className="flex items-center gap-3 bg-teal px-6 py-5 text-white">
          <Link href="/" className="font-bold">
            ‹
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">진법 학습 모드</h1>
        </div>

        <div className="px-6 py-6">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-5 text-center text-[13px] leading-relaxed font-bold text-ink-muted">
              10진수를 원하는 진법으로 변환해보세요.
              <br />
              제출 즉시 변환 과정과 정답 여부를 확인할 수 있습니다.
            </p>
            <LearnQuiz />
          </div>
        </div>
      </div>
    </main>
  );
}
