import { COMPLEX_KEYS, MEMORY_KEYS, NUMPAD_KEYS, SCIENTIFIC_KEYS, keyVariant } from '../lib/keys';
import { BackspaceIcon } from './Icons';

const KIND_STYLES = {
    number: 'text-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-50 dark:ring-0 dark:hover:bg-slate-700',
    function: 'text-[0.95rem] bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/70',
    operator: 'text-2xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30',
    control: 'text-xl bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    clear: 'text-xl bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30',
    equals: 'text-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 dark:shadow-indigo-900/40',
    shift: 'text-xs font-bold tracking-wide bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25',
    toggle: 'text-[0.95rem] bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/70',
};

const ACTIVE = {
    shift: 'bg-amber-400 text-amber-950 hover:bg-amber-400 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-400',
    toggle: 'bg-sky-500 text-white hover:bg-sky-500 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-500',
};

const KEY_BASE =
    'relative flex min-h-0 flex-col items-center justify-center rounded-2xl font-medium leading-none select-none outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 motion-safe:active:scale-95';
const PRESSED = 'scale-95 brightness-90 dark:brightness-125';

const Key = ({ definition, modifiers, pressedId, onPress }) => {
    const { id, kind, icon, className = '' } = definition;
    const current = keyVariant(definition, modifiers);
    const showsVariant = current !== definition;
    const active = (kind === 'shift' && modifiers.shift) || (kind === 'toggle' && modifiers.hyp);
    // The shifted function is shown above the key, like the printed labels on a Casio
    const secondary = !showsVariant && definition.shift && !(modifiers.hyp && definition.hyp) ? definition.shift.label : null;

    return (
        <button
            type="button"
            onClick={() => onPress(current.action)}
            aria-label={current.ariaLabel ?? current.label}
            aria-pressed={kind === 'shift' || kind === 'toggle' ? active : undefined}
            className={`${KEY_BASE} ${active ? ACTIVE[kind] : KIND_STYLES[kind]} ${showsVariant && current.label.length > 3 ? '!text-base' : ''} ${
                showsVariant ? 'ring-2 ring-amber-400/70 dark:ring-amber-400/60' : ''
            } ${pressedId === id ? PRESSED : ''} ${className}`}
        >
            {secondary && (
                <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[0.2rem] -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-semibold text-amber-600 [@media(max-height:720px)]:top-[0.05rem] [@media(max-height:720px)]:text-[0.5rem] dark:text-amber-400">
                    {secondary}
                </span>
            )}
            <span className={secondary ? 'mt-2 [@media(max-height:720px)]:mt-2.5 [@media(max-height:720px)]:text-sm' : ''}>
                {icon === 'backspace' && !showsVariant ? <BackspaceIcon className="h-6 w-6" /> : current.label}
            </span>
        </button>
    );
};

const LAYOUTS = {
    basic: null,
    comp: { keys: SCIENTIFIC_KEYS, rows: 'flex-[5]' },
    complex: { keys: COMPLEX_KEYS, rows: 'flex-[4]' },
};

const Keypad = ({ layout, modifiers, hasMemory, pressedId, onPress }) => {
    const scientific = LAYOUTS[layout];
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 sm:gap-2">
            <div role="group" aria-label="Memory" className="grid grid-cols-5 gap-1">
                {MEMORY_KEYS.map(({ id, label, ariaLabel, action, needsMemory }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onPress(action)}
                        disabled={needsMemory && !hasMemory}
                        aria-label={ariaLabel}
                        className={`rounded-lg py-1.5 text-sm font-semibold text-slate-600 outline-none transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-35 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 ${pressedId === id ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {scientific && (
                <div
                    role="group"
                    aria-label="Scientific functions"
                    className={`grid min-h-0 ${scientific.rows} auto-rows-fr grid-cols-5 gap-1.5 sm:gap-2`}
                >
                    {scientific.keys.map((key) => (
                        <Key key={key.id} definition={key} modifiers={modifiers} pressedId={pressedId} onPress={onPress} />
                    ))}
                </div>
            )}

            <div role="group" aria-label="Number pad" className="grid min-h-0 flex-[6] auto-rows-fr grid-cols-4 gap-1.5 sm:gap-2">
                {NUMPAD_KEYS.map((key) => (
                    // Only Calculate mode has SHIFT functions (SOLVE)
                    <Key key={key.id} definition={layout === 'comp' ? key : { ...key, shift: undefined }} modifiers={modifiers} pressedId={pressedId} onPress={onPress} />
                ))}
            </div>
        </div>
    );
};

export default Keypad;
