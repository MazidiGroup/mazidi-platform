/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma engine (.so.node) lives in packages/db/generated/client — force it
  // into every serverless function bundle in case static tracing misses it.
  outputFileTracingIncludes: {
    "/**": ["../../packages/db/generated/client/*.node", "../../packages/db/generated/client/schema.prisma"],
  },
  transpilePackages: ["@mazidi/ui", "@mazidi/config", "@mazidi/api", "@mazidi/db"],
  experimental: { serverActions: { allowedOrigins: ["*.mazidigroup.com", "localhost:3000"] } },
};
export default nextConfig;
