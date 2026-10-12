/**
 * Minimal EPUB reader-model for the preview pane.
 *
 * An EPUB is a zip with an OPF package document (metadata + manifest + spine) and XHTML
 * content documents. This module unzips it and returns a render-ready model: title/author,
 * the spine in reading order with each XHTML body, the book stylesheets, and images
 * rewritten to data URLs so the sandboxed preview iframe needs no origin access.
 *
 * It is intentionally read-only; editing reuses the same zip model later.
 */
import { unzip } from "fflate";

export interface EpubChapter {
  id: string;
  href: string;
  title: string | null;
  /** Sanitized `<body>` inner HTML with image references rewritten to data URLs. */
  html: string;
}

export interface ParsedEpubPreview {
  title: string | null;
  author: string | null;
  language: string | null;
  css: string;
  chapters: EpubChapter[];
}

const DC_NS = "http://purl.org/dc/elements/1.1/";

const EXTENSION_MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",
};

function unzipArchive(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(data, (error, files) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(files);
    });
  });
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function dirname(path: string): string {
  const index = path.lastIndexOf("/");
  return index <= 0 ? "" : path.slice(0, index);
}

function extensionOf(path: string): string {
  const leaf = path.slice(path.lastIndexOf("/") + 1);
  const dot = leaf.lastIndexOf(".");
  return dot < 0 ? "" : leaf.slice(dot + 1).toLowerCase();
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Resolve a manifest/content href relative to `baseDir`, dropping any fragment/query. */
function resolveHref(baseDir: string, href: string): string {
  const clean = href.split("#")[0]?.split("?")[0] ?? "";
  const parts = baseDir ? baseDir.split("/").filter(Boolean) : [];
  for (const rawPart of clean.split("/")) {
    const part = decodePathSegment(rawPart);
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function toDataUrl(bytes: Uint8Array, mediaType: string): string {
  return `data:${mediaType};base64,${bytesToBase64(bytes)}`;
}

function parseXml(text: string, mime: DOMParserSupportedType): Document | null {
  try {
    const document = new DOMParser().parseFromString(text, mime);
    if (document.querySelector("parsererror")) {
      return null;
    }
    return document;
  } catch {
    return null;
  }
}

function firstText(document: Document, namespace: string, localName: string): string | null {
  const element = document.getElementsByTagNameNS(namespace, localName)[0];
  const value = element?.textContent?.trim();
  return value ? value : null;
}

interface ManifestItem {
  href: string;
  mediaType: string;
  properties: string;
}

function readManifest(opf: Document): Map<string, ManifestItem> {
  const items = new Map<string, ManifestItem>();
  for (const element of Array.from(opf.getElementsByTagNameNS("*", "item"))) {
    const id = element.getAttribute("id");
    const href = element.getAttribute("href");
    if (!id || !href) {
      continue;
    }
    items.set(id, {
      href,
      mediaType: element.getAttribute("media-type") ?? "",
      properties: element.getAttribute("properties") ?? "",
    });
  }
  return items;
}

function readSpineIdrefs(opf: Document): string[] {
  const idrefs: string[] = [];
  for (const element of Array.from(opf.getElementsByTagNameNS("*", "itemref"))) {
    const idref = element.getAttribute("idref");
    if (idref) {
      idrefs.push(idref);
    }
  }
  return idrefs;
}

function sanitizeChapterBody(body: HTMLElement): void {
  // The preview iframe is sandboxed without allow-scripts, so this is defence in depth:
  // drop active content and event handlers before the markup ever reaches the document.
  for (const selector of ["script", "iframe", "object", "embed"]) {
    for (const element of Array.from(body.querySelectorAll(selector))) {
      element.remove();
    }
  }
  for (const element of Array.from(body.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
  }
}

function rewriteImageSources(
  body: HTMLElement,
  chapterDir: string,
  files: Record<string, Uint8Array>,
  mediaTypes: Map<string, string>,
): void {
  const images = new Map<string, string | null>();
  const lookup = (path: string): string | null => {
    const cached = images.get(path);
    if (cached !== undefined) {
      return cached;
    }
    const data = files[path];
    if (!data) {
      images.set(path, null);
      return null;
    }
    const mediaType = mediaTypes.get(path) ?? EXTENSION_MIME_TYPES[extensionOf(path)] ?? "";
    if (!mediaType) {
      images.set(path, null);
      return null;
    }
    const url = toDataUrl(data, mediaType);
    images.set(path, url);
    return url;
  };

  const rewrite = (element: Element, attributeName: string) => {
    const value = element.getAttribute(attributeName);
    if (!value || value.startsWith("data:")) {
      return;
    }
    const resolved = resolveHref(chapterDir, value);
    const url = lookup(resolved);
    if (url) {
      element.setAttribute(attributeName, url);
    } else {
      element.removeAttribute(attributeName);
    }
  };

  for (const image of Array.from(body.querySelectorAll("img[src]"))) {
    rewrite(image, "src");
  }
  for (const image of Array.from(body.querySelectorAll("image"))) {
    rewrite(image, "xlink:href");
    rewrite(image, "href");
  }
}

/**
 * Parse an EPUB into a render-ready preview model. Rejects when the archive has no readable
 * package document or an empty spine.
 */
export async function parseEpubPreview(buffer: ArrayBuffer): Promise<ParsedEpubPreview> {
  const files = await unzipArchive(new Uint8Array(buffer));

  const containerBytes = files["META-INF/container.xml"];
  if (!containerBytes) {
    throw new Error("EPUB is missing META-INF/container.xml");
  }
  const container = parseXml(new TextDecoder().decode(containerBytes), "application/xml");
  const rootfile = container?.getElementsByTagNameNS("*", "rootfile")[0];
  const opfPath = rootfile?.getAttribute("full-path");
  if (!opfPath) {
    throw new Error("EPUB container does not declare a package document");
  }

  const normalizedOpfPath = normalizeZipPath(opfPath);
  const opfBytes = files[normalizedOpfPath];
  if (!opfBytes) {
    throw new Error("EPUB package document is missing");
  }
  const opf = parseXml(new TextDecoder().decode(opfBytes), "application/xml");
  if (!opf) {
    throw new Error("EPUB package document is not valid XML");
  }

  const opfDir = dirname(normalizedOpfPath);
  const manifest = readManifest(opf);

  const mediaTypes = new Map<string, string>();
  const stylesheetPaths: string[] = [];
  for (const item of manifest.values()) {
    const resolved = resolveHref(opfDir, item.href);
    if (item.mediaType) {
      mediaTypes.set(resolved, item.mediaType);
    }
    if (item.mediaType === "text/css") {
      stylesheetPaths.push(resolved);
    }
  }

  const css = stylesheetPaths
    .map((path) => {
      const bytes = files[path];
      return bytes ? new TextDecoder().decode(bytes) : "";
    })
    .filter(Boolean)
    .join("\n");

  const chapters: EpubChapter[] = [];
  for (const idref of readSpineIdrefs(opf)) {
    const item = manifest.get(idref);
    if (!item) {
      continue;
    }
    const href = resolveHref(opfDir, item.href);
    const bytes = files[href];
    if (!bytes) {
      continue;
    }

    const chapterDir = dirname(href);
    const chapterDocument = parseXml(new TextDecoder().decode(bytes), "text/html");
    const body = chapterDocument?.body;
    if (!chapterDocument || !body) {
      continue;
    }

    rewriteImageSources(body, chapterDir, files, mediaTypes);
    sanitizeChapterBody(body);
    const html = body.innerHTML.trim();
    if (!html) {
      continue;
    }

    chapters.push({
      id: idref,
      href,
      title: chapterDocument.querySelector("title")?.textContent?.trim() || null,
      html,
    });
  }

  if (chapters.length === 0) {
    throw new Error("EPUB has no readable content documents");
  }

  return {
    title: firstText(opf, DC_NS, "title"),
    author: firstText(opf, DC_NS, "creator"),
    language: firstText(opf, DC_NS, "language"),
    css,
    chapters,
  };
}
