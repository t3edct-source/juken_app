const CACHE_NAME = 'manabi-step-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/lessons/math/g5/seisusyousu1/output.html',
  '/lessons/math/g5/seisusyousu1/script.js',
  '/lessons/math/g5/seisusyousu1/style.css',
  '/lessons/soc/modular/index_modular.html',
  '/lessons/soc/modular/home_modular.html',
  '/lessons/soc/modular/script.js',
  '/lessons/soc/modular/style.css',
  '/lessons/soc/modular/loader.js'
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時にキャッシュから取得
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュに存在する場合はキャッシュから返す
        if (response) {
          return response;
        }
        
        // キャッシュに存在しない場合はネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // 有効なレスポンスでない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
