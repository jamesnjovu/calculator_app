import { math, ERRORS } from './engine';
import { CONSTANTS } from './constants';
import { CalculatorError, ERROR, prepareTokens, tokenize, tokensToMath } from './tokens';

// Minimal complex arithmetic for CMPLX mode. Values are { re, im }.
export const complex = (re, im = 0) => ({ re, im });

const fail = (message) => {
    throw new CalculatorError(message);
};

const add = (a, b) => complex(a.re + b.re, a.im + b.im);
const subtract = (a, b) => complex(a.re - b.re, a.im - b.im);
const multiply = (a, b) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const divide = (a, b) => {
    const denominator = b.re * b.re + b.im * b.im;
    if (denominator === 0) fail(ERRORS.divideByZero);
    return complex((a.re * b.re + a.im * b.im) / denominator, (a.im * b.re - a.re * b.im) / denominator);
};
export const modulus = (z) => Math.hypot(z.re, z.im);
// + 0 turns −0 into 0 so that arg(−4) is π rather than −π
export const argument = (z) => Math.atan2(z.im + 0, z.re);
const exp = (z) => complex(Math.exp(z.re) * Math.cos(z.im), Math.exp(z.re) * Math.sin(z.im));
const log = (z) => {
    if (z.re === 0 && z.im === 0) fail(ERRORS.range);
    return complex(Math.log(modulus(z)), argument(z));
};
const fromPolar = (r, theta) => complex(r * Math.cos(theta), r * Math.sin(theta));

const power = (base, exponent) => {
    if (exponent.im === 0 && Number.isInteger(exponent.re) && Math.abs(exponent.re) <= 64) {
        let result = complex(1);
        for (let i = 0; i < Math.abs(exponent.re); i += 1) result = multiply(result, base);
        return exponent.re < 0 ? divide(complex(1), result) : result;
    }
    if (base.re === 0 && base.im === 0) return complex(0);
    return exp(multiply(exponent, log(base)));
};

const realOnly = (z) => {
    if (Math.abs(z.im) > 1e-12) fail(ERRORS.invalid);
    return z.re;
};

const ANGLE_TO_RADIANS = { DEG: Math.PI / 180, RAD: 1, GRAD: Math.PI / 200 };

const constants = Object.fromEntries(CONSTANTS.map((constant, index) => [`cst${index}`, constant.value]));

const evaluateNode = (node, env) => {
    const toRadians = (x) => x * ANGLE_TO_RADIANS[env.angleUnit];
    const fromRadians = (x) => x / ANGLE_TO_RADIANS[env.angleUnit];
    const evaluate = (child) => evaluateNode(child, env);

    switch (node.type) {
        case 'ConstantNode':
            return complex(Number(node.value));
        case 'ParenthesisNode':
            return evaluate(node.content);
        case 'SymbolNode': {
            if (node.name === 'i') return complex(0, 1);
            if (node.name === 'pi') return complex(Math.PI);
            if (node.name === 'e') return complex(Math.E);
            if (node.name in constants) return complex(constants[node.name]);
            const value = env.scope[node.name];
            if (value === undefined) fail(ERROR.syntax);
            return typeof value === 'number' ? complex(value) : value;
        }
        case 'OperatorNode': {
            const args = node.args.map(evaluate);
            switch (node.fn) {
                case 'add': return add(args[0], args[1]);
                case 'subtract': return subtract(args[0], args[1]);
                case 'multiply': return multiply(args[0], args[1]);
                case 'divide': return divide(args[0], args[1]);
                case 'pow': return power(args[0], args[1]);
                case 'unaryMinus': return complex(-args[0].re, -args[0].im);
                case 'unaryPlus': return args[0];
                default: return fail(ERROR.syntax);
            }
        }
        case 'FunctionNode': {
            const args = node.args.map(evaluate);
            const [z] = args;
            switch (node.fn.name) {
                case 'sqrt': return power(z, complex(0.5));
                case 'abs': return complex(modulus(z));
                case 'carg': return complex(fromRadians(argument(z)));
                case 'conj': return complex(z.re, -z.im);
                case 're': return complex(z.re);
                case 'im': return complex(z.im);
                case 'log': return log(z);
                case 'log10': return divide(log(z), complex(Math.LN10));
                case 'polar': return fromPolar(realOnly(args[0]), toRadians(realOnly(args[1])));
                case 'fsin': return complex(Math.sin(toRadians(realOnly(z))));
                case 'fcos': return complex(Math.cos(toRadians(realOnly(z))));
                case 'ftan': return complex(Math.tan(toRadians(realOnly(z))));
                default: return fail(ERROR.syntax);
            }
        }
        default:
            return fail(ERROR.syntax);
    }
};

const clean = (z) => {
    const size = Math.max(Math.abs(z.re), Math.abs(z.im));
    const tidy = (x) => (Math.abs(x) < 1e-12 * Math.max(1, size) ? 0 : x);
    return complex(tidy(z.re), tidy(z.im));
};

// Evaluates a display string in CMPLX mode. options: { angleUnit, scope }
export const evaluateComplex = (input, { angleUnit = 'DEG', scope = {} } = {}) => {
    const tokens = tokenize(input);
    const last = tokens[tokens.length - 1];
    if (!last || ['operator', 'infix', 'function', 'open', 'comma', 'equals'].includes(last.kind)) {
        fail(ERROR.incomplete);
    }
    let node;
    try {
        node = math.parse(tokensToMath(prepareTokens(tokens, { complex: true })));
    } catch {
        fail(ERROR.syntax);
    }
    const value = clean(evaluateNode(node, { angleUnit, scope }));
    if (!Number.isFinite(value.re) || !Number.isFinite(value.im)) fail(ERRORS.range);
    return value;
};

export const isComplex = (value) => typeof value === 'object' && value !== null && 're' in value;
