import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

async function fonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [regular, semibold, bold] = await Promise.all(["400", "600", "700"].map((w) => readFile(path.join(dir, `SourceSerif4-${w}.ttf`))));
  return [
    { name: "Source Serif 4", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Source Serif 4", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Source Serif 4", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

const Mark = () => (
  <svg width="56" height="56" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14.6" fill="#0A2610" stroke="#1f0e2f" strokeWidth="2.2" />
    <path d="M9 21c0-7 4.5-11.5 14-11.5 0 9-5.5 13-12.5 13" fill="none" stroke="#f4efed" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 22.5 17 15" stroke="#fde3d8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Branded social card: Parchment background, serif type, NourishWell wordmark. */
export async function ogCard({ eyebrow, title, facts = [], footer = "Eat Better. Feel Stronger. Live Well." }: { eyebrow: string; title: string; facts?: string[]; footer?: string }) {
  const size = title.length > 60 ? 60 : title.length > 36 ? 72 : 84;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4efed", padding: "64px 72px", fontFamily: "Source Serif 4", color: "#2C3E39", borderBottom: "18px solid #725246" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark />
          <div style={{ display: "flex", fontSize: 40 }}>
            <span style={{ fontWeight: 700, color: "#0A2610" }}>Nourish</span>
            <span style={{ fontWeight: 400, color: "#1f0e2f" }}>Well</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#725246" }}>{eyebrow}</div>
          <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.05, color: "#1f0e2f", maxWidth: 1050 }}>{title}</div>
          {facts.length > 0 && (
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {facts.map((f) => (
                <div key={f} style={{ display: "flex", fontSize: 26, padding: "8px 20px", borderRadius: 999, background: "#ffffff", border: "1px solid #ddd4cf" }}>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 26, color: "#4a5a55" }}>{footer}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
