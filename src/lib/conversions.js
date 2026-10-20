// Unit conversions, matching the fx-991ES PLUS II set. Each pair is offered in
// both directions; `factor` converts `from` into `to`.
const PAIRS = [
    { from: 'in', to: 'cm', factor: 2.54, category: 'Length' },
    { from: 'ft', to: 'm', factor: 0.3048, category: 'Length' },
    { from: 'yd', to: 'm', factor: 0.9144, category: 'Length' },
    { from: 'mile', to: 'km', factor: 1.609344, category: 'Length' },
    { from: 'n mile', to: 'm', factor: 1852, category: 'Length' },
    { from: 'pc', to: 'km', factor: 30856775814913.67, category: 'Length' },
    { from: 'acre', to: 'm²', factor: 4046.8564224, category: 'Area' },
    { from: 'gal(US)', to: 'L', factor: 3.785411784, category: 'Volume' },
    { from: 'gal(UK)', to: 'L', factor: 4.54609, category: 'Volume' },
    { from: 'km/h', to: 'm/s', factor: 1 / 3.6, category: 'Speed' },
    { from: 'oz', to: 'g', factor: 28.349523125, category: 'Mass' },
    { from: 'lb', to: 'kg', factor: 0.45359237, category: 'Mass' },
    { from: 'atm', to: 'Pa', factor: 101325, category: 'Pressure' },
    { from: 'mmHg', to: 'Pa', factor: 133.322387415, category: 'Pressure' },
    { from: 'kgf/cm²', to: 'Pa', factor: 98066.5, category: 'Pressure' },
    { from: 'lbf/in²', to: 'kPa', factor: 6.894757293168361, category: 'Pressure' },
    { from: 'hp', to: 'kW', factor: 0.745699871582270, category: 'Power' },
    { from: 'kgf·m', to: 'J', factor: 9.80665, category: 'Energy' },
    { from: 'J', to: 'cal', factor: 1 / 4.1868, category: 'Energy' },
];

const fahrenheitToCelsius = (f) => ((f - 32) * 5) / 9;
const celsiusToFahrenheit = (c) => (c * 9) / 5 + 32;

export const CONVERSIONS = [
    ...PAIRS.flatMap(({ from, to, factor, category }) => [
        { from, to, category, convert: (x) => x * factor },
        { from: to, to: from, category, convert: (x) => x / factor },
    ]),
    { from: '°F', to: '°C', category: 'Temperature', convert: fahrenheitToCelsius },
    { from: '°C', to: '°F', category: 'Temperature', convert: celsiusToFahrenheit },
].map((conversion) => ({ ...conversion, token: `${conversion.from}▶${conversion.to}(` }));
