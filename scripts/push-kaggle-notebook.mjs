import fs from 'node:fs';

const { username, key } = JSON.parse(fs.readFileSync('E:/Soft/key/kaggle.json', 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${username}:${key}`).toString('base64');

const DATASET_REF = `${username}/china-iit-expat-tax-benchmark-2026-2027`;
const KERNEL_SLUG = `${username}/china-iit-expat-tax-benchmark-eda-2026-2027`;

const notebook = {
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {
    kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
    language_info: { name: 'python', version: '3.10.12' },
  },
  cells: [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '# 2026–2027 China IIT, Social Security Caps & GBA 15% Subsidy EDA\n\n',
        'Exploratory analysis of China Individual Income Tax brackets, 6-city statutory social security caps, Expat Benefits-in-Kind (BIA) tax savings, and Greater Bay Area (GBA) 15% subsidy effects.\n\n',
        '- Interactive Calculator: [ChinaTaxCalc.com](https://chinataxcalc.com/calculator)\n',
        '- Expat BIA Allowances Guide: [chinataxcalc.com/expat-allowances](https://chinataxcalc.com/expat-allowances)\n',
        '- Offline Browser Calculator: [GitHub Pages](https://abigaildavised.github.io/china-iit-engine/)\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        'from pathlib import Path\n',
        'import pandas as pd\n',
        'import matplotlib.pyplot as plt\n\n',
        'BASE = next(Path("/kaggle/input").rglob("china_iit_brackets_2026_2027.csv")).parent\n',
        'brackets = pd.read_csv(BASE / "china_iit_brackets_2026_2027.csv")\n',
        'cities = pd.read_csv(BASE / "china_city_social_security_caps_2026_2027.csv")\n',
        'gba = pd.read_csv(BASE / "china_gba_15pct_subsidy_cities.csv")\n\n',
        'print(f"Loaded {len(brackets)} IIT brackets, {len(cities)} city SS configs, {len(gba)} GBA hubs.")\n',
        'display(brackets)\n',
        'display(cities[["city_name", "avg_monthly_wage_rmb", "max_base_3x_rmb", "employee_total_rate", "employer_total_rate"]])\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        'def calc_iit(taxable):\n',
        '    if taxable <= 0: return 0\n',
        '    for _, r in brackets.iterrows():\n',
        '        hi = float("inf") if str(r["max_annual_income_rmb"]) == "Infinity" else float(r["max_annual_income_rmb"])\n',
        '        if taxable <= hi:\n',
        '            return max(0, taxable * float(r["tax_rate"]) - float(r["quick_deduction_rmb"]))\n',
        '    return 0\n\n',
        'incomes = list(range(300000, 2100000, 150000))\n',
        'eff_std, eff_bia, eff_gba = [], [], []\n',
        'for inc in incomes:\n',
        '    t_std = calc_iit(max(0, inc - 60000))\n',
        '    t_bia = calc_iit(max(0, inc - 144000 - 60000))\n',
        '    t_gba = min(t_std, max(0, inc - 60000) * 0.15)\n',
        '    eff_std.append(t_std / inc * 100)\n',
        '    eff_bia.append(t_bia / inc * 100)\n',
        '    eff_gba.append(t_gba / inc * 100)\n\n',
        'fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n',
        'axes[0].plot([i/1e4 for i in incomes], eff_std, marker="o", label="Standard IIT")\n',
        'axes[0].plot([i/1e4 for i in incomes], eff_bia, marker="s", label="With 144k RMB/yr Expat BIA")\n',
        'axes[0].plot([i/1e4 for i in incomes], eff_gba, marker="^", label="GBA 15% Ceiling Subsidy")\n',
        'axes[0].set_title("Effective China IIT Rate by Annual Gross (10k RMB)")\n',
        'axes[0].set_xlabel("Annual Gross Income (10k RMB)")\n',
        'axes[0].set_ylabel("Effective Tax Rate (%)")\n',
        'axes[0].legend()\n\n',
        'c_sorted = cities.sort_values("employer_total_rate")\n',
        'axes[1].barh(c_sorted["city_name"], c_sorted["employer_total_rate"] * 100, color="#0f4c81")\n',
        'axes[1].set_title("Employer Statutory Social Security Rate (%) by City")\n',
        'axes[1].set_xlabel("Employer Contribution Rate (%)")\n\n',
        'plt.tight_layout()\n',
        'plt.show()\n',
      ],
    },
  ],
};

const pushRes = await fetch('https://www.kaggle.com/api/v1/kernels/push', {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: KERNEL_SLUG,
    newTitle: 'China IIT & Expat Tax Benchmark EDA (2026-2027)',
    text: JSON.stringify(notebook),
    language: 'python',
    kernelType: 'notebook',
    isPrivate: false,
    enableGpu: false,
    enableTpu: false,
    enableInternet: false,
    datasetDataSources: [DATASET_REF],
    competitionDataSources: [],
    kernelDataSources: [],
  }),
});
const pushText = await pushRes.text();
console.log('[Kaggle] Kernel push:', pushRes.status, pushText);
