/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mazidi/ui", "@mazidi/config", "@mazidi/api", "@mazidi/db"],
  experimental: { serverActions: { allowedOrigins: ["*.mazidigroup.com", "localhost:3000"] } },
};
export default nextConfig;
