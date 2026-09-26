import assert from "node:assert/strict";
import test from "node:test";
import {
  isDeepSeekIdentityRequested,
  resolveDesktopProductFlavor,
  resolveDesktopProductIdentity,
} from "../scripts/desktop-product-identity.mjs";

test("DeepSeek-Standalone wird über ZCODE_DEEPSEEK_IDENTITY=1 gewählt", () => {
  const env = { ZCODE_ENV: "production", ZCODE_DEEPSEEK_IDENTITY: "1" };
  assert.equal(resolveDesktopProductFlavor(env), "deepseek");
  const identity = resolveDesktopProductIdentity(env);
  assert.equal(identity.appId, "eu.deepvibe.ide.deepseek");
  assert.equal(identity.productName, "DeepVibe DeepSeek");
  assert.equal(identity.linuxExecutableName, "deepvibe-deepseek");
});

test("Preview-Identität hat Vorrang vor DeepSeek", () => {
  const env = {
    ZCODE_ENV: "production",
    ZCODE_PREVIEW_IDENTITY: "1",
    ZCODE_DEEPSEEK_IDENTITY: "1",
  };
  assert.equal(resolveDesktopProductFlavor(env), "preview");
});

test("ohne Schalter bleibt die bisherige Auflösung erhalten", () => {
  assert.equal(resolveDesktopProductFlavor({ ZCODE_ENV: "production" }), "production");
  assert.equal(resolveDesktopProductFlavor({ ZCODE_ENV: "test" }), "preview");
});

test("ungültiger DeepSeek-Schalter schlägt im Build fehl", () => {
  assert.throws(() => isDeepSeekIdentityRequested({ ZCODE_DEEPSEEK_IDENTITY: "yes" }));
});
