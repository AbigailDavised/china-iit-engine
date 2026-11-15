# china-iit-engine

Zero-dependency TypeScript engine for **China Individual Income Tax (IIT)** modeling (2026–2027), supporting resident & expatriate payroll calculations, annual one-off bonus separate taxation (extended through Dec 31, 2027), 6-city statutory social security caps, Benefits-in-Kind (BIA) tax savings, 12-month cumulative withholding schedules, and the Greater Bay Area (GBA) 15% IIT subsidy.

- **Interactive Web Calculator**: [ChinaTaxCalc.com](https://chinataxcalc.com/calculator)
- **Expat Tax-Free Allowances (BIA) Guide**: [chinataxcalc.com/expat-allowances](https://chinataxcalc.com/expat-allowances)
- **183-Day Residency & 6-Year Rule**: [chinataxcalc.com/183-day-rule](https://chinataxcalc.com/183-day-rule)
- **Annual Bonus Preferential Tax Guide**: [chinataxcalc.com/annual-bonus](https://chinataxcalc.com/annual-bonus)
- **Social Security (五险一金) Foreign Exemption**: [chinataxcalc.com/social-security](https://chinataxcalc.com/social-security)
- **Offline Browser Calculator (GitHub Pages)**: [abigaildavised.github.io/china-iit-engine](https://abigaildavised.github.io/china-iit-engine/)

## Installation

```bash
npm install china-iit-engine
```

## Usage

```ts
import { calculateExpatIIT, calculateGBASubsidy } from 'china-iit-engine';

const result = calculateExpatIIT({
  incomePeriod: 'monthly',
  grossAmount: 45000,
  currency: 'RMB',
  cityId: 'shanghai',
  socialSecurityMode: 'exempt',
  biaItems: {
    housingRental: 12000,
    childrenEducation: 0,
    languageTraining: 0,
    homeLeaveFlights: 0,
    mealAllowance: 2000,
    laundryCost: 0,
    relocationMoving: 0,
    businessTravelPerDiem: 0,
  },
  annualBonus: 90000,
});

console.log({
  annualNetPayRMB: result.totalAnnualNetPayRMB,
  annualIITRMB: result.totalAnnualIITRMB,
  biaTaxSavingsRMB: result.taxSavingsFromBIARMB,
  effectiveRate: result.effectiveTaxRate,
});

const gba = calculateGBASubsidy(result.totalAnnualIITRMB, result.annualTaxableIncomeRMB);
console.log(gba);
```

## Included Modules & Data

- `CHINA_IIT_BRACKETS`: 7-tier progressive annual comprehensive IIT brackets (3% to 45%) with quick deductions.
- `CITIES_CONFIG`: Statutory social security base floors, 3x caps, and employee/employer contribution rates for Shanghai, Beijing, Shenzhen, Guangzhou, Hangzhou, and Chengdu.
- `GBA_CITIES`: 9 Greater Bay Area municipalities offering the 15% IIT ceiling subsidy (up to RMB 5,000,000/year).
- `RELOCATION_MODELS`: Cross-border effective tax & cost-of-living comparison models for US (CA/NY/TX), UK (London), Germany, Singapore, and Hong Kong SAR.
- `calculateCumulativeMonthlyWithholding`: Month-by-month cumulative withholding breakdown with tax bracket jump detection.
- `calculateLandlordFapiaoAnalysis`: Break-even ROI analysis for rental invoice (fapiao) tax surcharges vs BIA tax savings.

## License

MIT — Maintained by [Abigail Davis](https://github.com/AbigailDavised) (`abigaild@agentmail.to`) for [ChinaTaxCalc.com](https://chinataxcalc.com).
