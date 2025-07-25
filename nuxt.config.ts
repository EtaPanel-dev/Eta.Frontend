// nuxt.config.ts
export default defineNuxtConfig({
    devtools: { enabled: true },
    compatibilityDate: '2025-07-24',
    devServer: {
        host: '0.0.0.0'
    },
    modules: [
        '@primevue/nuxt-module',
        '@pinia/nuxt'
    ],
    primevue: {
        options: {
            theme: {
                preset: 'Aura',
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false
                }
            }
        },
        autoImport: true,
    },
    css: [
        'primeicons/primeicons.css',
        '~/assets/css/main.css'
    ],
    runtimeConfig: {
        public: {
            apiBaseUrl: 'http://lxhtt-mac-mini:8080'
        }
    },
    nitro: {
        compressPublicAssets: true
    }
})