import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK } from './config';

const STORAGE_KEY = 'pokedex_theme_02240174';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load the saved choice when the app starts
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark') setIsDark(true);
      } catch (e) {
        console.warn('Could not load theme', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save whenever it changes
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light').catch((e) =>
      console.warn('Could not save theme', e)
    );
  }, [isDark, loaded]);

  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? DARK : LIGHT,
      toggleTheme: () => setIsDark((d) => !d),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);