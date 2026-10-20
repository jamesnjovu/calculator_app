import { useMemo, useState } from 'react';
import { CONSTANT_CATALOG, CONVERSION_CATALOG, FUNCTION_CATALOG, searchCatalog } from '../lib/catalog';
import { NumberText } from './MathView';
import { Segmented, Sheet, focusRing } from './ui';

const TABS = [
    { value: 'functions', label: 'Functions' },
    { value: 'constants', label: 'Constants' },
    { value: 'conversions', label: 'Conversions' },
];

const CatalogPanel = ({ complexMode, initialTab = 'functions', onInsert, onClose }) => {
    const [tab, setTab] = useState(initialTab);
    const [query, setQuery] = useState('');

    const items = useMemo(() => {
        const source = {
            functions: FUNCTION_CATALOG.filter((item) => complexMode || !item.complexOnly),
            constants: CONSTANT_CATALOG,
            conversions: CONVERSION_CATALOG,
        }[tab];
        return searchCatalog(source, query);
    }, [tab, query, complexMode]);

    // Group consecutive items by category for headings
    const groups = items.reduce((list, item) => {
        const last = list[list.length - 1];
        if (last && last.category === item.category) last.items.push(item);
        else list.push({ category: item.category, items: [item] });
        return list;
    }, []);

    return (
        <Sheet title="Catalog" onClose={onClose}>
            <div className="sticky top-0 z-10 flex flex-col gap-2 bg-slate-100 pb-3 dark:bg-slate-900">
                <Segmented label="Catalog section" options={TABS} value={tab} onChange={setTab} size="sm" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    aria-label="Search the catalog"
                    className={`rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 ${focusRing}`}
                />
            </div>
            {groups.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nothing matches “{query}”</p>}
            {groups.map((group) => (
                <section key={group.category} className="mb-3">
                    <h3 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{group.category}</h3>
                    <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                        {group.items.map((item) => (
                            <li key={item.token} className="border-b border-slate-100 last:border-0 dark:border-slate-700/60">
                                <button
                                    type="button"
                                    onClick={() => onInsert(item)}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/60 ${focusRing}`}
                                >
                                    <span className="min-w-[4.5rem] font-medium text-indigo-700 dark:text-indigo-300">{item.label}</span>
                                    <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">
                                        {item.description}
                                        {item.detail && (
                                            <span className="block text-xs tabular-nums text-slate-400">
                                                <NumberText text={item.detail} /> {item.unit}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </Sheet>
    );
};

export default CatalogPanel;
