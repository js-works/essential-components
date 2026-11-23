import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html), `vite build` builds the library: the main entry (src/main/index.ts) and
// the React wrapper (src/main/react/index.ts, the subpath `@local/file-upload/react`) and the themes
// (src/main/themes/index.ts, `@local/file-upload/themes`). React stays outside the build.
const config = defineConfig({
  plugins: [react()],
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'es2024',
    cssTarget: 'esnext',
    lib: {
      entry: {
        index: 'src/main/index.ts',
        react: 'src/main/react/index.ts',
        themes: 'src/main/themes/index.ts',
      },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: '.generated/coverage',
      include: ['src/main/**/*.{ts,tsx}'],
      exclude: ['src/main/**/index.ts'],
      reporter: ['text', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/test/**/*.test.{ts,tsx}'],
          exclude: ['src/test/**/*.{browser,server}.test.{ts,tsx}'],
        },
      },
      // Server rendering: plain Node, without any DOM.
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/test/**/*.server.test.{ts,tsx}'],
        },
      },
      // Form association: jsdom lacks it, so these tests run in a real Chromium.
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/test/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            screenshotDirectory: '.generated/screenshots',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

export default config;
