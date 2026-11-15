import fs from 'node:fs';

const hfToken = fs.readFileSync('E:/Soft/key/huggingface_token.txt', 'utf8').trim();
const repoId = 'AbigailDavised/china-iit-expat-calculator';

// 1. Create Static Space
const createRes = await fetch('https://huggingface.co/api/repos/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${hfToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'space',
    name: 'china-iit-expat-calculator',
    sdk: 'static',
    private: false,
  }),
});
const createText = await createRes.text();
console.log('[HF] Create Space:', createRes.status, createText);

// 2. Atomic commit README.md and index.html via HF Hub commit API
const readmeB64 = Buffer.from(fs.readFileSync('hf-space/README.md', 'utf8'), 'utf8').toString('base64');
const htmlB64 = Buffer.from(fs.readFileSync('hf-space/index.html', 'utf8'), 'utf8').toString('base64');

const ndjson = [
  JSON.stringify({ key: 'header', value: { summary: 'feat: deploy China IIT & Expat static calculator' } }),
  JSON.stringify({ key: 'file', value: { content: readmeB64, path: 'README.md', encoding: 'base64' } }),
  JSON.stringify({ key: 'file', value: { content: htmlB64, path: 'index.html', encoding: 'base64' } }),
].join('\n');

const commitRes = await fetch(`https://huggingface.co/api/spaces/${repoId}/commit/main`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${hfToken}`,
    'Content-Type': 'application/x-ndjson',
  },
  body: ndjson,
});
console.log('[HF] Commit:', commitRes.status, await commitRes.text());

// 3. Publish GitHub Gist
const ghToken = fs.readFileSync('E:/Soft/key/github_token.txt', 'utf8').trim();
const bracketsCsv = fs.readFileSync('dataset/china_iit_brackets_2026_2027.csv', 'utf8');
const cityCsv = fs.readFileSync('dataset/china_city_social_security_caps_2026_2027.csv', 'utf8');
const gistRes = await fetch('https://api.github.com/gists', {
  method: 'POST',
  headers: {
    Authorization: `token ${ghToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'china-iit-engine-setup',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: '2026-2027 China Individual Income Tax (IIT) 7-Bracket Schedule & 6-City Social Security Caps — ChinaTaxCalc.com',
    public: true,
    files: {
      'china_iit_brackets_2026_2027.csv': { content: bracketsCsv },
      'china_city_social_security_caps_2026_2027.csv': { content: cityCsv },
      'README.md': {
        content: [
          '# 2026–2027 China IIT & Expat Social Security Reference',
          '',
          '- Interactive Calculator: https://chinataxcalc.com/calculator',
          '- Expat BIA Allowances Guide: https://chinataxcalc.com/expat-allowances',
          '- Annual Bonus Preferential Tax: https://chinataxcalc.com/annual-bonus',
          '- npm Engine: https://www.npmjs.com/package/china-iit-engine',
        ].join('\n'),
      },
    },
  }),
});
const gistJson = await gistRes.json();
console.log('[Gist] Created:', gistRes.status, gistJson.html_url);
