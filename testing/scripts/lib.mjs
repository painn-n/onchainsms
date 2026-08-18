import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const body = arg.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      flags[body.slice(0, eq)] = body.slice(eq + 1);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      flags[body] = argv[++i];
    } else {
      flags[body] = true;
    }
  }
  return { flags, positional };
}

export function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return path.resolve(p);
}

export function resolveVault(flags = {}) {
  const raw =
    (typeof flags.vault === 'string' && flags.vault) ||
    process.env.BRAIN_VAULT ||
    process.env.CONTENT_VAULT ||
    path.join(os.homedir(), 'Documents', 'Brain');
  return expandHome(raw);
}

export function requireVault(flags = {}) {
  const vault = resolveVault(flags);
  if (!fs.existsSync(vault)) {
    fail(`vault not found at ${vault}\nrun: npm run setup`);
  }
  return vault;
}

// Optional X/content playbook lives under modules/content/
export function requireContentModule(flags = {}) {
  const vault = requireVault(flags);
  const content = path.join(vault, 'modules', 'content');
  if (!fs.existsSync(content)) {
    fail(`content module missing at ${content}\nrun: npm run setup`);
  }
  return content;
}

export function slugify(input) {
  const slug = String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  if (!slug) fail(`cannot build a slug from "${input}"`);
  return slug;
}

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function assertDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`date must look like YYYY-MM-DD, got "${value}"`);
  return value;
}

export function toNumber(value, label) {
  const cleaned = String(value).replace(/[,_\s]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) fail(`${label} must be a positive number, got "${value}"`);
  return n;
}

// Copies a directory tree without overwriting anything the user has edited.
// .gitkeep files are placeholders for git only, so they never land in the vault.
export function copyTree(src, dest, { force = false, created = [], skipped = [] } = {}) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyTree(from, to, { force, created, skipped });
    } else if (entry.name !== '.gitkeep') {
      if (fs.existsSync(to) && !force) {
        skipped.push(to);
      } else {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(from, to);
        created.push(to);
      }
    }
  }
  return { created, skipped };
}

export function fail(message) {
  console.error(`\nerror: ${message}\n`);
  process.exit(1);
}
