import { describe, expect, it } from 'vitest';
import {
    calculatorReducer,
    evaluateInput,
    formatNumber,
    initialState,
    previewResult,
    toMathExpression,
} from './calculator';

// Applies a sequence of button presses. Strings are shorthand for common keys.
const press = (keys, state = initialState) =>
    keys.reduce((current, key) => {
        if (typeof key === 'object') return calculatorReducer(current, key);
        if (/^\d$/.test(key)) return calculatorReducer(current, { type: 'digit', value: key });
        if (['+', '−', '×', '÷', '^'].includes(key)) return calculatorReducer(current, { type: 'operator', value: key });
        const named = {
            '.': { type: 'decimal' },
            '(': { type: 'openParen' },
            ')': { type: 'closeParen' },
            '=': { type: 'evaluate' },
            C: { type: 'clear' },
            '⌫': { type: 'backspace' },
            '±': { type: 'toggleSign' },
            'x²': { type: 'square' },
            '1/x': { type: 'reciprocal' },
            π: { type: 'constant', value: 'π' },
            e: { type: 'constant', value: 'e' },
            Ans: { type: 'answer' },
        };
        if (named[key]) return calculatorReducer(current, named[key]);
        return calculatorReducer(current, { type: 'function', value: key });
    }, state);

describe('expression translation', () => {
    it('maps display symbols to math.js syntax', () => {
        expect(toMathExpression('2×π−√(4)÷e²')).toBe('2*pi-sqrt(4)/e^2');
        expect(toMathExpression('log(100)+ln(e)')).toBe('log10(100)+log(e)');
        expect(toMathExpression('1.5e+20×2')).toBe('1.5e+20*2');
        expect(toMathExpression('1e−7')).toBe('1e-7');
    });
});

describe('formatting', () => {
    it('hides floating point noise', () => {
        expect(formatNumber(0.1 + 0.2)).toBe('0.3');
        expect(formatNumber(-0)).toBe('0');
        expect(formatNumber(-5)).toBe('−5');
    });
});

describe('evaluation', () => {
    it('evaluates basic arithmetic with precedence', () => {
        expect(press(['2', '+', '3', '×', '4', '=']).result).toBe('14');
        expect(press(['1', '0', '÷', '4', '=']).result).toBe('2.5');
        expect(press(['2', '^', '1', '0', '=']).result).toBe('1024');
    });

    it('auto-closes parentheses', () => {
        const state = press(['(', '2', '+', '3', '×', '2', '=']);
        expect(state.input).toBe('(2+3×2)');
        expect(state.result).toBe('8');
    });

    it('uses degrees by default and supports radians', () => {
        expect(press(['sin', '3', '0', '=']).result).toBe('0.5');
        expect(press(['sin', '1', '8', '0', '=']).result).toBe('0');
        expect(press(['cos', '9', '0', '=']).result).toBe('0');
        const radians = { ...initialState, angleMode: 'RAD' };
        expect(press(['sin', 'π', '='], radians).result).toBe('0');
    });

    it('reports undefined results as errors', () => {
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
        expect(press(['sqrt', '1', '6', '+', '9', ')', '=']).result).toBe('5');
        expect(press(['log', '1', '0', '0', '0', '=']).result).toBe('3');
        expect(press(['ln', 'e', '=']).result).toBe('1');
    });

    it('throws on incomplete expressions', () => {
        expect(() => evaluateInput('2+')).toThrow();
        expect(() => evaluateInput('')).toThrow();
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
        expect(press(['5', '×', '−', '2', '=']).result).toBe('−10');
        expect(press(['5', '×', '−', '+']).input).toBe('5+');
        expect(press(['−', '3', '=']).result).toBe('−3');
    });

    it('inserts implicit multiplication', () => {
        expect(press(['2', 'π']).input).toBe('2×π');
        expect(press(['2', '(', '3', ')', '4']).input).toBe('2×(3)×4');
        expect(press(['2', 'sin']).input).toBe('2×sin(');
    });

    it('only closes open parentheses after an operand', () => {
        expect(press([')']).input).toBe('');
        expect(press(['(', '2', '+', ')']).input).toBe('(2+');
    });

    it('removes whole function names on backspace', () => {
        expect(press(['2', '+', 'sin', '⌫']).input).toBe('2+');
        expect(press(['1', '2', '⌫']).input).toBe('1');
    });

    it('continues from a result with an operator and starts fresh with a digit', () => {
        const evaluated = press(['2', '+', '3', '=']);
        expect(press(['×', '2', '='], evaluated).result).toBe('10');
        expect(press(['7'], evaluated).input).toBe('7');
    });

    it('squares and inverts the current value', () => {
        expect(press(['3', 'x²', '=']).result).toBe('9');
        expect(press(['4', '1/x', '=']).result).toBe('0.25');
        expect(press(['−', '3', '=', 'x²', '=']).result).toBe('9');
    });

    it('supports absolute value and factorial', () => {
        expect(press(['abs', '−', '7', '=']).result).toBe('7');
        expect(press(['5', { type: 'factorial' }, '=']).result).toBe('120');
        expect(press(['3', { type: 'factorial' }, '2']).input).toBe('3!×2');
        expect(press(['−', '1', { type: 'factorial' }, '=']).result).toBe('−1');
    });

    it('toggles the sign of the trailing number', () => {
        expect(press(['5', '±']).input).toBe('−5');
        expect(press(['5', '±', '±']).input).toBe('5');
        expect(press(['5', '−', '3', '±', '=']).result).toBe('8');
    });

    it('inserts the previous answer', () => {
        const evaluated = press(['−', '4', '=']);
        expect(press(['C', '2', '×', 'Ans', '='], evaluated).result).toBe('−8');
    });

    it('clears an error on the next input', () => {
        const errored = press(['1', '÷', '0', '=']);
        expect(press(['7'], errored)).toMatchObject({ input: '7', error: null });
        expect(press(['⌫'], errored)).toMatchObject({ input: '', error: null });
    });
});

describe('memory', () => {
    it('stores, adds, subtracts and recalls values', () => {
        let state = press(['5', { type: 'memoryStore' }]);
        expect(state.memory).toBe(5);
        state = press(['C', '3', { type: 'memoryAdd' }], state);
        expect(state.memory).toBe(8);
        state = press(['C', '1', { type: 'memorySubtract' }], state);
        expect(state.memory).toBe(7);
        state = press(['C', '2', '×', { type: 'memoryRecall' }, '='], state);
        expect(state.result).toBe('14');
        expect(press([{ type: 'memoryClear' }], state).memory).toBeNull();
    });

    it('ignores memory operations on invalid input', () => {
        expect(press([{ type: 'memoryStore' }]).memory).toBeNull();
        expect(press(['2', '+', { type: 'memoryAdd' }]).memory).toBeNull();
        expect(press([{ type: 'memoryRecall' }])).toEqual(initialState);
    });
});

describe('history', () => {
    it('records newest calculations first and can be cleared', () => {
        let state = press(['1', '+', '1', '=', 'C', '2', '×', '3', '=']);
        expect(state.history.map((item) => item.result)).toEqual(['6', '2']);
        state = calculatorReducer(state, { type: 'recall', value: '2' });
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
