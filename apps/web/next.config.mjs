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
  async redirects() {
    const archived = [
      "formation", "architecture", "development", "tech", "accounting", "payroll", "hr", "legal", "operations",
      "software", "marketing", "branding", "sales", "consulting", "investment", "education", "venture", "coachgrowth",
    ];
    return [
      // Pillar URLs renamed with the real-business restructure
      { source: "/build", destination: "/property", permanent: true },
      { source: "/run", destination: "/apps", permanent: true },
      { source: "/grow", destination: "/it", permanent: true },
      { source: "/insights", destination: "/", permanent: true },
      // Renamed tenants
      { source: "/sites/realestate/:path*", destination: "/sites/mazidihomes/:path*", permanent: true },
      { source: "/sites/gymapp/:path*", destination: "/sites/musclemap/:path*", permanent: true },
      { source: "/sites/coachapp/:path*", destination: "/sites/fitnessmusclecoach/:path*", permanent: true },
      // Placeholder tenants that no longer exist
      ...archived.map((slug) => ({ source: `/sites/${slug}/:path*`, destination: "/companies", permanent: false })),
    ];
  },
};
export default nextConfig;
