# Preview Pane File Formats Specification

## Overview

The preview pane renders a growing set of file families. This documents the formats added
beyond code/text and the images/media/PDF/Office/PPTX set that already existed, and the
principle behind each choice.

## Product Rule

Only add a format when the interaction is genuinely useful. DeepVibe stays a calm, dense
editor, so formats that would push the pane toward a full authoring suite (inline HTML
rendering, Office editors) are deliberately out of scope.

### HTML — open in the browser, not in the pane

An `.html`/`.htm` file is shown as source in the pane. A faithful page render is out of
scope (the pane is too small and a site preview belongs in a real browser), so the pane
offers an **Open in browser** action instead: `IPlatformService.openExternalFile(path)`,
the same call the website open button uses. The action is only shown when the platform
exposes `openExternalFile` (desktop). Failure raises the existing
`chat.previewCards.openExternalFailed` toast.

### EPUB — read-only preview in the Office family

eBooks are authors' material and fit the Office preview family. `.epub` is detected by
`getOfficeFilePreviewKind` (kind `epub`), read through the existing binary preview path,
and rendered by `previewPaneOfficeEpubContent.tsx`.

- `lib/epubPreview.ts` unzips the EPUB (fflate) and returns a render model: title/author/
  language, the spine in reading order with each XHTML `<body>`, the book stylesheets, and
  images rewritten to `data:` URLs.
- The reader renders **one spine chapter at a time** — long books have hundreds of chapters,
  so a single document per chapter keeps the DOM small. The header offers previous/next
  buttons and a chapter picker (chapter `<title>`, falling back to the file leaf).
- The chapter is rendered inside a **sandboxed iframe** (`sandbox="allow-same-origin"`, no
  `allow-scripts`) so book CSS cannot leak into the app shell and book scripts cannot run.
  Same-origin lets `installDocumentLinkSafety` neutralise links: internal `#` anchors stay,
  external links route to the controlled browser opener.
- The reader reset precedes the book stylesheet so the book keeps its own typography; a
  readability pass follows it so dark mode stays legible.

**Not editable in this slice.** `.mobi`/`.azw3`/`.kfx` are Amazon formats with no realistic
write path; they are intentionally not previewable/editable here (convert externally).

## Status Ownership

- The Office preview family owns the loading/error lifecycle (`PreviewPane` effect +
  `PreviewPaneOfficeContent`); EPUB plugs into it like Excel/Word, no new source type.
- `lib/epubPreview.ts` is pure data (zip → model); the component owns parsing state and the
  iframe.

## Boundaries / Next

- EPUB chapter **editing** (unzip → edit chapters → repack) is the planned follow-up; it
  reuses the zip model in `lib/epubPreview.ts`.
- Other candidates (3D models, fonts, archives) are not part of this slice.
