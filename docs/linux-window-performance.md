# Linux Window Performance Specification

## Overview

On Linux, opaque/transparent frameless windows jitter during native interactive resize (and when
moving) under Electron's default **ANGLE/OpenGL** backend. The same build resizes smoothly with
**ANGLE/Vulkan** (electron/electron#52866). DeepVibe's main window is frameless + transparent on
Linux (`desktopWindowChrome.ts`), so it shows the effect.

## Product Rule

- On Linux, select the **ANGLE/Vulkan** backend so frameless windows resize/move smoothly.
- Provide an escape hatch: `ZCODE_DISABLE_VULKAN_BACKEND=1` restores Electron's default backend, for
  machines without a working Vulkan driver.
- Do not change macOS/Windows: they use their own backends and are unaffected.

## Implementation

`packages/desktop/src/main/index.ts`, before any `BrowserWindow` is created (next to the existing
Linux `--class` switch):

```ts
if (process.platform === "linux" && process.env.ZCODE_DISABLE_VULKAN_BACKEND !== "1") {
  app.commandLine.appendSwitch("use-angle", "vulkan");
  app.commandLine.appendSwitch(
    "enable-features",
    "Vulkan,DefaultANGLEVulkan,VulkanFromANGLE",
  );
}
```

## Acceptance

- On Linux the app starts with the Vulkan/ANGLE configuration; frameless resize/move no longer jitters.
- With `ZCODE_DISABLE_VULKAN_BACKEND=1` the switches are not added and the app behaves as before.
- macOS/Windows command line is unchanged.

## Risk / Notes

- If a target has no usable Vulkan driver, Chromium may fall back to software rendering; the escape
  hatch is the remedy. Fix 2 of the two window tricks (Obsidian-style extra-pixel inset) is a separate,
  larger change and remains open.
