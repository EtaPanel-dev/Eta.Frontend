// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    compatibilityDate: '2025-07-24',
    modules: ['@primevue/nuxt-module'],
    primevue: {
        options: {
            theme: {
                preset: 'Aura'
            }
        }
    },
    css: [
        'primeicons/primeicons.css',
        '~/assets/css/main.css'
    ],
    // 添加SSR配置以减少水合问题
    ssr: true,
    nitro: {
        compressPublicAssets: true
    }
})