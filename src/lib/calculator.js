import { evaluate, format } from 'mathjs/number';

// Display symbols used in the input string. The input is always kept in
// display form and only translated to math.js syntax when evaluated.
export const OPERATORS = ['+', '−', '×', '÷', '^'];

export const FUNCTIONS = {
    sin: 'sin(',
    cos: 'cos(',
    tan: 'tan(',
    log: 'log(',
    ln: 'ln(',
    sqrt: '√(',
};

const FUNCTION_TOKENS = Object.values(FUNCTIONS);
const MAX_INPUT_LENGTH = 200;
const MAX_HISTORY = 50;
// Trig results smaller than this are floating point noise (e.g. sin(180°)).
const TRIG_EPSILON = 1e-12;

export const initialState = {
    input: '',
    result: null,
    error: null,
    justEvaluated: false,
    angleMode: 'DEG',
    memory: null,
    lastAnswer: null,
    history: [],
};

const lastChar = (str) => str.slice(-1);

const isOperator = (char) => OPERATORS.includes(char);

// True when the input ends with something that can be followed by an operator.
export const endsWithOperand = (input) => /[\d.)πe²]$/.test(input);

const openParenCount = (input) =>
    (input.match(/\(/g) || []).length - (input.match(/\)/g) || []).length;

const closeParens = (input) => input + ')'.repeat(Math.max(0, openParenCount(input)));

// Appends a token that starts a new operand, inserting an explicit × when the
// input already ends with an operand (e.g. "2" + "π" -> "2×π").
const appendOperand = (input, token) =>
    (endsWithOperand(input) ? `${input}×${token}` : input + token).slice(0, MAX_INPUT_LENGTH);

// Negative or exponent-form values need parentheses when used inside a
// larger expression ("−3²" would otherwise be −(3²)).
const wrapValue = (value) => (/^−|e/.test(value) ? `(${value})` : value);

export const formatNumber = (value) => {
    if (Object.is(value, -0)) value = 0;
    return format(value, { precision: 12, lowerExp: -9, upperExp: 15 }).replace(/-/g, '−');
};

const snap = (value) => (Math.abs(value) < TRIG_EPSILON ? 0 : value);

const trigScope = (angleMode) => {
    const toRadians = (x) => (angleMode === 'DEG' ? (x * Math.PI) / 180 : x);
    return {
        trigSin: (x) => snap(Math.sin(toRadians(x))),
        trigCos: (x) => snap(Math.cos(toRadians(x))),
        trigTan: (x) => {
            const cos = snap(Math.cos(toRadians(x)));
            if (cos === 0) throw new Error('Undefined');
            return snap(Math.tan(toRadians(x)));
        },
    };
};

const MATH_FUNCTIONS = {
    'sin(': 'trigSin(',
    'cos(': 'trigCos(',
    'tan(': 'trigTan(',
    'log(': 'log10(',
    'ln(': 'log(',
    '√(': 'sqrt(',
};

// Translates the display string into an expression math.js understands.
export const toMathExpression = (input) =>
    input
        // Scientific notation coming from formatted results, e.g. 1.5e+20
        .replace(/([\d.])e([+−]?)(?=\d)/g, (_, digit, sign) => `${digit}E${sign === '−' ? '-' : sign}`)
        .replace(/sin\(|cos\(|tan\(|log\(|ln\(|√\(/g, (fn) => MATH_FUNCTIONS[fn])
        .replace(/π/g, 'pi')
        .replace(/²/g, '^2')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/E/g, 'e');

// Evaluates a display string. Unbalanced parentheses are closed automatically.
// Throws when the expression is incomplete or the result is not a real number.
export const evaluateInput = (input, angleMode = 'DEG') => {
    if (!input) throw new Error('Empty expression');
    const closed = closeParens(input);
    if (!endsWithOperand(closed)) throw new Error('Incomplete expression');

    const value = evaluate(toMathExpression(closed), trigScope(angleMode));
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid result');
    }
    return value;
};

// Live result shown while typing; null when the input can't be evaluated yet.
export const previewResult = (state) => {
    if (state.justEvaluated || state.error || !state.input) return null;
    try {
        const preview = formatNumber(evaluateInput(state.input, state.angleMode));
        return preview === state.input ? null : preview;
    } catch {
        return null;
    }
};

// Value the memory keys act on: the last result or the current expression.
const currentValue = (state) => {
    if (state.error) return null;
    try {
        return evaluateInput(state.justEvaluated ? state.result : state.input, state.angleMode);
    } catch {
        return null;
    }
};

// Input to build on when starting a new operand: a finished calculation or
// an error starts a fresh expression.
const operandBase = (state) => (state.justEvaluated || state.error ? '' : state.input);

const withInput = (state, input) => ({
    ...state,
    input,
    result: null,
    error: null,
    justEvaluated: false,
});

const inputDigit = (state, digit) => {
    let input = operandBase(state);
    if (/[)πe²]$/.test(input) && !/[\d.]e$/.test(input)) input += '×';
    // Replace a lone leading zero ("0" -> "7", "5+0" -> "5+7")
    if (/(^|[^\d.])0$/.test(input)) input = input.slice(0, -1);
    return withInput(state, (input + digit).slice(0, MAX_INPUT_LENGTH));
};

const inputDecimal = (state) => {
    const input = operandBase(state);
    const trailingNumber = input.match(/[\d.]*$/)[0];
    if (trailingNumber.includes('.')) return state;
    if (trailingNumber === '') return withInput(state, appendOperand(input, '0.'));
    return withInput(state, input + '.');
};

const inputOperator = (state, operator) => {
    let input = state.error ? '' : state.justEvaluated ? state.result : state.input;
    if (state.justEvaluated && operator === '^') input = wrapValue(input);

    if (input === '') {
        return withInput(state, operator === '−' ? '−' : `0${operator}`);
    }

    const last = lastChar(input);
    if (isOperator(last)) {
        // Allow a negative sign after ×, ÷ and ^ ("5×−3")
        if (operator === '−' && ['×', '÷', '^'].includes(last)) {
            return withInput(state, input + operator);
        }
        input = input.replace(/[+−×÷^]+$/, '');
        if (input === '' || lastChar(input) === '(') {
            return withInput(state, operator === '−' ? input + operator : input);
        }
        return withInput(state, input + operator);
    }

    if (last === '(') {
        return operator === '−' ? withInput(state, input + operator) : state;
    }

    return withInput(state, (input + operator).slice(0, MAX_INPUT_LENGTH));
};

const inputOpenParen = (state) => withInput(state, appendOperand(operandBase(state), '('));

const inputCloseParen = (state) => {
    if (state.justEvaluated || state.error) return state;
    if (openParenCount(state.input) <= 0 || !endsWithOperand(state.input)) return state;
    return withInput(state, state.input + ')');
};

const inputFunction = (state, name) => {
    const token = FUNCTIONS[name];
    if (!token) return state;
    return withInput(state, appendOperand(operandBase(state), token));
};

const inputValue = (state, value) => withInput(state, appendOperand(operandBase(state), value));

const inputSquare = (state) => {
    if (state.error) return state;
    const input = state.justEvaluated ? wrapValue(state.result) : state.input;
    if (!endsWithOperand(input)) return state;
    return withInput(state, input + '²');
};

const inputReciprocal = (state) => {
    if (state.error) return state;
    const input = state.justEvaluated ? state.result : closeParens(state.input);
    if (!endsWithOperand(input)) return state;
    return withInput(state, `1÷(${input})`);
};

const toggleSign = (state) => {
    if (state.error) return state;
    if (state.justEvaluated) {
        const result = state.result;
        return withInput(state, result.startsWith('−') ? result.slice(1) : `−${result}`);
    }

    const { input } = state;
    if (input === '') return withInput(state, '−');

    const match = input.match(/(^|[+−×÷^(])(−?)(\d+\.?\d*|\.\d+|π|e)$/);
    if (!match) return state;

    const [whole, prefix, sign, operand] = match;
    const head = input.slice(0, input.length - whole.length);
    return withInput(state, head + prefix + (sign ? '' : '−') + operand);
};

const backspace = (state) => {
    if (state.error) return initialStateFrom(state);
    const input = state.justEvaluated ? state.result : state.input;
    const token = FUNCTION_TOKENS.find((fn) => input.endsWith(fn));
    return withInput(state, input.slice(0, input.length - (token ? token.length : 1)));
};

const initialStateFrom = (state) => withInput(state, '');

const evaluateExpression = (state) => {
    if (state.justEvaluated || state.error || !state.input) return state;
    try {
        const value = evaluateInput(state.input, state.angleMode);
        const result = formatNumber(value);
        const expression = closeParens(state.input);
        return {
            ...state,
            input: expression,
            result,
            error: null,
            justEvaluated: true,
            lastAnswer: result,
            history: [
                { id: Date.now() + Math.random(), expression, result },
                ...state.history,
            ].slice(0, MAX_HISTORY),
        };
    } catch {
        return { ...state, error: 'Error', justEvaluated: false };
    }
};

const updateMemory = (state, update) => {
    const value = currentValue(state);
    if (value === null) return state;
    return { ...state, memory: update(value) };
};

export function calculatorReducer(state, action) {
    switch (action.type) {
        case 'digit':
            return inputDigit(state, action.value);
        case 'decimal':
            return inputDecimal(state);
        case 'operator':
            return inputOperator(state, action.value);
        case 'openParen':
            return inputOpenParen(state);
        case 'closeParen':
            return inputCloseParen(state);
        case 'function':
            return inputFunction(state, action.value);
        case 'constant':
            return action.value === 'π' || action.value === 'e' ? inputValue(state, action.value) : state;
        case 'square':
            return inputSquare(state);
        case 'reciprocal':
            return inputReciprocal(state);
        case 'toggleSign':
            return toggleSign(state);
        case 'answer':
            return state.lastAnswer === null ? state : inputValue(state, wrapValue(state.lastAnswer));
        case 'recall':
            return inputValue(state, wrapValue(action.value));
        case 'backspace':
            return backspace(state);
        case 'clear':
            return initialStateFrom(state);
        case 'evaluate':
            return evaluateExpression(state);
        case 'toggleAngleMode':
            return { ...state, angleMode: state.angleMode === 'DEG' ? 'RAD' : 'DEG' };
        case 'memoryStore':
            return updateMemory(state, (value) => value);
        case 'memoryAdd':
            return updateMemory(state, (value) => (state.memory ?? 0) + value);
        case 'memorySubtract':
            return updateMemory(state, (value) => (state.memory ?? 0) - value);
        case 'memoryRecall':
            return state.memory === null ? state : inputValue(state, wrapValue(formatNumber(state.memory)));
        case 'memoryClear':
            return { ...state, memory: null };
        case 'clearHistory':
            return { ...state, history: [] };
        default:
            return state;
    }
}
