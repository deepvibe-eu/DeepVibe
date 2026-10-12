"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { parseEpubPreview, type ParsedEpubPreview } from "@/lib/epubPreview.js";
import { installDocumentLinkSafety } from "@/lib/officeFilePreview.js";
import { getPathLeaf } from "@/lib/path.js";
import { logger } from "@/logger.js";

function buildEpubStyle(preview: ParsedEpubPreview, isDark: boolean): string {
  const foreground = isDark ? "#e6e6e6" : "#1f2328";
  const border = isDark ? "#3a3a3a" : "#e5e7eb";
  const link = isDark ? "#6ea8fe" : "#2563eb";
  // Reader reset runs before the book stylesheet (so the book controls its own typography);
  // the readability pass runs after it so dark mode stays legible even when the book hard-codes
  // a light-only text color.
  const reset = [
    'html{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
    "img,svg,video{max-width:100%;height:auto}",
    `.zcode-epub-chapter+.zcode-epub-chapter{margin-top:28px;padding-top:28px;border-top:1px solid ${border}}`,
  ].join("");
  const readability = [
    "html,body{background:transparent}",
    `body{margin:0;padding:16px 20px;color:${foreground};line-height:1.6;font-size:14px;-webkit-text-size-adjust:100%}`,
    `a{color:${link}}`,
  ].join("");
  return `${reset}\n${preview.css}\n${readability}`;
}

function buildEpubSrcDoc(preview: ParsedEpubPreview, isDark: boolean): string {
  const sections = preview.chapters
    .map((chapter) => `<section class="zcode-epub-chapter">${chapter.html}</section>`)
    .join("");
  // The book lives in a sandboxed iframe so its styles cannot leak into the app shell; images
  // are already inlined as data URLs by the parser, so no origin access is required to render.
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<style>${buildEpubStyle(preview, isDark)}</style></head><body>`,
    sections,
    "</body></html>",
  ].join("");
}

export function PreviewPaneOfficeEpubContent({
  buffer,
  errorMessage,
  isDark,
  onOpenBrowserUrl,
  sourcePath,
}: {
  buffer: ArrayBuffer;
  errorMessage: string;
  isDark: boolean;
  onOpenBrowserUrl?: (url: string) => void;
  sourcePath: string;
}) {
  const { intl } = useZCodeIntl();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [preview, setPreview] = useState<ParsedEpubPreview | null>(null);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    let disposed = false;
    setPreview(null);
    setParseError(false);

    void parseEpubPreview(buffer)
      .then((parsed) => {
        if (!disposed) {
          setPreview(parsed);
        }
      })
      .catch((error: unknown) => {
        if (disposed) {
          return;
        }
        logger.error(`[PreviewPane] EPUB 解析失败 path=${sourcePath}:`, error);
        setParseError(true);
      });

    return () => {
      disposed = true;
    };
  }, [buffer, sourcePath]);

  const srcDoc = useMemo(
    () => (preview ? buildEpubSrcDoc(preview, isDark) : ""),
    [isDark, preview],
  );
  const handleFrameLoad = useCallback(() => {
    const document = iframeRef.current?.contentDocument;
    if (document?.body) {
      // Same-origin sandbox lets us neutralise links: internal anchors stay, external links
      // route to the controlled browser opener instead of navigating the pane.
      installDocumentLinkSafety(document.body, onOpenBrowserUrl);
    }
  }, [onOpenBrowserUrl]);

  if (parseError) {
    return (
      <div className="p-3 text-ui-base text-destructive" role="alert">
        {errorMessage}
      </div>
    );
  }

  if (!preview) {
    return (
      <div
        aria-busy="true"
        className="h-full min-h-0 w-full bg-background"
        data-epub-preview-pending="true"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 text-ui-base text-foreground-subtle">
        <span className="truncate text-foreground">{preview.title ?? getPathLeaf(sourcePath)}</span>
        {preview.author ? <span className="truncate">· {preview.author}</span> : null}
        <span className="ml-auto shrink-0">
          {intl.formatMessage(
            { id: "codeViewer.epub.chapters" },
            { count: preview.chapters.length },
          )}
        </span>
      </div>
      <iframe
        ref={iframeRef}
        title={preview.title ?? sourcePath}
        sandbox="allow-same-origin"
        onLoad={handleFrameLoad}
        srcDoc={srcDoc}
        className="min-h-0 w-full flex-1 border-0 bg-background"
      />
    </div>
  );
}
