"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Counts that a search happened. The query text itself is never sent. */
export function SearchTracker() {
  useEffect(() => {
    track("search");
  }, []);
  return null;
}
