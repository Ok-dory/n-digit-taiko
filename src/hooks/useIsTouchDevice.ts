"use client";

import { useEffect, useState } from "react";

/**
 * True for touch-primary devices (phones/tablets), matched via the
 * `pointer: coarse` media feature — the standard signal for "no precise
 * pointer available," independent of viewport width.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isTouch;
}
