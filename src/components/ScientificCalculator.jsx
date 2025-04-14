import CalculatorDisplay from './CalculatorDisplay';
import CalculatorButtons from './CalculatorButtons';
import CalculatorHistory from './CalculatorHistory';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { useCalculator } from '../hooks/useCalculator';

const ScientificCalculator = () => {
  const {
    darkMode,
    isSystemTheme,
    toggleTheme,
    useSystemTheme
  } = useTheme();

  const {
    display,
    expression,
    expressionHistory,
    handleNumberClick,
    handleOperatorClick,
    handleEquals,
    handleClear,
    handleDecimal,
    handleBackspace,
    handleScientificFunction,
    handleMemoryStore,
    handleMemoryRecall,
    handleMemoryClear,
    handleMemoryAdd,
    clearHistory
  } = useCalculator();

  // Theme-based classes
  const calculatorClass = darkMode
    ? "bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
    : "bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200";

  return (
    <div className="flex flex-col justify-center w-full items-center min-h-screen pt-8 transition-colors duration-300"
      style={{ background: darkMode ? '#1a1a2e' : '#f0f2f5' }}>
      <div className="relative mb-4 max-w-md w-full px-4">
        <ThemeToggle
          darkMode={darkMode}
          isSystemTheme={isSystemTheme}
          toggleTheme={toggleTheme}
          useSystemTheme={useSystemTheme}
        />

        <div className={calculatorClass}>
          <CalculatorDisplay
            display={display}
            expression={expression}
            darkMode={darkMode}
          />

          <CalculatorButtons
            darkMode={darkMode}
            handleNumberClick={handleNumberClick}
            handleOperatorClick={handleOperatorClick}
            handleEquals={handleEquals}
            handleClear={handleClear}
            handleDecimal={handleDecimal}
            handleBackspace={handleBackspace}
            handleScientificFunction={handleScientificFunction}
            handleMemoryStore={handleMemoryStore}
            handleMemoryRecall={handleMemoryRecall}
            handleMemoryClear={handleMemoryClear}
            handleMemoryAdd={handleMemoryAdd}
          />

          {/* Expression History Section */}
          {expressionHistory.length > 0 && (
            <CalculatorHistory
              history={expressionHistory}
              darkMode={darkMode}
              clearHistory={clearHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
