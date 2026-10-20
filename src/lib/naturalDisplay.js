import { parse } from 'mathjs/number';
import { prepareTokens, tokenize } from './tokens';

// Builds a math.js expression tree for drawing the input in natural textbook
// form. Numbers become placeholder symbols so they keep the digits as typed
// ("2." stays "2."), and a slot marks where the next value goes.

export const SLOT = 'slot__';
export const PERCENT = 'pct__';
const NUMBER_PREFIX = 'n__';

const INCOMPLETE_KINDS = new Set(['operator', 'infix', 'function', 'open', 'comma', 'equals']);

// Returns { tree, numbers } or null when the input can't be drawn naturally.
export const parseForDisplay = (input) => {
    if (!input) return null;
    try {
        const numbers = [];
        const tokens = tokenize(input).map((token) => {
            if (token.kind === 'number') {
                numbers.push(token.display);
                return { ...token, math: `${NUMBER_PREFIX}${numbers.length - 1}` };
            }
            if (token.display === '%') return { ...token, math: `*${PERCENT}` };
            return token;
        });
        const last = tokens[tokens.length - 1];
        if (INCOMPLETE_KINDS.has(last.kind)) tokens.push({ display: '', math: SLOT, kind: 'constant' });

        // Split an equation so each side is drawn on its own
        const equalsAt = tokens.findIndex((token) => token.kind === 'equals');
        const sides = equalsAt === -1 ? [tokens] : [tokens.slice(0, equalsAt), tokens.slice(equalsAt + 1)];
        const trees = sides.map((side) => {
            const prepared = prepareTokens(side.length ? side : [{ math: SLOT, kind: 'constant' }], { complex: true });
            return parse(prepared.map((token) => token.math).join(''));
        });
        return { trees, numbers };
    } catch {
        return null;
    }
};

export const numberFor = (name, numbers) =>
    name.startsWith(NUMBER_PREFIX) ? numbers[Number(name.slice(NUMBER_PREFIX.length))] : null;
