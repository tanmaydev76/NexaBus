/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nexabus/db'],
  experimental: {
    // Tells Next.js/Vercel's bundler (nft) to include these in the serverless output
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Also add as raw externals to prevent webpack hitting mongodb@7's broken
      // exports field ("default" condition not last) during local dev/build
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'mongoose',
        'mongodb',
      ];
    }
    return config;
  },
};

export default nextConfig;
