
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Removed typescript ignoreBuildErrors for production readiness
  // Removed eslint ignoreDuringBuilds for production readiness
  images: {
    // Keep image optimization enabled (default is true, but explicit is fine)
    unoptimized: false, // Ensure optimization is generally ON
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Add Firebase Storage domain
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**', // Allow images from any bucket
      },
       { // Add placeholder domain
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
       { // Added Unsplash for hero background
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
