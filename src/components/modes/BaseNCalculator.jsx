import { useEffect, useMemo, useReducer } from 'react';
import { BASE_DIGITS, baseNReducer, evaluateBaseN, formatInBase, initialBaseNState, isDigitAllowed } from '../../lib/baseNCalculator';
import { BASES } from '../../lib/baseN';
import { loadJSON, saveJSON } from '../../lib/storage';
import { useKeyboard } from '../../hooks/useKeyboard';
import { BackspaceIcon } from '../Icons';

// Base-N mode as a keypad calculator. Its keys are blue, like the BASE-N
// labels printed on the fx-991ES PLUS.

const STORAGE_KEY = 'calculator-basen-state';

const loadState = () => {
    const saved = loadJSON(STORAGE_KEY, {}) ?? {};
    return {
        ...initialBaseNState,
        base: saved.base in BASES ? saved.base : 'DEC',
        lastAnswer: Number.isInteger(saved.lastAnswer) ? saved.lastAnswer : null,
    };
};

const KEY_BASE =
    'flex min-h-0 items-center justify-center rounded-2xl font-medium leading-none select-none outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 motion-safe:active:scale-95 disabled:opacity-30 disabled:active:scale-100';

const STYLES = {
    base: 'text-sm font-bold tracking-wide bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25',
    baseActive: 'text-sm font-bold tracking-wide bg-blue-600 text-white shadow-md shadow-blue-600/30 dark:bg-blue-500',
    blue: 'text-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30 dark:hover:bg-blue-500/20',
    number: 'text-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-50 dark:ring-0 dark:hover:bg-slate-700',
    operator: 'text-2xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30',
    control: 'text-xl bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    clear: 'text-xl bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30',
    equals: 'text-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500',
};

const digit = (value, style) => ({ label: value, action: { type: 'digit', value }, style, digit: value });
const operator = (label, ariaLabel, style = 'operator') => ({ label, ariaLabel, action: { type: 'operator', value: label }, style });

const BLUE_KEYS = [
    ...Object.keys(BASES).map((base) => ({ label: base, ariaLabel: `${base} base`, action: { type: 'setBase', value: base }, style: 'base', base })),
    { label: 'Ans', ariaLabel: 'Previous answer', action: { type: 'answer' }, style: 'blue' },
    ...'ABCDEF'.split('').map((value) => digit(value, 'blue')),
    { label: '(', ariaLabel: 'Open parenthesis', action: { type: 'open' }, style: 'blue' },
    { label: ')', ariaLabel: 'Close parenthesis', action: { type: 'close' }, style: 'blue' },
    { label: 'Not', ariaLabel: 'Not (bitwise complement)', action: { type: 'open', value: 'Not(' }, style: 'blue' },
    operator('and', 'And', 'blue'),
    operator('or', 'Or', 'blue'),
    operator('xor', 'Exclusive or', 'blue'),
    { ...operator('xnor', 'Exclusive nor', 'blue'), className: 'col-span-2' },
];

const NUMPAD = [
    { label: 'C', ariaLabel: 'Clear', action: { type: 'clear' }, style: 'clear' },
    { label: '⌫', ariaLabel: 'Backspace', action: { type: 'backspace' }, style: 'control', icon: true },
    { label: 'Neg', ariaLabel: 'Negate', action: { type: 'open', value: 'Neg(' }, style: 'blue' },
    operator('÷', 'Divide'),
    digit('7', 'number'), digit('8', 'number'), digit('9', 'number'), operator('×', 'Multiply'),
    digit('4', 'number'), digit('5', 'number'), digit('6', 'number'), operator('−', 'Subtract'),
    digit('1', 'number'), digit('2', 'number'), digit('3', 'number'), operator('+', 'Add'),
    { ...digit('0', 'number'), className: 'col-span-3' },
    { label: '=', ariaLabel: 'Equals', action: { type: 'evaluate' }, style: 'equals' },
];

const KEYBOARD = {
    '+': { type: 'operator', value: '+' },
    '-': { type: 'operator', value: '−' },
    '*': { type: 'operator', value: '×' },
    '/': { type: 'operator', value: '÷' },
    '(': { type: 'open' },
    ')': { type: 'close' },
    '&': { type: 'operator', value: 'and' },
    '|': { type: 'operator', value: 'or' },
    '^': { type: 'operator', value: 'xor' },
    '~': { type: 'open', value: 'Not(' },
    Enter: { type: 'evaluate' },
    '=': { type: 'evaluate' },
    Backspace: { type: 'backspace' },
    Escape: { type: 'clear' },
    Delete: { type: 'clear' },
};

const mapKey = (key) => {
    if (/^[0-9a-fA-F]$/.test(key)) return { type: 'digit', value: key.toUpperCase() };
    return KEYBOARD[key] ?? null;
};

// Spaces around the word operators so "5and3" reads "5 and 3"
const readable = (input) => input.replace(/(xnor|xor|and|or)/g, ' $1 ');

const BaseNCalculator = ({ keyboardEnabled }) => {
    const [state, dispatch] = useReducer(baseNReducer, undefined, loadState);
    const { base, input, result, error, justEvaluated } = state;

    useEffect(() => {
        saveJSON(STORAGE_KEY, { base: state.base, lastAnswer: state.lastAnswer });
    }, [state.base, state.lastAnswer]);

    useKeyboard(dispatch, keyboardEnabled, mapKey);

    // The value shown in every base: the result, or a live preview while typing
    const value = useMemo(() => {
        if (justEvaluated) return result;
        if (!input || error) return null;
        try {
            return evaluateBaseN(input, base, state.lastAnswer);
        } catch {
            return null;
        }
    }, [justEvaluated, result, input, error, base, state.lastAnswer]);

    const primary = error ?? (justEvaluated ? formatInBase(result, base) : readable(input) || '0');
    const primarySize = primary.length > 24 ? 'text-xl' : primary.length > 14 ? 'text-3xl' : 'text-5xl';

    const renderKey = (key) => {
        const disabled = key.digit !== undefined && !isDigitAllowed(key.digit, base);
        const style = key.base === base ? STYLES.baseActive : STYLES[key.style];
        return (
            <button
                key={key.label}
                type="button"
                onClick={() => dispatch(key.action)}
                disabled={disabled}
                aria-label={key.ariaLabel ?? key.label}
                aria-pressed={key.base ? key.base === base : undefined}
                className={`${KEY_BASE} ${style} ${key.className ?? ''}`}
            >
                {key.icon ? <BackspaceIcon className="h-6 w-6" /> : key.label}
            </button>
        );
    };

    return (
        <>
            <section aria-label="Display" className="flex flex-1 flex-col justify-end px-2 pb-1 text-right">
                <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-white">{base}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">digits {BASE_DIGITS[base].length === 16 ? '0–9, A–F' : `0–${BASE_DIGITS[base].slice(-1)}`}</span>
                </div>
                <div className="scrollbar-none mt-1 min-h-[1.75rem] overflow-x-auto whitespace-nowrap text-lg text-slate-500 dark:text-slate-400">
                    {(justEvaluated || error) && input ? `${readable(input)}${justEvaluated ? ' =' : ''}` : ''}
                </div>
                <output
                    aria-live="polite"
                    className={`scrollbar-none block overflow-x-auto whitespace-nowrap py-1 font-light tabular-nums tracking-tight ${
                        error ? 'text-3xl text-rose-600 dark:text-rose-400' : `${primarySize} text-slate-900 dark:text-white`
                    }`}
                >
                    {primary}
                </output>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-xl bg-white/70 px-3 py-2 text-xs tabular-nums ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
                    {Object.keys(BASES).map((name) => (
                        <div key={name} className="contents">
                            <dt className={`font-bold ${name === base ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{name}</dt>
                            <dd className="truncate font-mono text-slate-700 dark:text-slate-200">{value === null ? '—' : formatInBase(value, name)}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="flex min-h-0 shrink basis-[64%] flex-col gap-1.5 sm:gap-2">
                <div role="group" aria-label="Base-N functions" className="grid min-h-0 flex-[4] auto-rows-fr grid-cols-5 gap-1.5 sm:gap-2">
                    {BLUE_KEYS.map(renderKey)}
                </div>
                <div role="group" aria-label="Number pad" className="grid min-h-0 flex-[5] auto-rows-fr grid-cols-4 gap-1.5 sm:gap-2">
                    {NUMPAD.map(renderKey)}
                </div>
            </div>
        </>
    );
};

export default BaseNCalculator;
