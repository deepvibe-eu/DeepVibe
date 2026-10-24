import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  ModelInputMessage,
  ModelMessageContentBlock,
  ModelReasoningContentBlock,
} from "@zcode/contracts";
import { normalizeReasoningHistory } from "../src/model/reasoning-history-normalization.js";

function reasoning(text: string): ModelReasoningContentBlock {
  return {
    type: "reasoning",
    text,
    providerOptions: { anthropic: { signature: "sig" } },
  };
}

function text(value: string): ModelMessageContentBlock {
  return { type: "text", text: value };
}

test("strips reasoning from previous turns but keeps the current turn", () => {
  const messages: ModelInputMessage[] = [
    { role: "user", content: [text("erste Frage")] },
    { role: "assistant", content: [reasoning("alter Loop The. The."), text("Antwort")] },
    { role: "user", content: [text("zweite Frage")] },
    {
      role: "assistant",
      content: [reasoning("aktuelles Denken")],
      toolCalls: [{ id: "tool-1", name: "read", input: { path: "a" } }],
    },
    { role: "tool", content: "ok", toolCallId: "tool-1", toolName: "read" },
  ];

  const normalized = normalizeReasoningHistory(messages);
  const previous = normalized[1]!;
  const current = normalized[3]!;

  assert.deepEqual(previous.content, [text("Antwort")]);
  assert.deepEqual(current.content, [reasoning("aktuelles Denken")]);
});

test("removes previous-turn reasoning even when it was the only content", () => {
  const messages: ModelInputMessage[] = [
    { role: "user", content: [text("erste Frage")] },
    { role: "assistant", content: [reasoning("nur Denken")] },
    { role: "user", content: [text("zweite Frage")] },
    { role: "assistant", content: [text("Antwort")] },
  ];

  const normalized = normalizeReasoningHistory(messages);
  assert.deepEqual(
    normalized.map((message) => message.role),
    ["user", "assistant", "user", "assistant"],
  );
  assert.ok(
    (normalized[1]!.content as ModelMessageContentBlock[]).every(
      (block) => block.type !== "reasoning",
    ),
    "previous-turn reasoning must not be replayed",
  );
});
