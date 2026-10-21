import assert from "node:assert/strict";
import { test } from "node:test";
import type { CompactModelMessage } from "../src/compact/manual.js";
import {
  DEFAULT_AUTOCOMPACT_THRESHOLD_PERCENT,
  DEFAULT_AGENT_COMPACT_FLOOR_PERCENT,
  getAgentCompactFloorTokens,
  getAutoCompactThreshold,
  getAutoCompactThresholdPercent,
  getEffectiveContextWindowSize,
  shouldAllowAgentCompact,
  shouldAutoCompact,
} from "../src/compact/policy.js";

const WINDOW = 1_000_000;
const MAX_OUTPUT = 32_000;
const EFFECTIVE = 979_000;

const conversation: CompactModelMessage[] = [
  { role: "user", content: "hi" },
  { role: "assistant", content: "hello" },
  { role: "user", content: "more" },
  { role: "assistant", content: "sure" },
];

test("effective window subtracts the capped output reserve", () => {
  assert.equal(
    getEffectiveContextWindowSize({ contextWindow: WINDOW, maxOutputTokens: MAX_OUTPUT }),
    EFFECTIVE,
  );
});

test("threshold percent defaults to 80 and clamps overrides", () => {
  assert.equal(getAutoCompactThresholdPercent(), DEFAULT_AUTOCOMPACT_THRESHOLD_PERCENT);
  assert.equal(getAutoCompactThresholdPercent({ thresholdPercentOverride: 90 }), 90);
  assert.equal(getAutoCompactThresholdPercent({ thresholdPercentOverride: 150 }), 100);
  assert.equal(getAutoCompactThresholdPercent({ thresholdPercentOverride: 0 }), 1);
});

test("threshold is the earlier of percent and buffer cap", () => {
  const threshold = getAutoCompactThreshold({
    contextWindow: WINDOW,
    maxOutputTokens: MAX_OUTPUT,
  });
  assert.equal(threshold, Math.floor((EFFECTIVE * DEFAULT_AUTOCOMPACT_THRESHOLD_PERCENT) / 100));
  assert.ok(threshold < EFFECTIVE);
});

test("auto compaction reports its reason instead of compacting early", () => {
  const config = { contextWindow: WINDOW, maxOutputTokens: MAX_OUTPUT };
  assert.equal(shouldAutoCompact({ messages: [], config }).reason, "not_enough_messages");
  assert.equal(shouldAutoCompact({ messages: conversation, config }).reason, "below_threshold");
  assert.equal(
    shouldAutoCompact({ messages: conversation, config: { ...config, enabled: false } }).reason,
    "disabled",
  );
  assert.equal(
    shouldAutoCompact({
      messages: conversation,
      config,
      tokenOverride: { source: "provider_usage", tokenCount: EFFECTIVE },
    }).shouldCompact,
    true,
  );
});

test("agent compaction honours the floor and the per-task switch", () => {
  const config = { contextWindow: WINDOW, maxOutputTokens: MAX_OUTPUT };
  const floor = getAgentCompactFloorTokens(config);
  assert.equal(floor, Math.floor((EFFECTIVE * DEFAULT_AGENT_COMPACT_FLOOR_PERCENT) / 100));

  assert.equal(shouldAllowAgentCompact({ messages: [], config }).reason, "not_enough_messages");

  assert.equal(
    shouldAllowAgentCompact({
      messages: conversation,
      config,
      tokenOverride: { source: "estimate", tokenCount: floor - 1 },
    }).reason,
    "below_floor",
  );

  assert.equal(
    shouldAllowAgentCompact({
      messages: conversation,
      config,
      tokenOverride: { source: "estimate", tokenCount: floor },
    }).allowed,
    true,
  );

  assert.equal(
    shouldAllowAgentCompact({
      messages: conversation,
      config: { ...config, agentCompactEnabled: false },
      tokenOverride: { source: "estimate", tokenCount: floor },
    }).reason,
    "disabled",
  );

  assert.equal(
    shouldAllowAgentCompact({
      messages: conversation,
      config,
      tokenOverride: { source: "estimate", tokenCount: floor },
      rateLimited: true,
    }).reason,
    "rate_limited",
  );

  assert.equal(
    shouldAllowAgentCompact({
      messages: conversation,
      config,
      tokenOverride: { source: "estimate", tokenCount: floor },
      consecutiveFailures: 3,
    }).reason,
    "circuit_breaker",
  );
});
