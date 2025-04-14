import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [isSystemTheme, setIsSystemTheme] = useState(true);

    // Check system preference for dark/light mode and set up listener for changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Initial setup based on system preference
        if (isSystemTheme) {
            setDarkMode(mediaQuery.matches);
        }

        // Event listener for system theme changes
        const handleThemeChange = (e) => {
            if (isSystemTheme) {
                setDarkMode(e.matches);
            }
        };

        // Add listener for theme changes
        mediaQuery.addEventListener('change', handleThemeChange);

        // Cleanup listener on component unmount
        return () => {
            mediaQuery.removeEventListener('change', handleThemeChange);
        };
    }, [isSystemTheme]);

    const toggleTheme = () => {
        // If currently using system theme, switch to manual mode
        if (isSystemTheme) {
            setIsSystemTheme(false);
            setDarkMode(!darkMode); // Toggle from current state
        } else {
            // If already in manual mode, just toggle the theme
            setDarkMode(!darkMode);
        }
    };

    const useSystemTheme = () => {
        setIsSystemTheme(true);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    };

    return {
        darkMode,
        isSystemTheme,
        toggleTheme,
        useSystemTheme
    };
};
