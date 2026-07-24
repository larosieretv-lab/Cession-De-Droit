/** @type {import('next').NextConfig} */
// Static export for GitHub Pages.
// The site is served at https://larosieretv-lab.github.io/Cession-De-Droit/,
// so production builds must prefix all assets with "/Cession-De-Droit".
// In dev (localhost) we keep the base path empty. Override with
// NEXT_PUBLIC_BASE_PATH if the repo/domain changes.
const isProd = process.env.NODE_ENV === "production";
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? "/Cession-De-Droit" : "");

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

module.exports = nextConfig;
