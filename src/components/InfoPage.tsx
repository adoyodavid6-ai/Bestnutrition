import { Breadcrumbs } from "./Breadcrumbs";
import { formatDate } from "./Editorial";

export function InfoPage({ path, eyebrow, title, lede, updated, draftNotice, children }: { path: string; eyebrow: string; title: string; lede?: string; updated?: string; draftNotice?: boolean; children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs items={[{ href: path, label: title }]} />
      <header className="page-head container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {updated && <p className="xs muted" style={{ marginTop: 12 }}>Last updated {formatDate(updated)}</p>}
      </header>
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="prose">
          {draftNotice && (
            <div className="callout callout-warning" style={{ marginBottom: 24 }}>
              <span className="callout-title">Draft pending legal review</span>
              <p className="small">
                This document describes how the site currently works. It has not yet been reviewed by a lawyer for every market NourishWell serves and should not be read as a claim of compliance with any
                specific law.
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
