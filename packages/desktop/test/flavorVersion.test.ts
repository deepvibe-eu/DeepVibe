import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  normalizeAppVersion,
  readFlavorVersionOverrides,
  resolveDesktopProductVersion,
  resolveDesktopProductVersionFromEnvironment,
} from "../scripts/flavor-version.mjs";

test("normalizeAppVersion entfernt Tag-Präfixe", () => {
  assert.equal(normalizeAppVersion("kimivibe-v1.0.2"), "1.0.2");
  assert.equal(normalizeAppVersion("v1.0.2"), "1.0.2");
  assert.equal(normalizeAppVersion("1.0.1-beta.1"), "1.0.1-beta.1");
  assert.equal(normalizeAppVersion(""), "unknown");
});

test("resolveDesktopProductVersion: explizit > Override > Wurzelversion", () => {
  const overrides = { kimi: "2.0.0" };
  assert.equal(
    resolveDesktopProductVersion({
      flavor: "kimi",
      rootVersion: "1.0.0",
      overrides,
      explicitVersion: "3.0.0",
    }),
    "3.0.0",
  );
  assert.equal(
    resolveDesktopProductVersion({ flavor: "kimi", rootVersion: "1.0.0", overrides }),
    "2.0.0",
  );
  assert.equal(
    resolveDesktopProductVersion({ flavor: "production", rootVersion: "1.0.0", overrides }),
    "1.0.0",
  );
});

test("readFlavorVersionOverrides liest flavors/versions.json", () => {
  const dir = mkdtempSync(join(tmpdir(), "zcode-flavor-version-"));
  try {
    mkdirSync(join(dir, "flavors"));
    writeFileSync(join(dir, "flavors", "versions.json"), '{"kimi":"1.0.1"}');
    assert.deepEqual(readFlavorVersionOverrides(dir), { kimi: "1.0.1" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("readFlavorVersionOverrides schlägt bei ungültigem JSON fehl", () => {
  const dir = mkdtempSync(join(tmpdir(), "zcode-flavor-version-"));
  try {
    mkdirSync(join(dir, "flavors"));
    writeFileSync(join(dir, "flavors", "versions.json"), '{"kimi": 101}');
    assert.throws(() => readFlavorVersionOverrides(dir), /Invalid version for flavor "kimi"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("resolveDesktopProductVersionFromEnvironment wählt Kimi-Override", () => {
  const dir = mkdtempSync(join(tmpdir(), "zcode-flavor-version-"));
  try {
    mkdirSync(join(dir, "flavors"));
    writeFileSync(join(dir, "flavors", "versions.json"), '{"kimi":"1.2.3"}');
    const resolved = resolveDesktopProductVersionFromEnvironment({
      workspaceDir: dir,
      rootVersion: "1.0.0",
      env: { ZCODE_ENV: "production", ZCODE_KIMI_IDENTITY: "1" },
    });
    assert.equal(resolved.flavor, "kimi");
    assert.equal(resolved.version, "1.2.3");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
