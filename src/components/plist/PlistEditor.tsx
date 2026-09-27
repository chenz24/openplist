import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Code2,
  Columns2,
  Download,
  FilePlus2,
  FolderOpen,
  ListTree,
  Maximize2,
  Minimize2,
  Redo2,
  Search,
  ShieldCheck,
  Undo2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { localizeDiagnostic } from "@/lib/diagnostics";
import {
  createHistory,
  type EditorHistory,
  recordEdit,
  redoEdit,
  undoEdit,
} from "@/lib/editor-history";
import { useEditorState } from "@/lib/editor-session";
import { useLocale, useT } from "@/lib/i18n";
import {
  type AppleKind,
  appendChild,
  buildXmlPlist,
  coerce,
  duplicateAt,
  emptyOf,
  fromJsonValue,
  getAt,
  isConfigurationProfile,
  isEntitlements,
  isOpenCoreConfig,
  isProvisioningProfile,
  isStringsdict,
  newProfile,
  type OutputFormat,
  type Path,
  type PlistFormat,
  type PType,
  type PValue,
  parsePlist,
  removeAt,
  sampleEntitlements,
  sampleOpenCore,
  sampleProvision,
  sampleStrings,
  sampleStringsdict,
  searchPaths,
  serialize,
  setKeyAt,
  setValueAt,
  summarizePayloads,
  summarizeProvision,
  toJson,
  validateEntitlements,
  validateOpenCore,
  validateProfile,
  validateProvision,
  validateStrings,
  validateStringsdict,
} from "@/lib/plist";
import {
  CONVERSION_SAMPLE,
  type ConversionMode,
  JSON_SAMPLE,
  JsonPlistInputError,
  parseJsonForPlist,
} from "@/lib/plist/conversion";
import { getErrorLocation, type SourceLocation } from "@/lib/source-location";
import { cn } from "@/lib/utils";
import { PlistTree } from "./PlistTree";
import { useUnsavedChanges } from "./UnsavedChanges";

const SourceEditor = lazy(() =>
  import("./SourceEditor").then((m) => ({ default: m.SourceEditor })),
);

export interface PlistSnapshot {
  doc: PValue | null;
  draft: string | null;
  tab: EditorTab;
  sourceError: string | null;
  sourceLocation: SourceLocation | null;
}
export const emptyPlistSnapshot: PlistSnapshot = {
  doc: null,
  draft: null,
  tab: "xml",
  sourceError: null,
  sourceLocation: null,
};

const ProfileAnalyzer = lazy(() =>
  import("./ProfileAnalyzer").then((m) => ({ default: m.ProfileAnalyzer })),
);

const SAMPLE: PValue = {
  type: "dict",
  value: [
    { key: "CFBundleName", value: { type: "string", value: "My App" } },
    { key: "CFBundleShortVersionString", value: { type: "string", value: "1.0" } },
    { key: "CFBundleVersion", value: { type: "integer", value: 1 } },
    { key: "LSMinimumSystemVersion", value: { type: "real", value: 13.0 } },
    { key: "UIRequiresFullScreen", value: { type: "boolean", value: false } },
    {
      key: "UISupportedInterfaceOrientations",
      value: {
        type: "array",
        value: [
          { type: "string", value: "UIInterfaceOrientationPortrait" },
          { type: "string", value: "UIInterfaceOrientationLandscapeLeft" },
        ],
      },
    },
    {
      key: "NSAppTransportSecurity",
      value: {
        type: "dict",
        value: [{ key: "NSAllowsArbitraryLoads", value: { type: "boolean", value: false } }],
      },
    },
  ],
};

export type EditorTab = "xml" | "json";

export function PlistEditor({
  initialTab = "xml",
  profile = false,
  kind,
  loc,
  conversion,
  className,
}: {
  /** Tailor the editor to entitlements or provisioning profiles. */
  kind?: AppleKind | undefined;
  /** Tailor the editor to .strings / .stringsdict localization files. */
  loc?: "strings" | "stringsdict" | undefined;
  conversion?: ConversionMode | undefined;
  initialTab?: EditorTab;
  /** Tailor New / sample / drop zone to configuration profiles. */
  profile?: boolean;
  className?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const FORMAT_LABEL: Record<PlistFormat, string> = {
    xml: "XML plist",
    binary: t.format_binary(),
    openstep: "OpenStep / ASCII plist",
  };

  const [history, setHistory] = useEditorState<EditorHistory<PlistSnapshot>>(
    "PlistEditor.history",
    createHistory({ ...emptyPlistSnapshot, tab: initialTab }),
  );
  const { doc, draft, tab, sourceError, sourceLocation } = history.present;
  const [savedDocument, setSavedDocument] = useEditorState<string | null>(
    "PlistEditor.saved",
    null,
  );
  const [pendingFields, setPendingFields] = useState<Set<string>>(() => new Set());
  const [focused, setFocused] = useEditorState("PlistEditor.focused", false);
  const [format, setFormat] = useEditorState<PlistFormat | null>("PlistEditor.format", null);
  const [fileName, setFileName] = useEditorState<string>("PlistEditor.fileName", "untitled.plist");
  const [error, setError] = useEditorState<string | null>("PlistEditor.error", null);
  const [signedBy, setSignedBy] = useEditorState<string[] | null>("PlistEditor.signedBy", null);
  const [pasteText, setPasteText] = useEditorState("PlistEditor.paste", "");
  const documentKey = useMemo(() => (doc ? JSON.stringify(doc) : null), [doc]);
  const dirty =
    (!!doc && (documentKey !== savedDocument || !!sourceError || pendingFields.size > 0)) ||
    !!pasteText.trim();
  const { requestReplace, dialog } = useUnsavedChanges(dirty);
  const resetDocument = (value: PValue, saved = false) => {
    setHistory(createHistory({ ...emptyPlistSnapshot, doc: value, tab }));
    setSavedDocument(saved ? JSON.stringify(value) : null);
    setPendingFields(new Set());
    setPasteText("");
  };
  const undo = () => {
    setHistory(undoEdit);
    setPendingFields(new Set());
  };
  const redo = () => {
    setHistory(redoEdit);
    setPendingFields(new Set());
  };
  const [query, setQuery] = useEditorState("PlistEditor.query", "");
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"tree" | "source" | "split">("split");
  const isMobile = useIsMobile();
  const activeView = isMobile && view === "split" ? "tree" : view;
  const [aiOpen, setAiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRequest = useRef(0);
  const inputError = (e: unknown) =>
    e instanceof JsonPlistInputError
      ? e.reason === "null"
        ? t.json_null_error()
        : t.json_number_error()
      : e instanceof Error
        ? localizeDiagnostic(e.message, locale)
        : t.invalid_source();
  const convertPasted = () => {
    try {
      const parsed =
        conversion === "json-to-plist"
          ? { value: parseJsonForPlist(pasteText), format: null }
          : parsePlist(pasteText);
      resetDocument(parsed.value);
      setFormat(parsed.format);
      setFileName("converted.plist");
      setSignedBy(null);
      setQuery("");
      setError(null);
    } catch (e) {
      setError(inputError(e));
    }
  };
  const load = async (file: File) => {
    const request = ++loadRequest.current;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const parsed =
        conversion === "json-to-plist"
          ? {
              value: parseJsonForPlist(new TextDecoder().decode(bytes)),
              format: null,
              signedBy: undefined,
            }
          : parsePlist(bytes);
      if (request !== loadRequest.current) return;
      requestReplace(() => {
        resetDocument(parsed.value, true);
        setError(null);
        setQuery("");
        setFormat(parsed.format);
        setSignedBy(parsed.signedBy ?? null);
        setFileName(file.name);
      });
    } catch (e) {
      if (request !== loadRequest.current) return;
      setError(
        e instanceof Error
          ? t.file_error({ name: file.name, detail: inputError(e) })
          : t.file_error({ name: file.name, detail: "" }),
      );
    }
  };

  const mutate = (next: PValue) => {
    setHistory((previous) =>
      recordEdit(previous, {
        ...previous.present,
        doc: next,
        draft: null,
        sourceError: null,
        sourceLocation: null,
      }),
    );
  };

  const isProfile = useMemo(
    () => isConfigurationProfile(doc) || (profile && !!doc && /\.mobileconfig$/i.test(fileName)),
    [doc, profile, fileName],
  );
  const issues = useMemo(() => (doc && isProfile ? validateProfile(doc) : []), [doc, isProfile]);
  const errorCount = issues.filter((i) => i.level === "error").length;
  const payloads = useMemo(
    () => (doc && isProfile ? summarizePayloads(doc) : []),
    [doc, isProfile],
  );

  const appleKind = useMemo<AppleKind | null>(() => {
    if (!doc || isProfile) return null;
    if (kind === "opencore" || isOpenCoreConfig(doc)) return "opencore";
    if (isProvisioningProfile(doc) || /\.(mobileprovision|provisionprofile)$/i.test(fileName))
      return "provision";
    if (kind === "entitlements" || /\.entitlements$/i.test(fileName) || isEntitlements(doc))
      return "entitlements";
    return null;
  }, [doc, isProfile, fileName, kind]);
  const locKind = useMemo<"strings" | "stringsdict" | null>(() => {
    if (!doc || isProfile || appleKind) return null;
    if (loc) return loc;
    if (/\.stringsdict$/i.test(fileName) || isStringsdict(doc)) return "stringsdict";
    if (/\.strings$/i.test(fileName)) return "strings";
    return null;
  }, [doc, isProfile, appleKind, fileName, loc]);
  const appleIssues = useMemo(
    () =>
      !doc
        ? []
        : locKind === "stringsdict"
          ? validateStringsdict(doc)
          : locKind === "strings"
            ? validateStrings(doc)
            : !appleKind
              ? []
              : appleKind === "provision"
                ? validateProvision(doc)
                : appleKind === "opencore"
                  ? validateOpenCore(doc)
                  : validateEntitlements(doc),
    [doc, appleKind, locKind],
  );
  const panelKind = appleKind ?? locKind;
  const appleErrors = appleIssues.filter((i) => i.level === "error").length;
  const provision = useMemo(
    () => (doc && appleKind === "provision" ? summarizeProvision(doc) : null),
    [doc, appleKind],
  );

  const sourceText = useMemo(() => {
    if (draft !== null) return draft;
    if (!doc) return "";
    return tab === "xml" ? buildXmlPlist(doc) : toJson(doc);
  }, [draft, doc, tab]);

  const matches = useMemo(() => (doc ? searchPaths(doc, query) : new Set<string>()), [doc, query]);

  const onSourceEdit = (text: string) => {
    let next: PlistSnapshot = {
      ...history.present,
      draft: text,
      sourceError: null,
      sourceLocation: null,
    };
    try {
      next = {
        ...next,
        doc:
          tab === "json"
            ? conversion === "json-to-plist"
              ? parseJsonForPlist(text)
              : fromJsonValue(JSON.parse(text))
            : parsePlist(text).value,
      };
    } catch (e) {
      next.sourceError = inputError(e);
      next.sourceLocation = getErrorLocation(e, text);
    }
    setHistory((previous) => recordEdit(previous, next, `source:${tab}`));
  };

  const download = (out: OutputFormat | "mobileconfig" | "entitlements") => {
    if (!doc || sourceError) return;
    let src: PValue = doc;
    if (out === "entitlements" && appleKind === "provision") {
      const e =
        doc.type === "dict" ? doc.value.find((x) => x.key === "Entitlements")?.value : undefined;
      if (!e) return;
      src = e;
    }
    const bytes = serialize(src, out === "mobileconfig" || out === "entitlements" ? "xml" : out);
    const ext =
      out === "json"
        ? ".json"
        : out === "mobileconfig"
          ? ".mobileconfig"
          : out === "entitlements"
            ? ".entitlements"
            : out === "strings"
              ? ".strings"
              : ".plist";
    const base = fileName.replace(
      /\.(plist|json|xml|mobileconfig|strings|stringsdict|entitlements|mobileprovision|provisionprofile)$/i,
      "",
    );
    const blob = new Blob([bytes as BlobPart], {
      type:
        out === "json"
          ? "application/json"
          : out === "mobileconfig"
            ? "application/x-apple-aspen-config"
            : out === "strings"
              ? "text/plain"
              : "application/x-plist",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}${out === "binary" ? "-binary" : ""}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
    // Extracting a subtree or converting to JSON does not save the original typed document.
    if (src === doc && out !== "json") {
      setSavedDocument(documentKey);
      // A save is an undo boundary even if the user resumes typing immediately.
      setHistory((previous) => ({ ...previous, group: null }));
    }
  };

  const actions = {
    onPendingChange: (id: string, pending: boolean) =>
      setPendingFields((previous) => {
        const next = new Set(previous);
        if (pending) next.add(id);
        else next.delete(id);
        return next;
      }),
    onKeyChange: (path: Path, key: string) => doc && mutate(setKeyAt(doc, path, key)),
    onValueChange: (path: Path, value: PValue) => doc && mutate(setValueAt(doc, path, value)),
    onTypeChange: (path: Path, type: PType) => {
      if (!doc) return;
      const current = getAt(doc, path);
      if (!current) return;
      mutate(setValueAt(doc, path, coerce(current, type)));
    },
    onAddChild: (path: Path) =>
      doc && mutate(appendChild(doc, path, "New item", emptyOf("string"))),
    onDuplicate: (path: Path) => doc && mutate(duplicateAt(doc, path)),
    onRemove: (path: Path) => doc && mutate(removeAt(doc, path)),
  };

  return (
    <>
      {dialog}
      <section
        aria-label={t.editor()}
        onKeyDown={(event) => {
          if (event.defaultPrevented) return;
          if (event.key === "Escape" && focused) {
            setFocused(false);
            return;
          }
          const target = event.target as HTMLElement;
          if (target.matches("input, textarea, select") || target.isContentEditable) return;
          if ((event.metaKey || event.ctrlKey) && !event.altKey) {
            if (event.key.toLowerCase() === "z") {
              event.preventDefault();
              if (event.shiftKey) redo();
              else undo();
            } else if (event.key.toLowerCase() === "y") {
              event.preventDefault();
              redo();
            }
          }
        }}
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-background/60",
          focused && "flex min-h-dvh flex-col rounded-none border-0 shadow-none",
          className,
        )}
      >
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-raised px-3 py-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
              doc
                ? "border border-border text-foreground hover:bg-accent"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <FolderOpen className="size-3.5" /> {t.open_file()}
          </button>
          <button
            type="button"
            onClick={() =>
              requestReplace(() => {
                resetDocument(
                  profile
                    ? newProfile()
                    : kind === "entitlements"
                      ? sampleEntitlements()
                      : kind === "provision"
                        ? sampleProvision()
                        : kind === "opencore"
                          ? sampleOpenCore()
                          : loc === "strings"
                            ? sampleStrings()
                            : loc === "stringsdict"
                              ? sampleStringsdict()
                              : { type: "dict", value: [] },
                );
                setFormat("xml");
                setFileName(
                  profile
                    ? "untitled.mobileconfig"
                    : kind === "entitlements"
                      ? "untitled.entitlements"
                      : kind === "provision"
                        ? "untitled.mobileprovision.plist"
                        : kind === "opencore"
                          ? "config.plist"
                          : loc === "strings"
                            ? "Localizable.strings"
                            : loc === "stringsdict"
                              ? "Localizable.stringsdict"
                              : "untitled.plist",
                );
                setError(null);
                setSignedBy(null);
                setQuery("");
              })
            }
            className="inline-flex items-center gap-1.5 min-h-9 rounded-md border border-border px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
          >
            <FilePlus2 className="size-3.5" />{" "}
            {profile || kind === "provision" ? t.new_profile() : t.new_file()}
          </button>
          <button
            type="button"
            onClick={() =>
              requestReplace(() => {
                resetDocument(
                  conversion === "json-to-plist"
                    ? parseJsonForPlist(JSON_SAMPLE)
                    : conversion
                      ? parsePlist(
                          serialize(
                            CONVERSION_SAMPLE,
                            conversion === "binary-to-xml" ? "binary" : "xml",
                          ),
                        ).value
                      : profile
                        ? newProfile()
                        : kind === "entitlements"
                          ? sampleEntitlements()
                          : kind === "provision"
                            ? sampleProvision()
                            : kind === "opencore"
                              ? sampleOpenCore()
                              : loc === "strings"
                                ? sampleStrings()
                                : loc === "stringsdict"
                                  ? sampleStringsdict()
                                  : SAMPLE,
                );
                setFormat(
                  conversion === "binary-to-xml"
                    ? "binary"
                    : conversion === "json-to-plist"
                      ? null
                      : "xml",
                );
                setFileName(
                  conversion
                    ? "Example.plist"
                    : profile
                      ? "Example.mobileconfig"
                      : kind === "entitlements"
                        ? "Example.entitlements"
                        : kind === "provision"
                          ? "Example.mobileprovision"
                          : kind === "opencore"
                            ? "config.plist"
                            : loc === "strings"
                              ? "Localizable.strings"
                              : loc === "stringsdict"
                                ? "Localizable.stringsdict"
                                : "Info.plist",
                );
                setError(null);
                setSignedBy(null);
                setQuery("");
              })
            }
            className="min-h-9 rounded-md border border-border px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {t.load_sample()}
          </button>

          {doc && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!history.past.length && pendingFields.size === 0}
                onClick={undo}
                title={t.undo_shortcut()}
                aria-label={t.undo()}
                className="editor-action"
              >
                <Undo2 className="size-4" />
                <span className="hidden sm:inline">{t.undo()}</span>
              </button>
              <button
                type="button"
                disabled={!history.future.length || pendingFields.size > 0}
                onClick={redo}
                title={t.redo_shortcut()}
                aria-label={t.redo()}
                className="editor-action"
              >
                <Redo2 className="size-4" />
                <span className="hidden sm:inline">{t.redo()}</span>
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {conversion && (
              <button
                type="button"
                disabled={!doc || !!sourceError}
                onClick={() => download(conversion === "plist-to-json" ? "json" : "xml")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="size-3.5" />
                {conversion === "plist-to-json" ? t.download_json() : t.download_xml()}
              </button>
            )}
            {doc && (
              <button
                type="button"
                onClick={() => setFocused(!focused)}
                aria-pressed={focused}
                aria-label={focused ? t.exit_focus() : t.focus_mode()}
                className="editor-action"
              >
                {focused ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                <span className="hidden sm:inline">
                  {focused ? t.exit_focus() : t.focus_mode()}
                </span>
              </button>
            )}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={!doc || !!sourceError}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    doc && !conversion
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-muted-foreground",
                  )}
                >
                  <Download className="size-3.5" /> {conversion ? t.other_formats() : t.download()}
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              {doc && (
                <DropdownMenuContent align="end" className="w-56">
                  {(
                    [
                      ...(isProfile ? [["mobileconfig", t.download_profile()]] : []),
                      ...(appleKind === "entitlements"
                        ? [["entitlements", t.download_entitlements()]]
                        : []),
                      ...(appleKind === "provision"
                        ? [["entitlements", t.extract_entitlements()]]
                        : []),
                      ...(locKind === "strings" &&
                      doc.type === "dict" &&
                      doc.value.every((e) => e.value.type === "string")
                        ? [["strings", t.download_strings()]]
                        : []),
                      ["xml", "XML plist (.plist)"],
                      ["binary", t.download_binary()],
                      ["json", "JSON (.json)"],
                    ] as [OutputFormat | "mobileconfig" | "entitlements", string][]
                  ).map(([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() => download(value)}
                      className="min-h-10 cursor-pointer px-3 text-[13px]"
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={
            conversion === "json-to-plist"
              ? ".json,application/json"
              : ".plist,.strings,.stringsdict,.entitlements,.mobileconfig,.mobileprovision,.provisionprofile,.xml,.json,application/x-plist"
          }
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void load(f);
            e.target.value = "";
          }}
        />

        {/* status bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="min-w-0 break-all text-foreground">
            {doc ? fileName : t.ready_to_open()}
          </span>
          {format && <span>· {FORMAT_LABEL[format]}</span>}
          {doc && (
            <span role="status" className={dirty ? "text-primary" : "text-muted-foreground"}>
              {dirty ? t.unsaved_changes() : t.no_unsaved_changes()}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-type-string">
            <ShieldCheck className="size-3.5" /> {t.local_processing()}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 border-b border-border bg-destructive/10 px-3 py-2 text-[13px] text-destructive-foreground"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        {signedBy && (
          <div className="flex items-start gap-2 border-b border-border bg-primary/10 px-3 py-2 text-[13px] text-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{t.signed_profile({ certificates: signedBy.join(", ") || t.none() })} </span>
          </div>
        )}

        {doc && isProfile && (
          <div className="border-b border-border bg-surface px-3 py-2 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.configuration_profile()}
              </span>
              {errorCount === 0 ? (
                <span className="inline-flex items-center gap-1 text-type-string">
                  <CheckCircle2 className="size-3.5" /> {t.valid_structure()}
                  {issues.length > 0 && ` · ${t.warnings_count({ count: issues.length })}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <XCircle className="size-3.5" /> {t.errors_count({ count: errorCount })}
                  {issues.length > errorCount &&
                    `, ${t.warnings_count({ count: issues.length - errorCount })}`}
                </span>
              )}
              <span className="text-muted-foreground">
                {t.payloads_count({ count: payloads.length })}
                {payloads.length > 0 && ": "}
                {payloads.map((p) => p.name || p.type || t.untitled()).join(", ")}
              </span>
              <button
                type="button"
                onClick={() => setAiOpen((v) => !v)}
                className="ml-auto rounded border border-border px-2 py-0.5 text-[12px] text-primary hover:bg-accent"
              >
                {aiOpen ? t.hide_ai() : t.show_ai()}
              </button>
            </div>
            {aiOpen && (
              <div className="mt-2">
                <Suspense fallback={<p role="status">{t.loading_review()}</p>}>
                  <ProfileAnalyzer doc={doc} signedBy={signedBy} />
                </Suspense>
              </div>
            )}
            {issues.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
                {issues.map((i, n) => (
                  <li key={n} className="flex items-start gap-2 font-mono text-[12px]">
                    {i.level === "error" ? (
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    )}
                    <span>
                      <span className="text-muted-foreground">{i.where}:</span>{" "}
                      {localizeDiagnostic(i.message, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {doc && panelKind && (
          <div className="border-b border-border bg-surface px-3 py-2 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {panelKind === "provision"
                  ? `${t.provision_profile()}${provision ? ` · ${provision.kind}` : ""}`
                  : panelKind === "opencore"
                    ? t.opencore_config()
                    : panelKind === "strings"
                      ? t.strings_table()
                      : panelKind === "stringsdict"
                        ? t.stringsdict_plurals()
                        : t.entitlements()}
              </span>
              {appleErrors === 0 ? (
                <span className="inline-flex items-center gap-1 text-type-string">
                  <CheckCircle2 className="size-3.5" /> {t.valid_structure()}
                  {appleIssues.length > 0 &&
                    ` · ${t.warnings_count({ count: appleIssues.length })}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <XCircle className="size-3.5" /> {t.errors_count({ count: appleErrors })}
                  {appleIssues.length > appleErrors &&
                    `, ${t.warnings_count({ count: appleIssues.length - appleErrors })}`}
                </span>
              )}
              {appleKind === "entitlements" && doc.type === "dict" && (
                <span className="text-muted-foreground">
                  {t.entitlements_count({ count: doc.value.length })}
                </span>
              )}
            </div>
            {provision && (
              <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 font-mono text-[12px] sm:grid-cols-2">
                {(
                  [
                    [t.name(), provision.name],
                    ["App ID", provision.appId],
                    [
                      t.team(),
                      [provision.teamName, provision.teamIds.join(", ")]
                        .filter(Boolean)
                        .join(" · "),
                    ],
                    [
                      t.expires(),
                      provision.expires ? provision.expires.toISOString().slice(0, 10) : "—",
                    ],
                    [t.platform(), provision.platforms.join(", ")],
                    [
                      t.devices(),
                      provision.kind === "Enterprise" ? t.all_devices() : String(provision.devices),
                    ],
                    ["UUID", provision.uuid],
                    [
                      t.certificates(),
                      provision.certificates.map((c) => c.name).join(", ") || t.none(),
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="truncate text-foreground" title={v}>
                      {v || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {appleIssues.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
                {appleIssues.map((i, n) => (
                  <li key={n} className="flex items-start gap-2 font-mono text-[12px]">
                    {i.level === "error" ? (
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    )}
                    <span>
                      <span className="text-muted-foreground">{i.where}:</span>{" "}
                      {localizeDiagnostic(i.message, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {conversion && (
          <p className="border-b border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
            {conversion === "plist-to-json"
              ? t.json_conversion_note()
              : conversion === "json-to-plist"
                ? t.plist_conversion_note()
                : t.binary_conversion_note()}
          </p>
        )}
        {!doc && conversion && conversion !== "binary-to-xml" && (
          <div className="border-b border-border p-4">
            <label htmlFor="conversion-input" className="mb-2 block text-sm font-medium">
              {conversion === "json-to-plist" ? t.paste_json() : t.paste_plist()}
            </label>
            <textarea
              id="conversion-input"
              value={pasteText}
              onChange={(event) => {
                setPasteText(event.target.value);
                setError(null);
              }}
              spellCheck={false}
              placeholder={
                conversion === "json-to-plist"
                  ? JSON_SAMPLE
                  : '<?xml version="1.0"?>\n<plist version="1.0"><dict>...</dict></plist>'
              }
              className="min-h-40 w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-sm outline-none focus:border-ring"
            />
            <button
              type="button"
              disabled={!pasteText.trim()}
              onClick={convertPasted}
              className="mt-3 min-h-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              {t.convert_preview()}
            </button>
          </div>
        )}
        {!doc ? (
          <button
            type="button"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void load(f);
            }}
            className={cn(
              "group m-4 flex w-[calc(100%-2rem)] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background/40 px-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5",
              conversion && conversion !== "binary-to-xml" ? "py-5" : "min-h-[18rem] py-10",
              dragging && "bg-primary/10",
            )}
            onClick={() => inputRef.current?.click()}
          >
            <span className="mb-2 flex size-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Upload className="size-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-medium text-foreground">
              {conversion === "json-to-plist"
                ? t.drop_json()
                : profile
                  ? t.drop_profile()
                  : kind === "entitlements"
                    ? t.drop_entitlements()
                    : kind === "provision"
                      ? t.drop_provision()
                      : kind === "opencore"
                        ? t.drop_opencore()
                        : loc === "strings"
                          ? t.drop_strings()
                          : loc === "stringsdict"
                            ? t.drop_stringsdict()
                            : t.drop_plist()}
            </span>
            <span className="text-sm text-muted-foreground">
              {conversion === "json-to-plist"
                ? t.hint_json()
                : profile
                  ? t.hint_profile()
                  : kind === "entitlements"
                    ? t.hint_entitlements()
                    : kind === "provision"
                      ? t.hint_provision()
                      : kind === "opencore"
                        ? t.hint_opencore()
                        : loc === "strings"
                          ? t.hint_strings()
                          : loc === "stringsdict"
                            ? t.hint_stringsdict()
                            : t.hint_plist()}
            </span>
            <span className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <FolderOpen className="size-4" aria-hidden="true" />
              {t.browse_files()}
            </span>
          </button>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-3 py-3">
              <fieldset
                aria-label={t.editor_view()}
                className="flex rounded-lg border border-border bg-background p-1"
              >
                {(
                  [
                    ["tree", t.tree_view(), ListTree],
                    ["source", t.source(), Code2],
                    ...(!isMobile ? [["split", t.split_view(), Columns2] as const] : []),
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={activeView === value}
                    onClick={() => setView(value)}
                    className={cn(
                      "inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-[12px] transition-colors",
                      activeView === value
                        ? "bg-accent text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </fieldset>
              <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1 sm:max-w-sm">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    aria-label={t.search_values()}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (activeView === "source") setView("tree");
                    }}
                    placeholder={t.search_values()}
                    className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-9 text-[13px] placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label={t.clear_search()}
                      onClick={() => setQuery("")}
                      className="absolute right-1 top-1 flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div
              role="status"
              className="border-b border-border px-3 py-2 text-[12px] text-muted-foreground"
            >
              {query.trim()
                ? matches.size
                  ? t.search_matches({ count: matches.size })
                  : t.no_matches()
                : t.edit_hint()}
            </div>
            {sourceError && (
              <div
                role="alert"
                className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p>{t.source_error_hint()}</p>
                  <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
                    {localizeDiagnostic(sourceError, locale)}
                  </p>
                </div>
              </div>
            )}
            <div
              className={cn(
                "grid min-h-[26rem] grid-cols-1",
                focused && "flex-1",
                activeView === "split" && "md:grid-cols-[3fr_2fr]",
              )}
            >
              <fieldset
                disabled={!!sourceError}
                aria-label={t.tree_view()}
                className={cn(
                  "min-w-0 overflow-auto border-0 p-0 disabled:opacity-50",
                  focused ? "max-h-[calc(100dvh-12rem)]" : "max-h-[34rem]",
                  activeView === "source" && "hidden",
                  activeView === "split" && "border-r border-border",
                )}
              >
                <PlistTree
                  root={doc}
                  matches={matches}
                  hasQuery={query.trim().length > 0}
                  actions={actions}
                />
              </fieldset>
              <div className={cn("min-w-0 flex-col", activeView === "tree" ? "hidden" : "flex")}>
                <div className="flex min-h-11 items-center gap-1 border-b border-border bg-surface-raised px-3 py-1.5">
                  <span className="mr-auto text-[12px] text-muted-foreground">{t.source()}</span>
                  {(["xml", "json"] as EditorTab[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={tab === value}
                      disabled={!!sourceError && tab !== value}
                      onClick={() => {
                        if (tab === value) return;
                        setHistory((previous) => ({
                          ...previous,
                          group: null,
                          present: {
                            ...previous.present,
                            tab: value,
                            draft: null,
                            sourceError: null,
                            sourceLocation: null,
                          },
                        }));
                      }}
                      className={cn(
                        "min-h-8 rounded px-3 font-mono text-[12px] uppercase disabled:cursor-not-allowed disabled:opacity-40",
                        tab === value
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <Suspense
                  fallback={
                    <div className="min-h-[26rem] p-4 text-sm text-muted-foreground">
                      {t.loading_editor()}
                    </div>
                  }
                >
                  <SourceEditor
                    value={sourceText}
                    language={tab}
                    onChange={onSourceEdit}
                    onUndo={undo}
                    onRedo={redo}
                    error={sourceError ? localizeDiagnostic(sourceError, locale) : null}
                    errorLocation={sourceLocation}
                    focused={focused}
                  />
                </Suspense>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
