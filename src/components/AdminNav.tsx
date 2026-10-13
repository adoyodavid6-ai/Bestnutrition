import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Content & operations" },
  { href: "/admin/monetization", label: "Monetization map" },
  { href: "/admin/revenue", label: "Revenue" },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav aria-label="Admin sections" className="chip-row" style={{ marginBottom: 24 }}>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={`chip ${l.href === current ? "chip-violet" : "chip-outline"}`} aria-current={l.href === current ? "page" : undefined} style={{ textDecoration: "none" }}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
