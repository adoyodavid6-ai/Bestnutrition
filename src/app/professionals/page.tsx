import type { Metadata } from "next";
import Link from "next/link";
import { formatRate } from "@/lib/booking";
import { publishedProfessionals } from "@/content/directory";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";

export const metadata: Metadata = {
  title: "Find a Nutrition Professional",
  description: "A directory of verified registered dietitians, nutritionists and wellness professionals. Every listing is checked before publication.",
  alternates: { canonical: "/professionals" },
};

export default function ProfessionalsPage() {
  const list = publishedProfessionals();
  return (
    <>
      <Breadcrumbs items={[{ href: "/professionals", label: "Professionals" }]} />
      <PageHead
        eyebrow="Professional directory"
        title="Verified nutrition professionals"
        lede="Find registered dietitians, nutritionists and wellness professionals whose credentials we've checked against the relevant professional register."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        {list.length === 0 ? (
          <div className="empty-state">
            <h2>The directory is opening soon</h2>
            <p className="muted" style={{ maxWidth: "60ch", margin: "0 auto 20px" }}>
              We&apos;re verifying the first professionals now. We publish a listing only after checking the person&apos;s registration — so there are no listings here yet, rather than unverified
              ones.
            </p>
            <div className="row" style={{ justifyContent: "center" }}>
              <Link href="/professionals/join" className="btn btn-primary">
                I&apos;m a professional — apply
              </Link>
              <Link href="/health-conditions" className="btn btn-ghost">
                Read our condition guides
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-3">
            {list.map((p) => (
              <Link key={p.slug} href={`/professionals/${p.slug}`} className="card card-link">
                {p.promoted && <span className="chip chip-warning">Promoted</span>}
                <h2 style={{ fontSize: "1.2rem" }}>{p.name}</h2>
                <p className="small muted">{p.profession}</p>
                <p className="small">
                  {formatRate(p.hourlyRate.amount, p.hourlyRate.currency)} per hour{p.availability ? " · book online" : ""}
                </p>
                <span className="chip chip-success">Verified</span>
              </Link>
            ))}
          </div>
        )}
        <div className="two-col-list" style={{ marginTop: 32 }}>
          <div className="card">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Finding help in the meantime</h2>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Ask your doctor or clinic for a referral to a registered dietitian.</li>
              <li>Check your national dietetic association or regulator — many publish searchable registers of qualified practitioners.</li>
              <li>Be cautious of titles that aren&apos;t protected in your country, and of anyone selling cures or supplements alongside advice.</li>
            </ul>
          </div>
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Our verification standard</h2>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Credentials are checked against the issuing body&apos;s public register.</li>
              <li>Each profile shows the verification date and is re-checked annually.</li>
              <li>Paid placement never affects verification, and promoted listings are clearly labelled.</li>
              <li>
                Spot a problem? <Link href="/contact?topic=correction">Report a listing</Link>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
