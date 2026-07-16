"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COUNTDOWN_START = 3;
const TICK_MS = 1000;

/** 3-2-1 countdown before the round starts, matching the original's countdown state. */
export function CountdownOverlay({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (count <= 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [count, onDone]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.4 }}
          className="text-9xl font-extrabold text-orange-400"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
