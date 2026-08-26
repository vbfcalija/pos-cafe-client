// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	css: [
		'~/assets/css/main.css',
	],
	devtools: { enabled: true },
	modules: [
		'@nuxt/icon',
		'@nuxtjs/tailwindcss',
		'@pinia/nuxt',
		'pinia-plugin-persistedstate/nuxt',
	],
	runtimeConfig: {
		public: {
			appName: process.env.APP_NAME,
			appVersion: process.env.APP_VERSION,
			apiBaseURL: process.env.API_BASE_URL,
			appBaseURL: process.env.APP_BASE_URL,
		},
	},
	ssr: false,
})