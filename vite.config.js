import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => ({
  server: {
    open: true,
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    eslint(),
    viteTsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'Bubble Map',
        name: 'Bubble Map',
        description: 'Free, AI-Assisted Mind Mapping',
        icons: [
          {
            src: './assets/logos/Bubble Map Logo.svg',
            type: 'image/svg+xml',
            sizes: '1000x1000',
          },
          {
            src: './assets/logos/Bubble Map Logo.png',
            type: 'image/png',
            sizes: '1000x1000',
          },
          {
            src: './assets/logos/Simple Bubble Map Logo.svg',
            type: 'image/svg+xml',
            sizes: '1000x1000',
          },
        ],
        start_url: '.',
        display: 'minimal-ui',
        theme_color: '#7F95D1',
        background_color: '#ffffff',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
}));
