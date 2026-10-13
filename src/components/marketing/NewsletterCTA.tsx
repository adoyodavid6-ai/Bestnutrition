import Link from "next/link";
import { NewsletterForm } from "../forms/NewsletterForm";

/** Inline sign-up placed after recipes and articles, where intent is highest. */
export function NewsletterCTA({ source, heading = "Get a new meal plan every week", text = "One email a week: a seasonal meal plan, a few new recipes and a practical tip. No miracle claims, unsubscribe any time." }: { source: string; heading?: string; text?: string }) {
  return (
    <aside className="card newsletter-cta no-print" aria-label="Newsletter sign-up">
      <div>
        <span className="eyebrow">Free every week</span>
        <h2 style={{ fontSize: "var(--fs-xl)", margin: "0 0 6px" }}>{heading}</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {text} Or grab the <Link href="/free-meal-plan">free 7-day starter plan</Link> now.
        </p>
      </div>
      <NewsletterForm source={source} heading="" />
    </aside>
  );
}
