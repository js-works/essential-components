import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html). `vite build` builds the library in two steps:
// - the React entry (src/react/index.ts, `@local/data-navigator/react`) and the themes (src/themes/index.ts,
//   `@local/data-navigator/themes`), with React and Base UI outside the build (the app's);
// - `--mode element`: the custom element (src/index.ts, `@local/data-navigator`), with everything bundled in (React
//   too), so an app needs nothing else.
// `vite build --mode demo` builds the demo page for GitHub Pages (js-works.github.io/data-navigator), into demo-dist/.
const config = defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'demo' ? '/data-navigator/' : '/',
  // React reads the mode from `process.env.NODE_ENV`, which a browser does not have: fixed at build time where React is
  // bundled.
  define: mode === 'element' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
  build: mode === 'demo'
    ? { outDir: 'demo-dist', emptyOutDir: true }
    : mode === 'element'
    ? {
      // After the first step, into the same directory.
      emptyOutDir: false,
      // The licenses of everything bundled in (React, Base UI, vanillajs-datepicker, ...).
      license: { fileName: 'third-party-licenses.md' },
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: 'index',
      },
    }
    : {
      // The licenses of what is bundled into the React entry (vanillajs-datepicker).
      license: { fileName: 'third-party-licenses-react.md' },
      lib: {
        entry: {
          react: 'src/react/index.ts',
          themes: 'src/themes/index.ts',
        },
        formats: ['es'],
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
