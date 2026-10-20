import { parseCell } from '../../lib/cells';
import { add, determinant, inverse, multiply, power, scale, subtract, transpose } from '../../lib/linearAlgebra';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Cell, ErrorMessage, ResultGrid, Section, Select } from '../ui';
import MatrixGrid from './MatrixGrid';

const SIZES = [1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }));

const OPERATIONS = [
    { value: 'add', label: 'A + B', uses: ['A', 'B'], run: ({ A, B }) => add(A, B) },
    { value: 'subtract', label: 'A − B', uses: ['A', 'B'], run: ({ A, B }) => subtract(A, B) },
    { value: 'multiply', label: 'A × B', uses: ['A', 'B'], run: ({ A, B }) => multiply(A, B) },
    { value: 'multiplyBA', label: 'B × A', uses: ['A', 'B'], run: ({ A, B }) => multiply(B, A) },
    { value: 'scale', label: 'k × A', uses: ['A'], run: ({ A, k }) => scale(A, k), needsK: true },
    { value: 'detA', label: 'det(A)', uses: ['A'], run: ({ A }) => determinant(A) },
    { value: 'detB', label: 'det(B)', uses: ['B'], run: ({ B }) => determinant(B) },
    { value: 'transposeA', label: 'Aᵀ', uses: ['A'], run: ({ A }) => transpose(A) },
    { value: 'inverseA', label: 'A⁻¹', uses: ['A'], run: ({ A }) => inverse(A) },
    { value: 'inverseB', label: 'B⁻¹', uses: ['B'], run: ({ B }) => inverse(B) },
    { value: 'squareA', label: 'A²', uses: ['A'], run: ({ A }) => power(A, 2) },
    { value: 'cubeA', label: 'A³', uses: ['A'], run: ({ A }) => power(A, 3) },
];

const resize = (cells, rows, columns) =>
    Array.from({ length: rows }, (_, r) => Array.from({ length: columns }, (_, c) => cells[r]?.[c] ?? ''));

const isMatrixState = (value) => value && Array.isArray(value.A) && Array.isArray(value.B);

const DEFAULT_MATRICES = { A: resize([], 2, 2), B: resize([], 2, 2) };

const MatrixEditor = ({ name, cells, values, onResize, onChange }) => (
    <Section title={`Matrix ${name}`}>
        <div className="flex items-end gap-2">
            <Select label="Rows" value={String(cells.length)} options={SIZES} onChange={(value) => onResize(Number(value), cells[0].length)} className="w-20" />
            <span className="pb-2 text-slate-400">×</span>
            <Select label="Columns" value={String(cells[0].length)} options={SIZES} onChange={(value) => onResize(cells.length, Number(value))} className="w-20" />
        </div>
        <MatrixGrid name={`Matrix ${name}`} cells={cells} values={values} onChange={onChange} />
    </Section>
);

const MatrixMode = ({ settings, format }) => {
    const [matrices, setMatrices] = usePersistentState('calculator-matrices', DEFAULT_MATRICES, isMatrixState);
    const [operation, setOperation] = usePersistentState('calculator-matrix-op', 'multiply', (value) => OPERATIONS.some((op) => op.value === value));
    const [k, setK] = usePersistentState('calculator-matrix-k', '2', (value) => typeof value === 'string');
    const options = { angleUnit: settings.angleUnit };

    const values = Object.fromEntries(
        Object.entries(matrices).map(([name, cells]) => [name, cells.map((row) => row.map((cell) => parseCell(cell, options)))])
    );
    const update = (name, cells) => setMatrices((current) => ({ ...current, [name]: cells }));
    const setCell = (name) => (r, c, text) =>
        update(name, matrices[name].map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? text : cell)) : row)));

    const selected = OPERATIONS.find((op) => op.value === operation);
    const required = selected.uses;

    const compute = () => {
        const missing = required.some((name) => values[name].some((row) => row.some((value) => !Number.isFinite(value))));
        if (missing) return null;
        try {
            return { value: selected.run({ ...values, k: parseCell(k, options) }) };
        } catch (error) {
            return { error: error.message };
        }
    };
    const outcome = compute();

    return (
        <div className="flex flex-col gap-4">
            <MatrixEditor name="A" cells={matrices.A} values={values.A} onChange={setCell('A')} onResize={(r, c) => update('A', resize(matrices.A, r, c))} />
            <MatrixEditor name="B" cells={matrices.B} values={values.B} onChange={setCell('B')} onResize={(r, c) => update('B', resize(matrices.B, r, c))} />

            <Section title="Operation">
                <div className="flex items-end gap-2">
                    <Select label="Calculate" value={operation} onChange={setOperation} options={OPERATIONS} className="flex-1" />
                    {selected.needsK && (
                        <label className="flex w-24 flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            k
                            <Cell value={k} onChange={setK} label="Scalar k" />
                        </label>
                    )}
                </div>
            </Section>

            <Section title="Result">
                {!outcome && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Fill in matrix {required.join(' and ')} to calculate.</p>}
                {outcome?.error && <ErrorMessage>{outcome.error}</ErrorMessage>}
                {outcome && 'value' in outcome && (Array.isArray(outcome.value)
                    ? <MatrixGrid name="Result" values={outcome.value} format={format} />
                    : <ResultGrid rows={[[selected.label, format(outcome.value)]]} />)}
            </Section>
        </div>
    );
};

export default MatrixMode;
