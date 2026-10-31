import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell 
} from 'recharts';
import { 
  Filter, 
  Table as TableIcon, 
  Calendar, 
  Info, 
  Sliders, 
  Layers, 
  Globe,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { useCountry } from '../context/CountryContext';
import CountrySelector from '../components/CountrySelector';
import LoadingState from '../components/LoadingState';
import ErrorAlert from '../components/ErrorAlert';
import DataSourceNote from '../components/DataSourceNote';
import { useTheme } from '../context/ThemeContext';

export default function DataExplorer() {
  const { isDark } = useTheme();
  const { globalCountry, setGlobalCountry } = useCountry();

  // Local state allows independent override on this page
  const [selectedCountry, setSelectedCountry] = useState(globalCountry || 'United States');
  const [metric, setMetric] = useState('co2');
  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2022);
  const [comparisonYear, setComparisonYear] = useState(2022);

  const [metricsList, setMetricsList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available metrics list once
  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getMetrics();
        setMetricsList(res.metrics || []);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      }
    }
    loadMetrics();
  }, []);

  // Fetch explorer data whenever filters change
  const fetchExplorerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getExplorerData({
        country: selectedCountry,
        metric: metric,
        start_year: startYear,
        end_year: endYear,
        comparison_year: comparisonYear,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch explorer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorerData();
  }, [selectedCountry, metric, startYear, endYear, comparisonYear]);

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
  };

  const handleSetGlobal = () => {
    setGlobalCountry(selectedCountry);
  };

  const currentMetricInfo = data?.metric_info || metricsList.find((m) => m.id === metric) || {
    id: metric,
    label: metric,
    unit: '',
    description: '',
  };

  const gridColor = isDark ? '#30443A' : '#E2E9E4';
  const axisColor = isDark ? '#30443A' : '#E2E9E4';
  const tickColor = isDark ? '#A5B6AB' : '#718078';
  const labelColor = isDark ? '#E7F0EA' : '#26332E';

  return (
    <div className="layout-container">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow-label">
            <Sliders className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>MULTIVARIATE RESEARCH EXPLORER</span>
          </div>
          <h1 className="page-title">Historical Data Explorer</h1>
          <p className="page-subtitle">
            Query country-specific longitudinal trajectories, cross-sectional distributions, and empirical datasets 
            across 9 environmental, energy system, and macroeconomic indicators (2000–2022).
          </p>
        </div>

        {selectedCountry !== globalCountry && (
          <button
            type="button"
            onClick={handleSetGlobal}
            className="btn-secondary self-start md:self-auto text-xs"
            title="Set this country as the active country across all pages"
          >
            <Globe className="w-3.5 h-3.5" />
            Set as Active Global ({selectedCountry})
          </button>
        )}
      </div>

      {/* OWID-Inspired Prominent Filter Panel */}
      <div className="card mb-8 p-5">
        <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[var(--border-color)]">
          <Filter className="w-4 h-4 text-[var(--accent-secondary)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Data Query & Filter Controls
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Country Selector */}
          <div>
            <CountrySelector
              value={selectedCountry}
              onChange={handleCountryChange}
              label="1. Target Country"
              allowWorld={false}
            />
          </div>

          {/* 2. Metric Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718078] mb-1.5">
              2. Indicator / Metric
            </label>
            <div className="relative">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                aria-label="Indicator / Metric"
                className="w-full h-10 bg-white border border-[#E2E9E4] hover:border-[#CBD7CE] focus:border-[#276749] focus:ring-2 focus:ring-[#276749]/20 rounded-md px-3.5 pr-8 text-xs font-semibold text-[#183B32] shadow-xs cursor-pointer"
              >
                {metricsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.unit})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#718078] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 3. Time Horizon Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718078] mb-1.5">
              3. Time Horizon ({startYear} – {endYear})
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-1/2">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(Math.min(Number(e.target.value), endYear))}
                  aria-label="Start Year"
                  className="w-full h-10 bg-white border border-[#E2E9E4] hover:border-[#CBD7CE] focus:border-[#276749] rounded-md px-2.5 pr-6 text-xs font-medium text-[#26332E] cursor-pointer"
                >
                  {Array.from({ length: 23 }, (_, i) => 2000 + i).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#718078] absolute right-2 top-3.5 pointer-events-none" />
              </div>
              <span className="text-xs text-[#718078] font-bold">to</span>
              <div className="relative w-1/2">
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(Math.max(Number(e.target.value), startYear))}
                  aria-label="End Year"
                  className="w-full h-10 bg-white border border-[#E2E9E4] hover:border-[#CBD7CE] focus:border-[#276749] rounded-md px-2.5 pr-6 text-xs font-medium text-[#26332E] cursor-pointer"
                >
                  {Array.from({ length: 23 }, (_, i) => 2000 + i).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#718078] absolute right-2 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 4. Comparison Snapshot Year */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718078] mb-1.5">
              4. Snapshot Cross-Section
            </label>
            <div className="relative">
              <select
                value={comparisonYear}
                onChange={(e) => setComparisonYear(Number(e.target.value))}
                aria-label="Comparison Snapshot Year"
                className="w-full h-10 bg-white border border-[#E2E9E4] hover:border-[#CBD7CE] focus:border-[#276749] focus:ring-2 focus:ring-[#276749]/20 rounded-md px-3.5 pr-8 text-xs font-medium text-[#26332E] shadow-xs cursor-pointer"
              >
                {Array.from({ length: 23 }, (_, i) => 2022 - i).map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} Benchmark
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#718078] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Selected Metric Explanation Banner */}
        <div className="mt-4 pt-3.5 border-t border-[#EEF3EF] flex items-start gap-2.5 text-xs text-[#26332E] bg-[#F7F9F7] p-3 rounded-md border border-[#E2E9E4]">
          <Info className="w-4 h-4 text-[#276749] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#183B32] font-semibold">{currentMetricInfo.label}:</strong>{' '}
            <span>{currentMetricInfo.description}</span>{' '}
            <span className="font-mono text-[#183B32] font-bold bg-[#E8F0EA] px-2 py-0.5 rounded border border-[#CBDED0] ml-1">
              Unit: {currentMetricInfo.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      {loading ? (
        <LoadingState message={`Fetching empirical observations for ${selectedCountry}...`} />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchExplorerData} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Chart 1: Time Series for Selected Country */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF3EF]">
                <div>
                  <h2 className="text-sm font-bold text-[#183B32] tracking-tight flex items-center gap-2">
                    <span>{selectedCountry}:</span>
                    <span className="text-[#276749]">{currentMetricInfo.label}</span>
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    Historical evolution across {startYear}–{endYear}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] border border-[var(--border-color)] px-2.5 py-1 rounded">
                  {currentMetricInfo.unit}
                </span>
              </div>

              <div style={{ width: '100%', height: 380, minHeight: 380, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.time_series} margin={{ top: 10, right: 25, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke={tickColor} 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={{ stroke: axisColor }} 
                    />
                    <YAxis
                      stroke={tickColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: axisColor }}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{selectedCountry} ({label})</p>
                              <p className="val text-[var(--text-primary)] font-bold text-sm">
                                {val !== null && val !== undefined ? val.toLocaleString() : 'N/A'}{' '}
                                <span className="text-xs text-[var(--text-secondary)] font-normal">{currentMetricInfo.unit}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={currentMetricInfo.label}
                      stroke="#276749"
                      strokeWidth={2.75}
                      dot={{ r: 3, fill: '#276749', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#183B32' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Countries Comparison Snapshot */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    Cross-Country Comparison ({comparisonYear})
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Top 15 economies ranked by {currentMetricInfo.label}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
                  Ranked
                </span>
              </div>

              <div style={{ width: '100%', height: 380, minHeight: 380, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.top_comparisons}
                    layout="vertical"
                    margin={{ top: 5, right: 25, left: 45, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis
                      type="number"
                      stroke={tickColor}
                      fontSize={11}
                      axisLine={{ stroke: axisColor }}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <YAxis 
                      dataKey="country" 
                      type="category" 
                      stroke={labelColor} 
                      fontSize={11} 
                      width={85}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{item.country} ({comparisonYear})</p>
                              <p className="val text-[#183B32] font-bold text-sm">
                                {item.value.toLocaleString()} {currentMetricInfo.unit}
                              </p>
                              {item.is_selected && (
                                <p className="text-xs text-[#276749] font-bold mt-1">
                                  ✓ Currently Selected Country
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                    >
                      {data?.top_comparisons?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.is_selected ? '#183B32' : '#70A58B'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Granular Raw Data Table (OWID Style) */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF3EF]">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#276749]" />
                <h2 className="text-sm font-bold text-[#183B32] tracking-tight">
                  Empirical Records: {selectedCountry} ({startYear}–{endYear})
                </h2>
              </div>
              <span className="text-xs text-[#718078] font-mono bg-[#F7F9F7] px-2.5 py-1 rounded border border-[#E2E9E4]">
                {data?.table_data?.length || 0} observations
              </span>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>CO₂ (Mt)</th>
                    <th>CO₂ / Capita (t)</th>
                    <th>Primary Energy (TWh)</th>
                    <th>Fossil Share (%)</th>
                    <th>Renewable Share (%)</th>
                    <th>GDP / Capita ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.table_data?.map((row) => (
                    <tr key={row.year}>
                      <td className="font-bold text-[#183B32]">{row.year}</td>
                      <td className="font-mono text-[#183B32] font-semibold">
                        {row.co2?.toLocaleString() ?? '—'}
                      </td>
                      <td className="font-mono text-[#26332E]">{row.co2_per_capita ?? '—'}</td>
                      <td className="font-mono text-[#26332E]">
                        {row.primary_energy_consumption_energy?.toLocaleString() ?? '—'}
                      </td>
                      <td className="font-mono text-[#26332E]">{row.fossil_share_energy ?? '—'}%</td>
                      <td className="font-mono text-[#276749] font-semibold">
                        {row.renewables_share_energy ?? '—'}%
                      </td>
                      <td className="font-mono text-[#26332E]">${row.gdp_per_capita?.toLocaleString() ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Attribution Note */}
      <DataSourceNote
        notes={[
          'Missing data points are preserved as non-observations rather than arbitrarily coerced to zero.',
          'All metrics are harmonized according to Our World in Data codebook methodologies.',
        ]}
      />
    </div>
  );
}
