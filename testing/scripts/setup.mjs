// Creates ~/Documents/Brain from vault-template/,
// installs ~/.hermes/config.yaml, and syncs skills into ~/.hermes/skills/.
// Safe to re-run. Never overwrites edited files unless --force.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { copyTree, fail, parseArgs, repoRoot, resolveVault } from './lib.mjs';

const { flags } = parseArgs(process.argv.slice(2));

if (flags.help) {
  console.log(`
usage: npm run setup [-- options]

options:
  --vault <path>   vault location (default ~/Documents/Brain)
  --force          overwrite existing vault and config files
  --no-skills      skip installing skills into ~/.hermes/skills
  --help
`);
  process.exit(0);
}

const force = flags.force === true;
const vault = resolveVault(flags);
const hermesHome = path.join(os.homedir(), '.hermes');

const majorNode = Number(process.versions.node.split('.')[0]);
if (majorNode < 18) fail(`node 18 or higher is required, you have ${process.versions.node}`);

const VAULT_DIRS = [
  'inbox',
  'notes',
  'projects',
  'daily',
  'outputs/briefs',
  'outputs/reviews',
  'outputs/notes',
  'archive',
  'modules/content/_templates/run-folder',
  'modules/content/stores/feedback',
  'modules/content/voice',
  'modules/content/runs/active',
  'modules/content/runs/archive',
  'modules/content/workflows',
];

console.log(`\nvault: ${vault}`);

for (const dir of VAULT_DIRS) {
  fs.mkdirSync(path.join(vault, dir), { recursive: true });
}
console.log(`  created ${VAULT_DIRS.length} folders`);

const { created, skipped } = copyTree(path.join(repoRoot, 'vault-template'), vault, { force });
console.log(`  seeded ${created.length} files, left ${skipped.length} existing files alone`);

fs.mkdirSync(hermesHome, { recursive: true });
const configTarget = path.join(hermesHome, 'config.yaml');
if (fs.existsSync(configTarget) && !force) {
  console.log(`\nconfig: ${configTarget} already exists, left alone`);
} else {
  fs.copyFileSync(path.join(repoRoot, 'config', 'config.yaml'), configTarget);
  console.log(`\nconfig: wrote ${configTarget}`);
}

if (flags['no-skills']) {
  console.log('skills: skipped');
} else {
  const skillsSrc = path.join(repoRoot, 'skills');
  const skillsDest = path.join(hermesHome, 'skills');
  const names = fs
    .readdirSync(skillsSrc, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  for (const name of names) {
    const dest = path.join(skillsDest, name);
    fs.mkdirSync(dest, { recursive: true });
    copyTree(path.join(skillsSrc, name), dest, { force: true });
  }
  console.log(`skills: synced ${names.join(', ')} into ${skillsDest}`);
}

console.log('\nchecks');

let hermesVersion = null;
try {
  hermesVersion = execFileSync('hermes', ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: process.platform === 'win32',
  }).trim();
} catch {
  hermesVersion = null;
}
console.log(
  hermesVersion
    ? `  ok    hermes ${hermesVersion}`
    : '  todo  npm install -g hermes-agent'
);

console.log(
  process.env.OPENROUTER_API_KEY
    ? '  ok    OPENROUTER_API_KEY is set'
    : '  todo  export OPENROUTER_API_KEY=sk-or-...'
);

console.log(
  fs.existsSync(path.join(vault, '.obsidian'))
    ? '  ok    vault opened in Obsidian'
    : '  todo  Obsidian → Open folder as vault → pick the folder above'
);

console.log(`
next

  1. edit SYSTEM.md in the vault
  2. open Obsidian on that folder
  3. run:  hermes
  4. try:  use the daily-brief skill
`);
