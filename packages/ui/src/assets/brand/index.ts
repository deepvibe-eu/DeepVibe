import deepvibeLogoUrl from "./deepvibe-logo.png";
import deepseekWhaleBlackUrl from "./deepseek-whale-black.png";
import deepseekWhaleWhiteUrl from "./deepseek-whale-white.png";
import kimiAnimatedUrl from "../kimi_animated.png";
import moonshotBlackUrl from "../moonshot_black.png";
import moonshotWhiteUrl from "../moonshot_white.png";
import { ZCODE_PRODUCT_FLAVOR } from "@zcode/shared";

export const APP_LOGO_URL = (() => {
  switch (ZCODE_PRODUCT_FLAVOR) {
    case "kimi":
      return kimiAnimatedUrl;
    case "production":
    case "preview":
    case "deepseek":
    default:
      return deepvibeLogoUrl;
  }
})();

export const ABOUT_MARK_URL = (() => {
  switch (ZCODE_PRODUCT_FLAVOR) {
    case "kimi":
      return kimiAnimatedUrl;
    case "production":
    case "preview":
    case "deepseek":
    default:
      return deepseekWhaleWhiteUrl;
  }
})();

export const STARTUP_MARK_URL = (() => {
  switch (ZCODE_PRODUCT_FLAVOR) {
    case "kimi":
      return kimiAnimatedUrl;
    case "production":
    case "preview":
    case "deepseek":
    default:
      return deepseekWhaleWhiteUrl;
  }
})();

/** Wasserzeichen im leeren Chat: dunkle Marke auf hell, helle Marke auf dunkel. */
export const EMPTY_STATE_MARK_LIGHT_URL =
  ZCODE_PRODUCT_FLAVOR === "kimi" ? moonshotBlackUrl : deepseekWhaleBlackUrl;
export const EMPTY_STATE_MARK_DARK_URL =
  ZCODE_PRODUCT_FLAVOR === "kimi" ? moonshotWhiteUrl : deepseekWhaleWhiteUrl;
