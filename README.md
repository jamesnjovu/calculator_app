# Scientific Calculator

A modern scientific calculator built with React, Vite and Tailwind CSS. It installs as a Progressive Web App and works offline.

**Live demo:** https://jamesnjovu.github.io/calculator_app/

[![CI and Deploy](https://github.com/jamesnjovu/calculator_app/actions/workflows/deploy.yml/badge.svg)](https://github.com/jamesnjovu/calculator_app/actions/workflows/deploy.yml)

## Features

- **Basic and Scientific modes**: a clean number pad, or the full set of scientific keys
- **Arithmetic** with correct operator precedence: `+`, `−`, `×`, `÷`, powers (`xʸ`) and parentheses
- **Scientific functions**: `sin`, `cos`, `tan`, `log`, `ln`, `√`, `x²`, `1/x`, `|x|`, `n!`, constants `π` and `e`
- **Degree / radian mode**: tap `DEG` / `RAD` in the display to switch
- **Readable display**: live result preview, coloured operators, faded auto-closing parentheses and text that shrinks to fit long numbers
- **Clear error messages** such as "Can't divide by zero" or "Incomplete expression"
- **Copy** the result to the clipboard with one tap
- **Memory**: `MS` (store), `MR` (recall), `M+`, `M−`, `MC` (clear), with the stored value shown in the display
- **Ans** inserts the previous result; `±` toggles the sign of the current number
- **History**: a side panel on large screens and a slide-up sheet on phones; tap an entry to reuse its result
- **Keyboard support** with on-screen key highlighting (see below)
- **Responsive layout**: full-screen keypad on phones, card layout on tablets and desktops
- **Light, dark and system themes**
- **Saved between visits**: mode, theme, angle unit, memory and history
- **Installable PWA** that works offline

## Usage

Type an expression and press `=`. Functions such as `sin` open a parenthesis (`sin(`); missing closing parentheses are added automatically when you evaluate. Pressing an operator right after a result continues from that result; typing a number starts a new calculation.

Invalid operations (division by zero, `√` of a negative number, `tan(90°)` and so on) show `Error`. The next key press clears it.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0`–`9`, `.` | Digits and decimal point |
| `+` `-` `*` `/` `^` | Operators |
| `(` `)` | Parentheses |
| `!` | Factorial |
| `p`, `e` | π and e |
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
├── public/
│   ├── icons/                     # App icons (SVG and PNG)
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker (offline support)
├── src/
│   ├── components/
│   │   ├── ScientificCalculator.jsx   # Main layout
│   │   ├── Header.jsx                 # Mode switch, history, theme and install buttons
│   │   ├── CalculatorDisplay.jsx      # Expression, result, DEG/RAD and memory indicator
│   │   ├── Keypad.jsx                 # Memory, scientific and number keys
│   │   ├── CalculatorHistory.jsx      # Calculation history
│   │   ├── Toast.jsx                  # Short confirmations
│   │   └── Icons.jsx                  # Inline SVG icons
│   ├── hooks/
│   │   ├── useCalculator.js           # Calculator state and persistence
│   │   ├── useKeyboard.js             # Keyboard input
│   │   ├── usePersistentState.js      # State saved to localStorage
│   │   ├── useInstallPrompt.js        # PWA install button
│   │   └── useTheme.js                # Light, dark and system theme
│   ├── lib/
│   │   ├── calculator.js              # Calculator logic (pure reducer)
│   │   ├── calculator.test.js         # Unit tests
│   │   ├── keys.js                    # Key layout and keyboard mapping
│   │   └── storage.js                 # Safe localStorage helpers
│   ├── App.jsx
│   ├── main.jsx
│   ├── registerSW.js
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

All calculator behaviour lives in `src/lib/calculator.js` as a pure reducer, which keeps the UI components simple and makes the logic easy to test. Expressions are evaluated with [math.js](https://mathjs.org/) rather than `eval`.

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
