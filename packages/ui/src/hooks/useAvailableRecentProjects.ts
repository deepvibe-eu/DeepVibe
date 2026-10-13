import { useEffect, useState } from "react";
import { useRecentProjects } from "./useSettingService.js";
import { useWorkspaceServices } from "./useWorkspaceServices.js";

/**
 * Recent projects that still exist on disk, for the workspace switcher's "switch to" list.
 *
 * The editor keeps up to ten `recentProjects` in settings; deleted folders would otherwise linger
 * as dead menu entries. We probe them with the workspace file service's `checkFilesExist` and only
 * keep the ones that are really there. Fail-open: if the probe throws, the raw recents are returned
 * so the menu never silently loses entries it showed before.
 */
export function useAvailableRecentProjects(
  workspacePath: string | null | undefined,
  workspaceIdentity?: string | null,
): string[] {
  const { recentProjects } = useRecentProjects();
  const services = useWorkspaceServices(workspacePath, undefined, workspaceIdentity);
  // Join so a fresh array identity per render does not re-run the effect every time.
  const recentsKey = recentProjects.join("\n");
  const [available, setAvailable] = useState<string[]>(recentProjects);

  useEffect(() => {
    const paths = recentsKey ? recentsKey.split("\n") : [];
    if (paths.length === 0) {
      setAvailable([]);
      return;
    }

    let disposed = false;
    void services.fileService
      .checkFilesExist({ paths })
      .then((results) => {
        if (disposed) {
          return;
        }
        setAvailable(results.filter((result) => result.exists).map((result) => result.path));
      })
      .catch(() => {
        if (!disposed) {
          setAvailable(paths);
        }
      });

    return () => {
      disposed = true;
    };
  }, [recentsKey]);

  return available;
}
