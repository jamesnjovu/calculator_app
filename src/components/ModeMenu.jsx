import { MODES } from '../lib/modes';
import { Sheet, focusRing } from './ui';

const ModeMenu = ({ current, onSelect, onClose }) => (
    <Sheet title="Mode" onClose={onClose}>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODES.map((mode, index) => (
                <li key={mode.id}>
                    <button
                        type="button"
                        onClick={() => onSelect(mode.id)}
                        aria-current={current === mode.id}
                        className={`flex h-full w-full items-start gap-3 rounded-2xl p-3 text-left transition ${focusRing} ${
                            current === mode.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className={`mt-0.5 text-xs font-semibold tabular-nums ${current === mode.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {index + 1}
                        </span>
                        <span>
                            <span className="block font-semibold">{mode.name}</span>
                            <span className={`block text-xs ${current === mode.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                {mode.description}
                            </span>
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    </Sheet>
);

export default ModeMenu;
