const CACHE_NAME = 'manabi-step-v6'; // バージョン必ず更新
const urlsToCache = [
  '/', '/index.html', '/app.js', '/styles.css', '/manifest.json',
  '/firebaseConfig.js', '/catalog.json',
  '/lessons/soc/modular/index_modular.html',
  '/lessons/soc/modular/home_modular.html',
  '/lessons/soc/modular/script.js',
  '/lessons/soc/modular/style.css',
  '/lessons/soc/modular/loader.js'
];

// 即時有効化
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('キャッシュを開きました:', CACHE_NAME);
    
    // 404等はスキップして続行
    await Promise.all(urlsToCache.map(async (url) => {
      try {
        console.log('キャッシュ中:', url);
        const res = await fetch(url, { cache: 'no-cache' });
        if (res && res.ok) {
          await cache.put(url, res.clone());
          console.log('✅ キャッシュ成功:', url);
        } else {
          console.warn('⚠️ レスポンスエラー:', url, res.status);
        }
      } catch (error) {
        console.warn('⚠️ キャッシュスキップ:', url, error.message);
      }
    }));
    console.log('🎉 プリキャッシュ完了');
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : undefined));
    console.log('古いキャッシュを削除完了');
    await self.clients.claim();
    console.log('Service Worker有効化完了');
  })());
});

// Firebase予約パスは何もしない（＝ブラウザ/ネットに任せる）
function isFirebaseReservedPath(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/__/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // /__/ は素通し（Firebase認証で重要）
  if (isFirebaseReservedPath(url)) {
    console.log('🔥 Firebase予約パスを素通し:', url.pathname);
    return;
  }

  // POST/PUT等はキャッシュしない
  if (req.method !== 'GET') {
    return event.respondWith(fetch(req));
  }

  // 通常リソースはキャッシュ優先＋ネットフォールバック
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        console.log('📦 キャッシュから取得:', url.pathname);
        return cached;
      }
      console.log('🌐 ネットワークから取得:', url.pathname);
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
