import { describe, expect, it } from 'vitest';
import { calculatorReducer, describeResult, initialState, previewResult } from './calculator';
import { evaluateReal } from './engine';
import { exactForm, exactToText, formatDecimal, formatDms } from './numberFormat';
import { toMathExpression } from './tokens';

// Applies a sequence of button presses. Strings are shorthand for common keys;
// anything else that looks like a token is inserted as-is.
const press = (keys, state = initialState) =>
    keys.reduce((current, key) => {
        if (typeof key === 'object') return calculatorReducer(current, key);
        if (/^\d$/.test(key)) return calculatorReducer(current, { type: 'digit', value: key });
        const named = {
            '.': { type: 'decimal' },
            '=': { type: 'evaluate' },
            EQ: { type: 'insert', value: '=' },
            C: { type: 'clear' },
            '⌫': { type: 'backspace' },
            '±': { type: 'toggleSign' },
            'x²': { type: 'square' },
            '1/x': { type: 'reciprocal' },
            Ans: { type: 'answer' },
            SOLVE: { type: 'solve' },
            'S⇔D': { type: 'toggleView', value: 'sd' },
            ENG: { type: 'toggleView', value: 'eng' },
            sin: { type: 'function', value: 'sin' },
            cos: { type: 'function', value: 'cos' },
            tan: { type: 'function', value: 'tan' },
            log: { type: 'function', value: 'log' },
            ln: { type: 'function', value: 'ln' },
            sqrt: { type: 'function', value: 'sqrt' },
            abs: { type: 'function', value: 'abs' },
        };
        if (named[key]) return calculatorReducer(current, named[key]);
        return calculatorReducer(current, { type: 'insert', value: key });
    }, state);

const shown = (state) => describeResult(state.result, state.settings).text;
const withSettings = (settings, mode = 'COMP') => ({ ...initialState, mode, settings: { ...initialState.settings, ...settings } });

describe('expression translation', () => {
    it('maps display symbols to math.js syntax', () => {
        expect(toMathExpression('2×π−√(4)÷e²')).toBe('2*pi-sqrt(4)/e^2');
        expect(toMathExpression('log(100)+ln(e)')).toBe('log10(100)+log(e)');
        expect(toMathExpression('1.5×10^−7')).toBe('1.5*10^-7');
        expect(toMathExpression('sin⁻¹(1')).toBe('fasin(1)');
    });

    it('rewrites nPr, nCr and degrees-minutes-seconds', () => {
        expect(toMathExpression('5nPr2')).toBe('permutations(5,2)');
        expect(toMathExpression('(2+3)nCr2!')).toBe('combinations((2+3),2!)');
        expect(toMathExpression('12°30°')).toBe('dms(12,30)');
    });
});

describe('number formatting', () => {
    it('shows 10 significant digits and hides floating point noise', () => {
        expect(formatDecimal(0.1 + 0.2)).toBe('0.3');
        expect(formatDecimal(-0)).toBe('0');
        expect(formatDecimal(-5)).toBe('−5');
        expect(formatDecimal(Math.PI)).toBe('3.141592654');
        expect(formatDecimal(1.5e20)).toBe('1.5×10^20');
        expect(formatDecimal(1.23e-12)).toBe('1.23×10^−12');
    });

    it('supports Fix, Sci and Eng formats', () => {
        expect(formatDecimal(2 / 3, { type: 'fix', digits: 3 })).toBe('0.667');
        expect(formatDecimal(12345, { type: 'sci', digits: 3 })).toBe('1.23×10^4');
        expect(formatDecimal(12345, { type: 'eng' })).toBe('12.345×10^3');
        expect(formatDecimal(0.00042, { type: 'eng' })).toBe('420×10^−6');
    });

    it('finds fractions, surds and multiples of π', () => {
        expect(exactToText(exactForm(0.75))).toBe('3/4');
        expect(exactToText(exactForm(-1 / 3))).toBe('−1/3');
        expect(exactToText(exactForm(Math.sqrt(3) / 2))).toBe('√3/2');
        expect(exactToText(exactForm(2 * Math.sqrt(2)))).toBe('2√2');
        expect(exactToText(exactForm(Math.PI / 3))).toBe('π/3');
        expect(exactToText(exactForm((2 * Math.PI) / 3))).toBe('2π/3');
        expect(exactForm(5)).toBeNull();
        expect(exactForm(Math.E)).toBeNull();
    });

    it('formats degrees, minutes and seconds', () => {
        expect(formatDms(12.5)).toBe('12°30\'0"');
        expect(formatDms(-1.2575)).toBe('−1°15\'27"');
    });
});

describe('evaluation', () => {
    it('evaluates arithmetic with precedence and shows exact results', () => {
        expect(shown(press(['2', '+', '3', '×', '4', '=']))).toBe('14');
        expect(shown(press(['1', '0', '÷', '4', '=']))).toBe('5/2');
        expect(shown(press(['2', '^', '1', '0', '=']))).toBe('1024');
        expect(shown(press(['0', '.', '1', '+', '0', '.', '2', '=']))).toBe('0.3');
    });

    it('toggles between exact and decimal results', () => {
        const third = press(['1', '÷', '3', '=']);
        expect(shown(third)).toBe('1/3');
        expect(shown(press(['S⇔D'], third))).toBe('0.3333333333');
        expect(shown(press(['S⇔D', 'S⇔D'], third))).toBe('1/3');
        expect(shown(press(['sin', '6', '0', '=']))).toBe('√3/2');
        expect(shown(press(['π', '÷', '3', '=']))).toBe('π/3');
    });

    it('shows engineering and DMS views of a result', () => {
        expect(shown(press(['1', '2', '3', '4', '5', '=', 'ENG']))).toBe('12.345×10^3');
        expect(shown(press(['1', '2', '.', '5', '=', '°']))).toBe('12°30\'0"');
    });

    it('auto-closes parentheses', () => {
        const state = press(['(', '2', '+', '3', '×', '2', '=']);
        expect(state.input).toBe('(2+3×2)');
        expect(shown(state)).toBe('8');
    });

    it('supports degrees, radians and gradians', () => {
        expect(shown(press(['sin', '3', '0', '=']))).toBe('1/2');
        expect(shown(press(['sin', '1', '8', '0', '=']))).toBe('0');
        expect(shown(press(['cos', '9', '0', '=']))).toBe('0');
        expect(shown(press(['sin', 'π', '='], withSettings({ angleUnit: 'RAD' })))).toBe('0');
        expect(shown(press(['sin', '1', '0', '0', '='], withSettings({ angleUnit: 'GRAD' })))).toBe('1');
        expect(shown(press(['sin⁻¹(', '1', '=']))).toBe('90');
        expect(shown(press(['tan⁻¹(', '1', '='], withSettings({ angleUnit: 'RAD' })))).toBe('π/4');
    });

    it('reports undefined results with clear messages', () => {
        expect(press(['tan', '9', '0', '=']).error).toBe('Undefined');
        expect(press(['1', '÷', '0', '=']).error).toBe("Can't divide by zero");
        expect(press(['sqrt', '−', '1', '=']).error).toBe('Invalid input');
        expect(press(['log', '0', '=']).error).toBe('Out of range');
        expect(press(['1', '0', '^', '4', '0', '0', '=']).error).toBe('Out of range');
        expect(press(['2', '+', '=']).error).toBe('Incomplete expression');
    });

    it('ignores equals on an empty expression', () => {
        expect(press(['='])).toEqual(initialState);
    });

    it('evaluates scientific functions on the whole expression', () => {
        expect(shown(press(['sqrt', '1', '6', '+', '9', ')', '=']))).toBe('5');
        expect(shown(press(['log', '1', '0', '0', '0', '=']))).toBe('3');
        expect(shown(press(['ln', 'e', '=']))).toBe('1');
        expect(shown(press(['abs', '−', '7', '=']))).toBe('7');
    });

    it('supports the extended function set', () => {
        const value = (input) => evaluateReal(input);
        expect(value('logₐ(2,8)')).toBeCloseTo(3);
        expect(value('ˣ√(3,−8)')).toBeCloseTo(-2);
        expect(value('∛(27)')).toBeCloseTo(3);
        expect(value('2³')).toBe(8);
        expect(value('5nPr2')).toBe(20);
        expect(value('5nCr2')).toBe(10);
        expect(value('GCD(12,18)')).toBe(6);
        expect(value('LCM(4,6)')).toBe(12);
        expect(value('Int(−2.5)')).toBe(-2);
        expect(value('Intg(−2.5)')).toBe(-3);
        expect(value('200×10%')).toBe(20);
        expect(value('sinh⁻¹(sinh(1))')).toBeCloseTo(1);
        expect(value('12°30°36°')).toBeCloseTo(12.51);
        expect(value('frac(3,4)')).toBe(0.75);
        expect(value('in▶cm(1)')).toBeCloseTo(2.54);
        expect(value('°F▶°C(212)')).toBeCloseTo(100);
        expect(value('c₀')).toBe(299792458);
        const random = value('RanInt(1,6)');
        expect(random).toBeGreaterThanOrEqual(1);
        expect(random).toBeLessThanOrEqual(6);
    });

    it('integrates, differentiates and sums', () => {
        expect(evaluateReal('∫(X²,0,3)')).toBeCloseTo(9, 9);
        expect(evaluateReal('∫(1÷√(X),0,1)')).toBeCloseTo(2, 3);
        expect(evaluateReal('d/dx(X³,2)')).toBeCloseTo(12, 8);
        expect(evaluateReal('d/dx(sin(X),0)', { angleUnit: 'RAD' })).toBeCloseTo(1, 8);
        expect(evaluateReal('Σ(X,1,100)')).toBe(5050);
        expect(evaluateReal('Π(X,1,5)')).toBe(120);
    });
});

describe('solve', () => {
    it('solves equations for X and stores the result', () => {
        const state = press(['X', 'x²', 'EQ', '2', 'SOLVE']);
        expect(state.result.label).toBe('X');
        expect(state.result.value).toBeCloseTo(Math.SQRT2, 10);
        expect(state.variables.X).toBeCloseTo(Math.SQRT2, 10);
    });

    it('solves an expression equal to zero, also via equals', () => {
        expect(press(['X', '−', 'cos(', 'X', 'SOLVE'], withSettings({ angleUnit: 'RAD' })).result.value).toBeCloseTo(0.7390851332, 9);
        expect(press(['2', 'X', '+', '6', 'EQ', '0', '=']).result.value).toBeCloseTo(-3, 10);
    });

    it('reports equations without a solution', () => {
        expect(press(['X', 'x²', '+', '1', 'SOLVE']).error).toBe("Can't solve");
        expect(press(['2', '+', '1', 'SOLVE']).error).toBe("Can't solve");
    });
});

describe('input handling', () => {
    it('replaces leading zeros', () => {
        expect(press(['0', '0', '7']).input).toBe('7');
        expect(press(['5', '+', '0', '3']).input).toBe('5+3');
    });

    it('allows one decimal point per number', () => {
        expect(press(['1', '.', '5', '+', '2', '.', '5']).input).toBe('1.5+2.5');
        expect(press(['1', '.', '.', '5']).input).toBe('1.5');
        expect(press(['.', '5']).input).toBe('0.5');
    });

    it('replaces consecutive operators but allows negative operands', () => {
        expect(press(['5', '+', '×', '2']).input).toBe('5×2');
        expect(shown(press(['5', '×', '−', '2', '=']))).toBe('−10');
        expect(press(['5', '×', '−', '+']).input).toBe('5+');
        expect(shown(press(['−', '3', '=']))).toBe('−3');
    });

    it('inserts implicit multiplication', () => {
        expect(press(['2', 'π']).input).toBe('2×π');
        expect(press(['2', '(', '3', ')', '4']).input).toBe('2×(3)×4');
        expect(press(['2', 'sin']).input).toBe('2×sin(');
        expect(press(['2', 'X']).input).toBe('2×X');
    });

    it('only closes open parentheses and adds commas after an operand', () => {
        expect(press([')']).input).toBe('');
        expect(press(['(', '2', '+', ')']).input).toBe('(2+');
        expect(press([',']).input).toBe('');
        expect(press(['GCD(', '4', ',', '6']).input).toBe('GCD(4,6');
    });

    it('removes whole tokens on backspace', () => {
        expect(press(['2', '+', 'sin', '⌫']).input).toBe('2+');
        expect(press(['1', '2', '⌫']).input).toBe('1');
        expect(press(['2', 'nPr', '⌫']).input).toBe('2');
    });

    it('continues from a result with Ans and starts fresh with a digit', () => {
        const evaluated = press(['2', '+', '3', '=']);
        const continued = press(['×', '2'], evaluated);
        expect(continued.input).toBe('Ans×2');
        expect(shown(press(['='], continued))).toBe('10');
        expect(press(['7'], evaluated).input).toBe('7');
    });

    it('applies postfix operators to the current value', () => {
        expect(shown(press(['3', 'x²', '=']))).toBe('9');
        expect(shown(press(['4', '1/x', '=']))).toBe('1/4');
        expect(shown(press(['−', '3', '=', 'x²', '=']))).toBe('9');
        expect(shown(press(['5', '!', '=']))).toBe('120');
    });

    it('toggles the sign of the trailing number', () => {
        expect(press(['5', '±']).input).toBe('−5');
        expect(press(['5', '±', '±']).input).toBe('5');
        expect(shown(press(['5', '−', '3', '±', '=']))).toBe('8');
    });

    it('inserts the previous answers', () => {
        const evaluated = press(['−', '4', '=', 'C', '1', '0', '=']);
        expect(shown(press(['C', '2', '×', 'Ans', '='], evaluated))).toBe('20');
        expect(shown(press(['C', 'PreAns', '='], evaluated))).toBe('−4');
    });

    it('returns to editing after an error', () => {
        const errored = press(['1', '÷', '0', '=']);
        expect(press(['7'], errored)).toMatchObject({ input: '7', error: null });
        expect(press(['⌫'], errored)).toMatchObject({ input: '1÷0', error: null });
    });

    it('inserts powers of ten', () => {
        expect(press(['5', { type: 'insertOperand', value: '10^(' }]).input).toBe('5×10^(');
        expect(press(['3', { type: 'exponent' }, '4']).input).toBe('3×10^4');
        expect(press([{ type: 'exponent' }, '4']).input).toBe('10^4');
        expect(shown(press(['3', { type: 'exponent' }, '−', '2', '=']))).toBe('3/100');
    });

    it('ignores complex-only keys outside complex mode', () => {
        expect(press(['i']).input).toBe('');
    });
});

describe('memory and variables', () => {
    it('stores, adds, subtracts and recalls memory', () => {
        let state = press(['5', { type: 'memoryStore' }]);
        expect(state.memory).toBe(5);
        state = press(['C', '3', { type: 'memoryAdd' }], state);
        expect(state.memory).toBe(8);
        state = press(['C', '1', { type: 'memorySubtract' }], state);
        expect(state.memory).toBe(7);
        state = press(['C', '2', '×', { type: 'memoryRecall' }, '='], state);
        expect(shown(state)).toBe('14');
        expect(press([{ type: 'memoryClear' }], state).memory).toBeNull();
    });

    it('ignores memory operations on invalid input', () => {
        expect(press([{ type: 'memoryStore' }]).memory).toBeNull();
        expect(press(['2', '+', { type: 'memoryAdd' }]).memory).toBeNull();
        expect(press([{ type: 'memoryRecall' }])).toEqual(initialState);
    });

    it('stores results in variables and uses them in expressions', () => {
        let state = press(['6', '=', { type: 'store', value: 'A' }]);
        expect(state.variables.A).toBe(6);
        state = press(['A', '×', '7', '='], state);
        expect(shown(state)).toBe('42');
        expect(press([{ type: 'clearVariables' }], state).variables.A).toBe(0);
    });
});

describe('complex mode', () => {
    const complexState = withSettings({}, 'CMPLX');

    it('evaluates complex arithmetic', () => {
        expect(shown(press(['(', '3', '+', '4', 'i', ')', '×', '(', '1', '−', 'i', '='], complexState))).toBe('7+i');
        expect(shown(press(['sqrt', '−', '4', '='], complexState))).toBe('2i');
        expect(shown(press(['Abs(', '3', '+', '4', 'i', '='], complexState))).toBe('5');
        expect(shown(press(['i', '^', '2', '='], complexState))).toBe('−1');
    });

    it('converts between rectangular and polar forms', () => {
        const state = press(['1', '+', 'i', '='], complexState);
        expect(shown(press([{ type: 'toggleView', value: 'polar' }], state))).toBe('1.414213562∠45');
        expect(shown(press(['2', '∠', '9', '0', '='], complexState))).toBe('2i');
    });
});

describe('history', () => {
    it('records newest calculations first and can be cleared', () => {
        let state = press(['1', '+', '1', '=', 'C', '2', '×', '3', '=']);
        expect(state.history.map((item) => item.result)).toEqual(['6', '2']);
        state = calculatorReducer(state, { type: 'recall', value: 2 });
        expect(state.input).toBe('2');
        expect(calculatorReducer(state, { type: 'clearHistory' }).history).toEqual([]);
    });
});

describe('preview', () => {
    it('shows a live result while typing', () => {
        expect(previewResult(press(['2', '+', '3']))).toBe('5');
        expect(previewResult(press(['2', '+']))).toBeNull();
        expect(previewResult(press(['2']))).toBeNull();
    });
});
