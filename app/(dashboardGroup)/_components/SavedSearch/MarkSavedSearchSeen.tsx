"use client";

import { useEffect, useRef } from "react";
import { markSavedSearchSeenAction } from "../../_actions/savedSearchActions";

/*
 * Opening a saved search clears its "new" badge (after render, once),
 * so this visit still shows which matches were new.
 */
export default function MarkSavedSearchSeen({ id, hasNew }: { id: string; hasNew: boolean }) {
  const done = useRef(false);

  useEffect(() => {
    if (!hasNew || done.current) return;
    done.current = true;
    markSavedSearchSeenAction(id).catch(() => null);
  }, [id, hasNew]);

  return null;
}
