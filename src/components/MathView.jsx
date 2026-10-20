import { CONSTANTS } from '../lib/constants';
import { CONVERSIONS } from '../lib/conversions';
import { PERCENT, SLOT, numberFor, parseForDisplay } from '../lib/naturalDisplay';

// Draws expressions and results in natural textbook form: stacked fractions,
// roots with a vinculum, raised exponents and calculus templates.

const FUNCTION_NAMES = {
    fsin: 'sin', fcos: 'cos', ftan: 'tan',
    fasin: 'sin⁻¹', facos: 'cos⁻¹', fatan: 'tan⁻¹',
    sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
    asinh: 'sinh⁻¹', acosh: 'cosh⁻¹', atanh: 'tanh⁻¹',
    log10: 'log', log: 'ln', fix: 'Int', floor: 'Intg',
    gcd: 'GCD', lcm: 'LCM', ranint: 'RanInt', carg: 'arg',
    conj: 'Conjg', re: 'ReP', im: 'ImP',
    ...Object.fromEntries(CONVERSIONS.map((conversion, index) => [`cv${index}`, `${conversion.from}▶${conversion.to}`])),
};

const SYMBOLS = {
    pi: 'π', e: 'e', i: 'i', ans: 'Ans', preans: 'PreAns', ran: 'Ran#',
    ...Object.fromEntries(CONSTANTS.map((constant, index) => [`cst${index}`, constant.symbol])),
};

const OPERATOR_SIGNS = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

const Op = ({ children }) => <span className="mx-[0.12em] text-indigo-600 dark:text-indigo-400">{children}</span>;

const Slot = () => (
    <span className="mx-[0.05em] inline-block h-[0.9em] w-[0.6em] translate-y-[0.05em] rounded-sm border border-dashed border-slate-400 align-middle dark:border-slate-500" />
);

export const Fraction = ({ top, bottom }) => (
    <span className="mx-[0.1em] inline-flex flex-col items-center align-middle text-[0.8em] leading-tight">
        <span className="px-[0.15em]">{top}</span>
        <span className="w-full border-t-[0.06em] border-current" />
        <span className="px-[0.15em]">{bottom}</span>
    </span>
);

export const Root = ({ index, children }) => (
    <span className="inline-flex items-stretch align-middle">
        {index && <sup className="mr-[-0.35em] self-start text-[0.5em]">{index}</sup>}
        <span className="self-center">√</span>
        <span className="border-t-[0.06em] border-current pl-[0.08em] pr-[0.05em]">{children}</span>
    </span>
);

const Big = ({ symbol, lower, upper, children, suffix }) => (
    <span className="inline-flex items-center align-middle">
        <span className="inline-flex flex-col items-center leading-none">
            <span className="text-[0.5em]">{upper}</span>
            <span className="text-[1.3em] leading-none">{symbol}</span>
            <span className="text-[0.5em]">{lower}</span>
        </span>
        <span className="ml-[0.1em]">{children}</span>
        {suffix}
    </span>
);

const Paren = ({ children }) => (
    <>
        <span className="text-slate-400 dark:text-slate-500">(</span>
        {children}
        <span className="text-slate-400 dark:text-slate-500">)</span>
    </>
);

const stripParens = (node) => (node.type === 'ParenthesisNode' ? stripParens(node.content) : node);

// Argument counts of templates, so unfinished ones show empty slots
const ARITY = { frac: 2, nroot: 2, logab: 2, integ: 3, deriv: 2, sumx: 3, prodx: 3, gcd: 2, lcm: 2, ranint: 2, permutations: 2, combinations: 2, polar: 2 };

const renderNode = (node, numbers, key = 'root') => {
    const r = (child, suffix) => renderNode(child, numbers, `${key}.${suffix}`);
    const args = (node.args ?? []).map((arg, i) => r(arg, i));
    const arity = node.type === 'FunctionNode' ? ARITY[node.fn.name] : undefined;
    while (arity && args.length < arity) args.push(<Slot key={`slot${args.length}`} />);
    const joinArgs = () => args.reduce((list, arg, i) => (i === 0 ? [arg] : [...list, <span key={`c${i}`}>,</span>, arg]), []);

    switch (node.type) {
        case 'ConstantNode':
            return <span key={key}>{String(node.value)}</span>;
        case 'SymbolNode': {
            if (node.name === SLOT) return <Slot key={key} />;
            const number = numberFor(node.name, numbers);
            if (number !== null) return <span key={key}>{number}</span>;
            if (node.name.startsWith('var')) return <span key={key} className="italic">{node.name.slice(3)}</span>;
            return <span key={key}>{SYMBOLS[node.name] ?? node.name}</span>;
        }
        case 'ParenthesisNode':
            return <Paren key={key}>{r(node.content, 'p')}</Paren>;
        case 'OperatorNode': {
            const [left, right] = args;
            switch (node.fn) {
                case 'unaryMinus':
                    return <span key={key}>−{left}</span>;
                case 'unaryPlus':
                    return <span key={key}>+{left}</span>;
                case 'factorial':
                    return <span key={key}>{left}!</span>;
                case 'pow':
                    return (
                        <span key={key} className="inline-flex items-start">
                            {left}
                            <sup className="ml-[0.05em] text-[0.6em] leading-none">{renderNode(stripParens(node.args[1]), numbers, `${key}.e`)}</sup>
                        </span>
                    );
                case 'multiply':
                    if (node.args[1].type === 'SymbolNode' && node.args[1].name === PERCENT) return <span key={key}>{left}%</span>;
                    if (node.implicit) return <span key={key}>{left}{right}</span>;
                    return <span key={key}>{left}<Op>×</Op>{right}</span>;
                default:
                    if (OPERATOR_SIGNS[node.fn]) return <span key={key}>{left}<Op>{OPERATOR_SIGNS[node.fn]}</Op>{right}</span>;
                    return <span key={key}>{node.toString()}</span>;
            }
        }
        case 'FunctionNode': {
            const name = node.fn.name;
            const [a, b, c] = args;
            switch (name) {
                case 'sqrt': return <Root key={key}>{a}</Root>;
                case 'cbrt': return <Root key={key} index="3">{a}</Root>;
                case 'nroot': return <Root key={key} index={a}>{b}</Root>;
                case 'frac': return <Fraction key={key} top={a} bottom={b} />;
                case 'abs': return <span key={key}>|{a}|</span>;
                case 'logab':
                    return <span key={key}>log<sub className="text-[0.6em]">{a}</sub><Paren>{b}</Paren></span>;
                case 'integ':
                    return <Big key={key} symbol="∫" lower={b} upper={c} suffix={<span className="ml-[0.15em] italic">dX</span>}>{a}</Big>;
                case 'sumx':
                    return <Big key={key} symbol="Σ" lower={<>X={b}</>} upper={c}><Paren>{a}</Paren></Big>;
                case 'prodx':
                    return <Big key={key} symbol="Π" lower={<>X={b}</>} upper={c}><Paren>{a}</Paren></Big>;
                case 'deriv':
                    return (
                        <span key={key} className="inline-flex items-center">
                            <Fraction top="d" bottom="dX" />
                            <Paren>{a}</Paren>
                            <span className="self-end text-[0.55em]">|X={b}</span>
                        </span>
                    );
                case 'permutations': return <span key={key}>{a}<Op>P</Op>{b}</span>;
                case 'combinations': return <span key={key}>{a}<Op>C</Op>{b}</span>;
                case 'polar': return <span key={key}>{a}<Op>∠</Op>{b}</span>;
                case 'dms': return <span key={key}>{args.map((part, i) => <span key={i}>{part}°</span>)}</span>;
                case 'ran': return <span key={key}>Ran#</span>;
                default:
                    return <span key={key}>{FUNCTION_NAMES[name] ?? name}<Paren>{joinArgs()}</Paren></span>;
            }
        }
        default:
            return <span key={key}>{node.toString()}</span>;
    }
};

// Shows "1.5×10^20" with a raised exponent
export const NumberText = ({ text }) => {
    const match = text.match(/^(.*)×10\^(.*)$/);
    if (!match) return text;
    return (
        <>
            {match[1]}×10<sup className="text-[0.6em]">{match[2]}</sup>
        </>
    );
};

export const NaturalExpression = ({ input, fallback }) => {
    const parsed = parseForDisplay(input);
    if (!parsed) return fallback;
    return (
        <span className="inline-flex items-center">
            {parsed.trees.map((tree, i) => (
                <span key={i} className="inline-flex items-center">
                    {i > 0 && <Op>=</Op>}
                    {renderNode(tree, parsed.numbers, `t${i}`)}
                </span>
            ))}
        </span>
    );
};

// Fraction, surd or π multiple produced by exactForm()
export const ExactValue = ({ exact }) => {
    const sign = exact.sign < 0 ? '−' : '';
    let top;
    if (exact.kind === 'fraction') top = exact.num;
    if (exact.kind === 'surd') top = <>{exact.coef === 1 ? '' : exact.coef}<Root>{exact.radicand}</Root></>;
    if (exact.kind === 'pi') top = <>{exact.num === 1 ? '' : exact.num}π</>;
    return (
        <span className="inline-flex items-center">
            {sign}
            {exact.den === 1 ? top : <Fraction top={top} bottom={exact.den} />}
        </span>
    );
};
