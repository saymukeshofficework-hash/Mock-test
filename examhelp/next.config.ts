import type { NextConfig } from "next";

/**
 * Two build targets:
 *  - default: full Next.js server (Vercel, Node) — language switch, APIs.
 *  - NEXT_PUBLIC_STATIC_EXPORT=1: static files for the GitHub Pages demo.
 *    NEXT_PUBLIC_BASE_PATH is the repo sub-path, e.g. "/Chat-practice-121".
 */
const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = isStatic
  ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
