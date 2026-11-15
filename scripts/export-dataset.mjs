import fs from 'node:fs';
import path from 'node:path';
import {
  CHINA_IIT_BRACKETS,
  CITIES_CONFIG,
  CURRENCY_RATES,
  GBA_CITIES,
  RELOCATION_MODELS,
  STANDARD_ANNUAL_THRESHOLD_RMB,
} from '../dist/esm/index.js';

const outDir = path.resolve('dataset');
fs.mkdirSync(outDir, { recursive: true });

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// 1. china_iit_brackets_2026_2027.csv
const bracketHeader = ['level', 'min_annual_income_rmb', 'max_annual_income_rmb', 'tax_rate', 'quick_deduction_rmb'];
const bracketRows = CHINA_IIT_BRACKETS.map((b) => [
  b.level,
  b.minAnnualIncome,
  Number.isFinite(b.maxAnnualIncome) ? b.maxAnnualIncome : 'Infinity',
  b.rate,
  b.quickDeduction,
]);
fs.writeFileSync(
  path.join(outDir, 'china_iit_brackets_2026_2027.csv'),
  [bracketHeader, ...bracketRows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n',
  'utf8',
);

// 2. china_city_social_security_caps_2026_2027.csv
const cityHeader = [
  'city_id',
  'city_name',
  'avg_monthly_wage_rmb',
  'max_base_3x_rmb',
  'min_base_60pct_rmb',
  'employee_pension_rate',
  'employee_medical_rate',
  'employee_unemployment_rate',
  'employee_total_rate',
  'employer_total_rate',
  'expat_policy_notes',
];
const cityRows = CITIES_CONFIG.map((c) => {
  const empTotal = +(
    c.employeeRates.pension +
    c.employeeRates.medical +
    c.employeeRates.unemployment +
    c.employeeRates.housingFund
  ).toFixed(4);
  const emprTotal = +(
    c.employerRates.pension +
    c.employerRates.medical +
    c.employerRates.unemployment +
    c.employerRates.workInjury +
    c.employerRates.maternity +
    c.employerRates.housingFund
  ).toFixed(4);
  return [
    c.id,
    c.name,
    c.avgWage,
    c.maxBase,
    c.minBase,
    c.employeeRates.pension,
    c.employeeRates.medical,
    c.employeeRates.unemployment,
    empTotal,
    emprTotal,
    c.notes,
  ];
});
fs.writeFileSync(
  path.join(outDir, 'china_city_social_security_caps_2026_2027.csv'),
  [cityHeader, ...cityRows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n',
  'utf8',
);

// 3. china_gba_15pct_subsidy_cities.csv
const gbaHeader = ['city_id', 'municipality_or_zone', 'annual_subsidy_cap', 'subsidy_formula'];
const gbaRows = GBA_CITIES.map((g) => [g.id, g.name, g.quota, g.subsidyFormula]);
fs.writeFileSync(
  path.join(outDir, 'china_gba_15pct_subsidy_cities.csv'),
  [gbaHeader, ...gbaRows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n',
  'utf8',
);

// 4. china_iit_expat_benchmark_2026_2027.json
const bundle = {
  schemaVersion: '2026.1',
  source: 'ChinaTaxCalc.com (compiled from STA & municipal HRSS circulars)',
  standardAnnualDeductionRMB: STANDARD_ANNUAL_THRESHOLD_RMB,
  annualBonusSeparateTaxValidThrough: '2027-12-31',
  currencyRates: CURRENCY_RATES,
  iitBrackets: CHINA_IIT_BRACKETS.map((b) => ({
    ...b,
    maxAnnualIncome: Number.isFinite(b.maxAnnualIncome) ? b.maxAnnualIncome : null,
  })),
  citySocialSecurityCaps: CITIES_CONFIG,
  gba15PercentSubsidyCities: GBA_CITIES,
  globalRelocationBenchmarks: RELOCATION_MODELS.map((m) => ({
    id: m.id,
    name: m.name,
    currency: m.currency,
    defaultExchangeRateToRMB: m.defaultExchangeRateToRMB,
    costOfLivingIndexVsShanghai: m.costOfLivingIndexVsShanghai,
    keyFeatures: m.keyFeatures,
    sampleEffectiveTaxAt150kUSD: m.incomeTaxRateEstimate(150000),
  })),
};
fs.writeFileSync(
  path.join(outDir, 'china_iit_expat_benchmark_2026_2027.json'),
  JSON.stringify(bundle, null, 2) + '\n',
  'utf8',
);

console.log('Exported dataset files:', fs.readdirSync(outDir));
