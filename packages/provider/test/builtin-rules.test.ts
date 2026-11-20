import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseZCodeBuiltinProviderConfigRules } from "../src/config/schema.js";

const bundled = JSON.parse(
  readFileSync(new URL("../../../config/provider/zcode-builtin.json", import.meta.url), "utf8"),
) as {
  config: {
    providerConfigRules: {
      providerRules: Array<Record<string, unknown>>;
      templateRules: Array<Record<string, unknown>>;
    };
  };
};

test("unknown builtin provider rules are skipped, valid ones survive", () => {
  const valid = bundled.config.providerConfigRules.providerRules[0]!;
  const invalid = structuredClone(valid) as {
    providerId: string;
    config: { access: unknown };
  };
  invalid.providerId = "builtin:future-plan";
  invalid.config.access = {
    type: "zhipu-account",
    accountType: "zai",
    mode: "future-plan",
  };

  const parsed = parseZCodeBuiltinProviderConfigRules({
    providerRules: [valid, invalid],
    templateRules: [],
  });
  assert.deepEqual(parsed.providers.keys(), [String(valid.providerId)]);
});

test("the bundled provider config still parses completely", () => {
  const rules = bundled.config.providerConfigRules;
  const parsed = parseZCodeBuiltinProviderConfigRules(rules);
  assert.equal(parsed.providers.keys().length, rules.providerRules.length);
  assert.equal(parsed.providerTemplates.keys().length, rules.templateRules.length);
});
