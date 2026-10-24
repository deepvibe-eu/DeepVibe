/**
 * Erkennt degenerierendes Reasoning („The. The. The. …") im Stream, bevor der
 * Nutzer abbrechen muss.
 *
 * Zwei Signale:
 * 1. Kontiguierliche Wiederholung einer kurzen Einheit (1–12 Zeichen), z. B.
 *    „The." 24× hintereinander.
 * 2. Dichte Wiederholung: eine 2–8-Zeichen-Einheit belegt ≥ 20 % der letzten
 *    4000 Zeichen und kommt mindestens 40× vor. Das fängt auch Loops, die
 *    zwischendurch anderen Text einstreuen.
 *
 * Der Guard arbeitet auf whitespace-normalisiertem Text; normale Prosa erreicht
 * diese Werte nicht.
 */

export interface ReasoningLoopGuardOptions {
  /** Gesamtlänge der kontiguierlichen Wiederholung in Zeichen. */
  minRepeatChars?: number;
  /** Minimale Anzahl kontiguierlicher Wiederholungen. */
  minRepeats?: number;
  /** Maximale Länge der betrachteten Einheit. */
  maxUnitLength?: number;
  /** Fenster für die Dichte-Erkennung (normalisierte Zeichen). */
  densityWindow?: number;
  /** Minimale Trefferzahl der Dichte-Erkennung. */
  densityMinCount?: number;
  /** Minimaler Anteil des Fensters, den die Einheit belegen muss. */
  densityMinCoverage?: number;
}

const DEFAULTS: Required<ReasoningLoopGuardOptions> = {
  minRepeatChars: 240,
  minRepeats: 24,
  maxUnitLength: 12,
  densityWindow: 4000,
  densityMinCount: 40,
  densityMinCoverage: 0.2,
};

export class ReasoningLoopDetectedError extends Error {
  readonly code = "reasoning_loop_detected";
  /** Core darf die gestreamte Ausgabe verwerfen und vom sicheren Anker neu starten. */
  readonly retryable = true;

  constructor(readonly sample: string) {
    super("Model reasoning fell into a repetition loop.");
    this.name = "ReasoningLoopDetectedError";
  }
}

export interface ReasoningLoopGuard {
  /** true, sobald der bisherige Reasoning-Text degeneriert. */
  observe(delta: string): boolean;
  /** Letzte Zeichen für Logs/Diagnose. */
  sample(): string;
}

export function createReasoningLoopGuard(
  options: ReasoningLoopGuardOptions = {},
): ReasoningLoopGuard {
  const config = { ...DEFAULTS, ...options };
  let normalized = "";
  let raw = "";

  return {
    observe(delta: string): boolean {
      if (!delta) return false;
      raw = (raw + delta).slice(-config.densityWindow);
      // Whitespace ist für die Wiederholung irrelevant: „The. The." und
      // „The.The." sind derselbe Loop.
      normalized = (normalized + delta.replace(/\s+/g, "")).slice(-config.densityWindow);
      return detectsLoop(normalized, config);
    },
    sample(): string {
      return raw.slice(-400);
    },
  };
}

function detectsLoop(tail: string, config: Required<ReasoningLoopGuardOptions>): boolean {
  if (detectsContiguousRun(tail, config)) return true;
  return detectsDensity(tail, config);
}

function detectsContiguousRun(
  tail: string,
  config: Required<ReasoningLoopGuardOptions>,
): boolean {
  const maxUnit = Math.min(config.maxUnitLength, Math.floor(tail.length / config.minRepeats));
  for (let unitLength = 1; unitLength <= maxUnit; unitLength += 1) {
    const unit = tail.slice(-unitLength);
    if (!/[\p{L}\p{N}]/u.test(unit)) continue;

    let count = 1;
    let cursor = tail.length - unitLength;
    while (cursor - unitLength >= 0 && tail.slice(cursor - unitLength, cursor) === unit) {
      count += 1;
      cursor -= unitLength;
      if (count >= config.minRepeats && count * unitLength >= config.minRepeatChars) {
        return true;
      }
    }
    if (count >= config.minRepeats && count * unitLength >= config.minRepeatChars) {
      return true;
    }
  }
  return false;
}

function detectsDensity(tail: string, config: Required<ReasoningLoopGuardOptions>): boolean {
  if (tail.length < config.densityWindow) return false;

  for (let unitLength = 2; unitLength <= 8; unitLength += 1) {
    const unit = tail.slice(-unitLength);
    if (!/[\p{L}\p{N}]/u.test(unit)) continue;

    let count = 0;
    let cursor = 0;
    while (cursor <= tail.length - unitLength) {
      const hit = tail.indexOf(unit, cursor);
      if (hit === -1) break;
      count += 1;
      cursor = hit + unitLength;
    }

    if (
      count >= config.densityMinCount &&
      count * unitLength >= tail.length * config.densityMinCoverage
    ) {
      return true;
    }
  }
  return false;
}
