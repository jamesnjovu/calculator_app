import { useLayoutEffect, useRef } from 'react';
import { describeResult, openParenCount } from '../lib/calculator';
import { CopyIcon } from './Icons';
import { ExactValue, NaturalExpression, NumberText } from './MathView';

const OPERATOR_CHARS = new Set(['+', '−', '×', '÷', '^']);

// Shrinks long values so they fit without scrolling for as long as possible.
const sizeClass = (length) => {
    if (length <= 9) return 'text-5xl sm:text-6xl';
    if (length <= 13) return 'text-4xl sm:text-5xl';
    if (length <= 18) return 'text-3xl sm:text-4xl';
    return 'text-2xl sm:text-3xl';
};

// Linear display: colours operators and shows the parentheses that will be closed automatically.
const LinearInput = ({ input }) => {
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

const Indicator = ({ children, tone = 'slate', title }) => {
    const tones = {
        slate: 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        amber: 'bg-amber-400 text-amber-950',
        sky: 'bg-sky-500 text-white',
        memory: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    };
    return (
        <span title={title} className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide ${tones[tone]}`}>
            {children}
        </span>
    );
};

const FORMAT_LABELS = { fix: 'FIX', sci: 'SCI', eng: 'ENG' };

const CalculatorDisplay = ({ state, preview, showIndicators, modifiers, onToggleAngleMode, onCopy }) => {
    const { input, result, error, justEvaluated, settings, memory, mode } = state;
    const scrollRef = useRef(null);

    // Keep the end of long expressions in view while typing
    useLayoutEffect(() => {
        const element = scrollRef.current;
        if (element) element.scrollLeft = element.scrollWidth;
    }, [input, result, error]);

    const described = justEvaluated && result ? describeResult(result, settings) : null;
    const natural = settings.naturalDisplay;

    const renderInput = (text) =>
        natural ? <NaturalExpression input={text} fallback={<LinearInput input={text} />} /> : <LinearInput input={text} />;

    let secondary = null;
    if (error || justEvaluated) secondary = input ? renderInput(input) : null;

    let primary;
    let primaryLength;
    if (error) {
        primary = error;
        primaryLength = 20;
    } else if (described) {
        const label = result.label ? <span className="mr-2 text-[0.6em] text-slate-500 dark:text-slate-400">{result.label} =</span> : null;
        primary = (
            <>
                {label}
                {described.exact && natural ? <ExactValue exact={described.exact} /> : <NumberText text={described.text} />}
            </>
        );
        primaryLength = described.text.length + (result.label ? 3 : 0);
    } else {
        primary = input ? renderInput(input) : '0';
        primaryLength = input.length;
    }

    const copyValue = described ? `${result.label ? `${result.label} = ` : ''}${described.text}` : preview;
    const numberFormat = settings.numberFormat.type;

    return (
        <section aria-label="Display" className="flex shrink-0 flex-col px-2 pb-2 pt-1 text-right">
            <div className="flex h-7 items-center gap-1.5">
                {showIndicators && (
                    <>
                        {modifiers.shift && <Indicator tone="amber">S</Indicator>}
                        {modifiers.hyp && <Indicator tone="sky">hyp</Indicator>}
                        <button
                            type="button"
                            onClick={onToggleAngleMode}
                            className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-slate-600 outline-none transition hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            aria-label={`Angle unit: ${settings.angleUnit}. Change angle unit`}
                            title="Change angle unit (degrees, radians, gradians)"
                        >
                            {settings.angleUnit === 'GRAD' ? 'GRA' : settings.angleUnit}
                        </button>
                        {FORMAT_LABELS[numberFormat] && <Indicator title="Number format">{FORMAT_LABELS[numberFormat]}</Indicator>}
                        {mode === 'CMPLX' && <Indicator title="Complex mode">CMPLX</Indicator>}
                    </>
                )}
                {memory !== null && (
                    <Indicator tone="memory" title={`Memory: ${memory}`}>
                        M
                    </Indicator>
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

            <div className="scrollbar-none mt-1 min-h-[2.25rem] overflow-x-auto whitespace-nowrap py-1 text-lg text-slate-500 dark:text-slate-400">
                {secondary}
                {secondary && justEvaluated && !result?.label && <span className="ml-1">=</span>}
            </div>

            <div ref={scrollRef} className="scrollbar-none overflow-x-auto whitespace-nowrap py-2">
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    className={`inline-flex items-center font-light tabular-nums tracking-tight ${
                        error ? 'text-3xl text-rose-600 dark:text-rose-400' : `${sizeClass(primaryLength)} text-slate-900 dark:text-white`
                    }`}
                >
                    {primary}
                </output>
            </div>

            <div className="h-7 truncate text-xl tabular-nums text-slate-400 dark:text-slate-500">
                {!justEvaluated && !error && preview !== null && (
                    <>
                        = <NumberText text={preview} />
                    </>
                )}
            </div>
        </section>
    );
};

export default CalculatorDisplay;
