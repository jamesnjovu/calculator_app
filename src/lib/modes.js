// Calculator modes, in the order of the fx-991ES MODE menu.
// `engine` is the reducer mode for modes that use the expression keypad.
export const MODES = [
    { id: 'BASIC', name: 'Basic', description: 'Everyday arithmetic', engine: 'COMP' },
    { id: 'COMP', name: 'Calculate', description: 'Scientific functions, calculus, SOLVE', engine: 'COMP' },
    { id: 'CMPLX', name: 'Complex', description: 'Complex numbers in a+bi or r∠θ form', engine: 'CMPLX' },
    { id: 'STAT', name: 'Statistics', description: 'One-variable stats and regressions' },
    { id: 'BASEN', name: 'Base-N', description: 'DEC, HEX, BIN, OCT arithmetic and logic' },
    { id: 'EQN', name: 'Equation', description: 'Simultaneous, quadratic and cubic equations' },
    { id: 'MATRIX', name: 'Matrix', description: 'Matrix arithmetic, determinant, inverse' },
    { id: 'TABLE', name: 'Table', description: 'Table of values for f(x) and g(x)' },
    { id: 'VECTOR', name: 'Vector', description: 'Dot and cross products, angles' },
];

export const modeById = (id) => MODES.find((mode) => mode.id === id) ?? MODES[1];
