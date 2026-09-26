import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The demo page of all packages. The demos come from the workspace packages, by relative imports
// (`../packages/file-upload/demo/…`). All of them use one React: `dedupe` makes sure of it even where a package has a
// React of its own (e.g. a pinned version in its node_modules).
//
// `vite build --mode pages` builds for GitHub Pages (js-works.github.io/essential-components), which serves the site
// under a subpath.
const config = defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/essential-components/' : '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
}));

export default config;
