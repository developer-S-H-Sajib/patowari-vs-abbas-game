const CACHE_NAME = 'patowari-vs-abbas-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/game.js',
    './images/abbas.png',
    './images/angry.png',
    './images/patowari.png',
    './images/patowari2.png',
    './images/patowari3.png',
    './images/background.jpg',
    './audio/music.mp3',
    './audio/heartbeat.mp3',
    './audio/haha.mp3',
    './audio/abbas-sound.mp3'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
