'use client';

import { useState } from 'react';

const GLOSSARY_ITEMS = [
  {
    term: 'UBI (Universal Basic Income)',
    definition:
      'A guaranteed annual payment given to all adults, regardless of income or employment status.',
    example: 'Default: $12,000/year per adult',
  },
  {
    term: 'Token Tax',
    definition:
      'A tax on financial flow (all electronic financial transactions and digital transfers), not labor or wages. The tax base is the total annual volume of electronic payments in the economy.',
    example: '0.35 mils / 1,000 tokens total compute × $1 quadrillion annual flow = $3.5 trillion/year revenue. Labor income below breakout point is not taxed.',
  },
  {
    term: 'Welfare Trap',
    definition:
      'Under traditional welfare, earning one more dollar causes you to lose more in government benefits than you gain in income. The result: work financially punishes you.',
    example: 'Old system: $1 earned = $1.50 lost in benefits. Net result = −$0.50. No incentive to work. This model eliminates it.',
  },
  {
    term: 'Welfare Floor & Launchpad',
    definition:
      'The UBI is a guaranteed income floor—it never disappears when you earn more. The supplement is a launchpad—a bonus that rises as you enter the workforce, peaking around $24k earned income, then gliding smoothly to zero at the breakout point.',
    example: 'Floor = $12k/yr guaranteed to all. Launchpad = +$6k bonus at $24k earned. No cliff, no trap.',
  },
  {
    term: 'Breakout Point',
    definition:
      'The earned income level where the UBI supplement reaches zero. Beyond this point, you earn on your own without government support.',
    example: 'Default: $60,000',
  },
  {
    term: 'Supplement',
    definition:
      'A bonus on top of base UBI that peaks at lower incomes and tapers to zero at the breakout point. Encourages work without welfare cliffs.',
    example: 'Peaks at $24k earned income (+$6k bonus), tapers to $0 at $60k',
  },
  {
    term: 'Incentive Slopes: Climb & Glide',
    definition:
      'The Climb: from $0 to ~$24k earned income, your supplement rises (the launchpad effect). The Glide: from ~$24k to the breakout point, it tapers smoothly. Every extra dollar earned still improves your net income.',
    example: 'Supplement tapers at ~16.7¢ per $1 earned. You keep ~83¢ of every extra dollar you earn—strong work incentive.',
  },
  {
    term: 'Welfare Cliff',
    definition:
      'When earning one more dollar causes you to lose more in benefits than you gain in income (net loss). This is eliminated in this model.',
    example: 'Traditional welfare: $1 earned = lose $1+ in benefits (bad incentive)',
  },
  {
    term: 'Solvency',
    definition: 'The budget is balanced when revenue equals or exceeds obligations.',
    example: 'Green = surplus, Red = deficit',
  },
  {
    term: 'Net Income',
    definition:
      'Total money you keep after earning income, receiving UBI/supplement, and paying taxes.',
    example: '$50k earned + $12k UBI + $2k supplement - $0 tax = $64k net',
  },
  {
    term: 'Tiered Tax',
    definition:
      'Different tax rates apply to different income brackets. Lower earners pay less, higher earners pay more.',
    example: '0% up to $60k, 19% from $60k-$135k, 29% above $135k',
  },
];

export default function Glossary() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-xl transition"
        title="Open glossary"
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 max-h-96 overflow-y-auto bg-white rounded-lg shadow-2xl border border-slate-200 p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h3 className="text-lg font-bold text-slate-900">Glossary</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 text-xl"
              >
                ✕
              </button>
            </div>

            {GLOSSARY_ITEMS.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-semibold text-slate-900">{item.term}</h4>
                <p className="text-sm text-slate-700">{item.definition}</p>
                <p className="text-xs text-blue-600 italic">💡 {item.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
