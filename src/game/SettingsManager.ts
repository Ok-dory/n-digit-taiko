import type { KeyBindingMap } from "@/types/game";

const BINDINGS_STORAGE_KEY = "n-digit-taiko:key-bindings";
const PLAYER_NAME_STORAGE_KEY = "n-digit-taiko:player-name";

/** KeyboardEvent.code values, keyed by digit symbol 0-9, A-F. */
export const DEFAULT_KEY_BINDINGS: KeyBindingMap = {
  "0": "Digit0",
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  A: "KeyA",
  B: "KeyB",
  C: "KeyC",
  D: "KeyD",
  E: "KeyE",
  F: "KeyF",
};

/**
 * Persists user preferences (key bindings, player name) to localStorage.
 * Pure data access — no React, no game logic.
 */
export class SettingsManager {
  static loadKeyBindings(): KeyBindingMap {
    if (typeof window === "undefined") return { ...DEFAULT_KEY_BINDINGS };
    try {
      const raw = window.localStorage.getItem(BINDINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_KEY_BINDINGS };
      const parsed = JSON.parse(raw) as KeyBindingMap;
      return { ...DEFAULT_KEY_BINDINGS, ...parsed };
    } catch {
      return { ...DEFAULT_KEY_BINDINGS };
    }
  }

  static saveKeyBindings(bindings: KeyBindingMap): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(BINDINGS_STORAGE_KEY, JSON.stringify(bindings));
  }

  static resetKeyBindings(): KeyBindingMap {
    SettingsManager.saveKeyBindings(DEFAULT_KEY_BINDINGS);
    return { ...DEFAULT_KEY_BINDINGS };
  }

  static setBinding(action: string, code: string): KeyBindingMap {
    const current = SettingsManager.loadKeyBindings();
    const updated = { ...current, [action]: code };
    SettingsManager.saveKeyBindings(updated);
    return updated;
  }

  static loadPlayerName(): string {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "";
  }

  static savePlayerName(name: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
  }
}
