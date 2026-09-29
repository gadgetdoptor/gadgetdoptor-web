import type { NextConfig } from "next";

// Extract hostname from the S3 endpoint URL for Next.js image remote patterns
const s3EndpointHost = process.env.AWS_ENDPOINT_URL_S3
  ? new URL(process.env.AWS_ENDPOINT_URL_S3).hostname
  : 'br-billowing-wave-b3sejxq2.storage.c-4.ap-southeast-1.aws.neon.tech';

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: s3EndpointHost,
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
