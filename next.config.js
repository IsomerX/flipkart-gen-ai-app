/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ["links.papareact.com"],
    },
    experimental: {
        appDir: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
