# Policy Flight Simulator - v0.1 Math Engine

> Educational simulation for exploring fiscally-solvent UBI + Token Tax models

## ✅ Completed (v0.1)

### Core Logic Engine
- **Token Tax Revenue**: Calculates revenue from electronic flow taxation
- **Income Tax Calculation**: Tiered marginal tax system (Tier 1: 60k-135k @ 19%, Tier 2: 135k+ @ 29%)
- **Supplement Curve**: "Floor & Launchpad" model with smooth taper, no welfare cliffs
- **Persona Outcomes**: Generates outcomes for 4 personas (Starter, Professional, Manager, Executive) at fixed income levels
- **Fiscal Solvency Check**: Compares total revenue vs. total obligations
- **Diagnostics & Warnings**: Provides policy feedback (high tax rates, high UBI, deficits)

### Test Coverage
- **34 unit tests** covering all core functions
- Tests verify default config solvency and expected outputs
- Edge cases validated (zero UBI, high tax rates, deficits, custom parameters)
- All tests passing ✅

### Configuration
- **Default config locked** with spec values:
  - Token tax rate: 0.35%
  - Flow base: $1 quadrillion
  - UBI per adult: $12,000
  - Adult population: 265 million
  - Breakout point: $60,000
  - Supplement curve: peaks at $24k (+$6k bonus), tapers to 0 at $60k

## 📁 Project Structure

```
src/
├── types.ts          # TypeScript interfaces, DEFAULT_CONFIG, PERSONAS
├── engine.ts         # Core math engine functions
└── engine.test.ts    # 34 unit tests

build/
├── tsconfig.json     # TypeScript configuration
├── jest.config.js    # Jest test configuration
├── package.json      # Dependencies and scripts
└── dist/             # Compiled JavaScript output
```

## 🚀 Running the Project

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test          # Run all tests once
npm run test:watch # Run tests in watch mode
```

### Build TypeScript
```bash
npm run build     # Compile to dist/
npm run clean     # Remove dist/ folder
```

## 📊 Key Functions

### `runSimulation(config: PolicyConfig): SimulationResult`
Main entry point. Takes a policy config and returns complete simulation result including:
- Revenue breakdown (token tax, income tax, welfare savings)
- Obligations (UBI cost, govt operating requirement)
- Balance (surplus/deficit, solvency flag)
- Citizen model (supplement function summary, persona outcomes)
- Diagnostics (warnings about policy parameters)

### `calculateTokenTaxRevenue(flowBase, rate): number`
Simple calculation: `flowBase * rate`

### `calculateIncomeTax(earnedIncome, config): number`
Applies tiered rates based on config:
- $0 - $60k: 0% (no tax)
- $60,001 - $135k: 19% marginal
- $135k+: 19% on first bracket + 29% on excess

### `calculateSupplement(earnedIncome, config): number`
Smooth supplement curve:
- At $0: $0 supplement
- At $24k (apex): $6,000 supplement
- At $60k (breakout): $0 supplement
- Tapers linearly, never creates cliffs

### `calculatePersonaOutcome(label, earnedIncome, config): PersonaOutcome`
Generates detailed outcome for one income level:
- Earned income, UBI, supplement, income tax, net income

## 🧪 Test Examples

```typescript
// All of these pass:
runSimulation(DEFAULT_CONFIG).balance.isSolvent // true
calculateIncomeTax(60000, DEFAULT_CONFIG) // 0
calculateIncomeTax(60001, DEFAULT_CONFIG) // 0.19 (one dollar @ 19%)
calculateSupplement(24000, DEFAULT_CONFIG) // 6000 (peak)
calculateSupplement(60000, DEFAULT_CONFIG) // ~240 (near breakout)
```

## 🎯 Next Steps (v0.2+)

1. **UI/Frontend** (v0.2)
   - React component with 3 sliders (token tax, UBI, breakout point)
   - Real-time simulation output cards
   - Green/red solvency indicator

2. **Charts & Visualization** (v0.3)
   - Revenue and obligations breakdown charts
   - Persona comparison charts

3. **Educational Layer** (v0.4)
   - Glossary tooltips for key terms
   - "How it works" explainer section
   - Formula reference

4. **Crowdsourcing** (v1.0)
   - Submit custom configs
   - Leaderboard (highest surplus, most balanced, etc.)
   - Shareable config links

## 📝 Notes

- The math engine is **deterministic**: same inputs always produce same outputs
- **No PII stored**: Completely anonymous, educational tool
- **Transparent**: All formulas and assumptions available for inspection
- **Modular**: Math logic separated from UI, easy to integrate into any frontend

---

**Status**: ✅ v0.1 complete and ready for v0.2 UI development

**Last Updated**: 2026-02-11
