/**
 * CodeMirror theme for the preview editor.
 *
 * Chrome (background, foreground, gutter, cursor, selection) is built from the application
 * design tokens so the editor follows the app light/dark theme instead of shipping its own
 * palette. Syntax token colors reuse CodeMirror's light default and the one-dark style, which
 * already read well on the token background.
 */
import type { Extension } from "@codemirror/state";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

export function createCodeMirrorTheme(isDark: boolean, fontSizePx: number): Extension {
  // GitHub Dark/Light bring the Readme-style syntax palette and editor chrome; the
  // sizing theme only keeps height and font size under app control. The read-only
  // preview stays on Shiki themes; this is for the editable CodeMirror surface.
  const sizing = EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: `${fontSizePx}px`,
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        lineHeight: "1.5",
      },
    },
    { dark: isDark },
  );

  return [isDark ? githubDark : githubLight, sizing];
}
