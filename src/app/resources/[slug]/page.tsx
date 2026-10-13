import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductBuy } from "@/components/billing/ProductBuy";
import { oneTimeOffer } from "@/lib/billing/offers";
import { PRODUCTS, productBySlug, productPriceId, productSellable } from "@/lib/commerce/products";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  return p ? { title: p.name, description: p.summary, alternates: { canonical: `/resources/${p.slug}` } } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = productBySlug((await params).slug);
  if (!p || p.status !== "published") notFound();
  const offer = productSellable(p) ? await oneTimeOffer(productPriceId(p)) : null;
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/resources", label: "Resources" },
          { href: `/resources/${p.slug}`, label: p.name },
        ]}
      />
      <article className="container product-layout" style={{ paddingBottom: 48 }}>
        <div>
          <span className="eyebrow">{p.format}</span>
          <h1>{p.name}</h1>
          {p.description.map((d) => (
            <p key={d} className="lede" style={{ fontSize: "var(--fs-lg)" }}>
              {d}
            </p>
          ))}
          <div className="product-previews" aria-label="Sample pages">
            {p.previews.map((im) => (
              <Image key={im.src} src={im.src} alt={im.alt} width={600} height={850} sizes="(min-width: 960px) 25vw, 45vw" />
            ))}
          </div>
          <h2 style={{ fontSize: "var(--fs-xl)", marginTop: 32 }}>What&apos;s inside</h2>
          <ul className="check-list">
            {p.contents.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <h2 style={{ fontSize: "var(--fs-xl)", marginTop: 32 }}>Who it&apos;s for</h2>
          <p>{p.audience}. It helps with: {p.outcome.toLowerCase()}.</p>
          <p className="small muted">General guidance only — not a diet, treatment or clinical nutrition plan. If you have a medical condition, follow your clinician&apos;s advice.</p>
        </div>
        <aside className="card product-buy" aria-label="Buy">
          <p className="price-amount">{offer ? offer.display : "Coming soon"}</p>
          <p className="small muted">{offer ? "One-time purchase · instant download · no subscription" : "This resource isn't on sale yet."}</p>
          {offer ? (
            <Suspense>
              <ProductBuy slug={p.slug} />
            </Suspense>
          ) : (
            <Link href="/free-meal-plan" className="btn btn-secondary">
              Get the free 7-day plan instead
            </Link>
          )}
          <ul className="small" style={{ marginTop: 16 }}>
            <li>{p.format}</li>
            <li>{p.licence}</li>
            <li>
              Problem with your file or bought by mistake? <Link href="/contact?topic=general">Contact us</Link> — see <Link href="/terms#digital-products">refund terms</Link>.
            </li>
          </ul>
        </aside>
      </article>
    </>
  );
}
