// nuxt.config.ts
export default defineNuxtConfig({
    devtools: { enabled: true },
    compatibilityDate: '2025-07-24',
    modules: [
        '@primevue/nuxt-module'
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
    nitro: {
        compressPublicAssets: true
    }
})