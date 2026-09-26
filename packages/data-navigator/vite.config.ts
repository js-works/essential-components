import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html). `vite build` builds the library (src/index.ts). `vite build --mode demo` builds
// the demo page for GitHub Pages (js-works.github.io/data-navigator), into demo-dist/.
const config = defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'demo' ? '/data-navigator/' : '/',
  build: mode === 'demo'
    ? { outDir: 'demo-dist', emptyOutDir: true }
    : {
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: 'data-navigator',
      },
      rollupOptions: {
        external: [
          /^@base-ui\//,
          'react',
          'react-dom',
          'react/jsx-runtime',
        ],
      },
    },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: { include: [/\.module\.css$/, /\.css\?raw$/], modules: { classNameStrategy: 'non-scoped' } },
  },
}));

export default config;
