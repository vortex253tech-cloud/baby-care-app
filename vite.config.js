import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false, // We manage manifest.json manually in /public
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [],
                // Import push event handlers into the generated SW
                importScripts: ['/sw-push.js'],
            },
            devOptions: {
                enabled: true, // Enable SW in dev to allow push permission testing
                type: 'module',
            },
            injectRegister: 'auto',
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
    },
});
