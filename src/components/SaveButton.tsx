"use client";

import { Icon } from "./Icon";
import { toast } from "./Toaster";
import { KEYS, useStored } from "@/lib/storage";
import { track } from "@/lib/analytics";

/** Save/unsave a recipe (by slug) or an article (by path). */
export function SaveButton({ id, kind, label }: { id: string; kind: "recipe" | "article"; label: string }) {
  const key = kind === "recipe" ? KEYS.savedRecipes : KEYS.savedArticles;
  const [saved, setSaved] = useStored<string[]>(key, []);
  const isSaved = saved.includes(id);
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-pressed={isSaved}
      onClick={() => {
        setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
        toast(isSaved ? `Removed “${label}” from saved` : `Saved “${label}” to this device`);
        if (!isSaved && kind === "recipe") track("recipe_saved");
      }}
    >
      <Icon name="heart" size={16} /> {isSaved ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ title, text }: { title: string; text?: string }) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({ title, text, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          toast("Link copied to clipboard");
        } catch {
          // user cancelled the share sheet; nothing to do
        }
      }}
    >
      <Icon name="share" size={16} /> Share
    </button>
  );
}

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
      <Icon name="print" size={16} /> {label}
    </button>
  );
}
