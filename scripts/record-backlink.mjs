import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('E:/Soft/misc/backlink-pipeline/node_modules/better-sqlite3');

const db = new Database('E:/Soft/misc/backlink-pipeline/apps/worker/data/backlink.db');

const insert = db.prepare(`
  INSERT OR IGNORE INTO targets (id, canonical_domain, channel, entry_url, title, language, idempotency_key, created_at)
  VALUES (@id, @canonical_domain, @channel, @entry_url, @title, @language, @idempotency_key, @created_at)
`);

const entries = [
  {
    canonical_domain: 'huggingface.co',
    channel: 'ecosystem_parasite',
    entry_url: 'https://huggingface.co/spaces/AbigailDavised/china-iit-expat-calculator',
    title: 'China IIT & Expat Tax Calculator (2026–2027) — Hugging Face Space',
    language: 'en',
  },
  {
    canonical_domain: 'github.io',
    channel: 'ecosystem_parasite',
    entry_url: 'https://abigaildavised.github.io/china-iit-engine/',
    title: 'China IIT & Expat Tax Calculator — GitHub Pages',
    language: 'en',
  },
  {
    canonical_domain: 'gist.github.com',
    channel: 'ecosystem_parasite',
    entry_url: 'https://gist.github.com/AbigailDavised/c638fa672582c97e498d3d49bb25936d',
    title: '2026–2027 China IIT 7-Bracket Schedule & 6-City Social Security Caps — Gist',
    language: 'en',
  },
  {
    canonical_domain: 'kaggle.com',
    channel: 'ecosystem_parasite',
    entry_url: 'https://www.kaggle.com/datasets/sotomo/china-iit-expat-tax-benchmark-2026-2027',
    title: 'China IIT & Expat Tax Benchmark (2026–2027) — Kaggle Dataset',
    language: 'en',
  },
  {
    canonical_domain: 'kaggle.com',
    channel: 'ecosystem_parasite',
    entry_url: 'https://www.kaggle.com/code/sotomo/china-iit-expat-tax-benchmark-eda-2026-2027',
    title: 'China IIT & Expat Tax Benchmark EDA (2026–2027) — Kaggle Notebook',
    language: 'en',
  },
  {
    canonical_domain: 'bsky.app',
    channel: 'ecosystem_parasite',
    entry_url: 'https://bsky.app/profile/abigail-davised.bsky.social/post/3n2dvqsn4g226',
    title: 'ChinaTaxCalc 2026–2027 IIT Engine & Benchmark Dataset — Bluesky',
    language: 'en',
  },
];

const now = Date.now();
for (const e of entries) {
  const idempotency_key = crypto.createHash('sha256').update(`${e.channel}:${e.entry_url}`).digest('hex').slice(0, 32);
  const res = insert.run({
    id: crypto.randomUUID(),
    ...e,
    idempotency_key,
    created_at: now,
  });
  console.log(`[backlink.db] ${e.entry_url} -> changes=${res.changes}`);
}
db.close();
