import prismaPluginPkg from "@prisma/nextjs-monorepo-workaround-plugin";
const { PrismaPlugin } = prismaPluginPkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Official Prisma fix for "could not locate the Query Engine" in pnpm
  // monorepos: webpack bundles the client (transpilePackages) which rewrites
  // __dirname; this plugin copies the engine beside the bundled output.
  webpack: (config, { isServer }) => {
    if (isServer) config.plugins.push(new PrismaPlugin());
    return config;
  },
  transpilePackages: ["@mazidi/ui", "@mazidi/config", "@mazidi/api", "@mazidi/db"],
  experimental: { serverActions: { allowedOrigins: ["*.mazidigroup.com", "localhost:3000"] } },
};
export default nextConfig;
