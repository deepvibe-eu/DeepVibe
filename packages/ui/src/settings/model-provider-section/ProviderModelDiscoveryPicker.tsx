import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { cn } from "@/components/lib/utils.js";
import { modelEditorControlStyle } from "@/settings/model-provider-section/modelEditorControlStyle.js";
import type {
  DiscoveredProviderModel,
  ProviderModelListLoader,
} from "@/settings/model-provider-section/providerModelDiscoveryTypes.js";

/**
 * Lädt die am Provider-Endpoint verfügbaren Modelle und bietet sie zur Auswahl an.
 *
 * Rein additiver Helfer: Der Nutzer kann die Modell-ID weiterhin frei eintippen.
 * Erst nach explizitem "Modelle laden" wird das Netzwerk berührt.
 */
export function ProviderModelDiscoveryPicker({
  currentModelId,
  disabled = false,
  loadModels,
  onSelectModelId,
}: {
  currentModelId: string;
  disabled?: boolean;
  loadModels: ProviderModelListLoader;
  onSelectModelId: (modelId: string) => void;
}) {
  const { intl } = useZCodeIntl();
  const [models, setModels] = useState<readonly DiscoveredProviderModel[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const selectedModelId = (models ?? []).some((model) => model.id === currentModelId)
    ? currentModelId
    : "";
  const load = async () => {
    setStatus("loading");
    try {
      setModels(await loadModels());
      setStatus("idle");
    } catch {
      setModels(null);
      setStatus("error");
    }
  };
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="default"
        className="rounded-lg"
        disabled={disabled || status === "loading"}
        onClick={() => void load()}
      >
        {status === "loading" ? (
          <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
        ) : null}
        {intl.formatMessage({ id: "settings.modelProvider.loadModels" })}
      </Button>
      {models !== null && models.length > 0 ? (
        <select
          aria-label={intl.formatMessage({ id: "settings.modelProvider.loadModelsPlaceholder" })}
          className={cn("h-9 min-w-0 flex-1 rounded-md", modelEditorControlStyle(false))}
          value={selectedModelId}
          onChange={(event) => onSelectModelId(event.target.value)}
        >
          <option value="" disabled>
            {intl.formatMessage({ id: "settings.modelProvider.loadModelsPlaceholder" })}
          </option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.displayName ?? model.id}
            </option>
          ))}
        </select>
      ) : null}
      {models !== null && models.length === 0 ? (
        <span className="text-ui-sm text-foreground-subtle">
          {intl.formatMessage({ id: "settings.modelProvider.loadModelsEmpty" })}
        </span>
      ) : null}
      {status === "error" ? (
        <span className="text-ui-sm text-destructive">
          {intl.formatMessage({ id: "settings.modelProvider.loadModelsError" })}
        </span>
      ) : null}
    </div>
  );
}
