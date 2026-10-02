# Flavor versioning

## Product rule

Every Vibe flavor owns its own version line. A release of one flavor must not
force a version bump of another flavor.

- **DeepVibe line** (`production`, `preview`, `deepseek`) keeps the version in
  the root `package.json`. There is no per-flavor entry for these flavors.
- **Every other flavor** (`kimi`, later `lama`, …) registers its version in
  `flavors/versions.json`.
- A release tag must carry the same version as the resolved flavor version:
  `v1.0.2` for DeepVibe, `kimivibe-v1.0.2` for KimiVibe.

The resolved version is the single source for:

- the embedded renderer/main/host constant `ZCODE_VERSION` (tsup + vite `define`),
- the installer version (`electron-builder` `extraMetadata.version`),
- the About snapshot and the packaged `build-meta.json`,
- the agent/remote runtime `ZCODE_APP_VERSION`,
- the Windows browser-import helper assembly version.

## Owner and interface

`packages/desktop/scripts/flavor-version.mjs` owns the resolution:

```
explicit ZCODE_APP_VERSION
  > flavors/versions.json[flavor]
  > root package.json version
```

`packages/desktop/scripts/build-metadata.mjs` is the single collector; all
desktop build configs (`tsup.config.ts`, `vite.config.ts`,
`electron-builder.config.js`) read the resolved `appVersion` from it. The
Windows helper (`build-windows-browser-import-helper.mjs`) uses the same
resolver instead of reading the root `package.json` directly.

The flavor choice follows the existing identity axis in
`desktop-product-identity.mjs`; the backend environment stays on `ZCODE_ENV`.

## Release tags

Both release workflows pass the pushed/selected tag as `ZCODE_APP_VERSION`.
`build-metadata.mjs` strips a non-numeric prefix, so `kimivibe-v1.0.2` and
`v1.0.2` both resolve to `1.0.2`. This keeps tag and embedded version in sync
without editing `flavors/versions.json` at release time.

Local packaging (`ZCODE_KIMI_IDENTITY=1 pnpm bundle:desktop …`) has no tag, so
it uses `flavors/versions.json`.

## Acceptance scenarios

1. `ZCODE_KIMI_IDENTITY=1` build with `flavors/versions.json` `kimi: "1.0.1"`
   embeds and packages version `1.0.1`.
2. `ZCODE_ENV=production` build without a flavor override embeds the root
   `package.json` version.
3. `ZCODE_APP_VERSION=kimivibe-v2.3.0` wins over both the override and the root
   version and yields `2.3.0`.
4. An invalid `flavors/versions.json` fails the build instead of silently
   falling back.

## Out of scope

The update feed (`VIBE_UPDATE_FEED_URL`) is still a single hub URL. A follow-up
has to decide whether each flavor updates from its own repository or from the
shared hub; this spec only covers the version line.
