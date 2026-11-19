
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["10.60.72.190"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
