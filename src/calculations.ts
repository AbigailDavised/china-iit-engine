import { CHINA_IIT_BRACKETS, CITIES_CONFIG, CURRENCY_RATES, STANDARD_ANNUAL_THRESHOLD_RMB } from './data.js';
import {
  CumulativeWithholdingSummary,
  CurrencyCode,
  ExpatBIAItems,
  IITCalculationResult,
  IncomePeriod,
  LandlordFapiaoAnalysis,
  MonthlyPayrollScheduleItem,
  SocialSecurityMode,
} from './types.js';

/**
 * Calculates China Comprehensive Individual Income Tax (IIT) given an annual taxable income.
 */
export function calculateAnnualIITFromTaxable(taxableRMB: number): { iit: number; marginalRate: number; bracketLevel: number } {
  if (taxableRMB <= 0) {
    return { iit: 0, marginalRate: 0, bracketLevel: 0 };
  }

  for (const bracket of CHINA_IIT_BRACKETS) {
    if (taxableRMB <= bracket.maxAnnualIncome) {
      const iit = taxableRMB * bracket.rate - bracket.quickDeduction;
      return {
        iit: Math.max(0, Math.round(iit)),
        marginalRate: bracket.rate,
        bracketLevel: bracket.level,
      };
    }
  }

  // Fallback for top tier
  const top = CHINA_IIT_BRACKETS[CHINA_IIT_BRACKETS.length - 1];
  return {
    iit: Math.max(0, Math.round(taxableRMB * top.rate - top.quickDeduction)),
    marginalRate: top.rate,
    bracketLevel: top.level,
  };
}

/**
 * Calculates tax on Annual One-off Bonus using the preferential separate calculation method
 * (Policy extended through Dec 31, 2027 by STA Announcement No. 30/2023)
 */
export function calculateAnnualOneOffBonusIIT(bonusRMB: number): { bonusIIT: number; applicableRate: number } {
  if (bonusRMB <= 0) return { bonusIIT: 0, applicableRate: 0 };

  const monthlyEquivalent = bonusRMB / 12;
  const annualEquivalent = monthlyEquivalent * 12; // Same as bonusRMB, checked against annual bracket

  for (const bracket of CHINA_IIT_BRACKETS) {
    if (annualEquivalent <= bracket.maxAnnualIncome) {
      const bonusIIT = Math.max(0, bonusRMB * bracket.rate - bracket.quickDeduction);
      return {
        bonusIIT: Math.round(bonusIIT),
        applicableRate: bracket.rate,
      };
    }
  }

  const top = CHINA_IIT_BRACKETS[CHINA_IIT_BRACKETS.length - 1];
  return {
    bonusIIT: Math.max(0, Math.round(bonusRMB * top.rate - top.quickDeduction)),
    applicableRate: top.rate,
  };
}

/**
 * Main IIT Calculation Engine for China Expatriate and Resident Taxation
 */
export function calculateExpatIIT(params: {
  incomePeriod: IncomePeriod;
  grossAmount: number; // in current currency
  currency: CurrencyCode;
  cityId: string;
  socialSecurityMode: SocialSecurityMode;
  biaItems: ExpatBIAItems; // in current currency
  annualBonus: number; // in current currency
  customExchangeRate?: number;
}): IITCalculationResult {
  const {
    incomePeriod,
    grossAmount,
    currency,
    cityId,
    socialSecurityMode,
    biaItems,
    annualBonus,
    customExchangeRate,
  } = params;

  const rateToRMB = customExchangeRate || CURRENCY_RATES[currency]?.rateToRMB || 1;

  // Convert inputs to RMB
  const rawGrossRMB = grossAmount * rateToRMB;
  const annualBonusRMB = annualBonus * rateToRMB;

  // Annualized gross base salary
  const annualizedGrossBaseRMB = incomePeriod === 'monthly' ? rawGrossRMB * 12 : rawGrossRMB;
  const monthlyGrossBaseRMB = incomePeriod === 'monthly' ? rawGrossRMB : rawGrossRMB / 12;

  // Sum annual BIA (converted to RMB)
  const monthlyBIAInput = (Object.values(biaItems) as number[]).reduce((sum: number, val: number) => sum + (Number(val) || 0), 0);
  const annualizedBIARMB = (incomePeriod === 'monthly' ? monthlyBIAInput * 12 : monthlyBIAInput) * rateToRMB;

  // Find city configuration for social security caps
  const city = CITIES_CONFIG.find((c) => c.id === cityId) || CITIES_CONFIG[0];

  // Calculate monthly employee and employer social security
  let monthlySSEmployeeRMB = 0;
  let monthlySSEmployerRMB = 0;

  if (socialSecurityMode === 'standard') {
    // Clamped between city min and max
    const cappedBase = Math.min(Math.max(monthlyGrossBaseRMB, city.minBase), city.maxBase);
    
    const empTotalRate =
      city.employeeRates.pension +
      city.employeeRates.medical +
      city.employeeRates.unemployment +
      city.employeeRates.housingFund;

    const emprTotalRate =
      city.employerRates.pension +
      city.employerRates.medical +
      city.employerRates.unemployment +
      city.employerRates.workInjury +
      city.employerRates.maternity +
      city.employerRates.housingFund;

    monthlySSEmployeeRMB = cappedBase * empTotalRate;
    monthlySSEmployerRMB = cappedBase * emprTotalRate;
  }

  const annualSSEmployeeRMB = monthlySSEmployeeRMB * 12;
  const annualSSEmployerRMB = monthlySSEmployerRMB * 12;

  // Standard deduction 60,000 RMB / year
  const standardDeductionRMB = STANDARD_ANNUAL_THRESHOLD_RMB;

  // Annual Taxable Income
  const annualTaxableIncomeRMB = Math.max(
    0,
    annualizedGrossBaseRMB - annualSSEmployeeRMB - annualizedBIARMB - standardDeductionRMB
  );

  // Calculate Comprehensive IIT
  const { iit: annualComprehensiveIITRMB, marginalRate } = calculateAnnualIITFromTaxable(annualTaxableIncomeRMB);

  // Calculate Annual Bonus IIT (preferential separate tax)
  const { bonusIIT: annualBonusIITRMB } = calculateAnnualOneOffBonusIIT(annualBonusRMB);

  const totalAnnualIITRMB = annualComprehensiveIITRMB + annualBonusIITRMB;

  // Total gross including bonus
  const totalAnnualGrossRMB = annualizedGrossBaseRMB + annualBonusRMB;

  // Net Pay in RMB
  const totalAnnualNetPayRMB = Math.max(
    0,
    totalAnnualGrossRMB - annualSSEmployeeRMB - totalAnnualIITRMB
  );

  // Total Cost to Employer
  const totalAnnualEmployerCostRMB = totalAnnualGrossRMB + annualSSEmployerRMB;

  // Calculate counterfactual tax without BIA for savings visualization
  const taxableWithoutBIARMB = Math.max(
    0,
    annualizedGrossBaseRMB - annualSSEmployeeRMB - standardDeductionRMB
  );
  const { iit: taxWithoutBIAComprehensiveRMB } = calculateAnnualIITFromTaxable(taxableWithoutBIARMB);
  const taxWithoutBIARMB = taxWithoutBIAComprehensiveRMB + annualBonusIITRMB;
  const taxSavingsFromBIARMB = Math.max(0, taxWithoutBIARMB - totalAnnualIITRMB);

  // Effective rates
  const effectiveTaxRate = totalAnnualGrossRMB > 0 ? totalAnnualIITRMB / totalAnnualGrossRMB : 0;
  const netTakeHomePercentage = totalAnnualGrossRMB > 0 ? totalAnnualNetPayRMB / totalAnnualGrossRMB : 0;

  // Convert back to selected currency
  const annualNetPay = totalAnnualNetPayRMB / rateToRMB;
  const monthlyNetPay = annualNetPay / 12;
  const annualIIT = totalAnnualIITRMB / rateToRMB;
  const monthlyIIT = annualIIT / 12;
  const annualSocialSecurityEmployee = annualSSEmployeeRMB / rateToRMB;
  const monthlySocialSecurityEmployee = annualSocialSecurityEmployee / 12;
  const annualBIA = annualizedBIARMB / rateToRMB;
  const annualEmployerCost = totalAnnualEmployerCostRMB / rateToRMB;
  const taxSavingsFromBIA = taxSavingsFromBIARMB / rateToRMB;

  // Compute 1~12 month cumulative withholding schedule
  const withholdingSchedule = calculateCumulativeMonthlyWithholding({
    monthlyGrossRMB: rawGrossRMB,
    monthlySSRMB: monthlySSEmployeeRMB,
    monthlyBIARMB: annualizedBIARMB / 12,
    annualTuitionRMB: biaItems.childrenEducation * 12,
    rateToRMB,
    currency,
  });

  return {
    currency,
    incomePeriod,
    grossIncome: grossAmount,
    grossIncomeRMB: rawGrossRMB,
    annualBonus,
    annualBonusRMB,

    totalAnnualGrossRMB,
    totalAnnualBIARMB: annualizedBIARMB,
    totalAnnualSocialSecurityEmployeeRMB: annualSSEmployeeRMB,
    totalAnnualStandardDeductionRMB: standardDeductionRMB,

    annualTaxableIncomeRMB,
    annualComprehensiveIITRMB,
    annualBonusIITRMB,
    totalAnnualIITRMB,

    totalAnnualNetPayRMB,
    totalAnnualEmployerCostRMB,
    totalAnnualEmployerSSRMB: annualSSEmployerRMB,

    effectiveTaxRate,
    marginalTaxBracket: marginalRate,
    netTakeHomePercentage,

    annualNetPay,
    monthlyNetPay,
    annualIIT,
    monthlyIIT,
    annualSocialSecurityEmployee,
    monthlySocialSecurityEmployee,
    annualBIA,
    annualEmployerCost,

    taxWithoutBIARMB,
    taxSavingsFromBIARMB,
    taxSavingsFromBIA,

    monthlySchedule: withholdingSchedule.monthlySchedule,
    withholdingSummary: withholdingSchedule,
  };
}

/**
 * 中国居民个人综合所得工资薪金累计预扣预缴法精密推演引擎
 * 依据: 国家税务总局公告2018年第56号
 */
export function calculateCumulativeMonthlyWithholding(params: {
  monthlyGrossRMB: number;
  monthlySSRMB: number;
  monthlyBIARMB: number;
  lumpyTuitionMode?: boolean;
  annualTuitionRMB?: number;
  rateToRMB: number;
  currency: CurrencyCode;
}): CumulativeWithholdingSummary {
  const {
    monthlyGrossRMB,
    monthlySSRMB,
    monthlyBIARMB,
    lumpyTuitionMode = false,
    annualTuitionRMB = 0,
    rateToRMB,
  } = params;

  const schedule: MonthlyPayrollScheduleItem[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let runningCumGross = 0;
  let runningCumSS = 0;
  let runningCumBIA = 0;
  let priorMonthsTaxWithheld = 0;
  let lastBracketLevel = 1;

  for (let m = 1; m <= 12; m++) {
    // 处理学费波段申报: 1月和8月分批各冲销50%，其余月份平摊
    let curMonthBIARMB = monthlyBIARMB;
    if (lumpyTuitionMode && annualTuitionRMB > 0) {
      const baseMonthlyBIAWithoutTuition = Math.max(0, monthlyBIARMB - annualTuitionRMB / 12);
      curMonthBIARMB = baseMonthlyBIAWithoutTuition + (m === 1 || m === 8 ? annualTuitionRMB / 2 : 0);
    }

    runningCumGross += monthlyGrossRMB;
    runningCumSS += monthlySSRMB;
    runningCumBIA += curMonthBIARMB;
    const cumStandardDeductionRMB = m * 5000;

    // 累计应纳税所得额
    const cumTaxableIncomeRMB = Math.max(
      0,
      runningCumGross - runningCumSS - runningCumBIA - cumStandardDeductionRMB
    );

    // 查年税率表计算累计应纳税额
    const { iit: cumTaxLiabilityRMB, marginalRate, bracketLevel } = calculateAnnualIITFromTaxable(cumTaxableIncomeRMB);

    // 当月应预扣个税
    const taxWithheldRMB = Math.max(0, cumTaxLiabilityRMB - priorMonthsTaxWithheld);
    priorMonthsTaxWithheld = cumTaxLiabilityRMB;

    // 判定是否在当月跨入更高税阶
    const bracketJumped = m > 1 && bracketLevel > lastBracketLevel;
    const previousRate = schedule[m - 2]?.currentMarginalRate;
    lastBracketLevel = bracketLevel;

    // 当月到手净现金
    const netPayRMB = Math.max(0, monthlyGrossRMB - monthlySSRMB - taxWithheldRMB);

    schedule.push({
      month: m,
      monthName: monthNames[m - 1],
      grossIncomeRMB: monthlyGrossRMB,
      grossIncome: monthlyGrossRMB / rateToRMB,
      socialSecurityEmployeeRMB: monthlySSRMB,
      standardDeductionRMB: 5000,
      biaDeductionRMB: curMonthBIARMB,
      cumGrossRMB: runningCumGross,
      cumSocialSecurityRMB: runningCumSS,
      cumStandardDeductionRMB,
      cumBIARMB: runningCumBIA,
      cumTaxableIncomeRMB,
      cumTaxLiabilityRMB,
      currentMarginalRate: marginalRate,
      currentBracketLevel: bracketLevel,
      bracketJumpedThisMonth: bracketJumped,
      previousBracketRate: previousRate,
      taxWithheldRMB,
      taxWithheld: taxWithheldRMB / rateToRMB,
      netPayRMB,
      netPay: netPayRMB / rateToRMB,
    });
  }

  const sortedByNet = [...schedule].sort((a, b) => b.netPayRMB - a.netPayRMB);
  const highest = sortedByNet[0];
  const lowest = sortedByNet[sortedByNet.length - 1];
  const swingRMB = highest.netPayRMB - lowest.netPayRMB;
  const swingPct = highest.netPayRMB > 0 ? (lowest.netPayRMB - highest.netPayRMB) / highest.netPayRMB : 0;

  const bracketJumps = schedule
    .filter(s => s.bracketJumpedThisMonth)
    .map(s => ({
      month: s.month,
      monthName: s.monthName,
      fromRate: s.previousBracketRate || 0.03,
      toRate: s.currentMarginalRate,
    }));

  return {
    monthlySchedule: schedule,
    highestNetMonth: { month: highest.month, monthName: highest.monthName, netPay: highest.netPay },
    lowestNetMonth: { month: lowest.month, monthName: lowest.monthName, netPay: lowest.netPay },
    monthlySwingRMB: swingRMB,
    monthlySwingPct: swingPct,
    bracketJumpMonths: bracketJumps,
  };
}

/**
 * 房东加收发票税点成本与净节税收益推演引擎
 */
export function calculateLandlordFapiaoAnalysis(params: {
  monthlyRentRMB: number;
  surchargeRatePct: number;
  marginalRate: number;
}): LandlordFapiaoAnalysis {
  const { monthlyRentRMB, surchargeRatePct, marginalRate } = params;
  const annualRentRMB = monthlyRentRMB * 12;
  const annualSurchargeCostRMB = annualRentRMB * (surchargeRatePct / 100);
  const grossTaxSavingsRMB = annualRentRMB * marginalRate;
  const netBenefitRMB = grossTaxSavingsRMB - annualSurchargeCostRMB;
  const roiPct = annualSurchargeCostRMB > 0 ? (netBenefitRMB / annualSurchargeCostRMB) * 100 : 0;

  return {
    surchargeRatePct,
    annualRentRMB,
    annualSurchargeCostRMB,
    grossTaxSavingsRMB,
    netBenefitRMB,
    roiPct,
    isWorthIt: netBenefitRMB > 0,
  };
}

/**
 * Format currency with proper symbols and thousand delimiters
 */
export function formatMoney(amount: number, currency: CurrencyCode = 'RMB', showDecimals = false): string {
  const symbol = CURRENCY_RATES[currency]?.symbol || '¥';
  const formatted = Math.round(amount).toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format percentage with 1 decimal
 */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Greater Bay Area 15% Subsidy Calculator
 * Government Subsidy = Actual IIT Paid - (Taxable Income * 15%)
 * Maximum capped at RMB 5,000,000 per person per year.
 */
export function calculateGBASubsidy(actualIITPaidRMB: number, taxableIncomeRMB: number): {
  subsidyRMB: number;
  cappedSubsidyRMB: number;
  effectiveRateBefore: number;
  effectiveRateAfter: number;
  isEligible: boolean;
} {
  const theoretical15PercentIIT = taxableIncomeRMB * 0.15;
  const rawSubsidy = Math.max(0, actualIITPaidRMB - theoretical15PercentIIT);
  const cappedSubsidy = Math.min(rawSubsidy, 5000000); // 5 Million RMB cap
  
  const effectiveRateBefore = taxableIncomeRMB > 0 ? actualIITPaidRMB / taxableIncomeRMB : 0;
  const finalIIT = Math.max(0, actualIITPaidRMB - cappedSubsidy);
  const effectiveRateAfter = taxableIncomeRMB > 0 ? finalIIT / taxableIncomeRMB : 0;

  return {
    subsidyRMB: Math.round(rawSubsidy),
    cappedSubsidyRMB: Math.round(cappedSubsidy),
    effectiveRateBefore,
    effectiveRateAfter,
    isEligible: rawSubsidy > 0,
  };
}
