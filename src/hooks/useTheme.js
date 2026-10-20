import { useEffect, useState } from 'react';
import { usePersistentState } from './usePersistentState';

const THEMES = ['system', 'light', 'dark'];
const THEME_COLORS = { dark: '#020617', light: '#f1f5f9' };

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

// preference is 'system', 'light' or 'dark'
export const useTheme = () => {
    const [preference, setPreference] = usePersistentState('calculator-theme', 'system', (value) =>
        THEMES.includes(value)
    );
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

    const cycleTheme = () =>
        setPreference((current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);

    return { preference, darkMode, cycleTheme };
};
