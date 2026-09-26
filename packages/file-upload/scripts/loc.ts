// Lines of code per part of the project (`npm run loc`). With `--files`, one row per file (`npm run loc:files`).
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import sloc from 'sloc';

type Row = { name: string; files: number; source: number; comment: number; total: number };

const isTest = (path: string) => /\.test\.tsx?$/.test(path);

// The parts, in order. Every file belongs to the first part that matches it.
const PARTS = [
  { name: 'tests', matches: isTest },
  { name: 'api', matches: (path: string) => path === 'src/api.ts' || path === 'src/index.ts' },
  { name: 'core (plain TS)', matches: (path: string) => path.startsWith('src/core/') },
  { name: 'element (UI)', matches: (path: string) => path.startsWith('src/element/') },
  { name: 'react', matches: (path: string) => path.startsWith('src/react/') },
  { name: 'demo', matches: (path: string) => path.startsWith('demo/') },
] as const;

const LIBRARY = ['api', 'core (plain TS)', 'element (UI)', 'react'];

const files = ['src', 'demo']
  .flatMap((dir) => readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((path) => join(dir, path)))
  .filter((path) => sloc.extensions.includes(extname(path).slice(1)))
  .sort();

const stats = files.map((path) => ({ path, ...sloc(readFileSync(path, 'utf8'), extname(path).slice(1)) }));

const sum = (name: string, items: typeof stats): Row => ({
  name,
  files: items.length,
  source: items.reduce((total, item) => total + item.source, 0),
  comment: items.reduce((total, item) => total + item.comment, 0),
  total: items.reduce((total, item) => total + item.total, 0),
});

const partOf = (path: string) => PARTS.find((part) => part.matches(path))?.name ?? 'other';

const rows = process.argv.includes('--files')
  ? [...stats.map((item) => sum(item.path, [item])), sum('all', stats)]
  : [
    ...PARTS.map((part) => sum(part.name, stats.filter((item) => partOf(item.path) === part.name))),
    sum('other', stats.filter((item) => partOf(item.path) === 'other')),
    sum('library (without tests)', stats.filter((item) => LIBRARY.includes(partOf(item.path)))),
    sum('all', stats),
  ].filter((row) => row.files > 0);

console.table(
  Object.fromEntries(
    rows.map((row) => [row.name, { files: row.files, source: row.source, comment: row.comment, total: row.total }]),
  ),
);
