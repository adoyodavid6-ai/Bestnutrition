import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { Logo } from "./Icon";
import { NewsletterForm } from "./forms/NewsletterForm";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Logo inverted />
            </Link>
            <p className="small" style={{ marginTop: "1rem", maxWidth: "34ch" }}>
              {site.tagline} Practical, evidence-informed nutrition for every kitchen, culture and budget.
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <NewsletterForm variant="dark" compact />
            </div>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-legal">
          <p>
            NourishWell provides general information for education only. It is not medical advice and does not replace diagnosis or treatment by a qualified professional. In an emergency, contact your local emergency
            services.
          </p>
          <p style={{ marginBottom: 0 }}>
            © {new Date().getFullYear()} NourishWell. Nutrition estimates are calculated from{" "}
            <a href="https://fdc.nal.usda.gov/" rel="noopener noreferrer" target="_blank">
              USDA FoodData Central
            </a>{" "}
            reference values. Illustrations are generated from each recipe&apos;s ingredients.
          </p>
        </div>
      </div>
    </footer>
  );
}
