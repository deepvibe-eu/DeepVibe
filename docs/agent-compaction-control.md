# Agent-gesteuerte Komprimierung (Spec)

Status: **teilweise umgesetzt** (2026-10-21): Engine + Ring-Aktion; Settings/Per-Task-Checkbox offen.
Design-Notiz: `internal-notes/compaction-agent-control.md`.

## Goal

Der Begleiter (Agent) soll seinen Kontextverbrauch **sehen** und bei Bedarf selbst eine
Komprimierung **anfordern** können. Der Nutzer behält die Kontrolle **pro Aufgabe**; der Harness
behält die harten Sicherheitsgrenzen. Die Kompression selbst bleibt modellgeschrieben.

## Product rules

1. **Per-Task-Schalter.** Jede Aufgabe/Session hat `agentCompactAllowed` (Default aus den
   App-Settings, initial `true`). Er steuert **nur** agent-initiiertes Komprimieren.
2. **Harness-Sicherheit bleibt.** Unabhängig vom Schalter komprimiert der Harness weiterhin
   automatisch, wenn die Schwelle erreicht ist (sonst liefe der Kontext über).
3. **Schwelle in Prozent.** Default **80 %** (±2) des **effektiven** Kontextfensters
   (`contextWindow − outputReserve`).
4. **Floor.** Agent-Requests sind erst ab **50 %** des effektiven Fensters erlaubt
   (aktuell ≈ 500k Token; bewusst Prozent, kein absoluter Wert).
5. **Kein stilles Komprimieren per Bare-Klick.** Der Ring öffnet das bestehende Breakdown-Popover;
   dort startet „Jetzt komprimieren" nach einer kurzen Bestätigung eine **manuelle** Kompression.
6. **Sichtbarkeit.** Der Kontext-Ring bleibt sichtbar. Farbbänder (grün <50 %, orange 50–65 %,
   rot 65–80 %) sind **optional** und nicht Teil von v1.

## Current state (facts)

- Auto-Compact läuft im Turn-Loop: `apps/zcode-cli/packages/core/src/runtime/methods/turn-loop.ts:69-102`
  (`microcompactIfNeeded` + `autoCompactIfNeeded`).
- Policy: `core/src/compact/policy.ts`. `thresholdPercentOverride` existiert, wird aber **nicht
  benutzt** (`:101` setzt `thresholdPercent = 100`); Schwelle ist heute `effectiveWindow − buffer` (`:84-88`).
- Trigger: `@zcode/contracts` `CompactTrigger = { manual, auto, partial, reactive, session_memory }`
  (`apps/zcode-cli/packages/contracts/src/compact/index.ts:9-15`; Zod an `:105-110` und `:182-187`).
- Kein model-aufrufbarer Compact-Tool. Während Compaction ist Tool-Nutzung gesperrt
  (`runtime/methods/compact-active-helpers.ts:23`).
- Kontextverbrauch ist nur Telemetrie/UI (`runtime/methods/context-usage.ts:119`; Ring in
  `packages/ui/src/chat-input-toolbar/contextUsage.tsx`), nicht im Prompt.
- Schutz: `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`, Rapid-Refill (`turn-loop-state.ts`),
  `hasEnoughMessagesToCompact`.

## State ownership

| State | Owner | Ort |
| --- | --- | --- |
| `autoCompactThresholdPercent` (default 80) | App-Settings | `packages/shared/src/protocol.ts` + `validationAppSettings.ts`, persistiert in `services/src/setting/settingService.ts` |
| `agentCompactAllowedByDefault` (default true) | App-Settings | dito |
| `agentCompactAllowed` (Session-Override) | Session-Metadata | `contracts/src/interfaces/session-store.port.ts` |
| Schwellen-/Floor-Berechnung | Engine | `core/src/compact/policy.ts` (`shouldAutoCompact`, `getAutoCompactThreshold`) |
| Pending Agent-Compact | Turn-Loop-State | `core/src/runtime/methods/turn-loop-state.ts` |
| „läuft gerade eine Compaction" | Runtime | `compact-active.ts` (bestehend) |

Auflösung: `session.agentCompactAllowed ?? app.agentCompactAllowedByDefault`.

## Interfaces

### Tool `context_status` (read-only)

Immer verfügbar. `inputSchema`: `{}`. `outputSchema`:
```json
{ "usedTokens": 0, "effectiveWindow": 0, "percent": 0,
  "thresholdPercent": 80, "floorPercent": 50, "source": "provider_usage" | "estimate" }
```
Datenquelle: derselbe Snapshot wie `shouldAutoCompact` (Provider-Usage, sonst Schätzung).

### Tool `compact_context` (nur wenn `agentCompactAllowed`)

`inputSchema`: `{ "instructions"?: string }` (max. 2000 Zeichen).
`outputSchema`: `{ "status": "scheduled" | "rejected", "reason"?: string }`.
- `readOnly: false`, `destructive: true`, `sideEffectScope: "none"` (Session-Historie, kein Dateisystem).
- Verfügbarkeit: nur wenn `agentCompactAllowed === true`; sonst wird das Tool gar nicht angeboten.
- Ablehnungsgründe: `disabled`, `below_floor`, `not_enough_messages`, `already_compacting`,
  `circuit_breaker`, `rate_limited`.

### Trigger

Neuer Wert `CompactTrigger.Agent = "agent"` in `contracts/src/compact/index.ts`; beide Zod-Enums
(`:105-110`, `:182-187`) ergänzen. Timeline/Telemetrie zeigen „vom Begleiter ausgelöst".

## Flow / event order

```
Agent (model step)
  └─ tool compact_context
       ├─ validate: allowed? floor? enough messages? not compacting? circuit/rate?
       │     └─ reject → tool result { status:"rejected", reason }
       └─ ok → set state.pendingAgentCompact = { instructions }
                → tool result { status:"scheduled" }        (keine Historie-Änderung!)

Turn-Loop, nächste Iteration (vor dem nächsten Model-Request):
  microcompactIfNeeded
  autoCompactIfNeeded
  consumePendingAgentCompact → compactActiveConversation(trigger: Agent)
       └─ Timeline-Event (context_compaction, trigger=agent), pendingState = undefined
```

Wichtig: Die Compaction läuft **nie** synchron im Tool-Handler und **nie** mitten in einem
Tool-Batch — sie wird am Loop-Boundary konsumiert (wie Auto-Compact).

## Guardrails

- **Floor:** `used < effectiveWindow * floorPercent/100` → `below_floor`, kein Model-Call.
- **Rate:** max. 1 agent-initiiert pro Turn; zählt in den bestehenden Rapid-Refill-Zähler.
- **Circuit breaker:** `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES` blockiert auch Agent-Requests.
- **Kein Compact während Compact** (`already_compacting`).
- **Mindest-Runden:** `hasEnoughMessagesToCompact`.
- **Turn-Ende:** Ein am Turn-Ende noch offener Request wird beim nächsten Turn-Start konsumiert.

## UI

- **Per-Task-Checkbox** „Fëa darf für diese Aufgabe selbst komprimieren" in der Composer-/Task-Leiste
  (nahe Modell/Permissions), persistiert pro Session.
- **Ring-Popover** (`ContextTrigger`, `chat-input-toolbar/contextUsage.tsx`): Aktion
  „Jetzt komprimieren" + Bestätigung (`trigger: manual`).
- **Timeline:** Compaction-Karte mit Trigger `agent` vs. `manual` vs. `auto` unterscheidbar.
- i18n in allen 6 Sprachen (`de, en, es, fr, ru, zh-Hans`).

## Acceptance scenarios

1. Schalter aus → `compact_context` nicht angeboten; Auto-Compact bei 80 % funktioniert weiter.
2. Schalter an, Verbrauch < 50 % → `compact_context` → `rejected/below_floor`, kein Summary-Call.
3. Schalter an, Verbrauch ≥ 50 % → `scheduled`; am Boundary läuft die Compaction mit `trigger=agent`;
   Timeline zeigt sie.
4. Request während eines Tool-Batches → keine Historie-Änderung im Batch; Ausführung erst am Boundary.
5. Zwei Requests im selben Turn → zweiter `rejected/rate_limited`.
6. Prozent-Override wird geehrt: 80 % löst aus, 79 % nicht (bei gleichem Tokenstand).
7. Ring → „Jetzt komprimieren" → Bestätigung → `trigger=manual`.
8. Drei fehlgeschlagene Compactions → danach `rejected/circuit_breaker`.

## Out of scope (v1)

- Agent setzt die Schwelle selbst.
- Dauerhafte Warn-Reminder im Prompt (kein Per-Turn-Injection).
- Farbbänder am Ring (optional, später).
- DS·IDE (separates Projekt, anderer Arbeitsbereich).

## Umsetzungsstand (2026-10-21)

**Umgesetzt (lokal, typecheck/lint grün):**
- `compact/policy.ts`: Schwelle 80 % (+Buffer-Deckel), Floor 50 %, `shouldAllowAgentCompact()` und
  `getAgentCompactFloorPercent/Tokens`.
- `contracts`: `CompactTrigger.Agent` (beide Zod-Enums) + `tools/context-compact.ts`
  (`ContextStatus`, `CompactContext`, Schemas/Typen).
- `tool/handlers/context-compact.ts` + Registrierung; `CompactContext` wird bei
  `agentCompactEnabled === false` nicht angeboten.
- `compactControlPort` (`tool/types.ts` → Executor → `runtime-tools.ts`); Runtime-Methoden in
  `runtime/methods/compact-agent.ts`; Konsum am Turn-Loop-Boundary (`turn-loop.ts`; Auto-Compact
  verwirft ein offenes Agent-Request).
- **Ring-Aktion:** `chat-input-toolbar/contextUsage.tsx` zeigt im Panel „Jetzt komprimieren"
  (nutzt `getContextCompressionCommand()` → `/compact`-Pfad, `compressionDisabled` respektiert) +
  i18n in 6 Sprachen.

**Umgesetzt (2026-10-21, 1.0.6-Vorbereitung):**
- **Timeline-Label:** `TimelineMarkerPayload.origin` kennt jetzt `"agent"`; `mapCompactMarkerOrigin`
  mappt `CompactTrigger.Agent` darauf und die UI zeigt `chat.contextCompaction.completedAgent`
  (6 Locales) statt „automatisch komprimiert".
- **Policy-Unit-Tests:** `apps/zcode-cli/packages/core/test/compact-policy.test.ts`
  (`pnpm --dir apps/zcode-cli/packages/core test`, Node-Test-Runner via `tsx`), 5 Tests grün:
  effektives Fenster, Prozent-Clamps, Buffer-Deckel, Auto-Entscheidungsgründe, Agent-Floor/Schalter/
  Rate-Limit/Circuit-Breaker.

**Offen:**
- App-Settings (`autoCompactThresholdPercent`, `agentCompactAllowedByDefault`) und **Per-Task-Checkbox**:
  brauchen eine Erweiterung der `ZCodeSessionRuntimePreferences`-Kette
  (`packages/shared` Protocol + Host-Resolver + Settings-UI) bzw. der Session-Create-Preferences.
- Turn-Loop-Boundary-Test (braucht einen Runtime-Harness; Policy-Tests decken die Entscheidungen ab).

## File map

- `apps/zcode-cli/packages/core/src/compact/policy.ts` — Prozent-Schwelle + Floor.
- `apps/zcode-cli/packages/core/src/runtime/methods/{turn-loop.ts,turn-loop-state.ts,compact.ts,compact-active.ts}`.
- `apps/zcode-cli/packages/contracts/src/compact/index.ts` — `CompactTrigger.Agent` + Zod.
- `apps/zcode-cli/packages/core/src/tool/{registry.ts,types.ts,model-contract.ts,handlers/}` — Tools.
- `packages/shared/src/{protocol.ts,validationAppSettings.ts}` + `packages/services/src/setting/settingService.ts`.
- `packages/ui/src/chat-input-toolbar/contextUsage.tsx` — Ring-Aktion.
- Composer-/Task-Leiste — Per-Task-Checkbox.
- Timeline/Telemetrie + 6 Locales.
