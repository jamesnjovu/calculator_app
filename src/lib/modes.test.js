import { describe, expect, it } from 'vitest';
import { BASE_OPERATIONS, formatBase, parseBase } from './baseN';
import { quadraticVertex, solveLinearSystem, solvePolynomial } from './equation';
import { angleBetween, cross, determinant, dot, inverse, magnitude, multiply, transpose } from './linearAlgebra';
import { oneVariable, regression } from './statistics';
import { generateTable } from './table';

const close = (actual, expected, digits = 9) => {
    expect(actual.length).toBe(expected.length);
    actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], digits));
};

describe('equation mode', () => {
    it('solves simultaneous linear equations', () => {
        close(solveLinearSystem([[2, 3], [1, -1]], [8, -1]), [1, 2]);
        close(solveLinearSystem([[1, 1, 1], [0, 2, 5], [2, 5, -1]], [6, -4, 27]), [5, 3, -2]);
    });

    it('reports singular systems', () => {
        expect(() => solveLinearSystem([[1, 2], [2, 4]], [3, 6])).toThrow('Infinitely many solutions');
        expect(() => solveLinearSystem([[1, 2], [2, 4]], [3, 7])).toThrow('No solution');
    });

    it('solves quadratics with real and complex roots', () => {
        expect(solvePolynomial([1, -3, 2])).toEqual([{ re: 2, im: 0 }, { re: 1, im: 0 }]);
        const complexRoots = solvePolynomial([1, 2, 5]);
        expect(complexRoots[0].re).toBeCloseTo(-1);
        expect(Math.abs(complexRoots[0].im)).toBeCloseTo(2);
        expect(quadraticVertex([1, -2, 3])).toEqual({ x: 1, y: 2, kind: 'minimum' });
    });

    it('solves cubics', () => {
        const roots = solvePolynomial([1, -6, 11, -6]);
        close(roots.map((r) => r.re), [3, 2, 1]);
        roots.forEach((r) => expect(r.im).toBe(0));
        const mixed = solvePolynomial([1, 0, 0, -1]);
        expect(mixed[0]).toEqual({ re: 1, im: 0 });
        expect(mixed[1].re).toBeCloseTo(-0.5);
        expect(Math.abs(mixed[1].im)).toBeCloseTo(Math.sqrt(3) / 2);
    });

    it('rejects a zero leading coefficient', () => {
        expect(() => solvePolynomial([0, 1, 2])).toThrow();
    });
});

describe('matrix and vector modes', () => {
    it('multiplies, transposes and inverts matrices', () => {
        expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
        expect(transpose([[1, 2, 3]])).toEqual([[1], [2], [3]]);
        expect(determinant([[2, 0, 1], [1, 3, 2], [1, 1, 2]])).toBeCloseTo(6);
        expect(determinant([[2, 0, 1], [1, 3, 2], [1, 1, 1]])).toBe(0);
        const inv = inverse([[4, 7], [2, 6]]);
        close(inv.flat(), [0.6, -0.7, -0.2, 0.4]);
        expect(() => inverse([[1, 2], [2, 4]])).toThrow('not invertible');
        expect(() => multiply([[1, 2]], [[1, 2]])).toThrow();
    });

    it('computes vector products and angles', () => {
        expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
        expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
        expect(magnitude([3, 4])).toBe(5);
        expect(angleBetween([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2);
    });
});

describe('statistics mode', () => {
    it('summarises one variable with frequencies', () => {
        const stats = oneVariable([1, 2, 3, 4], [1, 1, 1, 1]);
        expect(stats).toMatchObject({ n: 4, mean: 2.5, sum: 10, sumSquares: 30, min: 1, q1: 1.5, median: 2.5, q3: 3.5, max: 4 });
        expect(stats.populationSD).toBeCloseTo(1.118033989);
        expect(stats.sampleSD).toBeCloseTo(1.290994449);
        expect(oneVariable([5, 7], [2, 1])).toMatchObject({ n: 3, median: 5 });
    });

    it('fits regression models', () => {
        const linear = regression('linear', [1, 2, 3, 4], [3, 5, 7, 9]);
        expect(linear.coefficients.a).toBeCloseTo(1);
        expect(linear.coefficients.b).toBeCloseTo(2);
        expect(linear.r).toBeCloseTo(1);
        const quadratic = regression('quadratic', [0, 1, 2, 3], [1, 2, 5, 10]);
        expect(quadratic.coefficients.c).toBeCloseTo(1);
        expect(quadratic.predict(4)).toBeCloseTo(17);
        const exponential = regression('exponential', [0, 1, 2], [2, 2 * Math.E, 2 * Math.E ** 2]);
        expect(exponential.coefficients.a).toBeCloseTo(2);
        expect(exponential.coefficients.b).toBeCloseTo(1);
        const power = regression('power', [1, 2, 4], [3, 12, 48]);
        expect(power.coefficients.b).toBeCloseTo(2);
        expect(() => regression('logarithmic', [0, 1], [1, 2])).toThrow();
    });
});

describe('base-n mode', () => {
    it('converts between bases with 32-bit two\'s complement', () => {
        expect(parseBase('FF', 'HEX')).toBe(255);
        expect(formatBase(255, 'BIN')).toBe('1111 1111');
        expect(formatBase(-1, 'HEX')).toBe('FFFFFFFF');
        expect(parseBase('FFFFFFFF', 'HEX')).toBe(-1);
        expect(formatBase(8, 'OCT')).toBe('10');
        expect(() => parseBase('12', 'BIN')).toThrow();
    });

    it('performs arithmetic and logical operations', () => {
        expect(BASE_OPERATIONS.and.apply(0b1100, 0b1010)).toBe(0b1000);
        expect(BASE_OPERATIONS.xor.apply(0b1100, 0b1010)).toBe(0b0110);
        expect(BASE_OPERATIONS.not.apply(0)).toBe(-1);
        expect(BASE_OPERATIONS.divide.apply(7, 2)).toBe(3);
        expect(() => BASE_OPERATIONS.multiply.apply(2 ** 30, 4)).toThrow('Out of range');
    });
});

describe('table mode', () => {
    it('tabulates f(X) and g(X)', () => {
        const rows = generateTable({ f: 'X²', g: '1÷X', start: 0, end: 1, step: 0.5 });
        expect(rows.map((row) => row.x)).toEqual([0, 0.5, 1]);
        expect(rows.map((row) => row.f)).toEqual([0, 0.25, 1]);
        expect(Number.isNaN(rows[0].g)).toBe(true);
        expect(() => generateTable({ f: 'X+', start: 0, end: 1, step: 1 })).toThrow();
        expect(() => generateTable({ f: 'X', start: 0, end: 100, step: 1 })).toThrow('At most');
    });
});
