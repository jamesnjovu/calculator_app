const ThemeToggle = ({ darkMode, isSystemTheme, toggleTheme, resetToSystemTheme }) => (
    <div className="mb-2 flex justify-end space-x-2">
        <button
            type="button"
            onClick={resetToSystemTheme}
            aria-pressed={isSystemTheme}
            className={`rounded-full px-3 py-2 text-sm shadow-md transition-colors ${isSystemTheme
                ? 'bg-green-500 text-white dark:bg-green-600'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'}`}
            title="Use system theme"
        >
            System
        </button>
        <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full bg-gray-700 p-2 text-gray-100 shadow-md transition-colors hover:bg-gray-600 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-400"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? '☀️' : '🌙'}
        </button>
    </div>
);

export default ThemeToggle;
