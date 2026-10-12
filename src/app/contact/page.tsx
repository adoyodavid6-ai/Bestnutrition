import type { Metadata } from "next";
import { Suspense } from "react";
import { InfoPage } from "@/components/InfoPage";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Contact Us", description: "Questions, corrections, privacy requests and partnerships.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <InfoPage path="/contact" eyebrow="Contact" title="Contact us" lede="Questions, corrections, privacy requests and partnership ideas are all welcome.">
      <div className="callout callout-info" style={{ marginBottom: 24 }}>
        <p className="small">
          We can&apos;t give personal medical advice. If you&apos;re unwell, contact a health professional — or your local emergency number if it&apos;s urgent.
        </p>
      </div>
      <div className="card">
        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </InfoPage>
  );
}
