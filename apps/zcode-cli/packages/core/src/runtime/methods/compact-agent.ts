// ============================================================
// Agent-requested compaction (ContextStatus / CompactContext)
// ============================================================

import {
  CompactTrigger,
  getAgentCompactFloorPercent,
  shouldAllowAgentCompact,
  traceContextToLogContext,
} from "../deps.js";
import type {
  AgentCompactDecision,
  AutoCompactTokenOverride,
  Model,
  SessionEvent,
  TraceContext,
} from "../deps.js";
import type { CompactContextOutput, ContextStatusOutput } from "@zcode/contracts";
import type { RuntimeMessageEntry } from "../../agent/message-history.js";
import type { AgentRuntimeInternal } from "../internal.js";
import {
  isTurnCancellationError,
  throwIfTurnAborted,
  buildRuntimeProviderRequestMessages,
} from "../helpers/index.js";
import { buildCompactPolicyConfig, buildProviderUsageTokenOverride } from "./compact.js";
import type { AutoCompactLoopContext, AutoCompactOutcome } from "./turn-loop-state.js";
import { createRuntimeModel } from "./runtime-model.js";

function evaluateAgentCompactContext(
  runtime: AgentRuntimeInternal,
  model: Model,
  activeEntries: readonly RuntimeMessageEntry[],
): {
  decision: AgentCompactDecision;
  tokenOverride?: AutoCompactTokenOverride;
} {
  const config = buildCompactPolicyConfig(runtime, model);
  const projection = buildRuntimeProviderRequestMessages(runtime, {
    entries: activeEntries,
    applyCacheControl: false,
    model,
  });
  const tokenOverride = buildProviderUsageTokenOverride(
    projection.messages,
    projection.sourceEntries,
  );
  const decision = shouldAllowAgentCompact({
    messages: projection.messages,
    config,
    consecutiveFailures: runtime.autoCompactConsecutiveFailures,
    tokenOverride,
  });
  return { decision, tokenOverride };
}

/** Kontextstatus für das Tool `ContextStatus` (gleiche Quelle wie die Auto-Compact-Entscheidung). */
export function getCompactContextStatus(this: AgentRuntimeInternal): ContextStatusOutput {
  const model = createRuntimeModel(this, { selection: this.getSessionModelSelection() });
  const entries = this.messageHistory.borrowReadOnlyRuntimeEntries();
  const { decision } = evaluateAgentCompactContext(this, model, entries);
  const effectiveWindow = decision.effectiveContextWindow;
  return {
    usedTokens: decision.tokenCount,
    effectiveWindow,
    percent: effectiveWindow > 0 ? Math.min(1, decision.tokenCount / effectiveWindow) : 0,
    thresholdPercent: decision.thresholdPercent,
    floorPercent: getAgentCompactFloorPercent(buildCompactPolicyConfig(this, model)),
    source: decision.tokenSource,
  };
}

/** Agent fordert eine Kompression an; ausgeführt wird sie am nächsten Turn-Loop-Boundary. */
export function requestAgentCompact(
  this: AgentRuntimeInternal,
  input: { instructions?: string },
): CompactContextOutput {
  if (this.pendingAgentCompact) {
    return { status: "rejected", reason: "rate_limited" };
  }
  const model = createRuntimeModel(this, { selection: this.getSessionModelSelection() });
  const entries = this.messageHistory.borrowReadOnlyRuntimeEntries();
  const { decision } = evaluateAgentCompactContext(this, model, entries);
  if (!decision.allowed) {
    return { status: "rejected", reason: decision.reason ?? "below_floor" };
  }
  const instructions = input.instructions?.trim();
  this.pendingAgentCompact = instructions ? { instructions } : {};
  return { status: "scheduled" };
}

/** Konsumiert eine Agent-Anforderung am Loop-Boundary (nie synchron im Tool-Handler). */
export async function agentCompactIfRequested(
  this: AgentRuntimeInternal,
  turnTraceContext: TraceContext,
  events: SessionEvent[],
  abortSignal: AbortSignal | undefined,
  context: AutoCompactLoopContext,
): Promise<AutoCompactOutcome> {
  const pending = this.pendingAgentCompact;
  if (!pending) {
    return "skipped";
  }
  this.pendingAgentCompact = undefined;
  throwIfTurnAborted(abortSignal);

  const config = buildCompactPolicyConfig(this, context.model);
  const activeEntries = context.turnRequestState.entries;
  const activeProjection = buildRuntimeProviderRequestMessages(this, {
    entries: activeEntries,
    applyCacheControl: false,
    model: context.model,
  });
  const tokenOverride = buildProviderUsageTokenOverride(
    activeProjection.messages,
    activeProjection.sourceEntries,
  );
  // Am Boundary erneut prüfen: zwischen Request und Ausführung können weitere Tool-Results
  // hinzugekommen sein (oder der Circuit-Breaker ausgelöst haben).
  const decision = shouldAllowAgentCompact({
    messages: activeProjection.messages,
    config,
    consecutiveFailures: this.autoCompactConsecutiveFailures,
    tokenOverride,
  });
  if (!decision.allowed) {
    this.logger?.info("Agent compact skipped", {
      ...traceContextToLogContext(turnTraceContext),
      event: "compact.agent.skipped",
      compactReason: context.compactReason,
      modelStepIndex: context.modelStepIndex,
      module: "core.runtime",
      phase: context.phase,
      reason: decision.reason,
      tokenCount: decision.tokenCount,
      trigger: CompactTrigger.Agent,
    });
    return "skipped";
  }

  this.logger?.info("Agent compact started", {
    ...traceContextToLogContext(turnTraceContext),
    event: "compact.agent.started",
    compactReason: context.compactReason,
    modelStepIndex: context.modelStepIndex,
    module: "core.runtime",
    phase: context.phase,
    floor: decision.floor,
    threshold: decision.threshold,
    tokenCount: decision.tokenCount,
    trigger: CompactTrigger.Agent,
  });

  try {
    const compactResult = await this.compactActiveConversation(
      pending.instructions,
      turnTraceContext,
      events,
      {
        abortSignal,
        compactContextTelemetry: {
          inputTokens: decision.tokenCount,
          policyContextWindowTokens: decision.effectiveContextWindow,
          thresholdTokens: decision.floor,
          tokenSource: decision.tokenSource,
        },
        compactReason: context.compactReason,
        phase: context.phase,
        trigger: CompactTrigger.Agent,
        activeEntries,
        ...(context.model ? { model: context.model } : {}),
      },
    );
    if (compactResult.outcome === "skipped") {
      return "skipped";
    }
    context.turnRequestState.entries = compactResult.entries;
    this.autoCompactConsecutiveFailures = 0;
    this.logger?.info("Agent compact completed", {
      ...traceContextToLogContext(turnTraceContext),
      event: "compact.agent.completed",
      compactReason: context.compactReason,
      modelStepIndex: context.modelStepIndex,
      module: "core.runtime",
      phase: context.phase,
      trigger: CompactTrigger.Agent,
    });
    return "compacted";
  } catch (error) {
    if (isTurnCancellationError(error, abortSignal)) {
      throw error;
    }
    this.autoCompactConsecutiveFailures++;
    this.logger?.warn("Agent compact failed", {
      ...traceContextToLogContext(turnTraceContext),
      errorMessage: error instanceof Error ? error.message : String(error),
      event: "compact.agent.failed",
      failureCount: this.autoCompactConsecutiveFailures,
      modelStepIndex: context.modelStepIndex,
      module: "core.runtime",
      phase: context.phase,
      trigger: CompactTrigger.Agent,
    });
    return "failed";
  }
}
