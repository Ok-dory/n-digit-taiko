import Link from "next/link";
import { LearnQuiz } from "@/components/learn/LearnQuiz";

export default function LearnPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">진법 학습 모드</h1>
        <div className="w-10" />
      </div>
      <p className="text-center text-sm text-slate-400">
        10진수를 원하는 진법으로 변환해보세요. 제출 즉시 변환 과정과 정답 여부를 확인할 수 있습니다.
      </p>
      <LearnQuiz />
    </main>
  );
}
