import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Award, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useCountry } from '../context/CountryContext';
import CountrySelector from '../components/CountrySelector';
import LoadingState from '../components/LoadingState';
import ErrorAlert from '../components/ErrorAlert';
import DataSourceNote from '../components/DataSourceNote';
import { useTheme } from '../context/ThemeContext';

export default function Prediction() {
  const { isDark } = useTheme();
  const { globalCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState(globalCountry || 'United States');
  const [selectedYear, setSelectedYear] = useState(2022);

  // Metadata & state
  const [metadata, setMetadata] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input form state
  const [formInputs, setFormInputs] = useState({});
  const [selectedModel, setSelectedModel] = useState('Gradient Boosting');

  // Prediction output
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  // Load metadata and test diagnostics on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [metaRes, diagRes] = await Promise.all([
          api.getPredictionMetadata(),
          api.getPredictionDiagnostics(100),
        ]);
        setMetadata(metaRes);
        setDiagnostics(diagRes);
      } catch (err) {
        setError(err.message || 'Failed to load model metadata');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Pre-fill form inputs from actual country-year feature record
  const loadCountryFeatures = async (country, year) => {
    try {
      setFeaturesLoading(true);
      setPredictionError(null);
      const res = await api.getCountryFeatures(country, year);
      if (res && res.features) {
        setFormInputs(res.features);
      }
    } catch (err) {
      console.warn('Could not fetch exact historical features for country/year:', err);
    } finally {
      setFeaturesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      loadCountryFeatures(selectedCountry, selectedYear);
    }
  }, [selectedCountry, selectedYear]);

  const handleInputChange = (featName, val) => {
    setFormInputs((prev) => ({
      ...prev,
      [featName]: parseFloat(val) || 0,
    }));
  };

  const handleRunPrediction = async (e) => {
    e.preventDefault();
    try {
      setPredicting(true);
      setPredictionError(null);
      const payload = {
        ...formInputs,
        year: Number(formInputs.year || selectedYear),
        model_name: selectedModel,
      };
      const res = await api.runPrediction(payload);
      setPredictionResult(res);
    } catch (err) {
      setPredictionError(err.message || 'Prediction execution failed');
    } finally {
      setPredicting(false);
    }
  };

  if (loading && !metadata) {
    return (
      <div className="layout-container">
        <LoadingState message="Initializing trained regression pipeline and feature metadata..." />
      </div>
    );
  }

  const featureLabels = metadata?.feature_labels || {};
  const featureList = metadata?.features || [];
  const evalResults = metadata?.evaluation_results || [];
  const featureImportance = metadata?.feature_importance || [];

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
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>MACHINE LEARNING INFERENCE PIPELINE</span>
          </div>
          <h1 className="page-title">Regression Prediction Model</h1>
          <p className="page-subtitle">
            Demonstrating the selected Gradient Boosting Regressor (Held-out Test R² = 0.9973, MAE = 22.57 Mt). 
            Generate interactive emission predictions parameterized by 13 verified socioeconomic and energy predictors.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3.5 py-2 rounded-lg text-xs text-[var(--text-primary)] font-semibold self-start md:self-auto">
          <Award className="w-4 h-4 text-[var(--accent-secondary)]" />
          <span>Selected Algorithm: <strong>Gradient Boosting</strong></span>
        </div>
      </div>

      {error && <ErrorAlert message={error} className="mb-6" />}

      {/* Main Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Form & Predictor Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card">
            
            {/* Form Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEF3EF]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#276749]" />
                <h2 className="text-sm font-bold text-[#183B32] tracking-tight">
                  Model Predictors (13 Features)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => loadCountryFeatures(selectedCountry, selectedYear)}
                disabled={featuresLoading}
                className="text-xs text-[#276749] hover:text-[#183B32] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to {selectedCountry} ({selectedYear})
              </button>
            </div>

            {/* Baseline Profile Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-4 bg-[#F7F9F7] border border-[#E2E9E4] rounded-lg">
              <CountrySelector
                value={selectedCountry}
                onChange={setSelectedCountry}
                label="Baseline Country Profile"
              />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718078] mb-1.5">
                  Reference Baseline Year
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    aria-label="Reference Baseline Year"
                    className="w-full h-10 bg-white border border-[#E2E9E4] hover:border-[#CBD7CE] focus:border-[#276749] rounded-md px-3.5 pr-8 text-xs font-semibold text-[#183B32] cursor-pointer"
                  >
                    {Array.from({ length: 23 }, (_, i) => 2022 - i).map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr} Profile
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#718078] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRunPrediction}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[480px] overflow-y-auto pr-2 py-1">
                {featureList.map((feat) => {
                  const label = featureLabels[feat] || feat;
                  const val = formInputs[feat] !== undefined ? formInputs[feat] : '';
                  const stats = metadata?.feature_stats?.[feat];

                  return (
                    <div key={feat} className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-[var(--text-primary)] truncate" title={label}>
                          {label}
                        </label>
                        {stats && (
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                            [{stats.min?.toFixed(0)} – {stats.max?.toFixed(0)}]
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleInputChange(feat, e.target.value)}
                        required
                        className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-color)] focus:border-[var(--accent-secondary)] rounded px-2.5 text-xs font-mono text-[var(--text-primary)]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Algorithm Selector & Submit Button */}
              <div className="mt-6 pt-4 border-t border-[#EEF3EF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#26332E] w-full sm:w-auto">
                  <span className="font-bold text-[#183B32]">Model:</span>
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      aria-label="Model"
                      className="h-10 bg-white border border-[#E2E9E4] rounded-md px-3 pr-7 text-xs font-semibold text-[#183B32] cursor-pointer"
                    >
                      <option value="Gradient Boosting">Gradient Boosting (Selected)</option>
                      <option value="Random Forest">Random Forest</option>
                      <option value="Linear Regression">Linear Regression (Scaled)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#718078] absolute right-2.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={predicting || featuresLoading}
                  className="btn-primary w-full sm:w-auto h-10 px-6 font-bold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{predicting ? 'Computing Inference...' : 'Generate Prediction'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Right Column: Visually Prominent Output Card & Evaluation Benchmark (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prominent Output Card */}
          <div className="card border-[#CBDED0] bg-gradient-to-b from-[#E8F0EA]/70 to-[#FFFFFF] p-6 shadow-[0_2px_8px_rgba(24,59,50,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <span className="badge badge-forest font-bold uppercase tracking-wider">
                MODEL INFERENCE RESULT
              </span>
              <span className="text-[11px] font-mono text-[#276749] font-bold bg-white px-2 py-0.5 rounded border border-[#CBDED0]">
                {selectedModel}
              </span>
            </div>

            {predictionError && (
              <div className="p-3.5 bg-[#FDF2F2] border border-[#F8D7DA] rounded-lg text-xs text-[#842029] mb-3">
                {predictionError}
              </div>
            )}

            {predictionResult ? (
              <div className="mt-4">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#718078]">
                  Predicted Annual Territorial Emissions
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#183B32] font-mono tracking-tight">
                    {predictionResult.predicted_co2?.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-[#276749]">
                    {predictionResult.unit}
                  </span>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#CBDED0] space-y-2 text-xs text-[#26332E]">
                  <p className="flex items-center gap-2 text-[#183B32] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#276749] flex-shrink-0" />
                    <span>Inference executed across all 13 engineered predictors.</span>
                  </p>
                  <p className="text-[11px] text-[#718078] italic leading-relaxed">
                    {predictionResult.note}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-[#718078]">
                <Cpu className="w-9 h-9 mx-auto text-[#70A58B] mb-2.5 opacity-70" />
                <p className="text-xs font-bold text-[#183B32]">
                  Awaiting Feature Inputs
                </p>
                <p className="text-[11px] text-[#718078] mt-1 max-w-xs mx-auto leading-relaxed">
                  Adjust values on the left or click "Generate Prediction" to pass the parameter vector to the model.
                </p>
              </div>
            )}

            {/* Methodological Caveat */}
            <div className="mt-5 p-3.5 bg-[#FFFBF0] border border-[#F1E3C6] rounded-lg text-[11px] text-[#8C6B1F] flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-[#D49B48] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Methodological Disclosure:</strong> Predicted values represent model estimates 
                conditioned on empirical features, distinct from recorded historical observations. 
                Validation performance does not guarantee identical generalization during structural breaks.
              </span>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="card p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#183B32] mb-3 pb-2 border-b border-[#EEF3EF]">
              Algorithm Leaderboard (Held-Out Test Set)
            </h2>
            <div className="data-table-container">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>MAE (Mt)</th>
                    <th>RMSE (Mt)</th>
                    <th>R²</th>
                  </tr>
                </thead>
                <tbody>
                  {evalResults.map((r) => {
                    const isSelected = r.Model === selectedModel;
                    return (
                      <tr key={r.Model} className={isSelected ? 'bg-[#E8F0EA] font-semibold text-[#183B32]' : ''}>
                        <td className="text-[#183B32]">
                          {r.Model} {isSelected && '★'}
                        </td>
                        <td className="font-mono">{r.MAE}</td>
                        <td className="font-mono">{r.RMSE}</td>
                        <td className="font-mono text-[#276749] font-bold">{r.R2 || r['R²']}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Feature Importance & Diagnostics Charts (Responsive 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Feature Importance Bar Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Predictor Importance (Gradient Boosting)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Relative impurity decrease contribution across all 13 features
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              % Contribution
            </span>
          </div>

          <div style={{ width: '100%', height: 380, minHeight: 380, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis 
                  type="number" 
                  stroke={tickColor} 
                  fontSize={11} 
                  tickFormatter={(v) => `${v}%`} 
                  axisLine={{ stroke: axisColor }}
                />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  stroke={labelColor} 
                  fontSize={10} 
                  width={130}
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
                          <p className="val text-[var(--text-primary)] font-bold text-sm">
                            Importance: {item.percentage}%
                          </p>
                          <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                            Raw Gini score: {item.importance}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" fill="#276749" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Test Set Actual vs Predicted Scatter Plot */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Held-Out Test Set: Actual vs Predicted
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Model evaluation across 273 untouched out-of-sample country-year observations
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-[var(--bg-secondary)] text-[var(--accent-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              R² = 0.9973
            </span>
          </div>

          <div style={{ width: '100%', height: 380, minHeight: 380, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="actual"
                  name="Actual"
                  stroke={tickColor}
                  fontSize={11}
                  axisLine={{ stroke: axisColor }}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  label={{ value: 'Actual CO₂ Emissions (Mt)', position: 'insideBottom', offset: -10, fontSize: 11, fill: tickColor }}
                />
                <YAxis
                  dataKey="predicted"
                  name="Predicted"
                  stroke={tickColor}
                  fontSize={11}
                  axisLine={{ stroke: axisColor }}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  label={{ value: 'Predicted CO₂ (Mt)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: tickColor }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <p className="label">{item.country} ({item.year})</p>
                          <p className="val text-[#26332E]">Actual: <strong>{item.actual} Mt</strong></p>
                          <p className="val text-[#183B32] font-bold">Predicted: {item.predicted} Mt</p>
                          <p className="text-[11px] font-mono text-[#718078] mt-1">Residual: {item.residual} Mt</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Test Samples" 
                  data={diagnostics?.test_points || []} 
                  fill="#70A58B" 
                  fillOpacity={0.7} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Attribution Footnote */}
      <DataSourceNote
        notes={[
          'Predictive features are normalized and processed through scikit-learn pipelines.',
          'Primary energy consumption and population account for over 98% of model splitting gain in Gradient Boosting.',
        ]}
      />
    </div>
  );
}
