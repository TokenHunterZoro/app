/** @type {import('next').NextConfig} */
const nextConfig = {
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
