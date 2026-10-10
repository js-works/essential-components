// The lines of the package, by kind and by folder: `npm run loc` (src), `npm run loc:all` (also the demo).
// sloc counts each file; the kind comes from the file's name, as the CSS and the SVG icons live in TypeScript files
// (`styles.ts`, `taskbarStyles.ts`, `icons.ts`).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import sloc from 'sloc';

const ROOT = join(import.meta.dirname, '..');
const FOLDERS = process.argv.includes('--all') ? ['src', 'demo'] : ['src'];

// The first rule that matches a file gives its kind; files of no kind are not counted.
const KINDS = [
  { name: 'CSS (in TS)', matches: (file) => /styles\.ts$/i.test(file) },
  { name: 'SVG (in TS)', matches: (file) => /(^|\/)icons\.ts$/.test(file) },
  { name: 'TypeScript', matches: (file) => /\.tsx?$/.test(file) },
  { name: 'CSS', matches: (file) => file.endsWith('.css') },
];

// Folders with a note (e.g. a copy, not the package's own code).
const NOTES = { 'demo/ui': 'a copy of ui-theme' };

const COLUMNS = ['Files', 'Lines', 'Code', 'Comments', 'Blank'];
const BAR = 20;

const files = FOLDERS.flatMap((folder) =>
  readdirSync(join(ROOT, folder), { recursive: true })
    .map((path) => join(folder, path).replaceAll('\\', '/'))
    .flatMap((file) => {
      const kind = KINDS.find((candidate) => candidate.matches(file));

      if (kind === undefined) {
        return [];
      }

      const counts = sloc(readFileSync(join(ROOT, file), 'utf8'), extname(file).slice(1));

      return [{ file, kind: kind.name, folder: dirname(file), counts }];
    })
);

// The sums of the files in each group (in the order of `order`), and of all.
function rows(groupOf, order) {
  const sum = (group) => ({
    Files: group.length,
    Lines: group.reduce((total, { counts }) => total + counts.total, 0),
    Code: group.reduce((total, { counts }) => total + counts.source, 0),
    Comments: group.reduce((total, { counts }) => total + counts.comment, 0),
    Blank: group.reduce((total, { counts }) => total + counts.empty, 0),
  });
  const groups = order.map((name) => ({ name, ...sum(files.filter((file) => groupOf(file) === name)) }));

  return { groups: groups.filter((group) => group.Files > 0), total: { name: 'Total', ...sum(files) } };
}

// A table: a name, the counts, and the share of the code (a bar).
function print(title, { groups, total }) {
  const nameWidth = Math.max(title.length, ...groups.map((group) => label(group.name).length), 5) + 2;
  const widths = COLUMNS.map((column) => Math.max(column.length, String(total[column]).length) + 2);
  const line = (name, values, share) =>
    name.padEnd(nameWidth) + values.map((value, index) => String(value).padStart(widths[index])).join('') + share;
  const rule = '─'.repeat(nameWidth + widths.reduce((sum, width) => sum + width, 0) + BAR + 9);

  console.log(`\x1b[1m${line(title, COLUMNS, '   Share of the code')}\x1b[0m`);
  console.log(rule);

  for (const group of groups) {
    const share = group.Code / total.Code;
    const bar = '█'.repeat(Math.round(share * BAR)).padEnd(BAR, '·');

    console.log(line(label(group.name), COLUMNS.map((column) => group[column]), `   ${bar} ${percent(share)}`));
  }

  console.log(rule);
  console.log(`\x1b[1m${line('Total', COLUMNS.map((column) => total[column]), '')}\x1b[0m\n`);
}

function label(name) {
  return NOTES[name] === undefined ? name : `${name} (${NOTES[name]})`;
}

function percent(share) {
  return `${(share * 100).toFixed(1)}%`.padStart(6);
}

const folders = [...new Set(files.map((file) => file.folder))].sort();

console.log(`\n\x1b[1mapp-cockpit\x1b[0m: ${FOLDERS.join(', ')}\n`);
print('By kind', rows((file) => file.kind, KINDS.map((kind) => kind.name)));
print('By folder', rows((file) => file.folder, folders));
