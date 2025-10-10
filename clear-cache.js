// Service Worker強制更新スクリプト
console.log(' Service Worker強制更新を開始...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log(' Service Worker登録を削除:', registration.scope);
      registration.unregister();
    }
    
    // キャッシュも全削除
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log(' キャッシュを削除:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✅ 全キャッシュ削除完了');
      console.log('🔄 ページをリロードします...');
      location.reload(); // 自動で最新に切替
    });
  });
}
