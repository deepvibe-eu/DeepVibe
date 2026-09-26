import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { CodingPlanUpgradeDialogTarget } from "@/settings/CodingPlanUpgradeDialog.js";

import {
  useCodingPlanEntryPlanList,
  type CodingPlanEntryInventory,
} from "@/hooks/useCodingPlanEntryPlanList.js";

interface CodingPlanUpgradeDialogContextValue {
  inventory: CodingPlanEntryInventory;
  openCodingPlanUpgrade: (
    target: CodingPlanUpgradeDialogTarget,
    observation?: { signal: AbortSignal; onResult: (opened: boolean) => void },
  ) => boolean;
}

const CodingPlanUpgradeDialogContext = createContext<CodingPlanUpgradeDialogContextValue | null>(
  null,
);

/**
 * DeepVibe: Coding-Plan-Upgrades sind entfernt. Die eingebettete „Upgrade Plan"-Seite
 * (z.ai/BigModel-Webview, aus der man nicht mehr herauskam) wird nicht mehr aufgebaut.
 * Alle Einstiegspunkte teilen sich diesen Provider, daher genügt hier der zentrale
 * No-op: der Klick wird als „nicht geöffnet" beantwortet, ohne Webview/State.
 */
export function CodingPlanUpgradeDialogProvider({ children }: { children: ReactNode }) {
  const inventory = useCodingPlanEntryPlanList();
  const openCodingPlanUpgrade = useCallback(
    (
      _target: CodingPlanUpgradeDialogTarget,
      observation?: { signal: AbortSignal; onResult: (opened: boolean) => void },
    ) => {
      observation?.onResult(false);
      return false;
    },
    [],
  );
  const value = useMemo(
    () => ({ openCodingPlanUpgrade, inventory }),
    [openCodingPlanUpgrade, inventory],
  );

  return (
    <CodingPlanUpgradeDialogContext.Provider value={value}>
      {children}
    </CodingPlanUpgradeDialogContext.Provider>
  );
}

export function useCodingPlanUpgradeDialog() {
  const context = useContext(CodingPlanUpgradeDialogContext);
  if (!context) {
    throw new Error(
      "useCodingPlanUpgradeDialog must be used within CodingPlanUpgradeDialogProvider",
    );
  }
  return context;
}

/**
 * 可独立挂载的 conversation pane 使用可选上下文；完整 App Root 仍会注入真实购买面板。
 */
export function useOptionalCodingPlanUpgradeDialog() {
  return useContext(CodingPlanUpgradeDialogContext);
}
