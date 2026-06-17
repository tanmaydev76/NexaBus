/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nexabus/db'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // mongoose@9 depends on mongodb@7 which has a broken "default" condition in its exports
      // field — webpack refuses to bundle it. Marking them as externals forces Node.js to
      // require() them at runtime (where the exports issue doesn't apply).
      config.externals = [...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)), 'mongoose', 'mongodb'];
    }
    return config;
  },
};

export default nextConfig;
