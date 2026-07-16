import type { Base, DigitProblem } from "@/types/game";

const DIGIT_SYMBOLS = "0123456789ABCDEF";

/**
 * Pure, stateless conversion + problem-generation helpers for arbitrary
 * bases 2-16. Kept independent of the game loop / React so it can be
 * reused by both the rhythm engine and the base-learning mode.
 */
export class BaseConverter {
  static isValidBase(base: number): base is Base {
    return Number.isInteger(base) && base >= 2 && base <= 16;
  }

  static digitToSymbol(digit: number): string {
    if (digit < 0 || digit > 15) throw new RangeError(`digit out of range: ${digit}`);
    return DIGIT_SYMBOLS[digit];
  }

  static symbolToDigit(symbol: string): number {
    const index = DIGIT_SYMBOLS.indexOf(symbol.toUpperCase());
    if (index === -1) throw new RangeError(`invalid digit symbol: ${symbol}`);
    return index;
  }

  static toBaseDigits(decimal: number, base: Base): string[] {
    if (decimal === 0) return ["0"];
    const digits: string[] = [];
    let n = Math.floor(Math.abs(decimal));
    while (n > 0) {
      digits.unshift(BaseConverter.digitToSymbol(n % base));
      n = Math.floor(n / base);
    }
    return digits;
  }

  static fromBaseDigits(digits: string[], base: Base): number {
    return digits.reduce((acc, d) => acc * base + BaseConverter.symbolToDigit(d), 0);
  }

  /** Generates a random decimal value that renders to `digitCount` digits in `base`. */
  static randomValueForDigitCount(base: Base, digitCount: number): number {
    const min = digitCount === 1 ? 0 : base ** (digitCount - 1);
    const max = base ** digitCount - 1;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  static generateProblem(base: Base, digitCount: number): DigitProblem {
    const decimalValue = BaseConverter.randomValueForDigitCount(base, digitCount);
    return {
      id: crypto.randomUUID(),
      base,
      decimalValue,
      digits: BaseConverter.toBaseDigits(decimalValue, base),
    };
  }

  /** Number of adjacent digit pairs that differ, used for the completion-bonus formula. */
  static countTransitions(digits: string[]): number {
    let count = 0;
    for (let i = 0; i < digits.length - 1; i++) {
      if (digits[i] !== digits[i + 1]) count++;
    }
    return count;
  }
}
