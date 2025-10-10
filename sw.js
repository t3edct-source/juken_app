const CACHE_NAME = 'manabi-step-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/firebaseConfig.js',
  '/catalog.json',
  '/lessons/soc/modular/index_modular.html',
  '/lessons/soc/modular/home_modular.html',
  '/lessons/soc/modular/script.js',
  '/lessons/soc/modular/style.css',
  '/lessons/soc/modular/loader.js'
];

// インストール時にキャッシュを作成（404を無視する堅牢版）
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('キャッシュを開きました:', CACHE_NAME);
    
    // 各URLを個別に処理し、404エラーは無視
    const requests = urlsToCache.map(async (url) => {
      try {
        console.log('キャッシュ中:', url);
        const response = await fetch(url, { cache: 'no-cache' });
        if (response && response.ok) {
          await cache.put(url, response.clone());
          console.log('✅ キャッシュ成功:', url);
        } else {
          console.warn('⚠️ レスポンスエラー:', url, response.status);
        }
      } catch (error) {
        console.warn('⚠️ キャッシュスキップ:', url, error.message);
        // 404等のエラーは無視して続行
      }
    });
    
    await Promise.all(requests);
    console.log('🎉 プリキャッシュ完了');
  })());
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
