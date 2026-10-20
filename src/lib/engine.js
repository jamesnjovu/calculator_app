import { all, create } from 'mathjs/number';
import { CONSTANTS } from './constants';
import { CONVERSIONS } from './conversions';
import { CalculatorError, ERROR, VARIABLES, prepareTokens, tokenize, tokensToMath } from './tokens';

export const math = create(all);

// Set for the duration of each evaluation; math.js calls the imported
// functions synchronously, so a module-level context is safe.
const context = { angleUnit: 'DEG', scope: {} };

const ANGLE_TO_RADIANS = { DEG: Math.PI / 180, RAD: 1, GRAD: Math.PI / 200 };
const toRadians = (x) => x * ANGLE_TO_RADIANS[context.angleUnit];
const fromRadians = (x) => x / ANGLE_TO_RADIANS[context.angleUnit];

// Values smaller than this are floating point noise (e.g. sin(180°)).
const EPSILON = 1e-12;
const snap = (value) => (Math.abs(value) < EPSILON ? 0 : value);

export const ERRORS = {
    divideByZero: "Can't divide by zero",
    invalid: 'Invalid input',
    range: 'Out of range',
    undefined: 'Undefined',
    noSolution: "Can't solve",
    tooManyTerms: 'Too many terms',
};

const fail = (message) => {
    throw new CalculatorError(message);
};

const MAX_TERMS = 1e6;

// Evaluates the first (unevaluated) argument as a function of X.
const functionOfX = (node) => {
    const compiled = node.compile();
    const scope = context.scope;
    return (x) => {
        const value = compiled.evaluate({ ...scope, varX: x });
        if (typeof value !== 'number' || Number.isNaN(value)) fail(ERRORS.invalid);
        return value;
    };
};

const evaluateArgument = (node) => node.compile().evaluate({ ...context.scope });

// 5-point Gauss–Legendre on [a, b]; never evaluates the end points.
const GAUSS_NODES = [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664];
const GAUSS_WEIGHTS = [0.5688888888888889, 0.4786286704993665, 0.4786286704993665, 0.2369268850561891, 0.2369268850561891];

const gauss = (f, a, b) => {
    const half = (b - a) / 2;
    const middle = (a + b) / 2;
    return half * GAUSS_NODES.reduce((sum, node, i) => sum + GAUSS_WEIGHTS[i] * f(middle + half * node), 0);
};

const adaptiveIntegral = (f, a, b, whole, tolerance, depth) => {
    const middle = (a + b) / 2;
    const left = gauss(f, a, middle);
    const right = gauss(f, middle, b);
    // At the depth limit (e.g. a singular end point) keep the best estimate
    if (depth <= 0 || Math.abs(left + right - whole) <= tolerance * 15 || Math.abs(b - a) < 1e-12) {
        return left + right;
    }
    return (
        adaptiveIntegral(f, a, middle, left, tolerance / 2, depth - 1) +
        adaptiveIntegral(f, middle, b, right, tolerance / 2, depth - 1)
    );
};

export const integrate = (f, a, b) => {
    if (a === b) return 0;
    const whole = gauss(f, a, b);
    const value = adaptiveIntegral(f, a, b, whole, 1e-10 * Math.max(1, Math.abs(whole)), 30);
    if (!Number.isFinite(value)) fail(ERRORS.range);
    return value;
};

export const differentiate = (f, x) => {
    const h = 1e-3 * Math.max(1, Math.abs(x));
    return (f(x - 2 * h) - 8 * f(x - h) + 8 * f(x + h) - f(x + 2 * h)) / (12 * h);
};

const series = (node, a, b, combine, start) => {
    const [from, to] = [evaluateArgument(a), evaluateArgument(b)];
    if (!Number.isInteger(from) || !Number.isInteger(to) || to < from) fail(ERRORS.invalid);
    if (to - from > MAX_TERMS) fail(ERRORS.tooManyTerms);
    const f = functionOfX(node);
    let total = start;
    for (let x = from; x <= to; x += 1) total = combine(total, f(x));
    return total;
};

const rawFunction = (fn) => Object.assign(fn, { rawArgs: true });

const conversions = Object.fromEntries(CONVERSIONS.map((conversion, index) => [`cv${index}`, conversion.convert]));
const constants = Object.fromEntries(CONSTANTS.map((constant, index) => [`cst${index}`, constant.value]));

math.import(
    {
        fsin: (x) => snap(Math.sin(toRadians(x))),
        fcos: (x) => snap(Math.cos(toRadians(x))),
        ftan: (x) => {
            if (snap(Math.cos(toRadians(x))) === 0) fail(ERRORS.undefined);
            return snap(Math.tan(toRadians(x)));
        },
        fasin: (x) => fromRadians(Math.asin(x)),
        facos: (x) => fromRadians(Math.acos(x)),
        fatan: (x) => fromRadians(Math.atan(x)),
        logab: (base, x) => Math.log(x) / Math.log(base),
        nroot: (n, x) => {
            if (x < 0 && Number.isInteger(n) && n % 2 !== 0) return -(Math.abs(x) ** (1 / n));
            return x ** (1 / n);
        },
        frac: (numerator, denominator) => numerator / denominator,
        ranint: (a, b) => {
            if (!Number.isInteger(a) || !Number.isInteger(b) || b < a) fail(ERRORS.invalid);
            return a + Math.floor(Math.random() * (b - a + 1));
        },
        ran: () => Math.floor(Math.random() * 1000) / 1000,
        dms: (degrees, minutes = 0, seconds = 0) => degrees + minutes / 60 + seconds / 3600,
        integ: rawFunction(([f, a, b]) => {
            if (!f || !a || !b) fail(ERROR.incomplete);
            return integrate(functionOfX(f), evaluateArgument(a), evaluateArgument(b));
        }),
        deriv: rawFunction(([f, x]) => {
            if (!f || !x) fail(ERROR.incomplete);
            return differentiate(functionOfX(f), evaluateArgument(x));
        }),
        sumx: rawFunction(([f, a, b]) => {
            if (!f || !a || !b) fail(ERROR.incomplete);
            return series(f, a, b, (total, term) => total + term, 0);
        }),
        prodx: rawFunction(([f, a, b]) => {
            if (!f || !a || !b) fail(ERROR.incomplete);
            return series(f, a, b, (total, term) => total * term, 1);
        }),
        ...conversions,
        ...constants,
    },
    { override: true }
);

// Values available to expressions: variables, Ans and PreAns.
export const buildScope = ({ variables = {}, memory = null, lastAnswer = null, preAnswer = null } = {}) => {
    const scope = { ans: lastAnswer ?? 0, preans: preAnswer ?? 0 };
    VARIABLES.forEach((name) => {
        scope[`var${name}`] = name === 'M' ? memory ?? 0 : variables[name] ?? 0;
    });
    return scope;
};

const describeFailure = (value, mathExpression) => {
    if (Number.isNaN(value)) return ERRORS.invalid;
    if (/\//.test(mathExpression)) return ERRORS.divideByZero;
    return ERRORS.range;
};

const withContext = (options, callback) => {
    const previous = { ...context };
    context.angleUnit = options.angleUnit ?? 'DEG';
    context.scope = options.scope ?? buildScope();
    try {
        return callback();
    } catch (error) {
        if (error instanceof CalculatorError) throw error;
        const syntax = error instanceof SyntaxError || /argument/i.test(error.message);
        throw new CalculatorError(syntax ? ERROR.syntax : ERRORS.invalid);
    } finally {
        Object.assign(context, previous);
    }
};

const toRealNumber = (value, mathExpression) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) fail(describeFailure(value, mathExpression));
    return value;
};

const endsIncomplete = (tokens) => {
    const last = tokens[tokens.length - 1];
    return !last || ['operator', 'infix', 'function', 'open', 'comma', 'equals'].includes(last.kind);
};

// Evaluates a display string in COMP mode and returns a finite number.
// options: { angleUnit, scope }
export const evaluateReal = (input, options = {}) => {
    const tokens = tokenize(input);
    if (endsIncomplete(tokens)) fail(ERROR.incomplete);
    if (tokens.some((token) => token.kind === 'equals')) fail(ERROR.syntax);
    const mathExpression = tokensToMath(prepareTokens(tokens));
    return withContext(options, () => toRealNumber(math.evaluate(mathExpression, { ...context.scope }), mathExpression));
};

// Finds X such that left = right (or expression = 0). Starts from `guess`.
export const solveForX = (input, options = {}, guess = 0) => {
    const tokens = tokenize(input);
    if (endsIncomplete(tokens)) fail(ERROR.incomplete);
    if (!tokens.some((token) => token.display === 'X')) fail(ERRORS.noSolution);
    const equalsAt = tokens.findIndex((token) => token.kind === 'equals');
    const sides =
        equalsAt === -1 ? [tokens] : [tokens.slice(0, equalsAt), tokens.slice(equalsAt + 1)];
    if (sides.some((side) => side.length === 0 || endsIncomplete(side))) fail(ERROR.incomplete);
    return withContext(options, () => {
        const [left, right] = sides.map((side) => math.compile(tokensToMath(prepareTokens(side))));
        const f = (x) => {
            const scope = { ...context.scope, varX: x };
            const value = left.evaluate(scope) - (right ? right.evaluate(scope) : 0);
            return typeof value === 'number' ? value : NaN;
        };
        const root = findRoot(f, guess);
        if (root === null) fail(ERRORS.noSolution);
        return root;
    });
};

const newton = (f, start) => {
    let x = start;
    for (let i = 0; i < 100; i += 1) {
        const y = f(x);
        if (!Number.isFinite(y)) return null;
        if (Math.abs(y) < 1e-14) return x;
        const h = 1e-6 * Math.max(1, Math.abs(x));
        const slope = (f(x + h) - f(x - h)) / (2 * h);
        if (!Number.isFinite(slope) || slope === 0) return null;
        const next = x - y / slope;
        if (Math.abs(next - x) <= 1e-13 * Math.max(1, Math.abs(x))) return next;
        x = next;
    }
    return null;
};

const bisect = (f, a, b) => {
    let [lo, hi, fLo] = [a, b, f(a)];
    for (let i = 0; i < 200; i += 1) {
        const mid = (lo + hi) / 2;
        const fMid = f(mid);
        if (fMid === 0 || hi - lo < 1e-15 * Math.max(1, Math.abs(mid))) return mid;
        if (Math.sign(fMid) === Math.sign(fLo)) [lo, fLo] = [mid, fMid];
        else hi = mid;
    }
    return (lo + hi) / 2;
};

const accept = (f, x) => x !== null && Number.isFinite(x) && Math.abs(f(x)) < 1e-9 * Math.max(1, Math.abs(x));

export const findRoot = (f, guess = 0) => {
    const fromGuess = newton(f, guess);
    if (accept(f, fromGuess)) return snap(fromGuess);

    // Scan outward on both sides of the guess for a sign change, then bisect
    const sides = [1, -1].map((direction) => ({ direction, x: guess, y: f(guess) }));
    for (let step = 0.1; step <= 1e6; step *= 1.5) {
        for (const side of sides) {
            const x = guess + side.direction * step;
            const y = f(x);
            if (Number.isFinite(y) && Number.isFinite(side.y) && Math.sign(y) !== Math.sign(side.y)) {
                const root = bisect(f, Math.min(x, side.x), Math.max(x, side.x));
                const refined = newton(f, root);
                if (accept(f, refined)) return snap(refined);
                if (accept(f, root)) return snap(root);
            }
            Object.assign(side, { x, y });
        }
    }
    return null;
};
