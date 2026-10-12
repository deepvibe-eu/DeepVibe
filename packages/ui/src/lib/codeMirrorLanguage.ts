/**
 * CodeMirror 6 language routing for the preview editor.
 *
 * The shiki ids that `inferCodeLanguage` can return (`lib/codeViewer.ts`) map to a
 * CodeMirror language extension here. Each group is loaded lazily so opening the editor
 * only pays for the language pack the user actually edits. `log`, `mermaid`, `text` and
 * unknown ids stay plain text (null).
 */
import type { StreamParser } from "@codemirror/language";
import { StreamLanguage } from "@codemirror/language";
import type { Extension } from "@codemirror/state";

type LanguageLoader = () => Promise<Extension>;

const legacyLanguageLoaders: Record<string, () => Promise<StreamParser<unknown>>> = {
  bash: () => import("@codemirror/legacy-modes/mode/shell").then((mode) => mode.shell),
  diff: () => import("@codemirror/legacy-modes/mode/diff").then((mode) => mode.diff),
  ruby: () => import("@codemirror/legacy-modes/mode/ruby").then((mode) => mode.ruby),
  toml: () => import("@codemirror/legacy-modes/mode/toml").then((mode) => mode.toml),
};

function resolveLoader(language: string): LanguageLoader | null {
  switch (language) {
    case "javascript":
      return () => import("@codemirror/lang-javascript").then((m) => m.javascript());
    case "jsx":
      return () => import("@codemirror/lang-javascript").then((m) => m.javascript({ jsx: true }));
    case "typescript":
      return () =>
        import("@codemirror/lang-javascript").then((m) => m.javascript({ typescript: true }));
    case "tsx":
      return () =>
        import("@codemirror/lang-javascript").then((m) =>
          m.javascript({ typescript: true, jsx: true }),
        );
    case "json":
      return () => import("@codemirror/lang-json").then((m) => m.json());
    case "html":
      return () => import("@codemirror/lang-html").then((m) => m.html());
    case "css":
      return () => import("@codemirror/lang-css").then((m) => m.css());
    case "markdown":
      return () => import("@codemirror/lang-markdown").then((m) => m.markdown());
    case "python":
      return () => import("@codemirror/lang-python").then((m) => m.python());
    case "c":
    case "cpp":
      return () => import("@codemirror/lang-cpp").then((m) => m.cpp());
    case "java":
      return () => import("@codemirror/lang-java").then((m) => m.java());
    case "rust":
      return () => import("@codemirror/lang-rust").then((m) => m.rust());
    case "sql":
      return () => import("@codemirror/lang-sql").then((m) => m.sql());
    case "xml":
      return () => import("@codemirror/lang-xml").then((m) => m.xml());
    case "yaml":
      return () => import("@codemirror/lang-yaml").then((m) => m.yaml());
    case "go":
      return () => import("@codemirror/lang-go").then((m) => m.go());
    default: {
      const legacyLoader = legacyLanguageLoaders[language];
      return legacyLoader ? () => legacyLoader().then((mode) => StreamLanguage.define(mode)) : null;
    }
  }
}

const languageCache = new Map<string, Promise<Extension | null>>();

/**
 * Resolve (and cache) the CodeMirror language extension for a shiki language id.
 * Never rejects: an unknown id or a failed chunk load resolves to `null` (plain text).
 */
export function loadCodeMirrorLanguageExtension(language: string): Promise<Extension | null> {
  const cached = languageCache.get(language);
  if (cached) {
    return cached;
  }

  const loader = resolveLoader(language);
  const pending = loader ? loader().catch(() => null) : Promise.resolve(null);
  languageCache.set(language, pending);
  return pending;
}
