
// Firebase認証基盤統合版 - メインアプリケーション
console.log('🚀 app.js 読み込み開始 - Version 20241219-001');

// Firebase Firestore 関数のインポート（entitlements チェック用）
import { 
  db, collection, doc, getDoc, getDocs, onSnapshot, setDoc,
  auth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, 
  createUserWithEmailAndPassword, sendEmailVerification 
} from './firebaseConfig.js';

// DOMContentLoadedでアプリケーション全体を初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOMContentLoaded: app.js 初期化開始');
  
  // Firebase認証オブジェクトをグローバルに公開（index.htmlの認証UI用）
  window.firebaseAuth = { 
    auth, signOut, signInWithEmailAndPassword, signInWithPopup, 
    GoogleAuthProvider, sendPasswordResetEmail, createUserWithEmailAndPassword, 
    sendEmailVerification, onAuthStateChanged 
  };
  
  // syncFirebaseAuth関数を定義してグローバルに公開
  window.syncFirebaseAuth = function(user) {
    console.log('🔄 syncFirebaseAuth 開始:', user ? `uid: ${user.uid}` : 'ログアウト');
    state.user = user || null;
    const isIn = !!user;
    
    if (user) {
      console.log('✅ ユーザー情報を state に保存:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
    }
    
    // 1) 画面の表示/非表示トグル（クラスで切替）
    document.documentElement.classList.toggle('is-auth', isIn);
    
    // 2) ログインカードを隠す
    const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
    if (loginPanel) {
      loginPanel.classList.toggle('hidden', isIn);
      if (isIn) {
        loginPanel.style.display = 'none';
      } else {
        loginPanel.style.display = 'block';
      }
    }
    
    // 3) ヘッダーボタンの表示制御を修正
    updateHeaderButtons(user);
    
    // 4) 購入ボタンの状態を更新
    updatePurchaseButtonsState(user);
    
    // UI更新処理があればここに追加
    try {
      if (typeof renderAppView === 'function') {
        renderAppView();
      }
    } catch (error) {
      console.warn('⚠️ UI更新中にエラー:', error);
    }
    
    console.log('🎯 UI切り替え完了:', isIn ? 'ログイン状態' : 'ログアウト状態');
  };
  
  // Firebase認証状態の監視を設定
  onAuthStateChanged(auth, (user) => {
    console.log('🔥 Firebase認証状態変化:', user ? 'ログイン' : 'ログアウト');
    window.syncFirebaseAuth(user);
  });
  
  // イベント委譲を設定
  console.log('🚀 DOMContentLoaded: イベント委譲を設定します');
  setupGlobalEventDelegation();
  
  // アプリケーションの初期化を実行
  await startup();
  
  // 初期化時にログイン状態を強制的に確認
  console.log('🔄 初期化時のログイン状態確認');
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('✅ 初期化時にログインユーザーを検出:', currentUser.uid);
    window.syncFirebaseAuth(currentUser);
  } else {
    console.log('❌ 初期化時にログインユーザーなし');
    window.syncFirebaseAuth(null);
  }
  
  // currentSubject変数の初期化を確実にする
  console.log('🔄 currentSubject変数の状態確認:', window.currentSubject);
  if (typeof window.currentSubject === 'undefined' || window.currentSubject === null) {
    window.currentSubject = 'recommended';
    console.log('🔄 currentSubject変数を初期化:', window.currentSubject);
  }
  
  // ===== ビュー切替制御とタブイベントリスナーを追加 =====
  console.log('🎯 ビュー切替制御を初期化');
  
  // ビュー切替関数
  const homeView = document.getElementById("homeView");
  const lessonView = document.getElementById("lessonView");
  
  function showHomeView() {
    if (homeView) {
      homeView.classList.remove("hidden");
      homeView.style.display = "block";
    }
    if (lessonView) {
      lessonView.classList.add("hidden");
    }
    console.log('📱 ホームビューを表示');
  }
  
  function showLessonView() {
    if (lessonView) {
      lessonView.classList.remove("hidden");
      lessonView.style.display = "block";
    }
    if (homeView) {
      homeView.classList.add("hidden");
    }
    console.log('📚 レッスンビューを表示');
  }
  
  // タブイベントリスナーはsetupSubjectTabs関数で設定されるため、ここでは設定しない
  
  // 初期起動時にホームを表示
  showHomeView();
  
  // ビュー切替関数をグローバルに公開
  window.showHomeView = showHomeView;
  window.showLessonView = showLessonView;
  
  console.log('✅ DOMContentLoaded: app.js 初期化完了');
});

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
  userEntitlements: new Set(), // ユーザーの購入済みコンテンツ
  wrongQuestions: [], // 間違えた問題の記録
  reviewLessons: [] // 動的に生成された復習レッスン
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
      '🗺️ 地理分野': ['国土・地形・気候', '地図・地形図記号', '都道府県・都市', '農林水産業', '工業・エネルギー', '商業・貿易・交通', '地方別地理'],
      '📚 歴史分野': ['縄文・弥生時代', '古墳時代', '飛鳥時代', '奈良時代']
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
      '🗺️ 地理分野': ['国土・地形・気候', '地図・地形図記号', '日本の地域特色', '農林水産業', '工業・エネルギー', '商業・貿易・交通', '地方別地理', '環境問題', '情報・通信'],
      '📚 歴史分野': ['平安時代', '鎌倉時代', '室町時代', '安土桃山時代'],
      '🏛️ 公民分野': ['国際協力']
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
      '🗺️ 地理分野': ['世界の国々', '領土と領海', '資源とエネルギー', '現代の産業', '地球環境', '世界の文化'],
      '📚 歴史分野': ['江戸時代', '明治維新', '大正・昭和', '現代の日本'],
      '🏛️ 公民分野': ['日本国憲法', '三権分立', '地方自治', '国際社会']
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
  console.log('🔄 entitlements変更によりUI更新開始');
  
  // 常にアプリビューを表示（LPは無効化）
  console.log('📚 アプリビューを強制表示');
  renderAppView();
  
  // モーダルの更新
  renderModalContent();
  
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
  showModernNotification('ログインが必要です', 'アカウントにサインインして学習を始めましょう', 'info');
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

// モダンな通知システム
function showModernNotification(title, message, type = 'info') {
  // 既存の通知を削除
  const existingNotification = document.querySelector('.modern-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 通知要素を作成
  const notification = document.createElement('div');
  notification.className = 'modern-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-left: 4px solid ${getTypeColor(type)};
    padding: 20px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // アイコンとタイトル
  const icon = getTypeIcon(type);
  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 24px; flex-shrink: 0;">${icon}</div>
      <div style="flex: 1;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${title}</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none; border: none; font-size: 18px; color: #9ca3af; 
        cursor: pointer; padding: 4px; border-radius: 4px;
        transition: color 0.2s ease;
      " onmouseover="this.style.color='#6b7280'" onmouseout="this.style.color='#9ca3af'">×</button>
    </div>
  `;

  // ドキュメントに追加
  document.body.appendChild(notification);

  // アニメーション
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // 自動削除（5秒後）
    setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

function getTypeColor(type) {
  const colors = {
    'info': '#3b82f6',
    'success': '#10b981',
    'warning': '#f59e0b',
    'error': '#ef4444'
  };
  return colors[type] || colors['info'];
}

function getTypeIcon(type) {
  const icons = {
    'info': 'ℹ️',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌'
  };
  return icons[type] || icons['info'];
}

// 古いsyncFirebaseAuth関数を削除（新しい関数を使用）

// ヘッダーボタンの表示制御を修正する関数
function updateHeaderButtons(user) {
  console.log('🔄 updateHeaderButtons 呼び出し:', user ? '認証済み' : '未認証');
  
  const loginBtn = document.getElementById('btnLogin');
  const logoutBtn = document.getElementById('btnLogout');
  
  if (user) {
    // ログイン状態：ログインボタンを隠し、ログアウトボタンを表示
    if (loginBtn) {
      loginBtn.classList.add('hidden');
      loginBtn.style.display = 'none';
    }
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.style.display = 'inline-block';
    }
    console.log('✅ ログイン状態: ログインボタンを隠し、ログアウトボタンを表示');
  } else {
    // ログアウト状態：ログインボタンを表示し、ログアウトボタンを隠す
    if (loginBtn) {
      loginBtn.classList.remove('hidden');
      loginBtn.style.display = 'inline-block';
    }
    if (logoutBtn) {
      logoutBtn.classList.add('hidden');
      logoutBtn.style.display = 'none';
    }
    console.log('✅ ログアウト状態: ログインボタンを表示し、ログアウトボタンを隠す');
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
  
  // ログイン状態に応じてボタンの表示を確実に制御
  setTimeout(() => {
    if (user && headerPurchaseBtn) {
      // ログイン済みの場合、購入ボタンを有効化
      const isEmailVerified = user.emailVerified || user.providerData?.some(provider => provider.providerId !== 'password');
      if (isEmailVerified) {
        headerPurchaseBtn.disabled = false;
        headerPurchaseBtn.textContent = '💳 購入';
        headerPurchaseBtn.className = 'px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition-colors duration-200';
        headerPurchaseBtn.title = '';
        console.log('✅ 購入ボタンを最終的に有効化しました');
      }
    }
  }, 500);
  
  // LP内の購入ボタンも更新
  updateLPPurchaseButtons(user);
  
  // モーダル内の購入ボタンも更新
  updateModalPurchaseButtons(user);
}

// syncFirebaseAuth関数は既にwindow.syncFirebaseAuthとして定義済み
console.log("🚀 syncFirebaseAuth は既にグローバルに公開済み");

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
  const detail = { correct, total, timeSec: seconds };
  
  console.log('💾 進捗保存詳細:', {
    id: id,
    correct: correct,
    total: total,
    score: score,
    detail: detail
  });
  
  saveProgress(id, score, detail);
}

// 学習履歴の保存処理を追加
function saveLearningHistory(lessonId, mode, sessionData) {
  try {
    const historyKey = `learningHistory_${mode}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '{"sessions":[]}');
    
    // 新しいセッションを追加
    existingHistory.sessions.push({
      lessonId: lessonId,
      mode: mode,
      timestamp: Date.now(),
      ...sessionData
    });
    
    // 履歴を保存
    localStorage.setItem(historyKey, JSON.stringify(existingHistory));
    console.log(`✅ 学習履歴を保存しました: ${historyKey}`);
  } catch (e) {
    console.error('❌ 学習履歴の保存に失敗しました:', e);
  }
}

// 開発/手動テスト用にグローバルへ公開
if (typeof window !== 'undefined') {
  try {
    window.saveLessonProgress = saveLessonProgress;
    window.getLessonProgress = getLessonProgress;
    window.saveLearningHistory = saveLearningHistory;
    window.isLessonCompleted = isLessonCompleted;
  } catch (e) {
    // noop
  }
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

// getCurrentMode()関数は削除（分離されたIDにより不要）

// 進捗キーの解決（分離されたID用）
function getProgressStorageKey(lessonId) {
  // 分離されたIDを使用（mode判定不要）
  const progressKey = `progress:${lessonId}`;
  console.log(`🔍 進捗キー生成: ${lessonId} → ${progressKey}`);
  return progressKey;
}

// 教材の進捗状況を取得する関数
function getLessonProgress(lessonId) {
  const key = getProgressStorageKey(lessonId);
  try {
    const progress = localStorage.getItem(key);
    const result = progress ? JSON.parse(progress) : null;
    
    console.log(`🔍 進捗データ取得: ${lessonId}`, {
      key: key,
      raw: progress,
      parsed: result,
      hasData: !!result
    });
    
    return result;
  } catch (e) {
    console.error(`❌ 進捗データ取得エラー: ${lessonId}`, e);
    return null;
  }
}

// 教材が完了しているかチェックする関数（分離されたID用）
function isLessonCompleted(lessonId) {
  // 分離されたIDを使用（mode判定不要）
  const progressKey = `progress:${lessonId}`;
  const progressData = localStorage.getItem(progressKey);
  
  if (!progressData) {
    console.log(`❌ 進捗データなし: ${lessonId} → ${progressKey}`);
    return false;
  }
  
  try {
    const progress = JSON.parse(progressData);
    const correctAnswers = progress.detail?.correct || 0;
    const isCompleted = correctAnswers > 0;
    
    console.log(`📊 完了判定: ${lessonId} → ${isCompleted ? '完了' : '未完了'}`);
    return isCompleted;
  } catch (e) {
    console.error(`❌ 進捗データ解析エラー: ${lessonId}`, e);
    return false;
  }
}

// レッスンIDの移行処理（分離されたIDを使用するため不要）
function migrateLessonProgress() {
  console.log('🔄 分離されたIDを使用するため移行処理は不要');
  return false;
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
  console.log('🔍 loadCatalog開始');
  const tryUrls = ['./catalog.json', '../catalog.json'];
  let lastErr = null;
  for (const url of tryUrls){
    console.log('🔍 試行中:', url);
    try{
      const res = await fetch(url);
      if (res.ok){ 
        state.catalog = await res.json(); 
        console.log('🔍 catalog読み込み成功:', state.catalog.length, '件');
        lastErr=null; 
        break; 
      }
      lastErr = new Error(`${url} not ok`);
    }catch(e){ 
      console.log('🔍 fetchエラー:', e.message);
      lastErr = e; 
    }
  }
  if (lastErr){
    console.warn('catalog.json が見つからないため、デモデータを使用します。', lastErr);
    state.catalog = [{
      id:'demo.sample', title:'デモ教材', grade:5, subject:'math',
      path:'./output.html', duration_min:8, sku_required:null
    }];
    console.log('🔍 デモデータ設定完了:', state.catalog);
  }
  console.log('🔍 loadCatalog完了:', state.catalog);
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
  else if (view==='review') renderReviewLesson(arg);
  else { 
    clearSessionResult(); // デフォルトでホームに戻る時もクリア
    showOnly('home'); 
    renderHome(); 
  }
}
function showOnly(which){
  const map = { home:'homeView', lesson:'lessonView', purchase:'purchaseView', result:'resultView', review:'homeView' };
  for (const k in map){ 
    const el=document.getElementById(map[k]); 
    if(el) {
      el.classList.toggle('hidden', k!==which);
      
      // 🚨 homeView が表示される場合は、強制的に表示状態にする
      if (k === which && map[k] === 'homeView') {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        console.log('🚨 showOnly: homeView を強制的に表示状態に設定');
      }
    }
  }
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
    'eng': '英語',
    'review': '復習レッスン'
  };
  return subjectMap[subject] || subject;
}

// 現在選択されている教科（windowオブジェクトで管理）
window.currentSubject = 'recommended';

// 配列の宣言
var scienceUnits = [];
var socialUnits = [];
var scienceDrillUnits = [];
var socialDrillUnits = [];

// 現在選択されている単元（算数の場合）
var selectedUnit = null;

// 理科の分野定義
scienceUnits = [
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
socialUnits = [
  {
    id: 'geography',
    name: '地理分野',
    icon: '🗺️',
        lessons: [
          'soc.geography.land_topography_climate_wakaru',
          'soc.geography.agriculture_forestry_fishery_wakaru',
          'soc.geography.prefectures_cities_wakaru',
          'soc.geography.industry_energy_wakaru',
          'soc.geography.commerce_trade_transportation_wakaru',
          'soc.geography.environment_wakaru',
          'soc.geography.information_wakaru',
          'soc.geography.maps_symbols_wakaru',
          'soc.geography.hokkaido_region_wakaru',
          'soc.geography.tohoku_region_wakaru',
          'soc.geography.kanto_region_wakaru',
          'soc.geography.chubu_region_wakaru',
          'soc.geography.kinki_region_wakaru',
          'soc.geography.chugoku_shikoku_region_wakaru',
          'soc.geography.kyushu_region_wakaru',
          'soc.geography.world_geography_wakaru'
        ]
  },
  {
    id: 'history',
    name: '歴史分野',
    icon: '📜',
    lessons: [
      'soc.history.kofun_asuka',
      'soc.history.nara_period',
      'soc.history.heian_period',
      'soc.history.kamakura_period',
      'soc.history.muromachi_period',
      'soc.history.azuchi_momoyama',
      'soc.history.edo_period',
      'soc.history.meiji_period',
      'soc.history.taisho_showa_prewar',
      'soc.history.showa_postwar',
      'soc.history.heisei_reiwa',
      'soc.history.cross_period_problems'
    ]
  },
  {
    id: 'civics',
    name: '公民分野',
    icon: '🏛️',
    lessons: [
      'soc.civics.politics_national_life',
      'soc.civics.constitution_three_principles',
      'soc.civics.diet_cabinet_judiciary',
      'soc.civics.finance_local_government',
      'soc.civics.world_affairs_international',
      'soc.civics.modern_social_issues'
    ]
  }
];

// 理科おぼえる編の分野定義
  // 理科のおぼえる編教材が少ないため、今後追加予定

// 社会おぼえる編の分野定義
socialDrillUnits = [
  {
    id: 'geography_drill',
    name: '地理分野',
    icon: '🗺️',
    lessons: [
      'soc.geography.land_topography_climate_oboeru',
      'soc.geography.agriculture_forestry_fishery_oboeru',
      'soc.geography.prefectures_cities_oboeru',
      'soc.geography.industry_energy_oboeru',
      'soc.geography.environment_oboeru',
      'soc.geography.information_oboeru',
      'soc.geography.maps_symbols_oboeru',
      'soc.geography.hokkaido_region_oboeru',
      'soc.geography.tohoku_region_oboeru',
      'soc.geography.kanto_region_oboeru',
      'soc.geography.chubu_region_oboeru',
      'soc.geography.kinki_region_oboeru',
      'soc.geography.chugoku_shikoku_region_oboeru',
      'soc.geography.kyushu_region_oboeru',
      'soc.geography.world_geography_oboeru',
      'soc.geography.commerce_trade_transportation_oboeru'
    ]
  },
  {
    id: 'history_drill',
    name: '歴史分野',
    icon: '📜',
    lessons: [
      'soc.history.kofun_asuka_oboeru',
      'soc.history.nara_period_oboeru',
      'soc.history.heian_period_oboeru',
      'soc.history.kamakura_period_oboeru',
      'soc.history.muromachi_period_oboeru',
      'soc.history.azuchi_momoyama_oboeru',
      'soc.history.edo_period_oboeru',
      'soc.history.meiji_period_oboeru',
      'soc.history.taisho_showa_prewar_oboeru',
      'soc.history.showa_postwar_oboeru',
      'soc.history.heisei_reiwa_oboeru',
      'soc.history.cross_period_problems_oboeru'
    ]
  },
  {
    id: 'civics_drill',
    name: '公民分野',
    icon: '🏛️',
    lessons: [
      'soc.civics.constitution_oboeru',
      'soc.civics.government_oboeru',
      'soc.civics.politics_national_life_oboeru',
      'soc.civics.finance_local_government_oboeru',
      'soc.civics.world_affairs_international_oboeru',
      'soc.civics.modern_social_issues_oboeru'
    ]
  }
];

// おすすめ教材を選択する関数
function getRecommendedLessons() {
  console.log('getRecommendedLessons called');
  const recommendations = [];
  
  console.log('カタログ:', state.catalog ? `${state.catalog.length}件` : 'undefined');
  console.log('復習レッスン:', state.reviewLessons ? `${state.reviewLessons.length}件` : 'undefined');
  
  // 1. 復習レッスンを最優先で追加
  if (state.reviewLessons && state.reviewLessons.length > 0) {
    console.log('復習レッスンをおすすめに追加:', state.reviewLessons);
    // 復習レッスンを通常のレッスン形式に変換
    state.reviewLessons.forEach(reviewLesson => {
      const reviewEntry = {
        id: reviewLesson.id,
        title: reviewLesson.title,
        subject: 'review', // 復習レッスン専用のsubject
        grade: '復習',
        duration_min: Math.ceil(reviewLesson.questions.length * 1.5), // 問題数 × 1.5分
        sku_required: false,
        type: 'review',
        reviewLesson: reviewLesson // 元の復習レッスンデータを保持
      };
      recommendations.push(reviewEntry);
    });
  } else {
    console.log('復習レッスンはありません');
  }
  
  // 理科・社会それぞれで1つずつ推薦
  // 理科：sci（わかる編）→ science_drill（おぼえる編）の順
  // 社会：soc（わかる編）→ social_drill（おぼえる編）の順
  const subjectGroups = [
    { name: '理科', subjects: ['sci', 'science_drill'] },
    { name: '社会', subjects: ['soc', 'social_drill'] }
  ];
  
  subjectGroups.forEach(group => {
    console.log(`${group.name}分野の処理開始`);
    let recommendedLesson = null;
    
    // わかる編→おぼえる編の順で処理
    for (const subject of group.subjects) {
    console.log(`${subject}教科の処理開始`);
      
      // カタログからその教科の教材を取得し、IDでソート（番号順）
      const subjectLessons = state.catalog
        .filter(entry => entry.subject === subject)
        .sort((a, b) => a.id.localeCompare(b.id));
      
    console.log(`${subject}教科の教材:`, subjectLessons);
    
    if (subjectLessons.length === 0) {
      console.log(`${subject}教科の教材がありません`);
        continue;
      }
      
      // 最後に取り組んだ教材を特定（時系列順）
    const completedLessons = subjectLessons
      .filter(entry => {
        const isCompleted = isLessonCompleted(entry.id);
        console.log(`🔍 推薦システム完了チェック: ${entry.id} → ${isCompleted ? '完了' : '未完了'}`);
        return isCompleted;
      })
      .sort((a, b) => {
        const progressA = getLessonProgress(a.id);
        const progressB = getLessonProgress(b.id);
        return (progressB?.at || 0) - (progressA?.at || 0);
      });
    
    console.log(`${subject}教科の完了済み教材:`, completedLessons);
      
      let nextLesson = null;
    
    if (completedLessons.length > 0) {
        // 最後に完了した教材の次の教材を探す
      const lastCompleted = completedLessons[0];
      const lastCompletedIndex = subjectLessons.findIndex(entry => entry.id === lastCompleted.id);
      console.log(`${subject}教科の最後に完了した教材:`, lastCompleted, 'インデックス:', lastCompletedIndex);
      
      if (lastCompletedIndex < subjectLessons.length - 1) {
        nextLesson = subjectLessons[lastCompletedIndex + 1];
        console.log(`${subject}教科の次の教材:`, nextLesson);
      } else {
          console.log(`${subject}教科はすべて完了済み`);
      }
    } else {
      // 完了した教材がない場合は最初の教材を推薦
      nextLesson = subjectLessons[0];
      console.log(`${subject}教科の最初の教材を推薦:`, nextLesson);
    }
    
      // 未完了の教材が見つかったら推薦として採用
    if (nextLesson && !isLessonCompleted(nextLesson.id)) {
        console.log(`${group.name}分野の推薦教材:`, nextLesson);
        recommendedLesson = nextLesson;
        break; // わかる編で見つかったらおぼえる編は見ない
      }
    }
    
    // その分野の推薦教材があれば追加
    if (recommendedLesson) {
      console.log(`${group.name}分野の教材を推薦リストに追加:`, recommendedLesson);
      recommendations.push(recommendedLesson);
    } else {
      console.log(`${group.name}分野に推薦できる教材がありません`);
    }
  });
  
  console.log('最終的な推薦リスト（復習レッスン含む）:', recommendations);
  
  return recommendations;
}

// 教科別タブのイベントリスナーを設定
function setupSubjectTabs() {
  const subjectTabs = document.querySelectorAll('.subject-tab');
  
  // 既存のイベントリスナーを削除
  subjectTabs.forEach(tab => {
    tab.removeEventListener('click', handleTabClick);
  });
  
  // 新しいイベントリスナーを追加
  subjectTabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });
}

// タブクリックハンドラーを分離
async function handleTabClick(event) {
  const tab = event.currentTarget;
      console.log('📌 タブクリック:', tab.dataset.subject);
  
  const subjectTabs = document.querySelectorAll('.subject-tab');
      
      // アクティブなタブを更新
      subjectTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 選択された教科を更新
  const newSubject = tab.dataset.subject || 'recommended';
  window.currentSubject = newSubject;
  console.log('📌 currentSubject更新:', window.currentSubject);
      
      // 教科に応じたイラストを更新
  updateSubjectHero(window.currentSubject);
      
      // 教材一覧を再描画
      console.log('📌 renderHome()を呼び出し');
  await renderHome();
}

async function renderHome(){
  // currentSubjectの存在確認と初期化
  if (typeof window.currentSubject === 'undefined' || window.currentSubject === null) {
    window.currentSubject = 'recommended';
    console.log('🔄 renderHome内でcurrentSubjectを初期化:', window.currentSubject);
  }
  
  // currentSubjectの安全な取得
  const safeCurrentSubject = window.currentSubject || 'recommended';
  console.log('🔄 renderHome内でsafeCurrentSubjectを設定:', safeCurrentSubject);
  
  const homeView = document.getElementById('homeView');
  const app = document.getElementById('app');
  
  // 復習ダッシュボード専用表示は削除（復習レッスンは通常のおすすめレッスンに統合）
  
  // 理科・社会・おぼえる編の場合は2カラムレイアウトに変更
  if (safeCurrentSubject === 'sci' || safeCurrentSubject === 'soc' || safeCurrentSubject === 'science_drill' || safeCurrentSubject === 'social_drill') {
    homeView.classList.add('math-full-width');
    app.classList.add('math-full-width');
    
    // homeView の基本構造を復元（復習ダッシュボードから切り替えた場合）
    if (!document.getElementById('lessonList')) {
      console.log('🔧 lessonList要素が見つからないため、基本構造を復元します');
      
      // 現在の教科に応じたヒーロー情報を取得
      const subjectInfo = getSubjectHeroInfo(safeCurrentSubject);
      
      homeView.innerHTML = `
        <!-- 横長イラストエリア -->
        <div class="w-full h-44 mb-6 overflow-hidden relative">
          <!-- イラスト表示エリア -->
          <div id="subjectHero" class="w-full h-full ${subjectInfo.bgClass} flex items-center justify-center">
            <div class="text-white text-center">
              <div class="text-4xl mb-2">${subjectInfo.icon}</div>
              <div class="text-xl font-bold">${subjectInfo.title}</div>
            </div>
          </div>
        </div>
        
        <!-- 教科別タブ -->
        <div class="subject-tabs mb-6">
          <button class="subject-tab" data-subject="recommended">⭐ おすすめ学習</button>
          <button class="subject-tab" data-subject="sci">🔬 理科わかる</button>
          <button class="subject-tab" data-subject="science_drill">🧪 理科おぼえる</button>
          <button class="subject-tab" data-subject="soc">🌍 社会わかる</button>
          <button class="subject-tab" data-subject="social_drill">📍 社会おぼえる</button>
        </div>
        
        <div id="lessonList" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      `;
      
      // タブのイベントリスナーを再設定
      setupSubjectTabs();
      
      // アクティブなタブを設定
      const tabs = document.querySelectorAll('.subject-tab');
      tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.subject === safeCurrentSubject) {
          tab.classList.add('active');
        }
      });
      
      // ヒーローを現在の教科に合わせて更新
      updateSubjectHero(safeCurrentSubject);
    }
    
    if (safeCurrentSubject === 'sci') {
      renderScienceUnits();
    } else if (safeCurrentSubject === 'soc') {
      await renderSocialUnits();
    } else if (safeCurrentSubject === 'science_drill') {
      renderScienceDrillUnits();
    } else if (safeCurrentSubject === 'social_drill') {
      await renderSocialDrillUnits();
    }
    return;
  } else {
    // 他の教科の場合は通常レイアウトに戻す
    homeView.classList.remove('math-full-width');
    app.classList.remove('math-full-width');
  }
  
  const list = document.getElementById('lessonList');
  if (!list) {
    console.error('❌ lessonList要素が見つかりません。基本構造を復元します。');
    // 基本的なHTML構造を復元
    homeView.innerHTML = `
      <div id="lessonList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
    // 再帰的に呼び出し
    renderHome();
    return;
  }
  list.innerHTML='';
  
  // safeCurrentSubjectは既に関数の最初で定義済み
  console.log('renderHome called, currentSubject:', safeCurrentSubject);
  
  let displayCatalog;
  
  if (safeCurrentSubject === 'recommended') {
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
    displayCatalog = state.catalog.filter(entry => entry.subject === safeCurrentSubject);
    console.log(`${safeCurrentSubject}の教材:`, displayCatalog);
    
    // 社会おぼえる編の場合は単元別表示を使用
    if (safeCurrentSubject === 'social_drill') {
      console.log('🔍 社会おぼえる編の単元別表示を実行');
      await renderSocialDrillUnits();
      return;
    }
    
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
    
    const reviewClass = entry.type === 'review' ? 'review' : '';
    div.className=`card p-4 ${entry.subject} ${reviewClass} ${isCompleted ? 'completed' : ''}`;
    
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
    let recommendationBadge = '';
    if (safeCurrentSubject === 'recommended') {
      if (entry.type === 'review') {
        recommendationBadge = `<span class="badge review">🎓 復習</span>`;
      } else {
        recommendationBadge = `<span class="badge recommend">⭐ おすすめ</span>`;
      }
    }
    
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
    
    // 復習レッスンの場合は専用の処理
    if (entry.type === 'review') {
      div.onclick = () => openReviewLesson(entry.id);
    } else {
      div.onclick = () => setHash('lesson', entry.id);
    }
    
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
async function renderSocialUnits() {
  console.log('🔍 renderSocialUnits called');
  
  // state.catalogが未初期化の場合は待機
  if (!state.catalog || state.catalog.length === 0) {
    console.log('🔍 state.catalogが未初期化のため、loadCatalogを実行します');
    try {
      await loadCatalog();
      console.log('🔍 loadCatalog完了:', state.catalog);
      
      // さらに確実にするため、少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ loadCatalogエラー:', error);
      return;
    }
  }
  
  // 配列が空の場合は再初期化
  if (!socialUnits || socialUnits.length === 0) {
    console.log('🔍 socialUnitsが空のため再初期化します');
    socialUnits = [
      {
        id: 'geography',
        name: '地理分野',
        icon: '🗺️',
        lessons: [
          'soc.geography.land_topography_climate_wakaru',
          'soc.geography.agriculture_forestry_fishery_wakaru',
          'soc.geography.prefectures_cities_wakaru',
          'soc.geography.industry_energy_wakaru',
          'soc.geography.commerce_trade_transportation_wakaru',
          'soc.geography.environment_wakaru',
          'soc.geography.information_wakaru',
          'soc.geography.maps_symbols_wakaru',
          'soc.geography.hokkaido_region_wakaru',
          'soc.geography.tohoku_region_wakaru',
          'soc.geography.kanto_region_wakaru',
          'soc.geography.chubu_region_wakaru',
          'soc.geography.kinki_region_wakaru',
          'soc.geography.chugoku_shikoku_region_wakaru',
          'soc.geography.kyushu_region_wakaru',
          'soc.geography.world_geography_wakaru'
        ]
      },
      {
        id: 'history',
        name: '歴史分野',
        icon: '📜',
        lessons: [
          'soc.history.kofun_asuka_wakaru',
          'soc.history.nara_period_wakaru',
          'soc.history.heian_period_wakaru',
          'soc.history.kamakura_period_wakaru',
          'soc.history.muromachi_period_wakaru',
          'soc.history.azuchi_momoyama_wakaru',
          'soc.history.edo_period_wakaru',
          'soc.history.meiji_period_wakaru',
          'soc.history.taisho_showa_prewar_wakaru',
          'soc.history.showa_postwar_wakaru',
          'soc.history.heisei_reiwa_wakaru',
          'soc.history.cross_period_problems_wakaru'
        ]
      },
      {
        id: 'civics',
        name: '公民分野',
        icon: '🏛️',
        lessons: [
          'soc.civics.politics_national_life_wakaru',
          'soc.civics.constitution_three_principles_wakaru',
          'soc.civics.diet_cabinet_judiciary_wakaru',
          'soc.civics.finance_local_government_wakaru',
          'soc.civics.world_affairs_international_wakaru',
          'soc.civics.modern_social_issues_wakaru'
        ]
      }
    ];
    console.log('✅ socialUnitsを初期化しました:', socialUnits.length + '件');
  }
  
  console.log('🔍 socialUnits:', socialUnits);
  renderSubjectUnits(socialUnits, '社会');
  
  // わかる編の進捗表示を強制更新
  console.log('🔄 わかる編の進捗表示を強制更新');
  setTimeout(() => {
    const unitItems = document.querySelectorAll('.unit-item');
    unitItems.forEach((item, index) => {
      const title = item.querySelector('.unit-item-title');
      if (title && title.textContent.includes('地理分野')) {
        console.log(`✅ 地理分野の要素を発見 (インデックス: ${index})`);
        
        // わかる編の進捗を計算（分離されたIDを使用）
        let geographyLessons = state.catalog ? state.catalog.filter(lesson => 
          lesson.id.includes('soc.geography') && lesson.id.includes('_wakaru')
        ) : [];
        
        console.log('🔍 地理分野ボタンクリック時のデバッグ情報:');
        console.log('🔍 state.catalog:', state.catalog ? state.catalog.length : 'null');
        console.log('🔍 geographyLessons:', geographyLessons.length);
        console.log('🔍 geographyLessons詳細:', geographyLessons.map(l => l.id));
        
        // わかる編のレッスン数が正しくない場合のデバッグ
        if (geographyLessons.length !== 16) {
          console.warn('⚠️ わかる編の地理分野レッスン数が正しくありません:', geographyLessons.length, '/ 16');
          console.warn('⚠️ state.catalogの内容:', state.catalog);
          
          // ハードコードされたレッスンリストを使用
          const hardcodedLessons = [
            'soc.geography.land_topography_climate_wakaru',
            'soc.geography.agriculture_forestry_fishery_wakaru',
            'soc.geography.prefectures_cities_wakaru',
            'soc.geography.industry_energy_wakaru',
            'soc.geography.commerce_trade_transportation_wakaru',
            'soc.geography.environment_wakaru',
            'soc.geography.information_wakaru',
            'soc.geography.maps_symbols_wakaru',
            'soc.geography.hokkaido_region_wakaru',
            'soc.geography.tohoku_region_wakaru',
            'soc.geography.kanto_region_wakaru',
            'soc.geography.chubu_region_wakaru',
            'soc.geography.kinki_region_wakaru',
            'soc.geography.chugoku_shikoku_region_wakaru',
            'soc.geography.kyushu_region_wakaru',
            'soc.geography.world_geography_wakaru'
          ];
          
          console.log('🔧 ハードコードされたレッスンリストを使用:', hardcodedLessons.length);
          geographyLessons = hardcodedLessons.map(id => ({ id: id }));
        }
        
        const completedCount = geographyLessons.filter(lesson => {
          // 分離されたIDを使用（mode判定不要）
          const progressKey = `progress:${lesson.id}`;
          const progressData = localStorage.getItem(progressKey);
          if (progressData) {
            const parsed = JSON.parse(progressData);
            console.log(`🔍 わかる編データ確認: ${lesson.id} → ${progressKey}`);
            const isCompleted = parsed.detail?.correct > 0;
            console.log(`🔍 わかる編進捗チェック: ${lesson.id} → ${isCompleted ? '完了' : '未完了'}`);
            return isCompleted;
          }
          return false;
        }).length;
        
        console.log(`🔍 わかる編完了レッスン数: ${completedCount} / ${geographyLessons.length}`);
        console.log(`🔍 わかる編進捗計算: ${completedCount} / ${geographyLessons.length} = ${Math.round((completedCount / geographyLessons.length) * 100)}%`);
        
        const progressPercent = Math.round((completedCount / geographyLessons.length) * 100);
        console.log(`計算されたわかる編進捗: ${progressPercent}%`);
        
        // 進捗パーセンテージを更新
        const progressElement = item.querySelector('.unit-item-progress');
        if (progressElement) {
          progressElement.textContent = progressPercent + '%';
          console.log('✅ 地理分野のわかる編進捗を更新しました:', progressPercent + '%');
        } else {
          console.warn('⚠️ 進捗要素が見つかりません');
        }
        
        // 進捗バーも更新
        const progressBar = item.querySelector('.unit-item-progress-fill');
        if (progressBar) {
          progressBar.style.width = progressPercent + '%';
          console.log('✅ わかる編進捗バーを更新しました:', progressPercent + '%');
        }
      }
    });
  }, 200);
}

// 理科おぼえる編の単元別表示を実装
function renderScienceDrillUnits() {
  renderSubjectUnits(scienceDrillUnits, '理科おぼえる');
}

// 社会おぼえる編の単元別表示を実装
async function renderSocialDrillUnits() {
  console.log('🔍 renderSocialDrillUnits called');
  
  // state.catalogが未初期化の場合は待機
  if (!state.catalog || state.catalog.length === 0) {
    console.log('🔍 state.catalogが未初期化のため、loadCatalogを実行します');
    try {
      await loadCatalog();
      console.log('🔍 loadCatalog完了:', state.catalog);
      
      // さらに確実にするため、少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('🔍 待機後のstate.catalog:', state.catalog);
    } catch (error) {
      console.error('❌ loadCatalogエラー:', error);
    }
  }
  
  // 配列が空の場合は再初期化
  if (!socialDrillUnits || socialDrillUnits.length === 0) {
    console.log('🔍 socialDrillUnitsが空のため再初期化します');
    socialDrillUnits = [
      {
        id: 'geography_drill',
        name: '地理分野',
        icon: '🗺️',
        lessons: [
          'soc.geography.land_topography_climate_oboeru',
          'soc.geography.agriculture_forestry_fishery_oboeru',
          'soc.geography.prefectures_cities_oboeru',
          'soc.geography.industry_energy_oboeru',
          'soc.geography.environment_oboeru',
          'soc.geography.information_oboeru',
          'soc.geography.maps_symbols_oboeru',
          'soc.geography.hokkaido_region_oboeru',
          'soc.geography.tohoku_region_oboeru',
          'soc.geography.kanto_region_oboeru',
          'soc.geography.chubu_region_oboeru',
          'soc.geography.kinki_region_oboeru',
          'soc.geography.chugoku_shikoku_region_oboeru',
          'soc.geography.kyushu_region_oboeru',
          'soc.geography.world_geography_oboeru',
          'soc.geography.commerce_trade_transportation_oboeru'
        ]
      },
      {
        id: 'history_drill',
        name: '歴史分野',
        icon: '📜',
        lessons: [
          'soc.history.kofun_asuka_oboeru',
          'soc.history.nara_period_oboeru',
          'soc.history.heian_period_oboeru',
          'soc.history.kamakura_period_oboeru',
          'soc.history.muromachi_period_oboeru',
          'soc.history.azuchi_momoyama_oboeru',
          'soc.history.edo_period_oboeru',
          'soc.history.meiji_period_oboeru',
          'soc.history.taisho_showa_prewar_oboeru',
          'soc.history.showa_postwar_oboeru',
          'soc.history.heisei_reiwa_oboeru',
          'soc.history.cross_period_problems_oboeru'
        ]
      },
      {
        id: 'civics_drill',
        name: '公民分野',
        icon: '🏛️',
        lessons: [
          'soc.civics.constitution_oboeru',
          'soc.civics.government_oboeru',
          'soc.civics.politics_national_life_oboeru',
          'soc.civics.finance_local_government_oboeru',
          'soc.civics.world_affairs_international_oboeru',
          'soc.civics.modern_social_issues_oboeru'
        ]
      }
    ];
  }
  
  console.log('🔍 socialDrillUnits:', socialDrillUnits);
  console.log('🔍 state.catalog after load:', state.catalog);
  renderSubjectUnits(socialDrillUnits, '社会おぼえる');
  
  // 進捗表示を強制更新
  console.log('🔄 進捗表示を強制更新');
  setTimeout(() => {
    const unitItems = document.querySelectorAll('.unit-item');
    unitItems.forEach((item, index) => {
      const title = item.querySelector('.unit-item-title');
      if (title && title.textContent.includes('地理分野')) {
        console.log(`✅ 地理分野の要素を発見 (インデックス: ${index})`);
        
        // 進捗を計算（クイズIDを対象に集計）
        const geographyLessons = state.catalog ? state.catalog.filter(lesson => 
          lesson.id.includes('soc.geography') && lesson.id.includes('_oboeru')
        ) : [];
        
        const completedCount = geographyLessons.filter(lesson => {
          // ID変換処理を適用
          const progressKey = getProgressStorageKey(lesson.id);
          const progressData = localStorage.getItem(progressKey);
          if (progressData) {
            const parsed = JSON.parse(progressData);
            const isCompleted = parsed.detail?.correct > 0;
            console.log(`🔍 進捗チェック: ${lesson.id} → ${progressKey} → ${isCompleted ? '完了' : '未完了'}`);
            return isCompleted;
          }
          return false;
        }).length;
        
        const progressPercent = Math.round((completedCount / geographyLessons.length) * 100);
        console.log(`計算された進捗: ${progressPercent}%`);
        
        // 進捗パーセンテージを更新
        const progressElement = item.querySelector('.unit-item-progress');
        if (progressElement) {
          progressElement.textContent = progressPercent + '%';
          console.log('✅ 地理分野の進捗を更新しました:', progressPercent + '%');
        }
        
        // 進捗バーも更新
        const progressBar = item.querySelector('.unit-item-progress-fill');
        if (progressBar) {
          progressBar.style.width = progressPercent + '%';
          console.log('✅ 進捗バーを更新しました:', progressPercent + '%');
        }
      }
    });
  }, 200);
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
  if (!list) {
    console.error('lessonList element not found');
    return;
  }
  list.className = 'w-full';
  
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
  console.log('🔍 renderUnits called with units:', units);
  console.log('🔍 units type:', typeof units);
  console.log('🔍 units is array:', Array.isArray(units));
  
  if (!units || !Array.isArray(units)) {
    console.error('❌ renderUnits: units is not a valid array:', units);
    return;
  }
  
  const container = document.getElementById('unitsContainer');
  if (!container) {
    console.error('unitsContainer element not found');
    return;
  }
  
  container.innerHTML = '';
  console.log('units:', units.length, 'units');
  
  units.forEach((unit, index) => {
    console.log(`Processing unit ${index + 1}:`, unit.name);
    console.log('🔍 state.catalog:', state.catalog);
    console.log('🔍 unit.lessons:', unit.lessons);
    
    // state.catalogが存在しない場合の安全な処理
    if (!state.catalog) {
      console.error('❌ state.catalog is undefined');
      return;
    }
    
    // その単元のレッスンを取得
    const unitLessons = state.catalog ? state.catalog.filter(lesson => 
      unit.lessons.includes(lesson.id)
    ) : [];
    
    console.log('🔍 unitLessons:', unitLessons);
    
    // 進捗計算
    const completedCount = unitLessons ? unitLessons.filter(lesson => isLessonCompleted(lesson.id)).length : 0;
    const progressPercent = unitLessons && unitLessons.length > 0 ? Math.round((completedCount / unitLessons.length) * 100) : 0;
    
    const unitElement = document.createElement('div');
    const unitLessonsLength = unitLessons ? unitLessons.length : 0;
    const isSelected = (typeof selectedUnit !== 'undefined' && selectedUnit === unit.id);
    unitElement.className = `unit-item ${isSelected ? 'selected' : ''} ${unitLessonsLength === 0 ? 'no-lessons' : ''}`;
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
            <span class="unit-item-count">${unitLessonsLength > 0 ? `${unitLessonsLength}個のレッスン` : '準備中'}</span>
            ${unitLessonsLength > 0 ? `<span class="unit-item-progress">${progressPercent}%</span>` : '<span class="unit-item-progress">-</span>'}
          </div>
          ${unitLessonsLength > 0 ? `
            <div class="unit-item-progress-bar">
              <div class="unit-item-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
          ` : '<div class="unit-item-coming-soon">近日公開予定</div>'}
        </div>
      </div>
    `;
    
    if (unitLessonsLength > 0) {
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
  console.log('🔍 selectUnit called with unitId:', unitId);
  selectedUnit = unitId;
  
  // 現在の教科に応じて適切な配列を初期化
  const safeCurrentSubject = window.currentSubject || 'recommended';
  console.log('🔍 selectUnit: safeCurrentSubject =', safeCurrentSubject);
  
  let currentUnits = [];
  
  if (safeCurrentSubject === 'soc') {
    // わかる編の場合
    if (typeof socialUnits === 'undefined' || !socialUnits || socialUnits.length === 0) {
      console.log('🔧 selectUnit: socialUnits（わかる編）を初期化します');
      socialUnits = [
        {
          id: 'geography',
          name: '地理分野',
          icon: '🗺️',
        lessons: [
          'soc.geography.land_topography_climate_oboeru',
          'soc.geography.agriculture_forestry_fishery_oboeru',
          'soc.geography.prefectures_cities_oboeru',
          'soc.geography.industry_energy_oboeru',
          'soc.geography.environment_oboeru',
          'soc.geography.information_oboeru',
          'soc.geography.maps_symbols_oboeru',
          'soc.geography.hokkaido_region_oboeru',
          'soc.geography.tohoku_region_oboeru',
          'soc.geography.kanto_region_oboeru',
          'soc.geography.chubu_region_oboeru',
          'soc.geography.kinki_region_oboeru',
          'soc.geography.chugoku_shikoku_region_oboeru',
          'soc.geography.kyushu_region_oboeru',
          'soc.geography.world_geography_oboeru',
          'soc.geography.commerce_trade_transportation_oboeru'
        ]
        },
        {
          id: 'history',
          name: '歴史分野',
          icon: '📜',
          lessons: [
            'soc.history.kofun_asuka',
            'soc.history.nara_period',
            'soc.history.heian_period',
            'soc.history.kamakura_period',
            'soc.history.muromachi_period',
            'soc.history.azuchi_momoyama',
            'soc.history.edo_period',
            'soc.history.meiji_period',
            'soc.history.taisho_showa_prewar',
            'soc.history.showa_postwar',
            'soc.history.heisei_reiwa',
            'soc.history.cross_period_problems'
          ]
        },
        {
          id: 'civics',
          name: '公民分野',
          icon: '🏛️',
          lessons: [
            'soc.civics.politics_national_life',
            'soc.civics.constitution_three_principles',
            'soc.civics.diet_cabinet_judiciary',
            'soc.civics.finance_local_government',
            'soc.civics.world_affairs_international',
            'soc.civics.modern_social_issues'
          ]
        }
      ];
      console.log('✅ selectUnit: socialUnits（わかる編）を初期化しました:', socialUnits.length + '件');
    }
    currentUnits = socialUnits;
  } else if (safeCurrentSubject === 'social_drill') {
    // 覚える編の場合
    if (typeof socialDrillUnits === 'undefined' || !socialDrillUnits || socialDrillUnits.length === 0) {
      console.log('🔧 selectUnit: socialDrillUnits（覚える編）を初期化します');
      socialDrillUnits = [
        {
          id: 'geography_drill',
          name: '地理分野',
          icon: '🗺️',
          lessons: [
            'soc.geography.land_topography_climate_oboeru',
            'soc.geography.agriculture_forestry_fishery_oboeru',
            'soc.geography.prefectures_cities_oboeru',
            'soc.geography.industry_energy_oboeru',
            'soc.geography.environment_oboeru',
            'soc.geography.information_oboeru',
            'soc.geography.maps_symbols_oboeru',
            'soc.geography.hokkaido_region_oboeru',
            'soc.geography.tohoku_region_oboeru',
            'soc.geography.kanto_region_oboeru',
            'soc.geography.chubu_region_oboeru',
            'soc.geography.kinki_region_oboeru',
            'soc.geography.chugoku_shikoku_region_oboeru',
            'soc.geography.kyushu_region_oboeru',
            'soc.geography.world_geography_oboeru',
            'soc.geography.commerce_trade_transportation_oboeru'
          ]
        },
        {
          id: 'history_drill',
          name: '歴史分野',
          icon: '📜',
          lessons: [
            'soc.history.kofun_asuka_oboeru',
            'soc.history.nara_period_oboeru',
            'soc.history.heian_period_oboeru',
            'soc.history.kamakura_period_oboeru',
            'soc.history.muromachi_period_oboeru',
            'soc.history.azuchi_momoyama_oboeru',
            'soc.history.edo_period_oboeru',
            'soc.history.meiji_period_oboeru',
            'soc.history.taisho_showa_prewar_oboeru',
            'soc.history.showa_postwar_oboeru',
            'soc.history.heisei_reiwa_oboeru',
            'soc.history.cross_period_problems_oboeru'
          ]
        },
        {
          id: 'civics_drill',
          name: '公民分野',
          icon: '🏛️',
          lessons: [
            'soc.civics.constitution_oboeru',
            'soc.civics.government_oboeru',
            'soc.civics.politics_national_life_oboeru',
            'soc.civics.finance_local_government_oboeru',
            'soc.civics.world_affairs_international_oboeru',
            'soc.civics.modern_social_issues_oboeru'
          ]
        }
      ];
      console.log('✅ selectUnit: socialDrillUnits（覚える編）を初期化しました:', socialDrillUnits.length + '件');
    }
    currentUnits = socialDrillUnits;
  } else if (safeCurrentSubject === 'sci') {
    currentUnits = scienceUnits;
  } else if (safeCurrentSubject === 'science_drill') {
    currentUnits = scienceDrillUnits;
  }
  
  console.log('🔍 selectUnit: currentUnits =', currentUnits);
  console.log('🔍 selectUnit: currentUnits type:', typeof currentUnits);
  console.log('🔍 selectUnit: currentUnits is array:', Array.isArray(currentUnits));
  
  if (!currentUnits || !Array.isArray(currentUnits)) {
    console.error('❌ selectUnit: currentUnits is not a valid array:', currentUnits);
    return;
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
  const safeCurrentSubject = window.currentSubject || 'recommended';
  let currentUnits;
  if (safeCurrentSubject === 'sci') {
    currentUnits = scienceUnits;
  } else if (safeCurrentSubject === 'soc') {
    currentUnits = socialUnits;
  } else if (safeCurrentSubject === 'science_drill') {
    currentUnits = scienceDrillUnits;
  } else if (safeCurrentSubject === 'social_drill') {
    currentUnits = socialDrillUnits;
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
    
    console.log(`🔍 わかる編学習済み判定: ${lesson.id} → ${isCompleted ? '完了' : '未完了'}`);
    
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
  
  console.log('🔍 結果画面デバッグ情報:');
  console.log('  要求されたレッスンID:', id);
  console.log('  セッション結果:', sessionResult);
  console.log('  セッション結果のレッスンID:', sessionResult?.lessonId);
  console.log('  IDマッチ:', sessionResult?.lessonId === id);
  
  // より柔軟なID照合（部分一致も含む）
  const isMatchingLesson = sessionResult && (
    sessionResult.lessonId === id ||
    sessionResult.lessonId.includes(id.replace(/_/g, '.')) ||
    id.includes(sessionResult.lessonId.replace(/\./g, '_')) ||
    // 地理コンテンツの新旧ID形式に対応
    (sessionResult.lessonId.includes('soc.geography') && id.includes('4100')) ||
    (sessionResult.lessonId.includes('4100') && id.includes('land_topography_climate'))
  );
  
  console.log('  ID照合結果:', isMatchingLesson);
  
  if (isMatchingLesson) {
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
            <button data-action="go-home" class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-center transition-all duration-200">
              ホームへ
            </button>
            <button data-action="retry-lesson" data-lesson-id="${id}" class="flex-1 px-4 py-3 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold transition-all duration-200">
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
              <button data-action="go-home" class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-center">
                ホームへ
              </button>
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
            <button data-action="go-home" class="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold">
              ホームへ
            </button>
          </div>
        </div>
      `;
    }
  }
}

// 旧メッセージリスナー（重複防止のため無効化）
// registerProgressAPI()で統一管理されているため、こちらは無効化
console.log('⚠️ 旧メッセージリスナーは無効化されています。registerProgressAPI()を使用してください。');

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
  
  // 新しいgetSubjectHeroInfo関数を使ってヒーロー要素を更新
  if (heroImg) {
    const subjectInfo = getSubjectHeroInfo(subject);
    heroImg.className = `w-full h-full ${subjectInfo.bgClass} flex items-center justify-center`;
    heroImg.innerHTML = `
      <div class="text-white text-center">
        <div class="text-4xl mb-2">${subjectInfo.icon}</div>
        <div class="text-xl font-bold">${subjectInfo.title}</div>
      </div>
    `;
  }
  
  if (!heroMessage) return;
  
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
  console.log('🚫 renderLP() は無効化されています - アプリビューを表示します');
  renderAppView();
  return;
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
  console.log('📱 renderAppView実行 - 学年:', grade);
  
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
  
  // アプリビュー表示後、強制的にホーム画面を描画
  console.log('🏠 renderHome()を強制実行');
  setTimeout(() => {
    renderHome();
  }, 100);
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
  
  const htmlContent = PACKS.map(pack => {
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
      actionButton = `<button class="btn-secondary" data-action="open" data-pack-id="${pack.id}">学習開始</button>`;
    } else if (!user) {
      actionButton = `<button class="btn-primary disabled" disabled title="ログインが必要です" data-action="auth-required" data-type="login">🔒 ログイン必要</button>`;
    } else if (!canPurchase) {
      actionButton = `<button class="btn-primary disabled" disabled title="メールアドレスの確認が必要です" data-action="auth-required" data-type="verify">📧 メール確認必要</button>`;
    } else {
      actionButton = `<button class="btn-primary" data-action="purchase" data-pack-id="${pack.id}">購入する</button>`;
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
          <button class="btn-secondary" data-action="set-grade" data-grade="${pack.grade}">学年に設定</button>
        </div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = htmlContent;
  
  // イベントリスナーを動的に登録
  // 注意: ②本格対応のイベント委譲により、この関数は不要になりました
  // attachModalEventListeners();
  console.log('📝 モーダルコンテンツを生成しました。イベントはグローバル委譲で処理されます。');
}

// モーダル内のイベントリスナーを動的に登録
function attachModalEventListeners() {
  const grid = document.getElementById('modalPackGrid');
  if (!grid) return;
  
  // すべてのボタンにイベントリスナーを追加
  grid.querySelectorAll('button[data-action]').forEach(button => {
    const action = button.getAttribute('data-action');
    const packId = button.getAttribute('data-pack-id');
    const grade = button.getAttribute('data-grade');
    const type = button.getAttribute('data-type');
    
    // 既存のイベントリスナーを削除（重複防止）
    button.replaceWith(button.cloneNode(true));
    const newButton = grid.querySelector(`button[data-action="${action}"]${packId ? `[data-pack-id="${packId}"]` : ''}${grade ? `[data-grade="${grade}"]` : ''}${type ? `[data-type="${type}"]` : ''}`);
    
    if (newButton) {
      switch (action) {
        case 'purchase':
          newButton.addEventListener('click', () => {
            console.log('🛒 購入ボタンクリック (addEventListener):', packId);
            modalPurchasePack(packId);
          });
          break;
        case 'open':
          newButton.addEventListener('click', () => {
            console.log('📂 パック開放ボタンクリック:', packId);
            openPack(packId);
          });
          break;
        case 'set-grade':
          newButton.addEventListener('click', () => {
            console.log('🎓 学年設定ボタンクリック:', grade);
            setCurrentGrade(parseInt(grade));
            renderAppView();
          });
          break;
        case 'auth-required':
          newButton.addEventListener('click', () => {
            console.log('🔒 認証要求ボタンクリック:', type);
            handleModalAuthRequired(type);
          });
          break;
      }
    }
  });
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
  
  // 緊急対策: 関数実行時にもグローバル公開を確認
  if (!window.modalPurchasePack) {
    console.log('⚠️ window.modalPurchasePack が未定義のため、再設定します');
    window.modalPurchasePack = modalPurchasePack;
  }
  
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
  
  // onclick属性の代わりにdata属性とイベント委譲を使用
  confirmBtn.setAttribute('data-action', 'process-purchase');
  confirmBtn.setAttribute('data-pack-id', packId);
  cancelBtn.setAttribute('data-action', 'close-purchase-confirm');
  closeBtn.setAttribute('data-action', 'close-purchase-confirm');
  
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
  
  // onclick属性の代わりにdata属性とイベント委譲を使用
  startLearningBtn.setAttribute('data-action', 'start-learning');
  startLearningBtn.setAttribute('data-pack-id', packId);
  continueBrowsingBtn.setAttribute('data-action', 'continue-browsing');
  closeCompleteBtn.setAttribute('data-action', 'close-purchase-complete');
  
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
  
  // 🎓 復習システムを初期化
  initializeReviewSystem();
  
  document.getElementById('btnLogin')?.addEventListener('click', loginMock);
  document.getElementById('btnLogout')?.addEventListener('click', logoutMock);
  
  // 🚀 グローバルイベント委譲を追加（②本格対応）
  setupGlobalEventDelegation();
  
  // 📌 教科タブのイベントリスナーを設定
  setupSubjectTabs();
  
  await loadCatalog();
  
  // レッスンIDの移行処理を実行
  const hasMigration = migrateLessonProgress();
  if (hasMigration) {
    console.log('🔄 移行処理が実行されました。UIを更新します');
    // 移行後にUIを更新
    setTimeout(() => {
      if (window.currentSubject === 'social_drill') {
        renderSocialDrillUnits();
      }
    }, 100);
  }
  
  window.addEventListener('hashchange', route);
  
  // 初期ハッシュの設定
  if (!location.hash) setHash('home');
  
  route();
  
  // 初期表示時の教科イラストを設定
  updateSubjectHero('recommended');
  
  // 初期学年設定とアプリビューの描画
  const currentGrade = getCurrentGrade();
  if (!currentGrade) {
    console.log('📚 初期学年を小4に設定');
    setCurrentGrade(4);
  }
  console.log('📱 アプリビューを描画');
  renderAppView();
  
  // 進捗表示の初期化を強制実行
  console.log('🔄 進捗表示の初期化を強制実行');
  setTimeout(() => {
    if (window.currentSubject === 'social_drill') {
      console.log('🔄 社会おぼえる編の進捗表示を強制更新');
      renderSocialDrillUnits();
    }
  }, 100);
  
  // 追加の保険：500ms後にもう一度実行
  setTimeout(() => {
    console.log('🔄 500ms後の保険実行');
    
    // LP要素を強制削除
    const lpElements = document.querySelectorAll('.pack-card, .pack-grid, #packGrid, #lpGrid');
    lpElements.forEach(el => {
      console.log('🗑️ LP要素を削除:', el.className || el.id);
      el.remove();
    });
    
    // アプリビューを強制表示
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.style.display = 'block';
      homeView.classList.remove('hidden');
      console.log('🏠 homeView強制表示完了');
    }
    
    renderAppView();
    renderHome();
  }, 500);

  // 恒久対応: 進捗API公開と message リスナーを最後に必ず登録
  registerProgressAPI();
  
  // 初期表示は通常のrenderHome()に任せる（復習レッスンは統合済み）
  
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
  
  // 緊急対策: startup 完了時にもグローバル公開を確実に実行
  console.log('🔧 startup完了時のグローバル関数公開');
  window.modalPurchasePack = modalPurchasePack;
  window.openPack = openPack;
  window.setCurrentGrade = setCurrentGrade;
  
  // Firebase認証オブジェクトをグローバルに公開（index.htmlの認証UI用）
  window.firebaseAuth = { 
    auth, signOut, signInWithEmailAndPassword, signInWithPopup, 
    GoogleAuthProvider, sendPasswordResetEmail, createUserWithEmailAndPassword, 
    sendEmailVerification, onAuthStateChanged 
  };
  
  console.log('🔍 startup完了時の確認:', {
    'window.modalPurchasePack': typeof window.modalPurchasePack,
    'modalPurchasePack': typeof modalPurchasePack
  });
  
  // ===== ビュー切替制御を初期化 =====
  console.log('🎯 ビュー切替制御を初期化');
  
  const homeView = document.getElementById("homeView");
  const lessonView = document.getElementById("lessonView");
  
  function showHomeView() {
    if (homeView) {
      homeView.classList.remove("hidden");
      homeView.style.display = "block";
    }
    if (lessonView) {
      lessonView.classList.add("hidden");
    }
    console.log('📱 ホームビューを表示');
  }
  
  function showLessonView() {
    if (lessonView) {
      lessonView.classList.remove("hidden");
      lessonView.style.display = "block";
    }
    if (homeView) {
      homeView.classList.add("hidden");
    }
    console.log('📚 レッスンビューを表示');
  }
  
  // 初期起動時にホームを表示
  showHomeView();
  
  // ビュー切替関数をグローバルに公開
  window.showHomeView = showHomeView;
  window.showLessonView = showLessonView;
}
// DOMContentLoadedでアプリケーション全体を初期化
// ===== HTML から呼び出される関数のグローバル公開（暫定対応） =====
// ⚠️ 注意: これは暫定対応です。将来的にはイベント委譲に移行予定
window.modalPurchasePack = modalPurchasePack;
window.openPack = openPack;
window.setCurrentGrade = setCurrentGrade;
window.renderAppView = renderAppView;

// 🚀 グローバルイベント委譲の設定（②本格対応）
function setupGlobalEventDelegation() {
  console.log('🚀 グローバルイベント委譲を設定中...');
  
  // document全体でのクリックイベントを監視
  document.addEventListener('click', (event) => {
    // 学習画面の戻るボタンのクリックを処理
    if (event.target.matches('a[href="#/home"]') || event.target.closest('a[href="#/home"]')) {
      console.log('🔙 学習画面の戻るボタンがクリックされました');
      event.preventDefault();
      setHash('home');
      return;
    }
    
    const button = event.target.closest('[data-action]');
    if (!button) return;
    
    const action = button.getAttribute('data-action');
    const packId = button.getAttribute('data-pack-id');
    const grade = button.getAttribute('data-grade');
    const type = button.getAttribute('data-type');
    const subject = button.getAttribute('data-subject');
    
    console.log('🎯 イベント委譲でクリック検出:', { action, packId, grade, type, subject });
    
    // 各アクションに応じて適切な関数を呼び出し
    switch (action) {
      case 'purchase':
        console.log('🛒 購入アクション実行:', packId);
        modalPurchasePack(packId);
        break;
      case 'open':
        console.log('📂 開放アクション実行:', packId);
        openPack(packId);
        break;
      case 'set-grade':
        console.log('🎓 学年設定アクション実行:', grade);
        setCurrentGrade(parseInt(grade));
        renderAppView();
        break;
      case 'auth-required':
        console.log('🔒 認証要求アクション実行:', type);
        handleModalAuthRequired(type);
        break;
      case 'process-purchase':
        console.log('💳 購入処理アクション実行:', packId);
        processPurchase(packId);
        break;
      case 'close-purchase-confirm':
        console.log('❌ 購入確認クローズアクション実行');
        closePurchaseConfirmModal();
        break;
      case 'start-learning':
        console.log('📚 学習開始アクション実行:', packId);
        closePurchaseCompleteModal();
        openPack(packId);
        break;
      case 'continue-browsing':
        console.log('🔄 閲覧継続アクション実行');
        closePurchaseCompleteModal();
        openPurchaseModal();
        break;
      case 'close-purchase-complete':
        console.log('✅ 購入完了クローズアクション実行');
        closePurchaseCompleteModal();
        break;
      case 'select-subject':
        console.log('📚 教科選択アクション実行:', subject);
        selectSubject(subject);
        break;
      case 'review-status':
        console.log('📊 復習状況確認アクション実行');
        getReviewSystemStatus();
        break;
      case 'review-debug':
        console.log('🔧 復習デバッグアクション実行');
        showReviewSystemDebugInfo();
        break;
      case 'go-home':
        console.log('🏠 ホームに戻るアクション実行');
        setHash('home');
        break;
      case 'retry-lesson':
        const lessonId = button.getAttribute('data-lesson-id');
        console.log('🔄 レッスン再挑戦アクション実行:', lessonId);
        if (lessonId) {
          setHash('lesson', lessonId);
        }
        break;
      case 'open-review':
        console.log('📝 復習レッスン開始アクション実行');
        const reviewId = button.getAttribute('data-review-id');
        if (reviewId) {
          console.log('🎯 復習レッスンを開く:', reviewId);
          openReviewLesson(reviewId);
        }
        break;
      default:
        console.warn('⚠️ 未対応のアクション:', action);
    }
  });
  
  console.log('✅ グローバルイベント委譲設定完了');
}

// localStorage を定期的にチェックして未処理メッセージを処理
function checkPendingLessonMessages() {
  try {
    const messageData = localStorage.getItem('lessonCompleteMessage');
    if (messageData) {
      console.log('📦 localStorage から未処理メッセージを発見:', messageData);
      
      const parsedData = JSON.parse(messageData);
      
      // 通常のメッセージ処理と同じ処理を実行
      if (parsedData.type === 'lesson:complete') {
        const id = parsedData.lessonId;
        const correct = parsedData.detail?.correct ?? 0;
        const total = parsedData.detail?.total ?? 0;
        const seconds = parsedData.detail?.timeSec ?? 0;
        
        console.log('📦 localStorage経由での完了処理:', {id, correct, total, seconds});
        
        // 長期保存用の進捗データを保存
        saveLessonProgress(id, correct, total, seconds);
        
        // セッション結果を一時保存（結果画面用）
        console.log('💾 セッション結果を保存中:', { id, correct, total, seconds });
        saveSessionResult(id, correct, total, seconds);
        console.log('💾 セッション結果保存完了:', getSessionResult());
        
        // 結果画面に遷移
        setHash('result', id);
        
        // 使用済みメッセージを削除
        localStorage.removeItem('lessonCompleteMessage');
        
        // UI更新を強制実行
        setTimeout(() => {
          console.log('🔄 UI更新を実行');
          if (typeof renderHome === 'function') {
            renderHome();
          }
        }, 100);
        
        return true; // 処理済み
      }
    }
  } catch (e) {
    console.error('localStorage メッセージ処理エラー:', e);
  }
  return false; // 未処理
}

// 手動テスト用: 進捗を強制的に保存・表示する関数
function testProgressSystem() {
  console.log('🧪 進捗システムのテストを開始');
  
  // 1. 現在の進捗データを確認
  console.log('📊 現在の進捗データ:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('progress:')) {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`  ${key}:`, data);
    }
  }
  
  // 2. 特定のレッスンの進捗を確認
  const testLessonId = 'soc.geography.4100_land_topography_climate.oboeru';
  const progress = getLessonProgress(testLessonId);
  console.log(`🔍 テストレッスン進捗: ${testLessonId}`, progress);
  
  // 3. 完了判定をテスト
  const isCompleted = isLessonCompleted(testLessonId);
  console.log(`✅ 完了判定結果: ${isCompleted}`);
  
  // 4. 手動で進捗データを確認
  console.log('🔍 手動進捗データ確認:');
  const manualKey = `progress:${testLessonId}`;
  const manualData = localStorage.getItem(manualKey);
  console.log(`  キー: ${manualKey}`);
  console.log(`  データ: ${manualData}`);
  if (manualData) {
    try {
      const parsed = JSON.parse(manualData);
      console.log(`  解析結果:`, parsed);
    } catch (e) {
      console.error(`  解析エラー:`, e);
    }
  }
  
  console.log('🧪 進捗システムテスト完了');
}

// グローバルに公開（デバッグ用）
window.testProgressSystem = testProgressSystem;

// localStorage の個別問題回答をチェック
function checkPendingQuestionAnswers() {
  try {
    const questionAnswers = localStorage.getItem('questionAnswers');
    if (questionAnswers) {
      const answers = JSON.parse(questionAnswers);
      console.log(`📦 localStorage から${answers.length}件の問題回答を発見`);
      
      answers.forEach(answerData => {
        console.log('📝 localStorage経由で問題回答を処理:', answerData);
        handleQuestionAnswered(answerData);
      });
      
      // 処理済みデータを削除
      localStorage.removeItem('questionAnswers');
      console.log('✅ localStorage の問題回答を処理完了');
      
      return answers.length > 0;
    }
  } catch (e) {
    console.error('localStorage 問題回答処理エラー:', e);
  }
  return false;
}

// 定期的にチェック
setInterval(checkPendingLessonMessages, 1000);
setInterval(checkPendingQuestionAnswers, 1000);

// ページロード時にもチェック
window.addEventListener('load', checkPendingLessonMessages);
window.addEventListener('focus', checkPendingLessonMessages);

// localStorage イベントでの代替通信を監視（フォールバック）
window.addEventListener('storage', (e) => {
  if (e.key === 'lessonCompleteMessage' && e.newValue) {
    console.log('📦 storage イベントでメッセージを受信');
    checkPendingLessonMessages();
  }
});

// デバッグ: グローバル公開の確認（暫定対応用）
console.log('🔍 グローバル関数公開確認:', {
  'window.modalPurchasePack': typeof window.modalPurchasePack,
  'modalPurchasePack': typeof modalPurchasePack,
  '関数の中身': window.modalPurchasePack?.toString().substring(0, 100) + '...'
});
window.openPack = openPack;
window.setCurrentGrade = setCurrentGrade;
window.showPurchaseConfirmModal = showPurchaseConfirmModal;
window.closePurchaseConfirmModal = closePurchaseConfirmModal;
window.processPurchase = processPurchase;
window.renderAppView = renderAppView;

// 恒久対応: 進捗APIのグローバル公開と message リスナー登録を一本化
function registerProgressAPI() {
  try {
    // グローバル公開（何度呼ばれても安全）
    window.getLessonProgress = getLessonProgress;
    window.isLessonCompleted = isLessonCompleted;
    window.saveLessonProgress = saveLessonProgress;
    window.renderHome = renderHome;
    
    // テスト用関数も公開
    window.testLessonComplete = function(lessonId = 'soc.geography.land_topography_climate', correct = 8, total = 10, seconds = 300) {
      console.log('🧪 テスト用 lesson:complete メッセージを送信');
      const testMessage = {
        type: 'lesson:complete',
        lessonId: lessonId,
        detail: {
          correct: correct,
          total: total,
          timeSec: seconds
        }
      };
      
      console.log('📤 送信メッセージ:', testMessage);
      window.postMessage(testMessage, '*');
      
      // 結果確認
      setTimeout(() => {
        const progress = getLessonProgress(lessonId);
        console.log('📊 保存結果確認:', progress);
      }, 500);
    };
    
    console.log('✅ 進捗API公開済み（テスト関数含む）');
  } catch (e) { /* noop */ }

  // lesson:complete 受信ハンドラ（重複登録防止）
  if (!window._lessonCompleteHandlerInstalled) {
    const handler = (ev) => {
      console.log('🔔 [新リスナー] メッセージを受信:', ev.data, '送信元:', ev.origin);
      console.log('🔔 メッセージ詳細:', {
        type: ev.data?.type,
        lessonId: ev.data?.lessonId,
        hasDetail: !!ev.data?.detail
      });
      console.log('🔔 受信時刻:', new Date().toLocaleTimeString());
      console.log('🔔 メッセージ完全な内容:', JSON.stringify(ev.data, null, 2));
      const d = ev?.data || {};
      
      if (d && d.type === 'lesson:complete' && d.lessonId) {
        console.log('🎯 lesson:complete メッセージを検出:', d);
        console.log('🎯 受信したレッスンID:', d.lessonId);
        console.log('🎯 受信した詳細情報:', d.detail);
        let id = d.lessonId;
        const correct = d.detail?.correct ?? 0;
        const total = d.detail?.total ?? 0;
        const seconds = d.detail?.timeSec ?? 0;

        // 分離されたIDを使用（ID変換不要）
        console.log(`🔍 分離されたIDを使用: ${id}`);

        // 保存
        try {
          saveLessonProgress(id, correct, total, seconds);
          console.log('💾 lesson:complete 受信→進捗保存成功', { id, correct, total, seconds });
          
          // UI更新を強制実行
          setTimeout(() => {
            console.log('🔄 UI更新を実行');
            if (typeof renderHome === 'function') {
              renderHome();
            }
          }, 100);
        } catch (e) {
          console.error('❌ 進捗保存に失敗:', e);
        }
      } else if (d && d.type === 'question:answered') {
        console.log('📝 question:answered メッセージを検出:', d);
        if (typeof handleQuestionAnswered === 'function') {
          handleQuestionAnswered(d);
        }
      } else if (d && d.type === 'lesson:goBack') {
        console.log('🔙 lesson:goBack メッセージを検出');
        setHash('home');
      }
    };
    window.addEventListener('message', handler);
    window._lessonCompleteHandlerInstalled = true;
    console.log('✅ lesson:complete リスナー登録済み（デバッグ強化版）');
    
    // localStorage経由での代替通信も監視
    window.addEventListener('storage', (e) => {
      if (e.key === 'lessonCompleteMessage' && e.newValue) {
        try {
          const messageData = JSON.parse(e.newValue);
          console.log('📦 localStorage経由でメッセージを受信:', messageData);
          if (messageData.type === 'lesson:complete') {
            // メッセージイベントをシミュレート
            const syntheticEvent = {
              data: messageData,
              origin: window.location.origin
            };
            handler(syntheticEvent);
          }
        } catch (err) {
          console.log('❌ localStorageメッセージ解析失敗:', err);
        }
      }
    });
    
    // 定期的にlocalStorageをチェック（代替手段）
    setInterval(() => {
      try {
        const storedMessage = localStorage.getItem('lessonCompleteMessage');
        if (storedMessage) {
          const messageData = JSON.parse(storedMessage);
          const messageAge = Date.now() - (messageData.timestamp || 0);
          if (messageAge < 5000) { // 5秒以内のメッセージのみ処理
            console.log('⏰ 定期的チェックでメッセージを発見:', messageData);
            if (messageData.type === 'lesson:complete') {
              const syntheticEvent = {
                data: messageData,
                origin: window.location.origin
              };
              handler(syntheticEvent);
              // 処理後は削除
              localStorage.removeItem('lessonCompleteMessage');
            }
          }
        }
      } catch (err) {
        // 無視
      }
    }, 1000);
  }
}

// テスト用関数は registerProgressAPI() 内で定義済み

// 🧪 完全性テスト: onclick属性チェック
setTimeout(() => {
  console.log('🧪 完全性テスト開始');
  
  // 1. ページ内の全onclick属性をチェック
  const elementsWithOnclick = document.querySelectorAll('[onclick]');
  if (elementsWithOnclick.length > 0) {
    console.warn('⚠️ onclick属性が残っています:', elementsWithOnclick);
    elementsWithOnclick.forEach((el, i) => {
      console.log(`  ${i+1}. ${el.tagName}: onclick="${el.getAttribute('onclick')}"`);
    });
  } else {
    console.log('✅ onclick属性は見つかりませんでした');
  }
  
  // 2. グローバル関数の存在確認
  const globalFunctions = ['modalPurchasePack', 'openPack', 'setCurrentGrade', 'renderAppView'];
  globalFunctions.forEach(fnName => {
    if (typeof window[fnName] === 'function') {
      console.log(`✅ window.${fnName} は正常に公開されています`);
    } else {
      console.error(`❌ window.${fnName} が未定義です`);
    }
  });
  
  // 3. イベント委譲の確認
  if (document.querySelectorAll('[data-action]').length > 0) {
    console.log('✅ data-action属性のボタンが見つかりました');
  } else {
    console.warn('⚠️ data-action属性のボタンが見つかりません');
  }
  
  console.log('🧪 完全性テスト完了');
}, 2000);

// ===== 復習レッスンシステム =====

// 復習システムの設定
const REVIEW_SYSTEM_CONFIG = {
  MIN_WRONG_FOR_GENERATION: 5, // 復習レッスン生成に必要な最小間違い数
  MAX_REVIEW_QUESTIONS: 30, // 復習レッスンに含める最大問題数
  STORAGE_KEY: 'wrong_questions', // LocalStorage のキー
  FIRESTORE_COLLECTION: 'user_wrong_questions', // Firestore のコレクション名
  // 新機能：難易度別復習設定
  DIFFICULTY_LEVELS: {
    BASIC: { threshold: 3, label: '基本問題復習' },
    STANDARD: { threshold: 5, label: '標準問題復習' },
    ADVANCED: { threshold: 7, label: '応用問題復習' }
  }
};

// 間違えた問題を記録する
function recordWrongAnswer(lessonId, questionData, userAnswer) {
  console.log('🔴 間違い問題を記録:', { lessonId, questionData, userAnswer });
  
  // ID正規化を実施
  const baseId = normalizeLessonId(lessonId);
  const key = `${baseId}_${questionData.qnum}`;
  
  // 既存に同キーがあれば差し替え（重複しない）
  state.wrongQuestions = state.wrongQuestions.filter(w => `${w.lessonId}_${w.questionId}` !== key);
  
  const wrongQuestion = {
    id: `${key}_${Date.now()}`,
    lessonId: baseId, // 正規化されたID
    questionId: questionData.qnum,
    questionData: questionData,
    userAnswer: userAnswer,
    wrongAt: Date.now(),
    reviewCount: 0 // 復習した回数
  };
  
  // ローカル状態に追加
  state.wrongQuestions.push(wrongQuestion);
  
  console.log('📝 正規化されたID:', baseId, '元ID:', lessonId);
  
  // LocalStorage に保存
  saveWrongQuestionsToLocal();
  
  // Firebase に同期（ユーザーがログインしている場合）
  if (state.user && state.user.id) {
    saveWrongQuestionsToFirebase(state.user.id);
  }
  
  // 復習レッスン生成の条件をチェック（正規化されたIDで）
  checkReviewLessonGeneration(baseId);
  
  console.log(`📝 間違い問題記録完了。現在の間違い問題数: ${state.wrongQuestions.length}`);
}

// 正解した問題を処理する（復習レッスンで）
function recordCorrectAnswer(lessonId, questionData) {
  console.log('✅ 正解を記録:', { lessonId, questionData });
  
  // 間違い問題リストから該当の問題を削除
  const questionIndex = state.wrongQuestions.findIndex(wq => 
    wq.lessonId === lessonId && wq.questionId === questionData.qnum
  );
  
  if (questionIndex !== -1) {
    state.wrongQuestions.splice(questionIndex, 1);
    console.log(`✅ 間違い問題リストから削除: ${lessonId}_${questionData.qnum}`);
    
    // ストレージを更新
    saveWrongQuestionsToLocal();
    if (state.user && state.user.id) {
      saveWrongQuestionsToFirebase(state.user.id);
    }
  }
}

// LocalStorage に間違い問題を保存
function saveWrongQuestionsToLocal() {
  try {
    // REVIEW_SYSTEM_CONFIGが未定義の場合はデフォルト値を使用
    const storageKey = (typeof REVIEW_SYSTEM_CONFIG !== 'undefined' && REVIEW_SYSTEM_CONFIG.STORAGE_KEY) 
      ? REVIEW_SYSTEM_CONFIG.STORAGE_KEY 
      : 'wrong_questions';
    
    localStorage.setItem(storageKey, JSON.stringify(state.wrongQuestions));
    console.log('💾 間違い問題をLocalStorageに保存完了');
  } catch (error) {
    console.error('❌ LocalStorage保存エラー:', error);
  }
}

// LocalStorage から間違い問題を読み込み
function loadWrongQuestionsFromLocal() {
  try {
    // REVIEW_SYSTEM_CONFIGが未定義の場合はデフォルト値を使用
    const storageKey = (typeof REVIEW_SYSTEM_CONFIG !== 'undefined' && REVIEW_SYSTEM_CONFIG.STORAGE_KEY) 
      ? REVIEW_SYSTEM_CONFIG.STORAGE_KEY 
      : 'wrong_questions';
    
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      state.wrongQuestions = JSON.parse(stored);
      console.log(`📖 LocalStorageから間違い問題を読み込み: ${state.wrongQuestions.length}問`);
    }
  } catch (error) {
    console.error('❌ LocalStorage読み込みエラー:', error);
    state.wrongQuestions = [];
  }
}

// Firebase に間違い問題を保存
async function saveWrongQuestionsToFirebase(userId) {
  if (!window.firebaseConfig || !db || !doc || !setDoc) {
    console.warn('⚠️ Firebase未初期化のため、同期をスキップ');
    return;
  }
  
  try {
    // REVIEW_SYSTEM_CONFIGが未定義の場合はデフォルト値を使用
    const collectionName = (typeof REVIEW_SYSTEM_CONFIG !== 'undefined' && REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION) 
      ? REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION 
      : 'user_wrong_questions';
    
    const userDocRef = doc(db, collectionName, userId);
    await setDoc(userDocRef, {
      wrongQuestions: state.wrongQuestions,
      lastUpdated: Date.now()
    });
    console.log('☁️ Firebaseに間違い問題を同期完了');
  } catch (error) {
    console.error('❌ Firebase同期エラー:', error);
  }
}

// Firebase から間違い問題を読み込み
async function loadWrongQuestionsFromFirebase(userId) {
  if (!window.firebaseConfig || !db || !doc || !getDoc) {
    console.warn('⚠️ Firebase未初期化のため、同期をスキップ');
    return;
  }
  
  try {
    // REVIEW_SYSTEM_CONFIGが未定義の場合はデフォルト値を使用
    const collectionName = (typeof REVIEW_SYSTEM_CONFIG !== 'undefined' && REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION) 
      ? REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION 
      : 'user_wrong_questions';
    
    const userDocRef = doc(db, collectionName, userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.wrongQuestions && Array.isArray(data.wrongQuestions)) {
        state.wrongQuestions = data.wrongQuestions;
        console.log(`☁️ Firebaseから間違い問題を読み込み: ${state.wrongQuestions.length}問`);
        
        // LocalStorage も更新
        saveWrongQuestionsToLocal();
      }
    }
  } catch (error) {
    console.error('❌ Firebase読み込みエラー:', error);
  }
}

// 復習レッスン生成条件をチェック
// 10問選出は「重複除去 → 新しい順に10問」
function pickForReview(baseId) {
  const list = state.wrongQuestions
    .filter(w => w.lessonId === baseId)
    .sort((a, b) => b.wrongAt - a.wrongAt);

  const seen = new Set();
  const unique = [];
  for (const w of list) {
    const k = `${w.lessonId}_${w.questionId}`;
    if (!seen.has(k)) { 
      seen.add(k); 
      unique.push(w); 
    }
    if (unique.length === 10) break;
  }
  return unique;
}

function checkReviewLessonGeneration(baseId) {
  // 特定のレッスンIDの間違い問題を取得
  const lessonWrongQuestions = state.wrongQuestions.filter(wq => wq.lessonId === baseId);
  
  console.log(`🔍 復習レッスン生成チェック: ${baseId} (${lessonWrongQuestions.length}問)`);
  
  if (lessonWrongQuestions.length >= REVIEW_SYSTEM_CONFIG.MIN_WRONG_FOR_GENERATION) {
    console.log(`🎯 復習レッスン生成条件達成: ${baseId} (${lessonWrongQuestions.length}問)`);
    
    // 10問を選出
    const selectedQuestions = pickForReview(baseId);
    console.log(`📝 選出された問題数: ${selectedQuestions.length}問`);
    
    // upsertReviewLessonを直接呼び出し
    const reviewId = upsertReviewLesson(baseId, selectedQuestions);
    
    // 生成されたレッスンを取得して通知
    const reviewLesson = state.reviewLessons.find(r => r.id === reviewId);
    if (reviewLesson) {
      showReviewLessonNotification(reviewLesson);
    }
  }
}

// 復習レッスンを生成
// 元レッスンのタイトルを取得（必ず日本語に解決）
function getOriginalLessonTitle(lessonId) {
  const baseId = normalizeLessonId(lessonId);
  const hit = state.catalog.find(l => normalizeLessonId(l.id) === baseId);
  return hit ? hit.title : '復習レッスン';
}

// 復習レッスン生成の通知を表示
function showReviewLessonNotification(reviewLesson) {
  console.log('🔔 復習レッスン通知を表示:', reviewLesson);
  
  // カスタム通知ダイアログを作成
  const notificationHTML = `
    <div id="reviewNotification" class="review-notification-overlay">
      <div class="review-notification-dialog">
        <div class="review-notification-header">
          <span class="review-notification-icon">🎓</span>
          <h3>復習レッスンが生成されました！</h3>
        </div>
        <div class="review-notification-content">
          <p><strong>${reviewLesson.title}</strong></p>
          <p>間違えた問題 ${reviewLesson.questions.length}問を集めました。</p>
          <p>今すぐ復習しますか？</p>
        </div>
        <div class="review-notification-actions">
          <button class="btn-secondary" onclick="closeReviewNotification()">キャンセル</button>
          <button class="btn-primary" onclick="acceptReviewNotification('${reviewLesson.id}')">OK</button>
        </div>
      </div>
    </div>
  `;
  
  // 通知をDOMに追加
  document.body.insertAdjacentHTML('beforeend', notificationHTML);
  
  // 通知を表示（アニメーション付き）
  setTimeout(() => {
    const notification = document.getElementById('reviewNotification');
    if (notification) {
      notification.classList.add('show');
    }
  }, 100);
}

// 復習通知のOKボタン処理
function acceptReviewNotification(reviewLessonId) {
  console.log('✅ 復習通知のOKボタンがクリックされました:', reviewLessonId);
  closeReviewNotification();
  openReviewLesson(reviewLessonId);
}

// 復習通知のキャンセルボタン処理
function closeReviewNotification() {
  console.log('❌ 復習通知をキャンセル');
  const notification = document.getElementById('reviewNotification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}

// 復習レッスンを開く
function openReviewLesson(reviewLessonId) {
  console.log('📖 復習レッスンを開きます:', reviewLessonId);
  
  const reviewLesson = state.reviewLessons.find(rl => rl.id === reviewLessonId);
  if (!reviewLesson) {
    console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
    console.log('📊 現在の復習レッスン一覧:', state.reviewLessons);
    alert('復習レッスンが見つかりません。');
    return;
  }
  
  console.log('✅ 復習レッスンが見つかりました:', reviewLesson);
  
  // 復習レッスン用のURLハッシュを設定
  setHash('review', reviewLessonId);
}

// 復習レッスンのビューを表示
function renderReviewLesson(reviewLessonId) {
  console.log('🎓 復習レッスンビューを表示:', reviewLessonId);
  
  const reviewLesson = state.reviewLessons.find(rl => rl.id === reviewLessonId);
  if (!reviewLesson) {
    console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
    return;
  }
  
  // 復習レッスン用の問題データを準備
  const reviewQuestions = reviewLesson.questions.map(wq => wq.questionData);
  
  console.log(`📝 復習レッスン問題数: ${reviewQuestions.length}問`);
  
  // 復習レッスン専用のHTMLを生成
  renderReviewLessonHTML(reviewLesson, reviewQuestions);
}

// 復習レッスン用のHTMLを生成・表示
function renderReviewLessonHTML(reviewLesson, questions) {
  const homeView = document.getElementById('homeView');
  const app = document.getElementById('app');
  
  // 通常レイアウトに戻す
  homeView.classList.remove('math-full-width');
  app.classList.remove('math-full-width');
  
  // 復習レッスン用のHTMLを生成
  homeView.innerHTML = `
    <div class="review-lesson-container">
      <div class="review-lesson-header">
        <div class="review-lesson-info">
          <h1 class="review-lesson-title">
            <span class="review-icon">🎓</span>
            ${reviewLesson.title}
          </h1>
          <div class="review-lesson-meta">
            <span class="review-badge">復習レッスン</span>
            <span class="review-count">${questions.length}問</span>
            <span class="review-date">作成: ${new Date(reviewLesson.createdAt).toLocaleDateString()}</span>
          </div>
          <p class="review-lesson-description">
            間違えた問題を集めた復習レッスンです。満点を取ると自動的に削除されます。
          </p>
        </div>
        <div class="review-lesson-actions">
          <button class="btn-secondary review-back-btn" onclick="goBackFromReview()">
            ← 戻る
          </button>
          <button class="btn-primary review-start-btn" onclick="startReviewLesson('${reviewLesson.id}')">
            復習開始
          </button>
        </div>
      </div>
      
      <div class="review-questions-preview">
        <h3 class="preview-title">復習問題一覧</h3>
        <div class="questions-grid">
          ${questions.map((q, index) => `
            <div class="question-preview-card">
              <div class="question-number">問${index + 1}</div>
              <div class="question-text">${q.text.substring(0, 50)}${q.text.length > 50 ? '...' : ''}</div>
              <div class="question-source">${q.source || '出典不明'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  console.log('✅ 復習レッスンHTML生成完了');
}

// 復習レッスンを実際に開始
function startReviewLesson(reviewLessonId) {
  console.log('🚀 復習レッスン開始:', reviewLessonId);
  
  const reviewLesson = state.reviewLessons.find(rl => rl.id === reviewLessonId);
  if (!reviewLesson) {
    console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
    return;
  }
  
  // 復習レッスン用の問題セッションを開始
  startReviewQuestionSession(reviewLesson);
}

// 復習問題セッションを開始
function startReviewQuestionSession(reviewLesson) {
  console.log('📝 復習問題セッション開始:', reviewLesson.id);
  
  // 復習セッション状態を初期化
  const reviewSession = {
    reviewLessonId: reviewLesson.id,
    originalLessonId: reviewLesson.originalLessonId,
    questions: reviewLesson.questions.map(wq => wq.questionData),
    currentQuestionIndex: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    startTime: Date.now(),
    isReviewMode: true
  };
  
  // グローバル状態に保存
  window.currentReviewSession = reviewSession;
  
  // 最初の問題を表示
  displayReviewQuestion(reviewSession);
}

// 復習問題を表示
function displayReviewQuestion(reviewSession) {
  const homeView = document.getElementById('homeView');
  const currentQ = reviewSession.questions[reviewSession.currentQuestionIndex];
  
  if (!currentQ) {
    // 全問題完了
    completeReviewSession(reviewSession);
    return;
  }
  
  const progress = reviewSession.currentQuestionIndex + 1;
  const total = reviewSession.questions.length;
  
  homeView.innerHTML = `
    <div class="review-question-container">
      <div class="review-question-header">
        <div class="review-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(progress / total) * 100}%"></div>
          </div>
          <div class="progress-text">問題 ${progress} / ${total}</div>
        </div>
        <div class="review-stats">
          <span class="correct-count">正解: ${reviewSession.correctAnswers}</span>
          <span class="wrong-count">不正解: ${reviewSession.wrongAnswers}</span>
        </div>
      </div>
      
      <div class="question-content">
        <h2 class="question-text">${currentQ.text}</h2>
        <div class="choices-container">
          ${currentQ.choices.map((choice, index) => `
            <button class="choice-btn" onclick="selectReviewAnswer(${index})">
              <span class="choice-label">${String.fromCharCode(65 + index)}</span>
              <span class="choice-text">${choice}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="question-footer">
        <div class="question-source">出典: ${currentQ.source || '不明'}</div>
        <button class="btn-secondary" onclick="exitReviewSession()">復習を終了</button>
      </div>
    </div>
  `;
}

// 復習問題の回答を選択
function selectReviewAnswer(selectedIndex) {
  const session = window.currentReviewSession;
  if (!session) return;
  
  const currentQ = session.questions[session.currentQuestionIndex];
  const isCorrect = selectedIndex === currentQ.answer;
  
  console.log(`📝 復習問題回答: 問${session.currentQuestionIndex + 1}, 選択: ${selectedIndex}, 正解: ${currentQ.answer}, 結果: ${isCorrect ? '正解' : '不正解'}`);
  
  // 結果を記録
  if (isCorrect) {
    session.correctAnswers++;
    // 正解した場合、間違い問題リストから削除
    recordCorrectAnswer(session.originalLessonId, currentQ);
  } else {
    session.wrongAnswers++;
    // 不正解の場合、記録を更新（復習回数を増やす）
    updateWrongQuestionReviewCount(session.originalLessonId, currentQ);
  }
  
  // 回答結果を表示
  showReviewAnswerResult(isCorrect, currentQ, selectedIndex);
}

// 復習問題の回答結果を表示
function showReviewAnswerResult(isCorrect, question, selectedIndex) {
  const resultHTML = `
    <div class="answer-result ${isCorrect ? 'correct' : 'incorrect'}">
      <div class="result-icon">${isCorrect ? '✅' : '❌'}</div>
      <div class="result-text">${isCorrect ? '正解！' : '不正解'}</div>
      ${!isCorrect ? `
        <div class="correct-answer">
          正解: ${String.fromCharCode(65 + question.answer)} ${question.choices[question.answer]}
        </div>
      ` : ''}
      <button class="btn-primary next-question-btn" onclick="proceedToNextReviewQuestion()">
        次の問題へ
      </button>
    </div>
  `;
  
  // 既存のコンテンツに結果を追加
  const container = document.querySelector('.review-question-container');
  container.innerHTML += resultHTML;
  
  // 選択肢を無効化
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  });
}

// 次の復習問題に進む
function proceedToNextReviewQuestion() {
  const session = window.currentReviewSession;
  if (!session) return;
  
  session.currentQuestionIndex++;
  displayReviewQuestion(session);
}

// 復習セッションを完了
function completeReviewSession(reviewSession) {
  console.log('🎉 復習セッション完了:', reviewSession);
  
  const score = Math.round((reviewSession.correctAnswers / reviewSession.questions.length) * 100);
  const duration = Math.round((Date.now() - reviewSession.startTime) / 1000);
  
  const homeView = document.getElementById('homeView');
  homeView.innerHTML = `
    <div class="review-complete-container">
      <div class="review-complete-header">
        <div class="complete-icon">${score === 100 ? '🎉' : '📊'}</div>
        <h1 class="complete-title">復習完了！</h1>
      </div>
      
      <div class="review-results">
        <div class="score-display">
          <div class="score-number">${score}%</div>
          <div class="score-label">正解率</div>
        </div>
        
        <div class="results-grid">
          <div class="result-item">
            <div class="result-value">${reviewSession.correctAnswers}</div>
            <div class="result-label">正解</div>
          </div>
          <div class="result-item">
            <div class="result-value">${reviewSession.wrongAnswers}</div>
            <div class="result-label">不正解</div>
          </div>
          <div class="result-item">
            <div class="result-value">${reviewSession.questions.length}</div>
            <div class="result-label">総問題数</div>
          </div>
          <div class="result-item">
            <div class="result-value">${duration}秒</div>
            <div class="result-label">所要時間</div>
          </div>
        </div>
        
        ${score === 100 ? `
          <div class="perfect-score-message">
            <h3>🌟 満点おめでとうございます！</h3>
            <p>この復習レッスンは自動的に削除されます。</p>
          </div>
        ` : `
          <div class="retry-message">
            <h3>📚 もう一度復習しませんか？</h3>
            <p>間違えた問題は引き続き復習できます。</p>
          </div>
        `}
      </div>
      
      <div class="review-actions">
        <button class="btn-secondary" onclick="goBackFromReview()">ホームに戻る</button>
        ${score < 100 ? `<button class="btn-primary" onclick="startReviewLesson('${reviewSession.reviewLessonId}')">再度復習</button>` : ''}
      </div>
    </div>
  `;
  
  // 満点の場合、復習レッスンを削除
  if (score === 100) {
    removeReviewLesson(reviewSession.reviewLessonId);
  }
  
  // セッションをクリア
  window.currentReviewSession = null;
}

// 復習レッスンから戻る
function goBackFromReview() {
  console.log('🔙 復習レッスンから戻る');
  setHash('home');
}

// 復習セッションを終了
function exitReviewSession() {
  if (confirm('復習を中断しますか？進捗は保存されません。')) {
    window.currentReviewSession = null;
    goBackFromReview();
  }
}

// 間違い問題の復習回数を更新
function updateWrongQuestionReviewCount(lessonId, questionData) {
  const wrongQuestion = state.wrongQuestions.find(wq => 
    wq.lessonId === lessonId && wq.questionId === questionData.qnum
  );
  
  if (wrongQuestion) {
    wrongQuestion.reviewCount = (wrongQuestion.reviewCount || 0) + 1;
    wrongQuestion.lastReviewAt = Date.now();
    
    // ストレージを更新
    saveWrongQuestionsToLocal();
    if (state.user && state.user.id) {
      saveWrongQuestionsToFirebase(state.user.id);
    }
    
    console.log(`📈 復習回数更新: ${lessonId}_${questionData.qnum} → ${wrongQuestion.reviewCount}回`);
  }
}

// 復習レッスンを削除
function removeReviewLesson(reviewLessonId) {
  console.log('🗑️ 復習レッスンを削除:', reviewLessonId);
  
  const index = state.reviewLessons.findIndex(rl => rl.id === reviewLessonId);
  if (index !== -1) {
    state.reviewLessons.splice(index, 1);
    console.log('✅ 復習レッスン削除完了');
    
    // TODO: Firebase Firestore からも削除（Phase 3で実装）
  }
}

// 復習レッスンセクションを描画
function renderReviewLessonsSection() {
  try {
    console.log('📚 復習レッスンセクション描画開始');
    
    const homeView = document.getElementById('homeView');
    const app = document.getElementById('app');
    
    if (!homeView) {
      console.error('❌ homeView要素が見つかりません');
      return;
    }
    
    if (!app) {
      console.error('❌ app要素が見つかりません');
      return;
    }
    
    // 通常レイアウトに戻す
    homeView.classList.remove('math-full-width');
    app.classList.remove('math-full-width');
    
    // 🚨 強制的に homeView を表示状態にする
    homeView.classList.remove('hidden');
    homeView.style.display = 'block';
    homeView.style.visibility = 'visible';
    homeView.style.opacity = '1';
    console.log('🚨 renderReviewLessonsSection: homeView を表示状態に設定');
    
    // state の初期化確認
    if (!state.reviewLessons) {
      console.warn('⚠️ state.reviewLessons が未初期化。空配列で初期化します。');
      state.reviewLessons = [];
    }
    
    if (!state.wrongQuestions) {
      console.warn('⚠️ state.wrongQuestions が未初期化。空配列で初期化します。');
      state.wrongQuestions = [];
    }
    
    // 復習レッスンがあるかチェック
    const hasReviewLessons = state.reviewLessons && state.reviewLessons.length > 0;
    const hasWrongQuestions = state.wrongQuestions && state.wrongQuestions.length > 0;
  
  console.log('📚 復習レッスンセクション描画:', {
    hasReviewLessons,
    reviewLessonsCount: state.reviewLessons?.length || 0,
    hasWrongQuestions,
    wrongQuestionsCount: state.wrongQuestions?.length || 0
  });
  
  homeView.innerHTML = `
    <div class="review-dashboard">
      <div class="review-dashboard-header">
        <h1 class="dashboard-title">
          <span class="dashboard-icon">🎓</span>
          復習ダッシュボード
        </h1>
        <p class="dashboard-subtitle">間違えた問題を復習して、確実にマスターしましょう</p>
      </div>
      
      ${hasReviewLessons ? `
        <div class="review-lessons-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">📝</span>
              復習レッスン
              <span class="count-badge">${state.reviewLessons.length}</span>
            </h2>
            <p class="section-description">間違えた問題を集めた復習レッスンです</p>
          </div>
          <div class="review-lessons-grid">
            ${state.reviewLessons.map(lesson => `
              <div class="review-lesson-card" data-action="open-review" data-review-id="${lesson.id}">
                <div class="lesson-card-header">
                  <h3 class="lesson-card-title">${escapeHtml(lesson.title)}</h3>
                  <div class="lesson-card-meta">
                    <span class="question-count">${lesson.questions.length}問</span>
                    <span class="created-date">${new Date(lesson.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="lesson-card-content">
                  <p class="lesson-card-description">
                    復習レッスン / 小復習・${lesson.questions.length}問
                  </p>
                  <div class="lesson-card-preview">
                    <span class="preview-text">
                      間違えた問題を復習しましょう
                    </span>
                  </div>
                </div>
                <div class="lesson-card-actions">
                  <button class="btn-primary lesson-start-btn" data-action="open-review" data-review-id="${lesson.id}">
                    復習する
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${hasWrongQuestions ? `
        <div class="wrong-questions-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">❌</span>
              間違い問題の状況
              <span class="count-badge">${state.wrongQuestions.length}</span>
            </h2>
            <p class="section-description">レッスン別の間違い問題数</p>
          </div>
          <div class="wrong-questions-grid">
            ${renderWrongQuestionsByLesson()}
          </div>
        </div>
      ` : ''}
      
      ${!hasReviewLessons && !hasWrongQuestions ? `
        <div class="empty-state">
          <div class="empty-icon">🌟</div>
          <h2 class="empty-title">素晴らしい！</h2>
          <p class="empty-description">
            現在、復習が必要な問題はありません。<br>
            レッスンを進めて新しい知識を身につけましょう。
          </p>
          <div class="empty-actions">
            <button class="btn-primary" data-action="select-subject" data-subject="sci">理科を学習</button>
            <button class="btn-primary" data-action="select-subject" data-subject="soc">社会を学習</button>
          </div>
        </div>
      ` : ''}
      
      <div class="review-system-info">
        <div class="info-card">
          <h3 class="info-title">💡 復習システムについて</h3>
          <ul class="info-list">
            <li>問題を10問間違えると、自動的に復習レッスンが生成されます</li>
            <li>復習レッスンで満点を取ると、自動的に削除されます</li>
            <li>復習データはローカルとクラウドに同期保存されます</li>
          </ul>
          <div class="debug-actions">
            <button class="btn-secondary debug-btn" data-action="review-status">
              システム状況を確認
            </button>
            <button class="btn-secondary debug-btn" data-action="review-debug">
              詳細情報
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
    console.log('✅ 復習レッスンセクション描画完了');
  } catch (error) {
    console.error('❌ 復習レッスンセクション描画エラー:', error);
    
    // フォールバック表示
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.innerHTML = `
        <div class="error-fallback">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">復習ダッシュボードの読み込みに失敗しました</h2>
          <p class="error-description">
            申し訳ございません。復習ダッシュボードの読み込み中にエラーが発生しました。<br>
            ページを再読み込みしてください。
          </p>
          <div class="error-actions">
            <button class="btn-primary" onclick="location.reload()">ページを再読み込み</button>
            <button class="btn-secondary" data-action="select-subject" data-subject="sci">理科を学習</button>
            <button class="btn-secondary" data-action="select-subject" data-subject="soc">社会を学習</button>
          </div>
        </div>
      `;
    }
  }
}

// レッスン別の間違い問題を描画
function renderWrongQuestionsByLesson() {
  const questionsByLesson = {};
  
  // レッスン別にグループ化
  state.wrongQuestions.forEach(wq => {
    if (!questionsByLesson[wq.lessonId]) {
      questionsByLesson[wq.lessonId] = [];
    }
    questionsByLesson[wq.lessonId].push(wq);
  });
  
  return Object.entries(questionsByLesson).map(([lessonId, questions]) => {
    const lessonTitle = getOriginalLessonTitle(lessonId);
    const maxWrong = Math.max(...questions.map(q => q.wrongCount || 1));
    const progress = Math.min(questions.length / REVIEW_SYSTEM_CONFIG.MAX_WRONG_QUESTIONS * 100, 100);
    
    return `
      <div class="wrong-question-card">
        <div class="wrong-card-header">
          <h4 class="wrong-card-title">${lessonTitle}</h4>
          <span class="wrong-count-badge">${questions.length}問</span>
        </div>
        <div class="wrong-card-progress">
          <div class="progress-label">復習レッスン生成まで</div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${questions.length}/${REVIEW_SYSTEM_CONFIG.MAX_WRONG_QUESTIONS}</span>
          </div>
        </div>
        <div class="wrong-card-details">
          <div class="detail-item">
            <span class="detail-label">最多間違い回数:</span>
            <span class="detail-value">${maxWrong}回</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">最新の間違い:</span>
            <span class="detail-value">${new Date(Math.max(...questions.map(q => q.timestamp || 0))).toLocaleDateString()}</span>
          </div>
        </div>
        ${questions.length >= REVIEW_SYSTEM_CONFIG.MAX_WRONG_QUESTIONS ? `
          <div class="wrong-card-action">
            <button class="btn-warning generate-review-btn" onclick="generateReviewLesson('${lessonId}', ${JSON.stringify(questions).replace(/"/g, '&quot;')})">
              復習レッスンを生成
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// 復習システムのデバッグ情報を表示
function showReviewSystemDebugInfo() {
  const info = {
    '復習レッスン数': state.reviewLessons?.length || 0,
    '間違い問題数': state.wrongQuestions?.length || 0,
    'ユーザーログイン状態': !!state.user,
    'Firebase同期状態': !!(state.user && window.firebaseConfig),
    'LocalStorage使用量': JSON.stringify(state.wrongQuestions || []).length + ' bytes'
  };
  
  console.table(info);
  alert(`復習システム情報:\n${Object.entries(info).map(([k, v]) => `${k}: ${v}`).join('\n')}`);
}

// 🔧 デバッグ用：復習レッスン生成を強制実行
function forceCheckReviewGeneration() {
  console.log('🔧 復習レッスン生成を強制チェック開始');
  console.log('現在の間違い問題数:', state.wrongQuestions.length);
  
  // レッスン別にグループ化
  const questionsByLesson = {};
  state.wrongQuestions.forEach(wq => {
    if (!questionsByLesson[wq.lessonId]) {
      questionsByLesson[wq.lessonId] = [];
    }
    questionsByLesson[wq.lessonId].push(wq);
  });
  
  console.log('レッスン別間違い問題:', questionsByLesson);
  
  // 各レッスンの間違い数をチェック
  Object.entries(questionsByLesson).forEach(([lessonId, questions]) => {
    console.log(`📊 ${lessonId}: ${questions.length}問 (必要: ${REVIEW_SYSTEM_CONFIG.MIN_WRONG_FOR_GENERATION}問)`);
    
    if (questions.length >= REVIEW_SYSTEM_CONFIG.MIN_WRONG_FOR_GENERATION) {
      console.log(`🎯 ${lessonId} は生成条件を満たしています。復習レッスンを生成します。`);
      
      // 既に復習レッスンが存在するかチェック
      const existingReview = state.reviewLessons.find(rl => rl.originalLessonId === lessonId);
      if (existingReview) {
        console.log('⚠️ 既に復習レッスンが存在します:', existingReview.id);
      } else {
        generateReviewLesson(lessonId, questions);
      }
    } else {
      console.log(`📝 ${lessonId} はまだ生成条件を満たしていません (${questions.length}/${REVIEW_SYSTEM_CONFIG.MIN_WRONG_FOR_GENERATION})`);
    }
  });
  
  console.log('🔧 復習レッスン生成チェック完了');
}

// 教科に応じたヒーロー情報を取得
function getSubjectHeroInfo(subject) {
  const heroData = {
    'sci': {
      icon: '🔬',
      title: '理科の学習',
      bgClass: 'bg-gradient-to-r from-blue-400 to-purple-500'
    },
    'soc': {
      icon: '🌍',
      title: '社会の学習',
      bgClass: 'bg-gradient-to-r from-green-400 to-blue-500'
    },
    'science_drill': {
      icon: '🧪',
      title: '理科おぼえる',
      bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    'social_drill': {
      icon: '📍',
      title: '社会おぼえる',
      bgClass: 'bg-gradient-to-r from-green-500 to-teal-600'
    },
    'recommended': {
      icon: '🎓',
      title: '復習ダッシュボード',
      bgClass: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    }
  };
  
  return heroData[subject] || heroData['sci']; // デフォルトは理科
}

// 教科を選択する関数
function selectSubject(subject) {
  console.log('📌 教科選択:', subject);
  
  // currentSubject を更新
  window.currentSubject = subject;
  
  // アクティブなタブを更新
  const tabs = document.querySelectorAll('.subject-tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.subject === subject) {
      tab.classList.add('active');
    }
  });
  
  // 教科に応じたイラストを更新
  updateSubjectHero(subject);
  
  // ホーム画面を再描画
  renderHome();
  
  console.log('✅ 教科選択完了:', subject);
}

// 個別問題の回答を処理（レッスンiframeからのメッセージ受信）
function handleQuestionAnswered(messageData) {
  console.log('📝 問題回答を処理中:', messageData);
  
  const {
    lessonId,
    questionData,
    userAnswer,
    correctAnswer,
    isCorrect,
    timestamp
  } = messageData;
  
  // レッスンIDが不明な場合は現在のレッスンから取得
  const actualLessonId = lessonId || (state.current && state.current.id);
  
  if (!actualLessonId) {
    console.warn('⚠️ レッスンIDが特定できません。間違い問題記録をスキップします。');
    return;
  }
  
  console.log('📊 問題回答詳細:', {
    actualLessonId,
    isCorrect,
    questionData: questionData ? '✅' : '❌',
    userAnswer,
    correctAnswer
  });
  
  // 間違えた場合のみ記録
  if (!isCorrect && questionData) {
    console.log('❌ 間違い問題として記録します');
    recordWrongAnswer(actualLessonId, questionData, userAnswer);
    
    // 復習レッスン生成条件をチェック
    setTimeout(() => {
      checkReviewLessonGeneration();
    }, 100);
  } else if (isCorrect && questionData) {
    console.log('✅ 正解：復習リストから削除をチェック');
    recordCorrectAnswer(actualLessonId, questionData);
  }
}

// 復習システムの初期化
function initializeReviewSystem() {
  console.log('🚀 復習システムを初期化中...');
  
  // 状態の初期化
  if (!state.wrongQuestions) {
    state.wrongQuestions = [];
  }
  
  if (!state.reviewLessons) {
    state.reviewLessons = [];
  }
  
  // LocalStorage から間違い問題を読み込み
  loadWrongQuestionsFromLocal();
  
  // 復習レッスンも読み込み
  loadReviewLessonsFromLocal();
  
  // 既存データの正規化マイグレーション
  migrateWrongQuestionsData();
  
  // ユーザーがログインしている場合、Firebase からも読み込み
  if (state.user && state.user.id) {
    loadWrongQuestionsFromFirebase(state.user.id);
  }
  
  console.log('✅ 復習システム初期化完了');
}

// テスト用: 間違い問題をシミュレートする関数
function simulateWrongAnswers(lessonId, count = 5) {
  console.log(`🧪 テスト用: ${lessonId} で ${count} 個の間違い問題をシミュレート`);
  
  for (let i = 1; i <= count; i++) {
    const mockQuestionData = {
      qnum: i,
      text: `テスト問題 ${i}`,
      choices: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
      answer: 2,
      source: 'テスト用',
      tags: ['テスト'],
      difficulty: 1,
      asof: new Date().toISOString().split('T')[0]
    };
    
    recordWrongAnswer(lessonId, mockQuestionData, 1); // 常に不正解として記録
  }
  
  console.log(`✅ ${count} 個の間違い問題をシミュレート完了`);
}

// 既存の間違い問題データを正規化するマイグレーション
function migrateWrongQuestionsData() {
  console.log('🔄 間違い問題データのマイグレーションを開始...');
  
  let migrationCount = 0;
  const migratedQuestions = [];
  const seenKeys = new Set();
  
  state.wrongQuestions.forEach(wq => {
    // 既に正規化されているかチェック
    const originalId = wq.lessonId;
    const normalizedId = normalizeLessonId(originalId);
    
    if (originalId !== normalizedId) {
      // 正規化が必要
      const key = `${normalizedId}_${wq.questionId}`;
      
      // 重複チェック
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        migratedQuestions.push({
          ...wq,
          lessonId: normalizedId,
          id: `${key}_${wq.wrongAt || Date.now()}`
        });
        migrationCount++;
        console.log(`📝 マイグレーション: ${originalId} → ${normalizedId}`);
      }
    } else {
      // 既に正規化済み
      const key = `${normalizedId}_${wq.questionId}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        migratedQuestions.push(wq);
      }
    }
  });
  
  if (migrationCount > 0) {
    state.wrongQuestions = migratedQuestions;
    saveWrongQuestionsToLocal();
    console.log(`✅ ${migrationCount}件の間違い問題データをマイグレーションしました`);
  } else {
    console.log('✅ マイグレーション不要（データは既に正規化済み）');
  }
}

// 復習レッスンをLocalStorageから読み込み
function loadReviewLessonsFromLocal() {
  try {
    const stored = localStorage.getItem('reviewLessons');
    if (stored) {
      state.reviewLessons = JSON.parse(stored);
      console.log(`📚 復習レッスンをLocalStorageから読み込み: ${state.reviewLessons.length}件`);
    }
  } catch (error) {
    console.error('❌ 復習レッスンの読み込みエラー:', error);
    state.reviewLessons = [];
  }
}

// 復習システムの状態を確認する関数
function getReviewSystemStatus() {
  const status = {
    wrongQuestionsCount: state.wrongQuestions.length,
    wrongQuestionsByLesson: {},
    reviewLessonsCount: state.reviewLessons.length,
    reviewLessons: state.reviewLessons.map(rl => ({
      id: rl.id,
      title: rl.title,
      originalLessonId: rl.originalLessonId,
      questionsCount: rl.questions.length,
      createdAt: new Date(rl.createdAt).toLocaleString()
    }))
  };
  
  // レッスン別の間違い数を集計
  state.wrongQuestions.forEach(wq => {
    if (!status.wrongQuestionsByLesson[wq.lessonId]) {
      status.wrongQuestionsByLesson[wq.lessonId] = 0;
    }
    status.wrongQuestionsByLesson[wq.lessonId]++;
  });
  
  console.table(status.wrongQuestionsByLesson);
  return status;
}

// ===== グローバル関数として公開 =====
window.recordWrongAnswer = recordWrongAnswer;
window.recordCorrectAnswer = recordCorrectAnswer;
window.initializeReviewSystem = initializeReviewSystem;
window.simulateWrongAnswers = simulateWrongAnswers;
window.getReviewSystemStatus = getReviewSystemStatus;

// 復習レッスン関数の露出（Phase 2で追加）
window.openReviewLesson = openReviewLesson;
window.acceptReviewNotification = acceptReviewNotification;
window.closeReviewNotification = closeReviewNotification;
window.startReviewLesson = startReviewLesson;
window.selectReviewAnswer = selectReviewAnswer;
window.proceedToNextReviewQuestion = proceedToNextReviewQuestion;
window.goBackFromReview = goBackFromReview;
window.exitReviewSession = exitReviewSession;

// 復習ダッシュボード関数の露出（Phase 3で追加）
window.showReviewSystemDebugInfo = showReviewSystemDebugInfo;
window.handleQuestionAnswered = handleQuestionAnswered;
window.selectSubject = selectSubject;
window.forceCheckReviewGeneration = forceCheckReviewGeneration;

// 🚨 デバッグ用：強制的にキャッシュクリア
window.forceCacheClear = function() {
  console.log('🧹 強制キャッシュクリア実行');
  
  // Service Workerの登録解除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // 全キャッシュの削除
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  // 全ストレージのクリア
  localStorage.clear();
  sessionStorage.clear();
  
  // キャッシュ無効化付きリロード
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  window.location.replace(window.location.origin + window.location.pathname + `?v=${timestamp}&r=${randomId}&cb=${Math.random()}`);
};

// 🚨 デバッグ用：Service Worker v28強制更新
window.forceServiceWorkerV28Update = function() {
  console.log('🔄 Service Worker v28 強制更新実行');
  
  // 1. 全てのService Workerを削除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🔍 登録済みService Worker:', registrations.length);
      
      // 全てのService Workerを削除
      for(let registration of registrations) {
        console.log('🗑️ Service Worker削除:', registration.scope);
        registration.unregister();
      }
      
      // 2. 全キャッシュを削除
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
          
          // 3. ページをリロード
          console.log('🔄 ページリロード実行');
          setTimeout(function() {
            window.location.reload(true);
          }, 1000);
        });
      }
    });
  }
};

// 🚨 デバッグ用：Service Worker v27強制更新
window.forceServiceWorkerV27Update = function() {
  console.log('🔄 Service Worker v27 強制更新実行');
  
  // 1. 全てのService Workerを削除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🔍 登録済みService Worker:', registrations.length);
      
      // 全てのService Workerを削除
      for(let registration of registrations) {
        console.log('🗑️ Service Worker削除:', registration.scope);
        registration.unregister();
      }
      
      // 2. 全キャッシュを削除
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
          
          // 3. ページをリロード
          console.log('🔄 ページリロード実行');
          setTimeout(function() {
            window.location.reload(true);
          }, 1000);
        });
      }
    });
  }
};

// 🚨 デバッグ用：Service Worker v26強制更新
window.forceServiceWorkerV26Update = function() {
  console.log('🔄 Service Worker v26 強制更新実行');
  
  // 1. 全てのService Workerを削除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🔍 登録済みService Worker:', registrations.length);
      
      // 全てのService Workerを削除
      for(let registration of registrations) {
        console.log('🗑️ Service Worker削除:', registration.scope);
        registration.unregister();
      }
      
      // 2. 全キャッシュを削除
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
          
          // 3. ページをリロード
          console.log('🔄 ページリロード実行');
          setTimeout(function() {
            window.location.reload(true);
          }, 1000);
        });
      }
    });
  }
};

// 🚨 デバッグ用：Service Worker v25強制更新
window.forceServiceWorkerV25Update = function() {
  console.log('🔄 Service Worker v25 強制更新実行');
  
  // 1. 全てのService Workerを削除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🔍 登録済みService Worker:', registrations.length);
      
      // 全てのService Workerを削除
      for(let registration of registrations) {
        console.log('🗑️ Service Worker削除:', registration.scope);
        registration.unregister();
      }
      
      // 2. 全キャッシュを削除
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
          
          // 3. ページをリロード
          console.log('🔄 ページリロード実行');
          setTimeout(function() {
            window.location.reload(true);
          }, 1000);
        });
      }
    });
  }
};

// 🚨 デバッグ用：Service Worker強制更新
window.forceServiceWorkerUpdate = function() {
  console.log('🔄 Service Worker強制更新実行');
  
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
};

// 🚨 デバッグ用：強制的に復習ダッシュボードを表示
window.forceShowReviewDashboard = function() {
  console.log('🚨 強制的に復習ダッシュボードを表示');
  window.currentSubject = 'recommended';
  
  // 強制的に homeView を表示状態にする
  const homeView = document.getElementById('homeView');
  if (homeView) {
    homeView.classList.remove('hidden');
    homeView.style.display = 'block';
    homeView.style.visibility = 'visible';
    homeView.style.opacity = '1';
    console.log('🚨 homeView を強制的に表示状態に設定');
  }
  
  renderReviewLessonsSection();
};

// 🚨 デバッグ用：現在の状態を詳細表示
window.debugCurrentState = function() {
  console.log('=== デバッグ情報 ===');
  console.log('currentSubject:', window.currentSubject);
  console.log('state.reviewLessons:', state.reviewLessons);
  console.log('state.wrongQuestions:', state.wrongQuestions);
  console.log('homeView exists:', !!document.getElementById('homeView'));
  console.log('app exists:', !!document.getElementById('app'));
  
  // ID正規化のテスト
  const testIds = [
    'soc.geography.4100_land_topography_climate.oboeru',
    'soc.geography.4100_land_topography_climate.wakaru',
    'soc.history.heian_period.quiz',
    'review_soc.geography.4100_land_topography_climate_1760061690399'
  ];
  
  console.log('=== ID正規化テスト ===');
  testIds.forEach(id => {
    console.log(`${id} → ${normalizeLessonId(id)}`);
  });
  
  // catalog.jsonからのタイトル取得テスト
  console.log('=== タイトル取得テスト ===');
  testIds.forEach(id => {
    const normalized = normalizeLessonId(id);
    const title = getTitleByLessonId(normalized);
    console.log(`${normalized} → ${title}`);
  });
  
  // 間違い問題の重複チェック
  console.log('=== 間違い問題の重複チェック ===');
  const lessonGroups = {};
  state.wrongQuestions.forEach(wq => {
    if (!lessonGroups[wq.lessonId]) {
      lessonGroups[wq.lessonId] = [];
    }
    lessonGroups[wq.lessonId].push(wq);
  });
  
  Object.keys(lessonGroups).forEach(lessonId => {
    const questions = lessonGroups[lessonId];
    const uniqueQuestions = new Set(questions.map(q => q.questionId));
    console.log(`${lessonId}: ${questions.length}問 (ユニーク: ${uniqueQuestions.size}問)`);
  });
  
  // 復習レッスンの詳細チェック
  console.log('=== 復習レッスンの詳細 ===');
  state.reviewLessons.forEach(lesson => {
    console.log(`ID: ${lesson.id}`);
    console.log(`タイトル: ${lesson.title}`);
    console.log(`元レッスンID: ${lesson.originalLessonId}`);
    console.log(`問題数: ${lesson.questions.length}`);
    console.log('---');
  });
  
  // イベント委譲の確認
  console.log('=== イベント委譲の確認 ===');
  const reviewCards = document.querySelectorAll('[data-action="open-review"]');
  console.log(`復習カード数: ${reviewCards.length}`);
  reviewCards.forEach((card, index) => {
    const reviewId = card.getAttribute('data-review-id');
    console.log(`カード${index + 1}: data-review-id="${reviewId}"`);
  });
  
  console.log('=================');
};

// ==== ここから追補コード ====

// ID正規化関数（末尾のモードや付加情報をすべて剥がす）
function normalizeLessonId(raw) {
  let id = String(raw);

  // 例: ".wakaru" ".oboeru" ".oboe" ".oboeu" ".drill" ".quiz" ".modular" などを剥がす
  id = id.replace(/\.(wakaru|oboeru|oboe|oboeu|drill|quiz|modular)(?:_[a-z0-9]+)?$/i, '');

  // 生成時に足すseedやrev番号などの語尾（例: "_1760061690399"）を剥がす
  id = id.replace(/_[0-9]{6,}$/i, '');

  // 先頭の "review_" は比較時は無視
  id = id.replace(/^review_/, '');

  return id;
}

// catalog.jsonからタイトルを取得
function getTitleByLessonId(baseId) {
  // catalog.json の id と突き合わせて日本語 title を返す
  const hit = (state.catalog || []).find(x => x.id === baseId);
  return hit?.title || '復習レッスン';
}

// 復習レッスンをLocalStorageに保存
function saveReviewLessons() {
  try { 
    localStorage.setItem('reviewLessons', JSON.stringify(state.reviewLessons)); 
  } catch(e) { 
    console.warn('reviewLessons 保存失敗', e); 
  }
}

// 多重生成を防止する復習レッスン作成関数
function upsertReviewLesson(originalLessonId, wrongQuestions) {
  const baseId = normalizeLessonId(originalLessonId);
  const title = getTitleByLessonId(baseId); // ← catalog.json から日本語タイトルを得る

  // 既存を検索（normalized で比較）
  let existing = state.reviewLessons.find(r => normalizeLessonId(r.originalLessonId) === baseId);
  if (existing) {
    // 既存があるなら上書きせず、必要なら問題を補充する程度に留める
    existing.questions = existing.questions.slice(0, 10);
    saveReviewLessons();
    console.log('🔄 既存の復習レッスンを更新:', existing.id);
    return existing.id;
  }

  // 新規作成（IDは review_<baseId>_<ts> など）
  const id = `review_${baseId}_${Date.now()}`;
  const review = {
    id,
    originalLessonId: baseId,
    title: `${title}（復習）`,
    questions: wrongQuestions.slice(0, 10),
    createdAt: Date.now(),
    type: 'review',
    isActive: true
  };
  state.reviewLessons.push(review);
  saveReviewLessons();
  console.log('🎓 新しい復習レッスンを作成:', review);
  return id;
}

// 一意な復習レッスンIDを生成
function ensureUniqueReviewLessonId(baseId) {
  // タイムスタンプだけに頼らず衝突回避
  let i = 0;
  let candidate;
  do {
    candidate = `review_${normalizeLessonId(baseId)}_${Date.now()}${i ? '_' + i : ''}`;
    i++;
  } while (state.reviewLessons.some(r => r.id === candidate));
  return candidate;
}

// ==== 追補コードここまで ====
