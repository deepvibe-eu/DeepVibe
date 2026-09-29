import type { UiLocale, SupportedLocale } from "@zcode/contracts";
import { deDE } from "./locales/de-DE.js";
import { enUS } from "./locales/en-US.js";
import { esES } from "./locales/es-ES.js";
import { frFR } from "./locales/fr-FR.js";
import { ruRU } from "./locales/ru-RU.js";
import { zhCN } from "./locales/zh-CN.js";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "./locale.js";
import type { ZCodeCopy } from "./types.js";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
};
export type { LocaleDetectionInput } from "./locale.js";
export type { CliCopy, TuiCopy, UiLocale, SupportedLocale, ZCodeCopy } from "./types.js";

const CATALOGS: Record<SupportedLocale, ZCodeCopy> = {
  "en-US": enUS,
  "zh-CN": zhCN,
  "de-DE": deDE,
  "es-ES": esES,
  "fr-FR": frFR,
  "ru-RU": ruRU,
};

export function getZCodeCopy(locale?: UiLocale | string, detected?: string | null): ZCodeCopy {
  return CATALOGS[resolveLocale(locale, detected)];
}
