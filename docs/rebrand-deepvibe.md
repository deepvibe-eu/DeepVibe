# DeepVibe — Rebrand & Login-Optional (Spec)

Status: Entwurf (Session 2026-09-26). Ziel: aus ZCode die DeepSeek-IDE **DeepVibe**
machen — Login optional, Branding auf DeepVibe/DeepSeek, Agent = Mate.

## 1. Identität (festgelegt)

| Feld | Wert |
| --- | --- |
| Produktname | DeepVibe |
| Bundle-ID | `eu.deepvibe.ide` (`.dev`, `.nightly`, `.prerelease`) |
| Publisher / Author | DeepVibe (RheaOS) |
| Homepage | `https://deepvibe.eu` |
| Attribution | „built on ZCode (AGPLv3)"; DeepSeek nur beschreibend („works with DeepSeek models") |

`com.deepseek.*` wird bewusst **nicht** verwendet: fremder Reverse-DNS-Namensraum.

## 2. Login optional (Verhalten)

Beobachtung im Code (Stand `3e80666`):

- `packages/ui/src/Root.tsx:205-208` — Initialzustand ist bereits `null`; nur ein
  JWT-invalid-Marker öffnet den Screen (`"session-expired"`).
- `packages/ui/src/Root.tsx:988` — `<WelcomeScreen/>` wird gerendert, wenn
  `welcomeScreenOpenReason` gesetzt ist.
- `packages/ui/src/Root.tsx:867` — `"provider-request"` (wird ausgelöst, wenn ein
  Provider/Login angefordert wird).
- `packages/ui/src/Root.tsx:211` + `packages/ui/src/store/index.ts` — `loginEntryRequest`.
- `packages/ui/src/WelcomeScreen.tsx` — konsumiert `loginEntryRequest`, ruft Login auf.

Zu klären (Reihenfolge einhalten!):

1. Ursache des **erzwungenen** Screens verifizieren (kein Provider/Modell konfiguriert?
   vs. `loginEntryRequest` vs. ein Service-Event). Erst Ursache, dann Fix.
2. Spec für den Zielzustand ergänzen: Start direkt im Workspace; Login bleibt
   **optional** über Settings erreichbar; kein Provider-Zwang beim Start.

## 3. De-Branding (Fundstellen)

| Bereich | Datei(en) |
| --- | --- |
| Installer/Metadaten | `packages/desktop/electron-builder.config.js` (homepage, author, maintainer) |
| CDN | `packages/desktop/src/main/remoteCdn.ts` (Basis-URL) |
| IPC-Origins | `packages/desktop/src/main/desktopMainIpcRemote.ts`, `desktopWindowChrome.ts` |
| UI-Texte | `packages/ui/src/WelcomeScreen.tsx`, `WorkspaceSidebarFooter.tsx`, `CodingPlanUsageRemainingPanel.tsx`, `useTheme.ts`, `styles.css` |
| Doku/Recht | `LICENSE`, `DESIGN.md`, `NOTICE.md`, `README.md`/`README.en.md` |

## 4. Agent → Mate

`Agent`/`agent` in sichtbaren Strings lokalisieren und auf „Mate"/„Mates" umstellen;
interne IDs (`agentId`, `agentType`, RPC-Namen) **unverändert** lassen.

## 5. Verifikation (ZCode-Prozess)

```bash
node scripts/check-workspace-freshness.mjs
pnpm architecture:check --changed
pnpm typecheck
pnpm lint
pnpm verify:pre-push
pnpm dev:desktop            # Smoke-Test
```

Toolchain: `mise.toml` pinnt Node 24.14.0 / pnpm 10.33.2 (`mise` derzeit nicht
installiert; `pnpm install` lief unter Node 22 — vor dem ersten echten Build
auf die Pin bringen).

## 6. Offen

- Domain `deepvibe.eu` in Registrierung (Strato, Wochenende).
- GitHub-Org `deepvibe` ist belegt → Variante wählen (`deepvibe-eu` o. ä.).
- npm-Org `deepvibe` prüfen (Scope `@deepvibe`), sonst bestehenden Scope nutzen.
