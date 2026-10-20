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

export const useCalculator = () => {
    const [state, dispatch] = useReducer(calculatorReducer, undefined, loadInitialState);
    const { angleMode, memory, lastAnswer, history } = state;

    useEffect(() => {
        saveJSON(STORAGE_KEY, { angleMode, memory, lastAnswer, history });
    }, [angleMode, memory, lastAnswer, history]);

    const preview = useMemo(() => previewResult(state), [state]);

    return { state, preview, dispatch };
};
