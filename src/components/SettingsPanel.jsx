import { Section, Segmented, Select, Sheet } from './ui';

const ANGLE_OPTIONS = [
    { value: 'DEG', label: 'Degrees' },
    { value: 'RAD', label: 'Radians' },
    { value: 'GRAD', label: 'Gradians' },
];

const FORMAT_OPTIONS = [
    { value: 'norm', label: 'Norm' },
    { value: 'fix', label: 'Fix' },
    { value: 'sci', label: 'Sci' },
    { value: 'eng', label: 'Eng' },
];

const FORMAT_HELP = {
    norm: 'Up to 10 significant digits',
    fix: 'Fixed number of decimal places',
    sci: 'Scientific notation with a set number of significant digits',
    eng: 'Engineering notation (powers of ten in steps of 3)',
};

const digitOptions = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: String(from + i) }));

const SettingsPanel = ({ settings, complexMode, onChange, onClose }) => {
    const { numberFormat } = settings;
    const setFormat = (type) => {
        const digits = type === 'fix' ? 2 : type === 'sci' ? 6 : 0;
        onChange('numberFormat', { type, digits });
    };

    return (
        <Sheet title="Settings" onClose={onClose}>
            <div className="flex flex-col gap-5 pb-2">
                <Section title="Angle unit">
                    <Segmented label="Angle unit" options={ANGLE_OPTIONS} value={settings.angleUnit} onChange={(value) => onChange('angleUnit', value)} />
                </Section>

                <Section title="Number format">
                    <Segmented label="Number format" options={FORMAT_OPTIONS} value={numberFormat.type} onChange={setFormat} />
                    <p className="px-1 text-xs text-slate-500 dark:text-slate-400">{FORMAT_HELP[numberFormat.type]}</p>
                    {numberFormat.type === 'fix' && (
                        <Select label="Decimal places" value={String(numberFormat.digits)} options={digitOptions(0, 9)} onChange={(value) => onChange('numberFormat', { type: 'fix', digits: Number(value) })} />
                    )}
                    {numberFormat.type === 'sci' && (
                        <Select label="Significant digits" value={String(numberFormat.digits)} options={digitOptions(1, 10)} onChange={(value) => onChange('numberFormat', { type: 'sci', digits: Number(value) })} />
                    )}
                </Section>

                <Section title="Display">
                    <Segmented
                        label="Input display"
                        options={[
                            { value: true, label: 'Natural (Math)' },
                            { value: false, label: 'Linear (Line)' },
                        ]}
                        value={settings.naturalDisplay}
                        onChange={(value) => onChange('naturalDisplay', value)}
                    />
                    <Segmented
                        label="Results"
                        options={[
                            { value: true, label: 'Exact (fractions, √, π)' },
                            { value: false, label: 'Decimal' },
                        ]}
                        value={settings.exactResults}
                        onChange={(value) => onChange('exactResults', value)}
                    />
                </Section>

                {complexMode && (
                    <Section title="Complex results">
                        <Segmented
                            label="Complex result form"
                            options={[
                                { value: 'rect', label: 'a+bi' },
                                { value: 'polar', label: 'r∠θ' },
                            ]}
                            value={settings.complexForm}
                            onChange={(value) => onChange('complexForm', value)}
                        />
                    </Section>
                )}
            </div>
        </Sheet>
    );
};

export default SettingsPanel;
