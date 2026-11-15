import { CityConfig, CurrencyRate, RelocationCountryModel, TaxBracket } from './types.js';

export const CURRENCY_RATES: Record<string, CurrencyRate> = {
  RMB: { code: 'RMB', symbol: '¥', name: 'Chinese Yuan (CNY)', rateToRMB: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateToRMB: 7.24 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateToRMB: 7.86 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateToRMB: 9.22 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', rateToRMB: 5.42 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar (HKD)', rateToRMB: 0.93 },
};

// 2026/2027 China Individual Income Tax Comprehensive 7-Bracket Progressive Rates
// Monthly base deduction: 5,000 RMB (60,000 RMB annually)
export const CHINA_IIT_BRACKETS: TaxBracket[] = [
  { level: 1, minAnnualIncome: 0, maxAnnualIncome: 36000, rate: 0.03, quickDeduction: 0 },
  { level: 2, minAnnualIncome: 36000, maxAnnualIncome: 144000, rate: 0.10, quickDeduction: 2520 },
  { level: 3, minAnnualIncome: 144000, maxAnnualIncome: 300000, rate: 0.20, quickDeduction: 16920 },
  { level: 4, minAnnualIncome: 300000, maxAnnualIncome: 420000, rate: 0.25, quickDeduction: 31920 },
  { level: 5, minAnnualIncome: 420000, maxAnnualIncome: 660000, rate: 0.30, quickDeduction: 52920 },
  { level: 6, minAnnualIncome: 660000, maxAnnualIncome: 960000, rate: 0.35, quickDeduction: 85920 },
  { level: 7, minAnnualIncome: 960000, maxAnnualIncome: Infinity, rate: 0.45, quickDeduction: 181920 },
];

export const STANDARD_ANNUAL_THRESHOLD_RMB = 60000;
export const STANDARD_MONTHLY_THRESHOLD_RMB = 5000;

export const CITIES_CONFIG: CityConfig[] = [
  {
    id: 'shanghai',
    name: 'Shanghai',
    avgWage: 12183,
    maxBase: 36549, // 3x avg cap
    minBase: 7310,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.0, // optional for foreign nationals
    },
    employerRates: {
      pension: 0.16,
      medical: 0.095,
      unemployment: 0.005,
      workInjury: 0.0026,
      maternity: 0.01,
      housingFund: 0.0,
    },
    notes: 'Expat Social Security exemption is historically supported in Shanghai (Hu Ren She Han [2021] No. 272). Foreign hires may mutually agree with employers to opt out.',
  },
  {
    id: 'beijing',
    name: 'Beijing',
    avgWage: 11761,
    maxBase: 35283,
    minBase: 6326,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.0,
    },
    employerRates: {
      pension: 0.16,
      medical: 0.098,
      unemployment: 0.008,
      workInjury: 0.004,
      maternity: 0.008,
      housingFund: 0.0,
    },
    notes: 'Beijing strictly mandates statutory social security for expat employees unless protected by a bilateral social security totalization treaty (e.g., Germany, Korea, Canada).',
  },
  {
    id: 'shenzhen',
    name: 'Shenzhen',
    avgWage: 8807,
    maxBase: 26421,
    minBase: 4404,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.003,
      housingFund: 0.0,
    },
    employerRates: {
      pension: 0.15,
      medical: 0.05,
      unemployment: 0.007,
      workInjury: 0.0028,
      maternity: 0.0045,
      housingFund: 0.0,
    },
    notes: 'Key Greater Bay Area hub. Eligible foreign talents can receive up to 15% effective IIT subsidy return under Qianhai and GBA regional preferential programs.',
  },
  {
    id: 'guangzhou',
    name: 'Guangzhou',
    avgWage: 8807,
    maxBase: 26421,
    minBase: 5284,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.002,
      housingFund: 0.0,
    },
    employerRates: {
      pension: 0.15,
      medical: 0.0685,
      unemployment: 0.0048,
      workInjury: 0.0032,
      maternity: 0.0085,
      housingFund: 0.0,
    },
    notes: 'Core GBA capital with competitive cost structure. Nansha district offers 15% IIT ceiling refunds for verified overseas talent.',
  },
  {
    id: 'hangzhou',
    name: 'Hangzhou',
    avgWage: 8023,
    maxBase: 24069,
    minBase: 4814,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.0,
    },
    employerRates: {
      pension: 0.15,
      medical: 0.095,
      unemployment: 0.005,
      workInjury: 0.003,
      maternity: 0.01,
      housingFund: 0.0,
    },
    notes: 'Major tech & e-commerce capital. High concentration of international engineers and cross-border specialists.',
  },
  {
    id: 'chengdu',
    name: 'Chengdu',
    avgWage: 7356,
    maxBase: 22068,
    minBase: 4414,
    employeeRates: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.004,
      housingFund: 0.0,
    },
    employerRates: {
      pension: 0.16,
      medical: 0.069,
      unemployment: 0.006,
      workInjury: 0.003,
      maternity: 0.008,
      housingFund: 0.0,
    },
    notes: 'Western China economic powerhouse with low cost of living and attractive high-tech talent incentives.',
  },
];

export const RELOCATION_MODELS: RelocationCountryModel[] = [
  {
    id: 'us_ca',
    name: 'United States (California)',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    defaultExchangeRateToRMB: 7.24,
    costOfLivingIndexVsShanghai: 185,
    keyFeatures: [
      'Federal Progressive Tax (10% - 37%)',
      'California State Tax (up to 13.3% - highest in US)',
      'FICA: Social Security 6.2% (capped at $168,600) + Medicare 1.45% + 0.9% surtax',
      'High housing and medical expenses out-of-pocket',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // Federal tax calculation (Single filer standard deduction ~$14,600)
      const fedTaxable = Math.max(0, grossUSD - 14600);
      let fedTax = 0;
      if (fedTaxable > 609350) fedTax = 186601 + (fedTaxable - 609350) * 0.37;
      else if (fedTaxable > 243725) fedTax = 53574 + (fedTaxable - 243725) * 0.35;
      else if (fedTaxable > 191950) fedTax = 35467 + (fedTaxable - 191950) * 0.32;
      else if (fedTaxable > 100525) fedTax = 14382 + (fedTaxable - 100525) * 0.24;
      else if (fedTaxable > 47150) fedTax = 5426 + (fedTaxable - 47150) * 0.22;
      else if (fedTaxable > 11600) fedTax = 1160 + (fedTaxable - 11600) * 0.12;
      else fedTax = fedTaxable * 0.10;

      // California State tax (standard deduction ~$5,363)
      const caTaxable = Math.max(0, grossUSD - 5363);
      let caTax = 0;
      if (caTaxable > 698271) caTax = 76600 + (caTaxable - 698271) * 0.133;
      else if (caTaxable > 418961) caTax = 43100 + (caTaxable - 418961) * 0.113;
      else if (caTaxable > 349137) caTax = 35400 + (caTaxable - 349137) * 0.103;
      else if (caTaxable > 68350) caTax = 4600 + (caTaxable - 68350) * 0.093;
      else if (caTaxable > 54081) caTax = 3200 + (caTaxable - 54081) * 0.08;
      else if (caTaxable > 38959) caTax = 1900 + (caTaxable - 38959) * 0.06;
      else caTax = caTaxable * 0.04;

      // FICA
      const ssCap = 168600;
      const ssTax = Math.min(grossUSD, ssCap) * 0.062;
      const medTax = grossUSD * 0.0145 + (grossUSD > 200000 ? (grossUSD - 200000) * 0.009 : 0);
      const fica = ssTax + medTax;

      const totalTax = fedTax + caTax;
      const totalDeductions = totalTax + fica;
      const netCash = Math.max(0, grossUSD - totalDeductions);
      const effectiveRate = grossUSD > 0 ? (totalDeductions / grossUSD) : 0;
      const marginalRate = grossUSD > 698271 ? 0.503 : (grossUSD > 243725 ? 0.443 : 0.333);

      return {
        incomeTax: Math.round(totalTax),
        socialInsuranceOrFica: Math.round(fica),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(netCash),
        effectiveRate,
        marginalRate,
      };
    },
  },
  {
    id: 'us_ny',
    name: 'United States (New York City)',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    defaultExchangeRateToRMB: 7.24,
    costOfLivingIndexVsShanghai: 195,
    keyFeatures: [
      'Federal Progressive Tax (10% - 37%)',
      'NY State Income Tax (4% - 10.9%)',
      'NYC Local Resident Tax (3.078% - 3.876%)',
      'High municipal and sales tax burden',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // Federal
      const fedTaxable = Math.max(0, grossUSD - 14600);
      let fedTax = 0;
      if (fedTaxable > 609350) fedTax = 186601 + (fedTaxable - 609350) * 0.37;
      else if (fedTaxable > 243725) fedTax = 53574 + (fedTaxable - 243725) * 0.35;
      else if (fedTaxable > 100525) fedTax = 14382 + (fedTaxable - 100525) * 0.24;
      else fedTax = fedTaxable * 0.18;

      // NY State + NYC (~8.5% to 12.5% combined)
      const nyStateAndCityTax = grossUSD * (grossUSD > 250000 ? 0.105 : (grossUSD > 100000 ? 0.088 : 0.068));

      // FICA
      const fica = Math.min(grossUSD, 168600) * 0.062 + grossUSD * 0.0145;
      const totalTax = fedTax + nyStateAndCityTax;
      const totalDeductions = totalTax + fica;

      return {
        incomeTax: Math.round(totalTax),
        socialInsuranceOrFica: Math.round(fica),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(grossUSD - totalDeductions),
        effectiveRate: grossUSD > 0 ? (totalDeductions / grossUSD) : 0,
        marginalRate: 0.47,
      };
    },
  },
  {
    id: 'us_tx',
    name: 'United States (Texas - No State Tax)',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    defaultExchangeRateToRMB: 7.24,
    costOfLivingIndexVsShanghai: 140,
    keyFeatures: [
      'Federal Progressive Tax Only (10% - 37%)',
      '0% Texas State Income Tax',
      'FICA Social Security & Medicare applies',
      'Property taxes are relatively high in Texas',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      const fedTaxable = Math.max(0, grossUSD - 14600);
      let fedTax = 0;
      if (fedTaxable > 609350) fedTax = 186601 + (fedTaxable - 609350) * 0.37;
      else if (fedTaxable > 243725) fedTax = 53574 + (fedTaxable - 243725) * 0.35;
      else if (fedTaxable > 100525) fedTax = 14382 + (fedTaxable - 100525) * 0.24;
      else fedTax = fedTaxable * 0.18;

      const fica = Math.min(grossUSD, 168600) * 0.062 + grossUSD * 0.0145;
      const totalDeductions = fedTax + fica;

      return {
        incomeTax: Math.round(fedTax),
        socialInsuranceOrFica: Math.round(fica),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(grossUSD - totalDeductions),
        effectiveRate: grossUSD > 0 ? (totalDeductions / grossUSD) : 0,
        marginalRate: 0.37,
      };
    },
  },
  {
    id: 'uk_london',
    name: 'United Kingdom (London)',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    defaultExchangeRateToRMB: 9.22,
    costOfLivingIndexVsShanghai: 180,
    keyFeatures: [
      'Personal Allowance £12,570 (tapers to £0 above £100,000)',
      'Basic rate 20%, Higher rate 40%, Additional rate 45% (>£125,140)',
      '60% effective marginal tax trap between £100k - £125k',
      'Employee National Insurance (8% between £12,570-£50,270, 2% thereafter)',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // Convert USD to GBP for computation, then return proportional values
      const gbpRate = 1.28; // USD/GBP
      const grossGBP = grossUSD / gbpRate;

      // Personal allowance tapering
      let personalAllowance = 12570;
      if (grossGBP > 100000) {
        personalAllowance = Math.max(0, 12570 - (grossGBP - 100000) / 2);
      }

      const taxableIncome = Math.max(0, grossGBP - personalAllowance);
      let incomeTaxGBP = 0;
      if (taxableIncome > 125140) {
        incomeTaxGBP = 50000 * 0.20 + (125140 - 50000) * 0.40 + (taxableIncome - 125140) * 0.45;
      } else if (taxableIncome > 37700) {
        incomeTaxGBP = 37700 * 0.20 + (taxableIncome - 37700) * 0.40;
      } else {
        incomeTaxGBP = taxableIncome * 0.20;
      }

      // National Insurance
      let niGBP = 0;
      if (grossGBP > 50270) {
        niGBP = (50270 - 12570) * 0.08 + (grossGBP - 50270) * 0.02;
      } else if (grossGBP > 12570) {
        niGBP = (grossGBP - 12570) * 0.08;
      }

      const totalTaxUSD = incomeTaxGBP * gbpRate;
      const niUSD = niGBP * gbpRate;
      const totalDeductions = totalTaxUSD + niUSD;

      return {
        incomeTax: Math.round(totalTaxUSD),
        socialInsuranceOrFica: Math.round(niUSD),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(grossUSD - totalDeductions),
        effectiveRate: grossUSD > 0 ? (totalDeductions / grossUSD) : 0,
        marginalRate: 0.47,
      };
    },
  },
  {
    id: 'germany',
    name: 'Germany (Berlin / Frankfurt)',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    defaultExchangeRateToRMB: 7.86,
    costOfLivingIndexVsShanghai: 155,
    keyFeatures: [
      'Progressive Einkommensteuer (14% - 42% / 45%)',
      'Solidaritätszuschlag (5.5% surcharge)',
      'Social Security Package: Pension (9.3%), Health (7.3%+), Unemployment (1.3%), Care (2.2%)',
      'Total statutory employee deductions around 40% - 48%',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // Germany has high social security + progressive tax
      const socialSecurity = Math.min(grossUSD * 0.20, 18000); // capped
      const taxable = Math.max(0, grossUSD - 11604 - socialSecurity);
      let tax = 0;
      if (taxable > 277825) tax = 100000 + (taxable - 277825) * 0.45;
      else if (taxable > 66760) tax = 18000 + (taxable - 66760) * 0.42;
      else tax = taxable * 0.30;

      const totalDeductions = tax + socialSecurity;
      return {
        incomeTax: Math.round(tax),
        socialInsuranceOrFica: Math.round(socialSecurity),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(grossUSD - totalDeductions),
        effectiveRate: grossUSD > 0 ? (totalDeductions / grossUSD) : 0,
        marginalRate: 0.45,
      };
    },
  },
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    defaultExchangeRateToRMB: 5.42,
    costOfLivingIndexVsShanghai: 210,
    keyFeatures: [
      'Top personal tax rate is low (max 24%)',
      'Foreigners with Employment Pass do not pay CPF (0% CPF)',
      'No capital gains or inheritance tax',
      'Extremely high cost of living (rent & schooling often $4k-$6k+/mo)',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // Singapore progressive rate (SGD)
      const sgdRate = 1.34;
      const grossSGD = grossUSD * sgdRate;
      let taxSGD = 0;
      if (grossSGD > 1000000) taxSGD = 207150 + (grossSGD - 1000000) * 0.24;
      else if (grossSGD > 500000) taxSGD = 97150 + (grossSGD - 500000) * 0.23;
      else if (grossSGD > 320000) taxSGD = 44550 + (grossSGD - 320000) * 0.22;
      else if (grossSGD > 200000) taxSGD = 21150 + (grossSGD - 200000) * 0.19;
      else if (grossSGD > 120000) taxSGD = 7950 + (grossSGD - 120000) * 0.15;
      else if (grossSGD > 80000) taxSGD = 3350 + (grossSGD - 80000) * 0.115;
      else if (grossSGD > 40000) taxSGD = 550 + (grossSGD - 40000) * 0.07;
      else taxSGD = Math.max(0, (grossSGD - 20000) * 0.02);

      const taxUSD = taxSGD / sgdRate;
      return {
        incomeTax: Math.round(taxUSD),
        socialInsuranceOrFica: 0, // foreigners exempt from CPF
        totalDeductions: Math.round(taxUSD),
        netCash: Math.round(grossUSD - taxUSD),
        effectiveRate: grossUSD > 0 ? (taxUSD / grossUSD) : 0,
        marginalRate: 0.24,
      };
    },
  },
  {
    id: 'hongkong',
    name: 'Hong Kong SAR',
    flag: '🇭🇰',
    currency: 'HKD',
    currencySymbol: 'HK$',
    defaultExchangeRateToRMB: 0.93,
    costOfLivingIndexVsShanghai: 190,
    keyFeatures: [
      'Salaries Tax capped at Standard Rate 15% (or 16% on high earners) or Progressive (2% - 17%)',
      'MPF mandatory contribution capped at HK$1,500/month',
      'No dividend, capital gains, or VAT tax',
      'Very high housing and living costs',
    ],
    incomeTaxRateEstimate: (grossUSD: number) => {
      // HK standard rate capped around 15-16%
      const effectiveRate = grossUSD > 640000 ? 0.16 : (grossUSD > 100000 ? 0.15 : 0.10);
      const tax = grossUSD * effectiveRate;
      const mpf = Math.min(grossUSD * 0.05, 2300); // MPF cap HKD 18k/yr ≈ USD 2.3k
      const totalDeductions = tax + mpf;

      return {
        incomeTax: Math.round(tax),
        socialInsuranceOrFica: Math.round(mpf),
        totalDeductions: Math.round(totalDeductions),
        netCash: Math.round(grossUSD - totalDeductions),
        effectiveRate: grossUSD > 0 ? (totalDeductions / grossUSD) : 0,
        marginalRate: 0.16,
      };
    },
  },
];

export const GBA_CITIES = [
  { id: 'shenzhen', name: 'Shenzhen (Qianhai / Hetao)', quota: 'Up to RMB 5M per year', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'guangzhou', name: 'Guangzhou (Nansha / Huangpu)', quota: 'Up to RMB 5M per year', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'zhuhai', name: 'Zhuhai (Hengqin Cooperation Zone)', quota: 'Up to RMB 5M per year', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'foshan', name: 'Foshan', quota: 'Full differential grant', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'dongguan', name: 'Dongguan', quota: 'High-tech talent subsidy', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'zhongshan', name: 'Zhongshan', quota: 'Full differential grant', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'jiangmen', name: 'Jiangmen', quota: 'Full differential grant', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'huizhou', name: 'Huizhou', quota: 'Full differential grant', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
  { id: 'zhaoqing', name: 'Zhaoqing', quota: 'Full differential grant', subsidyFormula: 'Actual IIT Paid - (Taxable Income × 15%)' },
];
