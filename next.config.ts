import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Files read at runtime with fs: product downloads (served only after verified purchase) and OG fonts.
  outputFileTracingIncludes: {
    "/api/products/download": ["./src/products/files/**"],
    "/opengraph-image": ["./src/assets/fonts/**"],
    "/recipes/[slug]/opengraph-image": ["./src/assets/fonts/**"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
