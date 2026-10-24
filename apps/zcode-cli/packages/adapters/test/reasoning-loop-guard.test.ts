import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createReasoningLoopGuard,
  ReasoningLoopDetectedError,
} from "../src/model/reasoning-loop-guard.js";

function feed(chunks: string[], guard: ReturnType<typeof createReasoningLoopGuard>): boolean {
  let detected = false;
  for (const chunk of chunks) {
    detected = guard.observe(chunk) || detected;
  }
  return detected;
}

test("detects a contiguous 'The. The.' degeneration", () => {
  const guard = createReasoningLoopGuard();
  const chunks = Array.from({ length: 40 }, () => "The. ".repeat(2));
  assert.equal(feed(chunks, guard), true);
});

test("detects a dense interleaved repetition", () => {
  const guard = createReasoningLoopGuard();
  const chunks = Array.from({ length: 60 }, () => "The. ab ");
  assert.equal(feed(chunks, guard), true);
});

test("does not fire on normal prose", () => {
  const prose = [
    "Ich habe die Datei gelesen und den Fehler gefunden. ",
    "The handler checks the tool result before it writes. ",
    "Danach habe ich den Test ausgeführt und die Ausgabe geprüft. ",
    "The loop appears only when the model repeats one word. ",
    "Die nächste Aktion ist ein konkreter Tool-Aufruf. ",
  ].join("");
  const guard = createReasoningLoopGuard();
  assert.equal(feed(prose.repeat(6).match(/.{1,20}/g) ?? [], guard), false);
});

test("does not fire on repeated punctuation or separators", () => {
  const guard = createReasoningLoopGuard();
  assert.equal(feed(["-----".repeat(30), "| --- | --- |\n".repeat(30)], guard), false);
});

test("the error asks core to discard partial output and retry", () => {
  const error = new ReasoningLoopDetectedError("The. The.");
  assert.equal(error.retryable, true);
  assert.equal(error.code, "reasoning_loop_detected");
});

