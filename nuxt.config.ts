// nuxt.config.ts
export default defineNuxtConfig({
    devtools: { enabled: true },
    compatibilityDate: '2025-07-24',
    devServer: {
        host: '0.0.0.0'
    },
    modules: [
        '@primevue/nuxt-module',
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt'
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
            },
            unstyled: false
        },
        autoImport: true,
        components: {
            include: ['Toast', 'Button', 'InputText', 'Card', 'DataTable', 'Column', 'Dialog', 'Dropdown', 'Checkbox', 'Textarea', 'Calendar', 'InputNumber', 'ProgressSpinner', 'Tag']
        }
    },
    css: [
        'primeicons/primeicons.css',
        '~/assets/css/main.css'
    ],
    build: {
        transpile: ['primevue']
    },
    app: {
        head: {
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }
            ]
        }
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: 'http://lxhtt-mac-mini:8080'
        }
    },
    nitro: {
        compressPublicAssets: true
    }
})