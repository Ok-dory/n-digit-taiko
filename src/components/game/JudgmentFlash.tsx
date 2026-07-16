"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { JudgmentEvent } from "@/types/game";

const JUDGMENT_STYLE: Record<JudgmentEvent["judgment"], string> = {
  perfect: "text-sky-400",
  good: "text-emerald-400",
  miss: "text-rose-500",
};

const JUDGMENT_LABEL: Record<JudgmentEvent["judgment"], string> = {
  perfect: "PERFECT",
  good: "GOOD",
  miss: "MISS",
};

export function JudgmentFlash({ event }: { event: JudgmentEvent | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
      <AnimatePresence mode="wait">
        {event && (
          <motion.span
            key={event.timestamp}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1.15, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`text-4xl font-extrabold drop-shadow ${JUDGMENT_STYLE[event.judgment]}`}
          >
            {JUDGMENT_LABEL[event.judgment]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
