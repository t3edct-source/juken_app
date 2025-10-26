// 強力なキャッシュクリアスクリプト
console.log('🧹 強力なキャッシュクリアスクリプト実行開始');

// 1. Service Workerの強制登録解除
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🔍 登録済みService Worker:', registrations.length);
    for(let registration of registrations) {
      console.log('🗑️ Service Worker登録解除:', registration.scope);
      registration.unregister();
    }
  });
}

// 2. 全キャッシュの強制削除
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

// 3. 全ストレージの強制クリア
console.log('🗑️ 全ストレージクリア開始');

// localStorage
try {
  localStorage.clear();
  console.log('✅ localStorageクリア完了');
} catch (e) {
  console.error('❌ localStorageクリアエラー:', e);
}

// sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ sessionStorageクリア完了');
} catch (e) {
  console.error('❌ sessionStorageクリアエラー:', e);
}

// IndexedDB
if ('indexedDB' in window) {
  try {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
        console.log('🗑️ IndexedDB削除:', db.name);
      });
    });
  } catch (e) {
    console.error('❌ IndexedDBクリアエラー:', e);
  }
}

// 4. キャッシュ無効化付きリロード
console.log('🔄 キャッシュ無効化付きリロード実行');
setTimeout(function() {
  // 複数の方法でキャッシュを無効化
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const cacheBuster = `?v=${timestamp}&r=${randomId}&cb=${Math.random()}`;
  
  console.log('🔧 キャッシュバスター:', cacheBuster);
  
  // 強制的にキャッシュを無効化してリロード
  window.location.replace(window.location.origin + window.location.pathname + cacheBuster);
}, 1000);

console.log('🧹 強力なキャッシュクリアスクリプト実行完了');
