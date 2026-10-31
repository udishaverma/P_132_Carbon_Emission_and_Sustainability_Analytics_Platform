import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell 
} from 'recharts';
import { 
  Sun, 
  Zap, 
  TrendingDown, 
  AlertTriangle, 
  Layers, 
  BarChart2, 
  Info,
  Scale
} from 'lucide-react';
import api from '../services/api';
import { useCountry } from '../context/CountryContext';
import CountrySelector from '../components/CountrySelector';
import LoadingState from '../components/LoadingState';
import ErrorAlert from '../components/ErrorAlert';
import DataSourceNote from '../components/DataSourceNote';
import { useTheme } from '../context/ThemeContext';

export default function RenewableImpact() {
  const { isDark } = useTheme();
  const { globalCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState(globalCountry || 'United States');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRenewableImpact(selectedCountry);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load renewable impact analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, [selectedCountry]);

  const {
    is_global,
    latest_year,
    scatter_points,
    adoption_groups,
    global_trends,
    country_trends,
    controlled_regression,
    correlations,
    methodology_notes,
  } = data || {};

  const gridColor = isDark ? '#30443A' : '#E2E9E4';
  const axisColor = isDark ? '#30443A' : '#E2E9E4';
  const tickColor = isDark ? '#A5B6AB' : '#718078';
  const labelColor = isDark ? '#E7F0EA' : '#26332E';

  return (
    <div className="layout-container">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow-label">
            <Sun className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>CLEAN ENERGY TRANSITION & ECONOMETRIC IMPACT</span>
          </div>
          <h1 className="page-title">Renewable Energy Adoption & Emissions Impact</h1>
          <p className="page-subtitle">
            Multivariate investigation evaluating the association between renewable energy penetration 
            and territorial CO₂ emissions across 79 countries. Controlled standardized regression, quartile adoption groups, and longitudinal trends.
          </p>
        </div>

        {/* Global/Country Filter */}
        <div className="w-full md:w-72 self-start md:self-auto">
          <CountrySelector
            value={selectedCountry}
            onChange={setSelectedCountry}
            allowWorld={true}
            label="Focus Country or Global Panel"
          />
        </div>
      </div>

      {/* KPI-Style Statistical Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718078]">
              Correlation: Renewable vs Total CO₂
            </span>
            <span className="badge badge-neutral font-mono font-bold">r</span>
          </div>
          <div className="text-3xl font-extrabold text-[#183B32] font-mono mt-1">
            {correlations?.corr_total_co2}
          </div>
          <p className="text-xs text-[#718078] mt-2.5 leading-relaxed">
            Uncontrolled correlation confounded by wide population disparities among sovereign states.
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718078]">
              Correlation: Renewable vs CO₂ / Capita
            </span>
            <span className="badge badge-forest font-mono font-bold">r (per capita)</span>
          </div>
          <div className="text-3xl font-extrabold text-[#276749] font-mono mt-1">
            {correlations?.corr_co2_per_capita}
          </div>
          <p className="text-xs text-[#718078] mt-2.5 leading-relaxed">
            Population-normalized emissions isolate structural intensity from demographic scale.
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718078]">
              Controlled Model Explained Variance
            </span>
            <span className="badge badge-forest font-mono font-bold">R²</span>
          </div>
          <div className="text-3xl font-extrabold text-[#183B32] font-mono mt-1">
            {controlled_regression?.r2}
          </div>
          <p className="text-xs text-[#718078] mt-2.5 leading-relaxed">
            Standardized multivariate model explaining 81.6% of per-capita emissions variation.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Processing clean-energy adoption distributions and econometric models..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchImpactData} />
      ) : (
        <>
          {/* Section 1: Scatter Plots (Total vs Per Capita) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Scatter 1: Renewables vs Total CO2 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    1. Renewable Share vs Total CO₂ Emissions ({latest_year})
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    Percentage renewable energy share vs national annual emissions (Mt CO₂)
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#F2F7F4] text-[#276749] px-2.5 py-1 rounded border border-[#E2E9E4]">
                  79 Nations
                </span>
              </div>

              <div style={{ width: '100%', height: 360, minHeight: 360, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="renewables_share"
                      name="Renewable Share"
                      stroke={tickColor}
                      fontSize={11}
                      unit="%"
                      axisLine={{ stroke: axisColor }}
                      label={{ value: 'Renewable Energy Share (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#718078' }}
                    />
                    <YAxis
                      dataKey="co2"
                      name="Total CO₂"
                      stroke={tickColor}
                      fontSize={11}
                      axisLine={{ stroke: axisColor }}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      label={{ value: 'CO₂ Emissions (Mt)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#718078' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{item.country}</p>
                              <p className="val text-[#276749] font-bold">Renewable Share: {item.renewables_share}%</p>
                              <p className="val text-[#183B32] font-semibold mt-0.5">Total CO₂: {item.co2.toLocaleString()} Mt</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={scatter_points}
                      fill="#276749"
                      fillOpacity={0.7}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter 2: Renewables vs CO2 per Capita */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    2. Renewable Share vs CO₂ per Capita ({latest_year})
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    Renewable energy share (%) vs emissions per person (tonnes/person)
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#E8F0EA] text-[#183B32] px-2.5 py-1 rounded border border-[#CBDED0]">
                  Per Capita
                </span>
              </div>

              <div style={{ width: '100%', height: 360, minHeight: 360, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="renewables_share"
                      name="Renewable Share"
                      stroke={tickColor}
                      fontSize={11}
                      unit="%"
                      axisLine={{ stroke: axisColor }}
                      label={{ value: 'Renewable Energy Share (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#718078' }}
                    />
                    <YAxis
                      dataKey="co2_per_capita"
                      name="CO₂ / Capita"
                      stroke={tickColor}
                      fontSize={11}
                      axisLine={{ stroke: axisColor }}
                      label={{ value: 'CO₂ per Capita (tonnes)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#718078' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{item.country}</p>
                              <p className="val text-[#276749] font-bold">Renewable Share: {item.renewables_share}%</p>
                              <p className="val text-[#183B32] font-semibold mt-0.5">
                                CO₂ / Capita: {item.co2_per_capita} tonnes
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={scatter_points}
                      fill="#3B9471"
                      fillOpacity={0.75}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Section 2: Adoption Quartiles & Controlled Standardized Regression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Chart 3: Adoption Groups Bar Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    3. Emissions Across Renewable Adoption Quartiles
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    Average CO₂ per capita across Low, Moderate, High, and Very High adoption tiers
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#F2F7F4] text-[#276749] px-2.5 py-1 rounded border border-[#E2E9E4]">
                  Quartiles
                </span>
              </div>

              <div style={{ width: '100%', height: 360, minHeight: 360, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adoption_groups} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis 
                      dataKey="group" 
                      stroke="#26332E" 
                      fontSize={11} 
                      axisLine={{ stroke: axisColor }}
                    />
                    <YAxis 
                      stroke={tickColor} 
                      fontSize={11} 
                      axisLine={{ stroke: axisColor }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{item.group} Adoption Tier</p>
                              <p className="val text-[#26332E]">
                                Avg Renewable Share: <strong>{item.average_renewable_share}%</strong>
                              </p>
                              <p className="val text-[#183B32] font-bold mt-0.5">
                                Avg CO₂ / Capita: {item.average_co2_per_capita} tonnes
                              </p>
                              <p className="text-[11px] text-[#718078] mt-1 font-mono">
                                Fossil Share: {item.average_fossil_share}% | N = {item.observations}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="average_co2_per_capita" fill="#70A58B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Controlled Standardized Regression Horizontal Bar */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    4. Controlled Standardized Regression Coefficients (β)
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    Standard deviation change in per-capita CO₂ per 1 SD change in predictor
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#E8F0EA] text-[#183B32] px-2.5 py-1 rounded border border-[#CBDED0]">
                  R² = {controlled_regression?.r2}
                </span>
              </div>

              <div style={{ width: '100%', height: 360, minHeight: 360, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={controlled_regression?.coefficients}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis 
                      type="number" 
                      stroke={tickColor} 
                      fontSize={11} 
                      domain={[-0.4, 0.9]} 
                      axisLine={{ stroke: axisColor }}
                    />
                    <YAxis 
                      dataKey="label" 
                      type="category" 
                      stroke="#26332E" 
                      fontSize={11} 
                      width={125}
                      tickLine={false}
                      axisLine={false} 
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="custom-tooltip">
                              <p className="label">{item.label}</p>
                              <p className="val text-[#183B32] font-bold text-sm">
                                Standardized β: {item.coefficient}
                              </p>
                              <p className="text-xs text-[#718078] mt-1 leading-relaxed">
                                Direction: {item.direction === 'negative' ? 'Negative association (mitigates emissions)' : 'Positive association (increases emissions)'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="coefficient" radius={[0, 4, 4, 0]}>
                      {controlled_regression?.coefficients?.map((entry, idx) => (
                        <Cell
                          key={`coef-${idx}`}
                          fill={entry.coefficient < 0 ? '#276749' : '#D49B48'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Section 3: Longitudinal Trends Over Time (2000–2022) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Chart 5: Renewable Share Over Time */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    5. Renewable Energy Share Over Time (2000–2022)
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    {selectedCountry && selectedCountry !== 'World'
                      ? `${selectedCountry} clean energy penetration trajectory`
                      : 'Global panel average across 79 countries'}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#E8F0EA] text-[#183B32] px-2.5 py-1 rounded border border-[#CBDED0]">
                  % Share
                </span>
              </div>

              <div style={{ width: '100%', height: 340, minHeight: 340, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={country_trends?.length > 0 ? country_trends : global_trends}
                    margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                  >
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
                      unit="%" 
                      tickLine={false}
                      axisLine={{ stroke: axisColor }} 
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="custom-tooltip">
                              <p className="label">Year {label}</p>
                              <p className="val text-[#276749] font-bold text-sm">
                                Renewable Share: {payload[0].value}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      name="Renewable Share (%)"
                      dataKey={country_trends?.length > 0 ? 'country_renewable_share' : 'renewable_share'}
                      stroke="#3B9471"
                      strokeWidth={2.75}
                      dot={{ r: 3, fill: '#3B9471', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#183B32' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Average CO2 per Capita Over Time */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    6. Territorial CO₂ Emissions per Capita Over Time
                  </h2>
                  <p className="text-xs text-[#718078] mt-0.5">
                    {selectedCountry && selectedCountry !== 'World'
                      ? `${selectedCountry} per-capita intensity (tonnes/person)`
                      : 'Panel average emissions intensity per capita'}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-[#F2F7F4] text-[#276749] px-2.5 py-1 rounded border border-[#E2E9E4]">
                  t / person
                </span>
              </div>

              <div style={{ width: '100%', height: 340, minHeight: 340, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={country_trends?.length > 0 ? country_trends : global_trends}
                    margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                  >
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
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="custom-tooltip">
                              <p className="label">Year {label}</p>
                              <p className="val text-[#183B32] font-bold text-sm">
                                CO₂ per Capita: {payload[0].value} tonnes
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      name="CO₂ / Capita (t)"
                      dataKey={country_trends?.length > 0 ? 'country_co2_per_capita' : 'co2_per_capita'}
                      stroke="#276749"
                      strokeWidth={2.75}
                      dot={{ r: 3, fill: '#276749', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#183B32' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Scientific Disclaimer on Association vs Causation */}
          <div className="card bg-[#FFFBF0] border-[#F1E3C6] mb-8 p-5">
            <div className="flex items-start gap-3.5 text-xs text-[#8C6B1F]">
              <AlertTriangle className="w-5 h-5 text-[#D49B48] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-[#8C6B1F]">Methodological Caution: Statistical Association vs Causation</p>
                <p className="mt-1 text-[#8C6B1F] leading-relaxed">
                  These econometric relationships illustrate empirical correlations and controlled partial regression associations 
                  within an observational panel. While renewable adoption exhibits a statistically significant negative association 
                  with per-capita emissions ($\beta = -0.061$) when holding fossil fuel dependency, GDP, and energy intensity constant, 
                  multivariate regression in observational panels cannot definitively prove unilateral causation in the absence of exogenous instrumental variables.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attribution Footnote */}
      <DataSourceNote
        notes={[
          'Clean energy metrics are integrated from Our World in Data Energy and CO₂ databases.',
          'Standardized regression coefficients (β) reflect changes in per-capita emissions in standard-deviation units for every 1 SD increase in each predictor.',
        ]}
      />
    </div>
  );
}
