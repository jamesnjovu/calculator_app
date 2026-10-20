import { CloseIcon, HistoryIcon, TrashIcon } from './Icons';

const iconButton =
    'rounded-lg p-2 text-slate-500 outline-none transition hover:bg-slate-200 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100';

const CalculatorHistory = ({ history, onRecall, onClear, onClose, className = '' }) => (
    <section aria-label="History" className={`flex min-h-0 flex-col ${className}`}>
        <div className="flex items-center justify-between px-1 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                History
            </h2>
            <div className="flex gap-1">
                {history.length > 0 && (
                    <button type="button" onClick={onClear} className={iconButton} aria-label="Clear history" title="Clear history">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
                {onClose && (
                    <button type="button" onClick={onClose} className={iconButton} aria-label="Close history" title="Close history">
                        <CloseIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>

        {history.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-slate-400 dark:text-slate-500">
                <HistoryIcon className="h-8 w-8" />
                <p className="text-sm">No calculations yet</p>
            </div>
        ) : (
            <ul className="-mx-1 min-h-0 flex-1 overflow-y-auto">
                {history.map((item) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            onClick={() => onRecall(item.result)}
                            className="w-full rounded-xl px-3 py-2.5 text-right outline-none transition hover:bg-slate-200/70 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800"
                            title="Use this result"
                        >
                            <div className="break-all text-sm text-slate-500 dark:text-slate-400">{item.expression} =</div>
                            <div className="break-all text-xl font-medium tabular-nums text-slate-900 dark:text-slate-100">
                                {item.result}
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </section>
);

export default CalculatorHistory;
