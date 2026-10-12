"use client";

import { redo, undo } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { minimalSetup } from "codemirror";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/components/lib/utils.js";
import { loadCodeMirrorLanguageExtension } from "@/lib/codeMirrorLanguage.js";
import { createCodeMirrorTheme } from "@/lib/codeMirrorTheme.js";

export interface CodeEditorHandle {
  focus(): void;
  undo(): void;
  redo(): void;
}

export interface CodeEditorProps {
  value: string;
  language: string;
  isDark: boolean;
  fontSizePx: number;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  onChange: (value: string) => void;
  /** Called on the Save keybinding (Mod-s). The header Save button calls the same handler. */
  onSave?: () => void;
  className?: string;
}

/**
 * Thin React wrapper around a CodeMirror 6 view.
 *
 * The view is created once on mount and kept for the component's lifetime; `value`,
 * `language`, `isDark`/`fontSizePx`, `showLineNumbers` and `wrapLongLines` reconfigure it
 * through compartments instead of rebuilding it. The editor owns no durable state — it is
 * initialized from `value` and reports edits through `onChange`, so an unmount/remount
 * (inactive tab, resize) re-initializes from the latest draft without data loss.
 */
export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    value,
    language,
    isDark,
    fontSizePx,
    showLineNumbers,
    wrapLongLines,
    onChange,
    onSave,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const emittedValueRef = useRef(value);
  const compartmentsRef = useRef({
    lineNumbers: new Compartment(),
    wrap: new Compartment(),
    language: new Compartment(),
    theme: new Compartment(),
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) {
      return;
    }

    const compartments = compartmentsRef.current;
    const state = EditorState.create({
      doc: emittedValueRef.current,
      extensions: [
        minimalSetup,
        keymap.of([
          {
            key: "Mod-s",
            preventDefault: true,
            run: () => {
              onSaveRef.current?.();
              return true;
            },
          },
        ]),
        compartments.lineNumbers.of([]),
        compartments.wrap.of([]),
        compartments.language.of([]),
        compartments.theme.of([]),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }
          const next = update.state.doc.toString();
          emittedValueRef.current = next;
          onChangeRef.current(next);
        }),
      ],
    });
    const view = new EditorView({ state, parent });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartmentsRef.current.lineNumbers.reconfigure(
        showLineNumbers ? lineNumbers() : [],
      ),
    });
  }, [showLineNumbers]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartmentsRef.current.wrap.reconfigure(
        wrapLongLines ? EditorView.lineWrapping : [],
      ),
    });
  }, [wrapLongLines]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartmentsRef.current.theme.reconfigure(createCodeMirrorTheme(isDark, fontSizePx)),
    });
  }, [fontSizePx, isDark]);

  useEffect(() => {
    let disposed = false;
    void loadCodeMirrorLanguageExtension(language).then((extension) => {
      if (disposed) {
        return;
      }
      viewRef.current?.dispatch({
        effects: compartmentsRef.current.language.reconfigure(extension ?? []),
      });
    });
    return () => {
      disposed = true;
    };
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const current = view.state.doc.toString();
    if (value === emittedValueRef.current || value === current) {
      emittedValueRef.current = value;
      return;
    }

    // External reset (reload after a stale write) replaces the whole document. Typing does
    // not reach this branch because the emitted value already equals `value`.
    emittedValueRef.current = value;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        viewRef.current?.focus();
      },
      undo: () => {
        const view = viewRef.current;
        if (view) {
          undo(view);
          view.focus();
        }
      },
      redo: () => {
        const view = viewRef.current;
        if (view) {
          redo(view);
          view.focus();
        }
      },
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full overflow-hidden", className)}
      data-code-editor="true"
    />
  );
});
