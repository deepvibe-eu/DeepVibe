# Preview Pane Code Editor Specification

## Overview

The preview pane (`PreviewPane`, one instance per `code-viewer` tab) already shows text
files through a read-only viewer (`@pierre/diffs`). This adds an in-app editor so the user
can change a file without leaving DeepVibe or switching to an external editor.

Editing is an addition to the existing viewer, not a replacement: the read-only viewer
stays the default, and "open in external editor" keeps working.

## Product Rule

- A text file preview shows an **Edit** action when the file can be edited safely.
- Edit mode replaces the viewer with a syntax-highlighted editor (CodeMirror 6).
- Edit mode exposes **Undo**, **Redo**, **Save** and a dirty indicator.
- Save writes the current buffer back to the same path via the existing file service.
- Leaving edit mode keeps the buffer; re-entering it restores the unsaved draft.
- The user is warned and the write is refused when the file changed on disk since it was
  read (another writer, e.g. the agent, moved ahead).

## Editability

A file is editable only when **all** hold:

- the source is a real file preview (`source.type === "file"`, not an inline tool-output
  `text` preview and not a read-only `code-review`),
- the read produced text (`!filePreview.isBinary`),
- the read was not truncated (`!filePreview.truncated`) — the reader clamps to
  `MAX_TEXT_READ_BYTES` (5 MB, `packages/services/src/file/fileService.ts`) and to
  `FILE_VIEWER_MAX_TEXT_BYTES` in the UI, so a truncated read means the buffer is partial
  and must never be written back.

## Status Ownership

- **Owner:** the `PreviewPane` instance owns per-tab edit state — `editMode`,
  `draftContent`, `baselineMtimeMs`, and save status. Because one `PreviewPane` is mounted
  per `code-viewer` tab, this is naturally per-tab and survives the heavy content being
  unmounted while the tab is inactive.
- **Editor component:** `EditableCodeContent` / `CodeEditor` own the CodeMirror view and
  its history, but no durable state. They are initialized from `draftContent` and report
  changes upward, so an unmount/remount (inactive tab, resize) re-initializes without data
  loss.
- **Write path:** exactly one — `IFileService.writeTextFile`. The editor never touches the
  filesystem directly.

## Event Order

```text
toggle Edit ─ draftContent ??= filePreview.content ; capture baselineMtimeMs
editor change ─ setDraftContent(next) ; dirty = next !== filePreview.content
Save ─ guard(dirty, editable) ─ writeTextFile({path, content, expectedMtimeMs})
        ├─ ok            ─ filePreview.content = draft ; baselineMtimeMs = result.mtimeMs
        ├─ write_file_stale ─ surface "reload before saving" ; keep draft
        └─ other error   ─ surface error ; keep draft
Undo / Redo ─ CodeMirror history commands through the editor handle
```

## Interface

- `IFileService.writeTextFile({ path, content, expectedMtimeMs? }): Promise<{ mtimeMs }>`
  (already present). `expectedMtimeMs` rejects the write with `write_file_stale` when the
  on-disk mtime differs from the one the buffer was read at.
- `FileTextSlice.mtimeMs` — the mtime the text read observed, used as `expectedMtimeMs`.

## Failure Semantics

- Stale write (`write_file_stale`): the write is refused; the draft is kept and the user is
  told to reload. No silent overwrite of another writer's change.
- Other write errors: surfaced, draft kept.
- A file that is not editable never shows the Edit action.
