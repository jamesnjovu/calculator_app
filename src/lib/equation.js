import { MathError, solveLinearSystem } from './linearAlgebra';

// Equation mode: simultaneous linear equations and polynomial equations.
export { solveLinearSystem };

const tidy = (value) => (Math.abs(value) < 1e-12 ? 0 : value);
const root = (re, im = 0) => ({ re: tidy(re), im: tidy(im) });

// Polynomial value and derivative for complex x (Horner's method).
const evaluatePolynomial = (coefficients, x) => {
    let [re, im, dRe, dIm] = [0, 0, 0, 0];
    for (const c of coefficients) {
        [dRe, dIm] = [dRe * x.re - dIm * x.im + re, dRe * x.im + dIm * x.re + im];
        [re, im] = [re * x.re - im * x.im + c, re * x.im + im * x.re];
    }
    return { value: { re, im }, derivative: { re: dRe, im: dIm } };
};

const divideComplex = (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};

// Newton polishing of an approximate root
const polish = (coefficients, x) => {
    let current = x;
    for (let i = 0; i < 50; i += 1) {
        const { value, derivative } = evaluatePolynomial(coefficients, current);
        if (derivative.re === 0 && derivative.im === 0) break;
        const step = divideComplex(value, derivative);
        current = { re: current.re - step.re, im: current.im - step.im };
        if (Math.hypot(step.re, step.im) < 1e-15 * Math.max(1, Math.hypot(current.re, current.im))) break;
    }
    return current;
};

const quadraticRoots = (a, b, c) => {
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
        // Numerically stable form avoids cancellation
        const q = -0.5 * (b + Math.sign(b || 1) * Math.sqrt(discriminant));
        const roots = [q / a, q !== 0 ? c / q : 0].sort((x, y) => y - x);
        return roots.map((x) => root(x));
    }
    const re = -b / (2 * a);
    const im = Math.sqrt(-discriminant) / (2 * a);
    return [root(re, Math.abs(im)), root(re, -Math.abs(im))];
};

// Durand–Kerner iteration followed by Newton polishing
const cubicRoots = (coefficients) => {
    const [a] = coefficients;
    const monic = coefficients.map((c) => c / a);
    let roots = [0, 1, 2].map((k) => ({ re: Math.cos((2 * Math.PI * k) / 3 + 0.4) * 0.9, im: Math.sin((2 * Math.PI * k) / 3 + 0.4) * 0.9 }));
    for (let iteration = 0; iteration < 500; iteration += 1) {
        let change = 0;
        roots = roots.map((r, i) => {
            let denominator = { re: 1, im: 0 };
            roots.forEach((other, j) => {
                if (i === j) return;
                const diff = { re: r.re - other.re, im: r.im - other.im };
                denominator = { re: denominator.re * diff.re - denominator.im * diff.im, im: denominator.re * diff.im + denominator.im * diff.re };
            });
            const step = divideComplex(evaluatePolynomial(monic, r).value, denominator);
            change = Math.max(change, Math.hypot(step.re, step.im));
            return { re: r.re - step.re, im: r.im - step.im };
        });
        if (change < 1e-14) break;
    }
    const polished = roots.map((r) => polish(monic, r)).map((r) => (Math.abs(r.im) < 1e-9 * Math.max(1, Math.abs(r.re)) ? root(r.re) : root(r.re, r.im)));
    // Real roots first in descending order, then complex conjugates
    return polished.sort((x, y) => {
        const [xReal, yReal] = [x.im === 0, y.im === 0];
        if (xReal !== yReal) return xReal ? -1 : 1;
        return y.re - x.re || y.im - x.im;
    });
};

// coefficients from the highest degree: [a, b, c] or [a, b, c, d]
export const solvePolynomial = (coefficients) => {
    if (coefficients.some((c) => !Number.isFinite(c))) throw new MathError('Enter all coefficients');
    if (coefficients[0] === 0) throw new MathError('The leading coefficient must not be 0');
    if (coefficients.length === 3) return quadraticRoots(...coefficients);
    if (coefficients.length === 4) return cubicRoots(coefficients);
    throw new MathError('Unsupported degree');
};

// Minimum or maximum point of a quadratic
export const quadraticVertex = ([a, b, c]) => {
    const x = -b / (2 * a);
    return { x: tidy(x), y: tidy(c - (b * b) / (4 * a)), kind: a > 0 ? 'minimum' : 'maximum' };
};
