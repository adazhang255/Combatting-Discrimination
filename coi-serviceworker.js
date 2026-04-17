/**
 * COI Service Worker for Cross-Origin Isolation
 * Required for SharedArrayBuffer support (needed for WebGPU and high-performance AI)
 * 
 * This allows the page to use SharedArrayBuffer for better performance in workers.
 * On GitHub Pages, this is necessary to get the isolation headers.
 * 
 * Adapted from https://github.com/gzuidhof/coi-serviceworker
 */

if (typeof window === 'undefined') {
  // Service Worker scope
  addEventListener("install", () => skipWaiting());
  addEventListener("activate", () => clients.claim());

  addEventListener("fetch", function (event) {
    const request = event.request;
    const url = new URL(request.url);

    if (url.origin !== location.origin) {
      return; // Skip cross-origin requests
    }

    // Add cross-origin isolation headers
    event.respondWith(
      fetch(request).then((response) => {
        if (!response) return response;

        // Clone the response to modify headers
        const newResponse = response.clone();
        
        // Check if we can modify headers (some responses don't allow it)
        const headers = new Headers(newResponse.headers);
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");

        // Return response with new headers
        return new Response(newResponse.body, {
          status: newResponse.status,
          statusText: newResponse.statusText,
          headers: headers,
        });
      })
    );
  });
} else if (window.crossOriginIsolated !== true) {
  // Page scope - register the service worker
  navigator.serviceWorker.register(window.document.currentScript.src).catch(
    (err) => {
      console.warn('COI Service Worker registration failed:', err);
      console.log('WebGPU features may not work optimally.');
    }
  );
}
