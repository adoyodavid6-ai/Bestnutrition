import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section center" style={{ maxWidth: 680 }}>
      <span className="eyebrow">404</span>
      <h1>We couldn&apos;t find that page</h1>
      <p className="lede" style={{ margin: "0 auto 24px" }}>
        It may have moved, or the link may be mistyped. Try searching, or start from one of these.
      </p>
      <form action="/search" role="search" className="search-form" style={{ maxWidth: 520, margin: "0 auto 24px" }}>
        <label htmlFor="nf-q" className="sr-only">
          Search
        </label>
        <input id="nf-q" name="q" type="search" className="input" placeholder="Search recipes and guides" />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link href="/recipes" className="btn btn-ghost">
          Recipes
        </Link>
        <Link href="/meal-planner" className="btn btn-ghost">
          Meal planner
        </Link>
        <Link href="/" className="btn btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
