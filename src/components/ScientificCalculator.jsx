import CalculatorDisplay from './CalculatorDisplay';
import CalculatorButtons from './CalculatorButtons';
import CalculatorHistory from './CalculatorHistory';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { useCalculator } from '../hooks/useCalculator';

const ScientificCalculator = () => {
  const theme = useTheme();
  const { state, preview, dispatch } = useCalculator();

  return (
    <div className="w-full max-w-md px-4">
      <ThemeToggle {...theme} />

      <main className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="sr-only">Scientific Calculator</h1>
        <CalculatorDisplay
          state={state}
          preview={preview}
          onToggleAngleMode={() => dispatch({ type: 'toggleAngleMode' })}
        />

        <CalculatorButtons dispatch={dispatch} />

        {state.history.length > 0 && (
          <CalculatorHistory
            history={state.history}
            onRecall={(value) => dispatch({ type: 'recall', value })}
            onClear={() => dispatch({ type: 'clearHistory' })}
          />
        )}
      </main>
    </div>
  );
};

export default ScientificCalculator;
