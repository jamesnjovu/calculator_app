import { useCallback, useEffect, useRef, useState } from 'react';
import CalculatorDisplay from './CalculatorDisplay';
import CalculatorHistory from './CalculatorHistory';
import CatalogPanel from './CatalogPanel';
import Header from './Header';
import Keypad from './Keypad';
import ModeMenu from './ModeMenu';
import SettingsPanel from './SettingsPanel';
import Toast from './Toast';
import VariablesPanel from './VariablesPanel';
import BaseNMode from './modes/BaseNMode';
import EquationMode from './modes/EquationMode';
import MatrixMode from './modes/MatrixMode';
import StatisticsMode from './modes/StatisticsMode';
import TableMode from './modes/TableMode';
import VectorMode from './modes/VectorMode';
import { useCalculator } from '../hooks/useCalculator';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useKeyboard } from '../hooks/useKeyboard';
import { usePersistentState } from '../hooks/usePersistentState';
import { useTheme } from '../hooks/useTheme';
import { formatValue } from '../lib/calculator';
import { buildScope } from '../lib/engine';
import { keyIdForAction } from '../lib/keys';
import { MODES, modeById } from '../lib/modes';
import { formatDecimal } from '../lib/numberFormat';
import { loadJSON } from '../lib/storage';

const MODE_SCREENS = {
  STAT: StatisticsMode,
  BASEN: BaseNMode,
  EQN: EquationMode,
  MATRIX: MatrixMode,
  TABLE: TableMode,
  VECTOR: VectorMode,
};

const KEYPAD_LAYOUTS = { BASIC: 'basic', COMP: 'comp', CMPLX: 'complex' };

const vibrate = () => {
  if (navigator.vibrate && window.matchMedia('(pointer: coarse)').matches) navigator.vibrate(5);
};

// Earlier versions stored a Basic/Scientific switch
const defaultMode = () => (loadJSON('calculator-scientific', true) === false ? 'BASIC' : 'COMP');

const ScientificCalculator = () => {
  const { preference, cycleTheme } = useTheme();
  const { state, preview, dispatch } = useCalculator();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [modeId, setModeId] = usePersistentState('calculator-ui-mode', defaultMode(), (value) => MODES.some((mode) => mode.id === value));
  const [panel, setPanel] = useState(null);
  const [modifiers, setModifiers] = useState({ shift: false, hyp: false });
  const [pressedId, setPressedId] = useState(null);
  const [toast, setToast] = useState('');
  const pressTimer = useRef();
  const toastTimer = useRef();

  const mode = modeById(modeId);
  const isCalculator = Boolean(mode.engine);
  const ModeScreen = MODE_SCREENS[mode.id];

  // Keep the calculation engine in the matching mode (COMP or CMPLX)
  useEffect(() => {
    if (mode.engine && mode.engine !== state.mode) dispatch({ type: 'setMode', value: mode.engine });
  }, [mode.engine, state.mode, dispatch]);

  useEffect(() => () => {
    clearTimeout(pressTimer.current);
    clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  // The other panels close themselves on Escape (see Sheet)
  useEffect(() => {
    if (panel !== 'history') return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setPanel(null);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [panel]);

  const runAction = (action) => {
    if (Array.isArray(action)) {
      action.forEach(runAction);
      return;
    }
    if (action.type === 'ui') {
      if (action.value === 'shift') setModifiers((current) => ({ ...current, shift: !current.shift }));
      if (action.value === 'hyp') setModifiers((current) => ({ ...current, hyp: !current.hyp }));
      if (action.value === 'variables') setPanel('variables');
      return;
    }
    dispatch(action);
    // SHIFT and hyp apply to one key press, like on the real calculator
    setModifiers({ shift: false, hyp: false });
  };

  const handleButton = (action) => {
    vibrate();
    runAction(action);
  };

  // Keyboard input briefly highlights the matching on-screen key
  useKeyboard((action) => {
    dispatch(action);
    setPressedId(keyIdForAction(action));
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressedId(null), 120);
  }, isCalculator && panel === null);

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value.replace(/−/g, '-'));
      showToast('Copied to clipboard');
    } catch {
      showToast("Couldn't copy");
    }
  };

  const recall = (item) => {
    const value = item.value ?? Number(String(item.result).replace(/−/g, '-'));
    if (typeof value === 'number' && !Number.isFinite(value)) return;
    if (!isCalculator) setModeId(state.mode === 'CMPLX' ? 'CMPLX' : 'COMP');
    dispatch({ type: 'recall', value });
    setPanel(null);
  };

  const selectMode = (id) => {
    setModeId(id);
    setModifiers({ shift: false, hyp: false });
    setPanel(null);
  };

  const insertFromCatalog = (item) => {
    dispatch(item.operand ? { type: 'insertOperand', value: item.value ?? item.token } : { type: 'insert', value: item.token });
    setPanel(null);
  };

  const storeVariable = (name) => {
    dispatch({ type: 'store', value: name });
    showToast(`Stored in ${name}`);
  };

  const format = useCallback((value) => formatDecimal(value, state.settings.numberFormat), [state.settings.numberFormat]);
  const formatAny = useCallback((value) => formatValue(value, state.settings), [state.settings]);

  const historyProps = {
    history: state.history,
    onRecall: recall,
    onClear: () => dispatch({ type: 'clearHistory' }),
  };

  const canStore = state.justEvaluated || Boolean(preview) || /^\d+(\.\d+)?$/.test(state.input);

  return (
    <div className="flex w-full items-stretch justify-center sm:w-auto lg:gap-6">
      <main className="relative flex h-dvh w-full flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:h-[min(900px,calc(100dvh-3rem))] sm:min-h-[600px] sm:w-[420px] sm:rounded-[2rem] sm:bg-white/80 sm:p-5 sm:shadow-2xl sm:shadow-slate-300/50 sm:ring-1 sm:ring-slate-200 sm:backdrop-blur dark:sm:bg-slate-900/80 dark:sm:shadow-black/40 dark:sm:ring-slate-800">
        <h1 className="sr-only">Scientific Calculator</h1>
        <Header
          modeName={mode.name}
          onOpenMode={() => setPanel('mode')}
          onOpenCatalog={mode.id === 'COMP' || mode.id === 'CMPLX' ? () => setPanel('catalog') : null}
          onOpenSettings={() => setPanel('settings')}
          onOpenHistory={isCalculator ? () => setPanel('history') : null}
          themePreference={preference}
          onCycleTheme={cycleTheme}
          canInstall={canInstall}
          onInstall={promptInstall}
        />

        {isCalculator ? (
          <>
            <div className="flex flex-1 flex-col justify-end">
              <CalculatorDisplay
                state={state}
                preview={preview}
                showIndicators={mode.id !== 'BASIC'}
                modifiers={modifiers}
                onToggleAngleMode={() => dispatch({ type: 'toggleAngleMode' })}
                onCopy={copyToClipboard}
              />
            </div>
            <div className={`flex min-h-0 shrink flex-col ${{ BASIC: 'basis-[60%]', COMP: 'basis-[70%]', CMPLX: 'basis-[68%]' }[mode.id]}`}>
              <Keypad
                layout={KEYPAD_LAYOUTS[mode.id]}
                modifiers={modifiers}
                hasMemory={state.memory !== null}
                pressedId={pressedId}
                onPress={handleButton}
              />
            </div>
          </>
        ) : (
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2 pt-1">
            <ModeScreen settings={state.settings} format={format} formatComplex={formatAny} scope={buildScope(state)} />
          </div>
        )}

        {panel === 'history' && (
          <div className="absolute inset-x-0 bottom-0 top-16 z-20 flex flex-col rounded-t-3xl bg-slate-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] motion-safe:animate-slide-up sm:rounded-b-[2rem] lg:hidden dark:bg-slate-900">
            <CalculatorHistory {...historyProps} onClose={closePanel} className="flex-1" />
          </div>
        )}
        {panel === 'mode' && <ModeMenu current={mode.id} onSelect={selectMode} onClose={closePanel} />}
        {panel === 'catalog' && <CatalogPanel complexMode={mode.id === 'CMPLX'} onInsert={insertFromCatalog} onClose={closePanel} />}
        {panel === 'settings' && (
          <SettingsPanel
            settings={state.settings}
            complexMode={mode.id === 'CMPLX'}
            onChange={(key, value) => dispatch({ type: 'setSetting', key, value })}
            onClose={closePanel}
          />
        )}
        {panel === 'variables' && (
          <VariablesPanel
            variables={state.variables}
            memory={state.memory}
            format={format}
            canStore={canStore}
            onInsert={(name) => {
              dispatch({ type: 'insert', value: name });
              closePanel();
            }}
            onStore={storeVariable}
            onClearAll={() => dispatch({ type: 'clearVariables' })}
            onClose={closePanel}
          />
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
