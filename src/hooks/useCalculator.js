import { useEffect, useMemo, useReducer } from 'react';
import { calculatorReducer, initialState, previewResult } from '../lib/calculator';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'calculator-state';

// Only preferences, memory and history survive a reload.
const loadInitialState = () => {
    const saved = loadJSON(STORAGE_KEY, {});
    return {
        ...initialState,
        angleMode: saved.angleMode === 'RAD' ? 'RAD' : 'DEG',
        memory: typeof saved.memory === 'number' ? saved.memory : null,
        lastAnswer: typeof saved.lastAnswer === 'string' ? saved.lastAnswer : null,
        history: Array.isArray(saved.history) ? saved.history : [],
    };
};

const KEY_ACTIONS = {
    '+': { type: 'operator', value: '+' },
    '-': { type: 'operator', value: '−' },
    '*': { type: 'operator', value: '×' },
    x: { type: 'operator', value: '×' },
    '/': { type: 'operator', value: '÷' },
    '^': { type: 'operator', value: '^' },
    '.': { type: 'decimal' },
    ',': { type: 'decimal' },
    '(': { type: 'openParen' },
    ')': { type: 'closeParen' },
    Enter: { type: 'evaluate' },
    '=': { type: 'evaluate' },
    Backspace: { type: 'backspace' },
    Escape: { type: 'clear' },
    Delete: { type: 'clear' },
    p: { type: 'constant', value: 'π' },
    e: { type: 'constant', value: 'e' },
    c: { type: 'clear' },
};

export const keyToAction = (key) => {
    if (/^\d$/.test(key)) return { type: 'digit', value: key };
    return KEY_ACTIONS[key] ?? null;
};

export const useCalculator = () => {
    const [state, dispatch] = useReducer(calculatorReducer, undefined, loadInitialState);
    const { angleMode, memory, lastAnswer, history } = state;

    useEffect(() => {
        saveJSON(STORAGE_KEY, { angleMode, memory, lastAnswer, history });
    }, [angleMode, memory, lastAnswer, history]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const action = keyToAction(event.key);
            if (!action) return;
            // Stops Enter from also activating a focused button
            event.preventDefault();
            dispatch(action);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const preview = useMemo(() => previewResult(state), [state]);

    return { state, preview, dispatch };
};
