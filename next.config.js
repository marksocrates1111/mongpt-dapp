/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // This fallback is still necessary for some Web3 libraries.
    config.resolve.fallback = { fs: false, net: false, tls: false };

    // This rule helps webpack correctly handle modern JavaScript module files
    // that are sometimes used by dependencies. This directly addresses the
    // 'import'/'export' syntax error.
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

module.exports = nextConfig;
