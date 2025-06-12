
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  distDir: '.next', // Output to /workspace/.next
  output: 'standalone',   // Ensure standalone output
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  i18n: { // Kept this as it might be needed for middleware-manifest.json
    locales: ['en'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
