import fs from 'node:fs';

const creds = JSON.parse(fs.readFileSync('E:/Soft/key/bluesky_credentials.json', 'utf8'));
const coverPath = 'E:/Soft/misc/backlink-pipeline/site-assets/chinataxcalc.com/cover.png';

// 1. Login
const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: creds.handle, password: creds.password || creds.app_password || creds.appPassword }),
});
const session = await sessionRes.json();
if (!session.accessJwt) throw new Error('Bluesky login failed: ' + JSON.stringify(session));

// 2. Upload Launch Kit cover.png
const imgBuf = fs.readFileSync(coverPath);
const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.accessJwt}`,
    'Content-Type': 'image/png',
  },
  body: imgBuf,
});
const blobJson = await blobRes.json();

const text =
  'Open-sourced china-iit-engine (0-dep TypeScript) + 2026–2027 China IIT & Expat Tax Benchmark Dataset on Kaggle & HF Spaces.\n\n' +
  'Calculator: https://chinataxcalc.com/calculator\n' +
  'Kaggle: https://www.kaggle.com/datasets/sotomo/china-iit-expat-tax-benchmark-2026-2027';

// Build facets for clickable URLs
const facets = [];
for (const url of [
  'https://chinataxcalc.com/calculator',
  'https://www.kaggle.com/datasets/sotomo/china-iit-expat-tax-benchmark-2026-2027',
]) {
  const idx = Buffer.from(text, 'utf8').indexOf(url);
  if (idx >= 0) {
    facets.push({
      index: { byteStart: idx, byteEnd: idx + Buffer.byteLength(url, 'utf8') },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    });
  }
}

const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.accessJwt}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    repo: session.did,
    collection: 'app.bsky.feed.post',
    record: {
      $type: 'app.bsky.feed.post',
      text,
      facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: 'https://chinataxcalc.com/calculator',
          title: 'ChinaTaxCalc — 2026–2027 China IIT & Expat Tax Calculator',
          description: '7-bracket IIT calculator, 183-day rule, annual bonus preferential tax, 6-city social security caps, and GBA 15% subsidy.',
          thumb: blobJson.blob,
        },
      },
    },
  }),
});
const postJson = await postRes.json();
const rkey = postJson.uri?.split('/').pop();
console.log('[Bluesky] Post URL:', `https://bsky.app/profile/${creds.handle}/post/${rkey}`);
