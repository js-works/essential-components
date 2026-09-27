import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// `npm run dev`: the dev page (index.html) at http://localhost:5173, which forwards `/xwiki` to the local XWiki, so the
// element works with its real REST API and the real login (log in once at http://localhost:5173/xwiki/bin/login).
// `npm run build`: one ES module, everything bundled into a single file (one attachment in XWiki), into target/js.
//
// The data navigator, the file upload and the overlays come from the sources of this monorepo (relative imports, their
// dependencies from its node_modules). The data navigator is written for React: like its custom element build, the
// bundle gets Preact's compatibility layer instead (much smaller).
const XWIKI = 'http://localhost:8080';
const REPOSITORY = fileURLToPath(new URL('../..', import.meta.url));

const PREACT_ALIASES = [
  { find: /^react$/, replacement: 'preact/compat' },
  { find: /^react-dom$/, replacement: 'preact/compat' },
  { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
  { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
  { find: /^react\/jsx-dev-runtime$/, replacement: 'preact/jsx-dev-runtime' },
];

const config = defineConfig(({ command }) => ({
  // Preact and Base UI read the mode from `process.env.NODE_ENV`, which a browser does not have.
  define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
  resolve: {
    alias: PREACT_ALIASES,
    // One Lit, also for the overlays package (which has its own in the monorepo).
    dedupe: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
  },
  server: {
    proxy: { '/xwiki': { target: XWIKI, changeOrigin: false } },
    // The sources of the packages are outside this project.
    fs: { allow: [REPOSITORY] },
  },
  build: {
    outDir: 'target/js',
    emptyOutDir: true,
    license: { fileName: 'third-party-licenses.md' },
    lib: {
      entry: 'src/main/ts/main.ts',
      formats: ['es'],
      fileName: 'xwiki-attachment-manager',
    },
    rolldownOptions: {
      // One file: dynamic imports (e.g. the date picker) are inlined, no chunks. Fully minified: a library build keeps
      // its whitespace (for the bundlers of apps), but this file goes to the browser as it is.
      output: { codeSplitting: false, minify: true },
    },
  },
}));

export default config;
