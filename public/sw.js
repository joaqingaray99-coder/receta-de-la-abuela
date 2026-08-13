// Service worker mínimo: solo habilita que la app sea instalable.
// No cachea nada para evitar que el usuario vea contenido viejo.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
