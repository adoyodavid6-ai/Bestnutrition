import type { ContentReview } from "@/lib/types";

/**
 * Health content is published as general education while awaiting review by a qualified
 * professional. We never record a reviewer who has not actually reviewed the piece.
 */
export const awaitingReview = (published: string): ContentReview => ({
  status: "in-review",
  author: "NourishWell Editorial Team",
  published,
  note: "Written from the cited public-health sources. Review by a registered dietitian or relevant clinician is pending; the reviewer and review date will appear here once it is complete.",
});
