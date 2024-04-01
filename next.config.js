/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "github.com",
        pathname: "*",
        protocol: "https",
      },
      {
        hostname: "media.graphassets.com",
        pathname: "*",
        protocol: "https",
      },
    ],
    domains: ["github.com", "media.graphassets.com", "i.pinimg.com"],
  },
};

module.exports = nextConfig;
