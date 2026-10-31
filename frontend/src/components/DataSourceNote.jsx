import React from 'react';
import { Database, Info } from 'lucide-react';

export default function DataSourceNote({
  sources = ['Our World in Data (OWID) CO₂ & Greenhouse Gas Database', 'OWID Global Energy Database'],
  notes = [],
}) {
  return (
    <div className="mt-10 pt-5 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
          <Database className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
          <span>Data Provenance & Attribution</span>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Integrated panel covering 79 sovereign nations (2000–2022, 1,817 observations) from{' '}
          <strong className="text-[var(--text-primary)]">{sources.join(', ')}</strong>.
        </p>
        {notes.map((note, idx) => (
          <p key={idx} className="text-[var(--text-secondary)] italic text-[11px] leading-relaxed">
            • {note}
          </p>
        ))}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-mono bg-[var(--bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--border-color)] self-start">
        <Info className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
        <span>Target: Annual CO₂ (Mt)</span>
      </div>
    </div>
  );
}
