import deepvibeLogoUrl from "./deepvibe-logo.png";
import deepseekWhaleWhiteUrl from "./deepseek-whale-white.png";
import kimivibeMarkUrl from "./kimivibe-mark.png";
import { ZCODE_PRODUCT_FLAVOR } from "@zcode/shared";

export const APP_LOGO_URL = (() => {
  switch (ZCODE_PRODUCT_FLAVOR) {
    case "kimi":
      return kimivibeMarkUrl;
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
      return kimivibeMarkUrl;
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
      return kimivibeMarkUrl;
    case "production":
    case "preview":
    case "deepseek":
    default:
      return deepseekWhaleWhiteUrl;
  }
})();
