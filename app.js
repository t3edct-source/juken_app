// Firebase認証基盤統合版 - メインアプリケーション

// Firebase Firestore 関数のインポート（entitlements チェック用）
import { db, collection, doc, getDoc, getDocs, onSnapshot } from './firebaseConfig.js';

// 🎉 Stripe Checkout 成功・キャンセル処理
function handleCheckoutResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const canceled = urlParams.get('canceled');
  const productId = urlParams.get('product');
  
  if (success === 'true') {
    console.log('🎉 Stripe Checkout 成功:', { productId });
    
    // 購入成功メッセージを表示
    const pack = PACKS.find(p => p.productId === productId);
    const packName = pack ? pack.label : 'コンテンツ';
    
    // 成功メッセージの表示
    setTimeout(() => {
      showPurchaseSuccessMessage(packName);
      
      // URLパラメータをクリーンアップ
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // UI更新（entitlementsが自動で更新されるまで少し待つ）
      setTimeout(() => {
        updateUIAfterEntitlementsChange();
      }, 2000);
    }, 1000);
    
  } else if (canceled === 'true') {
    console.log('❌ Stripe Checkout キャンセル');
    
    // キャンセルメッセージを表示
    setTimeout(() => {
      showPurchaseCancelMessage();
      
      // URLパラメータをクリーンアップ
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 500);
  }
}

// 🎉 購入成功メッセージを表示
function showPurchaseSuccessMessage(packName) {
  // 既存のモーダルを確認して非表示にする
  const existingModals = ['purchaseModal', 'purchaseConfirmModal', 'purchaseProcessingModal'];
  existingModals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  });
  
  // 購入完了モーダルを表示
  const completeModal = document.getElementById('purchaseCompleteModal');
  if (completeModal) {
    // タイトルを更新
    const titleEl = completeModal.querySelector('.completed-item-title');
    if (titleEl) titleEl.textContent = packName;
    
    // モーダルを表示
    completeModal.classList.remove('hidden');
    
    // 自動で5秒後に閉じる
    setTimeout(() => {
      completeModal.classList.add('hidden');
    }, 5000);
  } else {
    // フォールバック: シンプルなアラート
    alert(`🎉 購入完了！\n\n${packName}の購入が完了しました。\n教材のロックが解除されました。`);
  }
}

// ❌ 購入キャンセルメッセージを表示  
function showPurchaseCancelMessage() {
  // シンプルなトーストメッセージを作成
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f56565;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;
  toast.innerHTML = `
    <div style="font-weight: bold;">購入がキャンセルされました</div>
    <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">
      再度購入をご希望の場合は、購入ボタンからお手続きください。
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // 4秒後に自動で削除
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// 親シェル：catalog読込のパス冗長化（./catalog.json → ../catalog.json の順で試行）
const state = {
  user: null,
  catalog: [],
  current: null,
  selectedGrade: null,
  selectedSubject: null,
  userEntitlements: new Set() // ユーザーの購入済みコンテンツ
};

// ===== Packs: 小4/5/6 × 理/社（6パック） =====
const PACKS = [
  { id:'g4-sci', grade:4, subject:'理科', label:'小4 理科', productId:'rika_gakushu_4', price:2980 },
  { id:'g4-soc', grade:4, subject:'社会', label:'小4 社会', productId:'shakai_gakushu_4', price:2980 },
  { id:'g5-sci', grade:5, subject:'理科', label:'小5 理科', productId:'rika_gakushu_5', price:2980 },
  { id:'g5-soc', grade:5, subject:'社会', label:'小5 社会', productId:'shakai_gakushu_5', price:2980 },
  { id:'g6-sci', grade:6, subject:'理科', label:'小6 理科', productId:'rika_gakushu_6', price:2980 },
  { id:'g6-soc', grade:6, subject:'社会', label:'小6 社会', productId:'shakai_gakushu_6', price:2980 },
];

// ===== 各パックの詳細コンテンツ定義 =====
const PACK_DETAILS = {
  'g4-sci': {
    label: '小4 理科',
    subjects: {
      '🔬 物理': ['物の重さ', '音の性質', '光の性質', '電気の通り道'],
      '🧪 化学': ['水の状態変化', '金属と温度', '物の溶け方'],
      '🌱 生物': ['季節と生物', '動物の体のつくり', '植物の育ち方'],
      '🌍 地学': ['天気の変化', '月と星', '大地のつくり']
    }
  },
  'g4-soc': {
    label: '小4 社会',
    subjects: {
      '🗾 地理': ['都道府県の位置', '地形の特色', '気候の違い', '産業と地域'],
      '📚 歴史': ['縄文・弥生時代', '古墳時代', '飛鳥時代', '奈良時代'],
      '🏛️ 公民': ['地域の人々', 'くらしと政治', '国民の権利', '地方自治']
    }
  },
  'g5-sci': {
    label: '小5 理科',
    subjects: {
      '🔬 物理': ['振り子の運動', 'てこの原理', '電流と磁石', '音と光の進み方'],
      '🧪 化学': ['物の燃焼', '水溶液の性質', '金属の性質', '化学変化'],
      '🌱 生物': ['植物の発芽', '動物の誕生', '食物連鎖', '環境と生物'],
      '🌍 地学': ['流水の働き', '天気の変化', '台風と天気', '大地の変化']
    }
  },
  'g5-soc': {
    label: '小5 社会',
    subjects: {
      '🗾 地理': ['日本の地形', '気候と産業', '交通とネットワーク', '日本の貿易'],
      '📚 歴史': ['平安時代', '鎌倉時代', '室町時代', '安土桃山時代'],
      '🏛️ 公民': ['情報化社会', '環境問題', '国際協力', '平和と戦争']
    }
  },
  'g6-sci': {
    label: '小6 理科',
    subjects: {
      '🔬 物理': ['電気の利用', 'てこの計算', '振り子の実験', '音の大きさ'],
      '🧪 化学': ['燃焼と酸素', '水溶液の区別', '気体の性質', '化学反応'],
      '🌱 生物': ['人体のつくり', '植物の仕組み', '動物の分類', '生態系'],
      '🌍 地学': ['月の満ち欠け', '太陽系', '地層と化石', '火山と地震']
    }
  },
  'g6-soc': {
    label: '小6 社会',
    subjects: {
      '🗾 地理': ['世界の中の日本', '領土と領海', '資源とエネルギー', '国際関係'],
      '📚 歴史': ['江戸時代', '明治維新', '大正・昭和', '現代の日本'],
      '🏛️ 公民': ['日本国憲法', '三権分立', '地方自治', '国際社会']
    }
  }
};

// ===== 購入・学年状態管理 =====
const LS_KEYS = { purchases:'purchases', currentGrade:'currentGrade' };

// 🔥 Firebase Entitlements をチェックして購入済みコンテンツを取得
async function loadUserEntitlements(userId) {
  if (!userId) {
    console.log('👤 ユーザーIDが無いため、entitlementsをクリアします');
    state.userEntitlements.clear();
    return [];
  }
  
  try {
    console.log('🔍 Firebase entitlementsを取得中...', userId);
    const entitlementsRef = collection(db, 'users', userId, 'entitlements');
    const snapshot = await getDocs(entitlementsRef);
    
    const activeEntitlements = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.active === true) {
        activeEntitlements.push(doc.id); // productId
        console.log('✅ アクティブなentitlement:', doc.id, data);
      } else {
        console.log('❌ 非アクティブなentitlement:', doc.id, data);
      }
    });
    
    // state に保存
    state.userEntitlements = new Set(activeEntitlements);
    console.log('📦 ユーザーのentitlements更新:', Array.from(state.userEntitlements));
    
    return activeEntitlements;
  } catch (error) {
    console.error('❌ entitlements取得エラー:', error);
    state.userEntitlements.clear();
    return [];
  }
}

// 🎧 Firebase Entitlements をリアルタイム監視
let entitlementsUnsubscribe = null;
function startEntitlementsListener(userId) {
  // 既存のリスナーを停止
  if (entitlementsUnsubscribe) {
    entitlementsUnsubscribe();
    entitlementsUnsubscribe = null;
  }
  
  if (!userId) return;
  
  try {
    console.log('🎧 entitlementsリアルタイム監視を開始:', userId);
    const entitlementsRef = collection(db, 'users', userId, 'entitlements');
    
    entitlementsUnsubscribe = onSnapshot(entitlementsRef, (snapshot) => {
      const activeEntitlements = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.active === true) {
          activeEntitlements.push(doc.id);
        }
      });
      
      console.log('🔄 entitlementsリアルタイム更新:', activeEntitlements);
      state.userEntitlements = new Set(activeEntitlements);
      
      // UI を更新
      updateUIAfterEntitlementsChange();
    }, (error) => {
      console.error('❌ entitlementsリスナーエラー:', error);
    });
  } catch (error) {
    console.error('❌ entitlementsリスナー開始エラー:', error);
  }
}

// 📱 entitlements変更後のUI更新
function updateUIAfterEntitlementsChange() {
  // LP画面の更新
  renderLP();
  
  // モーダルの更新
  renderModalContent();
  
  // アプリビューの更新
  renderAppView();
  
  console.log('🔄 entitlements変更によりUI更新完了');
}

// 💾 LocalStorage との互換性（開発・テスト用）
function loadPurchases(){ 
  // 認証済みユーザーの場合は Firebase entitlements を使用
  if (state.user && state.userEntitlements.size > 0) {
    return Array.from(state.userEntitlements);
  }
  
  // 未認証またはentitlementsが無い場合は LocalStorage を使用（開発用）
  try{ 
    return JSON.parse(localStorage.getItem(LS_KEYS.purchases) || '[]'); 
  } catch { 
    return []; 
  } 
}

function savePurchases(ids){ localStorage.setItem(LS_KEYS.purchases, JSON.stringify(ids)); }
function getCurrentGrade(){ const g = parseInt(localStorage.getItem(LS_KEYS.currentGrade)||''); return (g>=4 && g<=6) ? g : null; }
function setCurrentGrade(g){ localStorage.setItem(LS_KEYS.currentGrade, String(g)); }
function isAfterApril1(d=new Date()){
  const y = d.getFullYear(); const cutoff = new Date(y, 3, 1, 0,0,0); // 4/1 00:00
  return d.getTime() >= cutoff.getTime();
}

function loginMock(){
  // Firebase認証との連携のため、直接的な状態変更は行わない
  // Firebase認証の状態変化で自動的にログイン状態が更新される
  alert('Firebase認証ボックスからログインしてください');
}

function logoutMock(){
  // Firebase signOutを呼び出す
  if (window.firebaseAuth && window.firebaseAuth.signOut) {
    window.firebaseAuth.signOut(window.firebaseAuth.auth);
  } else {
    // フォールバック：従来のモック機能
    state.user = null;
    document.getElementById('btnLogin')?.classList.remove('hidden');
    document.getElementById('btnLogout')?.classList.add('hidden');
  }
}

// Firebase認証状態変化をアプリの状態に反映する関数
function syncFirebaseAuth(user) {
  console.log('🔥 syncFirebaseAuth 呼び出し:', user ? '認証済み' : '未認証');
  console.log('🔥 受信したユーザー情報:', user);
  
  if (user) {
    // ログイン状態
    const newUserState = { 
      id: user.uid, 
      name: user.displayName || user.email,
      email: user.email,
      emailVerified: user.emailVerified,
      providerData: user.providerData
    };
    
    console.log('🔄 state.user 更新前:', state.user);
    state.user = newUserState;
    console.log('✅ state.user 更新後:', state.user);
    
    // UI更新
    document.getElementById('btnLogin')?.classList.add('hidden');
    document.getElementById('btnLogout')?.classList.remove('hidden');
    
    // 🔥 Firebase Entitlements を読み込み
    console.log('🔍 ユーザーのentitlementsを読み込み中...');
    loadUserEntitlements(user.uid).then(() => {
      console.log('✅ entitlements読み込み完了');
      
      // 🎧 リアルタイム監視を開始
      startEntitlementsListener(user.uid);
      
      // 購入ボタンの状態を更新
      console.log('🔄 購入ボタン状態を更新します...');
      updatePurchaseButtonsState(user);
      
      // UI全体を更新
      updateUIAfterEntitlementsChange();
    }).catch(error => {
      console.error('❌ entitlements読み込みエラー:', error);
      updatePurchaseButtonsState(user);
    });
    
    // 状態確認用ログ
    setTimeout(() => {
      console.log('📊 最終確認 - state.user:', state.user);
      console.log('📊 最終確認 - window.state:', window.state);
      console.log('📦 最終確認 - userEntitlements:', Array.from(state.userEntitlements));
    }, 1000);
  } else {
    // ログアウト状態
    console.log('🚪 ユーザー状態をクリア');
    console.log('🔄 state.user クリア前:', state.user);
    state.user = null;
    console.log('✅ state.user クリア後:', state.user);
    
    // 🔥 entitlements をクリア
    state.userEntitlements.clear();
    console.log('🧹 userEntitlements クリア完了');
    
    // 🎧 entitlements リスナーを停止
    if (entitlementsUnsubscribe) {
      entitlementsUnsubscribe();
      entitlementsUnsubscribe = null;
      console.log('🛑 entitlementsリスナー停止');
    }
    
    document.getElementById('btnLogin')?.classList.remove('hidden');
    document.getElementById('btnLogout')?.classList.add('hidden');
    
    // 購入ボタンを無効化
    updatePurchaseButtonsState(null);
    
    // UI を更新
    updateUIAfterEntitlementsChange();
  }
  
  // グローバルステートも確認
  if (!window.state) {
    console.log('⚠️ window.state が存在しません。作成します。');
    window.state = state;
  }
}

// 購入ボタンの状態を更新する関数
function updatePurchaseButtonsState(user) {
  console.log('updatePurchaseButtonsState 呼び出し:', user ? '認証済み' : '未認証');
  
  const headerPurchaseBtn = document.getElementById('purchaseBtn');
  
  if (user) {
    // 認証済みユーザーの場合
    const isEmailVerified = user.emailVerified || user.providerData?.some(provider => provider.providerId !== 'password');
    
    console.log('認証状態詳細:', {
      emailVerified: user.emailVerified,
      providerData: user.providerData,
      isEmailVerified: isEmailVerified
    });
    
    if (headerPurchaseBtn) {
      if (isEmailVerified) {
        // メール確認済みまたはソーシャルログイン
        // 少し遅延してからボタンを有効化（state.user の確実な設定を待つ）
        setTimeout(() => {
          headerPurchaseBtn.disabled = false;
          headerPurchaseBtn.textContent = '💳 購入';
          headerPurchaseBtn.className = 'px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition-colors duration-200';
          headerPurchaseBtn.title = '';
          console.log('✅ 購入ボタンを有効化しました（遅延実行）');
          
          // state.user の最終確認
          if (!state.user && user) {
            console.log('🔄 購入ボタン有効化時に state.user を再設定');
            state.user = {
              id: user.uid,
              name: user.displayName || user.email,
              email: user.email,
              emailVerified: user.emailVerified,
              providerData: user.providerData
            };
          }
        }, 200);
      } else {
        // メール未確認
        headerPurchaseBtn.disabled = true;
        headerPurchaseBtn.textContent = '📧 メール確認必要';
        headerPurchaseBtn.className = 'px-3 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed shadow-sm';
        headerPurchaseBtn.title = 'メールアドレスの確認が必要です';
        console.log('購入ボタンを無効化しました（メール未確認）');
      }
    } else {
      console.error('購入ボタンが見つかりません (ID: purchaseBtn)');
    }
  } else {
    // 未ログインユーザーの場合
    if (headerPurchaseBtn) {
      headerPurchaseBtn.disabled = true;
      headerPurchaseBtn.textContent = '🔒 ログイン必要';
      headerPurchaseBtn.className = 'px-3 py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed shadow-sm';
      headerPurchaseBtn.title = 'ログインが必要です';
      console.log('購入ボタンを無効化しました（未ログイン）');
    } else {
      console.error('購入ボタンが見つかりません (ID: purchaseBtn)');
    }
  }
  
  // LP内の購入ボタンも更新
  updateLPPurchaseButtons(user);
  
  // モーダル内の購入ボタンも更新
  updateModalPurchaseButtons(user);
}

// syncFirebaseAuth関数をグローバルに公開（即座に実行）
window.syncFirebaseAuth = syncFirebaseAuth;
console.log("🚀 syncFirebaseAuth をグローバルに公開しました");

// ===== Stripe Checkout連携機能 =====
async function startPurchase(productId, packLabel) {
  console.log('🛒 Stripe購入開始:', { productId, packLabel });
  
  // Firebase認証状態を確認
  const user = window.firebaseAuth?.auth?.currentUser;
  if (!user) {
    alert("購入するにはログインが必要です。右上のログインボタンからアカウントを作成またはログインしてください。");
    return;
  }
  
  if (!user.emailVerified) {
    alert("購入するにはメールアドレスの確認が必要です。確認メールのリンクをクリックしてから再度お試しください。");
    return;
  }
  
  console.log('✅ 認証チェック完了 - Stripe Checkoutを開始');
  
  try {
    console.log('📡 Netlify Functions へリクエスト送信中...', {
      productId,
      uid: user.uid,
      packLabel
    });

    // Netlify Functions経由でStripe Checkoutセッションを作成
    const response = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        productId: productId,     // 例: "shakai_gakushu_5"
        uid: user.uid,           // Firebaseユーザー ID
        userEmail: user.email,   // ユーザーメールアドレス（使用されないが互換性のため）
        packLabel: packLabel     // UI表示用（使用されないが互換性のため）
      }),
    });
    
    console.log('📡 レスポンス受信:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // レスポンスが正常でない場合
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP エラー:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorMessage = `サーバーエラー (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error('エラーレスポンスのJSON解析失敗:', e);
      }
      
      alert("購入処理の開始に失敗しました: " + errorMessage);
      return;
    }
    
    const result = await response.json();
    console.log('💳 Checkout セッション作成結果:', result);
    
    if (result.error) {
      console.error('❌ Checkout セッション作成エラー:', result.error);
      alert("購入処理の開始に失敗しました: " + result.error);
      return;
    }
    
    if (result.url) {
      console.log('🔄 Stripe Checkoutにリダイレクト:', result.url);
      // Stripe Checkoutページへリダイレクト
      window.location.href = result.url;
    } else {
      console.error('❌ Checkout URL が見つかりません');
      alert("購入ページの生成に失敗しました。もう一度お試しください。");
    }
  } catch (error) {
    console.error('❌ 購入開始エラー:', error);
    
    // ネットワークエラーかFunction未デプロイかを判別
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert("サーバーに接続できませんでした。\n\n考えられる原因:\n- Netlify Functionsがデプロイされていない\n- ネットワーク接続の問題\n\n管理者にお問い合わせください。");
    } else {
      alert("購入処理中にエラーが発生しました: " + error.message);
    }
  }
}

// モーダル内から呼び出すためのグローバル関数
window.handleModalAuthRequired = handleModalAuthRequired;
window.startPurchase = startPurchase;

// Firebase認証状態変化を監視してアプリ状態を同期
// (index.htmlのFirebase認証スクリプトから直接呼び出される)

// 🔐 実際のFirestore entitlementsをチェック
function hasEntitlement(sku) { 
  if (!sku) return true; // SKU指定なしは常に許可
  if (!state.user) return false; // 未認証は常に拒否
  
  // Firebase entitlements をチェック
  const hasFirebaseEntitlement = state.userEntitlements.has(sku);
  
  // 開発・テスト用: LocalStorage もチェック（フォールバック）
  const localPurchases = JSON.parse(localStorage.getItem(LS_KEYS.purchases) || '[]');
  const hasLocalPurchase = localPurchases.includes(sku);
  
  const result = hasFirebaseEntitlement || hasLocalPurchase;
  
  console.log('🔐 entitlementチェック:', {
    sku,
    user: !!state.user,
    firebaseEntitlements: Array.from(state.userEntitlements),
    hasFirebaseEntitlement,
    localPurchases,
    hasLocalPurchase,
    result
  });
  
  return result;
}

function saveProgress(lessonId, score, detail){
  const key = `progress:${lessonId}`;
  const payload = { lessonId, score, detail, at: Date.now() };
  console.log('進捗を保存します:', {key, payload});
  try{ 
    localStorage.setItem(key, JSON.stringify(payload));
    console.log('進捗の保存に成功しました');
  } catch(e) {
    console.log('進捗の保存に失敗しました:', e);
  }
}

function saveLessonProgress(id, correct, total, seconds){
  const score = total ? (correct/total) : 1;
  saveProgress(id, score, { correct, total, timeSec: seconds });
}

// セッション結果を一時保存する関数
function saveSessionResult(lessonId, correct, total, seconds) {
  const sessionResult = {
    lessonId,
    correct,
    total,
    seconds,
    completedAt: new Date().toISOString()
  };
  
  try {
    sessionStorage.setItem('currentSessionResult', JSON.stringify(sessionResult));
    console.log('セッション結果を保存しました:', sessionResult);
  } catch (e) {
    console.error('セッション結果の保存に失敗しました:', e);
  }
}

// セッション結果を取得する関数
function getSessionResult() {
  try {
    const result = sessionStorage.getItem('currentSessionResult');
    return result ? JSON.parse(result) : null;
  } catch (e) {
    console.error('セッション結果の取得に失敗しました:', e);
    return null;
  }
}

// セッション結果をクリアする関数
function clearSessionResult() {
  try {
    sessionStorage.removeItem('currentSessionResult');
  } catch (e) {
    console.error('セッション結果のクリアに失敗しました:', e);
  }
}

// 教材の進捗状況を取得する関数
function getLessonProgress(lessonId) {
  const key = `progress:${lessonId}`;
  try {
    const progress = localStorage.getItem(key);
    return progress ? JSON.parse(progress) : null;
  } catch (e) {
    return null;
  }
}

// 教材が完了しているかチェックする関数
function isLessonCompleted(lessonId) {
  const progress = getLessonProgress(lessonId);
  return progress && progress.score > 0;
}

// 教材の詳細スコア情報を取得する関数
function getLessonScoreInfo(lessonId) {
  const progress = getLessonProgress(lessonId);
  if (!progress || !progress.detail) {
    return null;
  }
  
  const { correct, total } = progress.detail;
  const date = new Date(progress.at);
  
  return {
    correct: correct || 0,
    total: total || 0,
    date: date,
    formattedDate: formatDate(date)
  };
}

// 日付をフォーマットする関数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

async function loadCatalog(){
  const tryUrls = ['./catalog.json', '../catalog.json'];
  let lastErr = null;
  for (const url of tryUrls){
    try{
      const res = await fetch(url);
      if (res.ok){ state.catalog = await res.json(); lastErr=null; break; }
      lastErr = new Error(`${url} not ok`);
    }catch(e){ lastErr = e; }
  }
  if (lastErr){
    console.warn('catalog.json が見つからないため、デモデータを使用します。', lastErr);
    state.catalog = [{
      id:'demo.sample', title:'デモ教材', grade:5, subject:'math',
      path:'./output.html', duration_min:8, sku_required:null
    }];
  }
}

function parseHash(){
  const raw = location.hash.slice(2);
  const [view, ...rest] = raw.split('/');
  return { view: view || 'home', arg: decodeURIComponent(rest.join('/')) };
}
function setHash(view, arg){ location.hash = arg ? `#/${view}/${encodeURIComponent(arg)}` : `#/${view}`; }

function route(){
  const { view, arg } = parseHash();
  showOnly(view);
  if (view==='home') {
    clearSessionResult(); // ホームに戻った時にセッション結果をクリア
    renderHome();
  }
  else if (view==='lesson') renderLesson(arg);
  else if (view==='purchase') renderPurchase(arg);
  else if (view==='result') renderResult(arg);
  else { 
    clearSessionResult(); // デフォルトでホームに戻る時もクリア
    showOnly('home'); 
    renderHome(); 
  }
}
function showOnly(which){
  const map = { home:'homeView', lesson:'lessonView', purchase:'purchaseView', result:'resultView' };
  for (const k in map){ const el=document.getElementById(map[k]); if(el) el.classList.toggle('hidden', k!==which); }
}

// 教科名を日本語に変換する関数
function getSubjectName(subject) {
  const subjectMap = {
    'sci': '理科',
    'soc': '社会',
    'science_drill': '理科暗記',
    'social_drill': '社会暗記',
    'math': '算数',
    'jpn': '国語',
    'eng': '英語'
  };
  return subjectMap[subject] || subject;
}

// 現在選択されている教科
let currentSubject = 'recommended';

// 現在選択されている単元（算数の場合）
let selectedUnit = null;

// 理科の分野定義
const scienceUnits = [
  {
    id: 'physics',
    name: '物理分野',
    icon: '⚡',
    lessons: ['sci.physics.motion']
  },
  {
    id: 'chemistry',
    name: '化学分野',
    icon: '🧪',
    lessons: ['sci.chemistry.water_solution']
  },
  {
    id: 'biology',
    name: '生物分野',
    icon: '🌱',
    lessons: ['sci.biology.human_body', 'sci.biology.plants']
  },
  {
    id: 'earth_science',
    name: '地学分野',
    icon: '🌍',
    lessons: ['sci.earth.weather']
  }
];

// 社会の分野定義
const socialUnits = [
  {
    id: 'geography',
    name: '地理分野',
    icon: '🗺️',
    lessons: [
      'soc.geography.selection_menu',
      'soc.geography.japan_terrain_front',
      'soc.geography.japan_terrain_back',
      'soc.geography.japan_regions'
    ]
  },
  {
    id: 'history',
    name: '歴史分野',
    icon: '📜',
    lessons: ['soc.history.heian', 'soc.history.kamakura']
  },
  {
    id: 'civics',
    name: '公民分野',
    icon: '🏛️',
    lessons: ['soc.civics.constitution']
  }
];

// おすすめ教材を選択する関数
function getRecommendedLessons() {
  console.log('getRecommendedLessons called');
  const recommendations = [];
  const subjects = ['sci', 'soc', 'science_drill', 'social_drill'];
  
  console.log('カタログ:', state.catalog);
  
  subjects.forEach(subject => {
    console.log(`${subject}教科の処理開始`);
    const subjectLessons = state.catalog.filter(entry => entry.subject === subject);
    console.log(`${subject}教科の教材:`, subjectLessons);
    
    if (subjectLessons.length === 0) {
      console.log(`${subject}教科の教材がありません`);
      return;
    }
    
    // その教科で最後に取り組んだ単元を特定
    let lastCompletedLesson = null;
    let nextLesson = null;
    
    // 完了した教材を時系列順に並べる
    const completedLessons = subjectLessons
      .filter(entry => isLessonCompleted(entry.id))
      .sort((a, b) => {
        const progressA = getLessonProgress(a.id);
        const progressB = getLessonProgress(b.id);
        return (progressB?.at || 0) - (progressA?.at || 0);
      });
    
    console.log(`${subject}教科の完了済み教材:`, completedLessons);
    
    if (completedLessons.length > 0) {
      // 最後に完了した教材の次の教材を推薦
      const lastCompleted = completedLessons[0];
      const lastCompletedIndex = subjectLessons.findIndex(entry => entry.id === lastCompleted.id);
      console.log(`${subject}教科の最後に完了した教材:`, lastCompleted, 'インデックス:', lastCompletedIndex);
      
      if (lastCompletedIndex < subjectLessons.length - 1) {
        nextLesson = subjectLessons[lastCompletedIndex + 1];
        console.log(`${subject}教科の次の教材:`, nextLesson);
      } else {
        console.log(`${subject}教科の次の教材はありません（最後の教材を完了済み）`);
      }
    } else {
      // 完了した教材がない場合は最初の教材を推薦
      nextLesson = subjectLessons[0];
      console.log(`${subject}教科の最初の教材を推薦:`, nextLesson);
    }
    
    // 次の教材が存在し、まだ完了していない場合は推薦リストに追加
    if (nextLesson && !isLessonCompleted(nextLesson.id)) {
      console.log(`${subject}教科の教材を推薦リストに追加:`, nextLesson);
      recommendations.push(nextLesson);
    } else {
      console.log(`${subject}教科の教材は推薦リストに追加されませんでした`);
    }
  });
  
  console.log('最終的な推薦リスト:', recommendations);
  
  // 最大4つまで返す（各教科最大2つまで）
  return recommendations.slice(0, 4);
}

// 教科別タブのイベントリスナーを設定
function setupSubjectTabs() {
  const subjectTabs = document.querySelectorAll('.subject-tab');
  subjectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // アクティブなタブを更新
      subjectTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 選択された教科を更新
      currentSubject = tab.dataset.subject;
      
      // 教科に応じたイラストを更新
      updateSubjectHero(currentSubject);
      
      // 教材一覧を再描画
      renderHome();
    });
  });
}

function renderHome(){
  const homeView = document.getElementById('homeView');
  const app = document.getElementById('app');
  
  // 理科・社会の場合は2カラムレイアウトに変更
  if (currentSubject === 'sci' || currentSubject === 'soc') {
    homeView.classList.add('math-full-width');
    app.classList.add('math-full-width');
    if (currentSubject === 'sci') {
      renderScienceUnits();
    } else {
      renderSocialUnits();
    }
    return;
  } else {
    // 他の教科の場合は通常レイアウトに戻す
    homeView.classList.remove('math-full-width');
    app.classList.remove('math-full-width');
  }
  
  const list = document.getElementById('lessonList');
  if (!list) return;
  list.innerHTML='';
  
  console.log('renderHome called, currentSubject:', currentSubject);
  
  let displayCatalog;
  
  if (currentSubject === 'recommended') {
    // おすすめ教材を取得
    displayCatalog = getRecommendedLessons();
    console.log('おすすめ教材:', displayCatalog);
    
    // おすすめ教材がない場合のメッセージ
    if (displayCatalog.length === 0) {
      console.log('おすすめ教材がありません');
      list.innerHTML = `
        <div class="col-span-full text-center py-8">
          <div class="text-slate-500">
            <p class="text-lg mb-2">🎉 素晴らしい！</p>
            <p>すべての教材を完了しました。</p>
            <p class="text-sm mt-2">完了した教材を「再学習」して復習しましょう。</p>
          </div>
        </div>
      `;
      setupSubjectTabs();
      return;
    }
  } else {
    // 特定の教科の教材をフィルタリング
    displayCatalog = state.catalog.filter(entry => entry.subject === currentSubject);
    console.log(`${currentSubject}の教材:`, displayCatalog);
    
    // 完了した教材を下に表示するようにソート
    displayCatalog = displayCatalog.sort((a, b) => {
      const aCompleted = isLessonCompleted(a.id);
      const bCompleted = isLessonCompleted(b.id);
      
      if (aCompleted === bCompleted) {
        // 両方とも完了している、または両方とも未完了の場合は元の順序を維持
        return 0;
      } else if (aCompleted) {
        // aが完了している場合は下に移動
        return 1;
      } else {
        // bが完了している場合は下に移動
        return -1;
      }
    });
  }
  
  console.log('表示する教材:', displayCatalog);
  
  displayCatalog.forEach(entry=>{
    const div=document.createElement('div');
    const isCompleted = isLessonCompleted(entry.id);
    
    div.className=`card p-4 ${entry.subject} ${isCompleted ? 'completed' : ''}`;
    
    const need = entry.sku_required ? `<span class="badge lock">要購入</span>` : `<span class="badge open">無料</span>`;
    const subjectName = getSubjectName(entry.subject);
    const completionBadge = isCompleted ? `<span class="badge complete">完了</span>` : '';
    
    // スコア情報を取得
    const scoreInfo = getLessonScoreInfo(entry.id);
    const scoreDisplay = scoreInfo ? 
      `<div class="text-xs text-slate-600 mb-1 flex items-center justify-between">
        <span class="font-bold text-orange-600">${scoreInfo.correct}/${scoreInfo.total}問正解</span>
        <span class="text-slate-500">${scoreInfo.formattedDate}</span>
      </div>` : '';
    
    // おすすめタブの場合は特別な表示
    const recommendationBadge = currentSubject === 'recommended' ? 
      `<span class="badge recommend">⭐ おすすめ</span>` : '';
    
    div.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold flex-1">${escapeHtml(entry.title)}</h3>
        <div class="flex gap-1">
          ${recommendationBadge}
          ${completionBadge}
          ${need}
        </div>
      </div>
      <div class="text-sm text-slate-500 mb-2">${subjectName} / 小${entry.grade} ・ ${entry.duration_min||'?'}分</div>
      ${scoreDisplay}
      <div class="text-center">
        <span class="inline-block px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">${isCompleted ? '再学習' : '開く'}</span>
      </div>
    `;
    
    // カード全体をクリック可能にする
    div.style.cursor = 'pointer';
    div.onclick = () => setHash('lesson', entry.id);
    list.appendChild(div);
  });
  
  // 教科別タブのイベントリスナーを設定
  setupSubjectTabs();
}

// 理科の単元別表示を実装
function renderScienceUnits() {
  renderSubjectUnits(scienceUnits, '理科');
}

// 社会の単元別表示を実装
function renderSocialUnits() {
  renderSubjectUnits(socialUnits, '社会');
}

// 汎用的な単元別表示関数
function renderSubjectUnits(units, subjectName) {
  console.log('renderSubjectUnits called for', subjectName);
  const homeView = document.getElementById('homeView');
  if (!homeView) {
    console.error('homeView element not found');
    return;
  }
  
  // ヒーローイメージと教科別タブは残し、lessonListだけを置き換え
  const list = document.getElementById('lessonList');
  list.className = 'w-full';
  if (!list) {
    console.error('lessonList element not found');
    return;
  }
  
  list.innerHTML = `
    <div class="math-two-column">
      <!-- 左側：単元一覧 -->
      <div class="units-column">
        <div id="unitsContainer"></div>
      </div>
      
      <!-- 右側：選択された単元のレッスン -->
      <div class="lessons-column">
        <div id="lessonsContainer">
          <div class="lessons-placeholder">
            <div class="placeholder-icon">📖</div>
            <h3 class="placeholder-title">単元を選択してください</h3>
            <p class="placeholder-text">左側の単元一覧から学習したい単元をクリックしてください。</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  console.log('HTML structure created, calling renderUnits');
  renderUnits(units);
  setupSubjectTabs();
  
  // モバイル（<=768px）は単元一覧をアイコン帯に縮約（リサイズにも追随）
  const unitsWrap = document.getElementById('unitsContainer');
  const mq = window.matchMedia('(max-width: 768px)');
  const applyCompact = () => {
    if (!unitsWrap) return;
    if (mq.matches) unitsWrap.classList.add('compact-units');
    else unitsWrap.classList.remove('compact-units');
  };
  applyCompact();
  mq.addEventListener?.('change', applyCompact);
}

// 単元一覧を描画
function renderUnits(units) {
  console.log('renderUnits called');
  const container = document.getElementById('unitsContainer');
  if (!container) {
    console.error('unitsContainer element not found');
    return;
  }
  
  container.innerHTML = '';
  console.log('units:', units.length, 'units');
  
  units.forEach((unit, index) => {
    console.log(`Processing unit ${index + 1}:`, unit.name);
    // その単元のレッスンを取得
    const unitLessons = state.catalog.filter(lesson => 
      unit.lessons.includes(lesson.id)
    );
    
    // 進捗計算
    const completedCount = unitLessons.filter(lesson => isLessonCompleted(lesson.id)).length;
    const progressPercent = unitLessons.length > 0 ? Math.round((completedCount / unitLessons.length) * 100) : 0;
    
    const unitElement = document.createElement('div');
    unitElement.className = `unit-item ${selectedUnit === unit.id ? 'selected' : ''} ${unitLessons.length === 0 ? 'no-lessons' : ''}`;
    unitElement.title = `${unit.name}`;  // モバイルではこのtitleが活きる
    unitElement.setAttribute('aria-label', unit.name);
    const shortLabel = (unit.shortName || unit.name || '').slice(0, 8);
    unitElement.innerHTML = `
      <div class="unit-item-content">
        <div class="unit-item-icon">${unit.icon}</div>
        <div class="unit-item-short" aria-hidden="true">${shortLabel}</div>
        <div class="unit-item-info">
          <h4 class="unit-item-title">${unit.name}</h4>
          <div class="unit-item-meta">
            <span class="unit-item-count">${unitLessons.length > 0 ? `${unitLessons.length}個のレッスン` : '準備中'}</span>
            ${unitLessons.length > 0 ? `<span class="unit-item-progress">${progressPercent}%</span>` : '<span class="unit-item-progress">-</span>'}
          </div>
          ${unitLessons.length > 0 ? `
            <div class="unit-item-progress-bar">
              <div class="unit-item-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
          ` : '<div class="unit-item-coming-soon">近日公開予定</div>'}
        </div>
      </div>
    `;
    
    if (unitLessons.length > 0) {
      unitElement.onclick = () => selectUnit(unit.id);
    } else {
      unitElement.style.cursor = 'not-allowed';
      unitElement.style.opacity = '0.6';
    }
    
    container.appendChild(unitElement);
  });
}

// 単元を選択
function selectUnit(unitId) {
  selectedUnit = unitId;
  
  // 現在の教科に応じて適切な単元配列を選択
  let currentUnits;
  if (currentSubject === 'sci') {
    currentUnits = scienceUnits;
  } else if (currentSubject === 'soc') {
    currentUnits = socialUnits;
  } else {
    currentUnits = [];
  }
  
  renderUnits(currentUnits); // 単元一覧を再描画（選択状態を更新）
  renderUnitLessons(unitId); // 選択された単元のレッスンを表示

  // モバイルでは選択後にレッスン領域へスムーズスクロール
  if (window.matchMedia('(max-width: 768px)').matches) {
    const target = document.getElementById('lessonsContainer');
    if (target) {
      // レイアウト再計算のタイミングを合わせる
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  }
}

// 選択された単元のレッスンを表示
function renderUnitLessons(unitId) {
  const container = document.getElementById('lessonsContainer');
  if (!container) return;
  
  // 現在の教科に応じて適切な単元配列を選択
  let currentUnits;
  if (currentSubject === 'sci') {
    currentUnits = scienceUnits;
  } else if (currentSubject === 'soc') {
    currentUnits = socialUnits;
  } else {
    // デフォルトは空配列
    currentUnits = [];
  }
  
  const unit = currentUnits.find(u => u.id === unitId);
  if (!unit) return;
  
  // その単元のレッスンを取得
  const unitLessons = state.catalog.filter(lesson => 
    unit.lessons.includes(lesson.id)
  );
  
  if (unitLessons.length === 0) {
    container.innerHTML = `
      <div class="lessons-placeholder">
        <div class="placeholder-icon">⚠️</div>
        <h3 class="placeholder-title">レッスンが見つかりません</h3>
        <p class="placeholder-text">この単元のレッスンデータが見つかりませんでした。</p>
      </div>
    `;
    return;
  }
  
  // 完了した教材を下に表示するようにソート
  const sortedLessons = unitLessons.sort((a, b) => {
    const aCompleted = isLessonCompleted(a.id);
    const bCompleted = isLessonCompleted(b.id);
    
    if (aCompleted === bCompleted) {
      return 0;
    } else if (aCompleted) {
      return 1;
    } else {
      return -1;
    }
  });
  
  container.innerHTML = `
    <div class="lessons-header">
      <h3 class="lessons-title">${unit.icon} ${unit.name}</h3>
      <span class="lessons-count">${unitLessons.length}個のレッスン</span>
    </div>
    
    <!-- シンプルなリスト表示 -->
    <div class="lessons-list-container" id="lessonsListContainer">
    </div>
  `;
  
  const listContainer = document.getElementById('lessonsListContainer');
  
  if (!listContainer) {
    console.error('List container not found');
    return;
  }
  
  sortedLessons.forEach((lesson, index) => {
    const isCompleted = isLessonCompleted(lesson.id);
    const progress = getLessonProgress(lesson.id);
    const scoreText = progress ? `${Math.round(progress.score * 100)}%` : '-';
    
    // リストアイテムを作成
    const listItem = document.createElement('div');
    listItem.className = `lesson-list-item ${isCompleted ? 'completed' : 'pending'}`;
    
    // 各要素を個別に作成して確実に横書きにする
    const numberSpan = document.createElement('div');
    numberSpan.className = 'lesson-number';
    numberSpan.textContent = String(index + 1).padStart(2, '0');
    
    const titleSpan = document.createElement('div');
    titleSpan.className = 'lesson-title';
    titleSpan.textContent = lesson.title;
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'lesson-meta';
    
    const durationSpan = document.createElement('span');
    durationSpan.className = 'lesson-duration';
    durationSpan.textContent = `${lesson.duration_min}分`;
    
    const statusSpan = document.createElement('span');
    statusSpan.className = `lesson-status ${isCompleted ? 'completed' : 'pending'}`;
    statusSpan.textContent = isCompleted ? '完了' : '未完了';
    
    // スコア情報を追加
    const scoreInfo = getLessonScoreInfo(lesson.id);
    
    // メタ行に時間とステータスを追加
    metaDiv.appendChild(durationSpan);
    metaDiv.appendChild(statusSpan);
    
    // スコア表示を追加
    if (scoreInfo) {
      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'lesson-score';
      scoreSpan.textContent = `${scoreInfo.correct}/${scoreInfo.total}問`;
      scoreSpan.style.cssText = 'background: linear-gradient(135deg, #ea580c, #f97316); color: white; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;';
      metaDiv.appendChild(scoreSpan);
      
      const dateSpan = document.createElement('span');
      dateSpan.className = 'lesson-date';
      dateSpan.textContent = scoreInfo.formattedDate;
      dateSpan.style.cssText = 'color: #6b7280; font-size: 0.75rem;';
      metaDiv.appendChild(dateSpan);
    }
    
    const actionBtn = document.createElement('button');
    actionBtn.className = 'lesson-action-btn';
    actionBtn.textContent = isCompleted ? '復習' : '開始';
    actionBtn.addEventListener('click', () => setHash('lesson', lesson.id));
    
    // コンテナに追加
    listItem.appendChild(numberSpan);
    listItem.appendChild(titleSpan);
    listItem.appendChild(metaDiv);
    listItem.appendChild(actionBtn);
    
    listContainer.appendChild(listItem);
  });
}

function renderLesson(id){
  const l = state.catalog.find(x=>x.id===id);
  if(!l){ alert('レッスンが見つかりません'); return setHash('home'); }
  if(l.sku_required && !hasEntitlement(l.sku_required)) return setHash('purchase', l.sku_required);
  
  // 教材を単体ページとして開く
  if(l.path){
    window.location.href = l.path;
  } else {
    alert('教材ファイルが見つかりません');
    setHash('home');
  }
}

function renderPurchase(sku){
  const el=document.getElementById('purchaseText');
  if(el) el.textContent=`この教材は「${sku||'不明'}」の購入が必要です。`;
}

function renderResult(id){
  const box=document.getElementById('resultBox');
  if(!box) return;
  
  // セッション結果を優先的に取得
  const sessionResult = getSessionResult();
  
  if (sessionResult && sessionResult.lessonId === id) {
    // セッション結果がある場合（今回の学習結果）
    const { correct, total, seconds, completedAt } = sessionResult;
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeMinutes = Math.floor(seconds / 60);
    const timeSecondsRemainder = seconds % 60;
    const timeDisplay = timeMinutes > 0 ? 
      `${timeMinutes}分${timeSecondsRemainder}秒` : 
      `${seconds}秒`;
    
    // 完了時刻を日本時間でフォーマット
    const completedTime = new Date(completedAt).toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // 結果に応じたメッセージとスタイル
    let resultMessage = '';
    let resultClass = '';
    if (scorePercent >= 90) {
      resultMessage = '🎉 素晴らしい成果です！';
      resultClass = 'text-green-600 font-bold';
    } else if (scorePercent >= 70) {
      resultMessage = '👍 よくできました！';
      resultClass = 'text-blue-600 font-bold';
    } else if (scorePercent >= 50) {
      resultMessage = '📚 もう少し頑張りましょう！';
      resultClass = 'text-orange-600 font-bold';
    } else {
      resultMessage = '💪 復習して再チャレンジしよう！';
      resultClass = 'text-red-600 font-bold';
    }
    
    box.innerHTML = `
      <div class="max-w-md mx-auto">
        <div class="card p-6 text-center">
          <div class="mb-4">
            <div class="text-2xl font-bold text-slate-800 mb-2">学習完了！</div>
            <div class="${resultClass} text-lg mb-3">${resultMessage}</div>
          </div>
          
          <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-4">
            <div class="text-3xl font-bold text-orange-600 mb-1">${correct}/${total}問正解</div>
            <div class="text-lg text-orange-700 font-semibold">${scorePercent}%</div>
          </div>
          
          <div class="flex justify-between text-sm text-slate-600 mb-4">
            <div>学習時間: <span class="font-semibold">${timeDisplay}</span></div>
            <div>完了時刻: <span class="font-semibold">${completedTime}</span></div>
          </div>
          
          <div class="flex gap-3">
            <a href="index.html" class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-center transition-all duration-200">
              ホームへ
            </a>
            <button onclick="clearSessionResult(); setHash('lesson', '${id}');" class="flex-1 px-4 py-3 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold transition-all duration-200">
              再挑戦
            </button>
          </div>
        </div>
      </div>
    `;
    
  } else {
    // セッション結果がない場合（従来の累積データを表示）
    const key=`progress:${id}`;
    let p=null; try{ p=JSON.parse(localStorage.getItem(key)||'null'); }catch{}
    
    if(p){
      const d=p.detail||{};
      const scorePercent = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      
      box.innerHTML = `
        <div class="max-w-md mx-auto">
          <div class="card p-6 text-center">
            <div class="mb-4">
              <div class="text-xl font-bold text-slate-800 mb-2">過去の学習結果</div>
            </div>
            
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mb-4">
              <div class="text-2xl font-bold text-slate-600 mb-1">${d.correct ?? '-'}/${d.total ?? '-'}問正解</div>
              <div class="text-lg text-slate-700">${scorePercent}%</div>
            </div>
            
            <div class="text-sm text-slate-600 mb-4">
              学習時間: <span class="font-semibold">${d.timeSec ?? '-'}秒</span>
            </div>
            
            <div class="flex gap-3">
              <a href="index.html" class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-center">
                ホームへ
              </a>
              <a href="#/lesson/${id}" class="flex-1 px-4 py-3 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold text-center">
                再学習
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="max-w-md mx-auto">
          <div class="card p-6 text-center">
            <div class="text-xl font-bold text-slate-800 mb-4">結果データが見つかりません</div>
            <a href="index.html" class="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold">
              ホームへ
            </a>
          </div>
        </div>
      `;
    }
  }
}

window.addEventListener('message', (ev)=>{
  console.log('メッセージを受信しました:', ev.data);
  if (ev.origin !== location.origin) {
    console.log('オリジンが一致しません:', ev.origin, '!==', location.origin);
    return;
  }
  const d=ev.data||{};
  if (d.type==='lesson:complete'){
    console.log('完了メッセージを受信しました:', d);
    const id=d.lessonId || (state.current && state.current.id);
    const correct=d.detail?.correct ?? 0;
    const total=d.detail?.total ?? 0;
    const seconds=d.detail?.timeSec ?? 0;
    console.log('進捗を保存します:', {id, correct, total, seconds});
    
    // 長期保存用の進捗データを保存
    saveLessonProgress(id, correct, total, seconds);
    
    // セッション結果を一時保存（結果画面用）
    saveSessionResult(id, correct, total, seconds);
    
    setHash('result', id);
  } else if (d.type==='lesson:goBack'){
    console.log('戻るメッセージを受信しました');
    // iframe内から戻るボタンが押された場合、index.htmlに戻る
    window.location.href = 'index.html';
  }
});

function escapeHtml(s){return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]))}

// PWAインストール機能
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // インストールプロンプトを延期
  e.preventDefault();
  deferredPrompt = e;
  
  // インストールボタンを表示
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
  }
});

// インストールボタンのクリックイベント
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // インストールプロンプトを表示
        deferredPrompt.prompt();
        
        // ユーザーの選択を待つ
        const { outcome } = await deferredPrompt.userChoice;
        console.log('インストール結果:', outcome);
        
        // プロンプトをクリア
        deferredPrompt = null;
        
        // インストールボタンを非表示
        installBtn.classList.add('hidden');
      }
    });
  }
});

// 教科別イラスト切り替えの機能
function updateSubjectHero(subject) {
  const heroImg = document.getElementById('subjectHero');
  const heroMessage = document.getElementById('subjectMessage');
  
  if (!heroImg || !heroMessage) return;
  
  const subjectData = {
    recommended: {
      image: './images/subjects/recommended.png',
      message: '⭐ おすすめ学習で、中学受験合格への道筋をつかもう！'
    },
    sci: {
      image: './images/subjects/science.png',
      message: '🔬 理科わかる編で自然現象を理解し、入試で勝利しよう！'
    },
    soc: {
      image: './images/subjects/social.png',
      message: '🌍 社会わかる編で歴史・地理・公民をマスターしよう！'
    },
    science_drill: {
      image: './images/subjects/science.png',
      message: '🧪 理科おぼえる編で重要事項を徹底暗記しよう！'
    },
    social_drill: {
      image: './images/subjects/social.png',
      message: '📍 社会おぼえる編で重要事項を徹底暗記しよう！'
    },
    math: {
      image: './images/subjects/math.png',
      message: '🔢 算数で論理的思考力を身につけよう！'
    },
    jpn: {
      image: './images/subjects/japanese.png',
      message: '📚 国語で豊かな表現力を身につけよう！'
    },
    eng: {
      image: './images/subjects/english.png',
      message: '🌏 英語で世界とつながろう！'
    }
  };
  
  const data = subjectData[subject] || subjectData.recommended;
  if (data) {
    heroImg.src = data.image;
    heroImg.alt = `${subject}の学習イラスト`;
    heroMessage.textContent = data.message;
  }
}

// ===== LP描画 =====
function renderLP(){
  const grid = document.getElementById('lpGrid'); if(!grid) return;
  const purchased = new Set(loadPurchases());
  const user = state.user;
  const canPurchase = user && (user.emailVerified || user.providerData?.some(provider => provider.providerId !== 'password'));
  
  grid.innerHTML = PACKS.map(p => {
    const unlocked = purchased.has(p.id);
    
    let purchaseButton = '';
    if (unlocked) {
      purchaseButton = `<button class="btn-secondary" data-act="open" data-pack="${p.id}">開く</button>`;
    } else if (!user) {
      purchaseButton = `<button class="btn-primary disabled" data-act="login-required" data-pack="${p.id}" disabled title="ログインが必要です">🔒 ログイン必要</button>`;
    } else if (!canPurchase) {
      purchaseButton = `<button class="btn-primary disabled" data-act="verify-required" data-pack="${p.id}" disabled title="メールアドレスの確認が必要です">📧 メール確認必要</button>`;
    } else {
      purchaseButton = `<button class="btn-primary" data-act="buy" data-pack="${p.id}">購入</button>`;
    }
    
    return `
      <div class="pack-card ${unlocked ? 'unlocked':''}" data-pack="${p.id}">
        <span class="lock-badge">🔒</span>
      <div class="pack-title">${p.label}</div>
      <div class="pack-meta">学年：小${p.grade} ／ 教科：${p.subject}</div>
      <div class="pack-price">¥${p.price.toLocaleString()}</div>
        <div class="pack-actions">
          ${purchaseButton}
          <button class="btn-secondary" data-act="set-grade" data-grade="${p.grade}">学年に設定</button>
        </div>
      </div>
    `;
  }).join('');

  // イベントハンドラの設定
  grid.querySelectorAll('button[data-act="buy"]').forEach(btn=>{
    btn.onclick = () => showPurchaseConfirmModal(btn.getAttribute('data-pack'));
  });
  
  grid.querySelectorAll('button[data-act="open"]').forEach(btn=>{
    btn.onclick = () => openPack(btn.getAttribute('data-pack'));
  });
  
  grid.querySelectorAll('button[data-act="login-required"]').forEach(btn=>{
    btn.onclick = () => {
      alert('購入機能を利用するには、ログインが必要です。\n右上の「ログイン」ボタンからアカウントを作成またはログインしてください。');
    };
  });
  
  grid.querySelectorAll('button[data-act="verify-required"]').forEach(btn=>{
    btn.onclick = () => {
      alert('購入機能を利用するには、メールアドレスの確認が必要です。\n確認メールのリンクをクリックしてから再度お試しください。');
    };
  });
  
  grid.querySelectorAll('button[data-act="set-grade"]').forEach(btn=>{
    btn.onclick = () => { setCurrentGrade(parseInt(btn.getAttribute('data-grade'))); renderAppView(); window.scrollTo({top:0, behavior:'smooth'}); };
  });

  const start = document.getElementById('startLearningBtn');
  if(start){ start.onclick = () => { if(!getCurrentGrade()) setCurrentGrade(4); renderAppView(); window.scrollTo({top:0, behavior:'smooth'}); }; }
}

// LP内の購入ボタン状態を更新
function updateLPPurchaseButtons(user) {
  // LP再描画で対応
  renderLP();
}

// ダミー購入（サンプル）
// 実際の購入開始（Stripe Checkout）
function startRealPurchase(packId){
  const pack = PACKS.find(p => p.id === packId);
  if (!pack) {
    console.error('❌ パックが見つかりません:', packId);
    alert('指定された商品が見つかりません。');
    return;
  }
  
  console.log('🛒 実際の購入を開始:', pack);
  startPurchase(pack.productId, pack.label);
}

// ダミー購入（開発・テスト用）
function fakePurchase(packId){
  const arr = loadPurchases(); if(!arr.includes(packId)){ arr.push(packId); savePurchases(arr); }
  renderAppView();
}

// パックを開く（必要に応じて教科別ビューへ）
function openPack(packId){
  const pack = PACKS.find(p=>p.id===packId); if(!pack) return;
  setCurrentGrade(pack.grade);
  renderAppView();
  // ここで必要なら教科タブ切替などのハンドリングを追加
}

// ===== アプリ（学習画面）側：学年のみ表示＋4/1プロンプト =====
function renderAppView(){
  const grade = getCurrentGrade();
  // 既存のホーム/レッスン描画は温存：ここでは「見せる学年の制御」と「バナー出し」だけ行う
  const banner = ensureGradeBanner();
  if(grade){
    // 4/1以降に次学年未購入ならバナー表示
    const next = Math.min(6, grade+1);
    const needed = [`g${next}-sci`, `g${next}-soc`]; // 次学年の理社
    const have = new Set(loadPurchases());
    const missing = needed.filter(id => !have.has(id));
    if(isAfterApril1() && grade < 6 && missing.length > 0){
      banner.classList.add('show');
      banner.querySelector('[data-role="text"]').innerHTML = `新年度（小${next}）のコンテンツが利用できます。<b>購入して開く</b>？`;
      const buyBtn = banner.querySelector('button[data-role="buy-next"]');
      buyBtn.onclick = () => { missing.forEach(id => fakePurchase(id)); banner.classList.remove('show'); };
    }else{
      banner.classList.remove('show');
    }
  }
  // 既存のレンダリング系（例：renderMathUnits / renderUnits など）はこの直後に既存の呼び出しがある想定
}

function ensureGradeBanner(){
  let el = document.getElementById('gradeBanner');
  if(!el){
    const container = document.getElementById('homeView') || document.body;
    el = document.createElement('div');
    el.id = 'gradeBanner';
    el.className = 'grade-banner';
    el.innerHTML = `
      <div data-role="text">新年度コンテンツのご案内</div>
      <div class="actions">
        <button class="btn-secondary" data-role="dismiss">閉じる</button>
        <button class="btn-primary" data-role="buy-next">購入</button>
      </div>`;
    container.prepend(el);
    el.querySelector('button[data-role="dismiss"]').onclick = ()=> el.classList.remove('show');
  }
  return el;
}

// ===== 購入モーダル関連 =====
function openPurchaseModal() {
  const modal = document.getElementById('purchaseModal');
  if (!modal) return;
  
  renderModalContent();
  modal.classList.remove('hidden');
  
  // エスケープキーでモーダルを閉じる
  document.addEventListener('keydown', handleModalKeydown);
}

function closePurchaseModal() {
  const modal = document.getElementById('purchaseModal');
  if (!modal) return;
  
  modal.classList.add('hidden');
  document.removeEventListener('keydown', handleModalKeydown);
}

function handleModalKeydown(e) {
  if (e.key === 'Escape') {
    closePurchaseModal();
  }
}

function renderModalContent() {
  const grid = document.getElementById('modalPackGrid');
  if (!grid) return;
  
  const purchased = new Set(loadPurchases());
  const user = state.user;
  const canPurchase = user && (user.emailVerified || user.providerData?.some(provider => provider.providerId !== 'password'));
  
  grid.innerHTML = PACKS.map(pack => {
    const details = PACK_DETAILS[pack.id];
    const isPurchased = purchased.has(pack.id);
    
    const subjectsHTML = Object.entries(details.subjects).map(([subjectName, topics]) => `
      <div class="modal-subject-card">
        <div class="modal-subject-title">${subjectName}</div>
        <div class="modal-subject-topics">${topics.join('・')}</div>
      </div>
    `).join('');
    
    let actionButton = '';
    if (isPurchased) {
      actionButton = `<button class="btn-secondary" onclick="openPack('${pack.id}')">学習開始</button>`;
    } else if (!user) {
      actionButton = `<button class="btn-primary disabled" disabled title="ログインが必要です" onclick="handleModalAuthRequired('login')">🔒 ログイン必要</button>`;
    } else if (!canPurchase) {
      actionButton = `<button class="btn-primary disabled" disabled title="メールアドレスの確認が必要です" onclick="handleModalAuthRequired('verify')">📧 メール確認必要</button>`;
    } else {
      actionButton = `<button class="btn-primary" onclick="modalPurchasePack('${pack.id}')">購入する</button>`;
    }
    
    return `
      <div class="modal-pack-card ${isPurchased ? 'purchased' : ''}">
        <div class="modal-pack-header">
          <div class="modal-pack-title">${details.label}</div>
          <div class="modal-pack-status ${isPurchased ? 'purchased' : 'unpurchased'}">
            ${isPurchased ? '✅ 購入済み' : '🔒 未購入'}
          </div>
        </div>
        <div class="modal-pack-content">
          <div class="modal-pack-subjects">
            ${subjectsHTML}
          </div>
        </div>
        <div class="modal-pack-actions">
          ${actionButton}
          <button class="btn-secondary" onclick="setCurrentGrade(${pack.grade}); renderAppView();">学年に設定</button>
        </div>
      </div>
    `;
  }).join('');
}

// モーダル内の認証要求ハンドラ
function handleModalAuthRequired(type) {
  if (type === 'login') {
    alert('購入機能を利用するには、ログインが必要です。\nモーダルを閉じて、右上の「ログイン」ボタンからアカウントを作成またはログインしてください。');
  } else if (type === 'verify') {
    alert('購入機能を利用するには、メールアドレスの確認が必要です。\n確認メールのリンクをクリックしてから再度お試しください。');
  }
}

// モーダル内の購入ボタン状態を更新
function updateModalPurchaseButtons(user) {
  // モーダルが開いている場合のみ再描画
  const modal = document.getElementById('purchaseModal');
  if (modal && !modal.classList.contains('hidden')) {
    renderModalContent();
  }
}

function modalPurchasePack(packId) {
  console.log('🛒 モーダル内購入:', packId);
  
  // メール確認チェック
  if (state.user && !state.user.emailVerified && state.user.providerData?.some(provider => provider.providerId === 'password')) {
    alert('購入機能を利用するには、メールアドレスの確認が必要です。\n確認メールのリンクをクリックしてから再度お試しください。');
    return;
  }
  
  // 購入確認モーダルを表示
  showPurchaseConfirmModal(packId);
}

function setupPurchaseModal() {
  // 購入ボタンのクリックイベント
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (purchaseBtn) {
    purchaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンが無効化されている場合はクリックを無視
      if (purchaseBtn.disabled) {
        console.log('購入ボタンは無効化されています。クリックを無視します。');
        return;
      }
      
      // デバッグ情報を出力
      console.log('🛒 購入ボタンクリック - 認証状態:', state.user);
      console.log('🛒 購入ボタンクリック - ボタン状態:', {
        disabled: purchaseBtn.disabled,
        textContent: purchaseBtn.textContent,
        className: purchaseBtn.className
      });
      console.log('🛒 購入ボタンクリック - ユーザー情報:', {
        user: !!state.user,
        emailVerified: state.user?.emailVerified,
        providerData: state.user?.providerData
      });
      console.log('🛒 購入ボタンクリック - window.state:', window.state);
      console.log('🛒 購入ボタンクリック - グローバル確認:', {
        hasState: !!window.state,
        hasUser: !!window.state?.user,
        stateUserSame: state.user === window.state?.user
      });
      
      // Firebase認証の現在の状態を直接確認
      let currentUser = state.user || window.state?.user;
      
      // Firebase auth から直接ユーザー情報を取得（最新状態を確認）
      if (!currentUser && window.firebaseAuth?.auth?.currentUser) {
        console.log('🔄 Firebase auth.currentUser から状態を取得します');
        const firebaseUser = window.firebaseAuth.auth.currentUser;
        currentUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData
        };
        
        // state.user も更新
        state.user = currentUser;
        console.log('✅ Firebase currentUser から state.user を更新:', currentUser);
      }
      
      if (!currentUser) {
        console.error('❌ 認証エラー: ユーザーが見つかりません');
        console.error('❌ デバッグ詳細:', {
          'state.user': state.user,
          'window.state?.user': window.state?.user,
          'firebase.currentUser': window.firebaseAuth?.auth?.currentUser,
          'state === window.state': state === window.state
        });
        alert('購入機能を利用するには、ログインが必要です。\n右上の「ログイン」ボタンからアカウントを作成またはログインしてください。');
        return;
      }
      
      // 状態を統一
      if (!state.user && currentUser) {
        console.log('🔄 state.user を設定します');
        state.user = currentUser;
      }
      
      // メール確認状態をチェック
      const isEmailVerified = currentUser.emailVerified || currentUser.providerData?.some(provider => provider.providerId !== 'password');
      if (!isEmailVerified) {
        console.error('❌ メール確認エラー:', {
          emailVerified: currentUser.emailVerified,
          providerData: currentUser.providerData
        });
        alert('購入機能を利用するには、メールアドレスの確認が必要です。\n確認メールのリンクをクリックしてから再度お試しください。');
        return;
      }
      
      console.log('認証チェック完了 - 購入モーダルを開きます');
      // 認証済みの場合のみモーダルを開く
      openPurchaseModal();
    });
  }
  
  // モーダル閉じるボタンのイベント
  const closeBtn = document.getElementById('closePurchaseModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closePurchaseModal);
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closePurchaseModal);
  }
  
  // オーバーレイクリックで閉じる
  const modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePurchaseModal();
      }
    });
  }
}

// ===== 購入フロー関連 =====
function showPurchaseConfirmModal(packId) {
  const pack = PACKS.find(p => p.id === packId);
  const details = PACK_DETAILS[packId];
  if (!pack || !details) return;
  
  // 購入アイテム情報を設定
  document.getElementById('purchaseItemTitle').textContent = details.label;
  
  // パックの種類に応じて説明文を設定
  const isScience = pack.subject === '理科';
  const description = isScience 
    ? '物理・化学・生物・地学の全分野を学習できます'
    : '地理・歴史・公民の全分野を学習できます';
  document.getElementById('purchaseItemDescription').textContent = description;
  
  // メインの購入モーダルを非表示
  closePurchaseModal();
  
  // 購入確認モーダルを表示
  const confirmModal = document.getElementById('purchaseConfirmModal');
  confirmModal.classList.remove('hidden');
  
  // 確認ボタンのイベント設定
  const confirmBtn = document.getElementById('confirmPurchaseBtn');
  const cancelBtn = document.getElementById('cancelPurchaseBtn');
  const closeBtn = document.getElementById('closePurchaseConfirmModal');
  
  confirmBtn.onclick = () => processPurchase(packId);
  cancelBtn.onclick = closePurchaseConfirmModal;
  closeBtn.onclick = closePurchaseConfirmModal;
  
  // エスケープキーで閉じる
  document.addEventListener('keydown', handlePurchaseConfirmKeydown);
}

function closePurchaseConfirmModal() {
  const modal = document.getElementById('purchaseConfirmModal');
  modal.classList.add('hidden');
  document.removeEventListener('keydown', handlePurchaseConfirmKeydown);
}

function handlePurchaseConfirmKeydown(e) {
  if (e.key === 'Escape') {
    closePurchaseConfirmModal();
  }
}

async function processPurchase(packId) {
  // 確認モーダルを閉じる
  closePurchaseConfirmModal();
  
  // 処理中モーダルを表示
  const processingModal = document.getElementById('purchaseProcessingModal');
  processingModal.classList.remove('hidden');
  
  try {
    // パック情報を取得
    const pack = PACKS.find(p => p.id === packId);
    if (!pack) {
      throw new Error('パック情報が見つかりません: ' + packId);
    }
    
    // 実際のStripe Checkout連携
    await startPurchase(pack.productId, pack.label);
  } catch (error) {
    // エラーの場合は処理中モーダルを閉じてエラー表示
    processingModal.classList.add('hidden');
    console.error('Purchase failed:', error);
    alert('決済の開始に失敗しました：' + error.message);
  }
}

function completePurchase(packId) {
  // 実際の購入処理
  fakePurchase(packId);
  
  // 処理中モーダルを閉じる
  const processingModal = document.getElementById('purchaseProcessingModal');
  processingModal.classList.add('hidden');
  
  // 完了モーダルの内容を設定
  const pack = PACKS.find(p => p.id === packId);
  const details = PACK_DETAILS[packId];
  document.getElementById('completedItemTitle').textContent = details.label;
  
  // 完了モーダルを表示
  const completeModal = document.getElementById('purchaseCompleteModal');
  completeModal.classList.remove('hidden');
  
  // 完了モーダルのボタンイベント設定
  const startLearningBtn = document.getElementById('startLearningFromPurchase');
  const continueBrowsingBtn = document.getElementById('continueBrowsingBtn');
  const closeCompleteBtn = document.getElementById('closePurchaseCompleteModal');
  
  startLearningBtn.onclick = () => {
    closePurchaseCompleteModal();
    openPack(packId);
  };
  
  continueBrowsingBtn.onclick = () => {
    closePurchaseCompleteModal();
    openPurchaseModal(); // メイン購入モーダルに戻る
  };
  
  closeCompleteBtn.onclick = closePurchaseCompleteModal;
  
  // エスケープキーで閉じる
  document.addEventListener('keydown', handlePurchaseCompleteKeydown);
}

function closePurchaseCompleteModal() {
  const modal = document.getElementById('purchaseCompleteModal');
  modal.classList.add('hidden');
  document.removeEventListener('keydown', handlePurchaseCompleteKeydown);
}

function handlePurchaseCompleteKeydown(e) {
  if (e.key === 'Escape') {
    closePurchaseCompleteModal();
  }
}

async function startup(){
  // 🎉 Stripe Checkout 結果をチェック（最初に実行）
  handleCheckoutResult();
  
  document.getElementById('btnLogin')?.addEventListener('click', loginMock);
  document.getElementById('btnLogout')?.addEventListener('click', logoutMock);
  await loadCatalog();
  window.addEventListener('hashchange', route);
  route();
  
  // 初期表示時の教科イラストを設定
  updateSubjectHero('recommended');
  
  // アプリビューの描画
  renderAppView();
  
  // 購入モーダルのセットアップ
  setupPurchaseModal();
  
  // 初期状態で購入ボタンを無効化（未ログイン状態）
  updatePurchaseButtonsState(null);
  
  // デバッグ用: 5秒間隔で状態を表示
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setInterval(() => {
      console.log('=== 現在の状態 ===');
      console.log('state.user:', state.user);
      const purchaseBtn = document.getElementById('purchaseBtn');
      if (purchaseBtn) {
        console.log('購入ボタン状態:', {
          disabled: purchaseBtn.disabled,
          textContent: purchaseBtn.textContent,
          className: purchaseBtn.className
        });
      }
      console.log('==================');
    }, 5000);
  }
}
startup();
