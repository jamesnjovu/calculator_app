import React from 'react';

const ThemeToggle = ({ darkMode, isSystemTheme, toggleTheme, useSystemTheme }) => {
    const toggleBtnClass = darkMode
        ? "p-2 rounded-full hover:bg-yellow-400 transition-colors shadow-md"
        : "p-2 rounded-full hover:bg-gray-600 transition-colors shadow-md";

    return (
        <div className="flex justify-end space-x-2 mb-2">
            <button
                onClick={useSystemTheme}
                className={`${toggleBtnClass} ${isSystemTheme
                    ? (darkMode ? 'bg-green-600' : 'bg-green-500')
                    : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
                title="Use System Theme"
            >
                <span className="text-sm">System</span>
            </button>
            <button
                onClick={toggleTheme}
                className={`${toggleBtnClass} ${darkMode
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-gray-100'}`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {darkMode ? "☀️" : "🌙"}
            </button>
        </div>
    );
};

export default ThemeToggle;
