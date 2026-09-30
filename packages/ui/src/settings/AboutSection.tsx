import { ExternalLink } from "lucide-react";
import { VIBE_PERSONA, ZCODE_VERSION } from "@zcode/shared";
import kofiLogoUrl from "@/assets/provider-icons/ko-fi-logo.png";
import { Button } from "@/components/ui/button.js";
import { usePlatform } from "@/hooks/usePlatform.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";

const ZCODE_REPO_URL = "https://github.com/zai-org/ZCode";
const MINIMAX_CODE_REPO_URL = "https://github.com/MiniMax-AI/minimax-code";
const KO_FI_URL = "https://ko-fi.com/modestcoder";

/**
 * „Über & Danksagung": Version, Lizenzen und die Projekte, auf denen DeepVibe aufbaut.
 * Die harten Lizenztexte liegen zusätzlich in NOTICE/THIRD-PARTY-NOTICES; diese Seite
 * macht sie für Nutzer sichtbar (Apache-2.0 ZCode, MIT MiniMax Code/Mavis).
 */
export function AboutSection() {
  const platform = usePlatform();
  const { intl } = useZCodeIntl();

  const openExternal = (url: string) => {
    void platform.openExternal(url);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {intl.formatMessage({ id: "settings.about.title" })}
        </h3>
        <p className="text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.about.description" })}
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-ui-base font-semibold text-foreground">
            {VIBE_PERSONA.productName}
          </span>
          <span className="text-ui-base text-foreground-subtle">{ZCODE_VERSION}</span>
        </div>
        <p className="text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage(
            { id: "settings.about.app.detail" },
            { product: VIBE_PERSONA.productName, provider: VIBE_PERSONA.providerLabel },
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
          <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
            {intl.formatMessage({ id: "settings.about.support.text" })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="rounded-lg"
            onClick={() => openExternal(KO_FI_URL)}
          >
            <img src={kofiLogoUrl} alt="" aria-hidden="true" className="size-4" />
            {intl.formatMessage({ id: "settings.about.support.button" })}
          </Button>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-2">
          <p className="text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.about.builtOn" })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="rounded-lg"
              onClick={() => openExternal(ZCODE_REPO_URL)}
            >
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              ZCode · Apache-2.0
            </Button>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="rounded-lg"
              onClick={() => openExternal(MINIMAX_CODE_REPO_URL)}
            >
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              MiniMax Code / Mavis · MIT
            </Button>
          </div>
        </div>

        <p className="text-ui-xs leading-5 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.about.trademark" })}
        </p>
      </div>
    </section>
  );
}
