import { BASES, BASE_OPERATIONS, formatBase, parseBase } from '../../lib/baseN';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Cell, ErrorMessage, ResultGrid, Section, Segmented, Select } from '../ui';

const BASE_OPTIONS = Object.keys(BASES).map((base) => ({ value: base, label: base }));
const OPERATION_OPTIONS = [
    { value: 'none', label: 'Convert only' },
    ...Object.entries(BASE_OPERATIONS).map(([value, op]) => ({ value, label: op.unary ? `${op.label}(A)` : `A ${op.label} B` })),
];

const isBaseState = (value) => value && value.base in BASES && typeof value.a === 'string' && typeof value.b === 'string';

const allBases = (value) => Object.keys(BASES).map((base) => [base, formatBase(value, base)]);

const BaseNMode = () => {
    const [state, setState] = usePersistentState('calculator-basen', { base: 'DEC', a: '', b: '', operation: 'none' }, isBaseState);
    const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));
    const operation = BASE_OPERATIONS[state.operation];

    const compute = () => {
        if (!state.a.trim()) return null;
        try {
            const a = parseBase(state.a, state.base);
            if (!operation) return { rows: allBases(a) };
            if (operation.unary) return { rows: allBases(operation.apply(a)) };
            if (!state.b.trim()) return { rows: allBases(a), note: 'Enter B to calculate.' };
            return { rows: allBases(operation.apply(a, parseBase(state.b, state.base))) };
        } catch (error) {
            return { error: error.message };
        }
    };
    const outcome = compute();

    return (
        <div className="flex flex-col gap-4">
            <Section title="Input base">
                <Segmented label="Input base" options={BASE_OPTIONS} value={state.base} onChange={set('base')} />
            </Section>
            <Section title="Values">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-6">A</span>
                    <Cell value={state.a} onChange={set('a')} label={`Value A in ${state.base}`} placeholder="" className="font-mono" />
                </label>
                <Select label="Operation" value={state.operation} onChange={set('operation')} options={OPERATION_OPTIONS} />
                {operation && !operation.unary && (
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className="w-6">B</span>
                        <Cell value={state.b} onChange={set('b')} label={`Value B in ${state.base}`} placeholder="" className="font-mono" />
                    </label>
                )}
                <p className="px-1 text-xs text-slate-500 dark:text-slate-400">32-bit signed integers, like the fx-991ES. Division drops the remainder.</p>
            </Section>
            <Section title="Result">
                {!outcome && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Enter a value to convert it.</p>}
                {outcome?.error && <ErrorMessage>{outcome.error}</ErrorMessage>}
                {outcome?.rows && <ResultGrid rows={outcome.rows} />}
                {outcome?.note && <p className="px-1 text-xs text-slate-500 dark:text-slate-400">{outcome.note}</p>}
            </Section>
        </div>
    );
};

export default BaseNMode;
