import { Cell } from '../ui';

// Editable or read-only grid of numbers with bracket edges
const MatrixGrid = ({ name, cells, onChange, values, format }) => {
    const columns = cells ? cells[0].length : values[0].length;
    const rows = cells ?? values;
    return (
        <div className="flex items-stretch gap-1">
            <span aria-hidden="true" className="w-1.5 rounded-l-md border-y-2 border-l-2 border-slate-400 dark:border-slate-500" />
            <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {rows.map((row, r) =>
                    row.map((cell, c) =>
                        onChange ? (
                            <Cell
                                key={`${r}-${c}`}
                                value={cell}
                                onChange={(text) => onChange(r, c, text)}
                                label={`${name} row ${r + 1} column ${c + 1}`}
                                invalid={cell !== '' && values && !Number.isFinite(values[r][c])}
                            />
                        ) : (
                            <span key={`${r}-${c}`} className="truncate rounded-lg bg-white px-2 py-2 text-right tabular-nums text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-slate-700">
                                {format(cell)}
                            </span>
                        )
                    )
                )}
            </div>
            <span aria-hidden="true" className="w-1.5 rounded-r-md border-y-2 border-r-2 border-slate-400 dark:border-slate-500" />
        </div>
    );
};

export default MatrixGrid;
