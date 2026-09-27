import { defaultKeymap } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
  syntaxTree,
} from "@codemirror/language";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import type { SourceLocation } from "@/lib/source-location";

const highlighting = HighlightStyle.define([
  { tag: [tags.tagName, tags.typeName], color: "var(--type-number)" },
  { tag: [tags.attributeName, tags.propertyName], color: "var(--primary)" },
  { tag: [tags.string, tags.attributeValue], color: "var(--type-string)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--type-bool)" },
  { tag: [tags.comment, tags.meta], color: "var(--muted-foreground)" },
  { tag: [tags.angleBracket, tags.punctuation], color: "var(--type-container)" },
]);

interface Props {
  value: string;
  language: "xml" | "json";
  onChange: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  error: string | null;
  errorLocation: SourceLocation | null;
  focused: boolean;
}

export function SourceEditor(props: Props) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const callbacks = useRef(props);
  const [language] = useState(() => new Compartment());
  const [attributes] = useState(() => new Compartment());
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [diagnosticLocation, setDiagnosticLocation] = useState<SourceLocation | null>(null);

  useEffect(() => {
    callbacks.current = props;
  }, [props]);

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: callbacks.current.value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          drawSelection(),
          bracketMatching(),
          lintGutter(),
          syntaxHighlighting(highlighting),
          language.of(callbacks.current.language === "xml" ? xml() : json()),
          attributes.of(
            EditorView.contentAttributes.of({ role: "textbox", "aria-multiline": "true" }),
          ),
          EditorView.lineWrapping,
          keymap.of([
            {
              key: "Mod-z",
              run: () => {
                callbacks.current.onUndo();
                return true;
              },
            },
            {
              key: "Mod-Shift-z",
              run: () => {
                callbacks.current.onRedo();
                return true;
              },
            },
            {
              key: "Mod-y",
              run: () => {
                callbacks.current.onRedo();
                return true;
              },
            },
            ...defaultKeymap,
          ]),
          EditorView.updateListener.of((update) => {
            if (
              update.docChanged &&
              update.transactions.some((transaction) =>
                transaction.annotation(Transaction.userEvent),
              )
            ) {
              callbacks.current.onChange(update.state.doc.toString());
            }
            if (update.selectionSet || update.docChanged) {
              const head = update.state.selection.main.head;
              const line = update.state.doc.lineAt(head);
              setPosition({ line: line.number, column: head - line.from + 1 });
            }
          }),
          EditorView.theme(
            {
              "&": {
                height: "100%",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                fontSize: "13px",
              },
              ".cm-scroller": {
                fontFamily: "var(--font-mono)",
                overflow: "auto",
                lineHeight: "1.8",
              },
              ".cm-content": { padding: "12px 0", caretColor: "var(--primary)" },
              ".cm-line": { padding: "0 12px" },
              ".cm-gutters": {
                backgroundColor: "var(--surface)",
                color: "var(--muted-foreground)",
                borderRight: "1px solid var(--border)",
              },
              ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "var(--accent)" },
              ".cm-cursor": { borderLeftColor: "var(--primary)" },
              "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
                backgroundColor: "color-mix(in oklch, var(--primary) 25%, var(--background))",
              },
              ".cm-tooltip": {
                backgroundColor: "var(--popover)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
              "&.cm-focused": { outline: "2px solid var(--ring)", outlineOffset: "-2px" },
            },
            { dark: true },
          ),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [language, attributes]);

  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current !== props.value) {
      editor.dispatch({ changes: { from: 0, to: current.length, insert: props.value } });
    }
  }, [props.value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: language.reconfigure(props.language === "xml" ? xml() : json()),
    });
  }, [props.language, language]);

  const label = t.plist_source();
  useEffect(() => {
    view.current?.dispatch({
      effects: attributes.reconfigure(
        EditorView.contentAttributes.of({
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": label,
          "aria-invalid": String(!!props.error),
          spellcheck: "false",
        }),
      ),
    });
  }, [attributes, label, props.error]);

  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    let location = props.errorLocation;
    if (props.error && !location && editor.state.doc.toString() === props.value) {
      // Some browsers omit coordinates from JSON.parse errors. Use the syntax tree
      // already maintained by the editor, keeping parser code in the lazy chunk.
      let firstError: number | null = null;
      syntaxTree(editor.state).iterate({
        enter(node) {
          if (firstError !== null) return false;
          if (node.type.isError) firstError = node.from;
          return true;
        },
      });
      if (firstError !== null) {
        const errorLine = editor.state.doc.lineAt(firstError);
        location = { line: errorLine.number, column: firstError - errorLine.from + 1 };
      }
    }
    setDiagnosticLocation(props.error ? location : null);
    const line = editor.state.doc.line(
      Math.max(1, Math.min(location?.line ?? 1, editor.state.doc.lines)),
    );
    const from = Math.min(line.to, line.from + Math.max(0, (location?.column ?? 1) - 1));
    editor.dispatch(
      setDiagnostics(
        editor.state,
        props.error
          ? [
              {
                from,
                to: Math.min(from + 1, editor.state.doc.length),
                severity: "error",
                message: props.error,
              },
            ]
          : [],
      ),
    );
  }, [props.error, props.errorLocation, props.value]);

  const goToError = () => {
    const editor = view.current;
    if (!editor || !diagnosticLocation) return;
    const line = editor.state.doc.line(
      Math.max(1, Math.min(diagnosticLocation.line, editor.state.doc.lines)),
    );
    const anchor = Math.min(line.to, line.from + Math.max(0, diagnosticLocation.column - 1));
    editor.dispatch({ selection: { anchor }, scrollIntoView: true });
    editor.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={host}
        className={
          props.focused
            ? "min-h-[22rem] flex-1 overflow-hidden [&>.cm-editor]:max-h-[calc(100dvh-16rem)]"
            : "h-[30rem] overflow-hidden"
        }
      />
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
        <span>{t.cursor_position(position)}</span>
        {diagnosticLocation && props.error && (
          <button
            type="button"
            onClick={goToError}
            className="min-h-8 rounded px-2 text-primary hover:bg-accent"
          >
            {t.go_to_error({ line: diagnosticLocation.line })}
          </button>
        )}
        <span>{props.language.toUpperCase()}</span>
      </div>
    </div>
  );
}
