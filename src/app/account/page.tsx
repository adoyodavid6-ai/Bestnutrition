import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { AccountSettings } from "@/components/AccountSettings";

export const metadata: Metadata = {
  title: "Account & Preferences",
  description: "Manage your NourishWell preferences, notifications, and data export or deletion.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/account", label: "Account" }]} />
      <PageHead eyebrow="Settings" title="Account & preferences" />
      <div className="container" style={{ paddingBottom: 48, maxWidth: 900 }}>
        <AccountSettings />
      </div>
    </>
  );
}
