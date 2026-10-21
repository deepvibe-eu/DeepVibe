import { DEFAULT_ZCODE_MODEL_CONTEXT_BUDGET_STRATEGY as DEFAULT_BUDGET_STRATEGY } from "@zcode/shared";
import type { CompactModelMessage } from "./manual.js";
import { estimateMessageTokens, hasEnoughMessagesToCompact } from "./manual.js";
import type { LocalMicrocompactPolicyConfig } from "./microcompact.js";

export const DEFAULT_COMPACT_CONTEXT_WINDOW = 200_000;
// 正常请求默认输出已收敛到 32K，auto compact 必须预留同一目标；
// 否则请求预算和压缩窗口会继续按两套常量计算。
export const DEFAULT_AUTOCOMPACT_OUTPUT_RESERVE_TOKENS = 32_000;
const PREFLIGHT_AUTOCOMPACT_OUTPUT_RESERVE_TOKENS = 21_000;
export const MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20_000;
export const AUTOCOMPACT_BUFFER_TOKENS = 13_000;
export const DEFAULT_AUTOCOMPACT_THRESHOLD_PERCENT = 80;
/** Agent-Requests sind erst ab diesem Füllstand erlaubt (Prozent des effektiven Fensters). */
export const DEFAULT_AGENT_COMPACT_FLOOR_PERCENT = 50;
export const MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3;

export interface AutoCompactPolicyConfig {
  enabled?: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  modelContextBudgetStrategy?: "legacy" | "preflight-v1";
  summaryReserveTokens?: number;
  bufferTokens?: number;
  thresholdPercentOverride?: number;
  /** Darf der Agent selbst eine Kompression anfordern? (Per-Task-Schalter, Default an.) */
  agentCompactEnabled?: boolean;
  /** Mindest-Füllstand für Agent-Requests in Prozent des effektiven Fensters. */
  agentCompactFloorPercent?: number;
  maxConsecutiveFailures?: number;
  microcompact?: LocalMicrocompactPolicyConfig;
}

export type AutoCompactTokenSource = "estimate" | "provider_usage";

export interface AutoCompactTokenOverride {
  baseTokenCount?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  contextUsageTokenCount?: number;
  incrementalTokenCount?: number;
  outputTokens?: number;
  source: Extract<AutoCompactTokenSource, "provider_usage">;
  tokenCount: number;
}

export interface AutoCompactDecision {
  shouldCompact: boolean;
  tokenCount: number;
  tokenSource: AutoCompactTokenSource;
  estimatedTokenCount: number;
  providerCacheReadTokens?: number;
  providerCacheWriteTokens?: number;
  providerBaseTokenCount?: number;
  providerContextUsageTokenCount?: number;
  providerIncrementalTokenCount?: number;
  providerOutputTokens?: number;
  threshold: number;
  contextWindow: number;
  effectiveContextWindow: number;
  maxOutputTokens?: number;
  modelContextBudgetStrategy: "legacy" | "preflight-v1";
  outputReserveTokens: number;
  thresholdPercent: number;
  reason:
    | "disabled"
    | "not_enough_messages"
    | "circuit_breaker"
    | "below_threshold"
    | "above_threshold";
}

export function getEffectiveContextWindowSize(config: AutoCompactPolicyConfig = {}): number {
  const contextWindow = positiveInt(config.contextWindow) ?? DEFAULT_COMPACT_CONTEXT_WINDOW;
  // provider 的 context window 是 input + output 共享窗口；自动压缩只能让出输入侧，
  // 因此阈值分母必须先扣掉当前模型允许的 output token，而不是继续吃完整 contextWindow。
  const reserve = Math.min(getAutoCompactOutputReserveTokens(config), contextWindow);
  return Math.max(0, contextWindow - reserve);
}

export function getAutoCompactOutputReserveTokens(config: AutoCompactPolicyConfig = {}): number {
  const maxOutputTokens = positiveInt(config.maxOutputTokens);
  // 旧 legacy 分支为完整模型输出预留窗口，既过早压缩又要求远端选择；现在统一保留至多 21K。
  return Math.min(
    maxOutputTokens ?? DEFAULT_AUTOCOMPACT_OUTPUT_RESERVE_TOKENS,
    PREFLIGHT_AUTOCOMPACT_OUTPUT_RESERVE_TOKENS,
  );
}

/**
 * Schwelle in Prozent des effektiven Fensters (input-shared window minus output reserve).
 * Ein expliziter Override gewinnt; sonst gilt der 80-%-Default.
 */
export function getAutoCompactThresholdPercent(config: AutoCompactPolicyConfig = {}): number {
  const percent = config.thresholdPercentOverride;
  if (percent === undefined || !Number.isFinite(percent)) {
    return DEFAULT_AUTOCOMPACT_THRESHOLD_PERCENT;
  }
  return Math.min(100, Math.max(1, Math.floor(percent)));
}

export function getAutoCompactThreshold(config: AutoCompactPolicyConfig = {}): number {
  const effectiveContextWindow = getEffectiveContextWindowSize(config);
  const buffer = positiveInt(config.bufferTokens) ?? AUTOCOMPACT_BUFFER_TOKENS;
  // Der Buffer bleibt als Sicherheitsdeckel: 100 % + Buffer darf nie das ganze Fenster fressen.
  // Bei 80 % ist die Prozent-Schwelle früher und gewinnt daher.
  const percentThreshold = Math.floor(
    (effectiveContextWindow * getAutoCompactThresholdPercent(config)) / 100,
  );
  const bufferThreshold = Math.max(0, effectiveContextWindow - buffer);
  return Math.max(0, Math.min(percentThreshold, bufferThreshold));
}

/** Mindest-Füllstand (Prozent) für Agent-initiierte Kompression. */
export function getAgentCompactFloorPercent(config: AutoCompactPolicyConfig = {}): number {
  const configured = config.agentCompactFloorPercent;
  if (configured === undefined || !Number.isFinite(configured)) {
    return DEFAULT_AGENT_COMPACT_FLOOR_PERCENT;
  }
  return Math.min(100, Math.max(1, Math.floor(configured)));
}

/** Mindest-Füllstand (Tokens) für Agent-initiierte Kompression. */
export function getAgentCompactFloorTokens(config: AutoCompactPolicyConfig = {}): number {
  return Math.floor(
    (getEffectiveContextWindowSize(config) * getAgentCompactFloorPercent(config)) / 100,
  );
}

export function shouldAutoCompact(input: {
  messages: readonly CompactModelMessage[];
  config?: AutoCompactPolicyConfig;
  consecutiveFailures?: number;
  tokenOverride?: AutoCompactTokenOverride;
}): AutoCompactDecision {
  const config = input.config ?? {};
  const contextWindow = positiveInt(config.contextWindow) ?? DEFAULT_COMPACT_CONTEXT_WINDOW;
  const effectiveContextWindow = getEffectiveContextWindowSize(config);
  const outputReserveTokens = Math.min(getAutoCompactOutputReserveTokens(config), contextWindow);
  const threshold = getAutoCompactThreshold(config);
  const thresholdPercent = getAutoCompactThresholdPercent(config);
  const estimatedTokenCount = estimateMessageTokens(input.messages);
  const tokenCount = input.tokenOverride?.tokenCount ?? estimatedTokenCount;
  const tokenSource = input.tokenOverride?.source ?? "estimate";
  const common = {
    contextWindow,
    effectiveContextWindow,
    estimatedTokenCount,
    providerCacheReadTokens: input.tokenOverride?.cacheReadTokens,
    providerCacheWriteTokens: input.tokenOverride?.cacheWriteTokens,
    maxOutputTokens: positiveInt(config.maxOutputTokens),
    modelContextBudgetStrategy: DEFAULT_BUDGET_STRATEGY,
    outputReserveTokens,
    providerBaseTokenCount: input.tokenOverride?.baseTokenCount,
    providerContextUsageTokenCount: input.tokenOverride?.contextUsageTokenCount,
    providerIncrementalTokenCount: input.tokenOverride?.incrementalTokenCount,
    providerOutputTokens: input.tokenOverride?.outputTokens,
    threshold,
    thresholdPercent,
    tokenCount,
    tokenSource,
  } satisfies Omit<AutoCompactDecision, "reason" | "shouldCompact">;

  if (config.enabled === false) {
    return { ...common, shouldCompact: false, reason: "disabled" };
  }

  if (!hasEnoughMessagesToCompact(input.messages)) {
    return {
      ...common,
      shouldCompact: false,
      reason: "not_enough_messages",
    };
  }

  const maxFailures =
    positiveInt(config.maxConsecutiveFailures) ?? MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES;
  if ((input.consecutiveFailures ?? 0) >= maxFailures) {
    return {
      ...common,
      shouldCompact: false,
      reason: "circuit_breaker",
    };
  }

  if (tokenCount < threshold) {
    return {
      ...common,
      shouldCompact: false,
      reason: "below_threshold",
    };
  }

  return { ...common, shouldCompact: true, reason: "above_threshold" };
}

export type AgentCompactRejectionReason =
  | "disabled"
  | "not_enough_messages"
  | "circuit_breaker"
  | "rate_limited"
  | "below_floor";

export interface AgentCompactDecision {
  allowed: boolean;
  reason?: AgentCompactRejectionReason;
  tokenCount: number;
  tokenSource: AutoCompactTokenSource;
  floor: number;
  threshold: number;
  effectiveContextWindow: number;
  thresholdPercent: number;
}

/**
 * Prüft, ob der Agent selbst eine Kompression anfordern darf. Der Harness behält seine
 * Auto-Schwelle; hier gelten zusätzlich der Per-Task-Schalter und der Mindest-Füllstand.
 */
export function shouldAllowAgentCompact(input: {
  messages: readonly CompactModelMessage[];
  config?: AutoCompactPolicyConfig;
  consecutiveFailures?: number;
  tokenOverride?: AutoCompactTokenOverride;
  rateLimited?: boolean;
}): AgentCompactDecision {
  const config = input.config ?? {};
  const tokenCount = input.tokenOverride?.tokenCount ?? estimateMessageTokens(input.messages);
  const tokenSource = input.tokenOverride?.source ?? "estimate";
  const decisionBase = {
    tokenCount,
    tokenSource,
    floor: getAgentCompactFloorTokens(config),
    threshold: getAutoCompactThreshold(config),
    effectiveContextWindow: getEffectiveContextWindowSize(config),
    thresholdPercent: getAutoCompactThresholdPercent(config),
  } satisfies Omit<AgentCompactDecision, "allowed" | "reason">;
  const reject = (reason: AgentCompactRejectionReason): AgentCompactDecision => ({
    ...decisionBase,
    allowed: false,
    reason,
  });

  if (config.enabled === false || config.agentCompactEnabled === false) {
    return reject("disabled");
  }
  if (!hasEnoughMessagesToCompact(input.messages)) {
    return reject("not_enough_messages");
  }
  const maxFailures =
    positiveInt(config.maxConsecutiveFailures) ?? MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES;
  if ((input.consecutiveFailures ?? 0) >= maxFailures) {
    return reject("circuit_breaker");
  }
  if (input.rateLimited === true) {
    return reject("rate_limited");
  }
  if (tokenCount < decisionBase.floor) {
    return reject("below_floor");
  }
  return { ...decisionBase, allowed: true };
}

function positiveInt(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) return undefined;
  return Math.floor(value);
}
