import { useEffect, useState } from 'react'
import ScientificCalculator from './components/ScientificCalculator'
import { setupInstallPrompt } from './registerSW'

function App() {
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Setup install prompt handling
    setupInstallPrompt();

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    } else {
      setShowInstallButton(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
      <ScientificCalculator />

      {showInstallButton && (
        <button
          id="install-button"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          style={{ display: 'none' }}
        >
          Install Calculator App
        </button>
      )}
    </div>
  )
}

export default App
