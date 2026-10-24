import assert from "node:assert/strict";
import { test } from "node:test";
import {
  completeNewModelSelection,
  preferredReasoningLevel,
} from "../src/model-selection-config.js";

function registry(values: readonly string[]) {
  return {
    providers: [
      {
        providerId: "deepseek",
        models: [
          {
            modelId: "deepseek-flash",
            config: { optionSpecs: { reasoningLevel: { values } } },
          },
        ],
      },
    ],
  };
}

test("new selections prefer high over max", () => {
  assert.equal(preferredReasoningLevel(["disabled", "low", "high", "max"]), "high");
});

test("falls back to medium, then low, then the highest known level", () => {
  assert.equal(preferredReasoningLevel(["low", "medium"]), "medium");
  assert.equal(preferredReasoningLevel(["low"]), "low");
  assert.equal(preferredReasoningLevel(["disabled", "max"]), "max");
});

test("completeNewModelSelection uses the preferred level", () => {
  const selection = completeNewModelSelection(registry(["disabled", "low", "high", "max"]), {
    providerId: "deepseek",
    modelId: "deepseek-flash",
  });
  assert.deepEqual(selection, {
    providerId: "deepseek",
    modelId: "deepseek-flash",
    options: { reasoningLevel: "high" },
  });
});
