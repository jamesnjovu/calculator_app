import { parseCell } from '../../lib/cells';
import { angleBetween, cross, dot, magnitude, unitVector } from '../../lib/linearAlgebra';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Cell, ResultGrid, Section, Segmented } from '../ui';

const AXES = ['x', 'y', 'z'];
const ANGLE_FACTOR = { DEG: 180 / Math.PI, RAD: 1, GRAD: 200 / Math.PI };

const isVectorState = (value) => value && Array.isArray(value.A) && Array.isArray(value.B) && [2, 3].includes(value.dimension);

const VectorMode = ({ settings, format }) => {
    const [vectors, setVectors] = usePersistentState('calculator-vectors', { dimension: 3, A: ['', '', ''], B: ['', '', ''], k: '2' }, isVectorState);
    const { dimension } = vectors;
    const options = { angleUnit: settings.angleUnit };
    const values = {
        A: vectors.A.slice(0, dimension).map((cell) => parseCell(cell, options)),
        B: vectors.B.slice(0, dimension).map((cell) => parseCell(cell, options)),
    };
    const ready = (name) => values[name].every(Number.isFinite);
    const formatVector = (v) => `[${v.map(format).join(', ')}]`;

    const setComponent = (name, index, text) =>
        setVectors((current) => ({ ...current, [name]: current[name].map((cell, i) => (i === index ? text : cell)) }));

    const safely = (calculate) => {
        try {
            return calculate();
        } catch (error) {
            return error.message;
        }
    };

    const rows = [];
    if (ready('A')) {
        rows.push(['|A|', format(magnitude(values.A))]);
        rows.push(['Unit A', safely(() => formatVector(unitVector(values.A)))]);
        const k = parseCell(vectors.k, options);
        if (Number.isFinite(k)) rows.push([`${format(k)} × A`, formatVector(values.A.map((value) => value * k))]);
    }
    if (ready('B')) rows.push(['|B|', format(magnitude(values.B))]);
    if (ready('A') && ready('B')) {
        rows.push(['A + B', formatVector(values.A.map((value, i) => value + values.B[i]))]);
        rows.push(['A − B', formatVector(values.A.map((value, i) => value - values.B[i]))]);
        rows.push(['A · B', format(dot(values.A, values.B))]);
        rows.push(['A × B', formatVector(cross(values.A, values.B))]);
        const angle = safely(() => format(angleBetween(values.A, values.B) * ANGLE_FACTOR[settings.angleUnit]));
        rows.push([`Angle (${settings.angleUnit === 'GRAD' ? 'GRA' : settings.angleUnit})`, angle]);
    }

    return (
        <div className="flex flex-col gap-4">
            <Segmented
                label="Dimension"
                options={[{ value: 2, label: '2D' }, { value: 3, label: '3D' }]}
                value={dimension}
                onChange={(value) => setVectors((current) => ({ ...current, dimension: value }))}
            />
            {['A', 'B'].map((name) => (
                <Section key={name} title={`Vector ${name}`}>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${dimension}, minmax(0, 1fr))` }}>
                        {AXES.slice(0, dimension).map((axis, i) => (
                            <label key={axis} className="flex flex-col gap-1 text-center text-xs font-medium italic text-slate-500 dark:text-slate-400">
                                {axis}
                                <Cell value={vectors[name][i]} onChange={(text) => setComponent(name, i, text)} label={`Vector ${name} ${axis}`} invalid={vectors[name][i] !== '' && !Number.isFinite(values[name][i])} />
                            </label>
                        ))}
                    </div>
                </Section>
            ))}
            <Section title="Scalar">
                <label className="flex items-center gap-2 px-1 text-sm text-slate-600 dark:text-slate-300">
                    k =
                    <Cell value={vectors.k} onChange={(text) => setVectors((current) => ({ ...current, k: text }))} label="Scalar k" className="max-w-[8rem]" />
                </label>
            </Section>
            <Section title="Results">
                {rows.length === 0 ? <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Fill in vector A (and B) to see the results.</p> : <ResultGrid rows={rows} />}
            </Section>
        </div>
    );
};

export default VectorMode;
