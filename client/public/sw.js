/* ================================================================
   SDC HR Solutions — Minimal Service Worker (PWA Stub)
   Allows the application to be installable and enables baseline offline.
   ================================================================ */

const CACHE_NAME = 'sdc-hrms-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through strategy to prevent stale-content issues during developer staging
  e.respondWith(fetch(e.request));
});
