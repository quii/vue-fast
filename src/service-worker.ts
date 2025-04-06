const CACHE_NAME = "classifications-v1";

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/data/classifications/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
