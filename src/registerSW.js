// Service Worker Registration
export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${import.meta.env.BASE_URL}sw.js`;

            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed: ', error);
                });
        });
    }
};

// Check if app can be installed
export const setupInstallPrompt = () => {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();

        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show the install button or notification to the user
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'block';

            installButton.addEventListener('click', () => {
                // Show the install prompt
                deferredPrompt.prompt();

                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }

                    // Clear the saved prompt since it can't be used again
                    deferredPrompt = null;

                    // Hide the install button
                    installButton.style.display = 'none';
                });
            });
        }
    });
};
