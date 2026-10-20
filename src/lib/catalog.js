import { CONSTANTS } from './constants';
import { CONVERSIONS } from './conversions';

// Everything that can be inserted from the catalog, grouped like the
// fx-991ES menus. `token` is inserted into the expression.
const entry = (category, token, label, description, options = {}) => ({ category, token, label, description, ...options });

export const FUNCTION_CATALOG = [
    entry('Trigonometry', 'sin(', 'sin', 'Sine'),
    entry('Trigonometry', 'cos(', 'cos', 'Cosine'),
    entry('Trigonometry', 'tan(', 'tan', 'Tangent'),
    entry('Trigonometry', 'sin⁻¹(', 'sin⁻¹', 'Inverse sine'),
    entry('Trigonometry', 'cos⁻¹(', 'cos⁻¹', 'Inverse cosine'),
    entry('Trigonometry', 'tan⁻¹(', 'tan⁻¹', 'Inverse tangent'),
    entry('Hyperbolic', 'sinh(', 'sinh', 'Hyperbolic sine'),
    entry('Hyperbolic', 'cosh(', 'cosh', 'Hyperbolic cosine'),
    entry('Hyperbolic', 'tanh(', 'tanh', 'Hyperbolic tangent'),
    entry('Hyperbolic', 'sinh⁻¹(', 'sinh⁻¹', 'Inverse hyperbolic sine'),
    entry('Hyperbolic', 'cosh⁻¹(', 'cosh⁻¹', 'Inverse hyperbolic cosine'),
    entry('Hyperbolic', 'tanh⁻¹(', 'tanh⁻¹', 'Inverse hyperbolic tangent'),
    entry('Powers and roots', '²', 'x²', 'Square'),
    entry('Powers and roots', '³', 'x³', 'Cube'),
    entry('Powers and roots', '^', 'xʸ', 'Power'),
    entry('Powers and roots', '⁻¹', 'x⁻¹', 'Reciprocal'),
    entry('Powers and roots', '√(', '√', 'Square root'),
    entry('Powers and roots', '∛(', '∛', 'Cube root'),
    entry('Powers and roots', 'ˣ√(', 'ˣ√(n, x)', 'Nth root of x'),
    entry('Powers and roots', '10^(', '10ˣ', 'Ten to the power', { operand: true }),
    entry('Powers and roots', 'e^(', 'eˣ', 'e to the power', { operand: true }),
    entry('Logarithms', 'log(', 'log', 'Logarithm base 10'),
    entry('Logarithms', 'ln(', 'ln', 'Natural logarithm'),
    entry('Logarithms', 'logₐ(', 'logₐ(a, b)', 'Logarithm of b to base a'),
    entry('Calculus', '∫(', '∫(f, a, b)', 'Definite integral of f(X) from a to b'),
    entry('Calculus', 'd/dx(', 'd/dx(f, a)', 'Derivative of f(X) at X = a'),
    entry('Calculus', 'Σ(', 'Σ(f, a, b)', 'Sum of f(X) for X = a to b'),
    entry('Calculus', 'Π(', 'Π(f, a, b)', 'Product of f(X) for X = a to b'),
    entry('Probability', '!', 'x!', 'Factorial'),
    entry('Probability', 'nPr', 'nPr', 'Permutations'),
    entry('Probability', 'nCr', 'nCr', 'Combinations'),
    entry('Probability', 'Ran#', 'Ran#', 'Random number from 0 to 0.999'),
    entry('Probability', 'RanInt(', 'RanInt(a, b)', 'Random integer from a to b'),
    entry('Numbers', 'Abs(', 'Abs', 'Absolute value'),
    entry('Numbers', 'frac(', 'a/b', 'Fraction template: frac(numerator, denominator)'),
    entry('Numbers', '%', '%', 'Percent'),
    entry('Numbers', 'Int(', 'Int', 'Integer part'),
    entry('Numbers', 'Intg(', 'Intg', 'Largest integer not greater than x'),
    entry('Numbers', 'GCD(', 'GCD(a, b)', 'Greatest common divisor'),
    entry('Numbers', 'LCM(', 'LCM(a, b)', 'Least common multiple'),
    entry('Numbers', '°', '°\'"', 'Degrees, minutes, seconds: 12°30°15°'),
    entry('Numbers', 'π', 'π', 'Pi'),
    entry('Numbers', 'e', 'e', "Euler's number"),
    entry('Numbers', 'Ans', 'Ans', 'Last answer'),
    entry('Numbers', 'PreAns', 'PreAns', 'Answer before the last one'),
    entry('Complex', 'i', 'i', 'Imaginary unit', { complexOnly: true }),
    entry('Complex', '∠', '∠', 'Polar form r∠θ', { complexOnly: true }),
    entry('Complex', 'arg(', 'arg', 'Argument', { complexOnly: true }),
    entry('Complex', 'Conjg(', 'Conjg', 'Complex conjugate', { complexOnly: true }),
    entry('Complex', 'ReP(', 'ReP', 'Real part', { complexOnly: true }),
    entry('Complex', 'ImP(', 'ImP', 'Imaginary part', { complexOnly: true }),
];

export const CONSTANT_CATALOG = CONSTANTS.map((constant) => ({
    category: 'Constants',
    token: constant.symbol,
    label: constant.symbol,
    description: constant.name,
    // Full precision, written as ×10^n like the rest of the app
    detail: `${String(constant.value).replace(/e\+?(-?)(\d+)/, (_, sign, exponent) => `×10^${sign ? '−' : ''}${exponent}`)}`,
    unit: constant.unit,
}));

export const CONVERSION_CATALOG = CONVERSIONS.map((conversion) => ({
    category: conversion.category,
    token: conversion.token,
    label: `${conversion.from} ▶ ${conversion.to}`,
    description: `Convert ${conversion.from} to ${conversion.to}`,
}));

export const searchCatalog = (items, query) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return items;
    return items.filter((item) => {
        const text = `${item.label} ${item.description} ${item.category}`.toLowerCase();
        return words.every((word) => text.includes(word));
    });
};
