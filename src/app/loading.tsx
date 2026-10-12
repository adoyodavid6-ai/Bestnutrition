export default function Loading() {
  return (
    <div className="container section" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div style={{ height: 28, width: "40%", background: "var(--parchment-deep)", borderRadius: 8, marginBottom: 16 }} />
      <div style={{ height: 16, width: "70%", background: "var(--parchment-deep)", borderRadius: 8, marginBottom: 32 }} />
      <div className="grid grid-3">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ aspectRatio: "4/3", background: "var(--parchment-deep)", borderRadius: 20 }} />
        ))}
      </div>
    </div>
  );
}
