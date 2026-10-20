// Base-N mode: 32-bit two's complement integers, as on the fx-991ES.

export const BASES = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };

export const formatBase = (value, base) => {
    if (base === 'DEC') return String(value).replace('-', '−');
    const text = (value >>> 0).toString(BASES[base]).toUpperCase();
    return base === 'BIN' ? text.padStart(Math.ceil(text.length / 4) * 4, '0').replace(/(.{4})(?=.)/g, '$1 ') : text;
};
