import { VARIABLES } from '../lib/tokens';
import { Button, Sheet, focusRing } from './ui';

const VariablesPanel = ({ variables, memory, format, canStore, onInsert, onStore, onClearAll, onClose }) => (
    <Sheet
        title="Variables"
        onClose={onClose}
        actions={
            <Button variant="ghost" onClick={onClearAll} className="text-xs">
                Clear all
            </Button>
        }
    >
        <p className="px-1 pb-3 text-xs text-slate-500 dark:text-slate-400">
            Tap a name to use it in your expression. <span className="font-semibold">STO</span> saves the current value into it.
        </p>
        <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
            {VARIABLES.map((name) => {
                const value = name === 'M' ? memory ?? 0 : variables[name] ?? 0;
                return (
                    <li key={name} className="flex items-center gap-2 border-b border-slate-100 px-2 py-1.5 last:border-0 dark:border-slate-700/60">
                        <button
                            type="button"
                            onClick={() => onInsert(name)}
                            className={`flex flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/60 ${focusRing}`}
                            aria-label={`Insert ${name}`}
                        >
                            <span className="w-6 text-lg font-semibold italic text-indigo-700 dark:text-indigo-300">{name}</span>
                            <span className="flex-1 truncate text-right tabular-nums text-slate-700 dark:text-slate-200">{format(value)}</span>
                        </button>
                        <Button onClick={() => onStore(name)} disabled={!canStore} className="px-2.5 py-1.5 text-xs disabled:opacity-40" aria-label={`Store the current value in ${name}`}>
                            STO
                        </Button>
                    </li>
                );
            })}
        </ul>
    </Sheet>
);

export default VariablesPanel;
