import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit,
  change,
  changeType = 'neutral', // 'increase' | 'decrease' | 'neutral'
  subtitle,
  icon: Icon,
  badge,
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-xs hover:border-[var(--border-hover)] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="text-[10px] font-bold font-mono bg-[var(--bg-secondary)] text-[var(--accent-secondary)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
            {Icon && <Icon className="w-4 h-4 text-[var(--accent-sage)]" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
            {value !== null && value !== undefined ? value : '—'}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {(change !== undefined || subtitle) && (
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          {change !== undefined && (
            <div className="flex items-center gap-1 font-semibold">
              {changeType === 'increase' && (
                <span className="text-[#D49B48] flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {change}
                </span>
              )}
              {changeType === 'decrease' && (
                <span className="text-[var(--accent-secondary)] flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {change}
                </span>
              )}
              {changeType === 'neutral' && (
                <span className="text-[var(--text-secondary)] flex items-center gap-0.5">
                  <Minus className="w-3 h-3" />
                  {change}
                </span>
              )}
            </div>
          )}
          {subtitle && <span className="text-[var(--text-secondary)] text-[11px] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
