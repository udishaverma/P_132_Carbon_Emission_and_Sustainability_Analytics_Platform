import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  BarChart3, 
  LineChart, 
  Cpu, 
  TrendingUp, 
  SunMedium, 
  Leaf, 
  Menu, 
  X,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import api from '../services/api';
import { useCountry } from '../context/CountryContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(null);
  const { globalCountry } = useCountry();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await api.checkHealth();
        setApiHealthy(res.status === 'healthy');
      } catch {
        setApiHealthy(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/', icon: BarChart3 },
    { name: 'Data Explorer', path: '/explorer', icon: LineChart },
    { name: 'Prediction', path: '/prediction', icon: Cpu },
    { name: 'Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Renewable Impact', path: '/renewable-impact', icon: SunMedium },
  ];

  return (
    <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-50 shadow-xs transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-secondary)] flex items-center justify-center text-white shadow-sm group-hover:brightness-90 transition-all flex-shrink-0">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-tight flex items-center gap-2">
                  <span>CO₂ Analytics Platform</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--accent-secondary)] border border-[var(--border-color)] rounded">
                    RESEARCH
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] hidden sm:block font-normal">
                  Our World in Data Empirical Panel (79 Nations)
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                      isActive
                        ? 'bg-[var(--bg-secondary)] text-[var(--accent-secondary)] border border-[var(--border-color)] font-bold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Meta Badges + Theme Toggle */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Active Global Country Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md text-xs text-[var(--text-primary)] transition-colors">
              <Globe className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span className="text-[var(--text-secondary)] font-normal">Active:</span>
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{globalCountry}</span>
            </div>

            {/* API Status Dot */}
            <div 
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md text-xs transition-colors"
              title={apiHealthy ? "FastAPI backend online on port 8000" : "Backend connecting..."}
            >
              <span 
                className={`w-2 h-2 rounded-full ${
                  apiHealthy === null 
                    ? 'bg-amber-400 animate-pulse' 
                    : apiHealthy 
                    ? 'bg-[var(--accent-secondary)] shadow-xs' 
                    : 'bg-red-500 shadow-xs'
                }`} 
              />
              <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)] hidden xl:inline">
                {apiHealthy ? 'API ONLINE' : 'API OFFLINE'}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#183B32]" />
              )}
            </button>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md focus:outline-none border border-[var(--border-color)]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#183B32]" />}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md focus:outline-none border border-[var(--border-color)]"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-4 space-y-1.5 shadow-md">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-[var(--bg-secondary)] text-[var(--accent-secondary)] font-bold border border-[var(--border-color)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-[var(--accent-secondary)]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 mt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] px-3 py-1">
            <span>Active Country: <strong className="text-[var(--text-primary)]">{globalCountry}</strong></span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-[var(--accent-secondary)]' : 'bg-red-500'}`} />
              {apiHealthy ? 'API Online' : 'API Disconnected'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
