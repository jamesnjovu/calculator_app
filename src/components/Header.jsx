import { DownloadIcon, HistoryIcon, MonitorIcon, MoonIcon, SunIcon } from './Icons';

const THEME_ICONS = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };
const THEME_LABELS = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

const iconButton =
    'rounded-xl p-2.5 text-slate-600 outline-none transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800';

const ModeSwitch = ({ scientific, onChange }) => (
    <div role="radiogroup" aria-label="Calculator mode" className="flex rounded-xl bg-slate-200/70 p-1 text-sm font-medium dark:bg-slate-800">
        {[
            { value: false, label: 'Basic' },
            { value: true, label: 'Scientific' },
        ].map(({ value, label }) => (
            <button
                key={label}
                type="button"
                role="radio"
                aria-checked={scientific === value}
                onClick={() => onChange(value)}
                className={`rounded-lg px-3 py-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    scientific === value
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);

const Header = ({ scientific, onModeChange, themePreference, onCycleTheme, onOpenHistory, canInstall, onInstall }) => {
    const ThemeIcon = THEME_ICONS[themePreference];
    return (
        <header className="flex shrink-0 items-center justify-between gap-2">
            <ModeSwitch scientific={scientific} onChange={onModeChange} />
            <div className="flex items-center">
                {canInstall && (
                    <button type="button" onClick={onInstall} className={iconButton} aria-label="Install app" title="Install app">
                        <DownloadIcon />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onOpenHistory}
                    className={`${iconButton} lg:hidden`}
                    aria-label="Show history"
                    title="History"
                >
                    <HistoryIcon />
                </button>
                <button
                    type="button"
                    onClick={onCycleTheme}
                    className={iconButton}
                    aria-label={`${THEME_LABELS[themePreference]}. Change theme`}
                    title={`${THEME_LABELS[themePreference]} (click to change)`}
                >
                    <ThemeIcon />
                </button>
            </div>
        </header>
    );
};

export default Header;
