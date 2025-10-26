// 共通ホームボタンコンポーネント
// 全てのレッスンで使用可能なホームボタン機能

/**
 * 共通ホームボタン機能
 * 絶対パスを使用して確実にメインページに戻る
 */
function commonGoBack() {
  console.log('🏠 共通ホームボタン実行');
  console.log('🔍 現在のURL:', window.location.href);
  console.log('🔍 現在のオリジン:', window.location.origin);
  
  // iframe内で実行されているかチェック
  if (window.parent !== window) {
    console.log('🔍 iframe内から親フレームにメッセージ送信');
    try {
      window.parent.postMessage({ type: 'lesson:goBack' }, '*');
      return;
    } catch (e) {
      console.error('❌ postMessage失敗:', e);
    }
  }
  
  // window.openerがあるかチェック
  if (window.opener && !window.opener.closed) {
    console.log('🔍 window.openerが存在するため、ウィンドウを閉じる');
    window.close();
    return;
  }
  
  // キャッシュ無効化付きでメインページに移動
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const cacheBuster = `?v=${timestamp}&r=${randomId}&cb=${Math.random()}`;
  
  // 絶対パスを使用
  const absolutePath = window.location.origin + '/index.html' + cacheBuster;
  console.log('🔍 絶対パスで移動:', absolutePath);
  
  try {
    window.location.replace(absolutePath);
  } catch (e) {
    console.error('❌ パス移動エラー:', e);
    // フォールバック: hrefを使用
    window.location.href = absolutePath;
  }
}

/**
 * デバッグ用: ホームボタンの状態を確認
 */
function debugCommonHomeButton() {
  console.log('🔍 共通ホームボタンデバッグ情報:');
  console.log('🔍 現在のURL:', window.location.href);
  console.log('🔍 現在のパス:', window.location.pathname);
  console.log('🔍 現在のオリジン:', window.location.origin);
  console.log('🔍 document.referrer:', document.referrer);
  console.log('🔍 window.parent !== window:', window.parent !== window);
  console.log('🔍 window.opener:', window.opener);
  console.log('🔍 window.opener.closed:', window.opener ? window.opener.closed : 'N/A');
}

// グローバルに公開
window.commonGoBack = commonGoBack;
window.debugCommonHomeButton = debugCommonHomeButton;

console.log('✅ 共通ホームボタン機能を読み込みました');
