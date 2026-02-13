# Policy Flight Simulator - Architectural Assumptions & Design Decisions

> v0.1 Core Engine - Documented Assumptions

---

## 1. Income Distribution Model

### Assumption
We use a **4-persona uniform distribution** for calculating aggregate income tax:
- Starter: $20,000 (25% of population)
- Professional: $50,000 (25% of population)
- Manager: $100,000 (25% of population)
- Executive: $200,000 (25% of population)

### Rationale
- Real income distribution is heavily skewed (Pareto), but accurately modeling it requires detailed economic data
- For v0.1 educational purposes, equal weighting provides a simple, transparent approximation
- The 4 income levels span the tax bracket range, illustrating mechanic diversity

### Limitations
- Does NOT reflect actual US income distribution (which is right-skewed: ~50% earn <$35k)
- Does NOT account for household vs. individual income
- Does NOT include unemployed, retired, or non-earning adults

### Future (v0.2+)
- Add configurable `incomeDistribution` parameter for empirical data
- Allow input of mean/median income for Pareto approximation
- Compare scenarios against real Census Bureau data

---

## 2. Welfare Savings Credit

### Assumption
A fixed **$630 billion** annual welfare savings credit is included as revenue.

### Rationale
- This represents efficiency gains from consolidating existing means-tested programs into UBI
- Assumes programs like SNAP, housing assistance, EITC, etc., can be partially replaced
- $630B is approximately 1/4 of current federal welfare spending (~$2.4T)
- Treated as exogenous (not modeled dynamically)

### Limitations
- Does NOT calculate actual replacement rates (varies by program)
- Does NOT account for behavioral changes in take-up rates
- Does NOT include transition costs or administrative savings
- Assumes perfect consolidation efficiency

### Future (v0.2+)
- Add parameter `welfareSavingRate` (0.0–1.0) to adjust credit dynamically
- Calculate from basket of specific programs instead of lump sum
- Add transition cost modeling

---

## 3. Electronic Flow Base & Token Tax

### Assumption
An annual **$1 quadrillion ($1e15)** electronic payment flow base is taxed at the token tax rate.

### Rationale
- Represents aggregate annual value of digital transactions (cards, transfers, digital currencies)
- 2024 US electronic transaction volume was ~$40 trillion in payment transactions + much larger derivatives/financial flows
- $1 quadrillion is conservative estimate of total digital value transfer
- Token tax is treated as a Tobin-tax-like financial transaction tax

### Limitations
- Does NOT model actual current electronic flow (real data varies widely by source)
- Does NOT account for capital flight or market evasion responses
- Does NOT distinguish between productive vs. speculative transactions
- Assumes tax rate can be set freely without behavioral response

### Future (v0.2+)
- Add `flowBaseAnnual` as user-adjustable slider (currently constant)
- Model elasticity: higher tax rates → lower flow (behavioral response)
- Add warnings when tax rate would cause significant capital flight

---

## 4. Income Tax Brackets

### Assumption
- **Tier 1**: $60,001 – $135,000 @ 19% marginal rate
- **Tier 2**: $135,001+ @ 29% marginal rate
- **Below $60,000**: 0% income tax

### Rationale
- $60k breakout point chosen to align with UBI benefit taper (see Supplement Curve)
- Tier 1 rate (19%) is approximate US average combined federal/state rate
- Tier 2 rate (29%) is approximate high-income effective rate
- No tax below breakout means full incentive for early earnings

### Limitations
- Does NOT model FICA (Social Security/Medicare) taxes
- Does NOT include state income taxes (tax system is federal-only in this model)
- Does NOT include deductions, credits, or phase-outs
- Does NOT account for capital gains vs. ordinary income (all "earned income" treated equally)

### Design Note
- `tier1Start: 60000` means the first dollar AT $60,001 is taxable (standard inclusive/exclusive bracket convention)
- Calculation: `taxable = earnedIncome - tier1Start` for amounts in tier 1

---

## 5. Supplement Curve ("Floor & Launchpad")

### Assumption
The supplement function is:
```
- Earned income $0 to $24k: Linear increase from $0 to $6,000 bonus
- Earned income $24k to $60k: Linear taper at -$0.16 per $1 earned
- Earned income $60k+: $0 supplement
```

### Rationale
- **Apex at $24k**: Encourages part-time work; lower earnings still receive strong support
- **Bonus of $6k**: Adds meaningful supplement to UBI for low earners
- **Taper slope of -0.16**: 16¢ reduction per $1 earned (gentler than traditional welfare cliffs which are often 0.5–1.0)
- **Breakout at $60k**: Aligns with tax bracket threshold; full self-sufficiency point

### Limitations
- **Taper doesn't hit exactly $0**: At $60k, supplement ≈ $240 (due to slope -0.16 * 36k income span ≠ 6k perfectly)
  - This is intentional: smooth taper is preferred over artificial cliff at breakout
- Does NOT model behavioral labor supply responses (people might work less with high supplement)
- Does NOT account for childcare, disability, or other adjustment factors

### Edge Cases Handled
- ✅ Supplement never goes negative (clamped to 0)
- ✅ Net income always increases with earned income (verified in tests)
- ✅ No sudden drops or cliffs

### Future (v0.2+)
- Make apex income, bonus, and slope fully adjustable by user
- Add UI preview showing supplement at different income levels
- Model labor supply elasticity (how much people work in response to incentives)

---

## 6. UBI Cost Calculation

### Assumption
Total annual UBI cost = `ubiAnnualPerAdult × adultPopulation`

### Rationale
- Default: $12,000/person × 265 million adults = $3.18 trillion annually
- Assumes universal coverage (no means-testing or age restrictions)
- Assumes all adults receive identical payment (no family adjustments)

### Limitations
- Does NOT account for living cost differences (regional variation)
- Does NOT include children or dependents
- Does NOT include immigration/emigration dynamics
- Assumes stable population (no birth/death modeling)

### Future (v0.2+)
- Add regional cost-of-living adjustment multipliers
- Option to include children (at lower per-child rate)
- Sensitivity analysis on population size

---

## 7. Government Operating Requirement

### Assumption
A fixed **$2.74 trillion** annual government cost for operations (defense, infrastructure, courts, etc.).

### Rationale
- Roughly represents current US federal non-entitlement spending (excluding Social Security, Medicare, Medicaid)
- Assumption: this cost does NOT change with UBI implementation
- Treated as exogenous constraint

### Limitations
- Does NOT model how govt operations scale with economy
- Does NOT account for UBI's potential economic stimulus effects
- Does NOT adjust for inflation or productivity changes
- Assumes perfect funding without deficit

### Future (v0.2+)
- Add scaling factor (e.g., 2–3% of GDP for developed economies)
- Model how UBI might reduce certain costs (criminal justice, healthcare admin, poverty programs)

---

## 8. Solvency Definition

### Assumption
Budget is **solvent** if: `totalRevenue ≥ totalObligations`

Where:
- `totalRevenue = tokenTaxRevenue + incomeTaxRevenue + welfareSavingsCredit`
- `totalObligations = ubiCost + govtOperatingRequirement`

### Rationale
- Simple break-even criterion; 0% deficit/surplus
- Does NOT require balanced budget surpluses (no emergency fund modeling)

### Limitations
- Does NOT account for debt servicing (assumes zero national debt)
- Does NOT distinguish between structural vs. cyclical deficits
- Does NOT model inflation or real vs. nominal values
- Assumes all revenue sources are stable and reliable

### Future (v0.2+)
- Add debt-to-GDP ratio modeling
- Allow configurable "required surplus %" for emergency buffer
- Separate analysis of different revenue sources' stability

---

## 9. Persona Selection

### Assumption
Four fixed personas represent income distribution:
- **Starter** ($20k): Part-time, gig, or entry-level work
- **Professional** ($50k): Mid-level full-time employment
- **Manager** ($100k): Senior/leadership positions
- **Executive** ($200k): High-income earners

### Rationale
- Spans full range of tax brackets and supplement impacts
- Simple for UI display and narrative framing
- Allows comparison across work/income levels

### Limitations
- Does NOT represent actual occupational distribution
- Does NOT include unemployment, disability, or non-earning scenarios
- **Does NOT show median/mean actual earnings** (just illustrative buckets)
- Personas are static; no demographic attributes

### Future (v0.2+)
- Allow custom persona definitions
- Add unemployment/non-earning persona
- Include demographic factors (age, household size, region)

---

## 10. Tax Calculation Simplifications

### Assumption
- Income tax is calculated on earned income ONLY
- UBI and supplement do NOT generate additional income tax
- Tax brackets apply sequentially (first $60k untaxed, next $75k @ 19%, etc.)

### Rationale
- Simpler model (UBI as transfer, not taxable income)
- Politically realistic (government wouldn't create "taxing benefits" mechanism)
- Avoids double-taxation conceptually

### Limitations
- Does NOT match actual tax code (all income typically taxable)
- Does NOT account for Alternative Minimum Tax
- Does NOT model effective vs. marginal rates for high earners
- Does NOT include self-employment tax

### Future (v0.2+)
- Model option to make UBI/supplement taxable
- Show both "gross" and "after-tax" net income scenarios
- Add AMT impact for high earners

---

## 11. Aggregate Income Tax Methodology

### Assumption
Aggregate income tax = `(average tax per persona) × total adult population`

Where `average tax per persona = sum of persona taxes ÷ 4`

### Rationale
- Simple, transparent; easy to audit
- Avoids need for detailed income distribution data in v0.1
- Scales linearly with population

### Limitations
- **Assumes equal distribution** of population across persona income levels
- Does NOT account for income concentration (1% earning 40% of income)
- **Underestimates taxes** if real distribution is right-skewed
- **Overestimates taxes** if real distribution is left-skewed

### Accuracy Impact
- Real US distribution: ~50% earn <$35k, ~10% earn >$100k
- Our model: 50% earn <$60k, 25% earn >$100k
- Result: Our model likely **UNDERESTIMATES income tax revenue** by ~15–25%

### Future (v0.2+)
- Input real income distribution (CSV upload or parameterized Lorenz curve)
- Use empirical wage data to generate synthetic population
- Sensitivity analysis: show results under different distributions

---

## 12. Warnings & Diagnostics

### Current Warnings
1. **Token tax rate > 0.8%**: Flags capital flight risk
2. **UBI > $18k**: Flags affordability concern
3. **Budget deficit**: Shows deficit amount and % of revenue

### Rationale
- Thresholds are conservative/educational (not based on econometric evidence)
- Warnings are informational, not prescriptive

### Limitations
- **Do NOT model actual behavioral responses** (no elasticity)
- **Are not based on empirical data** (thresholds are arbitrary)
- **Do NOT account for implementation details** (transition, exemptions, evasion)

### Future (v0.2+)
- Calibrate warning thresholds against economic literature
- Add warnings for supplement cliffs or tax cliff interactions
- Show estimated impact of behavioral responses (citations to studies)

---

## 13. What's NOT Included (Intentionally Out of Scope)

❌ **Macroeconomic feedback loops**
- No GDP growth modeling
- No inflation effects
- No multiplier analysis (how UBI spending stimulates economy)

❌ **Behavioral responses**
- Labor supply elasticity (people work less with UBI)
- Capital flight (avoidance of token tax)
- Tax evasion or avoidance strategies

❌ **Sectoral impacts**
- Industry-specific effects (e.g., minimum wage workers)
- Regional variation (cost of living, wages)
- International effects (trade, currency)

❌ **Distributional analysis**
- Inequality metrics (Gini, percentile ratios)
- Poverty reduction statistics
- Racial/gender/demographic impacts

❌ **Transition & implementation**
- Phase-in costs
- Political feasibility
- Administrative overhead
- Interaction with existing programs

---

## Summary: Model Complexity vs. Accuracy Trade-off

| Aspect | Complexity | Accuracy | Notes |
|--------|------------|----------|-------|
| Income distribution | Low | Moderate | Equal weighting; 4 personas |
| Tax brackets | Low | High | Simplified but accurate |
| Supplement curve | Medium | High | Smooth, well-defined |
| Aggregate tax | Low | Low-Moderate | Persona average method |
| Solvency | Low | Medium | Break-even only; no debt/inflation |
| Behavioral response | None | None | Explicitly excluded for v0.1 |

**Conclusion**: v0.1 prioritizes **transparency and simplicity** over econometric precision. Good for education and exploration; not suitable for policy recommendations without validation against real data.

---

## Revision History

- **v0.1** (2026-02-11): Initial assumptions documented
- **v0.2** (TBD): Will add income distribution parameter, adjust tax aggregation
- **v0.3** (TBD): Will add behavioral modeling and empirical validation

---

*For questions or corrections to these assumptions, please open an issue in the project repository.*
