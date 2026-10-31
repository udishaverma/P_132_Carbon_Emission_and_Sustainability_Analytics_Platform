import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from 'react-simple-maps';
import { 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  BarChart3, 
  Award,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import LoadingState from './LoadingState';
import ErrorAlert from './ErrorAlert';

// TopoJSON path in the public folder (zero network request required)
const GEO_URL = '/countries-110m.json';

function GlobalEmissionsMap({ selectedYear = 2022 }) {
  const { isDark } = useTheme();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 15], zoom: 1 });
  
  // Interactive tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    country: '',
    iso: '',
    co2: null,
    year: selectedYear,
    rank: null,
    totalRanked: null,
    percentile: null,
    tierName: '',
    color: '',
    x: 0,
    y: 0,
  });

  // Pinned country on click for persistent inspection
  const [pinnedCountry, setPinnedCountry] = useState(null);

  // Active tier filter highlight (null = show all)
  const [activeTierFilter, setActiveTierFilter] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchEmissions() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMapEmissions(selectedYear);
        if (isMounted) {
          setMapData(res);
          // If a pinned country exists, update its data for the new year
          if (pinnedCountry) {
            const updated = res.countries[pinnedCountry.iso_code] || res.countries[pinnedCountry.iso_num];
            setPinnedCountry(updated || null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch global emissions map data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEmissions();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Zoom handlers
  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.4, 7),
    }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.4, 1),
    }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [0, 15], zoom: 1 });
  };

  const handleMoveEnd = (newPosition) => {
    setPosition(newPosition);
  };

  // Hover handlers
  const handleMouseEnter = (geo, countryData, evt) => {
    const geoName = geo.properties?.name || 'Unknown Territory';
    
    // Calculate coordinates relative to map container
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      if (countryData) {
        setTooltip({
          visible: true,
          country: countryData.country,
          iso: countryData.iso_code,
          co2: countryData.co2,
          year: countryData.year,
          rank: countryData.rank,
          totalRanked: countryData.total_ranked,
          percentile: countryData.percentile,
          tierName: countryData.tier_name,
          color: countryData.color,
          tier: countryData.tier,
          x,
          y,
        });
      } else {
        setTooltip({
          visible: true,
          country: geoName,
          iso: geo.id,
          co2: null,
          year: selectedYear,
          rank: null,
          totalRanked: null,
          percentile: null,
          tierName: 'No data',
          color: isDark ? '#253830' : '#E2E9E4',
          tier: -1,
          x,
          y,
        });
      }
    }
  };

  const handleMouseMove = (evt) => {
    if (containerRef.current && tooltip.visible) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip((prev) => ({
        ...prev,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleCountryClick = (geo, countryData) => {
    if (countryData) {
      if (pinnedCountry?.iso_code === countryData.iso_code) {
        setPinnedCountry(null); // Toggle off
      } else {
        setPinnedCountry(countryData);
      }
    } else {
      const geoName = geo.properties?.name || 'Unknown Territory';
      setPinnedCountry({
        country: geoName,
        iso_code: geo.id,
        year: selectedYear,
        co2: null,
        tier_name: 'No data',
        noData: true
      });
    }
  };

  // Theme-adaptive fill colors
  const noDataFill = isDark ? '#22332A' : '#E6ECE7';
  const strokeColor = isDark ? '#14211B' : '#FFFFFF';
  const strokeHighlight = isDark ? '#E7F0EA' : '#183B32';

  return (
    <div className="card mb-8 p-5 sm:p-6 transition-all duration-200">
      {/* Header section with Title, Subtitle, and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="eyebrow-label">
            <Globe className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span>INTERACTIVE GEOGRAPHIC EXPLORER • OWID GLOBAL CATALOG</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Global CO₂ Emissions Distribution
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 max-w-3xl">
            Explore the geographical distribution of annual CO₂ emissions across countries. 
            Color-coded using a 5-tier quantile classification calculated from genuine sovereign territorial emissions.
          </p>
        </div>

        {/* Right Badges & Indicators */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {mapData?.total_countries > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--bg-secondary)] text-[var(--accent-secondary)] rounded-md border border-[var(--border-color)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{mapData.total_countries} Nations Ranked</span>
            </span>
          )}
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md border border-[var(--border-color)]">
            Snapshot: {selectedYear}
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden my-4 border border-[var(--border-color)] bg-[var(--bg-main)] transition-colors select-none"
        style={{ minHeight: '440px', height: '520px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-xs flex items-center justify-center z-20">
            <LoadingState message={`Loading global emissions for ${selectedYear}...`} />
          </div>
        )}

        {/* Error Overlay */}
        {error && !loading && (
          <div className="absolute inset-0 bg-[var(--bg-main)]/90 flex items-center justify-center p-6 z-20">
            <ErrorAlert message={error} onRetry={() => api.getMapEmissions(selectedYear)} />
          </div>
        )}

        {/* Floating Zoom and Pan Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10 bg-[var(--bg-surface)]/90 backdrop-blur-xs p-1 rounded-md border border-[var(--border-color)] shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-secondary)] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-secondary)] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-[var(--border-color)] my-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset View"
            aria-label="Reset View"
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-secondary)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Tooltip following mouse cursor */}
        {tooltip.visible && !loading && (
          <div
            className="pointer-events-none absolute z-30 transition-transform duration-75 ease-out shadow-lg"
            style={{
              left: `${Math.min(Math.max(tooltip.x + 14, 12), (containerRef.current?.clientWidth || 800) - 240)}px`,
              top: `${Math.min(Math.max(tooltip.y - 75, 12), (containerRef.current?.clientHeight || 500) - 130)}px`,
            }}
          >
            <div className="bg-[var(--tooltip-bg)] text-[var(--text-primary)] border border-[var(--tooltip-border)] rounded-md px-3.5 py-2.5 shadow-md backdrop-blur-md min-w-[200px] text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-1.5 mb-1.5">
                <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] truncate">
                  {tooltip.country}
                </span>
                {tooltip.iso && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[var(--bg-secondary)] text-[var(--accent-secondary)] border border-[var(--border-color)] rounded">
                    {tooltip.iso}
                  </span>
                )}
              </div>

              {tooltip.co2 !== null && tooltip.co2 !== undefined ? (
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[var(--text-secondary)] font-medium">CO₂ Emissions:</span>
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                      {tooltip.co2.toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-secondary)]">Mt</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-[var(--text-secondary)]">Global Rank:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      #{tooltip.rank} <span className="text-[10px] font-normal text-[var(--text-secondary)]">of {tooltip.totalRanked}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] pt-1 border-t border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Classification:</span>
                    <span 
                      className="font-semibold px-1.5 py-0.5 rounded text-[10px] text-white"
                      style={{ backgroundColor: tooltip.color }}
                    >
                      {tooltip.tierName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[var(--text-secondary)] text-[11px] italic">
                  No recorded emissions data for {selectedYear}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pinned Inspector Card (bottom-left) when a country is clicked */}
        {pinnedCountry && !loading && (
          <div className="absolute bottom-3 left-3 z-20 max-w-xs w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-color)] rounded-lg p-3.5 shadow-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pinnedCountry.color || noDataFill }} />
                <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                  {pinnedCountry.country}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)]">({pinnedCountry.iso_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setPinnedCountry(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5 rounded transition-colors"
                title="Dismiss details"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {pinnedCountry.co2 !== null && pinnedCountry.co2 !== undefined ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Emissions ({selectedYear})</div>
                  <div className="font-mono font-bold text-[var(--text-primary)]">
                    {pinnedCountry.co2.toLocaleString()} Mt
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Global Standing</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    Rank #{pinnedCountry.rank}
                  </div>
                </div>
                <div className="col-span-2 pt-1 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)]">Quantile Standing:</span>
                  <span className="text-[11px] font-semibold text-[var(--accent-secondary)]">
                    {pinnedCountry.tier_name} ({pinnedCountry.percentile}% percentile)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-secondary)] italic">
                Territory has no reported territorial emissions in the OWID dataset for {selectedYear}.
              </div>
            )}
          </div>
        )}

        {/* SVG World Map */}
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 175,
            center: [0, 10],
          }}
          width={960}
          height={500}
          style={{ width: '100%', height: '100%', outline: 'none' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={7}
            translateExtent={[
              [-100, -100],
              [1060, 600],
            ]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // Primary match by 3-digit numeric ISO (geo.id) or country name
                  const countryData = mapData?.countries?.[geo.id] || mapData?.countries?.[geo.properties?.name];
                  
                  // Filter opacity if a specific tier is filtered in the legend
                  const isFilteredOut = activeTierFilter !== null && countryData && countryData.tier !== activeTierFilter;
                  const isNoDataFilteredOut = activeTierFilter !== null && activeTierFilter !== -1 && !countryData;
                  
                  // Fill color
                  let fill = countryData ? countryData.color : noDataFill;
                  if (isFilteredOut || isNoDataFilteredOut) {
                    fill = isDark ? '#1C2923' : '#EDF2EE';
                  }

                  const isPinned = pinnedCountry?.iso_code === countryData?.iso_code;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isPinned ? strokeHighlight : strokeColor}
                      strokeWidth={isPinned ? 1.5 : 0.55}
                      style={{
                        default: {
                          fill,
                          outline: 'none',
                          transition: 'fill 0.2s ease, stroke 0.2s ease',
                        },
                        hover: {
                          fill: countryData ? countryData.color : (isDark ? '#2D4438' : '#D2DCD4'),
                          stroke: strokeHighlight,
                          strokeWidth: 1.3,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill,
                          outline: 'none',
                        },
                      }}
                      onMouseEnter={(evt) => handleMouseEnter(geo, countryData, evt)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCountryClick(geo, countryData)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Horizontal Interactive Color Legend */}
      <div className="pt-3 pb-2 border-t border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Emissions Classification Legend (Quantiles):
            </span>
          </div>
          {activeTierFilter !== null && (
            <button
              type="button"
              onClick={() => setActiveTierFilter(null)}
              className="text-[11px] font-semibold text-[var(--accent-secondary)] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Reset filter (Show all)
            </button>
          )}
        </div>

        {/* Legend Grid Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {mapData?.legend ? (
            mapData.legend.map((item) => {
              const isSelected = activeTierFilter === item.tier;
              return (
                <button
                  type="button"
                  key={item.tier}
                  onClick={() => setActiveTierFilter(isSelected ? null : item.tier)}
                  className={`flex flex-col p-2 rounded-md border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent-secondary)] bg-[var(--bg-secondary)] shadow-xs ring-1 ring-[var(--accent-secondary)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  title={`Click to filter countries in ${item.label}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0 shadow-xs"
                      style={{
                        backgroundColor: item.tier === -1 
                          ? (isDark ? item.darkColor || '#253830' : item.color || '#E2E9E4')
                          : item.color,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <span className="font-bold text-[11px] text-[var(--text-primary)] truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)] pl-5.5">
                    {item.range}
                  </span>
                </button>
              );
            })
          ) : (
            // Fallback skeleton
            <div className="col-span-full text-xs text-[var(--text-secondary)]">Loading legend...</div>
          )}
        </div>

        {/* Methodological / Data Source Footnote */}
        <div className="mt-3.5 pt-2.5 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 leading-relaxed">
          <div className="flex items-start sm:items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--accent-sage)] flex-shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Methodology:</strong> Calculated using quintile distribution ({mapData?.thresholds ? `Q20=${mapData.thresholds[0]} Mt, Q40=${mapData.thresholds[1]} Mt, Q60=${mapData.thresholds[2]} Mt, Q80=${mapData.thresholds[3]} Mt` : '20th, 40th, 60th, 80th percentiles'}) to ensure fair distinction between major emitters and smaller developing nations.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] flex-shrink-0">
            Source: OWID Territorial CO₂ Catalog
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(GlobalEmissionsMap);