
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
  // Adding a minimal i18n configuration
  // This can sometimes help ensure all expected manifest files are generated
  // if the build/pack process expects them.
  i18n: {
    locales: ['en'], // Define at least one locale
    defaultLocale: 'en',
  },
};

export default nextConfig;
