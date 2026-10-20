import { CatalogIcon, ChevronDownIcon, DownloadIcon, HistoryIcon, MonitorIcon, MoonIcon, SettingsIcon, SunIcon } from './Icons';
import { focusRing } from './ui';

const THEME_ICONS = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };
const THEME_LABELS = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

const iconButton = `rounded-xl p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`;

const Header = ({ modeName, onOpenMode, onOpenCatalog, onOpenSettings, onOpenHistory, themePreference, onCycleTheme, canInstall, onInstall }) => {
    const ThemeIcon = THEME_ICONS[themePreference];
    return (
        <header className="flex shrink-0 items-center justify-between gap-1">
            <button
                type="button"
                onClick={onOpenMode}
                className={`flex items-center gap-1.5 rounded-xl bg-slate-200/70 py-2 pl-3 pr-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300/70 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 ${focusRing}`}
                aria-label={`Mode: ${modeName}. Change mode`}
            >
                {modeName}
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
            </button>
            <div className="flex items-center">
                {canInstall && (
                    <button type="button" onClick={onInstall} className={iconButton} aria-label="Install app" title="Install app">
                        <DownloadIcon />
                    </button>
                )}
                {onOpenCatalog && (
                    <button type="button" onClick={onOpenCatalog} className={iconButton} aria-label="Function catalog" title="Functions, constants and conversions">
                        <CatalogIcon />
                    </button>
                )}
                {onOpenHistory && (
                    <button type="button" onClick={onOpenHistory} className={`${iconButton} lg:hidden`} aria-label="Show history" title="History">
                        <HistoryIcon />
                    </button>
                )}
                <button type="button" onClick={onOpenSettings} className={iconButton} aria-label="Settings" title="Settings">
                    <SettingsIcon />
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
