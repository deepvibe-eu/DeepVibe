// ============================================================
// Context / Compaction control tools
// ============================================================

import { z } from "zod";
import { toToolJsonSchema } from "./json-schema.js";

export const CONTEXT_STATUS_TOOL_NAME = "ContextStatus";
export const COMPACT_CONTEXT_TOOL_NAME = "CompactContext";

export const COMPACT_INSTRUCTIONS_MAX_CHARS = 2_000;

export const ContextStatusInputSchema = z.object({}).strict();
export type ContextStatusInput = z.infer<typeof ContextStatusInputSchema>;
export const ContextStatusInputJsonSchema = toToolJsonSchema(ContextStatusInputSchema);

export const ContextStatusSourceSchema = z.enum(["provider_usage", "estimate"]);
export type ContextStatusSource = z.infer<typeof ContextStatusSourceSchema>;

export const ContextStatusOutputSchema = z
  .object({
    usedTokens: z.number().int().nonnegative().describe("Tokens currently in the provider context."),
    effectiveWindow: z
      .number()
      .int()
      .nonnegative()
      .describe("Input budget after the output reserve."),
    percent: z.number().min(0).max(1).describe("usedTokens / effectiveWindow."),
    thresholdPercent: z
      .number()
      .int()
      .min(1)
      .max(100)
      .describe("Auto-compaction threshold in percent."),
    floorPercent: z
      .number()
      .int()
      .min(1)
      .max(100)
      .describe("Minimum fill level for agent-requested compaction."),
    source: ContextStatusSourceSchema,
  })
  .strict();
export type ContextStatusOutput = z.infer<typeof ContextStatusOutputSchema>;
export const ContextStatusOutputJsonSchema = toToolJsonSchema(ContextStatusOutputSchema);

export const CompactContextInputSchema = z
  .object({
    instructions: z
      .string()
      .max(COMPACT_INSTRUCTIONS_MAX_CHARS)
      .optional()
      .describe("Optional guidance for the summary (what must survive compaction)."),
  })
  .strict();
export type CompactContextInput = z.infer<typeof CompactContextInputSchema>;
export const CompactContextInputJsonSchema = toToolJsonSchema(CompactContextInputSchema);

export const CompactContextRejectionReasonSchema = z.enum([
  "disabled",
  "below_floor",
  "not_enough_messages",
  "circuit_breaker",
  "rate_limited",
]);
export type CompactContextRejectionReason = z.infer<typeof CompactContextRejectionReasonSchema>;

export const CompactContextOutputSchema = z
  .object({
    status: z.enum(["scheduled", "rejected"]),
    reason: CompactContextRejectionReasonSchema.optional(),
  })
  .strict();
export type CompactContextOutput = z.infer<typeof CompactContextOutputSchema>;
export const CompactContextOutputJsonSchema = toToolJsonSchema(CompactContextOutputSchema);
