'use client';

import { useState } from 'react';
import type { PolicyConfig } from '@/lib/types';

interface PresetScenariosProps {
  onSelectPreset: (config: Partial<PolicyConfig>, name?: string) => void;
}

const PRESETS = [
  {
    name: 'Balanced',
    icon: '⚖️',
    description: 'Default moderate policy',
    color: 'from-blue-400 to-blue-600',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    config: {
      tokenTaxRate: 0.0035,
      ubiAnnualPerAdult: 12000,
      breakoutPoint: 60000,
    },
  },
  {
    name: 'High Growth',
    icon: '📈',
    description: 'Lower taxes, higher UBI',
    color: 'from-green-400 to-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    config: {
      tokenTaxRate: 0.002,
      ubiAnnualPerAdult: 15000,
      breakoutPoint: 70000,
    },
  },
  {
    name: 'Safety Net',
    icon: '🛡️',
    description: 'Higher taxes, robust UBI',
    color: 'from-orange-400 to-orange-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    config: {
      tokenTaxRate: 0.005,
      ubiAnnualPerAdult: 16000,
      breakoutPoint: 55000,
    },
  },
  {
    name: 'Minimal State',
    icon: '⚡',
    description: 'Low taxes, lean support',
    color: 'from-purple-400 to-purple-600',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    config: {
      tokenTaxRate: 0.0015,
      ubiAnnualPerAdult: 8000,
      breakoutPoint: 70000,
    },
  },
];

export default function PresetScenarios({ onSelectPreset }: PresetScenariosProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSelectPreset = (presetName: string, config: Partial<PolicyConfig>) => {
    setSelectedPreset(presetName);
    onSelectPreset(config, presetName);
  };

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Scenarios</h3>
        <div className="inline-grid grid-cols-2 gap-2 overflow-hidden">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.name;

            return (
              <div
                key={preset.name}
                className={`p-3 rounded-lg border-2 ${preset.borderColor} transition-colors duration-300 cursor-pointer overflow-hidden`}
                style={{
                  background: isSelected ? preset.bgColor : 'white'
                }}
                onClick={() => handleSelectPreset(preset.name, preset.config)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="text-2xl mb-1">{preset.icon}</div>
                    <div className={`font-bold text-xs ${preset.textColor} mb-0.5`}>
                      {preset.name}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2">
                      {preset.description}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t text-center">
                    <span className={`text-sm font-semibold ${preset.textColor}`}>
                      {isSelected ? '✓ Selected' : 'Click to use'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
