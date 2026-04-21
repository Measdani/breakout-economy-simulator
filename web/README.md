# Policy Flight Simulator - Web UI (v2.1)

Interactive web interface for the Policy Flight Simulator - Educational BEL + Token Tax explorer.

## Features

✅ **Real-time Policy Sliders**
- Token Tax Rate (0.10 - 1.00 mils per 1,000 tokens total compute)
- Annual BEL per Adult ($0 - $20,000)
- Supplement Breakout Point ($30,000 - $100,000)

✅ **Live Financial Dashboard**
- Revenue breakdown (Token Tax, Income Tax, Welfare Savings)
- Obligations summary (BEL Cost, Government Operations)
- Fiscal solvency indicator (Green = Solvent, Red = Deficit)

✅ **Persona Outcomes Table**
- 4 income archetypes: Starter, Professional, Manager, Executive
- Shows: Earned Income, BEL, Supplement, Income Tax, Net Income
- Demonstrates no welfare cliffs (net income always increases)

✅ **Policy Diagnostics**
- Automated warnings for unusual configurations
- Supplement curve explanation
- Educational tooltips

## Quick Start

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Open browser
# http://localhost:3000
```

## Production Build

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

## Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Tailwind styles
├── components/
│   ├── Simulator.tsx       # Main container
│   ├── PolicySliders.tsx   # 3 input sliders
│   ├── ResultsDisplay.tsx  # Revenue/Obligations cards
│   └── PersonaTable.tsx    # Income outcomes table
├── lib/
│   ├── engine.ts           # Math engine (client)
│   └── types.ts            # Type definitions
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind CSS
└── tsconfig.json           # TypeScript config
```

## Technology Stack

- **Framework**: Next.js 16.1 with App Router
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **UI**: React 19
- **Build**: Turbopack

## Math Engine

The UI imports the calculation engine from `lib/engine.ts`, which is a client-side version of the main math engine in `../src/engine.ts`.

### Key Functions
- `runSimulation(config)` - Main entry point
- `calculateTokenTaxRevenue()` - Token tax calculation
- `calculateIncomeTax()` - Tiered income tax
- `calculateSupplement()` - BEL supplement curve
- `calculatePersonaOutcome()` - Individual scenario results

### Configuration

Default policy settings in `components/Simulator.tsx`:

```typescript
{
  tokenTaxRate: 0.0035,           // 0.35 mils / 1,000 tokens total compute
  ubiAnnualPerAdult: 12000,       // $12k
  breakoutPoint: 60000,           // $60k
  adultPopulation: 265000000,     // 265M
  // ... plus tax brackets, supplement curve params
}
```

## Features (v0.2 Checklist)

- ✅ React sliders for 3 main parameters
- ✅ Real-time simulation updates (<500ms)
- ✅ Revenue/Obligations breakdown cards
- ✅ Solvency indicator (green/red)
- ✅ Persona outcomes table
- ✅ Educational tooltips
- ✅ Responsive design (mobile-friendly)
- ✅ Type-safe TypeScript throughout

## Roadmap (v0.3+)

- [ ] Add revenue & obligations charts (D3/Recharts)
- [ ] Interactive persona income picker
- [ ] Export configuration as JSON/CSV
- [ ] Save configurations to localStorage
- [ ] Income distribution upload (CSV)
- [ ] Comparison mode (side-by-side scenarios)
- [ ] Dark mode toggle
- [ ] Glossary and "How it works" section

## Notes

- **Educational Only**: This is a simplified policy simulation for exploration and understanding. Not suitable for actual policy recommendations without validation.
- **Server-backed submissions**: Public submissions, survey responses, and admin views use Supabase through server-side routes/actions.
- **Minimal collection**: Optional contact details may be submitted, but public pages focus on policy data only.
- **Open Source**: Math engine fully documented and testable.

## Related

- Math engine: `../src/engine.ts`
- Unit tests: `../src/engine.test.ts`
- Assumptions doc: `../ASSUMPTIONS.md`
- Spec: `../SPEC.md`

---

**Version**: 2.1.0
**Last Updated**: 2026-02-11
**Status**: ✅ Production Ready

