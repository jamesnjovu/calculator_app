// Small dense matrix and vector helpers for the Matrix, Vector and Equation modes.

const EPSILON = 1e-12;

export class MathError extends Error {}

const fail = (message) => {
    throw new MathError(message);
};

const tidy = (value) => (Math.abs(value) < EPSILON ? 0 : value);

export const size = (matrix) => [matrix.length, matrix[0]?.length ?? 0];

const sameSize = (a, b) => {
    const [[ra, ca], [rb, cb]] = [size(a), size(b)];
    if (ra !== rb || ca !== cb) fail('Dimensions must match');
};

export const add = (a, b) => {
    sameSize(a, b);
    return a.map((row, i) => row.map((value, j) => value + b[i][j]));
};

export const subtract = (a, b) => {
    sameSize(a, b);
    return a.map((row, i) => row.map((value, j) => value - b[i][j]));
};

export const scale = (matrix, k) => matrix.map((row) => row.map((value) => value * k));

export const multiply = (a, b) => {
    const [[ra, ca], [rb, cb]] = [size(a), size(b)];
    if (ca !== rb) fail('Columns of the first must equal rows of the second');
    return Array.from({ length: ra }, (_, i) =>
        Array.from({ length: cb }, (_, j) => tidy(a[i].reduce((sum, value, k) => sum + value * b[k][j], 0)))
    );
};

export const transpose = (matrix) => matrix[0].map((_, j) => matrix.map((row) => row[j]));

const requireSquare = (matrix) => {
    const [rows, columns] = size(matrix);
    if (rows !== columns) fail('Matrix must be square');
    return rows;
};

export const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export const determinant = (matrix) => {
    const n = requireSquare(matrix);
    const m = matrix.map((row) => [...row]);
    let det = 1;
    for (let col = 0; col < n; col += 1) {
        let pivot = col;
        for (let row = col + 1; row < n; row += 1) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
        if (Math.abs(m[pivot][col]) < EPSILON) return 0;
        if (pivot !== col) {
            [m[pivot], m[col]] = [m[col], m[pivot]];
            det = -det;
        }
        det *= m[col][col];
        for (let row = col + 1; row < n; row += 1) {
            const factor = m[row][col] / m[col][col];
            for (let k = col; k < n; k += 1) m[row][k] -= factor * m[col][k];
        }
    }
    return tidy(det);
};

export const inverse = (matrix) => {
    const n = requireSquare(matrix);
    const m = matrix.map((row, i) => [...row, ...identity(n)[i]]);
    for (let col = 0; col < n; col += 1) {
        let pivot = col;
        for (let row = col + 1; row < n; row += 1) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
        if (Math.abs(m[pivot][col]) < EPSILON) fail('Matrix is not invertible');
        [m[pivot], m[col]] = [m[col], m[pivot]];
        const divisor = m[col][col];
        for (let k = 0; k < 2 * n; k += 1) m[col][k] /= divisor;
        for (let row = 0; row < n; row += 1) {
            if (row === col) continue;
            const factor = m[row][col];
            for (let k = 0; k < 2 * n; k += 1) m[row][k] -= factor * m[col][k];
        }
    }
    return m.map((row) => row.slice(n).map(tidy));
};

export const power = (matrix, exponent) => {
    const n = requireSquare(matrix);
    let result = identity(n);
    for (let i = 0; i < exponent; i += 1) result = multiply(result, matrix);
    return result;
};

// Solves A x = b. Reports whether a singular system has no or infinitely many solutions.
export const solveLinearSystem = (a, b) => {
    const n = a.length;
    const m = a.map((row, i) => [...row, b[i]]);
    let rank = 0;
    const pivotColumns = [];
    for (let col = 0; col < n && rank < n; col += 1) {
        let pivot = rank;
        for (let row = rank + 1; row < n; row += 1) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
        if (Math.abs(m[pivot][col]) < 1e-10) continue;
        [m[pivot], m[rank]] = [m[rank], m[pivot]];
        const divisor = m[rank][col];
        for (let k = col; k <= n; k += 1) m[rank][k] /= divisor;
        for (let row = 0; row < n; row += 1) {
            if (row === rank) continue;
            const factor = m[row][col];
            for (let k = col; k <= n; k += 1) m[row][k] -= factor * m[rank][k];
        }
        pivotColumns.push(col);
        rank += 1;
    }
    if (rank < n) {
        const inconsistent = m.slice(rank).some((row) => Math.abs(row[n]) > 1e-9);
        fail(inconsistent ? 'No solution' : 'Infinitely many solutions');
    }
    const solution = new Array(n);
    pivotColumns.forEach((col, row) => {
        solution[col] = tidy(m[row][n]);
    });
    return solution;
};

// Vectors (2D vectors are treated as 3D with z = 0 for the cross product)
export const dot = (a, b) => {
    if (a.length !== b.length) fail('Dimensions must match');
    return tidy(a.reduce((sum, value, i) => sum + value * b[i], 0));
};

export const cross = (a, b) => {
    if (a.length !== b.length) fail('Dimensions must match');
    const [x1, y1, z1 = 0] = a;
    const [x2, y2, z2 = 0] = b;
    return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2].map(tidy);
};

export const magnitude = (v) => Math.hypot(...v);

export const unitVector = (v) => {
    const length = magnitude(v);
    if (length === 0) fail('Zero vector has no direction');
    return v.map((value) => value / length);
};

// Angle between two vectors in radians
export const angleBetween = (a, b) => {
    const lengths = magnitude(a) * magnitude(b);
    if (lengths === 0) fail('Zero vector has no direction');
    return Math.acos(Math.min(1, Math.max(-1, dot(a, b) / lengths)));
};
