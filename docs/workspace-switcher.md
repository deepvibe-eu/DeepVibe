# Workspace Switcher Specification

## Overview

DeepVibe keeps **several workspaces open at once as tabs** (`store/tabStore.ts`), shows them in the
sidebar list (`TID_WORKSPACE_LIST`), persists up to 10 `recentProjects` in app settings, and offers
"Open folder". The composer already has a **workspace menu** (`ChatEmptyWorkspacePreviewMenu`) that lists
the *open* workspaces and switches between them; its search field exists but there is nothing else to
search. What was missing: the **recent** folders — so a workspace can be changed without the file dialog.

## Product Rule

- The composer workspace menu gains a **"Switch to"** section listing recent project folders that are
  **not already open** and **still exist on disk**.
- Selecting one opens it through the app's single open-workspace path, which also adds it to the sidebar
  (as a tab) if it is not there yet — without touching the file dialog.
- Switching an already-open workspace keeps its draft; opening a recent starts that workspace's draft,
  exactly like "Open folder" does today.
- The section is searchable through the menu's existing search field, and hidden when there is nothing to
  show (no recents, all already open, or the host cannot open workspaces).

## Status Ownership

- **Open workspaces:** `tabStore` (`tabs`, `activeTabId`) is the single source of truth; switching uses
  the existing `onSelectWorkspace` (draft switch), never a second "current workspace" field.
- **Recents:** `settings.recentProjects`, written only by the existing open-folder flow.
- **Existing on disk:** filtered by `hooks/useAvailableRecentProjects` via `IFileService.checkFilesExist`,
  **fail-open** (probe error → show all recents) so the menu never silently drops entries.
- **Opening a recent:** the existing `handleSelectProject(path)` (Root) — de-dupes tabs, activates a window
  that already has the folder, and updates `recentProjects`. No second write path.
- **Prop chain:** `Root.handleSelectProject` → `RootWorkspaceContent.handleSelectProject` →
  `WorkspaceShellLayout.onOpenProject` → `ChatEmptyWorkspacePreviewMenu.onOpenProject`.

## Interface

```ts
// ChatEmptyWorkspacePreviewMenu (additions; existing props unchanged)
recentProjects?: string[];           // existing recent folders (already existence-filtered by caller)
onOpenProject?: (path: string) => void; // open/activate a specific folder

// WorkspaceShellLayoutProps
onOpenProject?: (path: string) => void;
```

## Events

```text
open workspace menu ── search filters both open workspaces AND "switch to" recents
select open workspace ── onSelectWorkspace(tab)      // existing: draft switch, keeps its state
select recent        ── onOpenProject(path)          // existing open flow → addTab + activate + recents
open "Open folder…"  ── onOpenFolder()               // existing, unchanged
```

## Acceptance

- Menu lists open workspaces (current marked) **and** a "Switch to" section of recent, existing, not-open
  folders; both honour the search field.
- Selecting a recent opens it and it appears in the sidebar; selecting an open one activates it.
- Deleting a recent folder removes it from the list (existence probe); a probe failure keeps it.
- Section hidden when empty; `allowOpenWorkspace === false` still hides "Open folder…" only.
- i18n in all 6 locales; reuses the existing `DropdownMenuItem` styling and `DESIGN.md` tokens.

## Out of Scope

- Removing/editing recents, per-workspace settings, remote workspace switching (unchanged).
