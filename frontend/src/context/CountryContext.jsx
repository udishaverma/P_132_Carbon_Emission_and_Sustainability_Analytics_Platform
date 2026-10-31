import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CountryContext = createContext(null);

export function CountryProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [globalCountry, setGlobalCountry] = useState('United States');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCountryList() {
      try {
        setLoadingCountries(true);
        const data = await api.getCountries();
        if (isMounted) {
          setCountries(data.countries || []);
          // If United States is present, keep it, otherwise pick the first
          if (data.countries && data.countries.length > 0) {
            const hasUS = data.countries.some((c) => c.country === 'United States');
            if (!hasUS) {
              setGlobalCountry(data.countries[0].country);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load countries:', err);
          setCountriesError('Failed to load country list from API');
        }
      } finally {
        if (isMounted) {
          setLoadingCountries(false);
        }
      }
    }
    fetchCountryList();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CountryContext.Provider
      value={{
        countries,
        globalCountry,
        setGlobalCountry,
        loadingCountries,
        countriesError,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
