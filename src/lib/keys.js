// Keypad definitions shared by the button grid and keyboard handling.
// `kind` selects the button style, `id` identifies a key for highlighting.
// Keys can carry a `shift` (and for trig keys `hyp` / `shiftHyp`) variant with
// its own label and action, like the second functions on a Casio keypad.
// An action can be a list of actions applied in order.

const insert = (value) => ({ type: 'insert', value });
const digit = (value, shift) => ({ id: value, label: value, action: { type: 'digit', value }, kind: 'number', ...(shift ? { shift } : {}) });

// SHIFT + a number key opens a mode or menu, as on the fx-991ES PLUS
const openMode = (label, mode, name) => variant(label, { type: 'ui', value: 'mode', mode }, `Open ${name} mode`);
const operator = (label, ariaLabel, extra = {}) => ({ id: label, label, ariaLabel, action: { type: 'operator', value: label }, kind: 'operator', ...extra });
const variant = (label, action, ariaLabel = label) => ({ label, action, ariaLabel });
const fn = (label, token, ariaLabel, extra = {}) => ({ id: token, label, ariaLabel, action: insert(token), kind: 'function', ...extra });

export const MEMORY_KEYS = [
    { id: 'MC', label: 'MC', ariaLabel: 'Memory clear', action: { type: 'memoryClear' }, needsMemory: true },
    { id: 'MR', label: 'MR', ariaLabel: 'Memory recall', action: { type: 'memoryRecall' }, needsMemory: true },
    { id: 'M+', label: 'M+', ariaLabel: 'Memory add', action: { type: 'memoryAdd' } },
    { id: 'M−', label: 'M−', ariaLabel: 'Memory subtract', action: { type: 'memorySubtract' } },
    { id: 'VARS', label: 'VARS', ariaLabel: 'Variables', action: { type: 'ui', value: 'variables' } },
];

const trig = (name, ariaName) =>
    fn(name, `${name}(`, ariaName, {
        shift: variant(`${name}⁻¹`, insert(`${name}⁻¹(`), `Inverse ${ariaName.toLowerCase()}`),
        hyp: variant(`${name}h`, insert(`${name}h(`), `Hyperbolic ${ariaName.toLowerCase()}`),
        shiftHyp: variant(`${name}h⁻¹`, insert(`${name}h⁻¹(`), `Inverse hyperbolic ${ariaName.toLowerCase()}`),
    });

// Calculate (COMP) mode: 5 columns, 5 rows
export const SCIENTIFIC_KEYS = [
    { id: 'SHIFT', label: 'SHIFT', ariaLabel: 'Shift', action: { type: 'ui', value: 'shift' }, kind: 'shift' },
    { id: 'hyp', label: 'hyp', ariaLabel: 'Hyperbolic', action: { type: 'ui', value: 'hyp' }, kind: 'toggle' },
    {
        id: 'S⇔D', label: 'S⇔D', ariaLabel: 'Switch between exact and decimal result',
        action: { type: 'toggleView', value: 'sd' }, kind: 'function',
        shift: variant('ENG', { type: 'toggleView', value: 'eng' }, 'Engineering notation'),
    },
    { ...fn('°\'"', '°', 'Degrees, minutes, seconds'), shift: variant('Ran#', insert('Ran#'), 'Random number') },
    { ...fn('X', 'X', 'Variable X'), shift: variant('=', insert('='), 'Equals sign for SOLVE') },

    trig('sin', 'Sine'),
    trig('cos', 'Cosine'),
    trig('tan', 'Tangent'),
    { ...fn('log', 'log(', 'Logarithm base 10'), shift: variant('10ˣ', { type: 'insertOperand', value: '10^(' }, 'Ten to the power') },
    { ...fn('ln', 'ln(', 'Natural logarithm'), shift: variant('eˣ', { type: 'insertOperand', value: 'e^(' }, 'e to the power') },

    { ...fn('x²', '²', 'Square'), shift: variant('x³', insert('³'), 'Cube') },
    { id: '^', label: 'xʸ', ariaLabel: 'Power', action: { type: 'operator', value: '^' }, kind: 'function', shift: variant('ˣ√', insert('ˣ√('), 'Nth root') },
    { ...fn('√', '√(', 'Square root'), shift: variant('∛', insert('∛('), 'Cube root') },
    { ...fn('x⁻¹', '⁻¹', 'Reciprocal'), shift: variant('x!', insert('!'), 'Factorial') },
    { ...fn('logₐb', 'logₐ(', 'Logarithm to base a'), shift: variant('%', insert('%'), 'Percent') },

    { ...fn('(', '(', 'Open parenthesis'), shift: variant('Abs', insert('Abs('), 'Absolute value') },
    { ...fn(')', ')', 'Close parenthesis'), shift: variant(',', insert(','), 'Comma') },
    { ...fn('a/b', 'frac(', 'Fraction'), shift: variant('×10ˣ', { type: 'exponent' }, 'Times ten to the power') },
    { ...fn('π', 'π', 'Pi'), shift: variant('e', insert('e'), "Euler's number") },
    { ...fn('Ans', 'Ans', 'Previous answer'), shift: variant('PreAns', insert('PreAns'), 'Answer before the previous one') },

    { ...fn('∫', '∫(', 'Integral'), shift: variant('d/dx', insert('d/dx('), 'Derivative') },
    { ...fn('Σ', 'Σ(', 'Sum'), shift: variant('Π', insert('Π('), 'Product') },
    { ...fn('nPr', 'nPr', 'Permutations'), shift: variant('nCr', insert('nCr'), 'Combinations') },
    { ...fn('GCD', 'GCD(', 'Greatest common divisor'), shift: variant('LCM', insert('LCM('), 'Least common multiple') },
    { ...fn('Int', 'Int(', 'Integer part'), shift: variant('Intg', insert('Intg('), 'Largest integer not greater than') },
];

// Complex (CMPLX) mode: 5 columns, 4 rows
export const COMPLEX_KEYS = [
    fn('i', 'i', 'Imaginary unit'),
    fn('∠', '∠', 'Angle (polar form)'),
    fn('arg', 'arg(', 'Argument'),
    fn('Conjg', 'Conjg(', 'Conjugate'),
    fn('Abs', 'Abs(', 'Absolute value'),

    fn('ReP', 'ReP(', 'Real part'),
    fn('ImP', 'ImP(', 'Imaginary part'),
    { id: 'polar', label: '▶r∠θ', ariaLabel: 'Show result in polar form', action: { type: 'toggleView', value: 'polar' }, kind: 'function' },
    { id: 'rect', label: '▶a+bi', ariaLabel: 'Show result in rectangular form', action: { type: 'toggleView', value: 'rect' }, kind: 'function' },
    fn('Ans', 'Ans', 'Previous answer'),

    fn('x²', '²', 'Square'),
    { id: '^', label: 'xʸ', ariaLabel: 'Power', action: { type: 'operator', value: '^' }, kind: 'function' },
    fn('√', '√(', 'Square root'),
    fn('x⁻¹', '⁻¹', 'Reciprocal'),
    fn('π', 'π', 'Pi'),

    fn('(', '(', 'Open parenthesis'),
    fn(')', ')', 'Close parenthesis'),
    fn('e', 'e', "Euler's number"),
    fn('ln', 'ln(', 'Natural logarithm'),
    fn('log', 'log(', 'Logarithm base 10'),
];

// 4 columns, 5 rows
export const NUMPAD_KEYS = [
    { id: 'C', label: 'C', ariaLabel: 'Clear', action: { type: 'clear' }, kind: 'clear' },
    { id: '⌫', label: '⌫', ariaLabel: 'Backspace', action: { type: 'backspace' }, kind: 'control', icon: 'backspace' },
    { id: '±', label: '±', ariaLabel: 'Toggle sign', action: { type: 'toggleSign' }, kind: 'control' },
    operator('÷', 'Divide'),

    digit('7', variant('CONST', { type: 'ui', value: 'catalog', tab: 'constants' }, 'Scientific constants')),
    digit('8', variant('CONV', { type: 'ui', value: 'catalog', tab: 'conversions' }, 'Unit conversions')),
    digit('9', variant('CLR', { type: 'ui', value: 'clearMemory' }, 'Clear memory and variables')),
    operator('×', 'Multiply'),

    digit('4', openMode('MATRIX', 'MATRIX', 'Matrix')),
    digit('5', openMode('VECTOR', 'VECTOR', 'Vector')),
    digit('6', openMode('EQN', 'EQN', 'Equation')),
    operator('−', 'Subtract'),

    digit('1', openMode('STAT', 'STAT', 'Statistics')),
    digit('2', openMode('CMPLX', 'CMPLX', 'Complex')),
    digit('3', openMode('BASE', 'BASEN', 'Base-N')),
    operator('+', 'Add'),

    { ...digit('0'), className: 'col-span-2' },
    { id: '.', label: '.', ariaLabel: 'Decimal point', action: { type: 'decimal' }, kind: 'number' },
    {
        id: '=', label: '=', ariaLabel: 'Equals', action: { type: 'evaluate' }, kind: 'equals',
        shift: variant('SOLVE', { type: 'solve' }, 'Solve for X'),
    },
];

// Picks the label and action for the current SHIFT / hyp state
export const keyVariant = (key, { shift = false, hyp = false } = {}) => {
    if (hyp && key.hyp) return shift && key.shiftHyp ? key.shiftHyp : key.hyp;
    if (shift && key.shift) return key.shift;
    return key;
};

const KEYBOARD_ACTIONS = {
    '+': { type: 'operator', value: '+' },
    '-': { type: 'operator', value: '−' },
    '*': { type: 'operator', value: '×' },
    x: { type: 'operator', value: '×' },
    '/': { type: 'operator', value: '÷' },
    '^': { type: 'operator', value: '^' },
    '.': { type: 'decimal' },
    ',': { type: 'insert', value: ',' },
    '(': { type: 'insert', value: '(' },
    ')': { type: 'insert', value: ')' },
    '!': { type: 'insert', value: '!' },
    '%': { type: 'insert', value: '%' },
    Enter: { type: 'evaluate' },
    '=': { type: 'evaluate' },
    Backspace: { type: 'backspace' },
    Escape: { type: 'clear' },
    Delete: { type: 'clear' },
    c: { type: 'clear' },
    p: { type: 'insert', value: 'π' },
    e: { type: 'insert', value: 'e' },
    i: { type: 'insert', value: 'i' },
    X: { type: 'insert', value: 'X' },
};

export const keyToAction = (key) => {
    if (/^\d$/.test(key)) return { type: 'digit', value: key };
    return KEYBOARD_ACTIONS[key] ?? null;
};

const ALL_KEYS = [...MEMORY_KEYS, ...SCIENTIFIC_KEYS, ...COMPLEX_KEYS, ...NUMPAD_KEYS];

const sameAction = (a, b) => a.type === b.type && (a.value ?? null) === (b.value ?? null);

// The on-screen key that performs an action, used to highlight keyboard input.
export const keyIdForAction = (action) =>
    ALL_KEYS.find((key) => !Array.isArray(key.action) && sameAction(key.action, action))?.id ?? null;
