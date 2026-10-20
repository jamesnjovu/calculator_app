import { MathError, solveLinearSystem } from './linearAlgebra';

// Statistics mode: single-variable summaries and two-variable regressions.

const sum = (values) => values.reduce((total, value) => total + value, 0);

// Expands values by their (integer) frequencies
const expand = (values, frequencies) =>
    values.flatMap((value, i) => {
        const count = frequencies ? frequencies[i] : 1;
        if (!Number.isInteger(count) || count < 0) throw new MathError('Frequencies must be whole numbers');
        return Array(count).fill(value);
    });

const median = (sorted) => {
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const oneVariable = (values, frequencies) => {
    const data = expand(values, frequencies);
    const n = data.length;
    if (n === 0) throw new MathError('Enter at least one value');
    const sorted = [...data].sort((a, b) => a - b);
    const mean = sum(data) / n;
    const squaredDeviations = sum(data.map((x) => (x - mean) ** 2));
    // Quartiles are the medians of the lower and upper halves, excluding the median itself
    const half = Math.floor(n / 2);
    const lower = sorted.slice(0, half);
    const upper = sorted.slice(n % 2 ? half + 1 : half);
    return {
        n,
        mean,
        sum: sum(data),
        sumSquares: sum(data.map((x) => x * x)),
        populationSD: Math.sqrt(squaredDeviations / n),
        sampleSD: n > 1 ? Math.sqrt(squaredDeviations / (n - 1)) : NaN,
        min: sorted[0],
        q1: n > 1 ? median(lower) : sorted[0],
        median: median(sorted),
        q3: n > 1 ? median(upper) : sorted[0],
        max: sorted[n - 1],
    };
};

const linearFit = (xs, ys) => {
    const n = xs.length;
    const [mx, my] = [sum(xs) / n, sum(ys) / n];
    const sxx = sum(xs.map((x) => (x - mx) ** 2));
    const syy = sum(ys.map((y) => (y - my) ** 2));
    const sxy = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
    if (sxx === 0) throw new MathError('x values must not all be equal');
    const b = sxy / sxx;
    return { a: my - b * mx, b, r: syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy) };
};

const requirePositive = (values, label) => {
    if (values.some((v) => v <= 0)) throw new MathError(`${label} values must be positive for this model`);
};

// Regression models in the order of the fx-991ES. Each fit returns its
// coefficients, the correlation coefficient r where defined and predict(x).
export const REGRESSIONS = {
    linear: {
        label: 'y = a + bx',
        fit: (xs, ys) => {
            const { a, b, r } = linearFit(xs, ys);
            return { coefficients: { a, b }, r, predict: (x) => a + b * x };
        },
    },
    quadratic: {
        label: 'y = a + bx + cx²',
        fit: (xs, ys) => {
            if (new Set(xs).size < 3) throw new MathError('Need at least 3 different x values');
            const powers = [0, 1, 2, 3, 4].map((p) => sum(xs.map((x) => x ** p)));
            const rhs = [0, 1, 2].map((p) => sum(xs.map((x, i) => x ** p * ys[i])));
            const [a, b, c] = solveLinearSystem(
                [0, 1, 2].map((row) => [0, 1, 2].map((col) => powers[row + col])),
                rhs
            );
            return { coefficients: { a, b, c }, r: null, predict: (x) => a + b * x + c * x * x };
        },
    },
    logarithmic: {
        label: 'y = a + b·ln x',
        fit: (xs, ys) => {
            requirePositive(xs, 'x');
            const { a, b, r } = linearFit(xs.map(Math.log), ys);
            return { coefficients: { a, b }, r, predict: (x) => a + b * Math.log(x) };
        },
    },
    exponential: {
        label: 'y = a·e^(bx)',
        fit: (xs, ys) => {
            requirePositive(ys, 'y');
            const fit = linearFit(xs, ys.map(Math.log));
            const [a, b] = [Math.exp(fit.a), fit.b];
            return { coefficients: { a, b }, r: fit.r, predict: (x) => a * Math.exp(b * x) };
        },
    },
    abExponential: {
        label: 'y = a·b^x',
        fit: (xs, ys) => {
            requirePositive(ys, 'y');
            const fit = linearFit(xs, ys.map(Math.log));
            const [a, b] = [Math.exp(fit.a), Math.exp(fit.b)];
            return { coefficients: { a, b }, r: fit.r, predict: (x) => a * b ** x };
        },
    },
    power: {
        label: 'y = a·x^b',
        fit: (xs, ys) => {
            requirePositive(xs, 'x');
            requirePositive(ys, 'y');
            const fit = linearFit(xs.map(Math.log), ys.map(Math.log));
            const [a, b] = [Math.exp(fit.a), fit.b];
            return { coefficients: { a, b }, r: fit.r, predict: (x) => a * x ** b };
        },
    },
    inverse: {
        label: 'y = a + b/x',
        fit: (xs, ys) => {
            if (xs.includes(0)) throw new MathError('x values must not be 0 for this model');
            const { a, b, r } = linearFit(xs.map((x) => 1 / x), ys);
            return { coefficients: { a, b }, r, predict: (x) => a + b / x };
        },
    },
};

export const twoVariable = (xs, ys, frequencies) => {
    const x = expand(xs, frequencies);
    const y = expand(ys, frequencies);
    if (x.length < 2) throw new MathError('Enter at least two points');
    const summary = (values) => oneVariable(values);
    return {
        n: x.length,
        x: summary(x),
        y: summary(y),
        sumXY: sum(x.map((value, i) => value * y[i])),
        points: { xs: x, ys: y },
    };
};

export const regression = (model, xs, ys, frequencies) => {
    const { points } = twoVariable(xs, ys, frequencies);
    return REGRESSIONS[model].fit(points.xs, points.ys);
};
