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

### 3.1 Sichtbare Strings — umgesetzt (2026-09-26)

Ersetzt wurde ausschließlich der sichtbare Marken-Token `ZCode` → `DeepVibe`
(Wortgrenzen-Muster `(?<![A-Za-z])ZCode(?![A-Za-z])`), u. a. in:

- `packages/ui/src/i18n/locales/{en-US,zh-CN}.ts` (193 Strings; Locale-**Schlüssel**
  wie `titleBar.menu.help.toggleZCodeStdioTap` bleiben unverändert).
- `packages/shared/src/{desktopMenu,process-names,plugin-display-name,openrouter-attribution}.ts`.
- `packages/services/src/paths.ts`, `packages/services/src/runtime-tools/appCaCert.ts`.
- `packages/web/src/auth/webAuthLocale.ts`, `packages/web/src/share/ConversationShareLandingPage.tsx`.
- UI: `WorkspaceSidebarFooter.tsx`, `WelcomeScreen.tsx`, `WorkspaceShellLayout.tsx`,
  Logo-`alt`/`aria-label`-Stellen, `ConversationShareReadonlyTimeline.tsx`,
  `lib/builtinSkillI18n.ts`.
- Desktop: `desktopRuntimeEnv.ts`, `forceUpdatePrompt.ts`, `desktopOAuthDeepLink.ts`,
  `desktopFinderOpenFolderWorkflow.ts`, `desktopWindowsOpenFolderContextMenu.ts`,
  `desktopLinuxDeepLinkRegistration.ts`, `desktopCommandHandlers.ts`,
  `windowsCuaOperationIndicatorContent.ts`, `renderer/cuaPermissionPanelMessages.ts`,
  `host/browserControlMainBridge.ts`, `scripts/devElectronAppBundle.mjs`.

Bewusst **unverändert** (Interop/Interna): `@zcode/*`, `ZCODE_*`-Env, Schema `zcode`,
`__zcode*`-Globals, `zcodeBridge`, `zcode-browser-*`, `zcode-window-bounds`, `zcode.cjs`,
`.zcode-install-manifest`, `zcode-playwright-*`, `zcode-embedded-browser`, `zcodeagentmcp`,
`directorySource: "zcode"`, Legacy-Migrationspfade in `main/mcpUserDirectory/legacy.ts`,
die Laufzeit-Matching-Strings in `v4/conversationProjectionStore.ts` und
`lib/zcodeUiError.ts` (`GENERIC_ZCODE_UI_ERROR_MESSAGES` wird gegen Agent-Ausgaben gematcht).

App-IDs: Dev-AUMID `eu.deepvibe.ide.dev`, Dev-Bundle `eu.deepvibe.ide.development`,
Finder-Workflow `eu.deepvibe.ide.finder-open-workflow` (statt `cn.aminer.zcode` bzw.
`dev.zcode.app.*`).

## 4. Agent → Mate

`Agent`/`agent` in sichtbaren Strings lokalisieren und auf „Mate"/„Mates" umstellen;
interne IDs (`agentId`, `agentType`, RPC-Namen) **unverändert** lassen.

## 4b. Provider-Bereinigung & Connect-Umleitung

Entschieden (2026-09-26, Betreiber-Entscheidung: DeepVibe ist DeepSeeks IDE).

- **Raus aus Settings → Model Settings → Providers:** „Z.ai", „BigModel" und die beiden
  „Start Plan"-Einträge (Individuals/For Teams). Umgesetzt, indem
  `PRESET_PROVIDER_SPECS` und `CODING_PLAN_PROVIDER_SPECS` in
  `packages/ui/src/settings/model-provider-section/constants.ts` leer sind; leere
  Navigationsgruppen werden in `Navigation.tsx` nicht mehr gerendert.
- **Z.ai und BigModel bleiben erhalten** – aber untergeordnet als BYOK-Templates unter
  „+ Add provider" (Templates in `config/provider/zcode-builtin.json` unverändert).
  Kimi, MiniMax, DeepSeek, Qwen, OpenRouter usw. bleiben dort ebenfalls.
- **Connect-Umleitung raus:** Der Footer-Eintrag „Connect" (`app.login`) öffnete den
  WelcomeScreen („Startseite"). Der Eintrag wird entfernt; der Profil-Button samt Menü
  bleibt. Login bleibt optional über Settings (`manual-login`) sowie die Pfade
  `provider-request`/`session-expired` erreichbar.
- **Falle vermeiden:** Externe Anbieter-/Kaufseiten dürfen nicht eingebettet werden
  (aus der Z.ai-Loginseite kam man nicht mehr heraus). Mit entfernten Coding-Plan-
  Providern ist der eingebettete Coding-Plan-Webview nicht mehr erreichbar; der
  Footer-„Upgrade"-Eintrag wird ohne auflösbares Ziel nicht mehr angezeigt.
- **„🚀 Upgrade" + „Upgrade Plan"-Seite entfernt:** Der Eintrag im Profilmenü ist raus;
  `CodingPlanUpgradeDialogProvider` ist ein zentraler No-op, sodass die eingebettete
  „Upgrade Plan"-Seite (`settings.modelProvider.codingPlan.webview.title`) an keinem
  Einstiegspunkt mehr aufgebaut wird.
- **„Onboard"-Einstieg:** Öffnet weiterhin die Onboarding-Auswahl (Occupation/Mode).
  Kein Lockout: `OccupationOnboarding` hat „Skip"/Close; nach App-Neustart startet
  DeepVibe dank optionalem Login wieder im Workspace.
- **DeepSeek-Einstieg (umgesetzt 2026-09-26):** Fester „DeepSeek"-Button oben in der
  Provider-Navigation (`Navigation.tsx` → `DeepSeekPlatformCard`, `ProviderLogo`-Asset
  `deepseek`), Ziel `https://platform.deepseek.com`. Öffnet **ausschließlich extern**
  (`platform.openExternal`), damit man nicht in einer eingebetteten Vendor-Seite
  festhängt. `providerRules` dürfen laut
  `packages/provider/src/config/rule-data-schema.ts:105` kein `standard-personal`
  erzeugen; ein automatisch angelegter DeepSeek-Provider ist daher nicht umgesetzt.
- **Ollama (umgesetzt 2026-09-26):** neues Template `ollama` in
  `config/provider/zcode-builtin.json` („Ollama (Local)", `openai-chat-completions`,
  `http://localhost:11434/v1`, leere `builtinModelIds` → Modelle trägt der Nutzer ein).
  Erscheint unter „+ Add provider".
- **Offen — „Dual":** Betreiber-Wunsch, die IDE zweimal zu denken: einmal als
  Multi-Provider-IDE, einmal als „DeepSeek Standalone". Noch nicht spezifiziert.
- **Logo:** Das Z-Logo (`packages/ui/src/assets/provider-icons/logo-zai.svg`
  + `ZCodeAboutLogo`/Wordmark) wird später durch das DeepVibe-Logo ersetzt, sobald der
  Asset vorliegt. Hintergrund auf der Hauptseite (`App.tsx` `appLogoUrl`) mitwechseln.

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
