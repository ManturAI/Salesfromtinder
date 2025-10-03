import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: "http://localhost:4000/auth/:path*" },
      { source: "/me", destination: "http://localhost:4000/me" },
      { source: "/topics/:path*", destination: "http://localhost:4000/topics/:path*" },
      { source: "/subtopics/:path*", destination: "http://localhost:4000/subtopics/:path*" },
      { source: "/lessons/:path*", destination: "http://localhost:4000/lessons/:path*" },
      { source: "/dev/:path*", destination: "http://localhost:4000/dev/:path*" },
    ];
  },
};

export default nextConfig;
