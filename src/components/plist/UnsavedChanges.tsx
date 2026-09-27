import { useBlocker } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorState } from "@/lib/editor-session";
import { useT } from "@/lib/i18n";
import { splitLocalePath } from "@/lib/locales";

export function useUnsavedChanges(dirty: boolean) {
  const t = useT();
  const [, setUnsaved] = useEditorState("unsaved", false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const currentDirty = useRef(dirty);
  useEffect(() => {
    currentDirty.current = dirty;
    setUnsaved(dirty);
  }, [dirty, setUnsaved]);
  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      dirty && splitLocalePath(current.pathname).path !== splitLocalePath(next.pathname).path,
    enableBeforeUnload: false, // The session provider also protects edits on inactive tool pages.
    withResolver: true,
    disabled: !dirty,
  });
  const requestReplace = (action: () => void) => {
    // File reading may finish after another edit, so don't use its old render's dirty flag.
    if (currentDirty.current) setPending(() => action);
    else action();
  };
  const cancel = () => {
    setPending(null);
    blocker.reset?.();
  };
  const dialog = (
    <AlertDialog
      open={!!pending || blocker.status === "blocked"}
      onOpenChange={(open) => !open && cancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.unsaved_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {pending ? t.unsaved_replace() : t.unsaved_leave()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>{t.keep_editing()}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pending) {
                const action = pending;
                setPending(null);
                action();
              } else blocker.proceed?.();
            }}
          >
            {pending ? t.discard_replace() : t.leave_tool()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return { requestReplace, dialog };
}
