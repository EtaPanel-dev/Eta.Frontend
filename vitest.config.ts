import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'tests/',
                '*.config.*',
                'coverage/',
                '.nuxt/',
                'dist/',
                'public/',
                '**/*.d.ts',
                'bun.lockb'
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        },
        // Bun specific optimizations
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                useAtomics: true
            }
        }
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, '.'),
            '@': resolve(__dirname, '.'),
        }
    },
    // Optimize for Bun
    esbuild: {
        target: 'node18'
    }
})