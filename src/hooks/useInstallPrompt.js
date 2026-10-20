import { useEffect, useState } from 'react';

// Captures the browser's install prompt so the app can offer its own button.
export const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstall = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };
        const handleInstalled = () => setDeferredPrompt(null);

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        // A prompt can only be used once
        setDeferredPrompt(null);
    };

    return { canInstall: deferredPrompt !== null, promptInstall };
};
