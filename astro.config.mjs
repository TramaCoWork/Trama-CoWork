// @ts-check

import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: {
        clientPort: 4321,
      },
      warmup: {
        clientFiles: ['./src/pages/**/*.astro', './src/components/**/*.{tsx,astro}'],
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'marked'],
    },
  },
});
