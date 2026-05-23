// @ts-check

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
