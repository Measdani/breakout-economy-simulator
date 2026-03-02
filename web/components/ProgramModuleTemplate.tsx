'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

interface ProgramModuleTemplateProps {
  programName: string;
  enabled: boolean;
  modeControl?: ReactNode;
  modeBadge?: ReactNode;
  onToggleEnabled?: () => void;
  toggleDisabled?: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
  inputs: ReactNode;
  outputs: ReactNode;
  baselineComparison?: ReactNode;
  notes?: ReactNode;
  disabledMessage?: ReactNode;
  inputsTitle?: string;
  outputsTitle?: string;
  baselineTitle?: string;
  notesTitle?: string;
  baselineCollapsible?: boolean;
  notesCollapsible?: boolean;
  baselineDefaultOpen?: boolean;
  notesDefaultOpen?: boolean;
}

export default function ProgramModuleTemplate({
  programName,
  enabled,
  modeControl,
  modeBadge,
  onToggleEnabled,
  toggleDisabled = false,
  enabledLabel = 'Enabled',
  disabledLabel = 'Disabled',
  inputs,
  outputs,
  baselineComparison,
  notes,
  disabledMessage,
  inputsTitle = 'Inputs',
  outputsTitle = 'Outputs',
  baselineTitle = 'Baseline Comparison',
  notesTitle = 'Notes',
  baselineCollapsible = true,
  notesCollapsible = true,
  baselineDefaultOpen = false,
  notesDefaultOpen = false,
}: ProgramModuleTemplateProps) {
  const isToggleDisabled = toggleDisabled || !onToggleEnabled;
  const contentDisabled = !enabled;
  const [isBaselineOpen, setIsBaselineOpen] = useState(baselineDefaultOpen);
  const [isNotesOpen, setIsNotesOpen] = useState(notesDefaultOpen);

  return (
    <div className="bg-dark-slate rounded-lg p-6 glow-border-blue space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-bright">{programName}</h3>
          {(modeControl || modeBadge) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted">Mode</span>
              {modeControl}
              {modeBadge}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isToggleDisabled}
          onClick={onToggleEnabled}
          className={`px-3 py-1 rounded text-xs font-medium border border-border-slate transition ${
            enabled ? 'text-green-400 bg-darker-slate' : 'text-muted bg-darker-slate'
          } ${isToggleDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        >
          {enabled ? `ON ${enabledLabel}` : `OFF ${disabledLabel}`}
        </button>
      </div>

      {contentDisabled && disabledMessage && (
        <div className="bg-darker-navy rounded-lg border border-border-slate p-3">
          {disabledMessage}
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${contentDisabled ? 'pointer-events-none opacity-70' : ''}`}>
        <div className="bg-darker-slate rounded-lg border border-border-slate p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{inputsTitle}</p>
          {inputs}
        </div>
        <div className="bg-darker-slate rounded-lg border border-border-slate p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{outputsTitle}</p>
          {outputs}
        </div>
      </div>

      {baselineComparison && (
        <div className={`bg-darker-slate rounded-lg border border-border-slate p-4 ${contentDisabled ? 'pointer-events-none opacity-70' : ''}`}>
          {baselineCollapsible ? (
            <button
              type="button"
              onClick={() => setIsBaselineOpen(!isBaselineOpen)}
              className="w-full flex items-center justify-between text-left mb-2 bg-transparent border-0 p-0 appearance-none focus:outline-none"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">{baselineTitle}</p>
              <span className="text-xs text-dimmed">{isBaselineOpen ? 'Hide' : 'Show'}</span>
            </button>
          ) : (
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{baselineTitle}</p>
          )}
          {(!baselineCollapsible || isBaselineOpen) && baselineComparison}
        </div>
      )}

      {notes && (
        <div className="bg-darker-navy rounded-lg border border-border-slate p-4">
          {notesCollapsible ? (
            <button
              type="button"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="w-full flex items-center justify-between text-left mb-2 bg-transparent border-0 p-0 appearance-none focus:outline-none"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">{notesTitle}</p>
              <span className="text-xs text-dimmed">{isNotesOpen ? 'Hide' : 'Show'}</span>
            </button>
          ) : (
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{notesTitle}</p>
          )}
          {(!notesCollapsible || isNotesOpen) && notes}
        </div>
      )}
    </div>
  );
}
