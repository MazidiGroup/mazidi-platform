/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mazidi/ui", "@mazidi/config", "@mazidi/api", "@mazidi/db", "@mazidi/auth"],
};
export default nextConfig;
