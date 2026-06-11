// Service worker – umožní instalaci PWA na plochu a běh offline.
const CACHE = 'spotify-stats-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => { self.clients.claim(); });

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Přihlášení a data ze Spotify nikdy necachujeme
  if (url.includes('api.spotify.com') || url.includes('accounts.spotify.com')) return;
  // Síť napřed (ať máš vždy aktuální verzi), offline → z cache
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
