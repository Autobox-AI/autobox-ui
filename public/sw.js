const CACHE_NAME = 'autobox-v1'
const STATIC_CACHE = 'autobox-static-v1'
const API_CACHE = 'autobox-api-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/assets/autobox-logo.png',
  '/assets/autobox-projects.webp',
  '/assets/autobox-examples.webp',
  '/assets/autobox-usage.webp',
  '/assets/autobox-documentation.webp',
  '/favicon.ico',
]

// API endpoints to cache
const API_ENDPOINTS = ['/api/organizations']

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE).then((cache) => cache.addAll(API_ENDPOINTS)),
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName.startsWith('autobox-')
            )
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (url.pathname.startsWith('/assets/') || url.pathname === '/') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Handle other requests with network-first strategy
  event.respondWith(handleOtherRequest(request))
})

async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response
    return new Response(JSON.stringify({ error: 'Offline - No cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handleStaticRequest(request) {
  // Try cache first for static assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    // Fallback to network
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/')
    }
    throw error
  }
}

async function handleOtherRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    return response
  } catch (error) {
    // Fallback to cache if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle any pending offline actions
  console.log('Background sync triggered')
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Autobox',
    icon: '/assets/autobox-logo.png',
    badge: '/assets/autobox-logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification('Autobox', options))
})
