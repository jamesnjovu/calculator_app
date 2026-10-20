import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';

// Shared building blocks for panels and the mode screens.

export const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

export const Sheet = ({ title, onClose, children, actions }) => {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
        const closeOnEscape = (event) => event.key === 'Escape' && onClose();
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 top-16 z-20 flex flex-col rounded-t-3xl bg-slate-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] motion-safe:animate-slide-up sm:rounded-b-[2rem] dark:bg-slate-900"
        >
            <div className="flex items-center justify-between gap-2 px-1 pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h2>
                <div className="flex items-center gap-1">
                    {actions}
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        className={`rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${focusRing}`}
                        aria-label={`Close ${title.toLowerCase()}`}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">{children}</div>
        </div>
    );
};

export const Segmented = ({ label, options, value, onChange, size = 'md' }) => (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
        {options.map((option) => (
            <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value === option.value}
                onClick={() => onChange(option.value)}
                className={`flex-1 whitespace-nowrap rounded-lg font-medium transition ${focusRing} ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
                    value === option.value
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

export const Select = ({ label, value, onChange, options, className = '' }) => (
    <label className={`flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 ${className}`}>
        {label}
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 ${focusRing}`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </label>
);

// A small input cell that accepts numbers or simple expressions
export const Cell = ({ value, onChange, label, invalid = false, className = '', placeholder = '0' }) => (
    <input
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck="false"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 rounded-lg border-0 bg-white px-2 py-2 text-right text-base tabular-nums text-slate-900 ring-1 placeholder:text-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 ${
            invalid ? 'ring-rose-400 dark:ring-rose-500' : 'ring-slate-200 dark:ring-slate-700'
        } ${focusRing} ${className}`}
    />
);

export const Button = ({ children, onClick, variant = 'secondary', className = '', ...props }) => {
    const styles = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20',
        secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
        ghost: 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800',
    };
    return (
        <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${focusRing} ${styles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Section = ({ title, children, className = '' }) => (
    <section className={`flex flex-col gap-2 ${className}`}>
        {title && <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h3>}
        {children}
    </section>
);

export const ResultGrid = ({ rows }) => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
        {rows.map(([label, value]) => (
            <div key={label} className="contents">
                <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="break-all text-right font-medium tabular-nums text-slate-900 dark:text-slate-100">{value}</dd>
            </div>
        ))}
    </dl>
);

export const ErrorMessage = ({ children }) =>
    children ? (
        <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {children}
        </p>
    ) : null;
