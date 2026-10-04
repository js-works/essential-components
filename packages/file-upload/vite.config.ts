import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html), `vite build` builds the library: the main entry (src/index.ts) and
// the React wrapper (src/react/index.ts, the subpath `@local/file-upload/react`). React stays outside the build.
const config = defineConfig({
  plugins: [react()],
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'esnext',
    lib: {
      entry: {
        index: 'src/index.ts',
        react: 'src/react/index.ts',
      },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.{browser,server}.test.{ts,tsx}'],
        },
      },
      // Server rendering: plain Node, without any DOM.
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.server.test.{ts,tsx}'],
        },
      },
      // Form association: jsdom lacks it, so these tests run in a real Chromium.
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

export default config;
