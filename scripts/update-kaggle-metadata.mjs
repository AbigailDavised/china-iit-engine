import fs from 'node:fs';

const { username, key } = JSON.parse(fs.readFileSync('E:/Soft/key/kaggle.json', 'utf8'));
const auth = 'Basic ' + Buffer.from(`${username}:${key}`).toString('base64');
const slug = 'china-iit-expat-tax-benchmark-2026-2027';

const r1 = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${slug}`, {
  headers: { Authorization: auth },
});
const m = await r1.json();
const info = m.info || {};

const specs = {
  'china_iit_brackets_2026_2027.csv': {
    description: 'Statutory 7-bracket progressive annual comprehensive IIT schedule (3% to 45%) with quick deductions.',
    columns: {
      level: 'Tax bracket tier (1 through 7).',
      min_annual_income_rmb: 'Lower bound of annual taxable income in RMB.',
      max_annual_income_rmb: 'Upper bound of annual taxable income in RMB (Infinity for tier 7).',
      tax_rate: 'Marginal progressive tax rate (0.03 to 0.45).',
      quick_deduction_rmb: 'Statutory quick deduction amount in RMB.',
    },
  },
  'china_city_social_security_caps_2026_2027.csv': {
    description: 'Social security contribution base floors, 3x caps, employee/employer rates, and expat exemption policy notes across 6 Chinese cities.',
    columns: {
      city_id: 'Canonical lowercase city identifier.',
      city_name: 'English municipality name.',
      avg_monthly_wage_rmb: 'Municipal average monthly salary reference in RMB.',
      max_base_3x_rmb: 'Monthly statutory contribution ceiling (300% average wage) in RMB.',
      min_base_60pct_rmb: 'Monthly statutory contribution floor in RMB.',
      employee_pension_rate: 'Employee pension insurance rate.',
      employee_medical_rate: 'Employee medical insurance rate.',
      employee_unemployment_rate: 'Employee unemployment insurance rate.',
      employee_total_rate: 'Combined employee social security contribution rate.',
      employer_total_rate: 'Combined employer social security contribution rate.',
      expat_policy_notes: 'Summary of municipal expat social security enforcement or opt-out rules.',
    },
  },
  'china_gba_15pct_subsidy_cities.csv': {
    description: '9 Greater Bay Area municipalities eligible for the 15% IIT ceiling fiscal subsidy for overseas talent.',
    columns: {
      city_id: 'Canonical lowercase city identifier.',
      municipality_or_zone: 'Municipality and key preferential cooperation zone.',
      annual_subsidy_cap: 'Statutory annual subsidy ceiling.',
      subsidy_formula: 'Government refund calculation formula.',
    },
  },
  'china_iit_expat_benchmark_2026_2027.json': {
    description: 'Unified JSON bundle including IIT brackets, 6-city social security caps, GBA subsidy rules, and 7 global relocation benchmarks.',
  },
};

const data = (info.data || []).map((f) => {
  const s = specs[f.name];
  if (!s) return f;
  return {
    ...f,
    description: s.description,
    columns: (f.columns || []).map((c) => ({
      ...c,
      description: (s.columns && s.columns[c.name]) || c.description || '',
    })),
  };
});

const r2 = await fetch(`https://www.kaggle.com/api/v1/datasets/metadata/${username}/${slug}`, {
  method: 'POST',
  headers: { Authorization: auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...info,
    isPrivate: false,
    expectedUpdateFrequency: 'quarterly',
    userSpecifiedSources:
      'State Taxation Administration (STA) Individual Income Tax circulars & municipal HRSS social security contribution schedules, compiled by ChinaTaxCalc.com.',
    data,
  }),
});
console.log('[Kaggle] Metadata update:', r2.status, await r2.text());

const ks = await fetch(
  `https://www.kaggle.com/api/v1/kernels/status?userName=${username}&kernelSlug=china-iit-expat-tax-benchmark-eda-2026-2027`,
  { headers: { Authorization: auth } },
);
console.log('[Kaggle] Kernel status:', await ks.text());
