# Flavor Data Isolation (Spec)

Status: **umgesetzt** (lokal, 2026-10-14) — siehe „Implemented".

## Goal

Jede Vibe-Fëa hält ihren **user-globalen** State unter ihrer **eigenen** Datenwurzel
(`VIBE_DATA_DIR_NAME` aus `@zcode/shared`), damit sich die Apps keine Credentials, Sessions,
Telemetrie, Skills oder Config teilen. DeepVibe heißt dabei **`.deepvibe`** (früher `.zcode`).

## Rule

- **User-global MUSS `VIBE_DATA_DIR_NAME` nutzen** (`join(homedir(), VIBE_DATA_DIR_NAME, "v2", …)`).
- **Workspace-lokal** `<workspace>/.zcode/…` bleibt `.zcode` — Projekt-Config/Skills/Agents/Workflows/
  Memory. Das ist Projekt-State, nicht Fëa-State.
- **Unverändert:** interne Protokollnamen/-IDs, Env-Keys (`ZCODE_*`), `ZCODE_STORAGE_DIR` und die
  Upstream-Attribution (About „ZCode · Apache-2.0", `zai-org/ZCode`).
- **`providerRuntimeResolver.ts` bleibt `.zcode`:** die Kandidaten `~/.zcode/server/agents/…` sind eine
  gemeinsame **Install-/Bundle-Suchstelle** (neben `packagedResourcesPath`), kein Nutzer-State.
- **Datenordner je Fëa:** DeepVibe `.deepvibe`, Kimi `.kimivibe`, Lama `.lamavibe`, Klaus `.klausvibe`,
  Mini `.minivibe`.

## Implemented

Umgestellt wurden alle user-globalen Stellen (CLI **und** Services, je Concern zusammen):

- **Credentials** — `adapters/.../auth/shared-credentials.ts` (zieht gleich mit dem schon gescopten
  `services/.../credential/credentialService.ts`).
- **Telemetrie/Device-ID** — `services/telemetry/telemetryCore`, `services/device/deviceMid`,
  `adapters/device/cli-device-mid`, `telemetry/bootstrap`.
- **Logs/Rollout/Trajectory** — `adapters/logging`, `adapters/model/runner-debug`,
  `services/zcode-agent/zcodeTaskServiceAdapter`, `services/zcode-agent/modelTrajectoryFileTail`.
- **Skills/Commands** — `services/skills/skillsService`, `services/skill-sync/skillSyncService`,
  `adapters/skills/roots`, `adapters/commands/roots` (User-Root = Fëa-Dir; **Projekt**-Root = `.zcode`).
- **Config/MCP/Hooks/Subagents** — `adapters/storage/workspace-hook-trust-store`,
  `services/subagents/subagentStorage`, `services/subagents/subagentsService`,
  `desktop/main/mcpUserDirectory` (user vs. workspace), `adapters/context` (`~/.zcode/AGENTS.md`),
  `adapters/workflow`, `bootstrap/script-workflow-*` (User-Workflow-Root),
  `adapters/exec/execution-utils`, `cli/sea-runtime-tools`, `cli/clipboard-image`,
  `cli/provider-runtime-env`, `services/zcode-agent/zcodeAgentService` (Plugin-Workspace).

## Kept (intentionally `.zcode`)

- Workspace-lokal: `join(workspace|workingDirectory, ".zcode", …)`.
- Dev-Werkzeuge: `scripts/shadow-replay.mjs`, `packages/debug/server/sources.ts`.
- `services/runtime-tools/providerRuntimeResolver.ts` (Bundle-/Install-Suche).

## Migration

DeepVibe hieß früher `.zcode`. `packages/desktop/src/main/desktopLegacyDataRootMigration.ts` benennt
beim Start **einmalig** `<base>/.zcode` → `<base>/.deepvibe` um, solange das Ziel noch nicht existiert.
Das Modul wird in `main/index.ts` **vor** `desktopEarlyDataBaseDirBootstrap` importiert, damit alle
frühen Reads die neue Wurzel sehen. Nur die `.deepvibe`-Fëa migriert; die anderen Flavors starten frisch
und übernehmen `.zcode` **nicht**. Kein Umzug der Alt-LamaVibe-1.0.0-Daten (User: „nur 3 × Hallo").

## Deps

`apps/zcode-cli/packages/telemetry` bekam `@zcode/shared` (`workspace:*`), da der Standalone-Fallback
`~/.zcode` nun `VIBE_DATA_DIR_NAME` braucht (Link zeigt auf das Root-`packages/shared`).

## Acceptance

- Keine user-globalen `join(…, ".zcode", …)`-Literale mehr (workspace-lokal ausgenommen).
- DeepVibe liest/schreibt unter `~/.deepvibe`; einmalige Migration aus `~/.zcode`.
- kimi/lama/klaus/mini lesen/schreiben unter ihrem eigenen Root.
- `pnpm typecheck` (Root + CLI-Pakete) und `pnpm lint` grün.
