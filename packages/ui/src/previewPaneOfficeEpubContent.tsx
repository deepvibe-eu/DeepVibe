"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { parseEpubPreview, type EpubChapter, type ParsedEpubPreview } from "@/lib/epubPreview.js";
import { installDocumentLinkSafety } from "@/lib/officeFilePreview.js";
import { getPathLeaf } from "@/lib/path.js";
import { logger } from "@/logger.js";

function buildEpubStyle(preview: ParsedEpubPreview, isDark: boolean): string {
  const foreground = isDark ? "#e6e6e6" : "#1f2328";
  const link = isDark ? "#6ea8fe" : "#2563eb";
  // Reader reset runs before the book stylesheet (so the book controls its own typography);
  // the readability pass runs after it so dark mode stays legible even when the book hard-codes
  // a light-only text color.
  const reset = [
    'html{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
    "img,svg,video{max-width:100%;height:auto}",
  ].join("");
  const readability = [
    "html,body{background:transparent}",
    `body{margin:0;padding:16px 20px;color:${foreground};line-height:1.6;font-size:14px;-webkit-text-size-adjust:100%}`,
    `a{color:${link}}`,
  ].join("");
  return `${reset}\n${preview.css}\n${readability}`;
}

function buildEpubChapterSrcDoc(
  preview: ParsedEpubPreview,
  chapter: EpubChapter,
  isDark: boolean,
): string {
  // One chapter per document keeps the DOM small for very long books (hundreds of spine items).
  // The chapter lives in a sandboxed iframe so its styles cannot leak into the app shell; images
  // are already inlined as data URLs by the parser, so no origin access is required to render.
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<style>${buildEpubStyle(preview, isDark)}</style></head><body>`,
    chapter.html,
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
  const [chapterIndex, setChapterIndex] = useState(0);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    let disposed = false;
    setPreview(null);
    setParseError(false);

    void parseEpubPreview(buffer)
      .then((parsed) => {
        if (disposed) {
          return;
        }
        setPreview(parsed);
        setChapterIndex(0);
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

  const chapters = preview?.chapters ?? [];
  const chapter = chapters[chapterIndex] ?? null;
  const srcDoc = useMemo(
    () => (preview && chapter ? buildEpubChapterSrcDoc(preview, chapter, isDark) : ""),
    [chapter, isDark, preview],
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

  if (!preview || !chapter) {
    return (
      <div
        aria-busy="true"
        className="h-full min-h-0 w-full bg-background"
        data-epub-preview-pending="true"
      />
    );
  }

  const canGoPrevious = chapterIndex > 0;
  const canGoNext = chapterIndex < chapters.length - 1;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 text-ui-base text-foreground-subtle">
        <span className="min-w-0 flex-1 truncate text-foreground">
          {preview.title ?? getPathLeaf(sourcePath)}
        </span>
        {preview.author ? (
          <span className="min-w-0 shrink truncate">· {preview.author}</span>
        ) : null}
        <div className="flex min-w-0 shrink items-center overflow-hidden rounded-lg border border-border bg-input">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-6 shrink-0 rounded-none text-foreground"
            disabled={!canGoPrevious}
            title={intl.formatMessage({ id: "codeViewer.epub.prevChapter" })}
            aria-label={intl.formatMessage({ id: "codeViewer.epub.prevChapter" })}
            onClick={() => setChapterIndex((current) => Math.max(0, current - 1))}
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <select
            className="h-6 w-40 min-w-0 shrink border-x border-border bg-transparent px-1 text-ui-base text-foreground outline-none"
            value={chapterIndex}
            title={intl.formatMessage(
              { id: "codeViewer.epub.chapters" },
              { count: chapters.length },
            )}
            aria-label={intl.formatMessage(
              { id: "codeViewer.epub.chapters" },
              { count: chapters.length },
            )}
            onChange={(event) => setChapterIndex(Number(event.target.value))}
          >
            {chapters.map((item, index) => (
              <option key={item.id} value={index}>
                {`${index + 1}. ${item.title ?? getPathLeaf(item.href)}`}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-6 shrink-0 rounded-none text-foreground"
            disabled={!canGoNext}
            title={intl.formatMessage({ id: "codeViewer.epub.nextChapter" })}
            aria-label={intl.formatMessage({ id: "codeViewer.epub.nextChapter" })}
            onClick={() => setChapterIndex((current) => Math.min(chapters.length - 1, current + 1))}
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title={chapter.title ?? preview.title ?? sourcePath}
        sandbox="allow-same-origin"
        onLoad={handleFrameLoad}
        srcDoc={srcDoc}
        className="min-h-0 w-full flex-1 border-0 bg-background"
      />
    </div>
  );
}
