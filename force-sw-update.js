// Service Worker強制更新スクリプト
console.log('🔄 Service Worker強制更新開始');

// 既存のService Workerを全て削除
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🔍 登録済みService Worker:', registrations.length);
    
    // 全てのService Workerを削除
    for(let registration of registrations) {
      console.log('🗑️ Service Worker削除:', registration.scope);
      registration.unregister();
    }
    
    // 全キャッシュを削除
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        console.log('🔍 キャッシュ名一覧:', cacheNames);
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🗑️ キャッシュ削除:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('✅ 全キャッシュ削除完了');
        
        // ページをリロード
        console.log('🔄 ページリロード実行');
        setTimeout(function() {
          window.location.reload(true);
        }, 1000);
      });
    }
  });
}

console.log('🔄 Service Worker強制更新完了');
