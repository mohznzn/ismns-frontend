// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // /admin/myqcms  -> /admin/qcm
      { source: "/admin/myqcms", destination: "/admin/qcm", permanent: true },
      // et tout sous-chemin éventuel
      { source: "/admin/myqcms/:path*", destination: "/admin/qcm/:path*", permanent: true },
    ];
  },
};

export default nextConfig;

