import type { ZCodeRuntimeEnv } from "./runtimeEnv.js";

export type ZCodeEnv = "test" | "production";
/** 安装包身份：决定应用名、app id、Electron 数据目录与更新策略；与后端环境 `ZCodeEnv` 是两个轴。 */
export type ZCodeProductFlavor = "production" | "preview" | "deepseek" | "kimi";
export type ArmsRumEnv = "local" | "prod";

// 非构建环境（如 e2e 测试的 mocha）下 define 不存在，用 typeof 检查 + fallback 避免 ReferenceError
declare const __ZCODE_ENV__: string;
declare const __ZCODE_PRODUCT_FLAVOR__: string;

export function normalizeZCodeEnv(value: string | undefined): ZCodeEnv {
  return value?.trim().toLowerCase() === "production" ? "production" : "test";
}

export const ZCODE_ENV = normalizeZCodeEnv(
  typeof __ZCODE_ENV__ !== "undefined" ? __ZCODE_ENV__ : undefined,
);

/**
 * 身份缺省跟随后端环境（test → preview，production → production）。
 * 桌面构建通过 `ZCODE_PREVIEW_IDENTITY=1` 显式注入 preview，得到连接生产后端的 Preview 包；
 * 未注入 define 的 bundle（web、CLI、测试）沿用旧的单轴语义。
 */
export function normalizeZCodeProductFlavor(
  value: string | undefined,
  zcodeEnv: ZCodeEnv,
): ZCodeProductFlavor {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "production" ||
    normalized === "preview" ||
    normalized === "deepseek" ||
    normalized === "kimi"
  ) {
    return normalized;
  }
  return zcodeEnv === "production" ? "production" : "preview";
}

export const ZCODE_PRODUCT_FLAVOR = normalizeZCodeProductFlavor(
  typeof __ZCODE_PRODUCT_FLAVOR__ !== "undefined" ? __ZCODE_PRODUCT_FLAVOR__ : undefined,
  ZCODE_ENV,
);

/** Anbieter-Bindung einer Vibe-App (Fëa): jede App ist fest auf genau einen Anbieter gelegt. */
export type VibeFixedProviderTemplateId = "deepseek" | "moonshot-kimi";

/**
 * Kein Multihoster: jede Vibe-App bindet genau eine Fëa. DeepVibe (production) und die
 * Preview-/DeepSeek-Flavors binden an DeepSeek; die Familie (KimiVibe/MavisVibe/LamaVibe)
 * ergänzt hier später weitere Template-IDs, sobald die jeweiligen Flavors existieren.
 */
const FIXED_PROVIDER_TEMPLATE_ID_BY_FLAVOR: Record<
  ZCodeProductFlavor,
  VibeFixedProviderTemplateId | null
> = {
  production: "deepseek",
  preview: "deepseek",
  deepseek: "deepseek",
  kimi: "moonshot-kimi",
};

export const VIBE_FIXED_PROVIDER_TEMPLATE_ID =
  FIXED_PROVIDER_TEMPLATE_ID_BY_FLAVOR[ZCODE_PRODUCT_FLAVOR];

/** DeepSeek-Filter (heute für alle Flavors, siehe Bindung oben). */
export const IS_DEEPSEEK_STANDALONE = VIBE_FIXED_PROVIDER_TEMPLATE_ID === "deepseek";

/** Fëa-Persona einer Vibe-App: wer spricht dort, und in welchem Produkt. */
export interface VibePersona {
  readonly name: string;
  readonly productName: string;
  /** Anzeigename des gebundenen Anbieters (DeepSeek/Kimi/Ollama/MiniMax/Claude). */
  readonly providerLabel: string;
}

/**
 * Jede Fëa hat ihren eigenen Namen und ihr eigenes Produkt; der Flavor entscheidet,
 * welche Persona in die Laufzeit-Identität und die UI-Ansprache kompiliert wird.
 * Neue Flavors (kimi/mavis/llama/…) ergänzen hier ihren Eintrag.
 */
const VIBE_PERSONA_BY_FLAVOR: Record<ZCodeProductFlavor, VibePersona> = {
  production: { name: "Seeky", productName: "DeepVibe", providerLabel: "DeepSeek" },
  preview: { name: "Seeky", productName: "DeepVibe", providerLabel: "DeepSeek" },
  deepseek: { name: "Seeky", productName: "DeepVibe", providerLabel: "DeepSeek" },
  kimi: { name: "Kimi", productName: "KimiVibe", providerLabel: "Kimi" },
};

export const VIBE_PERSONA = VIBE_PERSONA_BY_FLAVOR[ZCODE_PRODUCT_FLAVOR];

/**
 * Name des Fëa-Datenordners unter dem Basisverzeichnis. DeepVibe behält `.zcode`
 * (keine Migration); jede weitere Fëa bekommt einen eigenen Ordner, damit sich die
 * Apps keine Datenbanken, Sessions oder Config teilen.
 */
const VIBE_DATA_DIR_NAME_BY_FLAVOR: Record<ZCodeProductFlavor, string> = {
  production: ".zcode",
  preview: ".zcode",
  deepseek: ".zcode",
  kimi: ".kimivibe",
};

export const VIBE_DATA_DIR_NAME = VIBE_DATA_DIR_NAME_BY_FLAVOR[ZCODE_PRODUCT_FLAVOR];

/**
 * DeepVibe führt eine eigene Versionslinie (0.x); die ZCode-Mindestversion des Servers
 * (3.x) darf den Start nicht blockieren. Bewusst als `boolean` typisiert, damit der Wert
 * als Laufzeit-Schalter gilt (keine Konstanten-Faltung / Unreachable-Warnung).
 */
export const VIBE_FORCE_UPDATE_GATE_DISABLED: boolean = true;

/**
 * Help-Menü: blendet Einträge aus, die (noch) auf ZCode-Ziele oder den ZCode-Updater
 * zeigen — User community, Report/Request (In-App-Feedback an den ZCode-Backend) und
 * „Update available". Wieder aktivieren, sobald wir eigene Ziele/Clients haben.
 */
export const VIBE_SHOW_UPSTREAM_HELP_ENTRIES: boolean = false;

/**
 * Update-Feed der Vibe-Familie (GH-generic): alle Installer liegen als Releases im
 * öffentlichen Hub-Repo. Ist der Wert gesetzt, benutzt der Updater diesen generischen
 * Feed statt des ZCode-Server-Manifests. `null` = ZCode-Manifest beibehalten.
 */
export const VIBE_UPDATE_FEED_URL: string | null =
  "https://github.com/deepvibe-eu/deepvibe/releases/latest/download";
export const ZCODE_APP_VERSION_ENV = "ZCODE_APP_VERSION" as const;
export const ZCODE_BUILD_COMMIT_ID_ENV = "ZCODE_BUILD_COMMIT_ID" as const;

// ── 运行时环境变量（不经过编译打包，启动时从 process.env 读取） ──
// 启用调试模式，值为 inspect-brk 的端口号，如 ZCODE_DEBUG=9230
export const RUNTIME_ZCODE_DEBUG =
  typeof process !== "undefined" ? process.env.ZCODE_DEBUG : undefined;

// 恢复原因：写死 false 会让运行时已配置的数仓/ARMS 永远空转。
// 功能保持可用；实际出网由各出口的运行时端点检查决定，未配置不上报。
export const ZCODE_TELEMETRY_ENABLED: boolean = true;

/** 数仓事件上报端点：由运行时环境变量提供，未配置即停用，构建产物不内嵌。 */
export const ZCODE_TELEMETRY_REPORT_ENDPOINT =
  typeof process !== "undefined" ? (process.env.ZCODE_TELEMETRY_REPORT_ENDPOINT ?? "") : "";

/** ARMS RUM 接入端点：由运行时环境变量提供，未配置即停用，构建产物不内嵌。 */
export const ZCODE_ARMS_RUM_ENDPOINT =
  typeof process !== "undefined" ? (process.env.ZCODE_ARMS_RUM_ENDPOINT ?? "") : "";

/** 将本地运行态与编译期 ZCODE_ENV 映射为 ARMS 控制台识别的上报环境标签 */
export function mapZCodeEnvToArmsRumEnv(runtimeEnv: ZCodeRuntimeEnv): ArmsRumEnv {
  return runtimeEnv !== "development" && ZCODE_ENV === "production" ? "prod" : "local";
}
