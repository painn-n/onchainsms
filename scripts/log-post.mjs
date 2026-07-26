// Optional content helper. Updates modules/content/stores/feedback/post-log.md

import fs from 'node:fs';
import path from 'node:path';
import { assertDate, fail, parseArgs, requireContentModule, toNumber, today } from './lib.mjs';

const { flags, positional } = parseArgs(process.argv.slice(2));

if (flags.help || positional.length === 0) {
  console.log(`
usage: npm run log -- <slug> [--views N] [--likes N] [--bookmarks N] [--notes "..."]

options:
  --date <date>   YYYY-MM-DD for new rows
  --vault <path>
  --help
`);
  process.exit(positional.length === 0 ? 1 : 0);
}

const content = requireContentModule(flags);
const slug = positional[0];
const logPath = path.join(content, 'stores', 'feedback', 'post-log.md');
if (!fs.existsSync(logPath)) fail(`post log missing at ${logPath}\nrun: npm run setup`);

const COLUMNS = 7;
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
const separator = lines.findIndex((l) => /^\|[\s\-:|]+\|\s*$/.test(l));
if (separator === -1) fail(`could not find the table header in ${logPath}`);

const readCells = (line) => line.split('|').slice(1, -1).map((c) => c.trim());
const num = (cell) => {
  if (!cell) return null;
  const n = Number(cell.replace(/[,_\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const show = (value) => (value === null ? '' : value.toLocaleString('en-US'));

let rowIndex = -1;
for (let i = separator + 1; i < lines.length; i++) {
  if (!lines[i].trim().startsWith('|')) continue;
  const cells = readCells(lines[i]);
  if (cells[1] === slug) {
    rowIndex = i;
    break;
  }
}

const existing = rowIndex === -1 ? Array(COLUMNS).fill('') : readCells(lines[rowIndex]);
while (existing.length < COLUMNS) existing.push('');

const date = flags.date ? assertDate(String(flags.date)) : existing[0] || today();
const views = flags.views !== undefined ? toNumber(flags.views, 'views') : num(existing[2]);
const likes = flags.likes !== undefined ? toNumber(flags.likes, 'likes') : num(existing[3]);
const bookmarks =
  flags.bookmarks !== undefined ? toNumber(flags.bookmarks, 'bookmarks') : num(existing[4]);
const notes = flags.notes !== undefined ? String(flags.notes) : existing[6];

let ratio = '';
if (bookmarks !== null && likes !== null) {
  ratio = likes === 0 ? 'n/a' : (bookmarks / likes).toFixed(2);
}

const row = `| ${date} | ${slug} | ${show(views)} | ${show(likes)} | ${show(bookmarks)} | ${ratio} | ${notes} |`;

if (rowIndex === -1) {
  let insertAt = separator + 1;
  while (insertAt < lines.length && lines[insertAt].trim().startsWith('|')) insertAt++;
  lines.splice(insertAt, 0, row);
} else {
  lines[rowIndex] = row;
}

fs.writeFileSync(logPath, lines.join('\n'));
console.log(`\n${rowIndex === -1 ? 'added' : 'updated'}\n\n${row}\n`);
