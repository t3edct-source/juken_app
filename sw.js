const CACHE_NAME = 'manabi-step-v29'; // バージョン必ず更新（PWA完全対応版）
const urlsToCache = [
  // コアファイル
  '/', '/index.html', '/app.js', '/styles.css', '/manifest.json',
  '/firebaseConfig.js', '/catalog.json',
  '/data/encouragement-messages.json',
  
  // アイコン
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  
  // 社会レッスン（モジュール形式）
  '/lessons/soc/modular/index_modular.html',
  '/lessons/soc/modular/home_modular.html',
  '/lessons/soc/modular/script.js',
  '/lessons/soc/modular/style.css',
  '/lessons/soc/modular/loader.js',
  '/lessons/soc/modular/wakaru/index_modular.html',
  '/lessons/soc/modular/wakaru/script.js',
  '/lessons/soc/modular/wakaru/style.css',
  '/lessons/soc/modular/wakaru/loader.js',
  '/lessons/soc/modular/oboeru/index_modular.html',
  '/lessons/soc/modular/oboeru/script.js',
  '/lessons/soc/modular/oboeru/style.css',
  '/lessons/soc/modular/oboeru/loader.js',
  '/lessons/soc/modular/common-home-button.js',
  
  // 理科レッスン（モジュール形式）
  '/lessons/sci/modular/wakaru/index_modular.html',
  '/lessons/sci/modular/wakaru/script.js',
  '/lessons/sci/modular/wakaru/style.css',
  '/lessons/sci/modular/wakaru/loader.js',
  '/lessons/sci/modular/oboeru/index_modular.html',
  '/lessons/sci/modular/oboeru/script.js',
  '/lessons/sci/modular/oboeru/style.css',
  '/lessons/sci/modular/oboeru/loader.js',
  
  // オフラインページ
  '/offline.html'
];

// 即時有効化
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker v29 インストール開始（PWA完全対応版）');
  event.waitUntil((async () => {
    // 全ての古いキャッシュを削除
    const cacheNames = await caches.keys();
    console.log('🔍 既存キャッシュ:', cacheNames);
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ 古いキャッシュを削除:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    const cache = await caches.open(CACHE_NAME);
    console.log('✅ キャッシュを開きました:', CACHE_NAME);
    
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
  console.log('🔄 Service Worker v29 アクティベート開始（PWA完全対応版）');
  event.waitUntil((async () => {
    // 全ての古いキャッシュを削除
    const keys = await caches.keys();
    console.log('🔍 既存キャッシュキー:', keys);
    await Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) {
        console.log('🗑️ 古いキャッシュを削除:', k);
        return caches.delete(k);
      }
    }));
    console.log('✅ 古いキャッシュを削除完了');
    
    // 全てのクライアントを制御
    await self.clients.claim();
    console.log('✅ Service Worker v29 有効化完了（PWA完全対応版）');
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
        if (!res || res.status !== 200 || res.type !== 'basic') {
          // ネットワークエラー時はオフラインページを返す（HTMLリクエストの場合）
          if (req.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
          return res;
        }
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch((error) => {
        console.error('❌ ネットワークエラー:', error);
        // HTMLリクエストの場合はオフラインページを返す
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
        // その他のリソースはエラーを返す
        return new Response('オフラインです', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
