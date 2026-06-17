/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nexabus/db'],
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
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
