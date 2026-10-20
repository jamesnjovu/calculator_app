import { evaluateReal } from './engine';

// Converts typed ASCII into calculator symbols so fields accept expressions
// such as "1/3", "-2.5", "sqrt(2)" or "x^2+1".
export const fromAscii = (text) =>
    text
        .trim()
        .replace(/\s+/g, '')
        .replace(/sqrt\(/gi, '√(')
        .replace(/cbrt\(/gi, '∛(')
        .replace(/abs\(/gi, 'Abs(')
        .replace(/pi/gi, 'π')
        .replace(/\*\*/g, '^')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−')
        .replace(/x/g, 'X');

// Value of a field: NaN when empty or invalid.
export const parseCell = (text, options) => {
    if (text === undefined || text === null || String(text).trim() === '') return NaN;
    const direct = Number(text);
    if (Number.isFinite(direct)) return direct;
    try {
        return evaluateReal(fromAscii(String(text)), options);
    } catch {
        return NaN;
    }
};
