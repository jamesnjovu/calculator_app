import { useState } from 'react';
import { parseCell } from '../../lib/cells';
import { REGRESSIONS, oneVariable, regression, twoVariable } from '../../lib/statistics';
import { usePersistentState } from '../../hooks/usePersistentState';
import { TrashIcon } from '../Icons';
import { Button, Cell, ErrorMessage, ResultGrid, Section, Select, focusRing } from '../ui';

const MODEL_OPTIONS = [
    { value: 'single', label: '1-Variable (x)' },
    ...Object.entries(REGRESSIONS).map(([value, model]) => ({ value, label: model.label })),
];

const emptyRow = () => ({ x: '', y: '', freq: '' });
const isRows = (value) => Array.isArray(value) && value.every((row) => row && typeof row.x === 'string');

const StatisticsMode = ({ settings, format }) => {
    const [model, setModel] = usePersistentState('calculator-stat-model', 'single', (value) => value === 'single' || value in REGRESSIONS);
    const [rows, setRows] = usePersistentState('calculator-stat-rows', [emptyRow(), emptyRow(), emptyRow()], isRows);
    const [useFrequency, setUseFrequency] = usePersistentState('calculator-stat-freq', false, (value) => typeof value === 'boolean');
    const [estimateX, setEstimateX] = useState('');
    const options = { angleUnit: settings.angleUnit };
    const twoVar = model !== 'single';

    const setCell = (index, field, text) =>
        setRows((current) => {
            const next = current.map((row, i) => (i === index ? { ...row, [field]: text } : row));
            // Keep one empty row at the end for quick entry
            const last = next[next.length - 1];
            return last.x || last.y ? [...next, emptyRow()] : next;
        });

    const removeRow = (index) => setRows((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : [emptyRow()]));

    const parsed = rows.map((row) => ({
        x: parseCell(row.x, options),
        y: parseCell(row.y, options),
        freq: useFrequency && row.freq !== '' ? parseCell(row.freq, options) : 1,
    }));
    const filled = parsed.filter((row) => Number.isFinite(row.x) && (!twoVar || Number.isFinite(row.y)));
    const xs = filled.map((row) => row.x);
    const ys = filled.map((row) => row.y);
    const frequencies = filled.map((row) => row.freq);

    const compute = () => {
        if (filled.length === 0) return null;
        try {
            if (!twoVar) {
                const s = oneVariable(xs, frequencies);
                return {
                    rows: [
                        ['n', format(s.n)], ['x̄ (mean)', format(s.mean)], ['Σx', format(s.sum)], ['Σx²', format(s.sumSquares)],
                        ['σx (population)', format(s.populationSD)], ['sx (sample)', Number.isNaN(s.sampleSD) ? '—' : format(s.sampleSD)],
                        ['min', format(s.min)], ['Q1', format(s.q1)], ['median', format(s.median)], ['Q3', format(s.q3)], ['max', format(s.max)],
                    ],
                };
            }
            const fit = regression(model, xs, ys, frequencies);
            const summary = twoVariable(xs, ys, frequencies);
            const coefficientRows = Object.entries(fit.coefficients).map(([name, value]) => [name, format(value)]);
            if (fit.r !== null && fit.r !== undefined) coefficientRows.push(['r', Number.isNaN(fit.r) ? '—' : format(fit.r)]);
            const x = parseCell(estimateX, options);
            return {
                rows: coefficientRows,
                summary: [
                    ['n', format(summary.n)], ['x̄', format(summary.x.mean)], ['ȳ', format(summary.y.mean)],
                    ['Σx', format(summary.x.sum)], ['Σy', format(summary.y.sum)], ['Σxy', format(summary.sumXY)],
                    ['σx', format(summary.x.populationSD)], ['σy', format(summary.y.populationSD)],
                ],
                estimate: Number.isFinite(x) ? format(fit.predict(x)) : null,
            };
        } catch (error) {
            return { error: error.message };
        }
    };
    const outcome = compute();

    const columns = ['x', ...(twoVar ? ['y'] : []), ...(useFrequency ? ['freq'] : [])];
    const gridStyle = { gridTemplateColumns: `2rem repeat(${columns.length}, minmax(0, 1fr)) 2rem` };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
                <Select label="Model" value={model} onChange={setModel} options={MODEL_OPTIONS} className="flex-1" />
                <Button onClick={() => setUseFrequency(!useFrequency)} aria-pressed={useFrequency} className={useFrequency ? 'ring-2 ring-indigo-500' : ''}>
                    Freq
                </Button>
            </div>

            <Section title="Data">
                <div className="grid items-center gap-1.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400" style={gridStyle}>
                    <span />
                    {columns.map((column) => <span key={column} className={column === 'freq' ? '' : 'italic'}>{column}</span>)}
                    <span />
                </div>
                <div className="flex flex-col gap-1.5">
                    {rows.map((row, index) => (
                        <div key={index} className="grid items-center gap-1.5" style={gridStyle}>
                            <span className="text-center text-xs tabular-nums text-slate-400">{index + 1}</span>
                            {columns.map((column) => (
                                <Cell
                                    key={column}
                                    value={row[column]}
                                    placeholder={column === 'freq' ? '1' : ''}
                                    onChange={(text) => setCell(index, column, text)}
                                    label={`Row ${index + 1} ${column}`}
                                    invalid={row[column] !== '' && !Number.isFinite(parseCell(row[column], options))}
                                />
                            ))}
                            <button type="button" onClick={() => removeRow(index)} aria-label={`Remove row ${index + 1}`} className={`flex justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-500 dark:hover:bg-slate-800 ${focusRing}`}>
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <Button variant="ghost" onClick={() => setRows([emptyRow(), emptyRow(), emptyRow()])} className="self-start text-xs">
                    Clear data
                </Button>
            </Section>

            <Section title="Results">
                {!outcome && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Enter data to see the results.</p>}
                {outcome?.error && <ErrorMessage>{outcome.error}</ErrorMessage>}
                {outcome?.rows && <ResultGrid rows={outcome.rows} />}
                {outcome?.summary && (
                    <>
                        <label className="flex items-center gap-2 px-1 text-sm text-slate-600 dark:text-slate-300">
                            <span className="whitespace-nowrap">Estimate ŷ at x =</span>
                            <Cell value={estimateX} onChange={setEstimateX} label="x value to estimate y" placeholder="" className="max-w-[8rem]" />
                            <span className="flex-1 text-right font-semibold tabular-nums">{outcome.estimate ?? ''}</span>
                        </label>
                        <ResultGrid rows={outcome.summary} />
                    </>
                )}
            </Section>
        </div>
    );
};

export default StatisticsMode;
