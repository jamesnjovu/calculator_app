// Service Worker for Scientific Calculator PWA
const CACHE_NAME = 'calculator-app-v1';

// Files to cache for offline use
const urlsToCache = [
    '/calculator_app/',
    '/calculator_app/index.html',
    '/calculator_app/assets/index.css',
    '/calculator_app/assets/index.js',
    '/calculator_app/manifest.json',
    '/calculator_app/icons/icon-192x192.svg',
    '/calculator_app/icons/icon-512x512.svg'
];

// Install event - caches app resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        // Return the response directly if not a valid response to cache
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response since it's a stream that can only be consumed once
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            }).catch(() => {
                // If both cache and network fail, you might want to show a generic offline page
                // For simplicity, we're not doing that here
            })
    );
});
