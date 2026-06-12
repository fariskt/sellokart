import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "cueyawsbhimlprssftnn.supabase.co",
      },
    ],
  },
};

export default nextConfig;