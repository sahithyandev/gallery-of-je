module.exports = {
	images: {
		domains: ["erwfxmftkzktexefxtdy.supabase.in", "gallery-of-je.imgix.net"],
	},
	staticPageGenerationTimeout: 7000,
	webpack: (config, { dev, isServer }) => {
		// Replace React with Preact only in client production build
		if (!dev && !isServer) {
			Object.assign(config.resolve.alias, {
				react: "preact/compat",
				"react-dom/test-utils": "preact/test-utils",
				"react-dom": "preact/compat",
			});
		}

		return config;
	},
};
