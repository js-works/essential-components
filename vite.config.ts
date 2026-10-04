import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The demo page of all packages. The demos come from the workspace packages, by relative imports
// (`../packages/file-upload/demo/…`). All of them use one React: `dedupe` makes sure of it even where a package has a
// React of its own (e.g. a pinned version in its node_modules).
//
// `vite build --mode pages` builds for GitHub Pages (js-works.github.io/essential-components), which serves the site
// under a subpath.
//
// Only the latest Chrome, Edge, Firefox and Safari are supported: `esnext` (also for the CSS, `cssTarget` follows
// `target`), so modern CSS stays as it is. Else the minifier lowers `light-dark()` into variables that follow the
// page's color scheme, not the `color-scheme` of the element (the cockpit's dark sidebar got light colors).
const config = defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/essential-components/' : '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'esnext',
  },
}));

export default config;
