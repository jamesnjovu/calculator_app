import { quadraticVertex, solveLinearSystem, solvePolynomial } from '../../lib/equation';
import { parseCell } from '../../lib/cells';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Cell, ErrorMessage, ResultGrid, Section, Segmented } from '../ui';

const TYPES = [
    { value: 'lin2', label: '2 unknowns' },
    { value: 'lin3', label: '3 unknowns' },
    { value: 'quad', label: 'ax²+bx+c' },
    { value: 'cubic', label: 'ax³+…+d' },
];

const UNKNOWNS = ['x', 'y', 'z'];

const emptyGrid = (rows, columns) => Array.from({ length: rows }, () => Array(columns).fill(''));

const DEFAULT_DATA = {
    lin2: emptyGrid(2, 3),
    lin3: emptyGrid(3, 4),
    quad: [['', '', '']],
    cubic: [['', '', '', '']],
};

const isTypeData = (value) => value && Object.keys(DEFAULT_DATA).every((key) => Array.isArray(value[key]));

const POLY_LABELS = { quad: ['a', 'b', 'c'], cubic: ['a', 'b', 'c', 'd'] };

const EquationMode = ({ settings, format, formatComplex }) => {
    const [type, setType] = usePersistentState('calculator-eqn-type', 'lin2', (value) => value in DEFAULT_DATA);
    const [data, setData] = usePersistentState('calculator-eqn-data', DEFAULT_DATA, isTypeData);
    const grid = data[type];
    const options = { angleUnit: settings.angleUnit };

    const setCell = (row, column, text) =>
        setData((current) => ({
            ...current,
            [type]: current[type].map((cells, r) => (r === row ? cells.map((cell, c) => (c === column ? text : cell)) : cells)),
        }));

    const values = grid.map((row) => row.map((cell) => parseCell(cell, options)));
    const complete = values.every((row) => row.every(Number.isFinite));

    const solve = () => {
        try {
            if (type === 'lin2' || type === 'lin3') {
                const solution = solveLinearSystem(values.map((row) => row.slice(0, -1)), values.map((row) => row[row.length - 1]));
                return { rows: solution.map((value, i) => [UNKNOWNS[i], format(value)]) };
            }
            const coefficients = values[0];
            const roots = solvePolynomial(coefficients);
            const rows = roots.map((root, i) => [`x${'₁₂₃'[i]}`, formatComplex(root)]);
            if (type === 'quad') {
                const vertex = quadraticVertex(coefficients);
                rows.push([`${vertex.kind === 'minimum' ? 'Minimum' : 'Maximum'} at x`, format(vertex.x)]);
                rows.push([`${vertex.kind === 'minimum' ? 'Minimum' : 'Maximum'} y`, format(vertex.y)]);
            }
            return { rows };
        } catch (error) {
            return { error: error.message };
        }
    };
    const outcome = complete ? solve() : null;

    const linear = type === 'lin2' || type === 'lin3';
    const unknownCount = type === 'lin3' ? 3 : 2;

    return (
        <div className="flex flex-col gap-4">
            <Segmented label="Equation type" options={TYPES} value={type} onChange={setType} size="sm" />

            <Section title={linear ? 'Coefficients' : 'Equation'}>
                {linear ? (
                    <div className="flex flex-col gap-2">
                        <div className="grid gap-2 px-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400" style={{ gridTemplateColumns: `repeat(${unknownCount + 1}, minmax(0, 1fr))` }}>
                            {[...UNKNOWNS.slice(0, unknownCount), '='].map((label) => (
                                <span key={label} className="italic">{label}</span>
                            ))}
                        </div>
                        {grid.map((row, r) => (
                            <div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
                                {row.map((cell, c) => (
                                    <Cell
                                        key={c}
                                        value={cell}
                                        onChange={(text) => setCell(r, c, text)}
                                        label={`Equation ${r + 1}, ${c < unknownCount ? `coefficient of ${UNKNOWNS[c]}` : 'constant'}`}
                                        invalid={cell !== '' && !Number.isFinite(values[r][c])}
                                    />
                                ))}
                            </div>
                        ))}
                        <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
                            Each row is one equation, e.g. 2x + 3y = 8. Fields accept expressions like 1/3 or sqrt(2).
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="px-1 text-center text-lg text-slate-700 dark:text-slate-200">
                            {type === 'quad' ? 'ax² + bx + c = 0' : 'ax³ + bx² + cx + d = 0'}
                        </p>
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}>
                            {grid[0].map((cell, c) => (
                                <label key={c} className="flex flex-col gap-1 text-center text-xs font-medium italic text-slate-500 dark:text-slate-400">
                                    {POLY_LABELS[type][c]}
                                    <Cell value={cell} onChange={(text) => setCell(0, c, text)} label={`Coefficient ${POLY_LABELS[type][c]}`} invalid={cell !== '' && !Number.isFinite(values[0][c])} />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </Section>

            <Section title="Solution">
                {!outcome && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Fill in every coefficient to solve.</p>}
                {outcome?.error && <ErrorMessage>{outcome.error}</ErrorMessage>}
                {outcome?.rows && <ResultGrid rows={outcome.rows} />}
            </Section>
        </div>
    );
};

export default EquationMode;
