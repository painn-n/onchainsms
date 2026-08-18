// Optional content helper. Creates modules/content/runs/active/<date>-<slug>/

import fs from 'node:fs';
import path from 'node:path';
import { assertDate, fail, parseArgs, requireContentModule, slugify, today } from './lib.mjs';

const { flags, positional } = parseArgs(process.argv.slice(2));

if (flags.help || positional.length === 0) {
  console.log(`
usage: npm run new-post -- "topic slug words" [options]

options:
  --pillar <n>    default 1
  --route <name>  default ORIGINAL
  --format <name> default single
  --date <date>   YYYY-MM-DD, default today
  --vault <path>
  --help
`);
  process.exit(positional.length === 0 ? 1 : 0);
}

const content = requireContentModule(flags);
const date = flags.date ? assertDate(String(flags.date)) : today();
const slug = slugify(positional.join(' '));
const fullSlug = `${date}-${slug}`;

const templateDir = path.join(content, '_templates', 'run-folder');
if (!fs.existsSync(templateDir)) fail(`template folder missing at ${templateDir}\nrun: npm run setup`);

const runDir = path.join(content, 'runs', 'active', fullSlug);
if (fs.existsSync(runDir)) fail(`run folder already exists: ${runDir}`);

fs.cpSync(templateDir, runDir, { recursive: true });
fs.mkdirSync(path.join(runDir, '_assets'), { recursive: true });
fs.rmSync(path.join(runDir, '_assets', '.gitkeep'), { force: true });

const pillar = flags.pillar ? String(flags.pillar) : '1';
const route = flags.route ? String(flags.route) : 'ORIGINAL';
const format = flags.format ? String(flags.format) : 'single';

const objectPath = path.join(runDir, 'content-object.md');
const object = fs
  .readFileSync(objectPath, 'utf8')
  .replace('slug: YYYY-MM-DD-your-post-slug', `slug: ${fullSlug}`)
  .replace(/^route: .*$/m, `route: ${route}`)
  .replace(/^pillar: .*$/m, `pillar: ${pillar}`)
  .replace(/^format: .*$/m, `format: ${format}`)
  .replace('created: YYYY-MM-DD', `created: ${date}`);
fs.writeFileSync(objectPath, object);

console.log(`\ncreated modules/content/runs/active/${fullSlug}\n`);
