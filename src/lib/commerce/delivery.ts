import { signToken, verifyToken } from "../billing/entitlement";

/** Download links stay valid for 7 days after purchase; the receipt email repeats the link. */
export const DOWNLOAD_TTL_SEC = 7 * 24 * 3600;

export interface DownloadGrant {
  slug: string;
  session: string;
  exp: number;
}

export const signDownload = (g: DownloadGrant, secret: string) => signToken("download", g, secret);
export const verifyDownload = (token: string | null | undefined, secret: string, nowSec?: number) => verifyToken<DownloadGrant>("download", token, secret, nowSec);
