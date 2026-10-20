import { buildScope, evaluateReal } from './engine';
import { ERROR } from './tokens';
import { MathError } from './linearAlgebra';

export const MAX_TABLE_ROWS = 50;

// Table mode: values of f(X) (and optionally g(X)) from start to end in steps.
export const generateTable = ({ f, g, start, end, step }, { angleUnit = 'DEG', scope = buildScope() } = {}) => {
    if (![start, end, step].every(Number.isFinite)) throw new MathError('Enter start, end and step');
    if (step <= 0) throw new MathError('Step must be positive');
    if (end < start) throw new MathError('End must not be less than start');
    const count = Math.floor((end - start) / step + 1e-9) + 1;
    if (count > MAX_TABLE_ROWS) throw new MathError(`At most ${MAX_TABLE_ROWS} rows`);

    const valueAt = (expression, x) => {
        if (!expression) return null;
        try {
            return evaluateReal(expression, { angleUnit, scope: { ...scope, varX: x } });
        } catch (error) {
            // A broken expression fails the whole table; a bad point (e.g. 1/0) is just blank
            if ([ERROR.syntax, ERROR.incomplete].includes(error.message)) throw new MathError(error.message);
            return NaN;
        }
    };
    return Array.from({ length: count }, (_, i) => {
        const x = Number((start + i * step).toPrecision(12));
        return { x, f: valueAt(f, x), g: valueAt(g, x) };
    });
};
