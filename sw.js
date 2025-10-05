const CACHE_NAME = 'dream-catcher-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/metadata.json',
  '/vite.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',

  '/index.tsx',
  '/App.tsx',
  '/MainApp.tsx',
  '/types.ts',
  '/constants.ts',

  'context/AuthContext.tsx',
  'context/ContextMenuContext.tsx',
  'context/DreamContext.tsx',
  'context/ModalContext.tsx',
  'context/SettingsContext.tsx',
  'context/ToastContext.tsx',

  'hooks/useSpeechSynthesis.ts',
  'hooks/useLocalStorage.ts',
  
  'services/geminiService.ts',
  'services/virtualFs.ts',

  'utils/audio.ts',
  'utils/celestial.ts',
  'utils/gamification.ts',
  'utils/numerology.ts',
  'utils/quests.ts',
  'utils/streaks.ts',

  'components/AboutModal.tsx',
  'components/AchievementCard.tsx',
  'components/Auth.tsx',
  'components/AudioScape.tsx',
  'components/AudioScapePlayer.tsx',
  'components/Calendar.tsx',
  'components/Celestial.tsx',
  'components/ConnectionSuggestionsModal.tsx',
  'components/ContextMenu.tsx',
  'components/Dashboard.tsx',
  'components/DailyQuestsWidget.tsx',
  'components/Divination.tsx',
  'components/DreamCard.tsx',
  'components/DreamChat.tsx',
  'components/DreamCircle.tsx',
  'components/DreamComparisonModal.tsx',
  'components/DreamDetail.tsx',
  'components/DreamList.tsx',
  'components/DreamOfTheDay.tsx',
  'components/DreamScape.tsx',
  'components/DreamWeaveModal.tsx',
  'components/DreamWeb.tsx',
  'components/EchoChamber.tsx',
  'components/EditDreamModal.tsx',
  'components/EditImageModal.tsx',
  'components/EditTotemModal.tsx',
  'components/FloatingActionButton.tsx',
  'components/GenerateImageModal.tsx',
  'components/GlobalSearch.tsx',
  'components/GoogleSignInButton.tsx',
  'components/Guide.tsx',
  'components/Horoscope.tsx',
  'components/Incubation.tsx',
  'components/IncubationSessionModal.tsx',
  'components/IncubationSetupModal.tsx',
  'components/LinkDreamsModal.tsx',
  'components/LinkResolutionDreamModal.tsx',
  'components/LoadingSpinner.tsx',
  'components/Login.tsx',
  'components/MindMapModal.tsx',
  'components/MobileNav.tsx',
  'components/MoodChart.tsx',
  'components/MoodTrendChart.tsx',
  'components/NewDreamModal.tsx',
  'components/Numerology.tsx',
  'components/Odyssey.tsx',
  'components/OfflineIndicator.tsx',
  'components/Onboarding.tsx',
  'components/Oneirogen.tsx',
  'components/Oracle.tsx',
  'components/Path.tsx',
  'components/PatternAnalysisModal.tsx',
  'components/PsycheProfiler.tsx',
  'components/QuickMemoModal.tsx',
  'components/ReadingDetailModal.tsx',
  'components/RemixDreamModal.tsx',
  'components/Series.tsx',
  'components/SessionDetailModal.tsx',
  'components/Settings.tsx',
  'components/ShareDreamModal.tsx',
  'components/SharedDreamCard.tsx',
  'components/Sidebar.tsx',
  'components/Signup.tsx',
  'components/SleepSessionModal.tsx',
  'components/Somniloquy.tsx',
  'components/SplashScreen.tsx',
  'components/Store.tsx',
  'components/StreakCard.tsx',
  'components/SymbolEditModal.tsx',
  'components/SymbolInterpretationModal.tsx',
  'components/SynthesisReportModal.tsx',
  'components/TagCloud.tsx',
  'components/Toast.tsx',
  'components/ToastContainer.tsx',
  'components/TotemCard.tsx',
  'components/TotemDetailModal.tsx',
  'components/UpgradeModal.tsx',
  'components/UpgradePromptModal.tsx',
  'components/Vault.tsx',
  'components/VideoGenerationModal.tsx',
  'components/Welcome.tsx',
  'components/icons/index.tsx',

  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/@google/genai@^1.20.0',
  'https://aistudiocdn.com/react@^19.1.1/',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/',
  'https://aistudiocdn.com/recharts@^2.12.7',
  'https://cdn.jsdelivr.net/npm/d3@^7.9.0/+esm',
];

const API_HOSTS = ['generativelanguage.googleapis.com'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Network-only for API calls. Let client-side handle offline state.
    if (API_HOSTS.some(host => url.hostname.includes(host))) {
        event.respondWith(fetch(request));
        return;
    }

    // Stale-while-revalidate strategy for all other requests.
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(request).then(response => {
                const fetchPromise = fetch(request).then(networkResponse => {
                    // If the fetch is successful, update the cache.
                    // Only cache GET requests.
                    // Allow basic (same-origin), cors, and opaque (cross-origin without CORS) responses.
                    if (
                        request.method === 'GET' &&
                        networkResponse &&
                        (networkResponse.ok || networkResponse.type === 'opaque')
                    ) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('Service Worker fetch failed:', error);
                    // If we are here, it means the network failed.
                    // If we don't have a cached response, the promise will reject,
                    // and the browser will show its default offline error.
                    // This is acceptable for assets, but for navigation, we could fall back to the root.
                    if (request.mode === 'navigate' && !response) {
                        return caches.match('/');
                    }
                    // Re-throw if we can't handle it, so the browser does its thing.
                    if(!response) throw error;
                });

                // Return the cached response if it exists, otherwise wait for the network.
                return response || fetchPromise;
            });
        })
    );
});