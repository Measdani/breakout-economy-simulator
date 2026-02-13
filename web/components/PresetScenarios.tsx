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
    textColor: 'text-blue-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-blue-400',
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
    textColor: 'text-green-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-green-400',
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
    textColor: 'text-orange-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-orange-400',
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
    textColor: 'text-purple-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-purple-400',
    config: {
      tokenTaxRate: 0.0015,
      ubiAnnualPerAdult: 8000,
      breakoutPoint: 70000,
    },
  },
];

export default function PresetScenarios({ onSelectPreset }: PresetScenariosProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa'];

  const handleSelectPreset = (presetName: string, config: Partial<PolicyConfig>) => {
    setSelectedPreset(presetName);
    onSelectPreset(config, presetName);
  };

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Scenarios</h3>
        <div className="inline-grid grid-cols-2 gap-2 overflow-hidden">
          {PRESETS.map((preset, idx) => {
            const isSelected = selectedPreset === preset.name;

            return (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.name, preset.config)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? colors[idx] : '#334155',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${colors[idx]}`
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{preset.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.2' }}>
                      {preset.description}
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {isSelected ? '✓ Selected' : 'Click to use'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
