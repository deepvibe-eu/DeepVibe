"use client";

import { Component, forwardRef, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import type { CodeEditorHandle, CodeEditorProps } from "@/components/ui/code-editor.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { logger } from "@/logger.js";

// CodeMirror and its language packs are only paid for when the user enters edit mode, so the
// editor is a lazy chunk exactly like the Office previews.
const LazyCodeEditor = lazy(async () => {
  const module = await import("@/components/ui/code-editor.js");
  return { default: module.CodeEditor };
});

class CodeEditorErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    resetKey: string;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("[PreviewPane] Code editor failed to render", {
      error: error.message,
      componentStack: info.componentStack ?? "",
    });
  }

  componentDidUpdate(previousProps: Readonly<{ resetKey: string }>) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function CodeEditorLoading() {
  return (
    <div
      aria-busy="true"
      className="h-full min-h-0 w-full bg-background"
      data-code-editor-pending="true"
    />
  );
}

interface EditableCodeContentProps extends CodeEditorProps {
  /** Reset key for the chunk/error boundary; changes when the edited file changes. */
  resetKey: string;
}

/**
 * Lazy bridge to `CodeEditor`. Owns only the Suspense/error boundary around the async chunk;
 * all editor state stays in the caller (see docs/preview-code-editor.md).
 */
export const EditableCodeContent = forwardRef<CodeEditorHandle, EditableCodeContentProps>(
  function EditableCodeContent({ resetKey, ...editorProps }, ref) {
    const { intl } = useZCodeIntl();
    const fallback = (
      <div className="p-3 text-ui-base text-destructive" role="alert">
        {intl.formatMessage({ id: "codeViewer.editorUnavailable" })}
      </div>
    );

    return (
      <CodeEditorErrorBoundary fallback={fallback} resetKey={resetKey}>
        <Suspense fallback={<CodeEditorLoading />}>
          <LazyCodeEditor ref={ref} {...editorProps} />
        </Suspense>
      </CodeEditorErrorBoundary>
    );
  },
);
