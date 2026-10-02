import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveDesktopProductFlavor } from "./desktop-product-identity.mjs";

/**
 * 每个 Vibe-Flavor 自己的版本行。DeepVibe 系列（production/preview/deepseek）继续使用
 * 根 package.json 的 version，不在这里登记；KimiVibe 等后续 Flavor 在此显式登记，
 * 这样单个 Flavor 发版不再强制其它 Flavor 一起改版本。
 */
export const FLAVOR_VERSIONS_RELATIVE_PATH = "flavors/versions.json";

/** 显式构建期覆盖，发布 workflow 用它把 tag 版本传给构建（见 docs/flavor-versioning.md）。 */
export const ZCODE_APP_VERSION_BUILD_ENV = "ZCODE_APP_VERSION";

/** 去掉 tag 前缀，如 `kimivibe-v1.0.2` / `v1.0.2` → `1.0.2`；空值返回 `unknown`。 */
export function normalizeAppVersion(version) {
  if (typeof version !== "string" || version.trim() === "") {
    return "unknown";
  }
  const trimmed = version.trim();
  const normalized = trimmed.replace(/^[^\d]*/, "");
  return normalized || trimmed;
}

export function readFlavorVersionOverrides(workspaceDir) {
  const filePath = resolve(workspaceDir, FLAVOR_VERSIONS_RELATIVE_PATH);
  if (!existsSync(filePath)) {
    return {};
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Invalid ${FLAVOR_VERSIONS_RELATIVE_PATH}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `Invalid ${FLAVOR_VERSIONS_RELATIVE_PATH}: expected a JSON object mapping flavor to version`,
    );
  }

  const overrides = {};
  for (const [flavor, version] of Object.entries(parsed)) {
    if (typeof version !== "string" || version.trim() === "") {
      throw new Error(
        `Invalid version for flavor "${flavor}" in ${FLAVOR_VERSIONS_RELATIVE_PATH}: expected a non-empty string`,
      );
    }
    overrides[flavor] = version.trim();
  }
  return overrides;
}

export function resolveDesktopProductVersion({
  flavor,
  rootVersion,
  overrides = {},
  explicitVersion,
}) {
  const explicit = explicitVersion?.trim();
  if (explicit) {
    return explicit;
  }
  const override = overrides[flavor]?.trim();
  if (override) {
    return override;
  }
  return rootVersion;
}

/** 解析当前构建应当使用的 Flavor 版本（显式覆盖 > 登记版本 > 根 package.json）。 */
export function resolveDesktopProductVersionFromEnvironment({
  workspaceDir,
  rootVersion,
  env = process.env,
}) {
  const flavor = resolveDesktopProductFlavor(env);
  return {
    flavor,
    version: resolveDesktopProductVersion({
      flavor,
      rootVersion,
      overrides: readFlavorVersionOverrides(workspaceDir),
      explicitVersion: env[ZCODE_APP_VERSION_BUILD_ENV],
    }),
  };
}
