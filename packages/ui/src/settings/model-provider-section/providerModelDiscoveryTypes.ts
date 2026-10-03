/**
 * Typen für die Provider-Modell-Erkennung ("Load models").
 *
 * Bewusst in einem eigenen Modul, damit Dialog, Picker und die durchgereichten
 * Callback-Props dieselben Typen teilen, ohne einen Import-Zyklus zwischen
 * Dialog und Picker zu erzeugen.
 */

/** Ein vom Provider-Endpoint entdecktes Modell (z. B. lokales Ollama). */
export interface DiscoveredProviderModel {
  readonly id: string;
  readonly displayName?: string;
}

export type ProviderModelListLoader = () => Promise<readonly DiscoveredProviderModel[]>;

/** Rückgabe des Discovery-RPC: die am Provider-Endpoint verfügbaren Modelle. */
export interface ProviderModelListResult {
  readonly models: readonly DiscoveredProviderModel[];
}
