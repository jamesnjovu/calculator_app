import { CONSTANTS } from './constants';
import { CONVERSIONS } from './conversions';

// Every symbol that can appear in the input. The input is kept as the text the
// user sees and is split into these tokens to evaluate or render it.
//
// kinds:
//   function  - opens a parenthesis, e.g. "sin("
//   constant  - a value such as π, Ans or a scientific constant
//   variable  - A–F, X, Y, M
//   postfix   - applies to the operand before it, e.g. "²" or "!"
//   operator  - + − × ÷ ^
//   infix     - binary operators that need rewriting, e.g. nPr
//   open, close, comma, equals, dms

export const ERROR = {
    syntax: 'Syntax error',
    incomplete: 'Incomplete expression',
};

export class CalculatorError extends Error {}

const fn = (display, math, extra = {}) => ({ display, math, kind: 'function', ...extra });

export const FUNCTION_TOKENS = [
    fn('sin(', 'fsin('),
    fn('cos(', 'fcos('),
    fn('tan(', 'ftan('),
    fn('sin⁻¹(', 'fasin('),
    fn('cos⁻¹(', 'facos('),
    fn('tan⁻¹(', 'fatan('),
    fn('sinh(', 'sinh('),
    fn('cosh(', 'cosh('),
    fn('tanh(', 'tanh('),
    fn('sinh⁻¹(', 'asinh('),
    fn('cosh⁻¹(', 'acosh('),
    fn('tanh⁻¹(', 'atanh('),
    fn('log(', 'log10('),
    fn('ln(', 'log('),
    fn('logₐ(', 'logab('),
    fn('√(', 'sqrt('),
    fn('∛(', 'cbrt('),
    fn('ˣ√(', 'nroot('),
    fn('Abs(', 'abs('),
    fn('frac(', 'frac('),
    fn('Int(', 'fix('),
    fn('Intg(', 'floor('),
    fn('GCD(', 'gcd('),
    fn('LCM(', 'lcm('),
    fn('RanInt(', 'ranint('),
    fn('∫(', 'integ('),
    fn('d/dx(', 'deriv('),
    fn('Σ(', 'sumx('),
    fn('Π(', 'prodx('),
    fn('arg(', 'carg(', { complexOnly: true }),
    fn('Conjg(', 'conj(', { complexOnly: true }),
    fn('ReP(', 're(', { complexOnly: true }),
    fn('ImP(', 'im(', { complexOnly: true }),
    ...CONVERSIONS.map((conversion, index) => fn(conversion.token, `cv${index}(`)),
];

export const VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'M'];

const TOKENS = [
    ...FUNCTION_TOKENS,
    { display: 'π', math: 'pi', kind: 'constant' },
    { display: 'e', math: 'e', kind: 'constant' },
    { display: 'i', math: 'i', kind: 'constant', complexOnly: true },
    { display: 'Ran#', math: 'ran()', kind: 'constant', random: true },
    { display: 'Ans', math: 'ans', kind: 'constant' },
    { display: 'PreAns', math: 'preans', kind: 'constant' },
    ...CONSTANTS.map((constant, index) => ({ display: constant.symbol, math: `cst${index}`, kind: 'constant' })),
    ...VARIABLES.map((name) => ({ display: name, math: `var${name}`, kind: 'variable' })),
    { display: '²', math: '^2', kind: 'postfix' },
    { display: '³', math: '^3', kind: 'postfix' },
    { display: '⁻¹', math: '^(-1)', kind: 'postfix' },
    { display: '!', math: '!', kind: 'postfix' },
    { display: '%', math: '%', kind: 'postfix' },
    { display: '+', math: '+', kind: 'operator' },
    { display: '−', math: '-', kind: 'operator' },
    { display: '×', math: '*', kind: 'operator' },
    { display: '÷', math: '/', kind: 'operator' },
    { display: '^', math: '^', kind: 'operator' },
    { display: 'nPr', math: 'permutations', kind: 'infix' },
    { display: 'nCr', math: 'combinations', kind: 'infix' },
    { display: '∠', math: 'polar', kind: 'infix', complexOnly: true },
    { display: '(', math: '(', kind: 'open' },
    { display: ')', math: ')', kind: 'close' },
    { display: ',', math: ',', kind: 'comma' },
    { display: '=', math: '=', kind: 'equals' },
    { display: '°', math: '', kind: 'dms' },
];

// Longest first so that "sin⁻¹(" wins over "sin(" and "PreAns" over "Ans"
const SORTED_TOKENS = [...TOKENS].sort((a, b) => b.display.length - a.display.length);
const TOKEN_BY_DISPLAY = new Map(TOKENS.map((token) => [token.display, token]));

export const tokenInfo = (display) => TOKEN_BY_DISPLAY.get(display) ?? null;

const NUMBER = /^(\d+\.?\d*|\.\d+)/;

export const tokenize = (input) => {
    const tokens = [];
    let rest = input;
    while (rest.length > 0) {
        const number = rest.match(NUMBER);
        if (number) {
            tokens.push({ display: number[0], math: number[0], kind: 'number' });
            rest = rest.slice(number[0].length);
            continue;
        }
        const token = SORTED_TOKENS.find((candidate) => rest.startsWith(candidate.display));
        if (!token) throw new CalculatorError(ERROR.syntax);
        tokens.push(token);
        rest = rest.slice(token.display.length);
    }
    return tokens;
};

const OPENS = new Set(['open', 'function']);
const OPERAND_KINDS = new Set(['number', 'constant', 'variable', 'group']);

export const isOperandEnd = (token) =>
    Boolean(token) && (OPERAND_KINDS.has(token.kind) || ['postfix', 'close', 'dms'].includes(token.kind));

export const openParenDepth = (tokens) =>
    tokens.reduce((depth, token) => depth + (OPENS.has(token.kind) ? 1 : token.kind === 'close' ? -1 : 0), 0);

export const tokensToMath = (tokens) => tokens.map((token) => token.math).join('');

// Index of the first token of the operand that ends just before `end`.
const operandStart = (tokens, end) => {
    let i = end - 1;
    while (i >= 0 && tokens[i].kind === 'postfix') i -= 1;
    if (i < 0) throw new CalculatorError(ERROR.syntax);
    if (OPERAND_KINDS.has(tokens[i].kind)) return i;
    if (tokens[i].kind !== 'close') throw new CalculatorError(ERROR.syntax);

    let depth = 0;
    for (let j = i; j >= 0; j -= 1) {
        if (tokens[j].kind === 'close') depth += 1;
        else if (OPENS.has(tokens[j].kind)) depth -= 1;
        if (depth === 0) return j;
    }
    throw new CalculatorError(ERROR.syntax);
};

// Index just after the operand that starts at `start` (a leading minus is allowed).
const operandEnd = (tokens, start) => {
    let i = start;
    if (tokens[i]?.display === '−') i += 1;
    const token = tokens[i];
    if (!token) throw new CalculatorError(ERROR.incomplete);
    if (OPERAND_KINDS.has(token.kind)) {
        i += 1;
    } else if (OPENS.has(token.kind)) {
        let depth = 0;
        for (; i < tokens.length; i += 1) {
            if (OPENS.has(tokens[i].kind)) depth += 1;
            else if (tokens[i].kind === 'close') depth -= 1;
            if (depth === 0) break;
        }
        if (depth !== 0) throw new CalculatorError(ERROR.incomplete);
        i += 1;
    } else {
        throw new CalculatorError(ERROR.syntax);
    }
    while (tokens[i]?.kind === 'postfix') i += 1;
    return i;
};

const group = (math) => ({ display: '', math, kind: 'group' });

// Degrees-minutes-seconds: 12°30°15° -> dms(12,30,15)
const rewriteDms = (tokens) => {
    const result = [];
    for (let i = 0; i < tokens.length; i += 1) {
        if (tokens[i].kind === 'number' && tokens[i + 1]?.kind === 'dms') {
            const parts = [tokens[i].math];
            i += 2;
            while (parts.length < 3 && tokens[i]?.kind === 'number' && tokens[i + 1]?.kind === 'dms') {
                parts.push(tokens[i].math);
                i += 2;
            }
            result.push(group(`dms(${parts.join(',')})`));
            i -= 1;
        } else if (tokens[i].kind === 'dms') {
            throw new CalculatorError(ERROR.syntax);
        } else {
            result.push(tokens[i]);
        }
    }
    return result;
};

// nPr, nCr and ∠ take the operands on either side: 5nPr2 -> permutations(5,2)
const rewriteInfix = (tokens) => {
    let current = tokens;
    let index = current.findIndex((token) => token.kind === 'infix');
    while (index !== -1) {
        const start = operandStart(current, index);
        const end = operandEnd(current, index + 1);
        const left = tokensToMath(current.slice(start, index));
        const right = tokensToMath(current.slice(index + 1, end));
        current = [...current.slice(0, start), group(`${current[index].math}(${left},${right})`), ...current.slice(end)];
        index = current.findIndex((token) => token.kind === 'infix');
    }
    return current;
};

// Prepares tokens for evaluation: closes open parentheses and rewrites the
// operators math.js does not understand.
export const prepareTokens = (tokens, { complex = false } = {}) => {
    if (!complex && tokens.some((token) => token.complexOnly)) throw new CalculatorError(ERROR.syntax);
    const closed = [...tokens];
    for (let depth = openParenDepth(tokens); depth > 0; depth -= 1) closed.push(TOKEN_BY_DISPLAY.get(')'));
    return rewriteInfix(rewriteDms(closed));
};

export const toMathExpression = (input, options) => tokensToMath(prepareTokens(tokenize(input), options));
