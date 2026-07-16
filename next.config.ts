
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  distDir: '.next', // Output to /workspace/firebase/hosting/.next
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
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
