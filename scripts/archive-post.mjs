// Optional content helper. Moves a run from active to archive.

import fs from 'node:fs';
import path from 'node:path';
import { fail, parseArgs, requireContentModule } from './lib.mjs';

const { flags, positional } = parseArgs(process.argv.slice(2));

if (flags.help || positional.length === 0) {
  console.log(`
usage: npm run archive -- <run-folder-name>
options: --vault <path>  --help
`);
  process.exit(positional.length === 0 ? 1 : 0);
}

const content = requireContentModule(flags);
const name = path.basename(positional[0]);
const from = path.join(content, 'runs', 'active', name);
const to = path.join(content, 'runs', 'archive', name);

if (!fs.existsSync(from)) {
  const activeDir = path.join(content, 'runs', 'active');
  const active = fs.existsSync(activeDir)
    ? fs.readdirSync(activeDir).filter((n) => !n.startsWith('.'))
    : [];
  fail(
    `no active run called "${name}"\n` +
      (active.length ? `active runs:\n  ${active.join('\n  ')}` : 'there are no active runs')
  );
}
if (fs.existsSync(to)) fail(`already archived: ${to}`);

fs.mkdirSync(path.dirname(to), { recursive: true });
try {
  fs.renameSync(from, to);
} catch (err) {
  if (err.code !== 'EXDEV') throw err;
  fs.cpSync(from, to, { recursive: true });
  fs.rmSync(from, { recursive: true, force: true });
}

console.log(`\narchived ${name}\n`);
