# DeepVibe — Rebrand & Login-Optional (Spec)

Status: Entwurf (Session 2026-09-26). Ziel: aus ZCode die DeepSeek-IDE **DeepVibe**
machen — Login optional, Branding auf DeepVibe/DeepSeek, Agent = Mate.

## 1. Identität (festgelegt)

| Feld | Wert |
| --- | --- |
| Produktname | DeepVibe (Preview: `DeepVibe Preview`) |
| Bundle-ID | `eu.deepvibe.ide` (Preview: `eu.deepvibe.ide.preview`) |
| Publisher / Author | DeepVibe (RheaOS) `<me@deepvibe.eu>` |
| Homepage | `https://deepvibe.eu` |
| Attribution | „built on ZCode (AGPLv3)"; DeepSeek nur beschreibend („works with DeepSeek models") |

`com.deepseek.*` wird bewusst **nicht** verwendet: fremder Reverse-DNS-Namensraum.

Entschieden (2026-09-26):

- Flavor-Modell: die zwei bestehenden Flavors `production`/`preview` bleiben. Die
  ursprünglich angedachten `.dev/.nightly/.prerelease` entfallen.
- Linux Executable/Paket: `deepvibe` / `deepvibe-preview`.
- **Unverändert** (Infrastruktur/Interop): CDN & Update-Feed (`cdn-zcode.z.ai`),
  OAuth-Protokoll-Schema (`zcode`), interne IDs (`@zcode/*`, `ZCODE_*`, `.zcode-*`,
  `zcode.cjs`). Infra-Umstellung erst, wenn `deepvibe.eu` provisioniert ist.

## 2. Login optional (Verhalten)

### 2.1 Ursache des erzwungenen Starts — verifiziert (Stand `26b82f9`)

Der WelcomeScreen wird beim Start **nicht** durch eine fehlende Session erzwungen,
sondern durch den Provider-Verfügbarkeits-Guard:

- `packages/ui/src/root/useProviderAvailabilityLoginEntryGuard.ts:57` —
  `shouldOpenLoginEntry = !providerFamilyDomain || (!user && !hasUsableProvider)`.
  Ohne `providerFamilyDomain` (App-Setting, wird erst bei Login/API-Key gesetzt) ist
  das unbedingt `true`.
- `packages/ui/src/lib/rootStartupGate.ts:43` — `shouldEnableProviderAvailabilityLoginEntryGuard()`
  liefert unbedingt `true`.
- `packages/ui/src/Root.tsx:446-456` — `setLoginEntryOpen(true)` setzt
  `welcomeScreenOpenReason = "startup-provider-required"`.
- `packages/ui/src/Root.tsx:462-468` — `isStartupProviderLoginEntryOpen` blockiert
  `canRestoreWorkspaceSession`.
- `packages/ui/src/Root.tsx:784-799` — der Fallback-Workspace-Effekt bricht bei
  `isStartupProviderLoginEntryOpen` ab und legt deshalb keinen Default-Workspace an.
- `packages/ui/src/Root.tsx:982-988` — gesetzter Reason rendert `<WelcomeScreen/>`.

Ohne Login/Provider entsteht also kein Arbeitsbereich und der Login-Screen erscheint
zwangsweise. Der Initialzustand bei `Root.tsx:205-208` ist bereits `null`; nur der
JWT-invalid-Marker erzwingt `"session-expired"` (echter Auth-Fehler, bleibt).

### 2.2 Zielzustand

- Der Start rendert direkt den Workspace; fehlender Account/Provider öffnet den
  Login-Screen **nicht** mehr.
- Der Provider-Verfügbarkeitscheck bleibt für den Startup-Abschluss bestehen, öffnet
  aber keinen Login mehr.
- Login bleibt **optional** erreichbar:
  - Settings, wenn nicht angemeldet (`manual-login`, `Root.tsx:870-872` / `:962`),
  - Modell-/Provider-Anforderung (`provider-request`, `Root.tsx:861-868`),
  - ungültiges JWT (`session-expired`, `Root.tsx:486-488`),
  - expliziter Logout (`logout-provider-required`, `Root.tsx:520-522`).
- Kein Provider-Zwang: Die erste Modellanfrage ohne Provider löst über
  `loginEntryRequest` (Store) `provider-request` aus.

### 2.3 Akzeptanzszenarien

1. Frischer Start ohne Login und ohne Provider → Workspace erscheint (Default-Workspace
   wird über `ensureConversationWorkspace()` angelegt), kein WelcomeScreen.
2. „Login" in den Settings → WelcomeScreen erscheint (`manual-login`).
3. Senden ohne Provider → WelcomeScreen erscheint (`provider-request`).
4. Abgelaufenes JWT → WelcomeScreen erscheint (`session-expired`).

Single Owner bleibt `useProviderAvailabilityLoginEntryGuard` für den Startup-Abschluss
(`startupCheckCompleted`); die Öffnungsentscheidung wird als reine, testbare Funktion
in `packages/ui/src/lib/rootStartupGate.ts` verankert.

## 3. De-Branding (Fundstellen)

| Bereich | Datei(en) |
| --- | --- |
| Produkt-Identität | `packages/desktop/scripts/desktop-product-identity.mjs` (appId, productName, Linux-Namen) |
| Installer/Metadaten | `packages/desktop/electron-builder.config.js` (homepage, author, maintainer) |
| Paket-Name | `packages/desktop/package.json` (`name` bleibt `@zcode/desktop`; `productName`) |
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
