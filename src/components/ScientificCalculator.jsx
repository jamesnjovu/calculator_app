import { useCallback, useEffect, useRef, useState } from 'react';
import CalculatorDisplay from './CalculatorDisplay';
import CalculatorHistory from './CalculatorHistory';
import Header from './Header';
import Keypad from './Keypad';
import Toast from './Toast';
import { useCalculator } from '../hooks/useCalculator';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useKeyboard } from '../hooks/useKeyboard';
import { usePersistentState } from '../hooks/usePersistentState';
import { useTheme } from '../hooks/useTheme';
import { keyIdForAction } from '../lib/keys';

const vibrate = () => {
  if (navigator.vibrate && window.matchMedia('(pointer: coarse)').matches) navigator.vibrate(5);
};

const ScientificCalculator = () => {
  const { preference, cycleTheme } = useTheme();
  const { state, preview, dispatch } = useCalculator();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [scientific, setScientific] = usePersistentState('calculator-scientific', true, (value) => typeof value === 'boolean');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pressedId, setPressedId] = useState(null);
  const [toast, setToast] = useState('');
  const pressTimer = useRef();
  const toastTimer = useRef();

  useEffect(() => () => {
    clearTimeout(pressTimer.current);
    clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  }, []);

  const handleButton = (action) => {
    vibrate();
    dispatch(action);
  };

  // Keyboard input briefly highlights the matching on-screen key
  useKeyboard((action) => {
    dispatch(action);
    setPressedId(keyIdForAction(action));
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressedId(null), 120);
  }, !historyOpen);

  useEffect(() => {
    if (!historyOpen) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setHistoryOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [historyOpen]);

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value.replace(/−/g, '-'));
      showToast('Copied to clipboard');
    } catch {
      showToast("Couldn't copy");
    }
  };

  const recall = (value) => {
    dispatch({ type: 'recall', value });
    setHistoryOpen(false);
  };

  const historyProps = {
    history: state.history,
    onRecall: recall,
    onClear: () => dispatch({ type: 'clearHistory' }),
  };

  return (
    <div className="flex w-full items-stretch justify-center sm:w-auto lg:gap-6">
      <main className="relative flex h-dvh w-full flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:h-[min(860px,calc(100dvh-3rem))] sm:min-h-[560px] sm:w-[400px] sm:rounded-[2rem] sm:bg-white/80 sm:p-5 sm:shadow-2xl sm:shadow-slate-300/50 sm:ring-1 sm:ring-slate-200 sm:backdrop-blur dark:sm:bg-slate-900/80 dark:sm:shadow-black/40 dark:sm:ring-slate-800">
        <h1 className="sr-only">Scientific Calculator</h1>
        <Header
          scientific={scientific}
          onModeChange={setScientific}
          themePreference={preference}
          onCycleTheme={cycleTheme}
          onOpenHistory={() => setHistoryOpen(true)}
          canInstall={canInstall}
          onInstall={promptInstall}
        />

        <div className="flex flex-1 flex-col justify-end">
          <CalculatorDisplay
            state={state}
            preview={preview}
            scientific={scientific}
            onToggleAngleMode={() => dispatch({ type: 'toggleAngleMode' })}
            onCopy={copyToClipboard}
          />
        </div>

        <div className={`flex min-h-0 shrink flex-col ${scientific ? 'basis-[66%]' : 'basis-[60%]'}`}>
          <Keypad
            scientific={scientific}
            hasMemory={state.memory !== null}
            pressedId={pressedId}
            onPress={handleButton}
          />
        </div>

        {historyOpen && (
          <div className="absolute inset-x-0 bottom-0 top-16 z-10 flex flex-col rounded-t-3xl bg-slate-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] motion-safe:animate-slide-up sm:rounded-b-[2rem] lg:hidden dark:bg-slate-900">
            <CalculatorHistory {...historyProps} onClose={() => setHistoryOpen(false)} className="flex-1" />
          </div>
        )}
      </main>

      <aside className="hidden w-80 flex-col rounded-[2rem] bg-white/60 p-5 ring-1 ring-slate-200 backdrop-blur lg:flex dark:bg-slate-900/60 dark:ring-slate-800">
        <CalculatorHistory {...historyProps} className="flex-1" />
      </aside>

      <Toast message={toast} />
    </div>
  );
};

export default ScientificCalculator;
