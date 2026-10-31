import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Globe
} from 'lucide-react';
import api from '../services/api';
import { useCountry } from '../context/CountryContext';
import CountrySelector from '../components/CountrySelector';
import LoadingState from '../components/LoadingState';
import ErrorAlert from '../components/ErrorAlert';
import DataSourceNote from '../components/DataSourceNote';
import { useTheme } from '../context/ThemeContext';

export default function Forecast() {
  const { isDark } = useTheme();
  const { globalCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState(globalCountry || 'United States');
  const [horizon, setHorizon] = useState(5);

  const [data, setData] = useState(null);
  const [baselineData, setBaselineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [forecastRes, evalRes] = await Promise.all([
        api.getForecast(selectedCountry, horizon),
        api.getModelEvaluation(),
      ]);
      setData(forecastRes);
      setBaselineData(evalRes.forecasting_vs_baseline || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch forecasting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [selectedCountry, horizon]);

  const {
    country: displayCountry,
    is_global,
    start_forecast_year,
    end_forecast_year,
    latest_historical_year,
    chart_data,
    forecast_table,
    test_evaluation,
    assumptions,
  } = data || {};

  const gridColor = isDark ? '#30443A' : '#E2E9E4';
  const axisColor = isDark ? '#30443A' : '#E2E9E4';
  const tickColor = isDark ? '#A5B6AB' : '#718078';

  return (
    <div className="layout-container">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow-label">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>AUTOREGRESSIVE TEMPORAL PROJECTIONS (2023–2027)</span>
          </div>
          <h1 className="page-title">Future CO₂ Emission Projections</h1>
          <p className="page-subtitle">
            Lag-based Gradient Boosting time-series projections incorporating country-specific CO₂ lags (t-1, t-2, t-3). 
            Evaluated against rolling origins and naïve persistence benchmarks.
          </p>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center gap-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] p-2 rounded-lg shadow-xs self-start md:self-auto">
          <Clock className="w-4 h-4 text-[var(--accent-secondary)] ml-1" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Horizon:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  horizon === h
                    ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                +{h}y ({2022 + h})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar: Geography Filter & Visual Legend */}
      <div className="card mb-8 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <CountrySelector
            value={selectedCountry}
            onChange={setSelectedCountry}
            allowWorld={true}
            label="Target Geography (Country or Global Panel)"
          />
        </div>

        <div className="text-xs text-[#718078] flex flex-wrap items-center gap-3 self-start sm:self-center font-medium bg-[#F7F9F7] px-3.5 py-2 rounded-md border border-[#E2E9E4]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#276749] inline-block" />
            <strong className="text-[#183B32]">Observed:</strong> 2003–2022 (Solid)
          </span>
          <span className="text-[#CBD7CE]">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#70A58B] border border-[#276749] border-dashed inline-block" />
            <strong className="text-[#183B32]">Projected:</strong> {start_forecast_year}–{end_forecast_year} (Dashed)
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingState message={`Computing multi-step autoregressive projections for ${selectedCountry}...`} />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchForecastData} />
      ) : (
        <>
          {/* Main Historical vs Forecast Line Chart */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF3EF]">
              <div>
                <h2 className="text-sm font-bold text-[#183B32] tracking-tight flex items-center gap-2">
                  <span>{displayCountry}:</span>
                  <span className="text-[#276749]">Historical Trajectory vs Conditional Projections</span>
                </h2>
                <p className="text-xs text-[#718078] mt-0.5">
                  Observed historical emissions (solid dark green) and recursive model forecast (dashed muted teal) in Mt CO₂
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold bg-[#E8F0EA] text-[#183B32] px-2.5 py-1 rounded border border-[#CBDED0]">
                Mt CO₂
              </span>
            </div>

            <div style={{ width: '100%', height: 420, minHeight: 420, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart_data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
                        const histVal = payload.find((p) => p.dataKey === 'historical')?.value;
                        const foreVal = payload.find((p) => p.dataKey === 'forecast')?.value;
                        const isProj = Number(label) > latest_historical_year;

                        return (
                          <div className="custom-tooltip">
                            <p className="label">
                              {displayCountry} — Year {label} {isProj ? '(Projected)' : '(Observed)'}
                            </p>
                            {histVal !== undefined && histVal !== null && !isProj && (
                              <p className="val text-[#183B32] font-bold text-sm">
                                Observed: {histVal.toLocaleString()} Mt CO₂
                              </p>
                            )}
                            {foreVal !== undefined && foreVal !== null && isProj && (
                              <p className="val text-[#276749] font-bold text-sm">
                                Projected: {foreVal.toLocaleString()} Mt CO₂
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    iconType="plainline" 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} 
                  />
                  {/* Historical Observed Series */}
                  <Line
                    type="monotone"
                    name="Observed Historical"
                    dataKey="historical"
                    stroke="#276749"
                    strokeWidth={2.75}
                    dot={{ r: 3, fill: '#276749', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    connectNulls={false}
                  />
                  {/* Projected Series */}
                  <Line
                    type="monotone"
                    name="Conditional Projected"
                    dataKey="forecast"
                    stroke="#70A58B"
                    strokeWidth={2.75}
                    strokeDasharray="6 6"
                    dot={{ r: 4.5, fill: '#70A58B', stroke: '#183B32', strokeWidth: 1.5 }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid: Projections Table & Assumptions / Persistence Baseline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Table of Projected Values */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF3EF]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B32]">
                  Projected Values Breakdown ({start_forecast_year}–{end_forecast_year})
                </h3>
                <span className="text-xs text-[#718078] font-mono bg-[#F7F9F7] px-2 py-0.5 rounded border border-[#E2E9E4]">
                  {forecast_table?.length} forward steps
                </span>
              </div>

              <div className="data-table-container">
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Forecast Year</th>
                      <th>Projected Emissions</th>
                      <th>Unit</th>
                      <th>Conditionality Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast_table?.map((row) => (
                      <tr key={row.year}>
                        <td className="font-bold text-[#183B32]">{row.year}</td>
                        <td className="font-mono text-[#276749] font-bold text-sm">
                          {row.predicted_co2?.toLocaleString()}
                        </td>
                        <td className="text-[#718078] font-mono">{row.unit}</td>
                        <td>
                          <span className="badge badge-forest">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {test_evaluation && (
                <div className="mt-5 pt-3.5 border-t border-[#EEF3EF] text-xs text-[#718078] space-y-1.5">
                  <span className="font-bold text-[#183B32]">Chronological Validation Performance:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                    <div className="bg-[#F7F9F7] p-2.5 rounded border border-[#E2E9E4]">
                      <strong>Val (2017–2020):</strong> MAE {test_evaluation.validation?.mae} Mt | R² {test_evaluation.validation?.r2}
                    </div>
                    <div className="bg-[#F7F9F7] p-2.5 rounded border border-[#E2E9E4]">
                      <strong>Test (2021–2022):</strong> MAE {test_evaluation.test?.mae} Mt | R² {test_evaluation.test?.r2}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assumptions & Persistence Benchmark Box */}
            <div className="space-y-5">
              
              {/* Assumptions Box */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#EEF3EF] text-xs font-bold text-[#183B32] uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-[#276749]" />
                  <span>Forecasting Assumptions & Methodology</span>
                </div>
                <ul className="text-xs text-[#26332E] space-y-2.5 list-disc pl-4 leading-relaxed">
                  {assumptions?.map((item, idx) => (
                    <li key={idx}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Persistence Baseline Benchmark */}
              <div className="card bg-[#F7F9F7] border-[#E2E9E4]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B32] mb-2">
                  Out-of-Time Persistence Baseline Benchmark
                </h3>
                <p className="text-xs text-[#718078] mb-3 leading-relaxed">
                  In chronological experimental evaluation (Notebook 10), the naïve persistence baseline 
                  (carrying forward last year's observed emissions) benchmarked against Gradient Boosting:
                </p>
                <div className="data-table-container">
                  <table className="data-table text-xs bg-white">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>MAE (Mt)</th>
                        <th>RMSE (Mt)</th>
                        <th>R²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baselineData?.map((b) => (
                        <tr key={b.Model}>
                          <td className="font-semibold text-[#183B32]">{b.Model}</td>
                          <td className="font-mono">{b.MAE}</td>
                          <td className="font-mono">{b.RMSE}</td>
                          <td className="font-mono text-[#276749] font-bold">{b.R2 || b['R²']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-[#718078] mt-2.5 italic leading-relaxed">
                  Note: The persistence baseline outperformed Gradient Boosting in chronological test RMSE, 
                  underscoring strong structural emissions inertia and validating the necessity of conditional modeling.
                </p>
              </div>

            </div>

          </div>
        </>
      )}

      {/* Attribution Footnote */}
      <DataSourceNote
        notes={[
          'Forecasting horizon is limited to 5 years (2023–2027) as recursive multi-step autoregressive errors compound across extended windows.',
          'Forecasts are conditional projections holding 2022 macroeconomic and energy system indicators constant.',
        ]}
      />
    </div>
  );
}
