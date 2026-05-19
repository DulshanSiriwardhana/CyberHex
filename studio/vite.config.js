import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'CyberHex Studio',
                short_name: 'CH Studio',
                description: 'AI-Powered Neural Communication & Rendering Platform',
                theme_color: '#0a0a1a',
                background_color: '#0a0a1a',
                display: 'standalone',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.tensorflow\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tf-models',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                ],
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@studio': path.resolve(__dirname, './src'),
            '@engine': path.resolve(__dirname, './src/engine'),
            '@pipeline': path.resolve(__dirname, './src/engine/pipeline'),
            '@ai': path.resolve(__dirname, './src/ai'),
            '@media': path.resolve(__dirname, './src/media'),
            '@ui': path.resolve(__dirname, './src/components/ui'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
            '@services': path.resolve(__dirname, './src/services'),
            '@workers': path.resolve(__dirname, './src/workers'),
            '@plugins': path.resolve(__dirname, './src/plugins'),
        },
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'ai-vendor': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgpu', '@tensorflow/tfjs-backend-webgl'],
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-context-menu'],
                    'motion': ['framer-motion'],
                    'dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
                },
            },
        },
        chunkSizeWarningLimit: 1500,
    },
    worker: {
        format: 'es',
    },
    optimizeDeps: {
        exclude: ['@tensorflow/tfjs-backend-wasm'],
        esbuildOptions: {
            target: 'esnext',
        },
    },
    server: {
        port: 5174,
        host: true,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
});
