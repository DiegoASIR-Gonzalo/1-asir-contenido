// Service worker del HUB ASIR: solo gestiona los avisos de exámenes.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './#examenes';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.length) {
      const w = wins[0];
      await w.focus();
      w.postMessage({ type: 'open-exams' });
    } else {
      await self.clients.openWindow(url);
    }
  })());
});
