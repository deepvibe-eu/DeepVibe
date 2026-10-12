# winget (Windows Package Manager)

Manifests for the official [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs)
catalog. Once merged, Windows users can install DeepVibe with:

```powershell
winget install deepvibe-eu.DeepVibe
```

## Files

- `deepvibe-eu.DeepVibe.yaml` — version manifest
- `deepvibe-eu.DeepVibe.installer.yaml` — installer manifest (NSIS `nullsoft`, machine scope, x64)
- `deepvibe-eu.DeepVibe.locale.en-US.yaml` — default-locale metadata

## Updating for a new release

1. Bump `PackageVersion` and `ReleaseDate` in all three files.
2. Update `InstallerUrl` to the new `DeepVibe-<ver>-win-x64.exe` and refresh
   `InstallerSha256` (uppercase hex).
3. Copy the three files into a `microsoft/winget-pkgs` fork at
   `manifests/d/deepvibe-eu/DeepVibe/<version>/` and open a PR against `master`.
   The PR body must include the following submission template.

## Submission template (PR body)

```
- [x] Have you signed the [Contributor License Agreement](https://cla.opensource.microsoft.com)?
- [x] Have you checked that there aren't other open [pull requests](../../pulls) for the same manifest update/change?
- [x] Have you [validated](https://github.com/microsoft/winget-pkgs/blob/master/CONTRIBUTING.md#validation) your manifest locally with `winget validate --manifest <path>`?
      (best effort on Linux; CI is authoritative)
- [x] Have you tested your manifest locally with `winget install --manifest <path>`?
      (installer verified on Windows, report if the automated CI can install it)
- [x] Does your manifest conform to the [1.6 schema](https://github.com/microsoft/winget-pkgs/tree/master/doc/manifest/schema/1.6.0)?

###### Microsoft Reviewers: [Open in CodeFlow](https://microsoft.github.io/codeflow)
```

## Notes

- The installer is **unsigned** (Azure Trusted Signing is unavailable for individual
  developers outside the US/Canada). winget does **not** sign packages; it only
  provides discoverability, so SmartScreen may still warn on first run.
- `Scope: machine` matches the installer's `nsis.perMachine` build setting
  (`ZCode/electron-builder.config.js`), which forces an all-users install into
  `Program Files` behind a UAC prompt.
