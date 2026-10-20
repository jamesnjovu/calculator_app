// Registers the service worker in production builds only; in development it
// would cache modules and interfere with hot reloading.
export const registerServiceWorker = () => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .catch((error) => console.error('Service worker registration failed:', error));
    });
};
