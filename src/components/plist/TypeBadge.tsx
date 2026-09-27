import type { PType } from "@/lib/plist";
import { cn } from "@/lib/utils";

const TONE: Record<PType, string> = {
  string: "text-type-string",
  integer: "text-type-number",
  real: "text-type-number",
  boolean: "text-type-bool",
  date: "text-type-binary",
  data: "text-type-binary",
  uid: "text-type-binary",
  array: "text-type-container",
  dict: "text-type-container",
};

export function TypeBadge({ type, className }: { type: PType; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] tracking-tight", TONE[type], className)}>
      {type}
    </span>
  );
}
