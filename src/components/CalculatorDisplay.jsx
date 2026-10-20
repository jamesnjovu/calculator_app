import { useLayoutEffect, useRef } from 'react';
import { openParenCount } from '../lib/calculator';
import { CopyIcon } from './Icons';

const OPERATOR_CHARS = new Set(['+', '−', '×', '÷', '^']);

// Shrinks long values so they fit without scrolling for as long as possible.
const sizeClass = (text) => {
    if (text.length <= 9) return 'text-5xl sm:text-6xl';
    if (text.length <= 13) return 'text-4xl sm:text-5xl';
    if (text.length <= 18) return 'text-3xl sm:text-4xl';
    return 'text-2xl sm:text-3xl';
};

// Colours operators and shows the parentheses that will be closed automatically.
const HighlightedInput = ({ input }) => {
    const missing = Math.max(0, openParenCount(input));
    return (
        <>
            {[...input].map((char, index) =>
                OPERATOR_CHARS.has(char) ? (
                    <span key={index} className="text-indigo-600 dark:text-indigo-400">
                        {char}
                    </span>
                ) : (
                    char
                )
            )}
            {missing > 0 && (
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                    {')'.repeat(missing)}
                </span>
            )}
        </>
    );
};

const CalculatorDisplay = ({ state, preview, scientific, onToggleAngleMode, onCopy }) => {
    const { input, result, error, justEvaluated, angleMode, memory } = state;
    const scrollRef = useRef(null);

    // Keep the end of long expressions in view while typing
    useLayoutEffect(() => {
        const element = scrollRef.current;
        if (element) element.scrollLeft = element.scrollWidth;
    }, [input, result, error]);

    let secondary = '';
    if (error) secondary = input;
    else if (justEvaluated) secondary = `${input} =`;

    const primaryText = error || (justEvaluated ? result : input || '0');
    const copyValue = justEvaluated ? result : preview;

    return (
        <section aria-label="Display" className="flex shrink-0 flex-col px-2 pb-3 pt-1 text-right">
            <div className="flex h-7 items-center gap-2 text-xs font-semibold">
                {scientific && (
                    <button
                        type="button"
                        onClick={onToggleAngleMode}
                        className="rounded-md bg-slate-200/70 px-2 py-1 tracking-wide text-slate-600 outline-none transition hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        aria-label={`Angle unit: ${angleMode === 'DEG' ? 'degrees' : 'radians'}. Switch to ${angleMode === 'DEG' ? 'radians' : 'degrees'}`}
                        title="Switch between degrees and radians"
                    >
                        {angleMode}
                    </button>
                )}
                {memory !== null && (
                    <span
                        className="max-w-[60%] truncate rounded-md bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                        title="Value in memory"
                    >
                        M = {memory.toLocaleString(undefined, { maximumSignificantDigits: 12 })}
                    </span>
                )}
                {copyValue && (
                    <button
                        type="button"
                        onClick={() => onCopy(copyValue)}
                        className="ml-auto rounded-md p-1 text-slate-400 outline-none transition hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label="Copy result"
                        title="Copy result"
                    >
                        <CopyIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mt-2 h-6 truncate text-base text-slate-500 dark:text-slate-400" title={secondary}>
                {secondary}
            </div>

            <div
                ref={scrollRef}
                className="scrollbar-none overflow-x-auto whitespace-nowrap py-1"
            >
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    className={`font-light tabular-nums tracking-tight ${
                        error
                            ? 'text-3xl text-rose-600 dark:text-rose-400'
                            : `${sizeClass(primaryText)} text-slate-900 dark:text-white`
                    }`}
                >
                    {error || justEvaluated || !input ? primaryText : <HighlightedInput input={input} />}
                </output>
            </div>

            <div className="h-7 truncate text-xl tabular-nums text-slate-400 dark:text-slate-500">
                {!justEvaluated && !error && preview !== null && `= ${preview}`}
            </div>
        </section>
    );
};

export default CalculatorDisplay;
