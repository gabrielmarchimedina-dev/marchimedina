/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: true,
	},
	serverExternalPackages: ["node-pg-migrate"],
};

module.exports = nextConfig;
