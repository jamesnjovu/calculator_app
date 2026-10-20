// Service Worker for Scientific Calculator PWA
// Bump the version to discard caches from previous releases.
const CACHE_NAME = 'calculator-app-v5';

// Resolved relative to the service worker's scope, so it works under any base path
const scopeUrl = (path) => new URL(path, self.registration.scope).toString();

const PRECACHE_URLS = [
    './',
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png',
    'icons/icon-192x192.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS.map(scopeUrl)))
            .then(() => self.skipWaiting())
    );
});

// Remove caches left by older versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

const putInCache = (request, response) => {
    if (response && response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    // Pages: network first so new releases show up, cached shell when offline
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => putInCache(scopeUrl('./'), response))
                .catch(() => caches.match(scopeUrl('./')))
        );
        return;
    }

    // Static assets have hashed file names, so a cached copy is always valid
    event.respondWith(
        caches.match(request).then((cached) =>
            cached || fetch(request).then((response) => putInCache(request, response))
        )
    );
});
