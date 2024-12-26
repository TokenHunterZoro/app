/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  async headers() {
    return [
      {
        source: "/embed", // Apply only to the /embed route
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // Allow all origins to embed
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;", // Allow iframe embedding
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ipfs/:path*",
        destination: "https://ipfs.io/ipfs/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder",
        port: "",
      },
      {
        protocol: "https",
        hostname: "p16-sign.tiktokcdn-us",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "nftstorage.link",
        port: "",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
      },
    ],
  },
};

export default nextConfig;
