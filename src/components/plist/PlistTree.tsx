import { ChevronDown, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n";

import {
  displayValue,
  P_TYPES,
  type Path,
  type PType,
  type PValue,
  parseScalar,
} from "@/lib/plist";
import { cn } from "@/lib/utils";
import { TypeBadge } from "./TypeBadge";

export interface TreeActions {
  onPendingChange: (id: string, pending: boolean) => void;
  onKeyChange: (path: Path, key: string) => void;
  onValueChange: (path: Path, value: PValue) => void;
  onTypeChange: (path: Path, type: PType) => void;
  onAddChild: (path: Path) => void;
  onDuplicate: (path: Path) => void;
  onRemove: (path: Path) => void;
}

interface RowProps extends TreeActions {
  node: PValue;
  path: Path;
  entryKey?: string | undefined;
  arrayIndex?: number | undefined;
  expanded: Set<string>;
  toggle: (id: string) => void;
  matches: Set<string>;
  hasQuery: boolean;
  depth: number;
}

function Row(props: RowProps) {
  const t = useT();
  const { node, path, entryKey, arrayIndex, expanded, toggle, matches, hasQuery, depth } = props;
  const id = path.join(".");
  const isContainer = node.type === "array" || node.type === "dict";
  const isOpen = isContainer && expanded.has(id);
  const highlight = hasQuery && matches.has(id);
  const [keyDraft, setKeyDraft] = useState<string | null>(null);

  const childCount = isContainer ? node.value.length : 0;

  return (
    <>
      <div
        className={cn(
          "group grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] sm:grid-cols-[minmax(15rem,1.4fr)_5.5rem_minmax(10rem,1fr)_5.5rem] items-center gap-2 border-b border-border/60 px-2 py-1.5 text-[13px] hover:bg-accent/40",
          highlight && "bg-primary/10",
        )}
      >
        <div
          className="col-span-3 flex min-w-0 items-center gap-1 sm:col-span-1"
          style={{ paddingLeft: depth * 14 }}
        >
          {isContainer ? (
            <button
              type="button"
              aria-label={isOpen ? t.collapse() : t.expand()}
              aria-expanded={isOpen}
              onClick={() => toggle(id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {isOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="inline-block w-[18px] shrink-0" />
          )}
          {entryKey !== undefined ? (
            <input
              aria-label={`${t.key()}: ${entryKey}`}
              title={entryKey}
              value={keyDraft ?? entryKey}
              spellCheck={false}
              onChange={(e) => {
                setKeyDraft(e.target.value);
                props.onPendingChange(`key:${id}`, e.target.value !== entryKey);
              }}
              onBlur={() => {
                if (keyDraft !== null && keyDraft !== entryKey) props.onKeyChange(path, keyDraft);
                setKeyDraft(null);
                props.onPendingChange(`key:${id}`, false);
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-full min-w-0 truncate rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[13px] text-foreground outline-none hover:border-border focus:border-ring focus:bg-background"
            />
          ) : (
            <span className="px-1 font-mono text-[13px] text-muted-foreground">
              {t.item_index({ index: arrayIndex ?? 0 })}
            </span>
          )}
        </div>

        <select
          aria-label={`${t.type()}: ${entryKey ?? t.item_index({ index: arrayIndex ?? 0 })}`}
          value={node.type}
          onChange={(e) => props.onTypeChange(path, e.target.value as PType)}
          className="w-full cursor-pointer rounded border border-transparent bg-transparent py-0.5 font-mono text-[11px] text-muted-foreground outline-none hover:border-border focus:border-ring"
        >
          {P_TYPES.map((t) => (
            <option key={t} value={t} className="bg-popover text-popover-foreground">
              {t}
            </option>
          ))}
        </select>

        <div className="min-w-0">
          {isContainer ? (
            <span className="px-1 font-mono text-[12px] text-muted-foreground">
              {node.type === "dict"
                ? t.keys_count({ count: childCount })
                : t.items_count({ count: childCount })}
            </span>
          ) : node.type === "boolean" ? (
            <select
              aria-label={`${t.value()}: ${entryKey ?? t.item_index({ index: arrayIndex ?? 0 })}`}
              value={node.value ? "true" : "false"}
              onChange={(e) =>
                props.onValueChange(path, { type: "boolean", value: e.target.value === "true" })
              }
              className="cursor-pointer rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[13px] text-type-bool outline-none hover:border-border focus:border-ring"
            >
              <option value="true" className="bg-popover text-popover-foreground">
                true
              </option>
              <option value="false" className="bg-popover text-popover-foreground">
                false
              </option>
            </select>
          ) : (
            <ValueInput
              node={node}
              onPendingChange={(pending) => props.onPendingChange(`value:${id}`, pending)}
              label={`${t.value()}: ${entryKey ?? t.item_index({ index: arrayIndex ?? 0 })}`}
              onCommit={(text) => props.onValueChange(path, parseScalar(node.type, text, node))}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-0.5 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          {isContainer && (
            <IconButton label={t.add_child()} onClick={() => props.onAddChild(path)}>
              <Plus className="size-3.5" />
            </IconButton>
          )}
          <IconButton label={t.duplicate()} onClick={() => props.onDuplicate(path)}>
            <Copy className="size-3.5" />
          </IconButton>
          <IconButton label={t.delete_item()} onClick={() => props.onRemove(path)} danger>
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      </div>

      {isOpen &&
        node.type === "dict" &&
        node.value.map((entry, i) => (
          <Row
            {...props}
            key={`${id}.${i}`}
            node={entry.value}
            entryKey={entry.key}
            arrayIndex={undefined}
            path={[...path, i]}
            depth={depth + 1}
          />
        ))}
      {isOpen &&
        node.type === "array" &&
        node.value.map((item, i) => (
          <Row
            {...props}
            key={`${id}.${i}`}
            node={item}
            entryKey={undefined}
            arrayIndex={i}
            path={[...path, i]}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

function ValueInput({
  node,
  label,
  onCommit,
  onPendingChange,
}: {
  node: PValue;
  label: string;
  onCommit: (text: string) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const initial = displayValue(node);
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      aria-label={label}
      title={initial}
      value={draft ?? initial}
      spellCheck={false}
      onChange={(e) => {
        setDraft(e.target.value);
        onPendingChange(e.target.value !== initial);
      }}
      onBlur={() => {
        if (draft !== null && draft !== initial) onCommit(draft);
        setDraft(null);
        onPendingChange(false);
      }}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className="w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[13px] text-foreground outline-none hover:border-border focus:border-ring focus:bg-background"
    />
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded p-2 text-foreground/80 hover:bg-accent hover:text-foreground",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

export function PlistTree({
  root,
  matches,
  hasQuery,
  actions,
}: {
  root: PValue;
  matches: Set<string>;
  hasQuery: boolean;
  actions: TreeActions;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([""]));
  const visibleExpanded = useMemo(() => {
    if (!hasQuery) return expanded;
    const next = new Set(expanded);
    next.add("");
    for (const match of matches) {
      const parts = match.split(".");
      for (let i = 1; i < parts.length; i++) next.add(parts.slice(0, i).join("."));
    }
    return next;
  }, [expanded, hasQuery, matches]);
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="min-w-0 sm:min-w-[40rem]">
      <div className="sticky top-0 z-10 hidden sm:grid grid-cols-[minmax(15rem,1.4fr)_5.5rem_minmax(10rem,1fr)_5.5rem] gap-2 border-b border-border bg-surface-raised px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{t.key()}</span>
        <span>{t.type()}</span>
        <span>{t.value()}</span>
        <span className="w-[76px]" />
      </div>
      <div className="font-sans">
        <div className="grid grid-cols-[minmax(0,1fr)_4rem_6rem_2rem] sm:grid-cols-[minmax(15rem,1.4fr)_5.5rem_minmax(10rem,1fr)_5.5rem] items-center gap-2 border-b border-border/60 bg-surface px-2 py-1.5 text-[13px]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggle("")}
              aria-label={t.toggle_root()}
              aria-expanded={visibleExpanded.has("")}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {visibleExpanded.has("") ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
            <span className="px-1 font-mono text-[13px] text-foreground">{t.root()}</span>
          </div>
          <TypeBadge type={root.type} />
          <span className="px-1 font-mono text-[12px] text-muted-foreground">
            {root.type === "dict"
              ? t.keys_count({ count: root.value.length })
              : root.type === "array"
                ? t.items_count({ count: root.value.length })
                : displayValue(root)}
          </span>
          <div className="flex justify-end">
            {(root.type === "dict" || root.type === "array") && (
              <IconButton label={t.add_child()} onClick={() => actions.onAddChild([])}>
                <Plus className="size-3.5" />
              </IconButton>
            )}
          </div>
        </div>
        {visibleExpanded.has("") &&
          root.type === "dict" &&
          root.value.map((entry, i) => (
            <Row
              key={i}
              node={entry.value}
              entryKey={entry.key}
              path={[i]}
              depth={1}
              expanded={visibleExpanded}
              toggle={toggle}
              matches={matches}
              hasQuery={hasQuery}
              {...actions}
            />
          ))}
        {visibleExpanded.has("") &&
          root.type === "array" &&
          root.value.map((item, i) => (
            <Row
              key={i}
              node={item}
              arrayIndex={i}
              path={[i]}
              depth={1}
              expanded={visibleExpanded}
              toggle={toggle}
              matches={matches}
              hasQuery={hasQuery}
              {...actions}
            />
          ))}
      </div>
    </div>
  );
}
