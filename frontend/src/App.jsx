import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CountryProvider } from './context/CountryContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import DataExplorer from './pages/DataExplorer';
import Prediction from './pages/Prediction';
import Forecast from './pages/Forecast';
import RenewableImpact from './pages/RenewableImpact';

export default function App() {
  return (
    <ThemeProvider>
      <CountryProvider>
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
          <Navbar />
          
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/explorer" element={<DataExplorer />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/renewable-impact" element={<RenewableImpact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-6 text-center text-xs text-[var(--text-secondary)] transition-colors duration-200">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[var(--text-primary)] font-medium">
                <strong className="text-[var(--accent-secondary)]">CO₂ Emissions & Sustainability Research Platform</strong> • Final-Year Engineering Project
              </p>
              <p className="text-[var(--text-secondary)] font-mono text-[11px]">
                FastAPI REST Backend • React 18 + Vite • OWID Empirical Foundations
              </p>
            </div>
          </footer>
        </div>
      </CountryProvider>
    </ThemeProvider>
  );
}
