import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/toolbox/',
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '在线工具箱',
        short_name: 'ToolKit',
        description: '无需安装，离线可用的在线工具集合',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        start_url: '/toolbox/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
