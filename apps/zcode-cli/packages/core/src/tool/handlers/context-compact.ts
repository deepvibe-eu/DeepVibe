// ============================================================
// Context / Compaction control tools
// ============================================================

import {
  COMPACT_CONTEXT_TOOL_NAME,
  CONTEXT_STATUS_TOOL_NAME,
  CompactContextInputJsonSchema,
  CompactContextInputSchema,
  CompactContextOutputJsonSchema,
  CompactContextOutputSchema,
  ContextStatusInputJsonSchema,
  ContextStatusInputSchema,
  ContextStatusOutputJsonSchema,
  ContextStatusOutputSchema,
  CoreErrorType,
  createCoreError,
  type CompactContextOutput,
  type ContextStatusOutput,
  type ToolPermissionSpec,
} from "@zcode/contracts";
import type { ToolEntry, ToolExecutionContext, ToolHandler } from "../types.js";

const MAX_OUTPUT_BYTES = 16_000;

const contextStatusHandler: ToolHandler = async (_input, context) => {
  ContextStatusInputSchema.parse(_input);
  const output = await requireCompactControlPort(context, CONTEXT_STATUS_TOOL_NAME).getContextStatus();
  return output satisfies ContextStatusOutput;
};

const compactContextHandler: ToolHandler = async (input, context) => {
  const parsed = CompactContextInputSchema.parse(input);
  const output = await requireCompactControlPort(context, COMPACT_CONTEXT_TOOL_NAME).requestAgentCompact(
    { instructions: parsed.instructions },
  );
  return output satisfies CompactContextOutput;
};

export const contextStatusToolEntry: ToolEntry = {
  capability: "Read the current context usage, auto-compaction threshold and agent floor",
  requiresUserInteraction: false,
  metadata: {
    name: CONTEXT_STATUS_TOOL_NAME,
    description:
      "Read how full the context window is before deciding whether to compact. Returns used tokens, the effective window, the auto-compaction threshold and the minimum fill level for agent-requested compaction.",
    readOnly: true,
    destructive: false,
    concurrentSafe: true,
    requiresUserInteraction: false,
    timeoutMs: 5_000,
    maxOutputBytes: MAX_OUTPUT_BYTES,
    sideEffectScope: "none",
    riskLevel: "low",
    needsApproval: false,
  },
  handler: contextStatusHandler,
  formatModelContent: formatContextStatusModelContent,
  inputSchema: ContextStatusInputJsonSchema,
  outputSchema: ContextStatusOutputJsonSchema,
  runtimeInputSchema: ContextStatusInputSchema,
  runtimeOutputSchema: ContextStatusOutputSchema,
  permission: compactPermission(
    "compact.status",
    "ContextStatus only reads context usage",
    "none",
    false,
  ),
  resultBudget: compactResultBudget(),
  timeout: compactTimeout(),
  cancellation: {
    supported: true,
    cleanup: "none",
    userVisibleMessage: "ContextStatus was cancelled",
  },
  trace: compactTracePolicy(),
};

export const compactContextToolEntry: ToolEntry = {
  capability: "Request compaction of the current conversation at the next safe boundary",
  requiresUserInteraction: false,
  metadata: {
    name: COMPACT_CONTEXT_TOOL_NAME,
    description:
      "Ask the harness to compact the conversation. Use this when the context is getting tight for the remaining work. The compaction runs at the next model-step boundary, never in the middle of a tool batch. Below the configured floor the request is rejected.",
    readOnly: false,
    destructive: true,
    concurrentSafe: false,
    requiresUserInteraction: false,
    timeoutMs: 5_000,
    maxOutputBytes: MAX_OUTPUT_BYTES,
    sideEffectScope: "session",
    riskLevel: "low",
    needsApproval: false,
  },
  handler: compactContextHandler,
  formatModelContent: formatCompactContextModelContent,
  inputSchema: CompactContextInputJsonSchema,
  outputSchema: CompactContextOutputJsonSchema,
  runtimeInputSchema: CompactContextInputSchema,
  runtimeOutputSchema: CompactContextOutputSchema,
  permission: compactPermission(
    "compact.request",
    "CompactContext rewrites the active conversation history with a summary",
    "session",
    false,
  ),
  resultBudget: compactResultBudget(),
  timeout: compactTimeout(),
  cancellation: {
    supported: true,
    cleanup: "none",
    userVisibleMessage: "CompactContext was cancelled",
  },
  trace: compactTracePolicy(),
};

function requireCompactControlPort(
  context: ToolExecutionContext,
  toolName: typeof CONTEXT_STATUS_TOOL_NAME | typeof COMPACT_CONTEXT_TOOL_NAME,
): NonNullable<ToolExecutionContext["compactControlPort"]> {
  const port = context.compactControlPort;
  if (port) {
    return port;
  }
  throw createCoreError(
    CoreErrorType.ConfigurationError,
    `Compaction control is not available for ${toolName}`,
    {
      context: { toolCallId: context.toolCallId, toolName },
      recoverable: false,
    },
  );
}

function formatContextStatusModelContent(output: unknown): string {
  const status = output as ContextStatusOutput;
  const percent = Math.round(status.percent * 100);
  return `Context usage: ${status.usedTokens}/${status.effectiveWindow} tokens (${percent}%). Auto-compaction threshold: ${status.thresholdPercent}%. Agent compaction floor: ${status.floorPercent}%. Source: ${status.source}.`;
}

function formatCompactContextModelContent(output: unknown): string {
  const result = output as CompactContextOutput;
  if (result.status === "scheduled") {
    return "Compaction scheduled. It will run at the next model-step boundary.";
  }
  return `Compaction was rejected${result.reason ? ` (${result.reason})` : ""}.`;
}

function compactPermission(
  permission: string,
  reason: string,
  sideEffectScope: "none" | "session",
  needsApproval: boolean,
): ToolPermissionSpec {
  return {
    permission,
    reason,
    riskLevel: "low",
    sideEffectScope,
    needsApproval,
    patternSources: ["toolName"],
    alwaysAllowPatternSources: ["toolName"],
    denyPriority: "beforeAsk",
  };
}

function compactResultBudget() {
  return {
    maxInlineBytes: MAX_OUTPUT_BYTES,
    maxModelBytes: MAX_OUTPUT_BYTES,
    strategy: "truncate" as const,
    preview: { maxBytes: MAX_OUTPUT_BYTES, direction: "head" as const },
  };
}

function compactTimeout() {
  return {
    defaultMs: 5_000,
    maxMs: 10_000,
    allowCallOverride: false,
  };
}

function compactTracePolicy() {
  return {
    required: true as const,
    propagateToAdapters: false,
    recordInput: "summary" as const,
    recordOutput: "summary" as const,
  };
}
