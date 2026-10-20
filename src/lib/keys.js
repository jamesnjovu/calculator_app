// Keypad definitions shared by the button grid and keyboard handling.
// `kind` selects the button style, `id` identifies a key for highlighting.

const digit = (value) => ({ id: value, label: value, action: { type: 'digit', value }, kind: 'number' });
const operator = (label, ariaLabel) => ({ id: label, label, ariaLabel, action: { type: 'operator', value: label }, kind: 'operator' });
const fn = (label, value, ariaLabel) => ({ id: value, label, ariaLabel, action: { type: 'function', value }, kind: 'function' });

export const MEMORY_KEYS = [
    { id: 'MC', label: 'MC', ariaLabel: 'Memory clear', action: { type: 'memoryClear' }, needsMemory: true },
    { id: 'MR', label: 'MR', ariaLabel: 'Memory recall', action: { type: 'memoryRecall' }, needsMemory: true },
    { id: 'M+', label: 'M+', ariaLabel: 'Memory add', action: { type: 'memoryAdd' } },
    { id: 'M−', label: 'M−', ariaLabel: 'Memory subtract', action: { type: 'memorySubtract' } },
    { id: 'MS', label: 'MS', ariaLabel: 'Memory store', action: { type: 'memoryStore' } },
];

// 4 columns, 4 rows
export const SCIENTIFIC_KEYS = [
    fn('sin', 'sin', 'Sine'),
    fn('cos', 'cos', 'Cosine'),
    fn('tan', 'tan', 'Tangent'),
    { id: 'π', label: 'π', ariaLabel: 'Pi', action: { type: 'constant', value: 'π' }, kind: 'function' },

    fn('log', 'log', 'Logarithm base 10'),
    fn('ln', 'ln', 'Natural logarithm'),
    fn('√', 'sqrt', 'Square root'),
    { id: 'e', label: 'e', ariaLabel: "Euler's number", action: { type: 'constant', value: 'e' }, kind: 'function' },

    { id: 'x²', label: 'x²', ariaLabel: 'Square', action: { type: 'square' }, kind: 'function' },
    { id: '^', label: 'xʸ', ariaLabel: 'Power', action: { type: 'operator', value: '^' }, kind: 'function' },
    { id: '1/x', label: '1/x', ariaLabel: 'Reciprocal', action: { type: 'reciprocal' }, kind: 'function' },
    { id: 'Ans', label: 'Ans', ariaLabel: 'Previous answer', action: { type: 'answer' }, kind: 'function' },

    { id: '(', label: '(', ariaLabel: 'Open parenthesis', action: { type: 'openParen' }, kind: 'function' },
    { id: ')', label: ')', ariaLabel: 'Close parenthesis', action: { type: 'closeParen' }, kind: 'function' },
    fn('|x|', 'abs', 'Absolute value'),
    { id: '!', label: 'n!', ariaLabel: 'Factorial', action: { type: 'factorial' }, kind: 'function' },
];

// 4 columns, 5 rows
export const NUMPAD_KEYS = [
    { id: 'C', label: 'C', ariaLabel: 'Clear', action: { type: 'clear' }, kind: 'clear' },
    { id: '⌫', label: '⌫', ariaLabel: 'Backspace', action: { type: 'backspace' }, kind: 'control', icon: 'backspace' },
    { id: '±', label: '±', ariaLabel: 'Toggle sign', action: { type: 'toggleSign' }, kind: 'control' },
    operator('÷', 'Divide'),

    digit('7'), digit('8'), digit('9'),
    operator('×', 'Multiply'),

    digit('4'), digit('5'), digit('6'),
    operator('−', 'Subtract'),

    digit('1'), digit('2'), digit('3'),
    operator('+', 'Add'),

    { ...digit('0'), className: 'col-span-2' },
    { id: '.', label: '.', ariaLabel: 'Decimal point', action: { type: 'decimal' }, kind: 'number' },
    { id: '=', label: '=', ariaLabel: 'Equals', action: { type: 'evaluate' }, kind: 'equals' },
];

const KEYBOARD_ACTIONS = {
    '+': { type: 'operator', value: '+' },
    '-': { type: 'operator', value: '−' },
    '*': { type: 'operator', value: '×' },
    x: { type: 'operator', value: '×' },
    '/': { type: 'operator', value: '÷' },
    '^': { type: 'operator', value: '^' },
    '.': { type: 'decimal' },
    ',': { type: 'decimal' },
    '(': { type: 'openParen' },
    ')': { type: 'closeParen' },
    '!': { type: 'factorial' },
    Enter: { type: 'evaluate' },
    '=': { type: 'evaluate' },
    Backspace: { type: 'backspace' },
    Escape: { type: 'clear' },
    Delete: { type: 'clear' },
    c: { type: 'clear' },
    p: { type: 'constant', value: 'π' },
    e: { type: 'constant', value: 'e' },
};

export const keyToAction = (key) => {
    if (/^\d$/.test(key)) return { type: 'digit', value: key };
    return KEYBOARD_ACTIONS[key] ?? null;
};

const ALL_KEYS = [...MEMORY_KEYS, ...SCIENTIFIC_KEYS, ...NUMPAD_KEYS];

const sameAction = (a, b) => a.type === b.type && (a.value ?? null) === (b.value ?? null);

// The on-screen key that performs an action, used to highlight keyboard input.
export const keyIdForAction = (action) => ALL_KEYS.find((key) => sameAction(key.action, action))?.id ?? null;
