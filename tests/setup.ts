import { vi } from 'vitest'

// Bun compatibility setup
if (typeof global === 'undefined') {
    // @ts-ignore
    globalThis.global = globalThis
}

// Mock Nuxt composables
global.useRuntimeConfig = vi.fn(() => ({
    public: {
        apiBaseUrl: 'http://localhost:8080'
    }
}))

global.useCookie = vi.fn(() => ({
    value: null
}))

global.navigateTo = vi.fn()

global.useNuxtApp = vi.fn(() => ({
    $toast: {
        add: vi.fn()
    }
}))

// Mock $fetch
global.$fetch = vi.fn()

// Mock useToast for notification tests
global.useToast = vi.fn(() => ({
    add: vi.fn()
}))

// Mock process.client for client-side checks
Object.defineProperty(global, 'process', {
    value: {
        client: true,
        server: false,
        env: {
            NODE_ENV: 'test'
        }
    },
    writable: true
})

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
}

// Mock btoa/atob for JWT token parsing
global.btoa = global.btoa || ((str: string) => Buffer.from(str).toString('base64'))
global.atob = global.atob || ((str: string) => Buffer.from(str, 'base64').toString())