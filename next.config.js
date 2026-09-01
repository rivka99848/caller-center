/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // בסביבת DEV אנחנו לא רוצים שבנייה תיכשל על אזהרות lint/טיפוסים
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
