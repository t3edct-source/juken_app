// Firebase認証テスト用スクリプト
console.log('🔍 Firebase認証設定をテスト中...');

// 1. authDomainの確認
if (window.firebaseAuth) {
  console.log('✅ firebaseAuth オブジェクトが存在');
  console.log('🔧 authDomain:', window.firebaseAuth.auth?.app?.options?.authDomain);
} else {
  console.error('❌ firebaseAuth オブジェクトが見つかりません');
}

// 2. Service Workerの状態確認
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📋 Service Worker登録数:', registrations.length);
    registrations.forEach((reg, index) => {
      console.log(`SW${index + 1}:`, reg.scope);
      console.log('  スクリプト:', reg.active?.scriptURL);
      console.log('  状態:', reg.active?.state);
    });
  });
}

// 3. /__/auth/ パスのテスト
fetch('/__/auth/iframe')
  .then(response => {
    console.log('🔥 /__/auth/iframe レスポンス:', response.status);
    if (response.status === 200) {
      console.log('✅ Firebase認証パスが正常に動作');
    } else {
      console.warn('⚠️ Firebase認証パスに問題があります');
    }
  })
  .catch(error => {
    console.log('🌐 /__/auth/iframe テスト:', error.message);
    console.log('ℹ️ これは正常（CORSエラーは予想される）');
  });

// 4. キャッシュの状態確認
caches.keys().then(cacheNames => {
  console.log('💾 存在するキャッシュ:', cacheNames);
});

console.log('🎯 テスト完了。上記の情報を確認してください。');
