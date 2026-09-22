import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * The fallback vehicle artwork is an SVG, and Next refuses to serve SVG
     * through the optimizer unless explicitly allowed. The CSP below keeps that
     * permissive-but-contained (no scripts, sandboxed).
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    /**
     * Remote hosts allowed as vehicle image sources.
     * Add your Cloudinary cloud / CDN hostname here if it differs, or upload
     * images locally (they land in /public/uploads and need no entry).
     */
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sundriveautos.com" },
    ],
  },
};

export default nextConfig;
