import { BASES, formatBase } from './baseN';

// Base-N calculator: integer expressions in DEC, HEX, BIN or OCT with the
// fx-991ES logical operators. Values are 32-bit two's complement integers.

const MIN = -(2 ** 31);
const MAX = 2 ** 31 - 1;
const MAX_INPUT_LENGTH = 200;

export class BaseNError extends Error {}

const fail = (message) => {
    throw new BaseNError(message);
};

export const BASE_DIGITS = {
    DEC: '0123456789',
    HEX: '0123456789ABCDEF',
    BIN: '01',
    OCT: '01234567',
};

export const isDigitAllowed = (digit, base) => BASE_DIGITS[base].includes(digit);

// Longest first so "xnor" wins over "xor"
const SYMBOLS = ['xnor', 'xor', 'and', 'or', 'Not(', 'Neg(', 'Ans', '+', '−', '×', '÷', '(', ')'];
const INFIX = new Set(['+', '−', '×', '÷', 'and', 'or', 'xor', 'xnor']);
const OPENS = new Set(['(', 'Not(', 'Neg(']);

export const tokenizeBaseN = (input) => {
    const tokens = [];
    let rest = input;
    while (rest) {
        // Symbols first so the "A" of "Ans" is not read as a hex digit
        const symbol = SYMBOLS.find((candidate) => rest.startsWith(candidate));
        if (symbol) {
            tokens.push({ type: 'symbol', text: symbol });
            rest = rest.slice(symbol.length);
            continue;
        }
        const digits = rest.match(/^[0-9A-F]+/);
        if (!digits) fail('Syntax error');
        tokens.push({ type: 'number', text: digits[0] });
        rest = rest.slice(digits[0].length);
    }
    return tokens;
};

const checked = (value) => {
    if (!Number.isFinite(value) || value < MIN || value > MAX) fail('Out of range');
    return value;
};

const parseLiteral = (text, base) => {
    if ([...text].some((digit) => !isDigitAllowed(digit, base))) fail(`Invalid ${base} digit`);
    const value = parseInt(text, BASES[base]);
    if (base === 'DEC') return checked(value);
    // HEX, BIN and OCT literals cover the full 32 bits, e.g. FFFFFFFF = −1
    if (value > 0xffffffff) fail('Out of range');
    return value | 0;
};

// Recursive descent, lowest precedence first:
//   or/xor/xnor  <  and  <  + −  <  × ÷  <  unary −, Not, Neg
const parse = (tokens, base, answer) => {
    let position = 0;
    const peek = () => tokens[position]?.text;
    const next = () => tokens[position++];

    const binary = (operators, operand, apply) => () => {
        let left = operand();
        while (operators.includes(peek())) {
            const operator = next().text;
            left = apply(operator, left, operand());
        }
        return left;
    };

    const primary = () => {
        const token = next();
        if (!token) fail('Incomplete expression');
        if (token.type === 'number') return parseLiteral(token.text, base);
        if (token.text === 'Ans') return answer ?? 0;
        if (token.text === '−') return checked(-primary());
        if (OPENS.has(token.text)) {
            const value = logical();
            if (next()?.text !== ')') fail('Syntax error');
            if (token.text === 'Not(') return ~value;
            if (token.text === 'Neg(') return checked(-value);
            return value;
        }
        return fail('Syntax error');
    };

    const multiplicative = binary(['×', '÷'], primary, (operator, a, b) => {
        if (operator === '×') return checked(a * b);
        if (b === 0) fail("Can't divide by zero");
        return checked(Math.trunc(a / b));
    });
    const additive = binary(['+', '−'], multiplicative, (operator, a, b) => checked(operator === '+' ? a + b : a - b));
    const and = binary(['and'], additive, (_, a, b) => a & b);
    const logical = binary(['or', 'xor', 'xnor'], and, (operator, a, b) => {
        if (operator === 'or') return a | b;
        if (operator === 'xor') return a ^ b;
        return ~(a ^ b);
    });

    const value = logical();
    if (position < tokens.length) fail('Syntax error');
    return value;
};

const openDepth = (tokens) =>
    tokens.reduce((depth, token) => depth + (OPENS.has(token.text) ? 1 : token.text === ')' ? -1 : 0), 0);

export const evaluateBaseN = (input, base, answer = null) => {
    const tokens = tokenizeBaseN(input);
    if (tokens.length === 0) fail('Incomplete expression');
    const last = tokens[tokens.length - 1];
    if (INFIX.has(last.text) || OPENS.has(last.text)) fail('Incomplete expression');
    const closed = [...tokens, ...Array(Math.max(0, openDepth(tokens))).fill({ type: 'symbol', text: ')' })];
    return parse(closed, base, answer);
};

// ---------------------------------------------------------------------------
// Reducer

export const initialBaseNState = {
    base: 'DEC',
    input: '',
    result: null,
    error: null,
    justEvaluated: false,
    lastAnswer: null,
};

const safeTokens = (input) => {
    try {
        return tokenizeBaseN(input);
    } catch {
        return [];
    }
};

const lastToken = (input) => safeTokens(input).slice(-1)[0];

const endsWithOperand = (input) => {
    const last = lastToken(input);
    return Boolean(last) && (last.type === 'number' || last.text === ')' || last.text === 'Ans');
};

const withInput = (state, input) => ({ ...state, input: input.slice(0, MAX_INPUT_LENGTH), result: null, error: null, justEvaluated: false });

const freshBase = (state) => (state.justEvaluated || state.error ? '' : state.input);

const appendOperand = (input, token) => (endsWithOperand(input) ? `${input}×${token}` : input + token);

const inputDigit = (state, digit) => {
    if (!isDigitAllowed(digit, state.base)) return state;
    const input = freshBase(state);
    const last = lastToken(input);
    if (last && (last.text === ')' || last.text === 'Ans')) return withInput(state, `${input}×${digit}`);
    return withInput(state, input + digit);
};

const inputOperator = (state, operator) => {
    let input = state.error ? '' : state.justEvaluated ? 'Ans' : state.input;
    if (input === '') return operator === '−' ? withInput(state, '−') : state;
    const last = lastToken(input);
    if (last && INFIX.has(last.text)) {
        // A minus after another operator makes the next number negative
        if (operator === '−' && last.text !== '−') return withInput(state, input + operator);
        input = input.slice(0, input.length - last.text.length);
        while (lastToken(input) && INFIX.has(lastToken(input).text)) input = input.slice(0, input.length - lastToken(input).text.length);
        return endsWithOperand(input) ? withInput(state, input + operator) : withInput(state, input);
    }
    if (!endsWithOperand(input)) return operator === '−' ? withInput(state, input + operator) : state;
    return withInput(state, input + operator);
};

const inputClose = (state) => {
    if (state.justEvaluated || state.error) return state;
    if (openDepth(safeTokens(state.input)) <= 0 || !endsWithOperand(state.input)) return state;
    return withInput(state, `${state.input})`);
};

const backspace = (state) => {
    if (state.error || state.justEvaluated) return withInput(state, state.input);
    const last = lastToken(state.input);
    if (!last) return withInput(state, state.input.slice(0, -1));
    const remove = last.type === 'number' ? 1 : last.text.length;
    return withInput(state, state.input.slice(0, state.input.length - remove));
};

const closeParens = (input) => input + ')'.repeat(Math.max(0, openDepth(safeTokens(input))));

const evaluate = (state) => {
    if (state.justEvaluated || state.error || !state.input) return state;
    try {
        const value = evaluateBaseN(state.input, state.base, state.lastAnswer);
        const expression = closeParens(state.input);
        return {
            ...state,
            input: expression,
            result: value,
            error: null,
            justEvaluated: true,
            lastAnswer: value,
        };
    } catch (error) {
        return { ...state, error: error instanceof BaseNError ? error.message : 'Error', justEvaluated: false };
    }
};

// Switching base shows the current value in the new base, like DEC/HEX/BIN/OCT on the fx-991ES
const setBase = (state, base) => {
    if (base === state.base) return state;
    if (state.justEvaluated) return { ...state, base };
    if (state.input && !state.error) {
        const evaluated = evaluate(state);
        if (evaluated.justEvaluated) return { ...evaluated, base };
    }
    const keep = [...state.input.replace(/Ans|Not\(|Neg\(|xnor|xor|and|or/g, '')].every((char) => !/[0-9A-F]/.test(char) || isDigitAllowed(char, base));
    return { ...withInput(state, keep ? state.input : ''), base };
};

export const formatInBase = (value, base) => formatBase(value, base);

export function baseNReducer(state, action) {
    switch (action.type) {
        case 'digit':
            return inputDigit(state, action.value);
        case 'operator':
            return inputOperator(state, action.value);
        case 'open':
            return withInput(state, appendOperand(freshBase(state), action.value ?? '('));
        case 'close':
            return inputClose(state);
        case 'answer':
            return state.lastAnswer === null ? state : withInput(state, appendOperand(freshBase(state), 'Ans'));
        case 'backspace':
            return backspace(state);
        case 'clear':
            return withInput(state, '');
        case 'evaluate':
            return evaluate(state);
        case 'setBase':
            return BASES[action.value] ? setBase(state, action.value) : state;
        default:
            return state;
    }
}
