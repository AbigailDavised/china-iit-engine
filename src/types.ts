export type CurrencyCode = 'RMB' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'HKD';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToRMB: number; // 1 Unit of this currency = X RMB
}

export type IncomePeriod = 'monthly' | 'annual';

export type SocialSecurityMode = 'exempt' | 'standard';

export interface CityConfig {
  id: string;
  name: string;
  chineseName?: string;
  avgWage: number; // monthly base average
  maxBase: number; // 3x average cap
  minBase: number; // 60% floor
  employeeRates: {
    pension: number; // e.g. 0.08
    medical: number; // e.g. 0.02
    unemployment: number; // e.g. 0.005
    housingFund: number; // optional, expats usually exempt or 0.07
  };
  employerRates: {
    pension: number; // e.g. 0.16
    medical: number; // e.g. 0.095
    unemployment: number; // e.g. 0.005
    workInjury: number; // e.g. 0.0026
    maternity: number; // merged or ~0.01
    housingFund: number; // optional
  };
  notes: string;
}

export interface ExpatBIAItems {
  housingRental: number;
  childrenEducation: number;
  languageTraining: number;
  homeLeaveFlights: number;
  mealAllowance: number;
  laundryCost: number;
  relocationMoving: number;
  businessTravelPerDiem: number;
}

export interface TaxBracket {
  level: number;
  minAnnualIncome: number;
  maxAnnualIncome: number;
  rate: number;
  quickDeduction: number;
}

export interface IITCalculationResult {
  currency: CurrencyCode;
  incomePeriod: IncomePeriod;
  
  // Raw amounts in selected currency & RMB
  grossIncome: number;
  grossIncomeRMB: number;
  annualBonus: number;
  annualBonusRMB: number;

  // Annual Totals in RMB
  totalAnnualGrossRMB: number;
  totalAnnualBIARMB: number;
  totalAnnualSocialSecurityEmployeeRMB: number;
  totalAnnualStandardDeductionRMB: number; // 60,000 RMB
  
  annualTaxableIncomeRMB: number;
  annualComprehensiveIITRMB: number;
  annualBonusIITRMB: number;
  totalAnnualIITRMB: number;

  totalAnnualNetPayRMB: number;
  totalAnnualEmployerCostRMB: number;
  totalAnnualEmployerSSRMB: number;

  // Rates
  effectiveTaxRate: number; // Total Tax / Total Gross
  marginalTaxBracket: number; // Top marginal rate applicable (e.g. 0.25)
  netTakeHomePercentage: number; // Total Net / Total Gross

  // Converted results back to active currency
  annualNetPay: number;
  monthlyNetPay: number;
  annualIIT: number;
  monthlyIIT: number;
  annualSocialSecurityEmployee: number;
  monthlySocialSecurityEmployee: number;
  annualBIA: number;
  annualEmployerCost: number;

  // Tax Savings from BIA
  taxWithoutBIARMB: number;
  taxSavingsFromBIARMB: number;
  taxSavingsFromBIA: number;

  // Cumulative Withholding Schedule (1~12 Months)
  monthlySchedule: MonthlyPayrollScheduleItem[];
  withholdingSummary: CumulativeWithholdingSummary;
}

export interface MonthlyPayrollScheduleItem {
  month: number;
  monthName: string;
  grossIncomeRMB: number;
  grossIncome: number;
  socialSecurityEmployeeRMB: number;
  standardDeductionRMB: number;
  biaDeductionRMB: number;
  cumGrossRMB: number;
  cumSocialSecurityRMB: number;
  cumStandardDeductionRMB: number;
  cumBIARMB: number;
  cumTaxableIncomeRMB: number;
  cumTaxLiabilityRMB: number;
  currentMarginalRate: number;
  currentBracketLevel: number;
  bracketJumpedThisMonth: boolean;
  previousBracketRate?: number;
  taxWithheldRMB: number;
  taxWithheld: number;
  netPayRMB: number;
  netPay: number;
}

export interface CumulativeWithholdingSummary {
  monthlySchedule: MonthlyPayrollScheduleItem[];
  highestNetMonth: { month: number; monthName: string; netPay: number };
  lowestNetMonth: { month: number; monthName: string; netPay: number };
  monthlySwingRMB: number;
  monthlySwingPct: number;
  bracketJumpMonths: { month: number; monthName: string; fromRate: number; toRate: number }[];
}

export interface LandlordFapiaoAnalysis {
  surchargeRatePct: number;
  annualRentRMB: number;
  annualSurchargeCostRMB: number;
  grossTaxSavingsRMB: number;
  netBenefitRMB: number;
  roiPct: number;
  isWorthIt: boolean;
}

export interface RelocationCountryModel {
  id: string;
  name: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  defaultExchangeRateToRMB: number;
  incomeTaxRateEstimate: (grossInUSD: number) => {
    incomeTax: number;
    socialInsuranceOrFica: number;
    totalDeductions: number;
    netCash: number;
    effectiveRate: number;
    marginalRate: number;
  };
  keyFeatures: string[];
  costOfLivingIndexVsShanghai: number; // 100 = Shanghai baseline
}

export interface SixYearYearRecord {
  year: number;
  residedOver183Days: boolean;
  singleAbsenceOver30Days: boolean;
}
