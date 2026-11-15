import fs from 'node:fs';
import path from 'node:path';

const { username, key } = JSON.parse(fs.readFileSync('E:/Soft/key/kaggle.json', 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${username}:${key}`).toString('base64');
const SLUG = 'china-iit-expat-tax-benchmark-2026-2027';

async function uploadBlob(filePath) {
  const buf = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const initRes = await fetch('https://www.kaggle.com/api/v1/blobs/upload', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'DATASET',
      name,
      contentLength: buf.length,
      lastModifiedEpochSeconds: Math.floor(fs.statSync(filePath).mtimeMs / 1000),
    }),
  });
  const initJson = await initRes.json();
  if (!initRes.ok || !initJson.createUrl) {
    throw new Error(`Blob init failed for ${name}: ${initRes.status} ${JSON.stringify(initJson)}`);
  }
  const putRes = await fetch(initJson.createUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(buf.length) },
    body: buf,
  });
  if (!putRes.ok) {
    throw new Error(`Blob PUT failed for ${name}: ${putRes.status}`);
  }
  return initJson.token;
}

const files = [
  'dataset/china_iit_brackets_2026_2027.csv',
  'dataset/china_city_social_security_caps_2026_2027.csv',
  'dataset/china_gba_15pct_subsidy_cities.csv',
  'dataset/china_iit_expat_benchmark_2026_2027.json',
];

const tokens = [];
for (const f of files) {
  const token = await uploadBlob(f);
  tokens.push({ path: path.basename(f), token });
  console.log('[Kaggle] Uploaded blob:', path.basename(f));
}

const description = [
  '2026–2027 China Individual Income Tax (IIT), Annual One-Off Bonus, Social Security Base Caps, Expat Benefits-in-Kind (BIA), and Greater Bay Area (GBA) 15% Subsidy Benchmark Dataset.',
  '',
  'Compiled from State Taxation Administration (STA) regulations and municipal HRSS social security circulars across 6 major Chinese hubs, plus 7 global relocation tax comparisons.',
  '',
  '### Included Files',
  '- `china_iit_brackets_2026_2027.csv`: 7-tier comprehensive annual IIT progressive brackets (3%–45%) with quick deductions.',
  '- `china_city_social_security_caps_2026_2027.csv`: Monthly average wage, 3x contribution cap, 60% floor, employee/employer rates, and expat exemption notes for Shanghai, Beijing, Shenzhen, Guangzhou, Hangzhou, and Chengdu.',
  '- `china_gba_15pct_subsidy_cities.csv`: Greater Bay Area 9 municipalities offering the 15% IIT ceiling refund (up to RMB 5M/year).',
  '- `china_iit_expat_benchmark_2026_2027.json`: Unified machine-readable JSON bundle with currency conversion baselines and 7 global relocation benchmarks.',
  '',
  '### Companion Interactive Tools & Open-Source Engine',
  '- Interactive China IIT & Expat Calculator: https://chinataxcalc.com/calculator',
  '- Expat BIA Allowances Guide: https://chinataxcalc.com/expat-allowances',
  '- Annual Bonus Preferential Tax Guide: https://chinataxcalc.com/annual-bonus',
  '- Offline Browser Calculator (GitHub Pages): https://abigaildavised.github.io/china-iit-engine/',
  '- Hugging Face Static Space: https://huggingface.co/spaces/AbigailDavised/china-iit-expat-calculator',
  '',
  '*Disclaimer: Independent reference dataset based on published STA and municipal rules. Verify final payroll filings with local tax authorities.*',
].join('\n');

const createRes = await fetch('https://www.kaggle.com/api/v1/datasets/create/new', {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'China IIT & Expat Tax Benchmark (2026–2027)',
    slug: SLUG,
    ownerSlug: username,
    subtitle: '7-bracket IIT rates, 6-city social security caps, GBA 15% subsidies, and global relocation tax benchmarks.',
    description,
    isPrivate: false,
    licenses: [{ name: 'CC0-1.0' }],
    keywords: ['finance', 'taxes', 'china', 'economics'],
    files: tokens.map((t) => ({ token: t.token })),
  }),
});
const createText = await createRes.text();
console.log('[Kaggle] Create dataset:', createRes.status, createText);

// Update rich file & column metadata
const metaGetRes = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${SLUG}`, {
  headers: { Authorization: authHeader },
});
const metaGet = await metaGetRes.json();
const info = metaGet.info || {};

const fileDescriptors = {
  'china_iit_brackets_2026_2027.csv': {
    description: 'Statutory 7-bracket progressive annual comprehensive IIT schedule (3% to 45%) with quick deductions.',
    columns: [
      { name: 'level', description: 'Tax bracket tier (1 through 7).' },
      { name: 'min_annual_income_rmb', description: 'Lower bound of annual taxable income in RMB.' },
      { name: 'max_annual_income_rmb', description: 'Upper bound of annual taxable income in RMB (Infinity for tier 7).' },
      { name: 'tax_rate', description: 'Marginal progressive tax rate (0.03 to 0.45).' },
      { name: 'quick_deduction_rmb', description: 'Statutory quick deduction amount in RMB.' },
    ],
  },
  'china_city_social_security_caps_2026_2027.csv': {
    description: 'Social security contribution base floors, 3x caps, employee/employer rates, and expat exemption policy notes across 6 Chinese cities.',
    columns: [
      { name: 'city_id', description: 'Canonical lowercase city identifier.' },
      { name: 'city_name', description: 'English municipality name.' },
      { name: 'avg_monthly_wage_rmb', description: 'Municipal average monthly salary reference in RMB.' },
      { name: 'max_base_3x_rmb', description: 'Monthly statutory contribution ceiling (300% average wage) in RMB.' },
      { name: 'min_base_60pct_rmb', description: 'Monthly statutory contribution floor in RMB.' },
      { name: 'employee_pension_rate', description: 'Employee pension insurance rate.' },
      { name: 'employee_medical_rate', description: 'Employee medical insurance rate.' },
      { name: 'employee_unemployment_rate', description: 'Employee unemployment insurance rate.' },
      { name: 'employee_total_rate', description: 'Combined employee social security contribution rate.' },
      { name: 'employer_total_rate', description: 'Combined employer social security contribution rate.' },
      { name: 'expat_policy_notes', description: 'Summary of municipal expat social security enforcement or opt-out rules.' },
    ],
  },
  'china_gba_15pct_subsidy_cities.csv': {
    description: '9 Greater Bay Area municipalities eligible for the 15% IIT ceiling fiscal subsidy for overseas talent.',
    columns: [
      { name: 'city_id', description: 'Canonical lowercase city identifier.' },
      { name: 'municipality_or_zone', description: 'Municipality and key preferential cooperation zone.' },
      { name: 'annual_subsidy_cap', description: 'Statutory annual subsidy ceiling.' },
      { name: 'subsidy_formula', description: 'Government refund calculation formula.' },
    ],
  },
  'china_iit_expat_benchmark_2026_2027.json': {
    description: 'Unified JSON bundle including IIT brackets, 6-city social security caps, GBA subsidy rules, and 7 global relocation benchmarks.',
  },
};

const updatedData = (info.data || []).map((f) => {
  const spec = fileDescriptors[f.name];
  if (!spec) return f;
  const colMap = Object.fromEntries((spec.columns || []).map((c) => [c.name, c.description]));
  return {
    ...f,
    description: spec.description,
    columns: (f.columns || []).map((col) => ({
      ...col,
      description: colMap[col.name] || col.description || '',
    })),
  };
});

const metaPostRes = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${SLUG}`, {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...info,
    isPrivate: false,
    expectedUpdateFrequency: 'quarterly',
    userSpecifiedSources:
      'State Taxation Administration (STA) Individual Income Tax circulars & municipal HRSS social security contribution schedules, compiled by ChinaTaxCalc.com.',
    data: updatedData,
  }),
});
console.log('[Kaggle] Metadata update:', metaPostRes.status, await metaPostRes.text());
console.log(`[Kaggle] Dataset URL: https://www.kaggle.com/datasets/${username}/${SLUG}`);
