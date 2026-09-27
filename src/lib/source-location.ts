export interface SourceLocation {
  line: number;
  column: number;
}

/** Normalize native JSON/XML parser locations without changing their error messages. */
export function getErrorLocation(error: unknown, source: string): SourceLocation | null {
  if (error && typeof error === "object" && "sourceLocation" in error) {
    return error.sourceLocation as SourceLocation | null;
  }
  const message = error instanceof Error ? error.message : String(error);
  const lineColumn = /line\s+(\d+)(?:\s+at)?\s+column\s+(\d+)/i.exec(message);
  if (lineColumn) return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  const position = /position\s+(\d+)/i.exec(message);
  const offset = position
    ? Math.min(source.length, Number(position[1]))
    : /unexpected end/i.test(message)
      ? source.length
      : null;
  if (offset === null) return null;
  const lines = source.slice(0, offset).split("\n");
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}
