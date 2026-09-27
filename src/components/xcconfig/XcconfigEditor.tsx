import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FilePlus2,
  FolderOpen,
  Plus,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { localizeDiagnostic } from "@/lib/diagnostics";
import { useEditorState } from "@/lib/editor-session";
import { useLocale, useT } from "@/lib/i18n";

import {
  buildXcconfig,
  editSetting,
  NEW_XCCONFIG,
  parseXcconfig,
  SAMPLE_XCCONFIG,
  validateXcconfig,
  type XcLine,
} from "@/lib/xcconfig";

type Setting = XcLine & { kind: "setting" };

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[13px] text-foreground transition-colors hover:bg-accent disabled:opacity-40";

export function XcconfigEditor() {
  const t = useT();
  const locale = useLocale();
  const [lines, setLines] = useEditorState<XcLine[] | null>("XcconfigEditor.lines", null);
  const [fileName, setFileName] = useEditorState("XcconfigEditor.fileName", "Config.xcconfig");
  const [draft, setDraft] = useEditorState<string | null>("XcconfigEditor.draft", null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = useMemo(() => (lines ? buildXcconfig(lines) : ""), [lines]);
  const issues = useMemo(() => (lines ? validateXcconfig(lines) : []), [lines]);
  const errors = issues.filter((i) => i.level === "error").length;
  const settingCount = lines?.filter((l) => l.kind === "setting").length ?? 0;
  const includes = lines?.filter((l) => l.kind === "include").length ?? 0;

  const open = (t: string, name: string) => {
    setLines(parseXcconfig(t));
    setFileName(name);
    setDraft(null);
  };
  const load = async (f: File) => open(await f.text(), f.name);

  const update = (i: number, patch: Partial<Pick<Setting, "key" | "conditions" | "value">>) => {
    setDraft(null);
    setLines(
      (ls) =>
        ls?.map((l, n) => (n === i && l.kind === "setting" ? editSetting(l, patch) : l)) ?? null,
    );
  };
  const remove = (i: number) => {
    setDraft(null);
    setLines((ls) => ls?.filter((_, n) => n !== i) ?? null);
  };
  const add = () => {
    setDraft(null);
    setLines((ls) => {
      const base = ls ?? [];
      const keys = new Set(base.flatMap((l) => (l.kind === "setting" ? [l.key] : [])));
      let k = "NEW_SETTING";
      for (let n = 2; keys.has(k); n++) k = `NEW_SETTING_${n}`;
      return [
        ...base,
        editSetting(
          { kind: "setting", raw: "", key: k, conditions: "", value: "", comment: "" },
          {},
        ),
      ];
    });
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = /\.xcconfig$/i.test(fileName)
      ? fileName
      : `${fileName.replace(/\.[^.]*$/, "")}.xcconfig`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag and drop supplements the keyboard-accessible Open file button.
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) void load(f);
      }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-raised px-3 py-2">
        <button type="button" className={btn} onClick={() => inputRef.current?.click()}>
          <FolderOpen className="size-3.5" /> {t.open_file()}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => open(NEW_XCCONFIG, "Untitled.xcconfig")}
        >
          <FilePlus2 className="size-3.5" /> {t.new_file()}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => open(SAMPLE_XCCONFIG, "Shared.xcconfig")}
        >
          <Sparkles className="size-3.5" /> {t.load_sample()}
        </button>
        <span className="truncate font-mono text-[12px] text-muted-foreground">
          {lines && fileName}
        </span>
        <div className="ml-auto">
          <button type="button" className={btn} disabled={!lines} onClick={download}>
            <Download className="size-3.5" /> {t.xcconfig_download()}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xcconfig,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void load(f);
          e.target.value = "";
        }}
      />

      {!lines ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-72 w-full flex-col items-center justify-center gap-2 text-center transition-colors ${dragging ? "bg-accent" : ""}`}
        >
          <FolderOpen className="size-8 text-primary" />
          <span className="text-[15px] font-medium">{t.drop_xcconfig()}</span>
          <span className="text-[13px] text-muted-foreground">{t.hint_xcconfig()}</span>
        </button>
      ) : (
        <>
          <div className="border-b border-border bg-surface px-3 py-2 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.build_settings()}
              </span>
              {errors === 0 ? (
                <span className="inline-flex items-center gap-1 text-type-string">
                  <CheckCircle2 className="size-3.5" /> {t.valid_syntax()}
                  {issues.length > 0 && ` · ${t.warnings_count({ count: issues.length })}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <XCircle className="size-3.5" /> {t.errors_count({ count: errors })}
                  {issues.length > errors &&
                    `, ${t.warnings_count({ count: issues.length - errors })}`}
                </span>
              )}
              <span className="text-muted-foreground">
                {t.settings_count({ count: settingCount, includes })}
              </span>
            </div>
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

          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border">
            <div className="max-h-[32rem] overflow-auto">
              <table className="w-full font-mono text-[12px]">
                <thead className="sticky top-0 bg-surface-raised text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 font-normal">{t.setting()}</th>
                    <th className="px-2 py-1.5 font-normal">{t.condition()}</th>
                    <th className="px-2 py-1.5 font-normal">{t.value()}</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) =>
                    l.kind === "setting" ? (
                      <tr key={i} className="group border-t border-border/60">
                        <td className="px-1">
                          <input
                            aria-label={t.setting_name()}
                            value={l.key}
                            onChange={(e) => update(i, { key: e.target.value })}
                            className="w-full bg-transparent px-1 py-1 text-type-key outline-none focus:bg-accent"
                          />
                        </td>
                        <td className="px-1">
                          <input
                            aria-label={t.condition()}
                            value={l.conditions}
                            placeholder="—"
                            onChange={(e) => update(i, { conditions: e.target.value })}
                            className="w-full bg-transparent px-1 py-1 text-muted-foreground outline-none focus:bg-accent"
                          />
                        </td>
                        <td className="px-1">
                          <input
                            aria-label={t.value_of({ name: l.key })}
                            value={l.value}
                            onChange={(e) => update(i, { value: e.target.value })}
                            className="w-full bg-transparent px-1 py-1 text-foreground outline-none focus:bg-accent"
                          />
                        </td>
                        <td className="px-1">
                          <button
                            type="button"
                            aria-label={t.delete_named({ name: l.key })}
                            onClick={() => remove(i)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </td>
                      </tr>
                    ) : l.kind === "include" ? (
                      <tr key={i} className="border-t border-border/60 text-muted-foreground">
                        <td colSpan={3} className="px-2 py-1">
                          #include{l.optional ? "?" : ""} "{l.path}"
                        </td>
                        <td />
                      </tr>
                    ) : l.kind === "invalid" ? (
                      <tr key={i} className="border-t border-border/60 text-destructive">
                        <td colSpan={3} className="px-2 py-1">
                          {l.raw}
                        </td>
                        <td />
                      </tr>
                    ) : null,
                  )}
                </tbody>
              </table>
              <button
                type="button"
                onClick={add}
                className="m-2 inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
              >
                <Plus className="size-3.5" /> {t.add_setting()}
              </button>
            </div>
            <div className="flex min-h-[20rem] flex-col border-t border-border lg:border-t-0">
              <div className="border-b border-border bg-surface-raised px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.source()}
              </div>
              <textarea
                aria-label={t.xcconfig_source()}
                value={draft ?? text}
                spellCheck={false}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setLines(parseXcconfig(e.target.value));
                }}
                className="h-[30rem] w-full flex-1 resize-none bg-background px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
