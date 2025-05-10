/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "uploads.mangadex.org",
      "api.mangadex.org",
      "mangadex.org",
      "uploads.mangadex.dev",
      "api.mangadex.dev",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mangadex.org",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
