import { MathError } from './linearAlgebra';

// Base-N mode: 32-bit two's complement integers, as on the fx-991ES.

export const BASES = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };

const MIN = -(2 ** 31);
const MAX = 2 ** 31 - 1;

const toSigned = (value) => value | 0;

export const parseBase = (text, base) => {
    const clean = text.trim().toUpperCase();
    if (!clean) throw new MathError('Enter a value');
    if (base === 'DEC') {
        if (!/^[−-]?\d+$/.test(clean)) throw new MathError('Enter a whole decimal number');
        const value = Number(clean.replace('−', '-'));
        if (value < MIN || value > MAX) throw new MathError('Out of range');
        return value;
    }
    const digits = { HEX: /^[0-9A-F]+$/, BIN: /^[01]+$/, OCT: /^[0-7]+$/ }[base];
    if (!digits.test(clean)) throw new MathError(`Invalid ${base} digits`);
    const value = parseInt(clean, BASES[base]);
    if (value > 0xffffffff) throw new MathError('Out of range');
    return toSigned(value);
};

export const formatBase = (value, base) => {
    if (base === 'DEC') return String(value).replace('-', '−');
    const text = (value >>> 0).toString(BASES[base]).toUpperCase();
    return base === 'BIN' ? text.padStart(Math.ceil(text.length / 4) * 4, '0').replace(/(.{4})(?=.)/g, '$1 ') : text;
};

const checked = (value) => {
    if (!Number.isFinite(value) || value < MIN || value > MAX) throw new MathError('Out of range');
    return value;
};

export const BASE_OPERATIONS = {
    add: { label: '+', apply: (a, b) => checked(a + b) },
    subtract: { label: '−', apply: (a, b) => checked(a - b) },
    multiply: { label: '×', apply: (a, b) => checked(a * b) },
    divide: {
        label: '÷',
        apply: (a, b) => {
            if (b === 0) throw new MathError("Can't divide by zero");
            return checked(Math.trunc(a / b));
        },
    },
    and: { label: 'and', apply: (a, b) => toSigned(a & b) },
    or: { label: 'or', apply: (a, b) => toSigned(a | b) },
    xor: { label: 'xor', apply: (a, b) => toSigned(a ^ b) },
    xnor: { label: 'xnor', apply: (a, b) => toSigned(~(a ^ b)) },
    not: { label: 'Not', unary: true, apply: (a) => toSigned(~a) },
    neg: { label: 'Neg', unary: true, apply: (a) => checked(-a) },
};
