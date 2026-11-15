import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  CHINA_IIT_BRACKETS,
  CITIES_CONFIG,
  GBA_CITIES,
  RELOCATION_MODELS,
  calculateAnnualIITFromTaxable,
  calculateAnnualOneOffBonusIIT,
  calculateExpatIIT,
  calculateGBASubsidy,
  calculateLandlordFapiaoAnalysis,
} from '../dist/esm/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/cjs/index.cjs');

const ZERO_BIA = {
  housingRental: 0,
  childrenEducation: 0,
  languageTraining: 0,
  homeLeaveFlights: 0,
  mealAllowance: 0,
  laundryCost: 0,
  relocationMoving: 0,
  businessTravelPerDiem: 0,
};

test('dataset constants match statutory China IIT configuration', () => {
  assert.equal(CHINA_IIT_BRACKETS.length, 7);
  assert.equal(CITIES_CONFIG.length, 6);
  assert.equal(GBA_CITIES.length, 9);
  assert.equal(RELOCATION_MODELS.length, 7);
});

test('calculateAnnualIITFromTaxable handles zero and progressive brackets', () => {
  assert.deepEqual(calculateAnnualIITFromTaxable(0), { iit: 0, marginalRate: 0, bracketLevel: 0 });
  assert.deepEqual(calculateAnnualIITFromTaxable(36000), { iit: 1080, marginalRate: 0.03, bracketLevel: 1 });
  assert.deepEqual(calculateAnnualIITFromTaxable(144000), { iit: 11880, marginalRate: 0.1, bracketLevel: 2 });
  assert.deepEqual(calculateAnnualIITFromTaxable(1000000), { iit: 268080, marginalRate: 0.45, bracketLevel: 7 });
});

test('calculateAnnualOneOffBonusIIT uses preferential separate tax schedule', () => {
  const b1 = calculateAnnualOneOffBonusIIT(36000);
  assert.equal(b1.bonusIIT, 1080);
  assert.equal(b1.applicableRate, 0.03);

  const b2 = calculateAnnualOneOffBonusIIT(144000);
  assert.equal(b2.bonusIIT, 11880);
  assert.equal(b2.applicableRate, 0.1);
});

test('calculateExpatIIT computes BIA savings and 12-month cumulative schedule', () => {
  const res = calculateExpatIIT({
    incomePeriod: 'monthly',
    grossAmount: 40000,
    currency: 'RMB',
    cityId: 'shanghai',
    socialSecurityMode: 'exempt',
    biaItems: { ...ZERO_BIA, housingRental: 10000, mealAllowance: 2000 },
    annualBonus: 80000,
  });
  assert.equal(res.totalAnnualGrossRMB, 560000);
  assert.equal(res.totalAnnualBIARMB, 144000);
  assert.equal(res.totalAnnualSocialSecurityEmployeeRMB, 0);
  assert.ok(res.taxSavingsFromBIARMB > 0);
  assert.equal(res.monthlySchedule.length, 12);
});

test('calculateExpatIIT clamps social security at city 3x cap in standard mode', () => {
  const res = calculateExpatIIT({
    incomePeriod: 'monthly',
    grossAmount: 100000,
    currency: 'RMB',
    cityId: 'beijing',
    socialSecurityMode: 'standard',
    biaItems: ZERO_BIA,
    annualBonus: 0,
  });
  // Beijing maxBase = 35283, employee rate = 0.08 + 0.02 + 0.005 = 0.105
  assert.equal(Math.round(res.totalAnnualSocialSecurityEmployeeRMB), Math.round(35283 * 0.105 * 12));
});

test('calculateGBASubsidy caps at 5,000,000 RMB', () => {
  const gba = calculateGBASubsidy(8000000, 20000000);
  // 20M * 15% = 3M -> raw = 5M -> capped at 5M
  assert.equal(gba.cappedSubsidyRMB, 5000000);
  assert.equal(gba.isEligible, true);

  const low = calculateGBASubsidy(10000, 100000);
  assert.equal(low.isEligible, false);
  assert.equal(low.cappedSubsidyRMB, 0);
});

test('calculateLandlordFapiaoAnalysis computes positive/negative ROI', () => {
  const analysis = calculateLandlordFapiaoAnalysis({
    monthlyRentRMB: 10000,
    surchargeRatePct: 5,
    marginalRate: 0.25,
  });
  assert.equal(analysis.annualRentRMB, 120000);
  assert.equal(analysis.annualSurchargeCostRMB, 6000);
  assert.equal(analysis.grossTaxSavingsRMB, 30000);
  assert.equal(analysis.netBenefitRMB, 24000);
  assert.equal(analysis.isWorthIt, true);
});

test('CJS export parity check', () => {
  assert.equal(typeof cjs.calculateExpatIIT, 'function');
  assert.equal(cjs.CITIES_CONFIG.length, 6);
});
