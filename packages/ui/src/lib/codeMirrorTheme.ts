/**
 * CodeMirror theme for the preview editor.
 *
 * Chrome (background, foreground, gutter, cursor, selection) is built from the application
 * design tokens so the editor follows the app light/dark theme instead of shipping its own
 * palette. Syntax token colors reuse CodeMirror's light default and the one-dark style, which
 * already read well on the token background.
 */
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

export function createCodeMirrorTheme(isDark: boolean, fontSizePx: number): Extension {
  const chrome = EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: `${fontSizePx}px`,
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        lineHeight: "1.5",
      },
      ".cm-content": {
        caretColor: "var(--color-foreground)",
        padding: "8px 0",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--color-foreground)",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "color-mix(in srgb, var(--color-brand) 28%, transparent)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground-subtlest)",
        border: "none",
        borderRight: "1px solid var(--color-border)",
      },
      ".cm-activeLine": {
        backgroundColor: "color-mix(in srgb, var(--color-foreground) 5%, transparent)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "var(--color-foreground-subtle)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 8px 0 6px",
      },
      ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
        backgroundColor: "color-mix(in srgb, var(--color-brand) 30%, transparent)",
        outline: "none",
      },
      ".cm-panels": {
        backgroundColor: "var(--color-menu)",
        color: "var(--color-foreground)",
      },
      ".cm-tooltip": {
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-popover)",
        color: "var(--color-popover-foreground)",
      },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: "var(--color-selected)",
        color: "var(--color-foreground)",
      },
    },
    { dark: isDark },
  );

  const highlight = syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, {
    fallback: true,
  });

  return [chrome, highlight];
}
