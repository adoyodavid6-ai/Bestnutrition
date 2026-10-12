"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container section center" style={{ maxWidth: 640 }}>
      <span className="eyebrow">Something went wrong</span>
      <h1>Sorry — this page didn&apos;t load</h1>
      <p className="lede" style={{ margin: "0 auto 24px" }}>
        Your saved recipes, plans and lists are safe on this device. Please try again.
      </p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  );
}
