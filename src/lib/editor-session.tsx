import { useLocation } from "@tanstack/react-router";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { splitLocalePath } from "./locales";

type Store<T> = {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: Dispatch<SetStateAction<T>>;
};
function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (next) => {
      const updated = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      if (Object.is(value, updated)) return;
      value = updated;
      for (const listener of listeners) listener();
    },
  };
}
const SessionContext = createContext<Map<string, Store<unknown>> | null>(null);
/** In-memory only: survives locale navigation without persisting private files to disk. */
export function EditorSessionProvider({ children }: { children: ReactNode }) {
  const [sessions] = useState(() => new Map<string, Store<unknown>>());
  useEffect(() => {
    const protectSession = (event: BeforeUnloadEvent) => {
      if ([...sessions].some(([key, store]) => key.endsWith(":unsaved") && store.getSnapshot())) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protectSession);
    return () => window.removeEventListener("beforeunload", protectSession);
  }, [sessions]);
  return <SessionContext.Provider value={sessions}>{children}</SessionContext.Provider>;
}
export function useEditorState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const sessions = useContext(SessionContext);
  const pathname = useLocation({ select: (location) => location.pathname });
  const sessionKey = `${splitLocalePath(pathname).path}:${key}`;
  // Keep each initializer stable without making edited values a memo dependency.
  const [defaultValue] = useState(() => initial);
  const store = useMemo(() => {
    if (!sessions) throw new Error("EditorSessionProvider is required");
    let stored = sessions.get(sessionKey);
    if (!stored) {
      stored = createStore<unknown>(defaultValue);
      sessions.set(sessionKey, stored);
    }
    return stored as Store<T>;
  }, [sessions, sessionKey, defaultValue]);
  return [useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot), store.set];
}
