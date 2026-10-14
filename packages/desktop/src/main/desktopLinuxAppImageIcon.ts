import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  runXdgCommand,
  XDG_COMMAND_TIMEOUT_MS,
  type LinuxDesktopCommandRunner,
  type LinuxDeepLinkRegistrationLogger,
} from "./desktopLinuxXdg.js";

// 从 desktopLinuxDeepLinkRegistration 拆出的 AppImage 用户级图标安装逻辑：
// 图标集成是可选的桌面增强，与 deep link 协议注册分属不同关注点，独立成模块便于各自演进。

const LINUX_APP_ICON_SIZE = "512x512";

// 图标名必须与 desktop entry 的 Icon= 及窗口 WM class（--class）一致，
// 否则 Wayland 的 app_id 命不中 .desktop，Dock 只显示占位图标。
function resolveLinuxUserIconFilePath(dataDir: string, iconName: string): string {
  return join(dataDir, "icons", "hicolor", LINUX_APP_ICON_SIZE, "apps", `${iconName}.png`);
}

// DeepVibe hieß früher zcode; die alte Icon-Datei wird nach dem Rename zum Waisen.
// Best-effort entfernen, damit kein „zcode"-Icon mehr im Icon-Theme herumliegt.
const LINUX_LEGACY_APP_ICON_NAME = "zcode";

function removeLegacyAppIconIfRenamed(dataDir: string, iconName: string): boolean {
  if (iconName === LINUX_LEGACY_APP_ICON_NAME) {
    return false;
  }
  const legacyPath = resolveLinuxUserIconFilePath(dataDir, LINUX_LEGACY_APP_ICON_NAME);
  if (!existsSync(legacyPath)) {
    return false;
  }
  try {
    rmSync(legacyPath);
    return true;
  } catch {
    return false;
  }
}

function copyFileIfChanged(sourcePath: string, targetPath: string): boolean {
  if (existsSync(targetPath) && readFileSync(sourcePath).equals(readFileSync(targetPath))) {
    return false;
  }

  copyFileSync(sourcePath, targetPath);
  return true;
}

function shouldInstallAppImageDesktopIcon(params: {
  env?: { APPIMAGE?: string };
  iconSourcePath?: string;
}): boolean {
  return Boolean(params.env?.APPIMAGE?.trim() && params.iconSourcePath);
}

function installLinuxAppImageDesktopIcon(params: {
  dataDir: string;
  iconName: string;
  iconSourcePath: string;
  logger: LinuxDeepLinkRegistrationLogger;
  runCommand?: LinuxDesktopCommandRunner;
}): { iconFilePath: string; installed: boolean; changed: boolean } {
  const iconFilePath = resolveLinuxUserIconFilePath(params.dataDir, params.iconName);
  if (removeLegacyAppIconIfRenamed(params.dataDir, params.iconName)) {
    params.logger.info("[deep-link] 已清理遗留的 zcode 图标", { dataDir: params.dataDir });
  }
  if (!existsSync(params.iconSourcePath)) {
    params.logger.warn("[deep-link] Linux AppImage 图标源文件不存在，跳过用户级图标安装", {
      iconSourcePath: params.iconSourcePath,
      iconFilePath,
    });
    return { iconFilePath, installed: false, changed: false };
  }

  mkdirSync(dirname(iconFilePath), { recursive: true });
  const changed = copyFileIfChanged(params.iconSourcePath, iconFilePath);
  // AppImage 直跑不会像 deb 安装包一样把 Icon=zcode 写入 hicolor 图标主题。
  // 这里在用户级 hicolor 目录补齐同名图标，让任务栏/Dock 有机会按 desktop entry 命中真实图标。
  if (!changed) {
    return { iconFilePath, installed: true, changed };
  }

  const runCommand = params.runCommand ?? runXdgCommand;
  const cacheResult = runCommand("gtk-update-icon-cache", [
    "-f",
    "-t",
    join(params.dataDir, "icons", "hicolor"),
  ]);
  if (cacheResult.error) {
    params.logger.warn("[deep-link] gtk-update-icon-cache 不可用，已跳过", {
      iconFilePath,
      message: cacheResult.error.message,
    });
  } else if (cacheResult.signal === "SIGTERM") {
    params.logger.warn("[deep-link] Linux 用户级图标缓存刷新超时，已跳过", {
      iconFilePath,
      timeoutMs: XDG_COMMAND_TIMEOUT_MS,
    });
  } else if (cacheResult.status !== 0) {
    params.logger.warn("[deep-link] Linux 用户级图标缓存刷新失败", {
      iconFilePath,
      status: cacheResult.status,
      stderr: cacheResult.stderr?.trim(),
    });
  }

  return { iconFilePath, installed: true, changed };
}

export function installLinuxAppImageDesktopIconBestEffort(params: {
  dataDir: string;
  iconName: string;
  env?: { APPIMAGE?: string };
  iconSourcePath?: string;
  logger: LinuxDeepLinkRegistrationLogger;
  runCommand?: LinuxDesktopCommandRunner;
}): { iconFilePath: string; installed: boolean; changed: boolean } | null {
  if (
    !shouldInstallAppImageDesktopIcon({
      env: params.env,
      iconSourcePath: params.iconSourcePath,
    }) ||
    !params.iconSourcePath
  ) {
    return null;
  }

  try {
    return installLinuxAppImageDesktopIcon({
      dataDir: params.dataDir,
      iconName: params.iconName,
      iconSourcePath: params.iconSourcePath,
      logger: params.logger,
      runCommand: params.runCommand,
    });
  } catch (error) {
    params.logger.warn("[deep-link] Linux AppImage 图标安装失败，已降级", {
      iconSourcePath: params.iconSourcePath,
      error,
    });
    return null;
  }
}
