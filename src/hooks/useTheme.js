import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'calculator-theme';
const THEME_COLORS = { dark: '#1a1a2e', light: '#f0f2f5' };

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

// preference is 'system', 'light' or 'dark'
export const useTheme = () => {
    const [preference, setPreference] = useState(() => {
        const saved = loadJSON(STORAGE_KEY, 'system');
        return ['system', 'light', 'dark'].includes(saved) ? saved : 'system';
    });
    const [systemDark, setSystemDark] = useState(() => systemQuery().matches);

    useEffect(() => {
        const mediaQuery = systemQuery();
        const handleChange = (event) => setSystemDark(event.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const darkMode = preference === 'system' ? systemDark : preference === 'dark';

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', darkMode ? THEME_COLORS.dark : THEME_COLORS.light);
    }, [darkMode]);

    useEffect(() => {
        saveJSON(STORAGE_KEY, preference);
    }, [preference]);

    return {
        darkMode,
        isSystemTheme: preference === 'system',
        toggleTheme: () => setPreference(darkMode ? 'light' : 'dark'),
        resetToSystemTheme: () => setPreference('system'),
    };
};
