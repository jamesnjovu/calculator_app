const CalculatorDisplay = ({ state, preview, onToggleAngleMode }) => {
    const { input, result, error, justEvaluated, angleMode, memory } = state;

    let secondary = '';
    let primary = input || '0';
    if (error) {
        secondary = input;
        primary = error;
    } else if (justEvaluated) {
        secondary = `${input} =`;
        primary = result;
    } else if (preview !== null) {
        secondary = `= ${preview}`;
    }

    return (
        <div className="mb-4 flex h-32 flex-col rounded-xl border border-gray-200 bg-gray-100 p-4 text-right dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs font-semibold">
                <button
                    type="button"
                    onClick={onToggleAngleMode}
                    className="rounded px-2 py-1 text-indigo-700 hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-indigo-300 dark:hover:bg-indigo-900"
                    aria-label={`Angle mode: ${angleMode === 'DEG' ? 'degrees' : 'radians'}. Click to switch.`}
                >
                    {angleMode}
                </button>
                {memory !== null && (
                    <span className="text-gray-500 dark:text-gray-400" title={`Memory: ${memory}`}>
                        M
                    </span>
                )}
            </div>
            <div className="mt-auto truncate text-sm text-gray-500 dark:text-gray-400" title={secondary}>
                {secondary}
            </div>
            <output
                aria-live="polite"
                className={`block overflow-x-auto whitespace-nowrap text-3xl font-bold ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}
            >
                {primary}
            </output>
        </div>
    );
};

export default CalculatorDisplay;
