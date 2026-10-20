import { describe, expect, it } from 'vitest';
import { baseNReducer, evaluateBaseN, formatInBase, initialBaseNState } from './baseNCalculator';

const press = (keys, state = initialBaseNState) =>
    keys.reduce((current, key) => {
        if (typeof key === 'object') return baseNReducer(current, key);
        if (/^[0-9A-F]$/.test(key)) return baseNReducer(current, { type: 'digit', value: key });
        if (['+', '−', '×', '÷', 'and', 'or', 'xor', 'xnor'].includes(key)) return baseNReducer(current, { type: 'operator', value: key });
        const named = {
            '=': { type: 'evaluate' },
            '(': { type: 'open' },
            ')': { type: 'close' },
            'Not(': { type: 'open', value: 'Not(' },
            'Neg(': { type: 'open', value: 'Neg(' },
            Ans: { type: 'answer' },
            '⌫': { type: 'backspace' },
            C: { type: 'clear' },
            DEC: { type: 'setBase', value: 'DEC' },
            HEX: { type: 'setBase', value: 'HEX' },
            BIN: { type: 'setBase', value: 'BIN' },
            OCT: { type: 'setBase', value: 'OCT' },
        };
        return baseNReducer(current, named[key]);
    }, state);

describe('base-n expressions', () => {
    it('evaluates with fx-991ES precedence', () => {
        expect(evaluateBaseN('2+3×4', 'DEC')).toBe(14);
        expect(evaluateBaseN('7÷2', 'DEC')).toBe(3);
        expect(evaluateBaseN('−7÷2', 'DEC')).toBe(-3);
        expect(evaluateBaseN('12and10or1', 'DEC')).toBe(9);
        expect(evaluateBaseN('Not(0', 'DEC')).toBe(-1);
        expect(evaluateBaseN('Neg(5)+1', 'DEC')).toBe(-4);
        expect(evaluateBaseN('FF+1', 'HEX')).toBe(256);
        expect(evaluateBaseN('1010xnor1100', 'BIN')).toBe(~(0b1010 ^ 0b1100));
        expect(evaluateBaseN('FFFFFFFF', 'HEX')).toBe(-1);
    });

    it('reports errors', () => {
        expect(() => evaluateBaseN('2+', 'DEC')).toThrow('Incomplete expression');
        expect(() => evaluateBaseN('1÷0', 'DEC')).toThrow("Can't divide by zero");
        expect(() => evaluateBaseN('2147483647+1', 'DEC')).toThrow('Out of range');
        expect(() => evaluateBaseN('12', 'BIN')).toThrow('Invalid BIN digit');
    });
});

describe('base-n keypad', () => {
    it('ignores digits that are not valid in the base', () => {
        expect(press(['BIN', '1', '2', '0']).input).toBe('10');
        expect(press(['HEX', 'F', 'F']).input).toBe('FF');
        expect(press(['A']).input).toBe('');
    });

    it('converts the current value when the base changes', () => {
        const hex = press(['HEX', 'F', 'F', 'DEC']);
        expect(hex).toMatchObject({ base: 'DEC', result: 255, justEvaluated: true });
        expect(formatInBase(hex.result, 'BIN')).toBe('1111 1111');
        expect(press(['BIN'], hex)).toMatchObject({ base: 'BIN', result: 255 });
        expect(formatInBase(-1, 'HEX')).toBe('FFFFFFFF');
    });

    it('continues from a result with Ans', () => {
        const state = press(['1', '0', '=', '×', '3', '=']);
        expect(state.input).toBe('Ans×3');
        expect(state.result).toBe(30);
        expect(press(['C', 'Ans', '+', '1', '='], state).result).toBe(31);
    });

    it('replaces repeated operators and keeps a negative sign', () => {
        expect(press(['5', '+', '×', '2']).input).toBe('5×2');
        expect(press(['5', '×', '−', '2', '=']).result).toBe(-10);
        expect(press(['5', 'and', 'or']).input).toBe('5or');
    });

    it('removes whole operators on backspace and returns to editing after an error', () => {
        expect(press(['5', 'xor', '⌫']).input).toBe('5');
        const errored = press(['1', '÷', '0', '=']);
        expect(errored.error).toBe("Can't divide by zero");
        expect(press(['⌫'], errored)).toMatchObject({ input: '1÷0', error: null });
    });
});
