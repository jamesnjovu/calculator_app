# Scientific Calculator React App

A modern scientific calculator built with React, Vite, and Tailwind CSS.

![Scientific Calculator Preview](https://via.placeholder.com/600x400.png?text=Scientific+Calculator)

## Features

- **Basic Arithmetic Operations**: Addition, subtraction, multiplication, division
- **Scientific Functions**: 
  - Trigonometric functions (sin, cos, tan)
  - Logarithmic functions (log, ln)
  - Square root, reciprocal (1/x), square (x²)
  - Constants (π, e)
- **Memory Functions**: Store (MS), recall (MR), clear (MC), and to memory (M+)
- **Expression Display**: Shows the complete mathematical expression
- **Error Handling**: Gracefully handles invalid expressions
- **Responsive Design**: Works on various screen sizes

## Technologies Used

- **React**: UI library for building the calculator interface
- **Vite**: Next-generation frontend tooling for faster development
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Math.js**: Advanced math library for expression evaluation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jamesnjovu/calculator_app.git
   cd calculator_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure

I've separated the calculator code into multiple files following a modular component architecture pattern. Here's the new structure:

```
calculator-app/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ScientificCalculator.jsx     // Main component
│   │   ├── CalculatorDisplay.jsx        // Display component
│   │   ├── CalculatorButtons.jsx        // Buttons grid component
│   │   ├── CalculatorHistory.jsx        // History component
│   │   └── ThemeToggle.jsx              // Theme controls component
│   ├── hooks/
│   │   ├── useTheme.js                  // Theme management logic
│   │   └── useCalculator.js             // Calculator state & operations
│   ├── App.jsx                          // App container
│   ├── main.jsx                         // Entry point
│   └── index.css                        // Tailwind imports
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

## Component Architecture

The code has been separated into the following components and hooks:

### Components

1. **ScientificCalculator.jsx**
   - Main container component
   - Combines all sub-components
   - Manages layout and theme application

2. **CalculatorDisplay.jsx**
   - Shows current expression and result
   - Handles display formatting

3. **CalculatorButtons.jsx**
   - Contains the calculator button grid
   - Handles button rendering and styling

4. **CalculatorHistory.jsx**
   - Displays calculation history
   - Manages history item styling

5. **ThemeToggle.jsx**
   - Contains theme control buttons
   - Handles theme toggle UI

### Hooks

1. **useTheme.js**
   - Manages theme state (dark/light)
   - Handles system theme detection
   - Provides theme toggle functions

2. **useCalculator.js**
   - Manages calculator state
   - Contains all calculator logic
   - Handles operations and history

## Benefits of This Structure

- **Separation of Concerns**: Each component has a single responsibility
- **Reusability**: Components can be reused in other contexts
- **Maintainability**: Easier to update and maintain individual parts
- **Testability**: Smaller components are easier to test
- **Readability**: Code is organized and easier to understand

The application logic is separated from the UI components through the use of custom hooks, making the code more modular and following best practices for React development.

## Usage Guide

### Basic Operations
- Enter numbers using the number pad
- Use the operators (+, −, ×, ÷) for basic arithmetic
- Press = to evaluate the expression

### Scientific Functions
- Press the corresponding button for scientific functions (sin, cos, tan, etc.)
- For functions like sin, cos, etc., enter the value first, then press the function button
- Constants (π, e) can be inserted directly into your calculation

### Memory Operations
- MS: Store current value in memory
- MR: Recall value from memory
- MC: Clear memory
- M+: Add current value to memory

### Additional Features
- C: Clear the display and current expression
- ⌫: Delete the last character
- ( and ): Use parentheses for complex expressions
- x^y: Calculate x raised to the power of y

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Math.js](https://mathjs.org/)
