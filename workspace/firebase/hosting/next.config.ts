
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  distDir: '.next', // Output to /firebase/hosting/.next
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
  // Removing i18n as middleware manifest issue is resolved
  // and it might be affecting other manifest generations or path expectations.
  // i18n: {
  //   locales: ['en'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
