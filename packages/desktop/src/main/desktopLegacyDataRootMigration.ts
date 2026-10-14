import { existsSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { VIBE_DATA_DIR_NAME, VIBE_LEGACY_DATA_DIR_NAME } from "@zcode/shared";

const ZCODE_DATA_BASE_DIR_ENV_KEY = "ZCODE_DATA_BASE_DIR";

/**
 * DeepVibe legte seine Daten früher unter `<base>/.zcode` ab; die Datenwurzel heißt jetzt
 * `<base>/.deepvibe`. Beim ersten Start nach dem Umstieg einmalig umbenennen, solange das Ziel
 * noch nicht existiert — sonst würde DeepVibe mit leeren Einstellungen/Sessions/Logins starten.
 *
 * Nur DeepVibe (`.deepvibe`) übernimmt die Altdaten. Andere Flavors starten frisch in ihrem
 * eigenen Ordner und dürfen `.zcode` nicht übernehmen (es liegt im selben Verzeichnis).
 *
 * Muss VOR jedem Lesezugriff auf die Datenwurzel laufen (desktopEarlyDataBaseDirBootstrap).
 */
export function applyLegacyDataRootMigration(baseDir?: string): void {
  if (VIBE_DATA_DIR_NAME === VIBE_LEGACY_DATA_DIR_NAME) {
    return;
  }
  if (VIBE_DATA_DIR_NAME !== ".deepvibe") {
    return;
  }
  const resolvedBaseDir = baseDir ?? (process.env[ZCODE_DATA_BASE_DIR_ENV_KEY]?.trim() || homedir());
  const legacyPath = join(resolvedBaseDir, VIBE_LEGACY_DATA_DIR_NAME);
  const targetPath = join(resolvedBaseDir, VIBE_DATA_DIR_NAME);
  if (existsSync(targetPath) || !existsSync(legacyPath)) {
    return;
  }
  try {
    renameSync(legacyPath, targetPath);
  } catch {
    // Best effort: schlägt die Umbenennung fehl (z. B. Rechte), startet die App frisch,
    // ohne die Altdaten zu beschädigen.
  }
}

applyLegacyDataRootMigration();
