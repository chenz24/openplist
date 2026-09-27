/** Immutable, bounded document history shared by tree and source edits. */
export interface EditorHistory<T> {
  past: T[];
  present: T;
  future: T[];
  group: string | null;
  changedAt: number;
}

export function createHistory<T>(present: T): EditorHistory<T> {
  return { past: [], present, future: [], group: null, changedAt: 0 };
}

export function recordEdit<T>(
  history: EditorHistory<T>,
  present: T,
  group: string | null = null,
  now = Date.now(),
): EditorHistory<T> {
  if (Object.is(history.present, present)) return history;
  const coalesce = group !== null && group === history.group && now - history.changedAt < 750;
  return {
    past: coalesce ? history.past : [...history.past, history.present].slice(-100),
    present,
    future: [],
    group,
    changedAt: now,
  };
}

export function undoEdit<T>(history: EditorHistory<T>): EditorHistory<T> {
  const present = history.past.at(-1);
  if (present === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present,
    future: [history.present, ...history.future],
    group: null,
    changedAt: 0,
  };
}

export function redoEdit<T>(history: EditorHistory<T>): EditorHistory<T> {
  const present = history.future[0];
  if (present === undefined) return history;
  return {
    past: [...history.past, history.present],
    present,
    future: history.future.slice(1),
    group: null,
    changedAt: 0,
  };
}
