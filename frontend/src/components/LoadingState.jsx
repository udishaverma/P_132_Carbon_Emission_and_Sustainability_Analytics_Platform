import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading analytics data...', minHeight = '320px' }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-10 text-center bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-xs"
      style={{ minHeight }}
    >
      <Loader2 className="w-8 h-8 text-[var(--accent-secondary)] animate-spin mb-3.5" />
      <p className="text-sm font-semibold text-[var(--text-primary)]">{message}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">Querying verified OWID data & machine-learning services</p>
    </div>
  );
}
