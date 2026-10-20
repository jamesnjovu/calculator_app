import { fromAscii, parseCell } from '../../lib/cells';
import { generateTable } from '../../lib/table';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Cell, ErrorMessage, Section, focusRing } from '../ui';

const DEFAULT_TABLE = { f: 'x^2', g: '', start: '1', end: '5', step: '1' };
const isTableState = (value) => value && ['f', 'g', 'start', 'end', 'step'].every((key) => typeof value[key] === 'string');

const ExpressionField = ({ label, value, onChange, placeholder }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="w-12 italic">{label} =</span>
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            aria-label={label}
            className={`min-w-0 flex-1 rounded-lg border-0 bg-white px-3 py-2 text-base text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 ${focusRing}`}
        />
    </label>
);

const TableMode = ({ settings, format, scope }) => {
    const [table, setTable] = usePersistentState('calculator-table', DEFAULT_TABLE, isTableState);
    const options = { angleUnit: settings.angleUnit };
    const set = (key) => (value) => setTable((current) => ({ ...current, [key]: value }));

    const compute = () => {
        if (!table.f.trim()) return null;
        try {
            const rows = generateTable(
                {
                    f: fromAscii(table.f),
                    g: table.g.trim() ? fromAscii(table.g) : null,
                    start: parseCell(table.start, options),
                    end: parseCell(table.end, options),
                    step: parseCell(table.step, options),
                },
                { angleUnit: settings.angleUnit, scope }
            );
            return { rows };
        } catch (error) {
            return { error: error.message };
        }
    };
    const outcome = compute();
    const showG = Boolean(table.g.trim());
    const cell = (value) => (value === null ? '' : Number.isFinite(value) ? format(value) : 'ERROR');

    return (
        <div className="flex flex-col gap-4">
            <Section title="Functions of x">
                <ExpressionField label="f(x)" value={table.f} onChange={set('f')} placeholder="e.g. x^2 + 1" />
                <ExpressionField label="g(x)" value={table.g} onChange={set('g')} placeholder="optional, e.g. sin(x)" />
                <p className="px-1 text-xs text-slate-500 dark:text-slate-400">Use x, + - * / ^, sqrt(), sin(), log(), pi and e.</p>
            </Section>
            <Section title="Range">
                <div className="grid grid-cols-3 gap-2">
                    {[['start', 'Start'], ['end', 'End'], ['step', 'Step']].map(([key, label]) => (
                        <label key={key} className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {label}
                            <Cell value={table[key]} onChange={set(key)} label={label} />
                        </label>
                    ))}
                </div>
            </Section>
            <Section title="Table">
                {outcome?.error && <ErrorMessage>{outcome.error}</ErrorMessage>}
                {outcome?.rows && (
                    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                        <table className="w-full text-right text-sm tabular-nums">
                            <thead className="bg-slate-200/70 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-3 py-2 font-semibold normal-case italic">x</th>
                                    <th scope="col" className="px-3 py-2 font-semibold normal-case italic">f(x)</th>
                                    {showG && <th scope="col" className="px-3 py-2 font-semibold normal-case italic">g(x)</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800/40">
                                {outcome.rows.map((row) => (
                                    <tr key={row.x} className="border-t border-slate-100 dark:border-slate-700/60">
                                        <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{format(row.x)}</td>
                                        <td className="px-3 py-1.5 text-slate-900 dark:text-slate-100">{cell(row.f)}</td>
                                        {showG && <td className="px-3 py-1.5 text-slate-900 dark:text-slate-100">{cell(row.g)}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </div>
    );
};

export default TableMode;
