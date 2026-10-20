import ScientificCalculator from './components/ScientificCalculator'
import { useInstallPrompt } from './hooks/useInstallPrompt'

function App() {
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-8 transition-colors duration-300">
      <ScientificCalculator />

      {canInstall && (
        <button
          type="button"
          onClick={promptInstall}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
        >
          Install Calculator App
        </button>
      )}
    </div>
  )
}

export default App
