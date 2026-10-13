import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { BillingPanel } from "@/components/billing/BillingPanel";

export const metadata: Metadata = {
  title: "Billing",
  description: "Your NourishWell plan, billing management, cancellation and receipts.",
  robots: { index: false },
  alternates: { canonical: "/account/billing" },
};

export default function BillingPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/account", label: "Account" },
          { href: "/account/billing", label: "Billing" },
        ]}
      />
      <PageHead eyebrow="Account" title="Plan & billing" />
      <div className="container" style={{ paddingBottom: 48, maxWidth: 900 }}>
        <BillingPanel />
      </div>
    </>
  );
}
