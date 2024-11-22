import { precacheAndRoute } from "workbox-precaching";

// Precache all the assets during installation
precacheAndRoute(self.__WB_MANIFEST);

// Fallback to the cache when offline
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
