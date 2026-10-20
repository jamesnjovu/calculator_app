# Scientific Calculator

A modern scientific calculator built with React, Vite and Tailwind CSS. It installs as a Progressive Web App and works offline.

**Live demo:** https://jamesnjovu.github.io/calculator_app/

[![CI and Deploy](https://github.com/jamesnjovu/calculator_app/actions/workflows/deploy.yml/badge.svg)](https://github.com/jamesnjovu/calculator_app/actions/workflows/deploy.yml)

## Features

Inspired by the Casio fx-991ES PLUS II.

### Modes

| Mode | What it does |
| --- | --- |
| **Basic** | Everyday arithmetic with a clean number pad |
| **Calculate** | Full scientific calculator (see below) |
| **Complex** | Complex arithmetic with `i`, `∠`, `arg`, `Conjg`, `ReP`, `ImP`; results as a+bi or r∠θ |
| **Statistics** | One-variable statistics (mean, σ, s, quartiles…) with frequencies, and 7 regression models: linear, quadratic, logarithmic, e-exponential, ab-exponential, power and inverse, with r and ŷ estimates |
| **Base-N** | Keypad calculator for 32-bit integers with blue DEC, HEX, BIN and OCT keys, A–F digits and the logic operators and, or, xor, xnor, Not, Neg; the value is shown in all four bases at once |
| **Equation** | Simultaneous linear equations in 2 or 3 unknowns, quadratic (with minimum/maximum) and cubic equations, including complex roots |
| **Matrix** | Matrices up to 4×4: addition, subtraction, multiplication, scalar multiple, determinant, transpose, inverse, powers |
| **Table** | Table of values for f(x) and g(x) over a range |
| **Vector** | 2D and 3D vectors: sum, difference, dot and cross product, length, unit vector, angle between |

### Calculate mode

- **Natural display**: fractions, roots, powers, integrals, sums and derivatives are drawn as in a textbook, with empty slots showing what is still needed
- **Exact results**: fractions (`1/3`), surds (`√3/2`) and multiples of π (`π/3`); **S⇔D** switches to the decimal value
- **SHIFT and hyp keys** give every key a second function, shown in amber above it. SHIFT with a number key opens STAT (1), CMPLX (2), BASE (3), MATRIX (4), VECTOR (5), EQN (6), the constants (CONST, 7) and conversions (CONV, 8), or clears memory and variables (CLR, 9)
- **Functions**: sin, cos, tan and their inverses and hyperbolic forms, log, ln, logₐb, 10ˣ, eˣ, x², x³, xʸ, √, ∛, ˣ√, x⁻¹, x!, %, Abs, Int, Intg, GCD, LCM, nPr, nCr, Ran#, RanInt, ×10ˣ, degrees-minutes-seconds (°′″)
- **Calculus**: definite integrals ∫, derivatives d/dx, sums Σ and products Π of f(X)
- **SOLVE**: type an equation in X (for example `X²=2`) and press SHIFT then = to solve it
- **Variables** A–F, X, Y and M with STO, plus **Ans** and **PreAns**
- **Catalog** of every function, **40 scientific constants** (CODATA 2018) and **40 unit conversions**, with search
- **Settings**: degrees, radians or gradians; Norm, Fix, Sci or Eng number format; natural or linear display; exact or decimal results
- Clear error messages such as "Can't divide by zero" or "Incomplete expression"; ⌫ after an error goes back to editing

### Everywhere

- Live result preview, one-tap copy, history with tap-to-reuse
- Keyboard support with on-screen key highlighting
- Responsive layout: full-screen keypad on phones, card with a history panel on larger screens
- Light, dark and system themes; settings, data and history are saved between visits
- Installable PWA that works offline

## Usage

Type an expression and press `=`. Functions such as `sin` open a parenthesis; missing closing parentheses are added automatically. Pressing an operator right after a result continues with `Ans`; typing a number starts a new calculation. Functions with several parts, like `∫(f, a, b)`, take their parts separated by commas (SHIFT then `)`).

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0`–`9`, `.` | Digits and decimal point |
| `+` `-` `*` `/` `^` | Operators |
| `(` `)` `,` | Parentheses and argument separator |
| `!`, `%` | Factorial, percent |
| `p`, `e`, `i`, `X` | π, e, i (Complex mode) and the variable X |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete the last character or function |
| `Escape`, `Delete` or `c` | Clear |

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/jamesnjovu/calculator_app.git
cd calculator_app
npm install
npm run dev
```

Then open http://localhost:5173/calculator_app/.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests |
| `npm run lint` | Lint the code |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch manually |

## Deployment

Every push to `main` runs the [CI and Deploy](.github/workflows/deploy.yml) workflow: it lints, tests and builds the app, then publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves. Pull requests run the same checks without deploying.

## Project structure

```
calculator_app/
├── .github/workflows/deploy.yml   # CI and GitHub Pages deployment
├── public/                        # Icons, PWA manifest, service worker
├── src/
│   ├── components/
│   │   ├── ScientificCalculator.jsx   # Layout, modes and panels
│   │   ├── CalculatorDisplay.jsx      # Indicators, input and result
│   │   ├── MathView.jsx               # Natural (textbook) rendering
│   │   ├── Keypad.jsx                 # Keys with SHIFT and hyp layers
│   │   ├── Header.jsx, ModeMenu.jsx, CatalogPanel.jsx,
│   │   │   SettingsPanel.jsx, VariablesPanel.jsx, CalculatorHistory.jsx
│   │   ├── modes/                     # Base-N keypad, Statistics, Equation, Matrix, Table, Vector
│   │   └── ui.jsx, Icons.jsx, Toast.jsx
│   ├── hooks/                         # Calculator state, theme, keyboard, persistence
│   ├── lib/
│   │   ├── calculator.js              # Calculator reducer (editing, evaluation, results)
│   │   ├── tokens.js                  # Expression tokens and translation to math.js
│   │   ├── engine.js                  # Evaluation, calculus and SOLVE
│   │   ├── complex.js                 # Complex number evaluation
│   │   ├── numberFormat.js            # Norm/Fix/Sci/Eng, exact forms, DMS
│   │   ├── naturalDisplay.js          # Expression trees for natural display
│   │   ├── equation.js, statistics.js, linearAlgebra.js, table.js
│   │   ├── baseN.js, baseNCalculator.js   # Base-N formatting and keypad logic
│   │   ├── constants.js, conversions.js, catalog.js, keys.js, modes.js
│   │   └── *.test.js                  # Unit tests
│   ├── App.jsx, main.jsx, registerSW.js, index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

All calculation logic lives in `src/lib` as plain, tested JavaScript; the components only display state and send actions. Expressions are evaluated with [math.js](https://mathjs.org/) rather than `eval`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make sure `npm run lint` and `npm test` pass
4. Commit your changes and push the branch
5. Open a pull request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Math.js](https://mathjs.org/)
