"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BonusEvent } from "@/game/GameEngine";

export function BonusFlash({ bonus }: { bonus: BonusEvent | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
      <AnimatePresence mode="wait">
        {bonus && (bonus.points > 0 || bonus.seconds > 0) && (
          <motion.div
            key={bonus.timestamp}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1.15, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1 font-display text-gold drop-shadow"
          >
            {bonus.points > 0 && <span className="text-3xl font-extrabold">+{bonus.points}</span>}
            {bonus.seconds > 0 && <span className="text-xl font-bold">+{bonus.seconds}초</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
