import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { billingConfig } from "@/lib/billing/config";
import { verifyDownload } from "@/lib/commerce/delivery";
import { productBySlug } from "@/lib/commerce/products";
import { PurchaseTracker } from "@/components/billing/ProductBuy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your download", robots: { index: false, follow: false } };

export default async function DownloadPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ token?: string }> }) {
  const { slug } = await params;
  const { token } = await searchParams;
  const p = productBySlug(slug);
  if (!p) notFound();
  const secret = billingConfig().entitlementSecret;
  const grant = secret ? verifyDownload(token, secret) : null;
  const valid = grant?.slug === p.slug;
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/resources", label: "Resources" },
          { href: `/resources/${p.slug}`, label: p.name },
        ]}
      />
      <PageHead eyebrow="Your purchase" title={valid ? "Thank you — your download is ready" : "This download link isn't valid"} />
      <div className="container" style={{ paddingBottom: 48, maxWidth: 760 }}>
        {valid ? (
          <div className="card">
            <PurchaseTracker slug={p.slug} />
            <p>{p.name}</p>
            <div className="row">
              {p.files.map((f, i) => (
                <a key={f.file} className="btn btn-primary" href={`/api/products/download?token=${encodeURIComponent(token!)}&file=${i}`} download>
                  Download {f.label}
                </a>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 16 }}>
              This page works for 7 days{grant ? ` (until ${new Date(grant.exp * 1000).toUTCString().slice(0, 16)})` : ""}. Save the files to keep them. Stripe has emailed your receipt. {p.licence}
            </p>
          </div>
        ) : (
          <div className="card">
            <p className="small">Download links last 7 days. If yours has expired, <Link href="/contact?topic=general">contact us</Link> with the email you used at checkout and we&apos;ll send a new one.</p>
          </div>
        )}
      </div>
    </>
  );
}
