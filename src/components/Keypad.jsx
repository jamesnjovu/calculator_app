import { MEMORY_KEYS, NUMPAD_KEYS, SCIENTIFIC_KEYS } from '../lib/keys';
import { BackspaceIcon } from './Icons';

const KIND_STYLES = {
    number: 'text-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-50 dark:ring-0 dark:hover:bg-slate-700',
    function: 'text-base bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/70',
    operator: 'text-2xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30',
    control: 'text-xl bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    clear: 'text-xl bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30',
    equals: 'text-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 dark:shadow-indigo-900/40',
};

const KEY_BASE =
    'flex min-h-0 items-center justify-center rounded-2xl font-medium select-none outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 motion-safe:active:scale-95';
const PRESSED = 'scale-95 brightness-90 dark:brightness-125';

const Key = ({ definition, pressedId, onPress }) => {
    const { id, label, ariaLabel, action, kind, icon, className = '' } = definition;
    return (
        <button
            type="button"
            onClick={() => onPress(action)}
            aria-label={ariaLabel}
            className={`${KEY_BASE} ${KIND_STYLES[kind]} ${pressedId === id ? PRESSED : ''} ${className}`}
        >
            {icon === 'backspace' ? <BackspaceIcon className="h-6 w-6" /> : label}
        </button>
    );
};

const Keypad = ({ scientific, hasMemory, pressedId, onPress }) => (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
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
                className="grid min-h-0 flex-[3] auto-rows-fr grid-cols-4 gap-2"
            >
                {SCIENTIFIC_KEYS.map((key) => (
                    <Key key={key.id} definition={key} pressedId={pressedId} onPress={onPress} />
                ))}
            </div>
        )}

        <div
            role="group"
            aria-label="Number pad"
            className="grid min-h-0 flex-[5] auto-rows-fr grid-cols-4 gap-2"
        >
            {NUMPAD_KEYS.map((key) => (
                <Key key={key.id} definition={key} pressedId={pressedId} onPress={onPress} />
            ))}
        </div>
    </div>
);

export default Keypad;
