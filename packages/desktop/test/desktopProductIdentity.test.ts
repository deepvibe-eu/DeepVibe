import assert from "node:assert/strict";
import test from "node:test";
import {
  isDeepSeekIdentityRequested,
  resolveDesktopProductFlavor,
  resolveDesktopProductIdentity,
  resolveLinuxExecutableNameForFlavor,
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

test("LamaVibe wird über ZCODE_LAMA_IDENTITY=1 gewählt", () => {
  const env = { ZCODE_ENV: "production", ZCODE_LAMA_IDENTITY: "1" };
  assert.equal(resolveDesktopProductFlavor(env), "lama");
  const identity = resolveDesktopProductIdentity(env);
  assert.equal(identity.appId, "eu.lamavibe.ide");
  assert.equal(identity.productName, "LamaVibe");
  assert.equal(identity.linuxExecutableName, "lamavibe");
});

test("Kimi hat Vorrang vor Lama", () => {
  const env = {
    ZCODE_ENV: "production",
    ZCODE_KIMI_IDENTITY: "1",
    ZCODE_LAMA_IDENTITY: "1",
  };
  assert.equal(resolveDesktopProductFlavor(env), "kimi");
});

test("ohne Schalter bleibt die bisherige Auflösung erhalten", () => {
  assert.equal(resolveDesktopProductFlavor({ ZCODE_ENV: "production" }), "production");
  assert.equal(resolveDesktopProductFlavor({ ZCODE_ENV: "test" }), "preview");
});

test("ungültiger DeepSeek-Schalter schlägt im Build fehl", () => {
  assert.throws(() => isDeepSeekIdentityRequested({ ZCODE_DEEPSEEK_IDENTITY: "yes" }));
});

test("resolveLinuxExecutableNameForFlavor nutzt den Flavor, nicht process.env", () => {
  assert.equal(resolveLinuxExecutableNameForFlavor("kimi"), "kimivibe");
  assert.equal(resolveLinuxExecutableNameForFlavor("lama"), "lamavibe");
  assert.equal(resolveLinuxExecutableNameForFlavor("deepseek"), "deepvibe-deepseek");
  assert.equal(resolveLinuxExecutableNameForFlavor("preview"), "deepvibe-preview");
  assert.equal(resolveLinuxExecutableNameForFlavor("production"), "deepvibe");
  assert.equal(resolveLinuxExecutableNameForFlavor("unbekannt"), "deepvibe");
});
