const VARIANTS = {
    memory: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    scientific: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-gray-200 dark:hover:bg-indigo-800',
    number: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    operator: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-700 dark:text-white dark:hover:bg-purple-600',
    equals: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500',
    clear: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600',
};

const digit = (value) => ({ label: value, action: { type: 'digit', value }, variant: 'number' });
const operator = (label, ariaLabel) => ({ label, ariaLabel, action: { type: 'operator', value: label }, variant: 'operator' });
const fn = (label, value, ariaLabel) => ({ label, ariaLabel, action: { type: 'function', value }, variant: 'scientific' });

// Laid out row by row on a 5 column grid
const BUTTONS = [
    { label: 'MC', ariaLabel: 'Memory clear', action: { type: 'memoryClear' }, variant: 'memory' },
    { label: 'MR', ariaLabel: 'Memory recall', action: { type: 'memoryRecall' }, variant: 'memory' },
    { label: 'M+', ariaLabel: 'Memory add', action: { type: 'memoryAdd' }, variant: 'memory' },
    { label: 'M−', ariaLabel: 'Memory subtract', action: { type: 'memorySubtract' }, variant: 'memory' },
    { label: 'MS', ariaLabel: 'Memory store', action: { type: 'memoryStore' }, variant: 'memory' },

    fn('sin', 'sin', 'Sine'),
    fn('cos', 'cos', 'Cosine'),
    fn('tan', 'tan', 'Tangent'),
    fn('log', 'log', 'Logarithm base 10'),
    fn('ln', 'ln', 'Natural logarithm'),

    fn('√', 'sqrt', 'Square root'),
    { label: 'x²', ariaLabel: 'Square', action: { type: 'square' }, variant: 'scientific' },
    { label: 'xʸ', ariaLabel: 'Power', action: { type: 'operator', value: '^' }, variant: 'scientific' },
    { label: '1/x', ariaLabel: 'Reciprocal', action: { type: 'reciprocal' }, variant: 'scientific' },
    { label: 'π', ariaLabel: 'Pi', action: { type: 'constant', value: 'π' }, variant: 'scientific' },

    { label: '(', ariaLabel: 'Open parenthesis', action: { type: 'openParen' }, variant: 'scientific' },
    { label: ')', ariaLabel: 'Close parenthesis', action: { type: 'closeParen' }, variant: 'scientific' },
    { label: 'e', ariaLabel: "Euler's number", action: { type: 'constant', value: 'e' }, variant: 'scientific' },
    { label: '⌫', ariaLabel: 'Backspace', action: { type: 'backspace' }, variant: 'memory' },
    { label: 'C', ariaLabel: 'Clear', action: { type: 'clear' }, variant: 'clear' },

    digit('7'), digit('8'), digit('9'),
    operator('÷', 'Divide'),
    { label: 'Ans', ariaLabel: 'Previous answer', action: { type: 'answer' }, variant: 'memory' },

    digit('4'), digit('5'), digit('6'),
    operator('×', 'Multiply'),
    { label: '±', ariaLabel: 'Toggle sign', action: { type: 'toggleSign' }, variant: 'memory' },

    digit('1'), digit('2'), digit('3'),
    operator('−', 'Subtract'),
    { label: '=', ariaLabel: 'Equals', action: { type: 'evaluate' }, variant: 'equals', className: 'row-span-2' },

    { ...digit('0'), className: 'col-span-2' },
    { label: '.', ariaLabel: 'Decimal point', action: { type: 'decimal' }, variant: 'number' },
    operator('+', 'Add'),
];

const CalculatorButtons = ({ dispatch }) => (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {BUTTONS.map(({ label, ariaLabel, action, variant, className = '' }) => (
            <button
                key={label}
                type="button"
                onClick={() => dispatch(action)}
                aria-label={ariaLabel}
                className={`min-h-11 rounded-lg p-2 text-lg font-medium shadow-md transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 sm:p-3 ${VARIANTS[variant]} ${className}`}
            >
                {label}
            </button>
        ))}
    </div>
);

export default CalculatorButtons;
