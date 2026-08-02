import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  // Nix store is read-only at runtime; Next.js tries to mkdir
  // <distDir>/cache/images for the on-disk image optimizer LRU and
  // crashes with EACCES unhandledRejection on every optimized image
  // request. Disable the disk cache (and disable ISR flush which gates it).
  images: {
    maximumDiskCacheSize: 0,
  },
  experimental: {
    isrFlushToDisk: false,
  },
};

export default nextConfig;
