import { format } from 'mathjs/number';

// Results show 10 significant digits, like the fx-991ES.
const SIGNIFICANT_DIGITS = 10;

const minus = (text) => text.replace(/-/g, '−');

const trimZeros = (mantissa) => (mantissa.includes('.') ? mantissa.replace(/\.?0+$/, '') : mantissa);

const scientific = (value, digits) => {
    const [mantissa, exponent] = value.toExponential(digits - 1).split('e');
    return minus(`${trimZeros(mantissa)}×10^${Number(exponent)}`);
};

const engineering = (value) => {
    if (value === 0) return '0';
    const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
    let mantissa = Number((value / 10 ** exponent).toPrecision(SIGNIFICANT_DIGITS));
    // Rounding can push the mantissa to 1000
    if (Math.abs(mantissa) >= 1000) return engineering(mantissa * 10 ** exponent);
    mantissa = format(mantissa, { notation: 'fixed' });
    return minus(exponent === 0 ? trimZeros(mantissa) : `${trimZeros(mantissa)}×10^${exponent}`);
};

const normal = (value) => {
    const rounded = Number(value.toPrecision(SIGNIFICANT_DIGITS));
    const magnitude = Math.abs(rounded);
    if (rounded === 0) return '0';
    if (magnitude >= 1e10 || magnitude < 1e-9) return scientific(rounded, SIGNIFICANT_DIGITS);
    return minus(trimZeros(format(rounded, { notation: 'fixed' })));
};

// numberFormat: { type: 'norm' | 'fix' | 'sci' | 'eng', digits }
export const formatDecimal = (value, numberFormat = { type: 'norm' }) => {
    if (Object.is(value, -0)) value = 0;
    switch (numberFormat.type) {
        case 'fix':
            return Math.abs(value) >= 1e10 ? scientific(value, SIGNIFICANT_DIGITS) : minus(value.toFixed(numberFormat.digits));
        case 'sci':
            return scientific(value, numberFormat.digits || SIGNIFICANT_DIGITS);
        case 'eng':
            return engineering(value);
        default:
            return normal(value);
    }
};

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

// Best rational approximation with a bounded denominator (continued fractions).
export const toRational = (value, maxDenominator) => {
    const sign = value < 0 ? -1 : 1;
    let x = Math.abs(value);
    let [h0, h1, k0, k1] = [0, 1, 1, 0];
    for (let i = 0; i < 64; i += 1) {
        const a = Math.floor(x);
        const [h2, k2] = [a * h1 + h0, a * k1 + k0];
        if (k2 > maxDenominator) break;
        [h0, h1, k0, k1] = [h1, h2, k1, k2];
        if (Math.abs(sign * (h1 / k1) - value) <= 1e-12 * Math.max(1, Math.abs(value))) {
            return { num: sign * h1, den: k1 };
        }
        const fraction = x - a;
        if (fraction < 1e-15) break;
        x = 1 / fraction;
    }
    return null;
};

const squareFree = (n) => {
    let coefficient = 1;
    let radicand = n;
    for (let f = 2; f * f <= radicand; f += 1) {
        while (radicand % (f * f) === 0) {
            radicand /= f * f;
            coefficient *= f;
        }
    }
    return { coefficient, radicand };
};

// Finds an exact form for a value: a fraction, a surd (a√b/c) or a multiple of π.
// Returns null when the value is an integer or has no simple exact form.
export const exactForm = (value) => {
    if (!Number.isFinite(value) || Number.isInteger(value) || Math.abs(value) >= 1e10) return null;
    const sign = value < 0 ? -1 : 1;

    const fraction = toRational(value, 10000);
    if (fraction && Math.abs(fraction.num) < 1e10) {
        return { kind: 'fraction', sign, num: Math.abs(fraction.num), den: fraction.den };
    }

    const square = toRational(value * value, 1000);
    if (square && square.num > 0 && square.num * square.den < 1e8) {
        const { coefficient, radicand } = squareFree(square.num * square.den);
        if (radicand > 1) {
            const divisor = gcd(coefficient, square.den);
            return { kind: 'surd', sign, coef: coefficient / divisor, radicand, den: square.den / divisor };
        }
    }

    const piMultiple = toRational(value / Math.PI, 1000);
    if (piMultiple && Math.abs(piMultiple.num) <= 10000) {
        return { kind: 'pi', sign, num: Math.abs(piMultiple.num), den: piMultiple.den };
    }
    return null;
};

// Plain text for an exact form, used for history and copying.
export const exactToText = (exact) => {
    const sign = exact.sign < 0 ? '−' : '';
    const over = (top, den) => (den === 1 ? top : `${top}/${den}`);
    switch (exact.kind) {
        case 'fraction':
            return `${sign}${over(exact.num, exact.den)}`;
        case 'surd':
            return `${sign}${over(`${exact.coef === 1 ? '' : exact.coef}√${exact.radicand}`, exact.den)}`;
        case 'pi':
            return `${sign}${over(`${exact.num === 1 ? '' : exact.num}π`, exact.den)}`;
        default:
            return '';
    }
};

// Degrees, minutes and seconds: 12.5 -> 12°30'0"
export const formatDms = (value) => {
    const sign = value < 0 ? '−' : '';
    let totalSeconds = Math.round(Math.abs(value) * 3600 * 100) / 100;
    const degrees = Math.floor(totalSeconds / 3600);
    totalSeconds -= degrees * 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round((totalSeconds - minutes * 60) * 100) / 100;
    return `${sign}${degrees}°${minutes}'${seconds}"`;
};
