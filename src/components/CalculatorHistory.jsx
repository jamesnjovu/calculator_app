const CalculatorHistory = ({ history, onRecall, onClear }) => (
    <section className="mt-6 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold text-gray-700 dark:text-gray-300">History</h2>
            <button
                type="button"
                onClick={onClear}
                aria-label="Clear history"
                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
                Clear
            </button>
        </div>
        <ul>
            {history.map((item) => (
                <li key={item.id} className="border-b border-gray-300 last:border-0 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => onRecall(item.result)}
                        className="w-full py-2 text-left hover:opacity-80"
                        title="Use this result"
                    >
                        <div className="break-all text-gray-700 dark:text-gray-300">{item.expression}</div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">= {item.result}</div>
                    </button>
                </li>
            ))}
        </ul>
    </section>
);

export default CalculatorHistory;
