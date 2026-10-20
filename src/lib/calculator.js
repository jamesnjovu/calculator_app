import { buildScope, evaluateReal, solveForX } from './engine';
import { argument, evaluateComplex, isComplex, modulus } from './complex';
import { exactForm, exactToText, formatDecimal, formatDms } from './numberFormat';
import { CalculatorError, VARIABLES, isOperandEnd, openParenDepth, tokenInfo, tokenize } from './tokens';

// The input is kept as the text the user sees (e.g. "sin(30)×2") and split
// into tokens (see tokens.js) to edit, evaluate or render it.

export const FUNCTIONS = {
    sin: 'sin(',
    cos: 'cos(',
    tan: 'tan(',
    log: 'log(',
    ln: 'ln(',
    sqrt: '√(',
    abs: 'Abs(',
};

const MAX_INPUT_LENGTH = 300;
const MAX_HISTORY = 50;
export const ANGLE_UNITS = ['DEG', 'RAD', 'GRAD'];

export const DEFAULT_SETTINGS = {
    angleUnit: 'DEG',
    numberFormat: { type: 'norm', digits: 0 },
    naturalDisplay: true,
    exactResults: true,
    complexForm: 'rect',
};

export const initialState = {
    mode: 'COMP',
    input: '',
    result: null,
    error: null,
    justEvaluated: false,
    settings: DEFAULT_SETTINGS,
    memory: null,
    variables: Object.fromEntries(VARIABLES.filter((name) => name !== 'M').map((name) => [name, 0])),
    lastAnswer: null,
    preAnswer: null,
    history: [],
};

const safeTokens = (input) => {
    try {
        return tokenize(input);
    } catch {
        return [];
    }
};

const lastToken = (input) => {
    const tokens = safeTokens(input);
    return tokens[tokens.length - 1];
};

// True when the input ends with something that can be followed by an operator.
export const endsWithOperand = (input) => isOperandEnd(lastToken(input));

export const openParenCount = (input) => openParenDepth(safeTokens(input));

const limit = (input) => input.slice(0, MAX_INPUT_LENGTH);

// Appends a token that starts a new operand, inserting an explicit × when the
// input already ends with an operand (e.g. "2" + "π" -> "2×π").
const appendOperand = (input, token) => {
    const last = lastToken(input);
    return limit(isOperandEnd(last) && last.kind !== 'dms' ? `${input}×${token}` : input + token);
};

// ---------------------------------------------------------------------------
// Results

const formatComplexNumber = (z, settings, form = settings.complexForm) => {
    const fmt = (x) => formatDecimal(x, settings.numberFormat);
    if (form === 'polar') {
        const angle = argument(z) / { DEG: Math.PI / 180, RAD: 1, GRAD: Math.PI / 200 }[settings.angleUnit];
        return `${fmt(modulus(z))}∠${fmt(angle)}`;
    }
    if (z.im === 0) return fmt(z.re);
    const imaginary = Math.abs(z.im) === 1 ? 'i' : `${fmt(Math.abs(z.im))}i`;
    if (z.re === 0) return z.im < 0 ? `−${imaginary}` : imaginary;
    return `${fmt(z.re)}${z.im < 0 ? '−' : '+'}${imaginary}`;
};

// What to show for a result: { text, exact } where exact is set when the
// result is shown as a fraction, surd or multiple of π.
export const describeResult = (result, settings) => {
    const { value, view, preferExact } = result;
    if (isComplex(value)) {
        const form = view === 'polar' || view === 'rect' ? view : settings.complexForm;
        return { text: formatComplexNumber(value, settings, form), exact: null };
    }
    if (view === 'dms') return { text: formatDms(value), exact: null };
    if (view === 'eng') return { text: formatDecimal(value, { type: 'eng' }), exact: null };
    const wantsExact = view === 'exact' || (view === 'auto' && preferExact && settings.exactResults);
    const exact = wantsExact ? exactForm(value) : null;
    if (exact) return { text: exactToText(exact), exact };
    return { text: formatDecimal(value, settings.numberFormat), exact: null };
};

export const formatValue = (value, settings) =>
    isComplex(value) ? formatComplexNumber(value, settings) : formatDecimal(value, settings.numberFormat);

const scopeFor = (state) =>
    buildScope({
        variables: state.variables,
        memory: state.memory,
        lastAnswer: state.lastAnswer,
        preAnswer: state.preAnswer,
    });

const evaluateFor = (state, input) => {
    const options = { angleUnit: state.settings.angleUnit, scope: scopeFor(state) };
    return state.mode === 'CMPLX' ? evaluateComplex(input, options) : evaluateReal(input, options);
};

// Live result shown while typing; null when the input can't be evaluated yet.
export const previewResult = (state) => {
    if (state.justEvaluated || state.error || !state.input) return null;
    if (/Ran|=/.test(state.input)) return null;
    try {
        const preview = formatValue(evaluateFor(state, state.input), state.settings);
        return preview === state.input ? null : preview;
    } catch {
        return null;
    }
};

// Real value the memory and variable keys act on: the last result or the current expression.
const currentRealValue = (state) => {
    if (state.error) return null;
    const value = state.justEvaluated
        ? state.result.value
        : (() => {
              try {
                  return evaluateFor(state, state.input);
              } catch {
                  return null;
              }
          })();
    if (isComplex(value)) return value.im === 0 ? value.re : null;
    return value;
};

// ---------------------------------------------------------------------------
// Editing

// Input to build on when starting a new operand: a finished calculation or
// an error starts a fresh expression.
const operandBase = (state) => (state.justEvaluated || state.error ? '' : state.input);

// Input to build on when applying an operator: continues from the last result as "Ans".
const operatorBase = (state) => {
    if (state.error) return '';
    if (state.justEvaluated) return 'Ans';
    return state.input;
};

const withInput = (state, input) => ({
    ...state,
    input,
    result: null,
    error: null,
    justEvaluated: false,
});

const inputDigit = (state, digit) => {
    let input = operandBase(state);
    const last = lastToken(input);
    if (last && ['constant', 'variable', 'close', 'postfix'].includes(last.kind)) input += '×';
    // Replace a lone leading zero ("0" -> "7", "5+0" -> "5+7")
    if (last?.kind === 'number' && last.display === '0') input = input.slice(0, -1);
    return withInput(state, limit(input + digit));
};

const inputDecimal = (state) => {
    const input = operandBase(state);
    const last = lastToken(input);
    if (last?.kind === 'number') {
        return last.display.includes('.') ? state : withInput(state, input + '.');
    }
    return withInput(state, appendOperand(input, '0.'));
};

const inputOperator = (state, operator) => {
    let input = operatorBase(state);
    if (input === '') return withInput(state, operator === '−' ? '−' : `0${operator}`);

    const tokens = safeTokens(input);
    const last = tokens[tokens.length - 1];
    if (last?.kind === 'operator') {
        // Allow a negative sign after ×, ÷ and ^ ("5×−3")
        if (operator === '−' && ['×', '÷', '^'].includes(last.display)) return withInput(state, input + operator);
        while (safeTokens(input).slice(-1)[0]?.kind === 'operator') input = input.slice(0, -1);
        const before = lastToken(input);
        if (!isOperandEnd(before)) return withInput(state, operator === '−' ? input + operator : input);
        return withInput(state, input + operator);
    }
    if (!isOperandEnd(last)) {
        return operator === '−' ? withInput(state, limit(input + operator)) : state;
    }
    return withInput(state, limit(input + operator));
};

// Postfix (x², x!) and infix (nPr) operators need an operand before them.
const inputAfterOperand = (state, token) => {
    const input = operatorBase(state);
    if (!endsWithOperand(input)) return state;
    return withInput(state, limit(input + token));
};

const inputCloseParen = (state) => {
    if (state.justEvaluated || state.error) return state;
    if (openParenCount(state.input) <= 0 || !endsWithOperand(state.input)) return state;
    return withInput(state, state.input + ')');
};

const inputComma = (state) => {
    if (state.justEvaluated || state.error) return state;
    if (openParenCount(state.input) <= 0 || !endsWithOperand(state.input)) return state;
    return withInput(state, state.input + ',');
};

const inputEquals = (state) => {
    if (state.mode !== 'COMP' || state.justEvaluated || state.error) return state;
    if (state.input.includes('=') || !endsWithOperand(state.input)) return state;
    return withInput(state, state.input + '=');
};

const inputDms = (state) => {
    if (state.justEvaluated) return toggleView(state, 'dms');
    if (lastToken(state.input)?.kind !== 'number') return state;
    return withInput(state, state.input + '°');
};

const insertToken = (state, token) => {
    const info = tokenInfo(token);
    if (!info) return state;
    if (info.complexOnly && state.mode !== 'CMPLX') return state;
    switch (info.kind) {
        case 'function':
        case 'constant':
        case 'variable':
        case 'open':
            return withInput(state, appendOperand(operandBase(state), token));
        case 'operator':
            return inputOperator(state, token);
        case 'postfix':
        case 'infix':
            return inputAfterOperand(state, token);
        case 'close':
            return inputCloseParen(state);
        case 'comma':
            return inputComma(state);
        case 'equals':
            return inputEquals(state);
        case 'dms':
            return inputDms(state);
        default:
            return state;
    }
};

const toggleSign = (state) => {
    if (state.error) return state;
    if (state.justEvaluated) return withInput(state, '−Ans');

    const { input } = state;
    if (input === '') return withInput(state, '−');

    const match = input.match(/(^|[+−×÷^(,])(−?)(\d+\.?\d*|\.\d+|π|e|Ans|[A-FXYM])$/);
    if (!match) return state;

    const [whole, prefix, sign, operand] = match;
    const head = input.slice(0, input.length - whole.length);
    return withInput(state, head + prefix + (sign ? '' : '−') + operand);
};

const backspace = (state) => {
    // After a result or an error, go back to editing the expression
    if (state.error || state.justEvaluated) return withInput(state, state.input);
    const tokens = safeTokens(state.input);
    const last = tokens[tokens.length - 1];
    if (!last) return withInput(state, state.input.slice(0, -1));
    const remove = last.kind === 'number' ? 1 : last.display.length;
    return withInput(state, state.input.slice(0, state.input.length - remove));
};

const clear = (state) => withInput(state, '');

// ---------------------------------------------------------------------------
// Evaluation

const recordResult = (state, { value, expression, label = null }) => {
    const preferExact = state.mode === 'COMP' && !/[.]|Ran/.test(expression);
    const result = { value, label, view: 'auto', preferExact };
    const { text } = describeResult(result, state.settings);
    return {
        ...state,
        input: expression,
        result,
        error: null,
        justEvaluated: true,
        preAnswer: state.lastAnswer,
        lastAnswer: value,
        variables: label === 'X' ? { ...state.variables, X: value } : state.variables,
        history: [
            { id: Date.now() + Math.random(), expression, result: label ? `${label} = ${text}` : text, value },
            ...state.history,
        ].slice(0, MAX_HISTORY),
    };
};

const withError = (state, error) => ({
    ...state,
    error: error instanceof CalculatorError ? error.message : 'Error',
    justEvaluated: false,
});

const closeParens = (input) => input + ')'.repeat(Math.max(0, openParenCount(input)));

const solve = (state) => {
    if (state.mode !== 'COMP' || state.error || !state.input) return state;
    try {
        const options = { angleUnit: state.settings.angleUnit, scope: scopeFor(state) };
        const root = solveForX(state.input, options, state.variables.X ?? 0);
        return recordResult(state, { value: root, expression: closeParens(state.input), label: 'X' });
    } catch (error) {
        return withError(state, error);
    }
};

const evaluateExpression = (state) => {
    if (state.justEvaluated || state.error || !state.input) return state;
    if (state.input.includes('=')) return solve(state);
    try {
        const value = evaluateFor(state, state.input);
        return recordResult(state, { value, expression: closeParens(state.input) });
    } catch (error) {
        return withError(state, error);
    }
};

// S⇔D, ENG and °'" change how the current result is shown.
const toggleView = (state, view) => {
    if (!state.justEvaluated) return state;
    const { result } = state;
    let next;
    if (view === 'sd') {
        const showingExact = describeResult(result, state.settings).exact !== null;
        next = showingExact ? 'decimal' : 'exact';
    } else if (view === 'polar' || view === 'rect') {
        next = view;
    } else {
        next = result.view === view ? 'decimal' : view;
    }
    if (isComplex(result.value) && !['polar', 'rect'].includes(next)) return state;
    return { ...state, result: { ...result, view: next } };
};

const updateMemory = (state, update) => {
    const value = currentRealValue(state);
    if (value === null || value === undefined) return state;
    return { ...state, memory: update(value) };
};

const storeVariable = (state, name) => {
    if (name === 'M') return updateMemory(state, (value) => value);
    const value = currentRealValue(state);
    if (value === null || value === undefined || !(name in state.variables)) return state;
    return { ...state, variables: { ...state.variables, [name]: value } };
};

// Text that represents a value inside an expression.
export const valueToInput = (value, settings = DEFAULT_SETTINGS) => {
    const text = isComplex(value)
        ? formatComplexNumber(value, { ...settings, numberFormat: { type: 'norm' } }, 'rect')
        : formatDecimal(value, { type: 'norm' });
    return /^−|[+−×∠]/.test(text) ? `(${text})` : text;
};

export function calculatorReducer(state, action) {
    switch (action.type) {
        case 'digit':
            return inputDigit(state, action.value);
        case 'decimal':
            return inputDecimal(state);
        case 'insert':
            return insertToken(state, action.value);
        case 'operator':
            return inputOperator(state, action.value);
        case 'insertOperand':
            return withInput(state, appendOperand(operandBase(state), action.value));
        case 'exponent': {
            // ×10ˣ: scales the number before it, or starts with 10^ on its own
            const base = operatorBase(state);
            return withInput(state, limit(endsWithOperand(base) ? `${base}×10^` : appendOperand(base, '10^')));
        }
        case 'openParen':
            return insertToken(state, '(');
        case 'closeParen':
            return inputCloseParen(state);
        case 'function':
            return FUNCTIONS[action.value] ? insertToken(state, FUNCTIONS[action.value]) : state;
        case 'constant':
            return insertToken(state, action.value);
        case 'square':
            return insertToken(state, '²');
        case 'reciprocal':
            return insertToken(state, '⁻¹');
        case 'factorial':
            return insertToken(state, '!');
        case 'toggleSign':
            return toggleSign(state);
        case 'answer':
            return state.lastAnswer === null ? state : insertToken(state, 'Ans');
        case 'recall':
            return withInput(state, appendOperand(operandBase(state), valueToInput(action.value, state.settings)));
        case 'backspace':
            return backspace(state);
        case 'clear':
            return clear(state);
        case 'evaluate':
            return evaluateExpression(state);
        case 'solve':
            return solve(state);
        case 'toggleView':
            return toggleView(state, action.value);
        case 'toggleAngleMode': {
            const next = ANGLE_UNITS[(ANGLE_UNITS.indexOf(state.settings.angleUnit) + 1) % ANGLE_UNITS.length];
            return { ...state, settings: { ...state.settings, angleUnit: next } };
        }
        case 'setSetting':
            return { ...state, settings: { ...state.settings, [action.key]: action.value } };
        case 'setMode':
            return action.value === state.mode ? state : { ...clear(state), mode: action.value, lastAnswer: null, preAnswer: null };
        case 'store':
            return storeVariable(state, action.value);
        case 'clearVariables':
            return { ...state, variables: initialState.variables, memory: null };
        case 'memoryStore':
            return updateMemory(state, (value) => value);
        case 'memoryAdd':
            return updateMemory(state, (value) => (state.memory ?? 0) + value);
        case 'memorySubtract':
            return updateMemory(state, (value) => (state.memory ?? 0) - value);
        case 'memoryRecall':
            return state.memory === null ? state : insertToken(state, 'M');
        case 'memoryClear':
            return { ...state, memory: null };
        case 'clearHistory':
            return { ...state, history: [] };
        default:
            return state;
    }
}
