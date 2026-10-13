import Image from "next/image";
import type { FeaturedExtras as Extras } from "@/content/directory";

/** Gallery and extended description for paid Featured listings. */
export function FeaturedExtras({ listing, name }: { listing: Extras; name: string }) {
  if (!listing.extendedDescription && !listing.gallery?.length) return null;
  return (
    <section aria-label={`More about ${name}`} style={{ marginTop: 24 }}>
      {listing.extendedDescription && <p>{listing.extendedDescription}</p>}
      {listing.gallery && listing.gallery.length > 0 && (
        <div className="product-previews">
          {listing.gallery.slice(0, 8).map((g) => (
            <Image key={g.src} src={g.src} alt={g.alt} width={600} height={450} sizes="(min-width: 700px) 25vw, 45vw" style={{ objectFit: "cover" }} />
          ))}
        </div>
      )}
    </section>
  );
}
