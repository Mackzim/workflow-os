import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// PWA is configured but intentionally silent in dev so `npm run dev` stays clean.
// The service worker only activates in production builds (`npm run build && npm run preview`).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.svg'],
      devOptions: { enabled: false },
      manifest: {
        name: 'Workflow OS',
        short_name: 'WorkflowOS',
        description: 'Personal workflow operating system – tasks, dashboards and a Claude command center.',
        theme_color: '#0a0b0e',
        background_color: '#0a0b0e',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
