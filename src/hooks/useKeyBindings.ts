"use client";

import { useCallback, useEffect, useState } from "react";
import { SettingsManager, DEFAULT_KEY_BINDINGS } from "@/game/SettingsManager";
import type { KeyBindingMap } from "@/types/game";

/** Exposes the persisted key bindings and mutators for the settings UI. */
export function useKeyBindings() {
  const [bindings, setBindings] = useState<KeyBindingMap>(DEFAULT_KEY_BINDINGS);

  useEffect(() => {
    // One-time hydration from localStorage after mount (SSR has no window).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBindings(SettingsManager.loadKeyBindings());
  }, []);

  const setBinding = useCallback((action: string, code: string) => {
    setBindings(SettingsManager.setBinding(action, code));
  }, []);

  const reset = useCallback(() => {
    setBindings(SettingsManager.resetKeyBindings());
  }, []);

  return { bindings, setBinding, reset };
}
