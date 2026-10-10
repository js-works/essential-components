// Lines of code per area of the project, and per language. Run it with `npm run loc`.
import { globSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import sloc from 'sloc';

const patterns = [
  'src/**/*.{ts,tsx,css}',
  'demo/**/*.{ts,tsx,css}',
  'scripts/*.mjs',
  '*.ts',
  'index.html',
];

// Every file lands in exactly one area, the first one that matches. The order is the interesting story of this
// project: one generic component, against what a theme for one UI library costs.
const publicApi = [
  'src/api.ts',
  'src/index.ts',
  'src/react/api.ts',
  'src/react/index.ts',
  'src/react/createDataTableComponent.tsx',
  'src/themes/index.ts',
];

const areas = [
  { label: 'Tests', match: (path) => path.includes('.test.') },
  { label: 'Public API', match: (path) => publicApi.includes(path) },
  { label: 'Component', match: (path) => path.startsWith('src/core/') || path.startsWith('src/element/') },
  { label: 'Themes', match: (path) => path.startsWith('src/themes/') },
  { label: 'Demo', match: (path) => path.startsWith('demo/') },
  { label: 'Build & setup', match: () => true },
];

const order = ['Public API', 'Component', 'Themes', 'Demo', 'Tests', 'Build & setup'];

function emptyRow() {
  return { files: 0, source: 0, comment: 0, empty: 0, total: 0 };
}

function add(row, stats) {
  row.files += 1;
  row.source += stats.source;
  row.comment += stats.comment;
  row.empty += stats.empty;
  row.total += stats.total;
}

function table(title, rows) {
  const columns = ['files', 'source', 'comment', 'blank', 'total'];
  const body = rows.map(([label, row]) => [
    label,
    String(row.files),
    String(row.source),
    String(row.comment),
    String(row.empty),
    String(row.total),
  ]);
  const head = ['', ...columns];
  const width = head.map((_, index) => Math.max(...[head, ...body].map((line) => line[index].length)));
  const line = (cells, pad = ' ') =>
    cells
      .map((cell, index) => (index === 0 ? cell.padEnd(width[index], pad) : cell.padStart(width[index], pad)))
      .join('  ');

  console.log(`\n${title}\n`);
  console.log(line(head));
  console.log(line(width.map(() => ''), '\u2500'));

  for (const cells of body.slice(0, -1)) {
    console.log(line(cells));
  }

  console.log(line(width.map(() => ''), '\u2500'));
  console.log(line(body[body.length - 1]));
}

const byArea = new Map(order.map((label) => [label, emptyRow()]));
const byLanguage = new Map();
const files = [...new Set(patterns.flatMap((pattern) => globSync(pattern)))].sort();

for (const file of files) {
  const path = file.split('\\').join('/');
  const extension = extname(path).slice(1);

  if (!sloc.extensions.includes(extension)) {
    continue;
  }

  const stats = sloc(readFileSync(path, 'utf8'), extension);
  const area = areas.find(({ match }) => match(path)).label;

  add(byArea.get(area), stats);

  if (!byLanguage.has(extension)) {
    byLanguage.set(extension, emptyRow());
  }

  add(byLanguage.get(extension), stats);
}

const total = emptyRow();

for (const row of byArea.values()) {
  total.files += row.files;
  total.source += row.source;
  total.comment += row.comment;
  total.empty += row.empty;
  total.total += row.total;
}

table('Lines of code by area', [
  ...[...byArea].filter(([, row]) => row.files > 0),
  ['TOTAL', total],
]);

table('Lines of code by language', [
  ...[...byLanguage].sort((a, b) => b[1].total - a[1].total).map(([name, row]) => [`.${name}`, row]),
  ['TOTAL', total],
]);

// The point of the themes: what a new UI library actually costs.
const component = ['Public API', 'Component'].reduce((sum, label) => sum + byArea.get(label).source, 0);
const themes = byArea.get('Themes');
const average = themes.files === 0 ? 0 : Math.round(themes.source / themes.files);

console.log(`\nThe component: ${component} source lines`);
console.log(`One theme costs on average: ${average} source lines\n`);
