import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';
import { useCountry } from '../context/CountryContext';

export default function CountrySelector({
  value,
  onChange,
  allowWorld = false,
  label = 'Select Country',
  className = '',
}) {
  const { countries, loadingCountries } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.iso_code && c.iso_code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isWorldSelected = allowWorld && (!value || value === 'World' || value === 'Global Total');
  const selectedItem = countries.find((c) => c.country === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loadingCountries}
        className="w-full h-10 flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/20 focus:border-[var(--accent-secondary)] rounded-md px-3.5 text-xs text-[var(--text-primary)] shadow-xs transition-all cursor-pointer"
        style={{ minWidth: '220px' }}
      >
        <div className="flex items-center gap-2 truncate">
          {isWorldSelected ? (
            <>
              <Globe className="w-4 h-4 text-[var(--accent-secondary)] flex-shrink-0" />
              <span className="font-semibold text-[var(--text-primary)] truncate">Global Panel (79 Countries)</span>
            </>
          ) : selectedItem ? (
            <>
              {selectedItem.iso_code && (
                <span className="text-[10px] font-mono font-bold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-1.5 py-0.5 rounded flex-shrink-0 border border-[var(--border-color)]">
                  {selectedItem.iso_code}
                </span>
              )}
              <span className="font-medium text-[var(--text-primary)] truncate">{selectedItem.country}</span>
            </>
          ) : (
            <span className="text-[var(--text-secondary)]">
              {loadingCountries ? 'Loading country catalog...' : 'Select a country'}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-150 ${isOpen ? 'rotate-180 text-[var(--text-primary)]' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-lg py-1.5 max-h-80 overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="px-3 pb-2.5 pt-1.5 border-b border-[var(--border-color)] flex items-center gap-2 bg-[var(--bg-main)]">
            <Search className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
            <input
              type="text"
              placeholder="Filter by country or ISO code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none bg-transparent h-7 p-0 border-0 shadow-none focus:ring-0"
              autoFocus
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto max-h-60 py-1 divide-y divide-[var(--border-color)]">
            {allowWorld && (
              <button
                type="button"
                onClick={() => {
                  onChange('World');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                  isWorldSelected ? 'bg-[var(--bg-secondary)] font-semibold text-[var(--accent-secondary)]' : 'text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                  <span>Global Panel (All 79 Countries)</span>
                </div>
                {isWorldSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />}
              </button>
            )}

            {filteredCountries.length === 0 ? (
              <div className="px-3.5 py-4 text-xs text-center text-[var(--text-secondary)]">
                No matching country in the 79-nation panel
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = value === c.country;
                return (
                  <button
                    key={c.country}
                    type="button"
                    onClick={() => {
                      onChange(c.country);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[var(--bg-secondary)] font-semibold text-[var(--accent-secondary)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {c.iso_code && (
                        <span className="text-[10px] font-mono font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                          {c.iso_code}
                        </span>
                      )}
                      <span className="truncate">{c.country}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-secondary)] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
