'use client';

const GLOSSARY_ITEMS = [
  {
    term: 'BEL (Basic Economic Liquidity)',
    definition: 'A guaranteed annual payment given to all adults, regardless of income or employment status.',
    example: 'Default: $12,000/year per adult',
  },
  {
    term: 'Token Tax',
    definition: 'A tax on financial flow (all electronic financial transactions and digital transfers), not labor or wages.',
    example: '0.35 mils / 1,000 tokens total compute × $1 quadrillion annual flow = $3.5 trillion/year revenue.',
  },
  {
    term: 'Welfare Trap',
    definition: 'Under traditional welfare, earning one more dollar causes you to lose more in benefits than you gain in income.',
    example: 'Old system: $1 earned = $1.50 lost in benefits. This model eliminates it.',
  },
  {
    term: 'Welfare Floor & Launchpad',
    definition: 'The BEL is a guaranteed floor. The supplement is a launchpad—a bonus that rises then glides smoothly to zero at the breakout point.',
    example: 'Floor = $12k/yr. Launchpad = +$6k bonus at $24k earned.',
  },
  {
    term: 'Breakout Point',
    definition: 'The earned income level where the BEL supplement reaches zero.',
    example: 'Default: $60,000',
  },
  {
    term: 'Supplement',
    definition: 'A bonus on top of base BEL that peaks at lower incomes and tapers to zero at the breakout point.',
    example: 'Peaks at $24k earned income (+$6k bonus), tapers to $0 at $60k',
  },
  {
    term: 'Incentive Slopes: Climb & Glide',
    definition: 'The Climb: supplement rises from $0 earned. The Glide: it tapers smoothly. Every extra dollar earned still improves net income.',
    example: 'Supplement tapers at ~16.7¢ per $1 earned. You keep ~83¢ of every extra dollar.',
  },
  {
    term: 'Welfare Cliff',
    definition: 'When earning one more dollar causes you to lose more in benefits than you gain in income.',
    example: 'Traditional welfare: $1 earned = lose $1+ in benefits. This model eliminates it.',
  },
  {
    term: 'Solvency',
    definition: 'The budget is balanced when revenue equals or exceeds obligations.',
    example: 'Green = surplus, Red = deficit',
  },
  {
    term: 'Net Income',
    definition: 'Total money you keep after earning income, receiving BEL/supplement, and paying taxes.',
    example: '$50k earned + $12k BEL + $2k supplement - $0 tax = $64k net',
  },
  {
    term: 'Tiered Tax',
    definition: 'Different tax rates apply to different income brackets. Lower earners pay less, higher earners pay more.',
    example: '0% up to $60k, 19% from $60k-$135k, 29% above $135k',
  },
  {
    term: 'Dependent BEL',
    definition: 'Additional BEL payments for dependents (children, elderly, disabled) on top of adult BEL. Paid in tiers: 1st dependent = $6k, 2nd = $4k, 3rd+ = $2k.',
    example: 'Household with 2 children receives: $12k (adults) + $6k (1st child) + $4k (2nd child) = $22k total BEL',
  },
  {
    term: 'Household Composition',
    definition: 'The distribution of households by number of dependents (what % have 0, 1, 2, or 3+ dependents). Used to model total dependent population and costs.',
    example: 'If 25% of households have 1 dependent, 15% have 2, 10% have 3+, then 50% have no dependents',
  },
  {
    term: 'Household Demographics Impact',
    definition: 'Real-time metrics showing fiscal impact of the dependent BEL structure: total dependent cost, % of budget, dependent population, and coverage rate.',
    example: 'Toggled in right panel—shows that dependents might represent 8-12% of total BEL budget',
  },
];

export default function GlossaryPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#cbd5e1',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        📚 Glossary
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {GLOSSARY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.3)',
              borderRadius: '6px',
              border: '1px solid #475569',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(71, 85, 105, 0.5)';
              e.currentTarget.style.borderColor = '#64748b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)';
              e.currentTarget.style.borderColor = '#475569';
            }}
          >
            <h4 style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#60a5fa',
              margin: '0 0 4px 0',
            }}>
              {item.term}
            </h4>
            <p style={{
              fontSize: '11px',
              color: '#cbd5e1',
              margin: '0 0 4px 0',
              lineHeight: '1.4',
            }}>
              {item.definition}
            </p>
            <p style={{
              fontSize: '10px',
              color: '#94a3b8',
              margin: 0,
              fontStyle: 'italic',
            }}>
              💡 {item.example}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
