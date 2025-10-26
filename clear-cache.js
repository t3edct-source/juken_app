// キャッシュクリアスクリプト
console.log('🧹 キャッシュクリアスクリプト実行開始');

// 1. Service Workerの登録解除
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🔍 登録済みService Worker:', registrations.length);
    for(let registration of registrations) {
      console.log('🗑️ Service Worker登録解除:', registration.scope);
      registration.unregister();
    }
  });
}

// 2. キャッシュストレージのクリア
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
  });
}

// 3. localStorageのクリア
console.log('🗑️ localStorageクリア開始');
localStorage.clear();
console.log('✅ localStorageクリア完了');

// 4. sessionStorageのクリア
console.log('🗑️ sessionStorageクリア開始');
sessionStorage.clear();
console.log('✅ sessionStorageクリア完了');

// 5. ページリロード
console.log('🔄 ページリロード実行');
setTimeout(function() {
  window.location.reload(true);
}, 1000);

console.log('🧹 キャッシュクリアスクリプト実行完了');