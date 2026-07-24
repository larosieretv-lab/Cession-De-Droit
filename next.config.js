/** @type {import('next').NextConfig} */
// Static export for GitHub Pages. For a project site served at
// https://<user>.github.io/<repo>/, set NEXT_PUBLIC_BASE_PATH="/<repo>".
// For a user/org site (root) or a custom domain, leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

module.exports = nextConfig;
