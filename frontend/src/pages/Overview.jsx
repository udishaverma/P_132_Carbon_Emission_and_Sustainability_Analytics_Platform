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
  CartesianGrid 
} from 'recharts';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  Leaf, 
  ArrowUpRight, 
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import LoadingState from '../components/LoadingState';
import ErrorAlert from '../components/ErrorAlert';
import DataSourceNote from '../components/DataSourceNote';
import GlobalEmissionsMap from '../components/GlobalEmissionsMap';
import { useTheme } from '../context/ThemeContext';

export default function Overview() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [modelEval, setModelEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2022);

  const fetchData = async (yr) => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, evalRes] = await Promise.all([
        api.getOverview(yr),
        api.getModelEvaluation(),
      ]);
      setData(overviewRes);
      setModelEval(evalRes);
      if (overviewRes.selected_year) {
        setSelectedYear(overviewRes.selected_year);
      }
    } catch (err) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, []);

  const handleYearChange = (yr) => {
    setSelectedYear(yr);
    fetchData(yr);
  };

  if (loading && !data) {
    return (
      <div className="layout-container">
        <LoadingState message="Loading global emissions research overview..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="layout-container">
        <ErrorAlert message={error} onRetry={() => fetchData(selectedYear)} />
      </div>
    );
  }

  const {
    total_co2,
    co2_per_capita,
    annual_change_abs,
    annual_change_pct,
    latest_year,
    min_year,
    total_countries_tracked,
    historical_emissions,
    top_emitters,
    top_countries_trend,
    top_5_countries,
    world_context,
  } = data || {};

  const bestModel = modelEval?.primary_regression?.[0] || {
    Model: 'Gradient Boosting',
    MAE: 22.5743,
    RMSE: 68.9022,
    R2: 0.9973,
  };

  // Distinct multi-country series colors from approved palette
  const countryColors = ['#276749', '#D49B48', '#5D8290', '#70A58B', '#9C5B42'];

  // Dynamic theme colors for Recharts SVG elements
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
            <Leaf className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>GLOBAL EMPIRICAL MONITORING • 79 NATIONS</span>
          </div>
          <h1 className="page-title">CO₂ Emissions & Macro Patterns</h1>
          <p className="page-subtitle">
            Longitudinal analysis of territorial greenhouse gas emissions across 79 countries (2000–2022). 
            Tracking macroeconomic energy drivers, per-capita intensity, and machine-learning benchmarking.
          </p>
        </div>

        {/* Snapshot-Year Selector */}
        <div className="flex items-center gap-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] px-3.5 py-2 rounded-lg shadow-xs self-start md:self-auto transition-colors">
          <Calendar className="w-4 h-4 text-[var(--accent-sage)] flex-shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Snapshot Year:</span>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              aria-label="Snapshot Year"
              className="text-xs font-semibold bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-3 py-1 pr-6 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-secondary)] cursor-pointer h-8"
            >
              {Array.from({ length: (latest_year || 2022) - (min_year || 2000) + 1 }, (_, i) => (latest_year || 2022) - i).map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Tracked Panel Emissions"
          value={total_co2?.toLocaleString()}
          unit="Mt CO₂"
          change={
            annual_change_pct !== null && annual_change_pct !== undefined
              ? `${annual_change_pct > 0 ? '+' : ''}${annual_change_pct}% YoY`
              : 'N/A'
          }
          changeType={annual_change_pct > 0 ? 'increase' : 'decrease'}
          subtitle={`Sum of ${total_countries_tracked || 79} economies in ${selectedYear}`}
          icon={Globe}
          badge={`Snapshot ${selectedYear}`}
        />

        <MetricCard
          title="Average CO₂ per Capita"
          value={co2_per_capita}
          unit="tonnes / person"
          subtitle="Panel population-weighted mean"
          icon={Users}
          badge="Per Capita"
        />

        <MetricCard
          title="Annual Emission Change"
          value={annual_change_abs !== null && annual_change_abs !== undefined ? `${annual_change_abs > 0 ? '+' : ''}${annual_change_abs.toLocaleString()}` : '—'}
          unit="Mt CO₂"
          changeType={annual_change_abs > 0 ? 'increase' : 'decrease'}
          subtitle={`Net change relative to ${selectedYear - 1}`}
          icon={TrendingUp}
        />

        <MetricCard
          title="Best Model (Held-Out Test)"
          value={`${bestModel.Model}`}
          unit={`R²: ${bestModel.R2 || bestModel['R²']}`}
          subtitle={`RMSE: ${bestModel.RMSE} Mt | MAE: ${bestModel.MAE} Mt`}
          icon={Award}
          badge="ML Benchmark"
        />
      </div>

      {/* Contextual Worldwide Scope Banner */}
      {world_context && (
        <div className="mb-8 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] flex items-center justify-between shadow-xs transition-colors">
          <div className="flex items-start sm:items-center gap-3">
            <Info className="w-4 h-4 text-[var(--accent-secondary)] flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="leading-relaxed">
              <strong className="font-bold text-[var(--text-primary)]">Global Dataset Context ({world_context.year}):</strong> Worldwide 
              emissions recorded in the complete Our World in Data catalog were <strong>{world_context.world_co2.toLocaleString()} Mt</strong> ({world_context.world_co2_per_capita} t/capita). 
              Our 79-country complete-feature research panel captures <strong>{((total_co2 / world_context.world_co2) * 100).toFixed(1)}%</strong> of all global industrial emissions.
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 1: Interactive Global CO₂ Emissions Choropleth Map */}
      <GlobalEmissionsMap selectedYear={selectedYear} />

      {/* Two-Column Responsive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Global Historical Emissions Line Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Global Historical CO₂ Emissions (2000–2022)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Aggregate annual emissions trajectory of the 79 tracked economies in Million tonnes
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              Mt CO₂
            </span>
          </div>

          <div style={{ width: '100%', height: 350, minHeight: 350, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical_emissions} margin={{ top: 10, right: 25, left: 10, bottom: 5 }}>
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p className="label">Year {label}</p>
                          <p className="val text-[#183B32] font-bold text-sm">
                            {payload[0].value.toLocaleString()} Mt CO₂
                          </p>
                          <p className="text-xs text-[#718078] mt-1 font-mono">
                            Per Capita: {payload[0].payload.co2_per_capita} tonnes
                          </p>
                          <p className="text-xs text-[#276749] mt-0.5 font-medium">
                            Avg Renewable Share: {payload[0].payload.avg_renewable_share}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total_co2"
                  name="Panel Emissions"
                  stroke="#276749"
                  strokeWidth={2.75}
                  dot={{ r: 3, fill: '#276749', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#183B32' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Emitting Countries Bar Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Top 10 National Emitting Nations ({selectedYear})
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Highest emitting sovereign contributors ranked in snapshot year
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              Top 10
            </span>
          </div>

          <div style={{ width: '100%', height: 350, minHeight: 350, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top_emitters}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 45, bottom: 5 }}
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
                          <p className="label">{item.country} ({selectedYear})</p>
                          <p className="val text-[#183B32] font-bold text-sm">
                            {item.co2.toLocaleString()} Mt CO₂
                          </p>
                          <p className="text-xs text-[#718078] mt-1">
                            Per Capita: <strong>{item.co2_per_capita} tonnes</strong>
                          </p>
                          <p className="text-xs text-[#276749] font-medium mt-0.5">
                            Renewable Share: <strong>{item.renewables_share_energy}%</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="co2" 
                  fill="#70A58B" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Second Grid: Multi-Country Trajectory (8 cols) & Model Scorecard (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Chart 3: Top 5 Country Comparison Trajectory (8 cols) */}
        <div className="card lg:col-span-7 xl:col-span-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Emissions Trajectory: World's Top 5 Emitting Nations (2000–2022)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Comparative multi-decade longitudinal evolution among the largest structural emitters
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              Multi-Country
            </span>
          </div>

          <div style={{ width: '100%', height: 360, minHeight: 360, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={top_countries_trend} margin={{ top: 10, right: 25, left: 10, bottom: 10 }}>
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p className="label">Year {label} Comparison</p>
                          {payload.map((entry, idx) => (
                            <p key={idx} className="text-xs py-0.5 flex items-center justify-between gap-3">
                              <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
                              <span className="font-mono text-[var(--text-primary)] font-bold">{entry.value?.toLocaleString()} Mt</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} 
                />
                {top_5_countries?.map((c, i) => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stroke={countryColors[i % countryColors.length]}
                    strokeWidth={2.4}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Evaluation Summary Box (5/4 cols) */}
        <div className="card lg:col-span-5 xl:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                ML Model Benchmarking
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              Evaluation across 1,817 observations on a 70% train / 15% val / 15% held-out test split:
            </p>

            <div className="space-y-3">
              {modelEval?.primary_regression?.map((m) => {
                const isSelected = m.Model === 'Gradient Boosting';
                return (
                  <div
                    key={m.Model}
                    className={`p-3.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-xs'
                        : 'bg-[var(--bg-main)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        {m.Model}
                        {isSelected && (
                          <span className="text-[9px] bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--accent-secondary)]">
                        R²: {m.R2 || m['R²']}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
                      <div>RMSE: <strong className="text-[var(--text-primary)]">{m.RMSE} Mt</strong></div>
                      <div>MAE: <strong className="text-[var(--text-primary)]">{m.MAE} Mt</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Gradient Boosting was selected based on achieving lowest validation RMSE (41.62 Mt) before final test evaluation.
          </div>
        </div>

      </div>

      {/* Attribution & Footnote */}
      <DataSourceNote
        notes={[
          'Emissions represent territorial carbon dioxide from fossil fuel combustion and industrial processes in Million tonnes (Mt).',
          'Panel criteria: sovereign states with contiguous historical data across all 13 socioeconomic and clean-energy predictors from 2000 to 2022.',
        ]}
      />
    </div>
  );
}
