// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	app: {
		head: {
			meta: [
				{ name: 'theme-color', content: '#fffaf2' },
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
			],
		},
	},
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
	plugins: [
		'@/plugins/vue-notification.ts',
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
