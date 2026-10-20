import { useEffect, useMemo, useReducer } from 'react';
import { ANGLE_UNITS, DEFAULT_SETTINGS, calculatorReducer, initialState, previewResult } from '../lib/calculator';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'calculator-state';

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isValue = (value) => isNumber(value) || (value !== null && typeof value === 'object' && isNumber(value.re) && isNumber(value.im));

const loadSettings = (saved) => {
    const settings = { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) };
    // Earlier versions saved only the angle unit, as angleMode
    if (!saved.settings && saved.angleMode) settings.angleUnit = saved.angleMode;
    if (!ANGLE_UNITS.includes(settings.angleUnit)) settings.angleUnit = DEFAULT_SETTINGS.angleUnit;
    if (!['norm', 'fix', 'sci', 'eng'].includes(settings.numberFormat?.type)) settings.numberFormat = DEFAULT_SETTINGS.numberFormat;
    return settings;
};

// Preferences, memory, variables, answers and history survive a reload.
const loadInitialState = () => {
    const saved = loadJSON(STORAGE_KEY, {}) ?? {};
    const variables = { ...initialState.variables };
    Object.keys(variables).forEach((name) => {
        if (isNumber(saved.variables?.[name])) variables[name] = saved.variables[name];
    });
    return {
        ...initialState,
        mode: saved.mode === 'CMPLX' ? 'CMPLX' : 'COMP',
        settings: loadSettings(saved),
        memory: isNumber(saved.memory) ? saved.memory : null,
        variables,
        lastAnswer: isValue(saved.lastAnswer) ? saved.lastAnswer : null,
        preAnswer: isValue(saved.preAnswer) ? saved.preAnswer : null,
        history: Array.isArray(saved.history) ? saved.history.filter((item) => item && typeof item.result === 'string') : [],
    };
};

export const useCalculator = () => {
    const [state, dispatch] = useReducer(calculatorReducer, undefined, loadInitialState);
    const { mode, settings, memory, variables, lastAnswer, preAnswer, history } = state;

    useEffect(() => {
        saveJSON(STORAGE_KEY, { mode, settings, memory, variables, lastAnswer, preAnswer, history });
    }, [mode, settings, memory, variables, lastAnswer, preAnswer, history]);

    const preview = useMemo(() => previewResult(state), [state]);

    return { state, preview, dispatch };
};
