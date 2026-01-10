
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
// 🚨 無限リロード防止: 重複登録を防ぐ
if (!window._domContentLoadedRegistered) {
  window._domContentLoadedRegistered = true;
  document.addEventListener('DOMContentLoaded', async () => {
    // 🚨 無限リロード防止: 重複実行を防ぐ
    if (window._domContentLoadedExecuted) {
      console.log('⚠️ DOMContentLoaded は既に実行済みです。スキップします。');
      return;
    }
    window._domContentLoadedExecuted = true;
    
    console.log('🚀 DOMContentLoaded: app.js 初期化開始');
  
  // ログイン画面を初期状態で確実に非表示にする（ゲートとして機能させない）
  const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
  if (loginPanel) {
    loginPanel.classList.add('hidden');
    loginPanel.style.display = 'none';
  }
  
  // Firebase認証オブジェクトをグローバルに公開（index.htmlの認証UI用）
  window.firebaseAuth = { 
    auth, signOut, signInWithEmailAndPassword, signInWithPopup, 
    GoogleAuthProvider, sendPasswordResetEmail, createUserWithEmailAndPassword, 
    sendEmailVerification, onAuthStateChanged 
  };
  
  // 前回の認証状態を保持（不要なUI更新を防ぐため）
  let lastAuthState = null;
  
  // syncFirebaseAuth関数を定義してグローバルに公開
  window.syncFirebaseAuth = function(user) {
    const currentUserId = user ? user.uid : null;
    const isIn = !!user;
    
    // 認証状態が変わっていない場合はUI更新をスキップ（戻るボタン時の一瞬のログイン画面表示を防ぐ）
    if (lastAuthState === currentUserId) {
      // 状態は既に反映済みなので、state.userのみ更新してUI更新はスキップ
      state.user = user || null;
      return;
    }
    
    console.log('🔄 syncFirebaseAuth 開始:', user ? `uid: ${user.uid}` : 'ログアウト');
    lastAuthState = currentUserId;
    state.user = user || null;
    
    if (user) {
      console.log('✅ ユーザー情報を state に保存:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
    }
    
    // 1) 画面の表示/非表示トグル（クラスで切替）
    document.documentElement.classList.toggle('is-auth', isIn);
    
    // 2) ログインカードを隠す（認証状態が確定してから表示/非表示を切り替え）
    const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
    if (loginPanel) {
      if (isIn) {
        // ログイン状態: 非表示
        loginPanel.classList.add('hidden');
        loginPanel.style.display = 'none';
      } else {
        // ログアウト状態: 表示（ただし、初期化中は非表示のまま）
        // 認証状態が確定したことを示すフラグをチェック
        const authDetermined = document.documentElement.hasAttribute('data-auth-determined');
        if (authDetermined) {
          loginPanel.classList.remove('hidden');
          loginPanel.style.display = 'block';
        } else {
          // 初期化中は非表示のまま
          loginPanel.classList.add('hidden');
          loginPanel.style.display = 'none';
        }
      }
    }
    
    // 3) ヘッダーボタンの表示制御を修正
    updateHeaderButtons(user);
    
    // 4) 購入ボタンの状態を更新
    updatePurchaseButtonsState(user);
    
    // 5) アカウント情報メニューボタンの表示制御
    updateAccountMenuButton();
    
    // UI更新処理があればここに追加
    // 🚨 無限リロード防止: renderAppView()はrenderHome()を呼ぶため、条件付きで呼ぶ
    try {
      if (typeof renderAppView === 'function' && !window._isRenderingAppView) {
        window._isRenderingAppView = true;
        renderAppView();
        setTimeout(() => {
          window._isRenderingAppView = false;
        }, 500);
      }
    } catch (error) {
      console.warn('⚠️ UI更新中にエラー:', error);
      window._isRenderingAppView = false;
    }
    
    console.log('🎯 UI切り替え完了:', isIn ? 'ログイン状態' : 'ログアウト状態');
  };
  
  // ログイン画面を初期状態で確実に非表示にする（ゲートとして機能させない）
  // すべての遷移でログイン画面を経由させないため、初期状態で非表示にする
  (function hideLoginPanelInitially() {
    const initialLoginPanel = document.querySelector('#authBox, .login-card, .auth-container');
    if (initialLoginPanel) {
      initialLoginPanel.classList.add('hidden');
      initialLoginPanel.style.display = 'none';
    }
  })();
  
  // Firebase認証状態の監視を設定
  // 注意: onAuthStateChangedは非同期で発火するため、初期表示時はログイン画面を非表示のままにする
  onAuthStateChanged(auth, (user) => {
    console.log('🔥 Firebase認証状態変化:', user ? 'ログイン' : 'ログアウト');
    // 認証状態が確定したことをマーク（これ以降、ログアウト状態の場合はログイン画面を表示可能）
    if (!document.documentElement.hasAttribute('data-auth-determined')) {
      document.documentElement.setAttribute('data-auth-determined', 'true');
    }
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
    // 初期化時は認証状態を確定させるが、ログイン画面は非表示のまま
    window.syncFirebaseAuth(null);
  }
  
  // 認証状態が確定したことをマーク（これ以降、ログアウト状態の場合はログイン画面を表示）
  document.documentElement.setAttribute('data-auth-determined', 'true');
  
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
  
  // テーマ選択機能を初期化
  initThemeSystem();
  
  // メニューシステムを初期化
  initMenuSystem();
  
    console.log('✅ DOMContentLoaded: app.js 初期化完了');
  });
}

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
  catalogIndex: null, // インデックス化されたカタログ（Map形式）
  catalogIndexByGrade: null, // 学年別インデックス
  catalogIndexBySubject: null, // 教科別インデックス
  current: null,
  selectedGrade: null,
  selectedSubject: null,
  userEntitlements: new Set(), // ユーザーの購入済みコンテンツ
  wrongQuestions: [] // 間違えた問題の記録（復習システム無効化のため）
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
      '🗺️ 地理分野': ['国土・地形・気候', '都道府県・都市', '農林水産業', '工業・エネルギー', '商業・貿易・交通', '環境問題', '情報・通信', '地図・地形図記号', '北海道地方', '東北地方', '関東地方', '中部地方', '近畿地方', '中国・四国地方', '九州地方', '世界地理', '地図学習シリーズ（7地方）']
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
      '📚 歴史分野（通史）': ['古墳・飛鳥時代', '奈良時代', '平安時代', '鎌倉時代', '室町時代', '安土桃山時代', '江戸時代', '明治時代', '大正・昭和前期', '昭和後期', '平成・令和時代'],
      '📖 テーマ史': ['政治・経済', '人物', '外交', '文化'],
      '🔄 時代横断問題': ['歴史総合問題']
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
      '🏛️ 公民分野': ['政治・国民生活', '憲法・三原則', '国会・内閣・裁判所', '財政・地方自治', '国際関係', '現代社会問題'],
      '📊 総合分野': ['地理総合①・②', '歴史総合①・②', '公民総合①・②', '総合①・②（基礎・応用）', '演習①～④（実力確認・総合演習）']
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
  // 🚨 無限リロード防止: 条件付きで呼ぶ
  if (!window._isRenderingAppView) {
    console.log('📚 アプリビューを強制表示');
    window._isRenderingAppView = true;
    renderAppView();
    setTimeout(() => {
      window._isRenderingAppView = false;
    }, 500);
  }
  
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
  
  // 開発・テスト用: 開発環境では未認証でもlocalStorageのpurchasesをチェック
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // 本番環境では未認証の場合はFirebase entitlementsのみをチェック
  if (!state.user && !isDevelopment) return false;
  
  // sku（packId、例：g5-soc）から対応するproductId（例：shakai_gakushu_5）を取得
  const pack = PACKS.find(p => p.id === sku);
  const productId = pack ? pack.productId : null;
  
  // Firebase entitlements をチェック（packIdとproductIdの両方をチェック）
  const hasFirebaseEntitlementByPackId = state.userEntitlements.has(sku);
  const hasFirebaseEntitlementByProductId = productId ? state.userEntitlements.has(productId) : false;
  const hasFirebaseEntitlement = hasFirebaseEntitlementByPackId || hasFirebaseEntitlementByProductId;
  
  // 開発・テスト用: LocalStorage もチェック（フォールバック）
  // 開発環境では未認証でもlocalStorageをチェック
  const localPurchases = JSON.parse(localStorage.getItem(LS_KEYS.purchases) || '[]');
  const hasLocalPurchase = localPurchases.includes(sku);
  
  const result = hasFirebaseEntitlement || hasLocalPurchase;
  
  console.log('🔐 entitlementチェック:', {
    sku,
    productId,
    user: !!state.user,
    firebaseEntitlements: Array.from(state.userEntitlements),
    hasFirebaseEntitlementByPackId,
    hasFirebaseEntitlementByProductId,
    hasFirebaseEntitlement,
    localPurchases,
    hasLocalPurchase,
    result
  });
  
  return result;
}

// 進捗データの統合管理（最適化版）
const PROGRESS_STORAGE_KEY = 'progress';
const PROGRESS_DATA_VERSION = 2; // データ構造のバージョン

// 既存の分散データを統合形式に移行
function migrateProgressData() {
  try {
    // 既に統合形式がある場合は移行不要
    const existing = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (existing) {
      const data = JSON.parse(existing);
      if (data.version === PROGRESS_DATA_VERSION) {
        console.log('✅ 進捗データは既に最新形式です');
        return false; // 移行不要
      }
    }
    
    console.log('🔄 進捗データの移行を開始します...');
    const allProgress = {};
    let migratedCount = 0;
    
    // 既存の分散データを収集
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('progress:')) {
        try {
          const lessonId = key.replace('progress:', '');
          const data = JSON.parse(localStorage.getItem(key));
          allProgress[lessonId] = {
            lessonId: data.lessonId || lessonId,
            score: data.score,
            detail: data.detail,
            at: data.at || Date.now()
          };
          migratedCount++;
        } catch (e) {
          console.warn(`⚠️ 移行エラー (${key}):`, e);
        }
      }
    }
    
    // 統合形式で保存
    if (Object.keys(allProgress).length > 0) {
      const unifiedData = {
        version: PROGRESS_DATA_VERSION,
        data: allProgress,
        migratedAt: Date.now()
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(unifiedData));
      console.log(`✅ 進捗データ移行完了: ${migratedCount}件`);
      
      // 古い分散データを削除（オプション：安全のためコメントアウト）
      // for (let i = 0; i < localStorage.length; i++) {
      //   const key = localStorage.key(i);
      //   if (key && key.startsWith('progress:')) {
      //     localStorage.removeItem(key);
      //   }
      // }
      
      return true; // 移行完了
    }
    
    // データがない場合は空の構造を作成
    const emptyData = {
      version: PROGRESS_DATA_VERSION,
      data: {},
      createdAt: Date.now()
    };
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(emptyData));
    console.log('✅ 進捗データ構造を初期化しました');
    return false;
  } catch (e) {
    console.error('❌ 進捗データ移行エラー:', e);
    return false;
  }
}

// 統合形式の進捗データを取得
function getUnifiedProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      // 初回は空の構造を作成
      const emptyData = {
        version: PROGRESS_DATA_VERSION,
        data: {},
        createdAt: Date.now()
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(emptyData));
      return { version: PROGRESS_DATA_VERSION, data: {} };
    }
    
    const parsed = JSON.parse(raw);
    
    // バージョン1（分散形式）の場合は移行
    if (!parsed.version || parsed.version < PROGRESS_DATA_VERSION) {
      migrateProgressData();
      return getUnifiedProgress(); // 再帰的に取得
    }
    
    return parsed;
  } catch (e) {
    console.error('❌ 進捗データ取得エラー:', e);
    return { version: PROGRESS_DATA_VERSION, data: {} };
  }
}

// 統合形式の進捗データを保存
function saveUnifiedProgress(progressData) {
  try {
    const unified = {
      version: PROGRESS_DATA_VERSION,
      data: progressData,
      updatedAt: Date.now()
    };
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(unified));
  } catch (e) {
    console.error('❌ 進捗データ保存エラー:', e);
    // ストレージ容量不足の場合は古いデータを削除して再試行
    if (e.name === 'QuotaExceededError') {
      console.warn('⚠️ ストレージ容量不足。古いデータを削除します...');
      // 古いデータの削除処理（必要に応じて実装）
    }
  }
}

function saveProgress(lessonId, score, detail){
  // 統合形式で保存
  const unified = getUnifiedProgress();
  unified.data[lessonId] = {
    lessonId,
    score,
    detail,
    at: Date.now()
  };
  saveUnifiedProgress(unified.data);
  console.log('✅ 進捗を保存しました:', { lessonId, score });
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
  
  // 連続学習日数を更新
  updateStreakDays();
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

// 教材の進捗状況を取得する関数（最適化版）
function getLessonProgress(lessonId) {
  try {
    const unified = getUnifiedProgress();
    const result = unified.data[lessonId] || null;
    
    // 後方互換性: 統合形式にない場合は古い形式を確認
    if (!result) {
      const oldKey = `progress:${lessonId}`;
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        console.log(`🔄 古い形式のデータを発見: ${lessonId}`);
        try {
          const parsedOldData = JSON.parse(oldData);
          // その場で統合形式に追加
          const unified = getUnifiedProgress();
          unified.data[lessonId] = {
            lessonId: parsedOldData.lessonId || lessonId,
            score: parsedOldData.score,
            detail: parsedOldData.detail,
            at: parsedOldData.at || Date.now()
          };
          saveUnifiedProgress(unified.data);
          console.log(`✅ 古い形式のデータを統合形式に追加: ${lessonId}`);
          return unified.data[lessonId];
        } catch (e) {
          console.error(`❌ 古い形式のデータ解析エラー: ${lessonId}`, e);
        }
      }
    }
    
    return result;
  } catch (e) {
    console.error(`❌ 進捗データ取得エラー: ${lessonId}`, e);
    return null;
  }
}

// 教材が完了しているかチェックする関数（最適化版）
function isLessonCompleted(lessonId) {
  try {
    const progress = getLessonProgress(lessonId);
    
    if (!progress) {
      console.log(`📊 完了判定: ${lessonId} → 未完了 (進捗データなし)`);
      return false;
    }
    
    const correctAnswers = progress.detail?.correct || 0;
    const isCompleted = correctAnswers > 0;
    
    console.log(`📊 完了判定: ${lessonId} → ${isCompleted ? '完了' : '未完了'} (正答数: ${correctAnswers})`, {
      progress,
      detail: progress.detail,
      correct: progress.detail?.correct
    });
    return isCompleted;
  } catch (e) {
    console.error(`❌ 進捗データ解析エラー: ${lessonId}`, e);
    return false;
  }
}

// チェックポイントがあるかチェックする関数
function hasCheckpoint(lessonId) {
  const checkpointKey = `checkpoint:${lessonId}`;
  try {
    const checkpointData = localStorage.getItem(checkpointKey);
    if (checkpointData) {
      const data = JSON.parse(checkpointData);
      console.log(`📌 チェックポイント検出: ${lessonId}`, data);
      return data;
    }
    return null;
  } catch (e) {
    console.error(`❌ チェックポイント取得エラー: ${lessonId}`, e);
    return null;
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

// カタログのインデックスを作成
function buildCatalogIndex(catalog) {
  const indexById = new Map();
  const indexByGrade = new Map();
  const indexBySubject = new Map();
  
  catalog.forEach(lesson => {
    // ID別インデックス（O(1)検索用）
    indexById.set(lesson.id, lesson);
    
    // 学年別インデックス
    if (lesson.grade) {
      if (!indexByGrade.has(lesson.grade)) {
        indexByGrade.set(lesson.grade, []);
      }
      indexByGrade.get(lesson.grade).push(lesson);
    }
    
    // 教科別インデックス
    if (lesson.subject) {
      if (!indexBySubject.has(lesson.subject)) {
        indexBySubject.set(lesson.subject, []);
      }
      indexBySubject.get(lesson.subject).push(lesson);
    }
  });
  
  return {
    byId: indexById,
    byGrade: indexByGrade,
    bySubject: indexBySubject
  };
}

// カタログ検索のヘルパー関数（後方互換性と最適化）
function findLessonById(lessonId) {
  if (state.catalogIndex) {
    return state.catalogIndex.get(lessonId) || null;
  }
  // フォールバック: インデックスがない場合は従来の方法
  return state.catalog.find(l => l.id === lessonId) || null;
}

function filterLessonsBySubject(subject) {
  if (state.catalogIndexBySubject) {
    return state.catalogIndexBySubject.get(subject) || [];
  }
  // フォールバック
  return state.catalog.filter(lesson => lesson.subject === subject);
}

function filterLessonsByGrade(grade) {
  if (state.catalogIndexByGrade) {
    return state.catalogIndexByGrade.get(grade) || [];
  }
  // フォールバック
  return state.catalog.filter(lesson => lesson.grade === grade);
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
        const text = await res.text();
        console.log('🔍 レスポンス取得成功、JSONパース開始...');
        try {
          state.catalog = JSON.parse(text);
          console.log('🔍 catalog読み込み成功:', state.catalog.length, '件');
          
          // インデックスを作成
          const indexes = buildCatalogIndex(state.catalog);
          state.catalogIndex = indexes.byId;
          state.catalogIndexByGrade = indexes.byGrade;
          state.catalogIndexBySubject = indexes.bySubject;
          console.log('🔍 カタログインデックス作成完了:', {
            total: state.catalogIndex.size,
            byGrade: Array.from(state.catalogIndexByGrade.keys()),
            bySubject: Array.from(state.catalogIndexBySubject.keys())
          });
          
          // 統合レッスンの存在確認
          const integratedLessons = ['sci.chemistry.air_combustion_integrated', 'sci.chemistry.water_state_integrated'];
          integratedLessons.forEach(id => {
            const found = state.catalog.find(l => l.id === id);
            console.log(`🔍 統合レッスン確認: ${id} → ${found ? '✅ 存在' : '❌ 見つからない'}`);
          });
          
          lastErr=null; 
          break;
        } catch (parseError) {
          console.error('❌ JSONパースエラー:', parseError);
          console.error('❌ エラー位置:', parseError.message);
          // JSONの最初の1000文字を表示してデバッグ
          console.error('❌ レスポンスの最初の1000文字:', text.substring(0, 1000));
          lastErr = parseError;
        }
      } else {
        lastErr = new Error(`${url} not ok: ${res.status} ${res.statusText}`);
        console.error('❌ レスポンスエラー:', lastErr);
      }
    }catch(e){ 
      console.error('❌ fetchエラー:', e);
      lastErr = e; 
    }
  }
  if (lastErr){
    console.error('❌ catalog.json の読み込みに失敗しました:', lastErr);
    console.warn('⚠️ デモデータを使用します。');
    state.catalog = [{
      id:'demo.sample', title:'デモ教材', grade:5, subject:'math',
      path:'./output.html', duration_min:8, sku_required:null
    }];
    // デモデータでもインデックスを作成
    const indexes = buildCatalogIndex(state.catalog);
    state.catalogIndex = indexes.byId;
    state.catalogIndexByGrade = indexes.byGrade;
    state.catalogIndexBySubject = indexes.bySubject;
    console.log('🔍 デモデータ設定完了:', state.catalog);
  }
  console.log('🔍 loadCatalog完了:', state.catalog?.length || 0, '件');
}

function parseHash(){
  const raw = location.hash.slice(2);
  const [view, ...rest] = raw.split('/');
  return { view: view || 'home', arg: decodeURIComponent(rest.join('/')) };
}
function setHash(view, arg){ 
  const newHash = arg ? `#/${view}/${encodeURIComponent(arg)}` : `#/${view}`;
  // 🚨 無限リロード防止: 現在のハッシュと同じ場合は変更しない
  if (location.hash !== newHash) {
    location.hash = newHash;
  }
}

function route(){
  // 🚨 無限リロード防止: 既に実行中の場合にはスキップ
  if (window._isRouting) {
    console.log('⚠️ route() は既に実行中です。スキップします。');
    return;
  }
  
  window._isRouting = true;
  
  try {
    const { view, arg } = parseHash();
    
    // ログイン画面を確実に非表示にする（戻るボタン時の一瞬の表示を防ぐ）
    // state.userだけでなく、auth.currentUserも直接チェック（認証状態が確定する前でも対応）
    const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
    if (loginPanel) {
      // ログイン済みかどうかを直接確認（state.userが未設定でもauth.currentUserで判定）
      const isLoggedIn = state.user || (typeof auth !== 'undefined' && auth.currentUser);
      if (isLoggedIn) {
        // ログイン済みの場合は確実に非表示
        loginPanel.classList.add('hidden');
        loginPanel.style.display = 'none';
      }
    }
    
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
  } finally {
    // フラグをリセット（少し遅延させて確実に）
    setTimeout(() => {
      window._isRouting = false;
    }, 100);
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
    id: 'g4',
    name: '小4理科：観察・基本現象',
    shortName: '小4',
    icon: '📚',
    lessons: [
      // 生物（11）
      'sci.biology.seasons_living_things', // 季節と生物（春）
      'sci.biology.seasons_living_things_summer', // 季節と生物（夏〜冬）
      'sci.kisetsu_seibutsu_annual_wakaru', // 季節と生物シミュレーション
      'sci.konchu_lifecycle_wakaru', // 昆虫の年間ライフサイクルシミュレーション
      'sci.biology.insect_body_lifecycle', // こん虫のからだと育ち方
      'sci.biology.medaka_lifecycle', // メダカの育ち方
      'sci.biology.microscope_water_organisms', // けんび鏡 水中の小さな生物
      'sci.biology.seeds_germination', // 種子のつくりと発芽
      'sci.biology.plants_growth_light', // 植物の成長
      'sci.biology.plants_observation', // 花のつくりと受粉
      // 物理（4）
      'sci.physics.weight_volume_basic', // つり合いとてんびん
      'sci.tsuriai_tenbin_wakaru', // つり合いとてんびんシミュレーション
      'sci.physics.electricity_conductivity_basic', // 電気（乾電池と豆電球）
      'sci.physics.heat_properties', // 熱の性質とものの変化
      // 化学（4）
      'sci.chemistry.air_combustion_integrated', // 空気と燃焼（統合）
      'sci.chemistry.water_state_integrated', // 水の状態変化（統合）
      'sci.chemistry.water_three_states_sim', // 水の変化：温度と状態変化シミュレーション
      'sci.chemistry.physics.lab_equipment', // メスシリンダー, ろ過、 ガスバーナー
      'sci.chemistry.physics.volume_change', // 空気・水・金属と体積変化
      // 地学（6）
      'sci.earth.stars_constellations_integrated', // 星と星座・星の動き（統合）
      'sci.earth.stars_constellations_sim', // 星と星座シミュレーション
      'sci.earth.sun_movement_shadow', // 太陽と影（基礎）
      'sci.earth.sun_movement_shadow_sim', // 太陽と影：影の長さシミュレーション
      'sci.earth.solar_system', // 太陽系
      'sci.earth.weather_changes', // 天気の変化
      'sci.earth.weather_changes_cloud_motion_model', // 天気の変化：雲が動くモデル
      'sci.earth.river_work', // 川のはたらき
      'sci.earth.river_work_sim' // 川のはたらきシミュレーション
    ]
  },
  {
    id: 'g5',
    name: '小5理科：しくみを学ぶ',
    shortName: '小5',
    icon: '📚',
    lessons: [
      // 物理（10）
      'sci.physics.current_circuit_integrated', // 電気の基礎と回路を流れる電流の大きさ（統合）
      'sci.physics.current_voltage_circuit_sim', // 電気の基礎：乾電池と豆電球シミュレーション
      'sci.physics.current_effect_heating', // 電流の作用①（発熱）
      'sci.physics.current_effect_heating_sim', // 電流の作用①：発熱シミュレーション
      'sci.physics.current_effect_magnetic', // 電流の作用②（磁界）
      'sci.physics.current_effect_magnetic_sim', // 電流の作用②：磁界シミュレーション
      'sci.physics.lever_weight_basic', // てこのつり合い
      'sci.physics.spring_force_buoyancy_integrated', // ばねと力・ばねと浮力統合版
      'sci.physics.spring_force_sim', // ばねと力シミュレーション
      'sci.physics.light_properties', // 光の性質
      'sci.physics.light_properties_sim', // 光の性質シミュレーション
      'sci.physics.force_motion_pulley_integrated', // 力と運動（浮力・かっ車・輪じく）統合版
      'sci.physics.pendulum_moving_weight_integrated', // ふりことおもりの運動（統合）
      'sci.physics.balance', // 上皿てんびん
      'sci.physics.current_compass', // 流れる電流と方位磁針
      // 地学（14）
      'sci.earth.volcano_structure_land_change_integrated', // 火山のしくみ・火山と大地の変化統合版
      'sci.earth.volcano_structure_sim', // 火山のしくみ：マグマと噴火シミュレーション
      'sci.earth.earthquake_structure', // 地震と地震のしくみ（統合）
      'sci.earth.earthquake_structure_sim', // 地震のしくみシミュレーション
      'sci.earth.strata_formation', // 地層のでき方と岩石（統合）
      'sci.earth.various_landforms', // いろいろな地形
      'sci.earth.fossils_strata', // 化石と地層のようす
      'sci.earth.land_river_erosion', // 流水と地形の変化
      'sci.earth.sun_movement', // 太陽の動き（小4から移動）
      'sci.earth.moon_movement', // 月の動き（小4から移動）
      'sci.earth.weather_observation_pressure_wind', // 気象の観測と雲のでき方（統合）
      'sci.earth.temperature_changes', // 気温の変化
      // 生物（8）
      'sci.biology.animal_classification', // 動物の分類（小4から移動）
      'sci.biology.living_things_seasons', // 生物のくらしと四季（小4から移動）
      'sci.biology.food_chain', // 生物のつながり（食物連鎖）
      'sci.biology.photosynthesis', // 光合成のしくみ（小4から移動）
      'sci.biology.plant_structure_transpiration_integrated', // 植物のつくりとはたらき（統合）
      'sci.biology.plant_classification', // 植物のなかま分け
      'sci.biology.digestion_absorption', // 消化と吸収
      // 化学（3）
      'sci.chemistry.solution_integrated', // 水溶液（溶解度・とけ方・濃さ）（統合）
      'sci.chemistry.solubility_temperature_sim', // 水溶液と溶解度シミュレーション
      'sci.chemistry.physics.heat_transfer' // 熱の移動と温度の変化
    ]
  },
  {
    id: 'g6',
    name: '小6理科：総合と応用',
    shortName: '小6',
    icon: '🎯',
    lessons: [
      // 気象（前線・天気図）系（小5から移動）（4）
      'sci.earth.front_weather_land_sea_breeze', // 前線と天気, 海陸風
      'sci.earth.japan_weather', // 日本の天気
      'sci.earth.clouds_fronts_weather_map', // 気象（雲・前線・天気図）
      'sci.earth.weather_fronts_sim', // 天気の変化（低気圧と前線）シミュレーション
      // 人体（循環/排出/感覚器/誕生）系（小5から移動）（4）
      'sci.biology.heart_blood_circulation', // 心臓と血液のじゅんかん
      'sci.biology.respiration_excretion', // 呼吸と排出
      'sci.biology.bones_muscles_senses', // 骨と筋肉, 感覚器
      'sci.biology.human_birth', // ヒトのたんじょう
      // 応用レッスン（3）
      'sci.biology.environment_energy', // 環境問題 エネルギー問題（小4から移動）
      'sci.biology.human_body_digestion_respiration', // 人体①（消化・呼吸・血液）
      'sci.biology.human_body_nervous_motion', // 人体②（神経・運動）
      // 物理総合（3）
      'sci.comprehensive.electricity_comprehensive', // 電気総合（回路／電力／発熱）
      'sci.comprehensive.light_sound_comprehensive', // 光・音の総合
      'sci.comprehensive.mechanics_comprehensive', // 力学総合（てこ／滑車／ばね／浮力）
      // 化学総合（2）
      'sci.comprehensive.combustion_comprehensive', // 気体・燃焼総合（計算含む）
      'sci.comprehensive.water_solution_comprehensive', // 水溶液総合（酸・アルカリ・中和）
      // 化学（詳細）
      'sci.chemistry.neutralization', // 中 和
      'sci.chemistry.solution_metal_reaction', // 水よう液と金属の反応
      'sci.chemistry.various_gases', // いろいろな気体
      // 生物総合（2）
      'sci.comprehensive.animals_comprehensive', // 動物総合
      'sci.comprehensive.human_body_comprehensive', // ヒトの体総合（全分野の横断）
      // 地学総合（3）
      'sci.comprehensive.astronomy_comprehensive', // 天体総合（太陽・月・地球・惑星）
      'sci.comprehensive.strata_comprehensive', // 大地の変化総合（地層／化石／火山／地震）
      'sci.comprehensive.weather_comprehensive' // 気象総合（前線／台風／天気図読み取り）
    ]
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
          'soc.geography.world_geography_wakaru',
          'soc.geography.map_hokkaido_integrated_wakaru',
          'soc.geography.map_tohoku_integrated_wakaru',
          'soc.geography.map_kanto_integrated_wakaru',
          'soc.geography.map_chubu_integrated_wakaru',
          'soc.geography.map_kinki_integrated_wakaru',
          'soc.geography.map_chugoku_shikoku_integrated_wakaru',
          'soc.geography.map_kyushu_integrated_wakaru'
        ]
  },
  {
    id: 'history',
    name: '歴史分野',
    icon: '📜',
    lessons: [
      'soc.history.paleolithic_jomon_yayoi',
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
      'soc.history.cross_period_problems',
      'soc.history.source_jomon_yayoi_wakaru',
      'soc.history.source_kofun_asuka_wakaru',
      'soc.history.source_nara_wakaru',
      'soc.history.source_heian_wakaru',
      'soc.history.source_kamakura_wakaru',
      'soc.history.source_muromachi_wakaru',
      'soc.history.source_azuchi_momoyama_wakaru',
      'soc.history.source_edo_wakaru',
      'soc.history.theme_politics_economy_wakaru',
      'soc.history.theme_people_wakaru',
      'soc.history.theme_diplomacy_wakaru',
      'soc.history.theme_culture_wakaru'
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
  },
  {
    id: 'comprehensive',
    name: '総合',
    icon: '🎯',
    lessons: [
      'soc.comprehensive.geography_theme_cross',
      'soc.comprehensive.geography_region_comprehensive',
      'soc.comprehensive.history_theme_integration',
      'soc.comprehensive.history_period_flow',
      'soc.comprehensive.civics_system_composite',
      'soc.comprehensive.civics_modern_issues',
      'soc.comprehensive.basic_integration',
      'soc.comprehensive.advanced_integration',
      'soc.comprehensive.practice_a',
      'soc.comprehensive.practice_b',
      'soc.comprehensive.practice_c',
      'soc.comprehensive.practice_d'
    ]
  }
];

// 理科おぼえる編の分野定義
scienceDrillUnits = [
  {
    id: 'g4_drill',
    name: '小4理科：観察・基本現象',
    shortName: '小4',
    icon: '📝',
    lessons: [
      // 生物（4）
      'sci.biology.seasons_living_things_oboeru', // 季節と生物（春）
      'sci.biology.seasons_living_things_summer_oboeru', // 季節と生物（夏〜冬）
      'sci.biology.plants_growth_light_oboeru', // 植物の成長
      'sci.biology.plants_observation_oboeru', // 花のつくりと受粉
      // 物理（3）
      'sci.physics.weight_volume_basic_oboeru', // つり合いとてんびん
      'sci.physics.electricity_conductivity_basic_oboeru', // 電気（乾電池と豆電球）
      'sci.physics.heat_properties_oboeru', // 熱の性質とものの変化
      // 化学（4）
      'sci.chemistry.air_properties_oboeru', // 空気の性質
      'sci.chemistry.water_three_states_oboeru', // 水の変化・状態変化
      'sci.chemistry.combustion_air_oboeru', // 燃焼と空気の成分
      // 地学（4）
      'sci.earth.constellations_seasons_oboeru', // 星と星座
      'sci.earth.sun_movement_shadow_oboeru', // 太陽と影（基礎）
      'sci.earth.weather_changes_oboeru', // 天気の変化
      'sci.earth.river_work_oboeru' // 川のはたらき
    ]
  },
  {
    id: 'g5_drill',
    name: '小5理科：しくみを学ぶ',
    shortName: '小5',
    icon: '📝',
    lessons: [
      // 物理（7）
      'sci.physics.current_voltage_circuit_oboeru', // 電気の基礎（乾電池・回路）
      'sci.physics.current_effect_heating_oboeru', // 電流の作用①（発熱）
      'sci.physics.current_effect_magnetic_oboeru', // 電流の作用②（磁界）
      'sci.physics.lever_weight_basic_oboeru', // てこのつり合い
      'sci.physics.spring_force_oboeru', // ばねと力
      'sci.physics.light_properties_oboeru', // 光の性質
      'sci.physics.force_motion_oboeru', // 力と運動（浮力・かっ車・輪じく）
      // 地学（4）
      'sci.earth.volcano_structure_oboeru', // 火山のしくみ
      'sci.earth.earthquake_structure_oboeru', // 地震のしくみ
      'sci.earth.land_river_erosion_oboeru', // 流水と地形の変化
      'sci.earth.clouds_fronts_weather_map_oboeru', // 気象（雲・前線・天気図）
      // 生物（3）
      'sci.biology.food_chain_oboeru', // 生物のつながり（食物連鎖）
      'sci.biology.human_body_digestion_respiration_oboeru', // 人体①（消化・呼吸・血液）
      'sci.biology.human_body_nervous_motion_oboeru', // 人体②（神経・運動）
      // 化学（1）
      'sci.chemistry.solubility_temperature_oboeru' // 水溶液と溶解度
    ]
  },
  {
    id: 'g6_drill',
    name: '小6理科：総合と応用',
    shortName: '小6',
    icon: '📝',
    lessons: [
      // 物理総合（3）
      'sci.comprehensive.electricity_comprehensive_oboeru', // 電気総合（回路／電力／発熱）
      'sci.comprehensive.light_sound_comprehensive_oboeru', // 光・音の総合
      'sci.comprehensive.mechanics_comprehensive_oboeru', // 力学総合（てこ／滑車／ばね／浮力）
      // 化学総合（2）
      'sci.comprehensive.combustion_comprehensive_oboeru', // 気体・燃焼総合（計算含む）
      'sci.comprehensive.water_solution_comprehensive_oboeru', // 水溶液総合（酸・アルカリ・中和）
      // 生物（2）
      'sci.comprehensive.animals_comprehensive_oboeru', // 動物総合
      'sci.comprehensive.human_body_comprehensive_oboeru', // ヒトの体総合（全分野の横断）
      // 地学総合（3）
      'sci.comprehensive.astronomy_comprehensive_oboeru', // 天体総合（太陽・月・地球・惑星）
      'sci.comprehensive.strata_comprehensive_oboeru', // 大地の変化総合（地層／化石／火山／地震）
      'sci.comprehensive.weather_comprehensive_oboeru' // 気象総合（前線／台風／天気図読み取り）
    ]
  }
];

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
      'soc.history.cross_period_problems_oboeru',
      'soc.history.theme_politics_economy_oboeru',
      'soc.history.theme_people_oboeru',
      'soc.history.theme_diplomacy_oboeru',
      'soc.history.theme_culture_oboeru'
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
  },
  {
    id: 'comprehensive_drill',
    name: '総合',
    icon: '🎯',
    lessons: [
      'soc.comprehensive.geography_theme_cross_oboeru',
      'soc.comprehensive.geography_region_comprehensive_oboeru',
      'soc.comprehensive.history_theme_integration_oboeru',
      'soc.comprehensive.history_period_flow_oboeru',
      'soc.comprehensive.civics_system_composite_oboeru',
      'soc.comprehensive.civics_modern_issues_oboeru',
      'soc.comprehensive.basic_integration_oboeru',
      'soc.comprehensive.advanced_integration_oboeru',
      'soc.comprehensive.practice_a_oboeru',
      'soc.comprehensive.practice_b_oboeru',
      'soc.comprehensive.practice_c_oboeru',
      'soc.comprehensive.practice_d_oboeru'
    ]
  }
];

// レッスンIDから単元を特定する関数
function getUnitFromLessonId(lessonId, subjectType) {
  if (subjectType === 'sci' || subjectType === 'science_drill') {
    // 理科：scienceUnitsのlessons配列から判定
    for (const unit of scienceUnits) {
      if (unit.lessons && unit.lessons.includes(lessonId)) {
        return unit.id;
      }
    }
    // scienceDrillUnitsのlessons配列からも判定
    for (const unit of scienceDrillUnits) {
      if (unit.lessons && unit.lessons.includes(lessonId)) {
        // g4_drill → g4 に変換
        return unit.id.replace('_drill', '');
      }
    }
  } else if (subjectType === 'soc' || subjectType === 'social_drill') {
    // 社会：socialUnitsのlessons配列から判定
    for (const unit of socialUnits) {
      if (unit.lessons && unit.lessons.includes(lessonId)) {
        return unit.id;
      }
    }
    // socialDrillUnitsのlessons配列からも判定
    for (const unit of socialDrillUnits) {
      if (unit.lessons && unit.lessons.includes(lessonId)) {
        // geography_drill → geography に変換
        return unit.id.replace('_drill', '');
      }
    }
  }
  return null;
}

// 単元が購入済みかチェック（単元内のレッスンのsku_requiredを確認）
function isUnitPurchased(unitId, subjectType) {
  // 単元内のレッスンを取得
  let unitLessons = [];
  if (subjectType === 'sci' || subjectType === 'science_drill') {
    const wakaruUnit = unitId === 'g4' ? scienceUnits.find(u => u.id === 'g4') :
                       unitId === 'g5' ? scienceUnits.find(u => u.id === 'g5') :
                       unitId === 'g6' ? scienceUnits.find(u => u.id === 'g6') : null;
    const oboeruUnit = unitId === 'g4' ? scienceDrillUnits.find(u => u.id === 'g4_drill') :
                       unitId === 'g5' ? scienceDrillUnits.find(u => u.id === 'g5_drill') :
                       unitId === 'g6' ? scienceDrillUnits.find(u => u.id === 'g6_drill') : null;
    
    if (wakaruUnit && wakaruUnit.lessons) {
      unitLessons = unitLessons.concat(wakaruUnit.lessons);
    }
    if (oboeruUnit && oboeruUnit.lessons) {
      unitLessons = unitLessons.concat(oboeruUnit.lessons);
    }
  } else if (subjectType === 'soc' || subjectType === 'social_drill') {
    const wakaruUnit = unitId === 'geography' ? socialUnits.find(u => u.id === 'geography') :
                       unitId === 'history' ? socialUnits.find(u => u.id === 'history') :
                       unitId === 'civics' ? socialUnits.find(u => u.id === 'civics') :
                       unitId === 'comprehensive' ? socialUnits.find(u => u.id === 'comprehensive') : null;
    const oboeruUnit = unitId === 'geography' ? socialDrillUnits.find(u => u.id === 'geography_drill') :
                       unitId === 'history' ? socialDrillUnits.find(u => u.id === 'history_drill') :
                       unitId === 'civics' ? socialDrillUnits.find(u => u.id === 'civics_drill') :
                       unitId === 'comprehensive' ? socialDrillUnits.find(u => u.id === 'comprehensive_drill') : null;
    
    if (wakaruUnit && wakaruUnit.lessons) {
      unitLessons = unitLessons.concat(wakaruUnit.lessons);
    }
    if (oboeruUnit && oboeruUnit.lessons) {
      unitLessons = unitLessons.concat(oboeruUnit.lessons);
    }
  }
  
  if (unitLessons.length === 0) {
    return false;
  }
  
  // 単元内のレッスンのsku_requiredを確認
  // 単元内のレッスンで使用されているSKUを収集
  const requiredSkus = new Set();
  for (const lessonId of unitLessons) {
    const lesson = findLessonById(lessonId);
    if (lesson && lesson.sku_required) {
      requiredSkus.add(lesson.sku_required);
    }
  }
  
  // すべての必要なSKUが購入済み、または無料（sku_requiredがnull）のレッスンのみなら購入済みとみなす
  if (requiredSkus.size === 0) {
    // すべてのレッスンが無料
    return true;
  }
  
  // 必要なSKUがすべて購入済みかチェック
  for (const sku of requiredSkus) {
    if (!hasEntitlement(sku)) {
      return false;
    }
  }
  
  return true;
}

// おすすめ教材を選択する関数（ルートマップ用：単元ごとにわかる編→おぼえる編を交互に）
function getRecommendedRouteMap(subjectGroup) {
  const { name, subjects } = subjectGroup;
  
  // 単元の順序を定義
  let unitOrder = [];
  if (subjects.includes('sci') || subjects.includes('science_drill')) {
    // 理科：学年順
    unitOrder = ['g4', 'g5', 'g6'];
  } else if (subjects.includes('soc') || subjects.includes('social_drill')) {
    // 社会：分野順
    unitOrder = ['geography', 'history', 'civics', 'comprehensive'];
  }
  
  // 単元ごとにわかる編→おぼえる編の順でレッスンを並べる
  const allRouteLessons = [];
  
  for (const unitId of unitOrder) {
    // 購入済みの単元のみ処理
    if (!isUnitPurchased(unitId, subjects[0])) {
      continue;
    }
    
    // わかる編のレッスンを取得
    const wakaruUnit = unitId === 'g4' ? scienceUnits.find(u => u.id === 'g4') :
                       unitId === 'g5' ? scienceUnits.find(u => u.id === 'g5') :
                       unitId === 'g6' ? scienceUnits.find(u => u.id === 'g6') :
                       unitId === 'geography' ? socialUnits.find(u => u.id === 'geography') :
                       unitId === 'history' ? socialUnits.find(u => u.id === 'history') :
                       unitId === 'civics' ? socialUnits.find(u => u.id === 'civics') :
                       unitId === 'comprehensive' ? socialUnits.find(u => u.id === 'comprehensive') : null;
    
    // おぼえる編のレッスンを取得
    const oboeruUnit = unitId === 'g4' ? scienceDrillUnits.find(u => u.id === 'g4_drill') :
                       unitId === 'g5' ? scienceDrillUnits.find(u => u.id === 'g5_drill') :
                       unitId === 'g6' ? scienceDrillUnits.find(u => u.id === 'g6_drill') :
                       unitId === 'geography' ? socialDrillUnits.find(u => u.id === 'geography_drill') :
                       unitId === 'history' ? socialDrillUnits.find(u => u.id === 'history_drill') :
                       unitId === 'civics' ? socialDrillUnits.find(u => u.id === 'civics_drill') :
                       unitId === 'comprehensive' ? socialDrillUnits.find(u => u.id === 'comprehensive_drill') : null;
    
    // わかる編のレッスンを追加
    if (wakaruUnit && wakaruUnit.lessons) {
      wakaruUnit.lessons.forEach(lessonId => {
        const lesson = findLessonById(lessonId);
        if (lesson) {
          allRouteLessons.push({ ...lesson, unitId: unitId, unitType: 'wakaru' });
        }
      });
    }
    
    // おぼえる編のレッスンを追加
    if (oboeruUnit && oboeruUnit.lessons) {
      oboeruUnit.lessons.forEach(lessonId => {
        const lesson = findLessonById(lessonId);
        if (lesson) {
          allRouteLessons.push({ ...lesson, unitId: unitId, unitType: 'oboeru' });
        }
      });
    }
  }
  
  if (allRouteLessons.length === 0) {
    return null;
  }
  
  // 最後に学習したレッスンを特定（個別の単元を選んだ場合も考慮）
  const completedLessons = allRouteLessons
    .filter(entry => isLessonCompleted(entry.id))
    .sort((a, b) => {
      const progressA = getLessonProgress(a.id);
      const progressB = getLessonProgress(b.id);
      return (progressB?.at || 0) - (progressA?.at || 0);
    });
  
  let currentIndex = 0;
  let currentUnitId = null;
  
  if (completedLessons.length > 0) {
    // 最後に完了したレッスンの単元を特定
    const lastCompleted = completedLessons[0];
    currentUnitId = lastCompleted.unitId;
    
    // その単元の最初のレッスンのインデックスを取得
    const currentUnitStartIndex = allRouteLessons.findIndex(entry => entry.unitId === currentUnitId);
    if (currentUnitStartIndex !== -1) {
      // その単元内で最初の未完了レッスンを探す
      const unitLessons = allRouteLessons.filter(entry => entry.unitId === currentUnitId);
      const firstIncompleteInUnit = unitLessons.find(entry => !isLessonCompleted(entry.id));
      
      if (firstIncompleteInUnit) {
        // 単元内に未完了のレッスンがある場合、そのレッスンを「現在」とする
        currentIndex = allRouteLessons.findIndex(entry => entry.id === firstIncompleteInUnit.id);
      } else {
        // その単元がすべて完了している場合は、次の単元の最初のレッスンへ
        const nextUnitIndex = unitOrder.findIndex(id => id === currentUnitId) + 1;
        if (nextUnitIndex < unitOrder.length) {
          const nextUnitId = unitOrder[nextUnitIndex];
          const nextUnitStartIndex = allRouteLessons.findIndex(entry => entry.unitId === nextUnitId);
          if (nextUnitStartIndex !== -1) {
            currentIndex = nextUnitStartIndex;
            currentUnitId = nextUnitId;
          }
        } else {
          // すべての単元が完了している場合は、最後のレッスンを「現在」とする
          currentIndex = allRouteLessons.length - 1;
        }
      }
    } else {
      // 単元が見つからない場合は、最後に完了したレッスンの次のレッスン
      const lastCompletedIndex = allRouteLessons.findIndex(entry => entry.id === lastCompleted.id);
      if (lastCompletedIndex < allRouteLessons.length - 1) {
        currentIndex = lastCompletedIndex + 1;
      }
    }
  } else {
    // 完了したレッスンがない場合は、最初の単元の最初のレッスンから
    if (unitOrder.length > 0) {
      const firstUnitId = unitOrder[0];
      const firstUnitStartIndex = allRouteLessons.findIndex(entry => entry.unitId === firstUnitId);
      if (firstUnitStartIndex !== -1) {
        currentIndex = firstUnitStartIndex;
        currentUnitId = firstUnitId;
      }
    }
  }
  
  // 暫定対応：現在のレッスンの前を1つ、後を2つ表示（中央寄りに表示されるように）
  const startIndex = Math.max(0, currentIndex - 1);
  const endIndex = Math.min(allRouteLessons.length - 1, currentIndex + 2);
  const routeSegment = allRouteLessons.slice(startIndex, endIndex + 1);
  
  // 各レッスンに位置情報を追加
  return routeSegment.map((lesson, index) => {
    const globalIndex = startIndex + index;
    const position = globalIndex - currentIndex; // -1, 0, 1, 2（前1つ、後2つ）
    const isCurrent = position === 0;
    const isCompleted = isLessonCompleted(lesson.id);
    
    return {
      ...lesson,
      position: position, // -1, 0, 1, 2
      isCurrent: isCurrent,
      isCompleted: isCompleted,
      routeIndex: globalIndex
    };
  });
}

// おすすめ教材を選択する関数（従来版：1つずつ取得）
function getRecommendedLessons() {
  const recommendations = [];
  
  // 1. 復習レッスンを最優先で追加（復習システム無効化のためスキップ）
  if (false && state.reviewLessons && state.reviewLessons.length > 0) {
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
  }
  
  // 理科・社会それぞれで1つずつ推薦
  // 理科：sci（わかる編）→ science_drill（おぼえる編）の順
  // 社会：soc（わかる編）→ social_drill（おぼえる編）の順
  const subjectGroups = [
    { name: '理科', subjects: ['sci', 'science_drill'] },
    { name: '社会', subjects: ['soc', 'social_drill'] }
  ];
  
  subjectGroups.forEach(group => {
    let recommendedLesson = null;
    
    // わかる編→おぼえる編の順で処理
    for (const subject of group.subjects) {
      // カタログからその教科の教材を取得し、IDでソート（番号順）
      const subjectLessons = filterLessonsBySubject(subject)
        .sort((a, b) => a.id.localeCompare(b.id));
    
      if (subjectLessons.length === 0) {
        continue;
      }
      
      // 最後に取り組んだ教材を特定（時系列順）
      const completedLessons = subjectLessons
        .filter(entry => isLessonCompleted(entry.id))
        .sort((a, b) => {
          const progressA = getLessonProgress(a.id);
          const progressB = getLessonProgress(b.id);
          return (progressB?.at || 0) - (progressA?.at || 0);
        });
      
      let nextLesson = null;
    
      if (completedLessons.length > 0) {
        // 最後に完了した教材の次の教材を探す
        const lastCompleted = completedLessons[0];
        const lastCompletedIndex = subjectLessons.findIndex(entry => entry.id === lastCompleted.id);
      
        if (lastCompletedIndex < subjectLessons.length - 1) {
          nextLesson = subjectLessons[lastCompletedIndex + 1];
        }
      } else {
        // 完了した教材がない場合は最初の教材を推薦
        nextLesson = subjectLessons[0];
      }
    
      // 未完了の教材が見つかったら推薦として採用
      if (nextLesson && !isLessonCompleted(nextLesson.id)) {
        recommendedLesson = nextLesson;
        break; // わかる編で見つかったらおぼえる編は見ない
      }
    }
    
    // その分野の推薦教材があれば追加
    if (recommendedLesson) {
      recommendations.push(recommendedLesson);
    }
  });
  
  // 3. おさらいレッスンを1つ追加
  const reviewLesson = getReviewLesson();
  if (reviewLesson) {
    recommendations.push({
      ...reviewLesson,
      type: 'review',
      reviewType: 'osaarai' // おさらい専用のタイプ
    });
  }
  
  return recommendations;
}

// おさらいレッスンを取得する関数（1つだけ）
function getReviewLesson() {
  const reviewLessons = getReviewLessons(1);
  return reviewLessons.length > 0 ? reviewLessons[0] : null;
}
  
// 複数のおさらいレッスンを取得する関数（最大数指定可能）
function getReviewLessons(maxCount = 3) {
  console.log('🔍 getReviewLessons: おさらいレッスンを検索開始 (maxCount:', maxCount, ')');
  // 全教科（理科・社会のわかる編・おぼえる編）から完了済みレッスンを取得
  const reviewCandidates = [];
  
  const allSubjects = ['sci', 'science_drill', 'soc', 'social_drill'];
  
  let totalLessons = 0;
  let completedLessons = 0;
  let candidatesFound = 0;
  
  allSubjects.forEach(subject => {
    const subjectLessons = filterLessonsBySubject(subject);
    totalLessons += subjectLessons.length;
    
    subjectLessons.forEach(lesson => {
      // まず進捗データの存在を確認
      const progress = getLessonProgress(lesson.id);
      console.log(`🔍 おさらい候補チェック: ${lesson.id}`, {
        hasProgress: !!progress,
        progress: progress,
        hasDetail: !!progress?.detail,
        correct: progress?.detail?.correct
      });
      
      if (!isLessonCompleted(lesson.id)) {
        console.log(`⏭️ スキップ: ${lesson.id} (未完了)`);
        return; // 未完了のレッスンはスキップ
      }
      
      completedLessons++;
      console.log(`✅ 完了レッスン発見: ${lesson.id} (${completedLessons}件目)`);
      
      if (!progress || !progress.detail) {
        console.log(`⚠️ 進捗データ不備: ${lesson.id}`, progress);
        return;
      }
      
      const score = progress.score || 0;
      const lastStudyDate = progress.at ? new Date(progress.at) : null;
      
      if (!lastStudyDate) {
        return;
      }
      
      const daysSince = Math.floor((Date.now() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // 満点は除外（ただし30日以上経過していれば含める）
      if (score >= 1.0 && daysSince < 30) {
        return;
      }
      
      // 優先度を計算
      const priority = calculateReviewPriority(score, daysSince);
      
      if (priority <= 5) { // 優先度1-5のもののみ候補に（条件を緩和）
        candidatesFound++;
        reviewCandidates.push({
          lesson,
          score,
          lastStudyDate,
          daysSince,
          priority,
          progress
        });
        console.log('✅ おさらい候補を追加:', {
          lessonId: lesson.id,
          title: lesson.title,
          score: (score * 100).toFixed(1) + '%',
          daysSince: daysSince + '日前',
          priority: priority
        });
      }
    });
  });
  
  console.log('🔍 getReviewLessons: 検索結果', {
    totalLessons,
    completedLessons,
    candidatesFound,
    reviewCandidatesCount: reviewCandidates.length
  });
  
  if (reviewCandidates.length === 0) {
    console.log('⚠️ getReviewLessons: おさらい候補が見つかりませんでした');
    return [];
  }
  
  // 優先度でソート（優先度の低い順→日数の多い順）
  reviewCandidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // 優先度の低い順（1が最優先）
    }
    return b.daysSince - a.daysSince; // 同じ優先度なら古い順
  });
  
  // 最大数まで返す
  const result = reviewCandidates.slice(0, maxCount).map(candidate => candidate.lesson);
  console.log('✅ getReviewLessons: 返却するおさらいレッスン数:', result.length);
  return result;
}

// おさらいの優先度を計算する関数
function calculateReviewPriority(score, daysSince) {
  // 優先1: スコア85%未満 かつ 3日以上経過
  if (score < 0.85 && daysSince >= 3) {
    return 1;
  }
  
  // 優先2: スコア90%未満 かつ 7日以上経過
  if (score < 0.90 && daysSince >= 7) {
    return 2;
  }
  
  // 優先3: 満点以外 かつ 14日以上経過
  if (score < 1.0 && daysSince >= 14) {
    return 3;
  }
  
  // 優先4: 満点でも30日以上経過していれば含める（条件を緩和）
  if (score >= 1.0 && daysSince >= 30) {
    return 4;
  }
  
  // 優先5: 完了済みで1日以上経過していれば含める（さらに緩和）
  if (daysSince >= 1) {
    return 5;
  }
  
  // 条件外
  return 99;
}

// メインタブのイベントリスナーを設定
function setupMainTabs() {
  const mainTabs = document.querySelectorAll('.main-tab');
  
  mainTabs.forEach(tab => {
    tab.addEventListener('click', handleMainTabClick);
  });
}

// メインタブクリックハンドラー
async function handleMainTabClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  // 現在のスクロール位置を保存（複数回保存して確実に）
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  
  const tab = event.currentTarget;
  const mainTab = tab.dataset.mainTab;
  
  // フォーカスを即座に外してスクロールを防ぐ
  tab.blur();
  
  // scroll-behavior: smoothを一時的に無効化
  const htmlElement = document.documentElement;
  const originalScrollBehavior = htmlElement.style.scrollBehavior;
  htmlElement.style.scrollBehavior = 'auto';
  
  // スクロールを防ぐため、一時的にbodyのoverflowを制御
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  
  // アクティブなメインタブを更新
  document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  
  const subTabsContainer = document.getElementById('subTabsContainer');
  
  if (mainTab === 'recommended') {
    // おすすめ学習を選択
    if (subTabsContainer) {
      subTabsContainer.style.display = 'none';
    }
    window.currentSubject = 'recommended';
    updateSubjectHero('recommended');
    await renderHome();
  } else if (mainTab === 'list') {
    // 学習リストを選択
    if (subTabsContainer) {
      subTabsContainer.style.display = 'block';
    }
    // デフォルトで最初のサブタブ（理科わかる）を選択
    const firstSubTab = document.querySelector('.subject-tab[data-subject="sci"]');
    if (firstSubTab && !document.querySelector('.subject-tab.active')) {
      window.currentSubject = 'sci';
      updateSubjectHero('sci');
      document.querySelectorAll('.subject-tab').forEach(t => t.classList.remove('active'));
      firstSubTab.classList.add('active');
      await renderHome();
    }
  }
  
  // bodyのスタイルを元に戻す
  document.body.style.overflow = originalOverflow;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  
  // scroll-behaviorを元に戻す
  htmlElement.style.scrollBehavior = originalScrollBehavior;
  
  // スクロール位置を復元（DOM更新後に複数回実行して確実に復元）
  window.scrollTo(0, scrollY);
  
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      setTimeout(() => {
        window.scrollTo(0, scrollY);
        setTimeout(() => {
          window.scrollTo(0, scrollY);
        }, 50);
      }, 10);
    });
  });
}

// 教科別タブ（サブタブ）のイベントリスナーを設定
// グローバル変数でリスナー参照を保持（重複登録を防ぐため）
let subjectTabsResizeHandler = null;
let subjectTabsInitialized = false;

function setupSubjectTabs() {
  // 🚨 無限リロード防止: 重複実行を防ぐ
  if (window._subjectTabsSetup) {
    console.log('⚠️ setupSubjectTabs() は既に実行済みです。スキップします。');
    return;
  }
  window._subjectTabsSetup = true;
  
  // 既に初期化済みの場合はスキップ（パフォーマンス最適化）
  const container = document.getElementById('subTabsContainer');
  if (!container) {
    window._subjectTabsSetup = false; // コンテナがない場合はリセット
    return;
  }
  
  const subjectTabs = container.querySelectorAll('.subject-tab');
  if (subjectTabs.length === 0) {
    window._subjectTabsSetup = false; // タブがない場合はリセット
    return;
  }
  
  // 既にリスナーが登録されているかチェック
  const firstTab = subjectTabs[0];
  if (firstTab && firstTab.hasAttribute('data-listener-attached')) {
    // テキスト更新のみ実行
    updateSubjectTabTexts();
    return;
  }
  
  // 375px以下でタブテキストを短縮表示
  function updateTabTexts() {
    const isSmallScreen = window.innerWidth <= 375;
    const tabs = document.querySelectorAll('.subject-tab');
    tabs.forEach(tab => {
      const subject = tab.dataset.subject;
      const originalText = tab.getAttribute('data-original-text') || tab.textContent;
      if (!tab.getAttribute('data-original-text')) {
        tab.setAttribute('data-original-text', originalText);
      }
      
      if (isSmallScreen) {
        // 375px以下では短縮テキストを使用
        switch(subject) {
          case 'science_drill':
            tab.textContent = '🧪 理科おぼ';
            break;
          case 'social_drill':
            tab.textContent = '📍 社会おぼ';
            break;
          case 'sci':
            tab.textContent = '🔬 理科わ';
            break;
          case 'soc':
            tab.textContent = '🌍 社会わ';
            break;
        }
      } else {
        // 通常サイズでは元のテキストを復元
        const original = tab.getAttribute('data-original-text');
        if (original) {
          tab.textContent = original;
        }
      }
    });
  }
  
  // グローバル関数として公開（リサイズハンドラー用）
  window.updateSubjectTabTexts = updateTabTexts;
  
  // 初期設定
  updateTabTexts();
  
  // リサイズ時に更新（重複登録を防ぐ）
  if (subjectTabsResizeHandler) {
    window.removeEventListener('resize', subjectTabsResizeHandler);
  }
  
  let resizeTimer;
  subjectTabsResizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateTabTexts, 100);
  };
  window.addEventListener('resize', subjectTabsResizeHandler);
  
  // イベントリスナーを追加（重複を防ぐため、data属性で管理）
  subjectTabs.forEach(tab => {
    if (!tab.hasAttribute('data-listener-attached')) {
      tab.addEventListener('click', handleTabClick);
      tab.setAttribute('data-listener-attached', 'true');
    }
  });
  
  subjectTabsInitialized = true;
}

// タブクリックハンドラーを分離
async function handleTabClick(event) {
  // デフォルトの動作（スクロールなど）を防ぐ
  event.preventDefault();
  event.stopPropagation();
  
  // 現在のスクロール位置を保存（グローバル変数にも保存）
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  window._savedScrollY = scrollY;
  window._savedScrollX = scrollX;
  
  const tab = event.currentTarget;
  console.log('📌 タブクリック:', tab.dataset.subject);
  
  // フォーカスを即座に外してスクロールを防ぐ
  tab.blur();
  
  // scroll-behavior: smoothを一時的に無効化
  const htmlElement = document.documentElement;
  const originalScrollBehavior = htmlElement.style.scrollBehavior;
  htmlElement.style.scrollBehavior = 'auto';
  
  // スクロールを防ぐため、一時的にbodyのoverflowを制御
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  
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
  
  // bodyのスタイルを元に戻す（renderHome内で既に復元されている場合は上書きしない）
  // renderHome内でbodyがfixedのままの場合は、ここで確実に元に戻す
  if (document.body.style.position === 'fixed') {
    document.body.style.overflow = originalOverflow;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  }
  
  // scroll-behaviorを元に戻す
  htmlElement.style.scrollBehavior = originalScrollBehavior;
  
  // スクロール位置を復元（パフォーマンス最適化：呼び出し回数を減らす）
  // renderHome内でも復元されるため、ここでは1回のみ実行
  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
    // 念のため、DOM更新完了後に再度実行
    setTimeout(() => {
      window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
      // グローバル変数をクリア
      delete window._savedScrollY;
      delete window._savedScrollX;
    }, 50);
  });
}

// 定数定義
const SCROLL_ADJUST_DELAYS = [50, 200]; // スクロール調整のタイムアウト値（ms）
const SUBJECT_GROUPS = [
  { name: '理科', subjects: ['sci', 'science_drill'], icon: '🔬', colorClass: 'sci' },
  { name: '社会', subjects: ['soc', 'social_drill'], icon: '🌍', colorClass: 'soc' }
];
const UNIT_SUBJECTS = ['sci', 'soc', 'science_drill', 'social_drill'];

// ログインパネルを非表示にする共通関数
function hideLoginPanel() {
  const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
  if (loginPanel) {
    const isLoggedIn = state.user || (typeof auth !== 'undefined' && auth.currentUser);
    if (isLoggedIn) {
      loginPanel.classList.add('hidden');
      loginPanel.style.display = 'none';
    }
  }
}

// currentSubjectの初期化と安全な取得
function getSafeCurrentSubject() {
  if (typeof window.currentSubject === 'undefined' || window.currentSubject === null) {
    window.currentSubject = 'recommended';
    console.log('🔄 renderHome内でcurrentSubjectを初期化:', window.currentSubject);
  }
  return window.currentSubject || 'recommended';
}

// ルートマップのスクロール位置を調整
function adjustRouteMapScroll(track) {
  const currentItem = track.querySelector('[data-current-lesson="true"]');
  if (!currentItem || !track) return;
  
  let totalWidth = 0;
  let found = false;
  
  for (const child of track.children) {
    if (child === currentItem) {
      found = true;
      break;
    }
    totalWidth += child.offsetWidth;
  }
  
  if (!found) return;
  
  const itemWidth = currentItem.offsetWidth;
  const trackWidth = track.clientWidth;
  const targetScrollLeft = totalWidth + (itemWidth / 2) - (trackWidth / 2);
  const maxScrollLeft = track.scrollWidth - trackWidth;
  const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
  
  track.scrollLeft = finalScrollLeft;
}

// ルートマップカードを作成
function createRouteMapCard(lesson, group, isCurrent, isCompleted, hasAccess, subjectName) {
  const item = document.createElement('div');
  item.className = `route-map-item position-${lesson.position}`;
  item.onclick = () => setHash('lesson', lesson.id);
  
  if (isCurrent) {
    const indicator = document.createElement('div');
    indicator.className = 'route-map-card-indicator';
    indicator.textContent = '▼';
    item.appendChild(indicator);
    item.setAttribute('data-current-lesson', 'true');
  }
  
  const card = document.createElement('div');
  card.className = `route-map-card ${group.colorClass} ${isCompleted ? 'completed' : ''}`;
  
  const badge = isCompleted 
    ? '<span class="route-map-card-badge completed">完了</span>'
    : '<span class="route-map-card-badge pending">未完了</span>';
  
  const buttonText = isCompleted ? '再学習' : (hasAccess ? '開始' : '購入');
  const buttonClass = hasAccess ? group.colorClass : 'locked';
  
  card.innerHTML = `
    <div class="route-map-card-title">${escapeHtml(lesson.title)}</div>
    <div class="route-map-card-meta">${subjectName} / 小${lesson.grade} ・ ${lesson.duration_min || '?'}分</div>
    ${badge}
    <button class="route-map-card-button ${buttonClass}">
      ${buttonText}
    </button>
  `;
  
  const button = card.querySelector('.route-map-card-button');
  if (button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      setHash('lesson', lesson.id);
    });
  }
  
  item.appendChild(card);
  return item;
}

// ルートマップをレンダリング
function renderRouteMap(group, list) {
  const routeLessons = getRecommendedRouteMap(group);
  if (!routeLessons || routeLessons.length === 0) return;
  
  // セクションラッパーを作成（理科と社会を完全に分離）
  const sectionWrapper = document.createElement('div');
  sectionWrapper.className = `route-map-section route-map-section-${group.colorClass}`;
  
  // ラベルを追加（うっすらと表示）
  const label = document.createElement('div');
  label.className = 'route-map-section-label';
  label.textContent = group.name;
  sectionWrapper.appendChild(label);
  
  // ルートマップコンテナ
  const routeContainer = document.createElement('div');
  routeContainer.className = 'route-map-container';
  
  const track = document.createElement('div');
  track.className = 'route-map-track';
  
  const fragment = document.createDocumentFragment();
  
  routeLessons.forEach((lesson, index) => {
    const isCompleted = lesson.isCompleted;
    const isCurrent = lesson.isCurrent;
    const subjectName = getSubjectName(lesson.subject);
    const hasAccess = !lesson.sku_required || hasEntitlement(lesson.sku_required);
    
    const item = createRouteMapCard(lesson, group, isCurrent, isCompleted, hasAccess, subjectName);
    fragment.appendChild(item);
    
    if (index < routeLessons.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'route-map-arrow';
      arrow.textContent = '→';
      fragment.appendChild(arrow);
    }
  });
  
  track.appendChild(fragment);
  routeContainer.appendChild(track);
  sectionWrapper.appendChild(routeContainer);
  list.appendChild(sectionWrapper);
  
  // スクロール位置を調整
  SCROLL_ADJUST_DELAYS.forEach(delay => {
    setTimeout(() => adjustRouteMapScroll(track), delay);
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => adjustRouteMapScroll(track));
  });
}

// おさらいレッスン専用セクションをレンダリング（1つだけ、ルートマップ風カード）
function renderReviewSection(list) {
  console.log('🔄 renderReviewSection: おさらいレッスンセクションを描画開始');
  const reviewLessons = getReviewLessons(1); // 1つだけ表示
  console.log('🔄 renderReviewSection: 取得したおさらいレッスン数:', reviewLessons?.length || 0, reviewLessons);
  if (!reviewLessons || reviewLessons.length === 0) {
    console.log('⚠️ renderReviewSection: おさらいレッスンが見つかりませんでした');
    return;
  }
  
  const lesson = reviewLessons[0];
  const isCompleted = isLessonCompleted(lesson.id);
  const subjectName = getSubjectName(lesson.subject);
  const hasAccess = !lesson.sku_required || hasEntitlement(lesson.sku_required);
  
  // セクションラッパーを作成（おさらい専用）
  const sectionWrapper = document.createElement('div');
  sectionWrapper.className = 'route-map-section route-map-section-review';
  
  // ラベルを追加（うっすらと表示）
  const label = document.createElement('div');
  label.className = 'route-map-section-label';
  label.textContent = 'おさらい';
  sectionWrapper.appendChild(label);
  
  // ルートマップコンテナ（理科・社会と同じ構造）
  const routeContainer = document.createElement('div');
  routeContainer.className = 'route-map-container';
  
  const track = document.createElement('div');
  track.className = 'route-map-track review-track'; // 1つだけなので中央配置用のクラスを追加
  
  // カードアイテム（ルートマップ風）
  const item = document.createElement('div');
  item.className = 'route-map-item position-0'; // 中央サイズ
  item.onclick = () => setHash('lesson', lesson.id);
  
  const card = document.createElement('div');
  card.className = `route-map-card review ${lesson.subject} ${isCompleted ? 'completed' : ''}`;
  
  const badge = '<span class="route-map-card-badge review-badge">🔄 おさらい</span>';
  const buttonText = '再学習';
  const buttonClass = hasAccess ? 'review' : 'locked';
  
  card.innerHTML = `
    <div class="route-map-card-title">${escapeHtml(lesson.title)}</div>
    <div class="route-map-card-meta">${subjectName} / 小${lesson.grade} ・ ${lesson.duration_min || '?'}分</div>
    ${badge}
    <button class="route-map-card-button ${buttonClass}">
      ${buttonText}
    </button>
  `;
  
  const button = card.querySelector('.route-map-card-button');
  if (button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      setHash('lesson', lesson.id);
    });
  }
  
  item.appendChild(card);
  track.appendChild(item);
  routeContainer.appendChild(track);
  sectionWrapper.appendChild(routeContainer);
  list.appendChild(sectionWrapper);
}

// ホームレイアウトを設定
function setupHomeLayout(subject) {
  const homeView = document.getElementById('homeView');
  const app = document.getElementById('app');
  
  if (UNIT_SUBJECTS.includes(subject)) {
    homeView.classList.add('math-full-width');
    app.classList.add('math-full-width');
    
    if (!document.getElementById('lessonList')) {
      const subjectInfo = getSubjectHeroInfo(subject);
      homeView.innerHTML = `
        <div class="w-full h-32 sm:h-40 mb-4 sm:mb-6 overflow-hidden relative">
          <div id="subjectHero" class="w-full h-full ${subjectInfo.bgClass} flex items-center justify-center">
            <div class="text-white text-center">
              <div class="text-4xl mb-2">${subjectInfo.icon}</div>
              <div class="text-xl font-bold">${subjectInfo.title}</div>
            </div>
          </div>
        </div>
        <div class="main-tabs mb-4 sm:mb-6">
          <button class="main-tab" data-main-tab="recommended">⭐ おすすめ学習</button>
          <button class="main-tab" data-main-tab="list">📚 学習リスト</button>
        </div>
        <div id="subTabsContainer" class="sub-tabs-container mb-4 sm:mb-6" style="display: none;">
          <div class="subject-tabs">
          <button class="subject-tab" data-subject="sci">🔬 理科わかる</button>
          <button class="subject-tab" data-subject="science_drill">🧪 理科おぼえる</button>
          <button class="subject-tab" data-subject="soc">🌍 社会わかる</button>
          <button class="subject-tab" data-subject="social_drill">📍 社会おぼえる</button>
        </div>
        </div>
        <div id="lessonList" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      `;
      
      setupMainTabs();
      setupSubjectTabs();
      // メインタブのアクティブ状態を設定
      const mainTabs = document.querySelectorAll('.main-tab');
      mainTabs.forEach(tab => {
        if (subject === 'recommended' && tab.dataset.mainTab === 'recommended') {
          tab.classList.add('active');
        } else if (subject !== 'recommended' && tab.dataset.mainTab === 'list') {
          tab.classList.add('active');
          // サブタブを表示
          const subTabsContainer = document.getElementById('subTabsContainer');
          if (subTabsContainer) {
            subTabsContainer.style.display = 'block';
          }
        } else {
          tab.classList.remove('active');
        }
      });
      // サブタブのアクティブ状態を設定
      document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.subject === subject);
      });
      updateSubjectHero(subject);
    }
  } else {
    homeView.classList.remove('math-full-width');
    app.classList.remove('math-full-width');
  }
}

// レッスンカードを作成
function createLessonCard(entry, safeCurrentSubject) {
    const div = document.createElement('div');
    const isCompleted = isLessonCompleted(entry.id);
    const reviewClass = entry.type === 'review' ? 'review' : '';
    div.className = `card p-4 ${entry.subject} ${reviewClass} ${isCompleted ? 'completed' : ''}`;
    
  const need = entry.sku_required 
    ? '<span class="badge lock">要購入</span>' 
    : '<span class="badge open">無料</span>';
    const subjectName = getSubjectName(entry.subject);
  const completionBadge = isCompleted ? '<span class="badge complete">完了</span>' : '';
    
    const scoreInfo = getLessonScoreInfo(entry.id);
    const scoreDisplay = scoreInfo ? 
      `<div class="text-xs text-slate-600 mb-1 flex items-center justify-between">
        <span class="font-bold text-orange-600">${scoreInfo.correct}/${scoreInfo.total}問正解</span>
        <span class="text-slate-500">${scoreInfo.formattedDate}</span>
      </div>` : '';
    
    let recommendationBadge = '';
    let reviewInfo = '';
    let buttonColor = 'bg-blue-500 hover:bg-blue-600';
    
    if (safeCurrentSubject === 'recommended') {
    const isScience = entry.subject === 'sci' || entry.subject === 'science_drill';
    const isSocial = entry.subject === 'soc' || entry.subject === 'social_drill';
    
    if (isScience) {
        div.classList.add('recommended-card', 'recommended-sci');
        buttonColor = 'bg-green-600 hover:bg-green-700';
      recommendationBadge = entry.reviewType === 'osaarai'
        ? '<span class="badge recommend-simple" style="background: #16a34a; color: white;">🔄 おさらい</span>'
        : '<span class="badge recommend-simple" style="background: #16a34a; color: white;">⭐ おすすめ</span>';
    } else if (isSocial) {
        div.classList.add('recommended-card', 'recommended-soc');
        buttonColor = 'bg-orange-600 hover:bg-orange-700';
      recommendationBadge = entry.reviewType === 'osaarai'
        ? '<span class="badge recommend-simple" style="background: #ea580c; color: white;">🔄 おさらい</span>'
        : '<span class="badge recommend-simple" style="background: #ea580c; color: white;">⭐ おすすめ</span>';
        } else {
        div.classList.add('recommended-card');
      recommendationBadge = entry.reviewType === 'osaarai'
        ? '<span class="badge recommend-simple" style="background: #6b7280; color: white;">🔄 おさらい</span>'
        : '<span class="badge recommend-simple" style="background: #6b7280; color: white;">⭐ おすすめ</span>';
      }
      
      if (entry.reviewType === 'osaarai') {
        const reviewProgress = getLessonProgress(entry.id);
        if (reviewProgress) {
          const scorePercent = Math.round((reviewProgress.score || 0) * 100);
          const lastStudyDate = reviewProgress.at ? new Date(reviewProgress.at) : null;
          if (lastStudyDate) {
            const daysSince = Math.floor((Date.now() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
          const infoColor = isScience ? 'text-green-700' : (isSocial ? 'text-orange-700' : 'text-slate-600');
            reviewInfo = `<div class="text-xs ${infoColor} mb-1">前回のスコア: ${scorePercent}% ・ ${daysSince}日前に学習</div>`;
          }
        }
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
      ${reviewInfo}
      ${scoreDisplay}
      <div class="text-center">
        <span class="inline-block px-3 py-2 rounded-lg ${buttonColor} text-white text-sm font-bold shadow-md transition-colors duration-200">${isCompleted ? '再学習' : '開く'}</span>
      </div>
    `;
    
    div.style.cursor = 'pointer';
    div.onclick = () => setHash('lesson', entry.id);
    
  return div;
}

async function renderHome(){
  // 🚨 無限リロード防止: 既に実行中の場合にはスキップ
  if (window._isRenderingHome) {
    console.log('⚠️ renderHome() は既に実行中です。スキップします。');
    return;
  }
  
  window._isRenderingHome = true;
  
  try {
    hideLoginPanel();
    const safeCurrentSubject = getSafeCurrentSubject();
  
  // スクロール位置を保存（renderHome呼び出し前に保存されている場合は上書きしない）
  const savedScrollY = window._savedScrollY !== undefined ? window._savedScrollY : window.scrollY;
  const savedScrollX = window._savedScrollX !== undefined ? window._savedScrollX : window.scrollX;
  
  setupHomeLayout(safeCurrentSubject);
  
  // 単元別表示が必要な教科
  if (UNIT_SUBJECTS.includes(safeCurrentSubject)) {
    const renderMap = {
      'sci': renderScienceUnits,
      'soc': renderSocialUnits,
      'science_drill': renderScienceDrillUnits,
      'social_drill': renderSocialDrillUnits
    };
    
    const renderFn = renderMap[safeCurrentSubject];
    if (renderFn) {
      await renderFn();
    }
    return;
  }
  
  const list = document.getElementById('lessonList');
  if (!list) {
    console.error('❌ lessonList要素が見つかりません。基本構造を復元します。');
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.innerHTML = '<div id="lessonList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>';
      // 再帰呼び出しを避けるため、直接処理を続行
      const newList = document.getElementById('lessonList');
      if (!newList) {
        console.error('❌ lessonList要素の作成に失敗しました。');
        return;
      }
      // 新しいlistで処理を続行
      const finalList = newList;
      if (safeCurrentSubject === 'recommended') {
        SUBJECT_GROUPS.forEach(group => renderRouteMap(group, finalList));
        // おさらいレッスン専用セクションを追加
        renderReviewSection(finalList);
        setupMainTabs();
        setupSubjectTabs();
        return;
      }
      // その他の処理も同様に続行
      return;
    }
    return;
  }
  
  // DOM更新前にスクロール位置を固定
  const htmlElement = document.documentElement;
  const originalScrollBehavior = htmlElement.style.scrollBehavior;
  htmlElement.style.scrollBehavior = 'auto';
  
  // DOM更新前にスクロール位置を完全にロック（handleTabClickで既にfixedの場合はスキップ）
  const wasBodyFixed = document.body.style.position === 'fixed';
  const originalOverflow = document.body.style.overflow;
  if (!wasBodyFixed) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
  }
  
  list.innerHTML = '';
  
  if (safeCurrentSubject === 'recommended') {
    SUBJECT_GROUPS.forEach(group => renderRouteMap(group, list));
    // おさらいレッスン専用セクションを追加
    renderReviewSection(list);
    
    // setupMainTabsとsetupSubjectTabsは、必要な場合のみ呼び出す（パフォーマンス最適化）
    const needsSetup = !document.querySelector('.subject-tab[data-listener-attached]') || 
                       !document.querySelector('.main-tab[data-listener-attached]');
    if (needsSetup) {
      setupMainTabs();
      setupSubjectTabs();
    }
    // メインタブの状態を設定
    const mainTabs = document.querySelectorAll('.main-tab');
    mainTabs.forEach(tab => {
      if (tab.dataset.mainTab === 'recommended') {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    // サブタブを非表示
    const subTabsContainer = document.getElementById('subTabsContainer');
    if (subTabsContainer) {
      subTabsContainer.style.display = 'none';
    }
    
    // DOM更新後に確実にスクロール位置を復元
    htmlElement.style.scrollBehavior = originalScrollBehavior;
    
    // bodyのスタイルを元に戻す前に、スクロール位置を確実に復元
    // ただし、handleTabClickで既にfixedの場合は、ここでは復元しない（handleTabClickで復元される）
    if (!wasBodyFixed) {
      requestAnimationFrame(() => {
        // まずbodyのスタイルを元に戻す
        document.body.style.overflow = originalOverflow || '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // その後、スクロール位置を復元（パフォーマンス最適化：1回のみ）
        window.scrollTo(0, savedScrollY);
      });
    }
    // wasBodyFixedの場合は、handleTabClickで復元されるため、ここでは何もしない
    return;
  }
  
  let displayCatalog = filterLessonsBySubject(safeCurrentSubject);
  
  if (safeCurrentSubject === 'science_drill') {
    await renderScienceDrillUnits();
    htmlElement.style.scrollBehavior = originalScrollBehavior;
    return;
  }
  
  if (safeCurrentSubject === 'social_drill') {
    await renderSocialDrillUnits();
    htmlElement.style.scrollBehavior = originalScrollBehavior;
    return;
  }
  
  displayCatalog = displayCatalog.sort((a, b) => {
    const aCompleted = isLessonCompleted(a.id);
    const bCompleted = isLessonCompleted(b.id);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });
  
  const fragment = document.createDocumentFragment();
  displayCatalog.forEach(entry => {
    fragment.appendChild(createLessonCard(entry, safeCurrentSubject));
  });
  
  // wasBodyFixedは既に宣言されているので、ここでは再宣言しない
  // DOM更新前にスクロール位置を完全にロック（handleTabClickで既にfixedの場合はスキップ）
  if (!wasBodyFixed) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
  }
  
  list.appendChild(fragment);
  
  // DOM更新後に確実にスクロール位置を復元
  htmlElement.style.scrollBehavior = originalScrollBehavior;
  
  // bodyのスタイルを元に戻す前に、スクロール位置を確実に復元
  // ただし、handleTabClickで既にfixedの場合は、ここでは復元しない（handleTabClickで復元される）
  if (!wasBodyFixed) {
    requestAnimationFrame(() => {
      // まずbodyのスタイルを元に戻す
      document.body.style.overflow = originalOverflow || '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // その後、スクロール位置を復元（パフォーマンス最適化：1回のみ）
      window.scrollTo(0, savedScrollY);
    });
  }
  // wasBodyFixedの場合は、handleTabClickで復元されるため、ここでは何もしない
  
  // setupMainTabsとsetupSubjectTabsは、必要な場合のみ呼び出す（パフォーマンス最適化）
  const needsSetup = !document.querySelector('.subject-tab[data-listener-attached]') || 
                     !document.querySelector('.main-tab[data-listener-attached]');
  if (needsSetup) {
    setupMainTabs();
    setupSubjectTabs();
  }
  
  // メインタブの状態を設定（学習リスト系のサブジェクトの場合）
  if (['sci', 'soc', 'science_drill', 'social_drill'].includes(safeCurrentSubject)) {
    const mainTabs = document.querySelectorAll('.main-tab');
    mainTabs.forEach(tab => {
      if (tab.dataset.mainTab === 'list') {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    // サブタブを表示
    const subTabsContainer = document.getElementById('subTabsContainer');
    if (subTabsContainer) {
      subTabsContainer.style.display = 'block';
    }
  }
  } finally {
    // フラグをリセット（少し遅延させて確実に）
    setTimeout(() => {
      window._isRenderingHome = false;
    }, 100);
  }
}

// 理科の単元別表示を実装
// 理科の単元別表示を実装
async function renderScienceUnits() {
  console.log('🔍 renderScienceUnits called');
  
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
  
  // 配列が空の場合は再初期化（既に定義されているため、ここでは確認のみ）
  if (!scienceUnits || scienceUnits.length === 0) {
    console.log('🔍 scienceUnitsが空のため再初期化します');
    // scienceUnitsは既に定義されているため、ここではログのみ
  }
  
  console.log('🔍 scienceUnits:', scienceUnits);
  renderSubjectUnits(scienceUnits, '理科');
  
  // 小4理科を自動選択（初期表示）
  setTimeout(() => {
    const g4Unit = scienceUnits.find(u => u.id === 'g4');
    if (g4Unit) {
      console.log('✅ 小4理科を自動選択します');
      selectUnit('g4');
    }
  }, 100);
  
  // わかる編の進捗表示を強制更新
  console.log('🔄 わかる編の進捗表示を強制更新');
  setTimeout(() => {
    const unitItems = document.querySelectorAll('.unit-item');
    unitItems.forEach((item, index) => {
      const title = item.querySelector('.unit-item-title');
      if (title && title.textContent.includes('小4理科')) {
        console.log(`✅ 小4理科の要素を発見 (インデックス: ${index})`);
        
        // わかる編の進捗を計算
        const g4Lessons = state.catalog ? state.catalog.filter(lesson => 
          lesson.id.includes('sci.') && !lesson.id.includes('_oboeru') && 
          scienceUnits.find(u => u.id === 'g4')?.lessons.includes(lesson.id)
        ) : [];
        
        const completedCount = g4Lessons.filter(lesson => {
          const progress = getLessonProgress(lesson.id);
          if (progress) {
            const isCompleted = progress.detail?.correct > 0;
            console.log(`🔍 進捗チェック: ${lesson.id} → ${progressKey} → ${isCompleted ? '完了' : '未完了'}`);
            return isCompleted;
          }
          return false;
        }).length;
        
        const progressPercent = Math.round((completedCount / g4Lessons.length) * 100);
        console.log(`計算された進捗: ${progressPercent}%`);
        
        // 進捗パーセンテージを更新
        const progressElement = item.querySelector('.unit-item-progress');
        if (progressElement) {
          progressElement.textContent = progressPercent + '%';
          console.log('✅ 小4理科の進捗を更新しました:', progressPercent + '%');
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
          'soc.geography.world_geography_wakaru',
          'soc.geography.map_hokkaido_integrated_wakaru',
          'soc.geography.map_tohoku_integrated_wakaru',
          'soc.geography.map_kanto_integrated_wakaru',
          'soc.geography.map_chubu_integrated_wakaru',
          'soc.geography.map_kinki_integrated_wakaru',
          'soc.geography.map_chugoku_shikoku_integrated_wakaru',
          'soc.geography.map_kyushu_integrated_wakaru'
        ]
      },
      {
        id: 'history',
        name: '歴史分野',
        icon: '📜',
        lessons: [
          'soc.history.paleolithic_jomon_yayoi',
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
          'soc.history.cross_period_problems',
          'soc.history.theme_politics_economy_wakaru',
          'soc.history.theme_people_wakaru',
          'soc.history.theme_diplomacy_wakaru',
          'soc.history.theme_culture_wakaru'
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
      },
      {
        id: 'comprehensive',
        name: '総合',
        icon: '🎯',
        lessons: [
          'soc.comprehensive.geography_theme_cross',
          'soc.comprehensive.geography_region_comprehensive',
          'soc.comprehensive.history_theme_integration',
          'soc.comprehensive.history_period_flow',
          'soc.comprehensive.civics_system_composite',
          'soc.comprehensive.civics_modern_issues',
          'soc.comprehensive.basic_integration',
          'soc.comprehensive.advanced_integration',
          'soc.comprehensive.practice_a',
          'soc.comprehensive.practice_b',
          'soc.comprehensive.practice_c',
          'soc.comprehensive.practice_d'
        ]
      }
    ];
    console.log('✅ socialUnitsを初期化しました:', socialUnits.length + '件');
  }
  
  console.log('🔍 socialUnits:', socialUnits);
  renderSubjectUnits(socialUnits, '社会');
  
  // 地理分野を自動選択（初期表示）
  setTimeout(() => {
    const geographyUnit = socialUnits.find(u => u.id === 'geography');
    if (geographyUnit) {
      console.log('✅ 地理分野を自動選択します');
      selectUnit('geography');
    }
  }, 100);
  
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
          const progress = getLessonProgress(lesson.id);
          if (progress) {
            console.log(`🔍 わかる編データ確認: ${lesson.id}`);
            const isCompleted = progress.detail?.correct > 0;
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
// 理科おぼえる編の単元別表示を実装
async function renderScienceDrillUnits() {
  console.log('🔍 renderScienceDrillUnits called');
  
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
  
  // 配列が空の場合は再初期化（既に定義されているため、ここでは確認のみ）
  if (!scienceDrillUnits || scienceDrillUnits.length === 0) {
    console.log('🔍 scienceDrillUnitsが空のため再初期化します');
    // scienceDrillUnitsは既に定義されているため、ここではログのみ
  }
  
  console.log('🔍 scienceDrillUnits:', scienceDrillUnits);
  console.log('🔍 state.catalog after load:', state.catalog);
  renderSubjectUnits(scienceDrillUnits, '理科おぼえる');
  
  // 小4理科を自動選択（初期表示）
  setTimeout(() => {
    const g4Unit = scienceDrillUnits.find(u => u.id === 'g4_drill');
    if (g4Unit) {
      console.log('✅ 小4理科を自動選択します（覚える編）');
      selectUnit('g4_drill');
    }
  }, 100);
  
  // 進捗表示を強制更新
  console.log('🔄 進捗表示を強制更新');
  setTimeout(() => {
    const unitItems = document.querySelectorAll('.unit-item');
    unitItems.forEach((item, index) => {
      const title = item.querySelector('.unit-item-title');
      if (title && title.textContent.includes('小4理科')) {
        console.log(`✅ 小4理科の要素を発見 (インデックス: ${index})`);
        
        // 進捗を計算（おぼえる編のIDを対象に集計）
        const g4Lessons = state.catalog ? state.catalog.filter(lesson => 
          lesson.id.includes('sci.') && lesson.id.includes('_oboeru') && 
          scienceDrillUnits.find(u => u.id === 'g4_drill')?.lessons.includes(lesson.id)
        ) : [];
        
        const completedCount = g4Lessons.filter(lesson => {
          const progress = getLessonProgress(lesson.id);
          if (progress) {
            const isCompleted = progress.detail?.correct > 0;
            console.log(`🔍 進捗チェック: ${lesson.id} → ${isCompleted ? '完了' : '未完了'}`);
            return isCompleted;
          }
          return false;
        }).length;
        
        const progressPercent = Math.round((completedCount / g4Lessons.length) * 100);
        console.log(`計算された進捗: ${progressPercent}%`);
        
        // 進捗パーセンテージを更新
        const progressElement = item.querySelector('.unit-item-progress');
        if (progressElement) {
          progressElement.textContent = progressPercent + '%';
          console.log('✅ 小4理科の進捗を更新しました:', progressPercent + '%');
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
          'soc.history.cross_period_problems_oboeru',
          'soc.history.theme_politics_economy_oboeru',
          'soc.history.theme_people_oboeru',
          'soc.history.theme_diplomacy_oboeru',
          'soc.history.theme_culture_oboeru'
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
      },
      {
        id: 'comprehensive_drill',
        name: '総合',
        icon: '🎯',
        lessons: [
          'soc.comprehensive.geography_theme_cross_oboeru',
          'soc.comprehensive.geography_region_comprehensive_oboeru',
          'soc.comprehensive.history_theme_integration_oboeru',
          'soc.comprehensive.history_period_flow_oboeru',
          'soc.comprehensive.civics_system_composite_oboeru',
          'soc.comprehensive.civics_modern_issues_oboeru',
          'soc.comprehensive.basic_integration_oboeru',
          'soc.comprehensive.advanced_integration_oboeru',
          'soc.comprehensive.practice_a_oboeru',
          'soc.comprehensive.practice_b_oboeru',
          'soc.comprehensive.practice_c_oboeru',
          'soc.comprehensive.practice_d_oboeru'
        ]
      }
    ];
  }
  
  console.log('🔍 socialDrillUnits:', socialDrillUnits);
  console.log('🔍 state.catalog after load:', state.catalog);
  renderSubjectUnits(socialDrillUnits, '社会おぼえる');
  
  // 地理分野を自動選択（初期表示）
  setTimeout(() => {
    const geographyUnit = socialDrillUnits.find(u => u.id === 'geography_drill');
    if (geographyUnit) {
      console.log('✅ 地理分野を自動選択します（覚える編）');
      selectUnit('geography_drill');
    }
  }, 100);
  
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
          const progress = getLessonProgress(lesson.id);
          if (progress) {
            const isCompleted = progress.detail?.correct > 0;
            console.log(`🔍 進捗チェック: ${lesson.id} → ${isCompleted ? '完了' : '未完了'}`);
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
    // リサイズ時に単元名も更新
    renderUnits(units);
  };
  mq.addEventListener?.('change', applyCompact);
  applyCompact(); // 初回実行
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
    
    // その単元のレッスンを取得（最適化版）
    const unitLessons = [];
    if (state.catalog && unit.lessons) {
      unit.lessons.forEach(lessonId => {
        const lesson = findLessonById(lessonId);
        if (lesson) {
          unitLessons.push(lesson);
        }
      });
    }
    
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
    
    // スマホ版では短い名称を表示
    const mq = window.matchMedia('(max-width: 768px)');
    const isMobile = mq.matches;
    const displayName = isMobile && unit.shortName ? unit.shortName : unit.name;
    const shortLabel = (unit.shortName || unit.name || '').slice(0, 8);
    
    unitElement.innerHTML = `
      <div class="unit-item-content">
        <div class="unit-item-icon">${unit.icon}</div>
        <div class="unit-item-short" aria-hidden="true">${shortLabel}</div>
        <div class="unit-item-info">
          <h4 class="unit-item-title">${displayName}</h4>
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
async function selectUnit(unitId) {
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
          'soc.geography.world_geography_wakaru',
          'soc.geography.map_hokkaido_integrated_wakaru',
          'soc.geography.map_tohoku_integrated_wakaru',
          'soc.geography.map_kanto_integrated_wakaru',
          'soc.geography.map_chubu_integrated_wakaru',
          'soc.geography.map_kinki_integrated_wakaru',
          'soc.geography.map_chugoku_shikoku_integrated_wakaru',
          'soc.geography.map_kyushu_integrated_wakaru'
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
            'soc.history.cross_period_problems',
            'soc.history.theme_politics_economy_wakaru',
            'soc.history.theme_people_wakaru',
            'soc.history.theme_diplomacy_wakaru',
            'soc.history.theme_culture_wakaru'
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
        },
        {
          id: 'comprehensive',
          name: '総合',
          icon: '🎯',
          lessons: [
            'soc.comprehensive.geography_theme_cross',
            'soc.comprehensive.geography_region_comprehensive',
            'soc.comprehensive.history_theme_integration',
            'soc.comprehensive.history_period_flow',
            'soc.comprehensive.civics_system_composite',
            'soc.comprehensive.civics_modern_issues',
            'soc.comprehensive.basic_integration',
            'soc.comprehensive.advanced_integration',
            'soc.comprehensive.practice_a',
            'soc.comprehensive.practice_b',
            'soc.comprehensive.practice_c',
            'soc.comprehensive.practice_d'
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
            'soc.history.cross_period_problems_oboeru',
            'soc.history.theme_politics_economy_oboeru',
            'soc.history.theme_people_oboeru',
            'soc.history.theme_diplomacy_oboeru',
            'soc.history.theme_culture_oboeru'
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
        },
        {
          id: 'comprehensive_drill',
          name: '総合',
          icon: '🎯',
          lessons: [
            'soc.comprehensive.geography_theme_cross_oboeru',
            'soc.comprehensive.geography_region_comprehensive_oboeru',
            'soc.comprehensive.history_theme_integration_oboeru',
            'soc.comprehensive.history_period_flow_oboeru',
            'soc.comprehensive.civics_system_composite_oboeru',
            'soc.comprehensive.civics_modern_issues_oboeru',
            'soc.comprehensive.basic_integration_oboeru',
            'soc.comprehensive.advanced_integration_oboeru',
            'soc.comprehensive.practice_a_oboeru',
            'soc.comprehensive.practice_b_oboeru',
            'soc.comprehensive.practice_c_oboeru',
            'soc.comprehensive.practice_d_oboeru'
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
  await renderUnitLessons(unitId); // 選択された単元のレッスンを表示

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
async function renderUnitLessons(unitId) {
  console.log('🔍 renderUnitLessons called with unitId:', unitId);
  const container = document.getElementById('lessonsContainer');
  if (!container) {
    console.error('❌ lessonsContainer not found');
    return;
  }
  
  // state.catalogが空の場合は再読み込みを試みる
  if (!state.catalog || state.catalog.length === 0) {
    console.log('⚠️ state.catalog is empty, attempting to reload...');
    try {
      await loadCatalog();
      console.log('✅ loadCatalog completed, catalog length:', state.catalog?.length || 0);
      // 少し待機してから再試行
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ loadCatalog failed:', error);
      container.innerHTML = `
        <div class="lessons-placeholder">
          <div class="placeholder-icon">⚠️</div>
          <h3 class="placeholder-title">カタログデータが読み込まれていません</h3>
          <p class="placeholder-text">catalog.jsonの読み込みに失敗しました。ページをリロードしてください。</p>
        </div>
      `;
      return;
    }
  }
  
  // 現在の教科に応じて適切な単元配列を選択
  const safeCurrentSubject = window.currentSubject || 'recommended';
  console.log('🔍 safeCurrentSubject:', safeCurrentSubject);
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
  
  console.log('🔍 currentUnits:', currentUnits);
  console.log('🔍 state.catalog length:', state.catalog?.length || 0);
  
  const unit = currentUnits.find(u => u.id === unitId);
  if (!unit) {
    console.error('❌ unit not found for unitId:', unitId);
    return;
  }
  
  console.log('🔍 unit found:', unit.name);
  console.log('🔍 unit.lessons:', unit.lessons);
  console.log('🔍 unit.lessons length:', unit.lessons.length);
  
  // その単元のレッスンを取得
  // unit.lessonsの順序を保持するために、配列の順序に基づいてソート
  const unitLessonsMap = new Map();
  if (!state.catalog || state.catalog.length === 0) {
    console.error('❌ state.catalog is still empty after reload attempt');
    container.innerHTML = `
      <div class="lessons-placeholder">
        <div class="placeholder-icon">⚠️</div>
        <h3 class="placeholder-title">カタログデータが読み込まれていません</h3>
        <p class="placeholder-text">catalog.jsonの読み込みに失敗している可能性があります。ページをリロードしてください。</p>
      </div>
    `;
    return;
  }
  
  state.catalog.forEach(lesson => {
    if (unit.lessons.includes(lesson.id)) {
      unitLessonsMap.set(lesson.id, lesson);
      console.log('✅ レッスンが見つかりました:', lesson.id, lesson.title);
    }
  });
  
  console.log('🔍 unitLessonsMap size:', unitLessonsMap.size);
  
  // unit.lessonsの順序に従ってレッスンを並べる
  const sortedLessons = unit.lessons
    .map(lessonId => {
      const lesson = unitLessonsMap.get(lessonId);
      if (!lesson) {
        console.warn('⚠️ レッスンが見つかりません:', lessonId);
      }
      return lesson;
    })
    .filter(lesson => lesson !== undefined);
  
  console.log('🔍 sortedLessons length:', sortedLessons.length);
  console.log('🔍 sortedLessons:', sortedLessons.map(l => l.id));
  
  if (sortedLessons.length === 0) {
    console.error('❌ レッスンが見つかりません。unit.lessons:', unit.lessons);
    console.error('❌ state.catalog内のレッスンID（最初の10件）:', state.catalog.slice(0, 10).map(l => l.id));
    container.innerHTML = `
      <div class="lessons-placeholder">
        <div class="placeholder-icon">⚠️</div>
        <h3 class="placeholder-title">レッスンが見つかりません</h3>
        <p class="placeholder-text">この単元のレッスンデータが見つかりませんでした。ブラウザのコンソールで詳細を確認してください。</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="lessons-header">
      <h3 class="lessons-title">${sortedLessons.length}個のレッスン</h3>
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
    
    // チェックポイントをチェック
    const checkpoint = hasCheckpoint(lesson.id);
    
    // 購入状態をチェック
    const hasAccess = !lesson.sku_required || hasEntitlement(lesson.sku_required);
    const isLocked = lesson.sku_required && !hasAccess;
    
    console.log(`🔍 わかる編学習済み判定: ${lesson.id} → ${isCompleted ? '完了' : '未完了'}`);
    if (checkpoint) {
      console.log(`📌 チェックポイントあり: ${lesson.id} → ${checkpoint.current}問目まで完了`);
    }
    
    // リストアイテムを作成
    const listItem = document.createElement('div');
    listItem.className = `lesson-list-item ${isCompleted ? 'completed' : 'pending'} ${isLocked ? 'locked' : ''} ${checkpoint ? 'has-checkpoint' : ''}`;
    
    // コンパクトな2行表示に変更
    // 1行目: 番号 + 学年バッジ + タイトル + ボタン
    const firstRow = document.createElement('div');
    firstRow.className = 'lesson-row-first';
    
    const numberSpan = document.createElement('span');
    numberSpan.className = 'lesson-number';
    numberSpan.textContent = String(index + 1).padStart(2, '0');
    firstRow.appendChild(numberSpan);
    
    // 学年バッジを追加（社会のみ）
    if (lesson.subject === 'soc' && lesson.grade) {
      const gradeBadge = document.createElement('span');
      gradeBadge.className = 'lesson-grade-badge';
      gradeBadge.textContent = `小${lesson.grade}`;
      firstRow.appendChild(gradeBadge);
    }
    
    // チェックポイントバッジを追加
    if (checkpoint) {
      const checkpointBadge = document.createElement('span');
      checkpointBadge.className = 'lesson-checkpoint-badge';
      checkpointBadge.textContent = '📌 途中';
      checkpointBadge.title = `${checkpoint.current}問目まで完了（続きから再開可能）`;
      firstRow.appendChild(checkpointBadge);
    }
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'lesson-title';
    titleSpan.textContent = lesson.title;
    if (isLocked) {
      titleSpan.classList.add('locked-title');
    }
    firstRow.appendChild(titleSpan);
    
    const actionBtn = document.createElement('button');
    actionBtn.className = `lesson-action-btn ${isLocked ? 'locked-btn' : ''}`;
    if (isLocked) {
      actionBtn.textContent = '🔒 購入';
      actionBtn.disabled = false;
      actionBtn.addEventListener('click', () => {
        if (lesson.sku_required) {
          // 購入モーダルを開く
          if (window.modalPurchasePack) {
            window.modalPurchasePack(lesson.sku_required);
          } else {
            // モーダルが利用できない場合は購入モーダル全体を開く
            if (window.openPurchaseModal) {
              window.openPurchaseModal();
            }
          }
        }
      });
    } else {
      actionBtn.textContent = isCompleted ? '再学習' : '開始';
      actionBtn.addEventListener('click', () => setHash('lesson', lesson.id));
    }
    firstRow.appendChild(actionBtn);
    
    // 2行目: メタ情報（時間、ステータス、スコア）
    const secondRow = document.createElement('div');
    secondRow.className = 'lesson-row-second';
    
    const durationSpan = document.createElement('span');
    durationSpan.className = 'lesson-duration';
    durationSpan.textContent = `${lesson.duration_min}分`;
    
    const statusSpan = document.createElement('span');
    statusSpan.className = `lesson-status ${isCompleted ? 'completed' : 'pending'}`;
    statusSpan.textContent = isCompleted ? '完了' : '未完了';
    
    // チェックポイント情報を表示
    if (checkpoint) {
      const checkpointInfo = document.createElement('span');
      checkpointInfo.className = 'lesson-checkpoint-info';
      checkpointInfo.textContent = `${checkpoint.current}問まで完了`;
      secondRow.appendChild(checkpointInfo);
    }
    
    // 購入状態の表示
    if (isLocked) {
      const lockSpan = document.createElement('span');
      lockSpan.className = 'lesson-lock-status';
      lockSpan.textContent = '🔒 未購入';
      secondRow.appendChild(lockSpan);
    }
    
    secondRow.appendChild(durationSpan);
    secondRow.appendChild(statusSpan);
    
    // スコア情報を追加
    const scoreInfo = getLessonScoreInfo(lesson.id);
    if (scoreInfo) {
      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'lesson-score';
      scoreSpan.textContent = `${scoreInfo.correct}/${scoreInfo.total}問`;
      secondRow.appendChild(scoreSpan);
      
      const dateSpan = document.createElement('span');
      dateSpan.className = 'lesson-date';
      dateSpan.textContent = scoreInfo.formattedDate;
      secondRow.appendChild(dateSpan);
    } else {
      // スコア情報がない場合はスペーサーを追加してレイアウトを調整
      const spacer = document.createElement('span');
      spacer.style.flex = '1';
      secondRow.appendChild(spacer);
    }
    
    // コンテナに追加
    listItem.appendChild(firstRow);
    listItem.appendChild(secondRow);
    
    listContainer.appendChild(listItem);
  });
}

function renderLesson(id){
  const l = findLessonById(id);
  if(!l){ alert('レッスンが見つかりません'); return setHash('home'); }
  if(l.sku_required && !hasEntitlement(l.sku_required)) {
    // 購入が必要な場合は購入モーダルを開く
    if (window.modalPurchasePack) {
      window.modalPurchasePack(l.sku_required);
    } else {
      // モーダルが利用できない場合は購入モーダル全体を開く
      if (window.openPurchaseModal) {
        window.openPurchaseModal();
      }
    }
    return setHash('home');
  }
  
  // 教材を単体ページとして開く
  if(l.path){
    window.location.href = l.path;
  } else {
    alert('教材ファイルが見つかりません');
    setHash('home');
  }
}

function renderPurchase(sku){
  // 購入画面（purchaseView）は使用しないため、購入モーダルを開いてホームに戻る
  if (sku) {
    // sku（例：g4-soc）をpackIdとして購入モーダルを開く
    if (window.modalPurchasePack) {
      window.modalPurchasePack(sku);
    } else {
      // モーダルが利用できない場合は購入モーダル全体を開く
      if (window.openPurchaseModal) {
        window.openPurchaseModal();
      }
    }
  }
  // ホームに戻る
  setHash('home');
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
      resultMessage = '💪 もう一度チャレンジしよう！';
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

// PWAインストール関連
let deferredPrompt = null;

// モバイルデバイスかどうかを判定
function isMobileDevice() {
  // タッチデバイスかどうか
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // 画面幅が小さいかどうか
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  // ユーザーエージェントでモバイルを判定
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return hasTouchScreen || isSmallScreen || isMobileUA;
}

// PWAが既にインストールされているかどうかを判定
function isPWAInstalled() {
  // standaloneモードで動作している場合、既にインストール済み
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  // navigator.standalone（iOS Safari用）
  if (window.navigator.standalone === true) {
    return true;
  }
  return false;
}

// インストールボタンの表示状態を更新
function updateInstallButtonVisibility() {
  const installBtn = document.getElementById('installBtn');
  const menuInstallBtn = document.getElementById('menuInstallBtn');
  
  // モバイルデバイスで、かつ未インストールの場合のみ表示
  const shouldShow = isMobileDevice() && !isPWAInstalled() && deferredPrompt !== null;
  
  // モバイル判定（画面幅768px以下）
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (installBtn) {
    if (shouldShow && !isMobile) {
      // デスクトップ: ヘッダーに表示
      installBtn.classList.remove('hidden');
    } else {
      // モバイル: ヘッダーから非表示
      installBtn.classList.add('hidden');
    }
  }
  
  if (menuInstallBtn) {
    if (shouldShow) {
      // メニュー内: モバイル・デスクトップ問わず表示
      menuInstallBtn.classList.remove('hidden');
    } else {
      menuInstallBtn.classList.add('hidden');
    }
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  // インストールプロンプトを延期
  e.preventDefault();
  deferredPrompt = e;
  
  console.log('📱 PWAインストール可能');
  console.log('📱 モバイルデバイス:', isMobileDevice());
  console.log('📱 PWAインストール済み:', isPWAInstalled());
  
  // インストールボタンの表示状態を更新
  updateInstallButtonVisibility();
});

// インストールモーダルを表示
function showInstallModal() {
  const installModal = document.getElementById('installModal');
  if (installModal && deferredPrompt) {
    installModal.classList.remove('hidden');
    installModal.style.display = 'flex';
    // アニメーション用
    requestAnimationFrame(() => {
      installModal.style.opacity = '1';
    });
    
    // フォーカス管理
    const confirmBtn = document.getElementById('confirmInstallBtn');
    if (confirmBtn) {
      setTimeout(() => confirmBtn.focus(), 100);
    }
  } else if (!deferredPrompt) {
    console.warn('⚠️ インストールプロンプトが利用できません');
  }
}

// インストールモーダルを非表示
function hideInstallModal() {
  const installModal = document.getElementById('installModal');
  if (installModal) {
    installModal.style.opacity = '0';
    setTimeout(() => {
      installModal.classList.add('hidden');
      installModal.style.display = 'none';
    }, 300);
  }
}

// インストール完了モーダルを表示
function showInstallCompleteModal() {
  const installCompleteModal = document.getElementById('installCompleteModal');
  if (installCompleteModal) {
    installCompleteModal.classList.remove('hidden');
    installCompleteModal.style.display = 'flex';
    // アニメーション用
    requestAnimationFrame(() => {
      installCompleteModal.style.opacity = '1';
    });
    
    // フォーカス管理
    const closeBtn = document.getElementById('closeInstallCompleteBtn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  }
}

// インストール完了モーダルを非表示
function hideInstallCompleteModal() {
  const installCompleteModal = document.getElementById('installCompleteModal');
  if (installCompleteModal) {
    installCompleteModal.style.opacity = '0';
    setTimeout(() => {
      installCompleteModal.classList.add('hidden');
      installCompleteModal.style.display = 'none';
    }, 300);
  }
}

// ヘルプモーダルを表示
function showHelpModal() {
  const helpModal = document.getElementById('helpModal');
  const helpContent = document.getElementById('helpContent');
  
  if (!helpModal || !helpContent) {
    console.error('❌ ヘルプモーダルの要素が見つかりません');
    return;
  }
  
  // ヘルプコンテンツを生成
  helpContent.innerHTML = generateHelpContent();
  
  // モーダルを表示
  helpModal.classList.remove('hidden');
  helpModal.style.display = 'flex';
  
  // アニメーション用（少し遅延を入れてスムーズに表示）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      helpModal.style.opacity = '1';
    });
  });
  
  // フォーカス管理
  const closeBtn = document.getElementById('helpModalClose');
  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 100);
  }
  
  // イベントリスナーを設定（重複登録を防ぐ）
  const closeBtnHandler = () => hideHelpModal();
  const overlayHandler = (e) => {
    if (e.target === helpModal) {
      hideHelpModal();
    }
  };
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
      hideHelpModal();
    }
  };
  
  // 既存のリスナーを削除してから追加
  const newCloseBtn = document.getElementById('helpModalClose');
  if (newCloseBtn) {
    newCloseBtn.removeEventListener('click', closeBtnHandler);
    newCloseBtn.addEventListener('click', closeBtnHandler);
  }
  helpModal.removeEventListener('click', overlayHandler);
  helpModal.addEventListener('click', overlayHandler);
  document.removeEventListener('keydown', escapeHandler);
  document.addEventListener('keydown', escapeHandler);
}

// ヘルプモーダルを非表示
function hideHelpModal() {
  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    helpModal.style.opacity = '0';
    setTimeout(() => {
      helpModal.classList.add('hidden');
      helpModal.style.display = 'none';
    }, 300);
  }
}

// ヘルプコンテンツを生成
function generateHelpContent() {
  return `
    <div class="space-y-6">
      <!-- はじめに -->
      <section class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span aria-hidden="true">👋</span>
          はじめに
        </h3>
        <p class="text-blue-800 text-sm leading-relaxed">
          ステップナビへようこそ！このアプリは小4・小5・小6向けの理科・社会の学習アプリです。
          このヘルプでは、アプリの使い方をご説明します。
        </p>
      </section>

      <!-- 基本操作 -->
      <section>
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">📱</span>
          基本操作
        </h3>
        <div class="space-y-3">
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 class="font-semibold text-slate-700 mb-2">1. タブの切り替え</h4>
            <p class="text-slate-600 text-sm mb-2">
              画面上部のタブをクリックして、学習したい内容を選びます：
            </p>
            <ul class="text-slate-600 text-sm space-y-1 ml-4 list-disc">
              <li><strong>⭐ おすすめ学習</strong>：あなたに合ったレッスンを表示</li>
              <li><strong>🔬 理科わかる</strong>：理科の理解を深めるレッスン</li>
              <li><strong>🧪 理科おぼえる</strong>：理科の暗記・練習問題</li>
              <li><strong>🌍 社会わかる</strong>：社会の理解を深めるレッスン</li>
              <li><strong>📍 社会おぼえる</strong>：社会の暗記・練習問題</li>
            </ul>
          </div>
          
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 class="font-semibold text-slate-700 mb-2">2. レッスンの開始</h4>
            <p class="text-slate-600 text-sm">
              レッスンカードをクリックすると、学習を始められます。
              進捗バーで学習の進み具合を確認できます。
            </p>
          </div>
          
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 class="font-semibold text-slate-700 mb-2">3. 学年の変更</h4>
            <p class="text-slate-600 text-sm">
              ヘッダーの学年ボタン（小4・小5・小6）をクリックして、学習する学年を変更できます。
            </p>
          </div>
        </div>
      </section>

      <!-- レッスンの進め方 -->
      <section>
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">📚</span>
          レッスンの進め方
        </h3>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <ol class="text-slate-700 text-sm space-y-2 ml-4 list-decimal">
            <li>レッスンカードをクリックして学習を開始</li>
            <li>問題に答えながら学習を進める</li>
            <li>途中で中断した場合は、チェックポイントから再開できます</li>
            <li>レッスン完了後、進捗が記録されます</li>
            <li>完了したレッスンには「✅ 完了」バッジが表示されます</li>
          </ol>
        </div>
      </section>

      <!-- 購入について -->
      <section>
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">💳</span>
          購入について
        </h3>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-slate-700 text-sm mb-2">
            一部のコンテンツは購入が必要です。購入の流れは以下の通りです：
          </p>
          <ol class="text-slate-700 text-sm space-y-1 ml-4 list-decimal">
            <li>「🔒 購入が必要」バッジが付いているレッスンをクリック</li>
            <li>ログイン（初回のみ）</li>
            <li>メール確認（メール・パスワードでログインした場合）</li>
            <li>購入ボタンをクリックして決済</li>
            <li>購入完了後、すぐに学習を始められます</li>
          </ol>
          <p class="text-slate-600 text-xs mt-3">
            ※ 各パックは2,980円（税込）です。小4・小5・小6の理科・社会がそれぞれ購入できます。
          </p>
        </div>
      </section>

      <!-- メニュー機能 -->
      <section>
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">☰</span>
          メニュー機能
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 class="font-semibold text-purple-900 text-sm mb-1">📊 学習統計</h4>
            <p class="text-purple-800 text-xs">学習の進捗や成績を確認できます</p>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 class="font-semibold text-red-900 text-sm mb-1">🔥 連続学習記録</h4>
            <p class="text-red-800 text-xs">毎日の学習を続けて記録を伸ばしましょう</p>
          </div>
          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <h4 class="font-semibold text-indigo-900 text-sm mb-1">🎨 背景テーマ</h4>
            <p class="text-indigo-800 text-xs">お気に入りの背景テーマを選べます</p>
          </div>
          <div class="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <h4 class="font-semibold text-teal-900 text-sm mb-1">💾 データの保存</h4>
            <p class="text-teal-800 text-xs">学習データをバックアップできます</p>
          </div>
        </div>
      </section>

      <!-- よくある質問 -->
      <section>
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">❓</span>
          よくある質問
        </h3>
        <div class="space-y-3">
          <details class="bg-slate-50 border border-slate-200 rounded-lg">
            <summary class="p-3 cursor-pointer font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Q: 途中で学習をやめても大丈夫ですか？
            </summary>
            <div class="p-3 pt-0 text-slate-600 text-sm">
              A: はい、大丈夫です。チェックポイント機能により、途中から再開できます。
            </div>
          </details>
          
          <details class="bg-slate-50 border border-slate-200 rounded-lg">
            <summary class="p-3 cursor-pointer font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Q: 進捗はどこで確認できますか？
            </summary>
            <div class="p-3 pt-0 text-slate-600 text-sm">
              A: レッスンカードの進捗バーで確認できます。また、メニューの「📊 学習統計」から詳細な統計を確認できます。
            </div>
          </details>
          
          <details class="bg-slate-50 border border-slate-200 rounded-lg">
            <summary class="p-3 cursor-pointer font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Q: アプリをホーム画面に追加できますか？
            </summary>
            <div class="p-3 pt-0 text-slate-600 text-sm">
              A: はい、できます。メニューの「📱 アプリに追加」から追加できます（モバイルのみ）。
            </div>
          </details>
          
          <details class="bg-slate-50 border border-slate-200 rounded-lg">
            <summary class="p-3 cursor-pointer font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Q: データは消えませんか？
            </summary>
            <div class="p-3 pt-0 text-slate-600 text-sm">
              A: データはブラウザに保存されます。メニューの「💾 学習データを保存」からバックアップを取ることをおすすめします。
            </div>
          </details>
        </div>
      </section>

      <!-- お問い合わせ -->
      <section class="bg-slate-100 border border-slate-300 rounded-lg p-4">
        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true">📧</span>
          お問い合わせ
        </h3>
        <p class="text-slate-700 text-sm">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
      </section>
    </div>
  `;
}

// インストール完了時の処理
window.addEventListener('appinstalled', (e) => {
  console.log('✅ PWAインストール完了');
  deferredPrompt = null;
  
  // インストールボタンを非表示
  updateInstallButtonVisibility();
  
  // インストール完了モーダルを表示
  setTimeout(() => {
    showInstallCompleteModal();
  }, 500);
});

// インストールボタンのクリックイベント
// 🚨 無限リロード防止: DOMContentLoadedの重複登録を防ぐ
if (!window._installButtonDOMContentLoadedRegistered) {
  window._installButtonDOMContentLoadedRegistered = true;
  document.addEventListener('DOMContentLoaded', () => {
    // 🚨 無限リロード防止: 重複実行を防ぐ
    if (window._installButtonDOMContentLoadedExecuted) {
      console.log('⚠️ インストールボタンのDOMContentLoaded は既に実行済みです。スキップします。');
      return;
    }
    window._installButtonDOMContentLoadedExecuted = true;
    
    // 初期状態でインストールボタンの表示状態を更新
    updateInstallButtonVisibility();
  
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      showInstallModal();
    });
  }
  
  // メニューのインストールボタン
  const menuInstallBtn = document.getElementById('menuInstallBtn');
  if (menuInstallBtn) {
    menuInstallBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showInstallModal();
    });
  }
  
  // インストールモーダルのボタン
  const confirmInstallBtn = document.getElementById('confirmInstallBtn');
  if (confirmInstallBtn) {
    confirmInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // インストールモーダルを閉じる
        hideInstallModal();
        
        // インストールプロンプトを表示
        deferredPrompt.prompt();
        
        // ユーザーの選択を待つ
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📱 インストール結果:', outcome);
        
        if (outcome === 'accepted') {
          console.log('✅ ユーザーがインストールを承認しました');
          // インストール完了モーダルを表示（appinstalledイベントで表示される）
        } else {
          console.log('❌ ユーザーがインストールを拒否しました');
        }
        
        // プロンプトをクリア
        deferredPrompt = null;
        
        // インストールボタンの表示状態を更新
        updateInstallButtonVisibility();
      } else {
        console.log('⚠️ インストールプロンプトが利用できません');
        hideInstallModal();
      }
    });
  }
  
  const cancelInstallBtn = document.getElementById('cancelInstallBtn');
  if (cancelInstallBtn) {
    cancelInstallBtn.addEventListener('click', () => {
      hideInstallModal();
    });
  }
  
  const closeInstallCompleteBtn = document.getElementById('closeInstallCompleteBtn');
  if (closeInstallCompleteBtn) {
    closeInstallCompleteBtn.addEventListener('click', () => {
      hideInstallCompleteModal();
    });
  }
  
  // インストールモーダルの背景クリックで閉じる
  const installModal = document.getElementById('installModal');
  if (installModal) {
    installModal.addEventListener('click', (e) => {
      if (e.target === installModal) {
        hideInstallModal();
      }
    });
  }
  
  // インストール完了モーダルの背景クリックで閉じる
  const installCompleteModal = document.getElementById('installCompleteModal');
  if (installCompleteModal) {
    installCompleteModal.addEventListener('click', (e) => {
      if (e.target === installCompleteModal) {
        hideInstallCompleteModal();
      }
    });
  }
  
    // 画面サイズ変更時にも表示状態を更新
    window.addEventListener('resize', () => {
      updateInstallButtonVisibility();
    });
    
    // display-mode変更時にも表示状態を更新（PWAインストール後）
    if (window.matchMedia) {
      const displayModeQuery = window.matchMedia('(display-mode: standalone)');
      displayModeQuery.addEventListener('change', () => {
        updateInstallButtonVisibility();
      });
    }
  });
}

// 励ましメッセージデータ（JSONから読み込む）
let encouragementData = null;

// ===== 連続学習日数・レベル管理システム =====
const STREAK_STORAGE_KEY = 'learningStreak';
const THEME_STORAGE_KEY = 'unlockedThemes';
const CURRENT_THEME_KEY = 'currentTheme';

// ===== 学習データエクスポート/インポートシステム =====
// エクスポート対象のキーパターン
const EXPORT_KEY_PATTERNS = [
  'progress',             // 進捗データ（統合形式）
  /^progress:/,           // 進捗データ（旧形式：後方互換性のため）
  /^learningHistory/,     // 学習履歴
  /^checkpoint:/,         // チェックポイント
  'learningStreak',       // 連続学習日数
  'unlockedThemes',       // アンロック済みテーマ
  'currentTheme',         // 現在のテーマ
  'purchases',            // 購入情報
  'currentGrade'          // 現在の学年
];

// 除外するキー（一時データなど）
const EXCLUDE_KEYS = [
  'lessonCompleteMessage',
  'questionAnswers',
  'history_migration_completed',
  'progress_migration_completed'
];

// レベル定義（連続日数に応じたレベル）
const LEVEL_DEFINITIONS = [
  { days: 0, level: 1, theme: 'default' },
  { days: 3, level: 2, theme: 'spring' },
  { days: 7, level: 3, theme: 'summer' },
  { days: 14, level: 4, theme: 'autumn' },
  { days: 30, level: 5, theme: 'winter' },
  { days: 60, level: 6, theme: 'night' },
  { days: 100, level: 7, theme: 'starry' }
];

// 連続学習日数を更新
function updateStreakDays() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    const streakData = JSON.parse(localStorage.getItem(STREAK_STORAGE_KEY) || '{"days": 0, "lastDate": ""}');
    const lastDate = streakData.lastDate;
    
    let newDays = streakData.days || 0;
    let levelUp = false;
    
    if (lastDate === todayStr) {
      // 今日既に学習済みの場合は何もしない
      return { days: newDays, level: getLevelFromDays(newDays), levelUp: false };
    } else if (lastDate === '') {
      // 初回学習
      newDays = 1;
      levelUp = true;
    } else {
      // 前回の学習日を確認
      const lastDateObj = new Date(lastDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      lastDateObj.setHours(0, 0, 0, 0);
      
      if (lastDateObj.getTime() === yesterday.getTime()) {
        // 連続学習（昨日学習していた）
        newDays = (streakData.days || 0) + 1;
        const oldLevel = getLevelFromDays(streakData.days || 0);
        const newLevel = getLevelFromDays(newDays);
        levelUp = newLevel > oldLevel;
      } else {
        // 連続が途切れた（リセット）
        newDays = 1;
        levelUp = true;
      }
    }
    
    // データを保存
    const newStreakData = {
      days: newDays,
      lastDate: todayStr
    };
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreakData));
    
    // レベルアップ時にテーマをアンロック
    if (levelUp) {
      unlockThemeForLevel(getLevelFromDays(newDays));
      // レベルアップ通知（オプション）
      console.log(`🎉 レベルアップ！ Lv.${getLevelFromDays(newDays)}`);
    }
    
    return { days: newDays, level: getLevelFromDays(newDays), levelUp };
  } catch (error) {
    console.error('❌ 連続学習日数の更新エラー:', error);
    return { days: 0, level: 1, levelUp: false };
  }
}

// 連続日数からレベルを取得
function getLevelFromDays(days) {
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (days >= LEVEL_DEFINITIONS[i].days) {
      return LEVEL_DEFINITIONS[i].level;
    }
  }
  return 1;
}

// レベルに応じたテーマをアンロック
function unlockThemeForLevel(level) {
  try {
    const unlockedThemes = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '[]');
    
    // レベルに対応するテーマを取得
    const levelDef = LEVEL_DEFINITIONS.find(def => def.level === level);
    if (levelDef && !unlockedThemes.includes(levelDef.theme)) {
      unlockedThemes.push(levelDef.theme);
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(unlockedThemes));
      console.log(`🎨 テーマ「${levelDef.theme}」をアンロックしました！`);
    }
  } catch (error) {
    console.error('❌ テーマアンロックエラー:', error);
  }
}

// 連続学習日数とレベルを取得
function getStreakInfo() {
  try {
    const streakData = JSON.parse(localStorage.getItem(STREAK_STORAGE_KEY) || '{"days": 0, "lastDate": ""}');
    const days = streakData.days || 0;
    const level = getLevelFromDays(days);
    return { days, level };
  } catch (error) {
    console.error('❌ 連続学習日数の取得エラー:', error);
    return { days: 0, level: 1 };
  }
}

// テーマ定義
const THEME_DEFINITIONS = [
  { id: 'default', name: 'デフォルト', icon: '🌻', requiredLevel: 1 },
  { id: 'spring', name: '春', icon: '🌸', requiredLevel: 2 },
  { id: 'summer', name: '夏', icon: '☀️', requiredLevel: 3 },
  { id: 'autumn', name: '秋', icon: '🍂', requiredLevel: 4 },
  { id: 'winter', name: '冬', icon: '❄️', requiredLevel: 5 },
  { id: 'night', name: '夜', icon: '🌙', requiredLevel: 6 },
  { id: 'starry', name: '星空', icon: '⭐', requiredLevel: 7 }
];

// テーマシステムの初期化
function initThemeSystem() {
  // 現在のテーマを適用
  applyCurrentTheme();
  
  // テーマ選択ボタンのイベント
  const themeBtn = document.getElementById('themeBtn');
  const themeModal = document.getElementById('themeModal');
  const themeModalClose = document.getElementById('themeModalClose');
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      openThemeModal();
    });
  }
  
  if (themeModalClose) {
    themeModalClose.addEventListener('click', () => {
      closeThemeModal();
    });
  }
  
  // モーダル外をクリックで閉じる
  if (themeModal) {
    themeModal.addEventListener('click', (e) => {
      if (e.target === themeModal) {
        closeThemeModal();
      }
    });
  }
  
  // エスケープキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && themeModal && !themeModal.classList.contains('hidden')) {
      closeThemeModal();
    }
  });
}

// テーマモーダルを開く
function openThemeModal() {
  const themeModal = document.getElementById('themeModal');
  const themeList = document.getElementById('themeList');
  
  if (!themeModal || !themeList) return;
  
  // アンロック済みテーマを取得
  const unlockedThemes = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '[]');
  const currentTheme = localStorage.getItem(CURRENT_THEME_KEY) || 'default';
  const streakInfo = getStreakInfo();
  
  // デフォルトテーマは常にアンロック済み
  if (!unlockedThemes.includes('default')) {
    unlockedThemes.push('default');
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(unlockedThemes));
  }
  
  // テーマリストを生成
  themeList.innerHTML = '';
  
  THEME_DEFINITIONS.forEach(theme => {
    const isUnlocked = unlockedThemes.includes(theme.id) || theme.requiredLevel === 1;
    const isCurrent = currentTheme === theme.id;
    const canUnlock = streakInfo.level >= theme.requiredLevel;
    
    const themeCard = document.createElement('div');
    themeCard.className = `theme-card p-4 rounded-xl border-2 cursor-pointer transition-all ${
      isCurrent 
        ? 'border-purple-500 bg-purple-50 shadow-lg' 
        : isUnlocked 
          ? 'border-slate-300 bg-white hover:border-purple-300 hover:shadow-md' 
          : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
    }`;
    
    if (isUnlocked && !isCurrent) {
      themeCard.addEventListener('click', () => {
        selectTheme(theme.id);
      });
    }
    
    themeCard.innerHTML = `
      <div class="text-4xl mb-2 text-center">${theme.icon}</div>
      <div class="text-sm font-bold text-center text-slate-800 mb-1">${theme.name}</div>
      ${isCurrent ? '<div class="text-xs text-center text-purple-600 font-semibold">✓ 選択中</div>' : ''}
      ${!isUnlocked && canUnlock ? '<div class="text-xs text-center text-orange-600 font-semibold mt-1">🔓 アンロック可能</div>' : ''}
      ${!isUnlocked && !canUnlock ? `<div class="text-xs text-center text-slate-500 mt-1">Lv.${theme.requiredLevel}でアンロック</div>` : ''}
    `;
    
    themeList.appendChild(themeCard);
  });
  
  // モーダルを表示
  themeModal.style.display = 'flex';
  themeModal.classList.remove('hidden');
}

// テーマモーダルを閉じる
function closeThemeModal() {
  const themeModal = document.getElementById('themeModal');
  if (themeModal) {
    themeModal.style.display = 'none';
    themeModal.classList.add('hidden');
  }
}

// テーマを選択
function selectTheme(themeId) {
  localStorage.setItem(CURRENT_THEME_KEY, themeId);
  applyCurrentTheme();
  closeThemeModal();
  console.log(`🎨 テーマ「${themeId}」を適用しました`);
}

// 現在のテーマを適用
function applyCurrentTheme() {
  const currentTheme = localStorage.getItem(CURRENT_THEME_KEY) || 'default';
  const body = document.body;
  
  // 既存のテーマクラスを削除
  THEME_DEFINITIONS.forEach(theme => {
    body.classList.remove(`theme-${theme.id}`);
  });
  
  // 新しいテーマクラスを追加
  body.classList.add(`theme-${currentTheme}`);
  
  // 背景装飾要素にもクラスを適用
  const bgDecoration = document.querySelector('.fixed.inset-0.pointer-events-none');
  if (bgDecoration) {
    bgDecoration.className = `fixed inset-0 pointer-events-none overflow-hidden bg-decoration`;
  }
}

// ===== メニューシステム =====
function initMenuSystem() {
  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  const menuClose = document.getElementById('menuClose');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const menuInstallBtn = document.getElementById('menuInstallBtn');
  
  // メニューボタンクリック
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      openMenuPanel();
    });
  }
  
  // 閉じるボタンクリック
  if (menuClose) {
    menuClose.addEventListener('click', () => {
      closeMenuPanel();
    });
  }
  
  // 背景クリックで閉じる
  if (menuBackdrop) {
    menuBackdrop.addEventListener('click', () => {
      closeMenuPanel();
    });
  }
  
  // エスケープキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPanel && !menuPanel.classList.contains('hidden')) {
      closeMenuPanel();
    }
  });
  
  // メニュー項目のクリックイベント
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const action = item.getAttribute('data-action');
      handleMenuAction(action);
    });
  });
  
  // PWAインストールボタンの表示制御
  if (menuInstallBtn) {
    const installBtn = document.getElementById('installBtn');
    if (installBtn && !installBtn.classList.contains('hidden')) {
      menuInstallBtn.classList.remove('hidden');
    }
  }
  
  // アカウント情報ボタンの表示制御（ログイン時のみ表示）
  updateAccountMenuButton();
}

// メニューパネルを開く
function openMenuPanel() {
  const menuPanel = document.getElementById('menuPanel');
  const panelContent = menuPanel?.querySelector('.fixed.top-0.right-0');
  
  if (menuPanel && panelContent) {
    menuPanel.style.display = 'block';
    menuPanel.classList.remove('hidden');
    
    // メニューを開く時にPWAインストールボタンの表示状態を更新
    updateInstallButtonVisibility();
    
    // アニメーション用に少し遅延
    setTimeout(() => {
      panelContent.classList.remove('translate-x-full');
      const backdrop = document.getElementById('menuBackdrop');
      if (backdrop) {
        backdrop.style.opacity = '1';
      }
    }, 10);
  }
}

// メニューパネルを閉じる
function closeMenuPanel() {
  const menuPanel = document.getElementById('menuPanel');
  const panelContent = menuPanel?.querySelector('.fixed.top-0.right-0');
  
  if (menuPanel && panelContent) {
    panelContent.classList.add('translate-x-full');
    const backdrop = document.getElementById('menuBackdrop');
    if (backdrop) {
      backdrop.style.opacity = '0';
    }
    
    setTimeout(() => {
      menuPanel.style.display = 'none';
      menuPanel.classList.add('hidden');
    }, 300);
  }
}

// メニューアクションを処理
function handleMenuAction(action) {
  closeMenuPanel();
  
  switch (action) {
    case 'show-stats':
      // 学習統計を表示
      console.log('📊 学習統計を表示');
      showStatsModal();
      break;
    case 'show-streak':
      // 連続学習記録を表示
      console.log('🔥 連続学習記録を表示');
      showStreakModal();
      break;
    case 'show-theme':
      // テーマ選択モーダルを開く
      console.log('🎨 テーマ選択を表示');
      openThemeModal();
      break;
    case 'install-app':
      // PWAインストールモーダルを表示
      console.log('📱 PWAインストールボタンがクリックされました');
      showInstallModal();
      break;
    case 'show-help':
      // ヘルプを表示
      console.log('❓ ヘルプを表示');
      showHelpModal();
      break;
    case 'show-account':
      // アカウント情報を表示
      console.log('👤 アカウント情報を表示');
      showAccountModal();
      break;
    case 'export-data':
      // 学習データをエクスポート
      console.log('💾 学習データをエクスポート');
      exportLearningData();
      break;
    case 'import-data':
      // 学習データをインポート
      console.log('📥 学習データをインポート');
      importLearningData();
      break;
    default:
      console.log('不明なアクション:', action);
  }
}

// 励ましメッセージデータを読み込む
async function loadEncouragementData() {
  if (encouragementData) return encouragementData;
  
  try {
    const response = await fetch('./data/encouragement-messages.json');
    if (response.ok) {
      encouragementData = await response.json();
      console.log('✅ 励ましメッセージデータ読み込み成功');
      return encouragementData;
    } else {
      console.warn('⚠️ encouragement-messages.jsonが見つかりません。デフォルトデータを使用します。');
      return getDefaultEncouragementData();
    }
  } catch (error) {
    console.error('❌ 励ましメッセージデータ読み込みエラー:', error);
    return getDefaultEncouragementData();
  }
}

// デフォルトデータ（フォールバック用）
function getDefaultEncouragementData() {
  return [
    {
      date: '01-01',
      character: 'nyabi',
      tone: 'encourage',
      id: 'default',
      baseId: 'default',
      season: 'winter',
      message: '今日も一歩ずつ前進しましょう！\n継続は力なり。毎日の積み重ねが大切です！\n小さな努力の積み重ねが、大きな成果につながります！'
    }
  ];
}

// キャラクター名から画像パスを生成
function getCharacterImagePath(characterName) {
  const characterPath = './images/character/';
  // character名（"nyabi"または"robot"）から画像ファイル名を生成
  // 実際のファイル名に合わせて調整が必要な場合があります
  return `${characterPath}${characterName}.png`;
}

// 連続学習日数に応じたビビッドカラーのアクセントを取得（任天堂風デザイン、既存色を踏襲）
function getStreakAccentColor(days) {
  // 抑え目な背景色に、ビビッドな色をアクセントとして使用
  // 既存の教科色（オレンジ、緑、青）を活用してバランスを取る
  // 背景は淡いグレー系で抑え目な印象に
  const subtleBg = 'bg-slate-50'; // 淡いグレー背景
  if (days >= 30) {
    return { bg: subtleBg, accent: 'bg-blue-500', border: 'border-blue-500', borderColor: '#3b82f6', text: 'text-blue-600' };
  } else if (days >= 15) {
    return { bg: subtleBg, accent: 'bg-green-600', border: 'border-green-600', borderColor: '#16a34a', text: 'text-green-600' };
  } else if (days >= 8) {
    return { bg: subtleBg, accent: 'bg-orange-600', border: 'border-orange-600', borderColor: '#ea580c', text: 'text-orange-600' };
  } else if (days >= 4) {
    return { bg: subtleBg, accent: 'bg-orange-500', border: 'border-orange-500', borderColor: '#f97316', text: 'text-orange-600' };
  } else {
    return { bg: subtleBg, accent: 'bg-yellow-500', border: 'border-yellow-500', borderColor: '#f59e0b', text: 'text-yellow-600' };
  }
}

// 日付に基づいたメッセージとキャラクターを取得
async function getDailyDateMessage() {
  const data = await loadEncouragementData();
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;
  
  // 配列から該当日付のメッセージを検索
  const dailyMsg = Array.isArray(data) 
    ? data.find(msg => msg.date === dateKey)
    : null;
  
  if (dailyMsg) {
    return {
      message: dailyMsg.message,
      character: getCharacterImagePath(dailyMsg.character),
      tone: dailyMsg.tone,
      season: dailyMsg.season
    };
  }
  return null;
}

// ランダムメッセージとキャラクターを取得
async function getRandomEncouragementMessage() {
  const data = await loadEncouragementData();
  
  if (!Array.isArray(data) || data.length === 0) {
    // フォールバック
    return {
      message: '今日も一歩ずつ前進しましょう！\n継続は力なり。毎日の積み重ねが大切です！\n小さな努力の積み重ねが、大きな成果につながります！',
      character: getCharacterImagePath('nyabi'),
      tone: 'encourage',
      season: 'winter'
    };
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  const randomMsg = data[randomIndex];
  
  return {
    message: randomMsg.message,
    character: getCharacterImagePath(randomMsg.character),
    tone: randomMsg.tone,
    season: randomMsg.season
  };
}

// おすすめタブ用の励ましメッセージとキャラクターを生成
async function getRecommendedEncouragementMessage() {
  const dateData = await getDailyDateMessage();
  
  let message, character;
  
  if (dateData) {
    // 日付対応メッセージがある場合は、それを使用
    message = dateData.message;
    character = dateData.character;
  } else {
    // 日付対応メッセージがない場合は、ランダムメッセージを使用
    const randomData = await getRandomEncouragementMessage();
    message = randomData.message;
    character = randomData.character;
  }
  
  return { message, character };
}

// 教科別イラスト切り替えの機能
function updateSubjectHero(subject) {
  const heroImg = document.getElementById('subjectHero');
  const heroMessage = document.getElementById('subjectMessage');
  
  // おすすめタブの場合は特別な処理
  if (subject === 'recommended') {
    // キャラクター表示用のスタイル（マンガの吹き出しスタイル）
  if (heroImg) {
      // imgタグの場合は親要素（div.relative.z-10.text-center）を操作
      const heroContainer = heroImg.parentElement;
      if (heroContainer) {
        heroImg.style.display = 'none';
        // 既存のキャラクター要素と吹き出しを削除
        const existingChar = heroContainer.querySelector('.character-display');
        if (existingChar) existingChar.remove();
        const existingBubble = heroContainer.querySelector('.speech-bubble');
        if (existingBubble) existingBubble.remove();
        
        // 連続学習日数に応じたビビッドカラーのアクセントを取得
        const streakInfo = getStreakInfo();
        const accentColors = getStreakAccentColor(streakInfo.days);
        
        // 背景を設定（白基調＋ビビッドカラーのアクセント）
        heroContainer.className = `relative z-10 w-full h-full ${accentColors.bg} flex items-center justify-between px-4 sm:px-6 transition-all duration-1000`;
        heroContainer.style.height = '12rem'; // h-48相当
        heroContainer.style.borderBottom = `4px solid ${accentColors.borderColor}`;
        
        // ビビッドカラーの装飾要素を追加（上部のアクセントバー）
        const accentBar = document.createElement('div');
        accentBar.className = `absolute top-0 left-0 right-0 h-1 ${accentColors.accent}`;
        accentBar.style.zIndex = '1';
        heroContainer.appendChild(accentBar);
        
        // 非同期でメッセージとキャラクター画像を取得
        getRecommendedEncouragementMessage().then(({ message, character }) => {
          
          // キャラクター表示要素を左側に配置
          const charDiv = document.createElement('div');
          charDiv.className = 'character-display flex-shrink-0 flex flex-col items-center justify-center';
          charDiv.innerHTML = `
            <img src="${character}" alt="学習応援キャラクター" class="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-3">
            <div class="streak-info ${accentColors.accent} text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
              🔥 ${streakInfo.days}日連続 | Lv.${streakInfo.level}
            </div>
          `;
          heroContainer.appendChild(charDiv);
          
          // 吹き出しを右側に配置（任天堂風：白背景＋ビビッドカラーのボーダー、天地センター）
          const bubbleDiv = document.createElement('div');
          bubbleDiv.className = 'speech-bubble flex-1 max-w-[65%] sm:max-w-[70%] relative ml-2 sm:ml-4 self-center';
          // HTMLエスケープ関数を使用
          const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');
          bubbleDiv.innerHTML = `
            <div class="bg-white rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 shadow-xl border-4 ${accentColors.border} relative z-10 transform transition-all duration-300 hover:scale-105" style="border-color: ${accentColors.borderColor};">
              <p class="text-slate-800 font-semibold text-xs sm:text-sm leading-relaxed">${escapedMessage}</p>
            </div>
            <div class="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-0 h-0 border-t-[10px] sm:border-t-[12px] border-t-transparent border-r-[14px] sm:border-r-[16px] border-b-[10px] sm:border-b-[12px] border-b-transparent z-20" style="border-right-color: ${accentColors.borderColor};"></div>
          `;
          heroContainer.appendChild(bubbleDiv);
        }).catch(error => {
          console.error('❌ 励ましメッセージ取得エラー:', error);
          // エラー時はデフォルト表示
          const streakInfo = getStreakInfo();
          const accentColors = getStreakAccentColor(streakInfo.days);
          // エラー時はデフォルトキャラクター画像を表示
          const defaultCharacter = './images/character/character-default.png';
          const charDiv = document.createElement('div');
          charDiv.className = 'character-display flex-shrink-0 flex flex-col items-center justify-center';
          charDiv.innerHTML = `
            <img src="${defaultCharacter}" alt="学習応援キャラクター" class="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-3">
            <div class="streak-info ${accentColors.accent} text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
              🔥 ${streakInfo.days}日連続 | Lv.${streakInfo.level}
            </div>
          `;
          heroContainer.appendChild(charDiv);
        });
      }
    }
    
    // 既存のメッセージ要素は非表示にする（吹き出しで表示するため）
    if (heroMessage) {
      heroMessage.style.display = 'none';
    }
    return;
  }
  
  // おすすめタブ以外の場合は、キャラクター要素と吹き出しを削除して画像を表示
  if (heroImg) {
    const heroContainer = heroImg.parentElement;
    if (heroContainer) {
      // キャラクター要素と吹き出しを削除
      const existingChar = heroContainer.querySelector('.character-display');
      if (existingChar) existingChar.remove();
      const existingBubble = heroContainer.querySelector('.speech-bubble');
      if (existingBubble) existingBubble.remove();
      // 元のクラスに戻す
      heroContainer.className = 'relative z-10 text-center';
      heroImg.style.display = '';
    }
    
    // imgタグの場合はsrcを設定（既存のロジックに合わせる）
    if (heroImg.tagName === 'IMG') {
      const subjectData = {
        sci: { image: './images/subjects/science.png' },
        soc: { image: './images/subjects/social.png' },
        science_drill: { image: './images/subjects/science.png' },
        social_drill: { image: './images/subjects/social.png' },
        math: { image: './images/subjects/math.png' },
        jpn: { image: './images/subjects/japanese.png' },
        eng: { image: './images/subjects/english.png' }
      };
      const data = subjectData[subject] || subjectData.sci;
  if (data) {
    heroImg.src = data.image;
    heroImg.alt = `${subject}の学習イラスト`;
        heroImg.className = 'h-32 sm:h-40 w-full object-cover transition-all duration-500';
      }
    }
  }
  
  // メッセージの更新
  if (heroMessage) {
    heroMessage.style.display = '';
    const messageData = {
      sci: '🔬 理科わかる編で自然現象を理解し、入試で勝利しよう！',
      soc: '🌍 社会わかる編で歴史・地理・公民をマスターしよう！',
      science_drill: '🧪 理科おぼえる編で重要事項を徹底暗記しよう！',
      social_drill: '📍 社会おぼえる編で重要事項を徹底暗記しよう！',
      math: '🔢 算数で論理的思考力を身につけよう！',
      jpn: '📚 国語で豊かな表現力を身につけよう！',
      eng: '🌏 英語で世界とつながろう！'
    };
    
    const message = messageData[subject] || messageData.sci;
    heroMessage.textContent = message;
    heroMessage.className = 'text-white font-bold text-base sm:text-xl drop-shadow-lg bg-black/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full';
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
  // Firebase entitlementsにも反映（開発・テスト用）
  if (state.user && state.userEntitlements) {
    state.userEntitlements.add(packId);
  }
  renderAppView();
}

// 開発・テスト用：すべてのパックをオープン（本番公開時に削除予定）
window.fakePurchase = fakePurchase; // グローバルスコープに公開

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
  // 🚨 無限リロード防止: renderHome()はroute()から呼ばれるため、ここでは呼ばない
  // console.log('🏠 renderHome()を強制実行');
  // setTimeout(() => {
  //   renderHome();
  // }, 100);
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
  let description = '';
  if (isScience) {
    description = '物理・化学・生物・地学の全分野を学習できます';
  } else {
    // 社会の場合、学年別の説明を設定
    if (pack.grade === 4) {
      description = '地理分野の全コンテンツを学習できます（地図学習シリーズ含む）';
    } else if (pack.grade === 5) {
      description = '歴史分野の全コンテンツを学習できます（テーマ史・時代横断問題含む）';
    } else if (pack.grade === 6) {
      description = '公民分野と総合分野の全コンテンツを学習できます（入試対策含む）';
    } else {
      description = '地理・歴史・公民の全分野を学習できます';
    }
  }
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
  // 🚨 無限リロード防止: 重複実行を防ぐ
  if (window._startupExecuted) {
    console.log('⚠️ startup() は既に実行済みです。スキップします。');
    return;
  }
  window._startupExecuted = true;
  
  console.log('🚀 startup関数が実行されました');
  
  // 🎉 Stripe Checkout 結果をチェック（最初に実行）
  handleCheckoutResult();
  
  // 🎓 復習システムを初期化（復習システム無効化のためスキップ）
  console.log('🚫 復習システムは無効化されています');
  
  document.getElementById('btnLogin')?.addEventListener('click', loginMock);
  document.getElementById('btnLogout')?.addEventListener('click', logoutMock);
  
  // 🚀 グローバルイベント委譲を追加（②本格対応）
  setupGlobalEventDelegation();
  
  // 📌 教科タブのイベントリスナーを設定
  setupSubjectTabs();
  
  console.log('📚 loadCatalogを実行します...');
  await loadCatalog();
  console.log('✅ loadCatalog完了後のstate.catalog:', state.catalog?.length || 0, '件');
  
  // 進捗データの移行処理を実行（分散形式 → 統合形式）
  console.log('🔄 進捗データの移行を開始します...');
  const progressMigrated = migrateProgressData();
  if (progressMigrated) {
    console.log('✅ 進捗データの移行が完了しました');
  }
  
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
  
  // 🚨 無限リロード防止: hashchangeイベントリスナーの重複登録を防ぐ
  if (!window._hashChangeListenerAdded) {
    window.addEventListener('hashchange', route);
    window._hashChangeListenerAdded = true;
    console.log('✅ hashchangeイベントリスナーを登録しました');
  }
  
  // 初期ハッシュの設定
  if (!location.hash) {
    setHash('home');
  }
  
  // 初期ルーティングを実行
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
window.openPurchaseModal = openPurchaseModal;

// 🚀 グローバルイベント委譲の設定（②本格対応）
function setupGlobalEventDelegation() {
  // 🚨 無限リロード防止: 重複実行を防ぐ
  if (window._globalEventDelegationSetup) {
    console.log('⚠️ setupGlobalEventDelegation() は既に実行済みです。スキップします。');
    return;
  }
  window._globalEventDelegationSetup = true;
  
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
        console.log('📊 復習状況確認アクション実行（復習システム無効化のためスキップ）');
        break;
      case 'review-debug':
        console.log('🔧 復習デバッグアクション実行（復習システム無効化のためスキップ）');
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
        console.log('📝 復習レッスン開始アクション実行（復習システム無効化のためスキップ）');
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
        // ログイン画面を確実に非表示にしてからホームに戻る
        // state.userだけでなく、auth.currentUserも直接チェック（認証状態が確定する前でも対応）
        const loginPanel = document.querySelector('#authBox, .login-card, .auth-container');
        if (loginPanel) {
          // ログイン済みかどうかを直接確認（state.userが未設定でもauth.currentUserで判定）
          const isLoggedIn = state.user || (typeof auth !== 'undefined' && auth.currentUser);
          if (isLoggedIn) {
            loginPanel.classList.add('hidden');
            loginPanel.style.display = 'none';
          }
        }
        // 直接TOPに遷移（setHash経由ではなく、確実にTOPを表示）
        location.hash = '#/home';
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

// 復習システムの設定（削除済み - 復習システム無効化のため）

// 間違えた問題を記録する（復習システム無効化のため機能停止）
function recordWrongAnswer(lessonId, questionData, userAnswer) {
  // 復習システムが無効化されているため、何もしない
  console.log('🚫 復習システムが無効化されているため、間違い問題の記録をスキップします');
  return;
  
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

// 復習レッスン生成条件をチェック（復習システム無効化のため機能停止）
function pickForReview(baseId) {
  // 復習システムが無効化されているため、何もしない
  return [];
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
  // 復習システムが無効化されているため、何もしない
  return;
  
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

// 復習レッスン生成の通知を表示（削除済み - 復習システム無効化のため）

// 復習通知関連の関数（削除済み - 復習システム無効化のため）

// 復習レッスンを開く（削除済み - 復習システム無効化のため）

// 復習レッスンのビューを表示（削除済み - 復習システム無効化のため）

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
// window.openReviewLesson = openReviewLesson; // 復習システム無効化のためコメントアウト
// 復習システム無効化のため、空の関数を定義
if (typeof acceptReviewNotification === 'undefined') {
  window.acceptReviewNotification = function() { console.log('復習システムは無効化されています'); };
}
if (typeof closeReviewNotification === 'undefined') {
  window.closeReviewNotification = function() { console.log('復習システムは無効化されています'); };
}
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
  // catalog.json の id と突き合わせて日本語 title を返す（最適化版）
  const hit = findLessonById(baseId);
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

// ===== 学習データエクスポート/インポート機能 =====

// 学習データをエクスポート（クリップボード + ファイル保存）
async function exportLearningData() {
  try {
    // エクスポート対象のデータを収集
    const exportData = collectExportData();
    
    if (!exportData || Object.keys(exportData).length === 0) {
      showToast('保存するデータがありません', 'warning');
      return;
    }
    
    // メタデータを追加
    const fullData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: exportData
    };
    
    const jsonString = JSON.stringify(fullData, null, 2);
    
    // ファイルとして保存（推奨：端末間移行に最適）
    downloadAsFile(jsonString);
    
    // クリップボードにもコピー（同じ端末内での一時保存用）
    try {
      await navigator.clipboard.writeText(jsonString);
      showToast('✅ ファイルを保存しました！\nクリップボードにもコピーしました\n\n📌 別の端末に移す場合：\n保存したファイルをメールやクラウドストレージで共有してください', 'success');
    } catch (clipboardError) {
      console.warn('クリップボードへのコピーに失敗:', clipboardError);
      showToast('✅ ファイルを保存しました！\n\n📌 別の端末に移す場合：\n保存したファイルをメールやクラウドストレージで共有してください', 'success');
    }
  } catch (error) {
    console.error('❌ データエクスポートエラー:', error);
    showToast('データの保存に失敗しました', 'error');
  }
}

// エクスポート対象のデータを収集
function collectExportData() {
  const exportData = {};
  
  // localStorageから全キーを取得
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    // 除外キーをスキップ
    if (EXCLUDE_KEYS.includes(key)) {
      return;
    }
    
    // パターンマッチング
    let shouldExport = false;
    for (const pattern of EXPORT_KEY_PATTERNS) {
      if (typeof pattern === 'string') {
        if (key === pattern) {
          shouldExport = true;
          break;
        }
      } else if (pattern.test(key)) {
        shouldExport = true;
        break;
      }
    }
    
    if (shouldExport) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // JSONとして解析可能か確認
          JSON.parse(value);
          exportData[key] = value;
        }
      } catch (e) {
        // JSONでない場合はスキップ
        console.warn(`キー "${key}" はJSON形式ではないためスキップします`);
      }
    }
  });
  
  return exportData;
}

// ファイルとしてダウンロード
function downloadAsFile(jsonString) {
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `学習データ_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ ファイルを保存しました', 'success');
  } catch (error) {
    console.error('❌ ファイル保存エラー:', error);
    showToast('ファイルの保存に失敗しました', 'error');
  }
}

// 学習データをインポート（クリップボード + ファイル読み込み）
async function importLearningData() {
  try {
    // 現在のデータをバックアップ
    const currentData = collectExportData();
    const hasCurrentData = Object.keys(currentData).length > 0;
    
    if (hasCurrentData) {
      const backup = confirm('現在の学習データをバックアップしますか？\n（推奨：読み込み前にバックアップを取っておくと安全です）');
      if (backup) {
        const backupData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          data: currentData
        };
        downloadAsFile(JSON.stringify(backupData, null, 2));
      }
    }
    
    // インポート方法を選択（ファイル読み込みを推奨）
    const method = prompt('データの読み込み方法を選択してください：\n\n1: ファイルを選択（推奨：別端末から移す場合）\n2: クリップボードから貼り付け（同じ端末内の場合）\n\n（1または2を入力、キャンセルで中止）');
    
    let jsonString = null;
    
    if (method === '1') {
      // ファイルから読み込み（推奨）
      jsonString = await readFromFile();
    } else if (method === '2') {
      // クリップボードから読み込み
      try {
        jsonString = await navigator.clipboard.readText();
        if (!jsonString || jsonString.trim() === '') {
          showToast('クリップボードが空です', 'warning');
          // フォールバック: テキストエリアを使用
          jsonString = await promptForPaste();
        }
      } catch (clipboardError) {
        console.warn('クリップボードからの読み込みに失敗:', clipboardError);
        // フォールバック: テキストエリアを使用
        jsonString = await promptForPaste();
      }
    } else {
      showToast('操作がキャンセルされました', 'info');
      return;
    }
    
    if (!jsonString || jsonString.trim() === '') {
      showToast('データが空です', 'warning');
      return;
    }
    
    // データを解析
    let importedData;
    try {
      importedData = JSON.parse(jsonString);
    } catch (parseError) {
      showToast('データの形式が正しくありません', 'error');
      console.error('JSON解析エラー:', parseError);
      return;
    }
    
    // バージョンチェック
    if (importedData.version && importedData.version !== '1.0') {
      const proceed = confirm(`データのバージョンが異なります（${importedData.version}）。\n読み込みを続行しますか？`);
      if (!proceed) {
        return;
      }
    }
    
    // データを取得（dataプロパティがある場合はそれを使用）
    const dataToImport = importedData.data || importedData;
    
    // 最終確認
    const progressCount = (dataToImport['progress'] ? 1 : 0) + 
                          Object.keys(dataToImport).filter(k => k.startsWith('progress:')).length;
    const historyCount = Object.keys(dataToImport).filter(k => k.startsWith('learningHistory')).length;
    const otherCount = Object.keys(dataToImport).filter(k => 
      k !== 'progress' && !k.startsWith('progress:') && !k.startsWith('learningHistory')
    ).length;
    
    const confirmMsg = `以下のデータを読み込みます：\n\n` +
      `- 進捗データ: ${progressCount}件\n` +
      `- 学習履歴: ${historyCount}件\n` +
      `- その他: ${otherCount}件\n\n` +
      `現在のデータは上書きされます。よろしいですか？`;
    
    if (!confirm(confirmMsg)) {
      showToast('読み込みがキャンセルされました', 'info');
      return;
    }
    
    // データをインポート
    let importedCount = 0;
    let errorCount = 0;
    
    for (const [key, value] of Object.entries(dataToImport)) {
      try {
        // JSONとして検証
        JSON.parse(value);
        localStorage.setItem(key, value);
        importedCount++;
      } catch (e) {
        console.warn(`キー "${key}" のインポートに失敗:`, e);
        errorCount++;
      }
    }
    
    // 結果を表示
    if (errorCount === 0) {
      showToast(`✅ データの読み込みが完了しました！\n（${importedCount}件のデータを読み込みました）`, 'success');
      
      // UIを更新
      setTimeout(() => {
        if (typeof renderHome === 'function') {
          renderHome();
        }
        // テーマを再適用
        if (typeof applyCurrentTheme === 'function') {
          applyCurrentTheme();
        }
      }, 500);
    } else {
      showToast(`⚠️ 一部のデータの読み込みに失敗しました\n（成功: ${importedCount}件、失敗: ${errorCount}件）`, 'warning');
    }
  } catch (error) {
    console.error('❌ データインポートエラー:', error);
    showToast('データの読み込みに失敗しました', 'error');
  }
}

// クリップボードが使えない場合のフォールバック
function promptForPaste() {
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '50%';
    textarea.style.left = '50%';
    textarea.style.transform = 'translate(-50%, -50%)';
    textarea.style.width = '80%';
    textarea.style.height = '300px';
    textarea.style.zIndex = '10000';
    textarea.placeholder = 'ここにデータを貼り付けて「OK」をクリックしてください';
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    
    const button = document.createElement('button');
    button.textContent = 'OK';
    button.style.marginTop = '10px';
    button.style.padding = '10px 20px';
    button.onclick = () => {
      const value = textarea.value;
      document.body.removeChild(container);
      resolve(value);
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.marginLeft = '10px';
    cancelButton.style.padding = '10px 20px';
    cancelButton.onclick = () => {
      document.body.removeChild(container);
      resolve(null);
    };
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.appendChild(button);
    buttonContainer.appendChild(cancelButton);
    
    container.appendChild(textarea);
    container.appendChild(buttonContainer);
    document.body.appendChild(container);
    textarea.focus();
  });
}

// ファイルから読み込み
function readFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = () => {
        showToast('ファイルの読み込みに失敗しました', 'error');
        resolve(null);
      };
      reader.readAsText(file);
    };
    input.oncancel = () => {
      resolve(null);
    };
    input.click();
  });
}

// トースト通知を表示
function showToast(message, type = 'info') {
  // 既存のトーストがあれば削除
  const existingToast = document.querySelector('.data-export-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'data-export-toast fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold whitespace-pre-line text-center max-w-md';
  
  // タイプに応じた色を設定
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500');
      break;
    case 'error':
      toast.classList.add('bg-red-500');
      break;
    case 'warning':
      toast.classList.add('bg-yellow-500');
      break;
    default:
      toast.classList.add('bg-blue-500');
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 3秒後に自動削除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 3000);
}

// ===== 学習統計システム =====

// 達成度に応じた色とメッセージを取得
function getAchievementInfo(percent) {
  if (percent >= 80) {
    return {
      color: 'green',
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-100',
      textColor: 'text-green-700',
      message: '完璧です！🎉',
      icon: '🌟',
      stars: '⭐⭐⭐⭐⭐'
    };
  } else if (percent >= 60) {
    return {
      color: 'orange',
      gradient: 'from-orange-400 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-100',
      textColor: 'text-orange-700',
      message: '順調です！✨',
      icon: '⭐',
      stars: '⭐⭐⭐⭐'
    };
  } else if (percent >= 30) {
    return {
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-400',
      bgGradient: 'from-yellow-50 to-orange-100',
      textColor: 'text-yellow-700',
      message: '頑張っています！💪',
      icon: '🚀',
      stars: '⭐⭐⭐'
    };
  } else {
    return {
      color: 'gray',
      gradient: 'from-slate-400 to-slate-500',
      bgGradient: 'from-slate-50 to-slate-100',
      textColor: 'text-slate-700',
      message: 'これからです！🎯',
      icon: '🌱',
      stars: '⭐'
    };
  }
}

// 数値をカウントアップアニメーション
function animateValue(element, start, end, duration, suffix = '') {
  if (!element) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    element.textContent = current + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

// パーセンテージをカウントアップアニメーション
function animatePercent(element, start, end, duration) {
  if (!element) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = (progress * (end - start) + start).toFixed(1);
    element.textContent = current + '%';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end.toFixed(1) + '%';
    }
  };
  window.requestAnimationFrame(step);
}

// プログレスバーをアニメーション
function animateProgressBar(barElement, targetPercent, duration = 1000) {
  if (!barElement) return;
  
  barElement.style.width = '0%';
  barElement.style.transition = `width ${duration}ms ease-out`;
  
  setTimeout(() => {
    barElement.style.width = targetPercent + '%';
  }, 100);
}

// 次の目標を計算
function getNextGoal(stats) {
  const goals = [];
  
  // 総合目標
  const totalProgress = stats.total.totalLessons > 0 
    ? Math.round((stats.total.lessonsCompleted / stats.total.totalLessons) * 100) 
    : 0;
  
  const nextMilestone = [25, 50, 75, 100].find(m => m > totalProgress);
  if (nextMilestone) {
    const remaining = Math.ceil((nextMilestone / 100) * stats.total.totalLessons) - stats.total.lessonsCompleted;
    if (remaining > 0) {
      goals.push({
        type: 'total',
        message: `あと${remaining}レッスンで${nextMilestone}%達成！🎯`,
        icon: '🎯'
      });
    }
  }
  
  // 教科別目標
  Object.keys(stats.bySubject).forEach(subject => {
    const subjectStats = stats.bySubject[subject];
    const progress = subjectStats.total > 0 
      ? Math.round((subjectStats.completed / subjectStats.total) * 100) 
      : 0;
    
    const nextMilestone = [25, 50, 75, 100].find(m => m > progress);
    if (nextMilestone) {
      const remaining = Math.ceil((nextMilestone / 100) * subjectStats.total) - subjectStats.completed;
      if (remaining > 0 && remaining <= 5) {
        goals.push({
          type: 'subject',
          subject: subjectStats.name,
          message: `${subjectStats.name}：あと${remaining}レッスンで${nextMilestone}%達成！`,
          icon: '📚'
        });
      }
    }
  });
  
  // 連続学習目標
  const streakInfo = getStreakInfo();
  const nextStreakMilestone = [7, 14, 30, 60, 100].find(m => m > streakInfo.days);
  if (nextStreakMilestone) {
    const remaining = nextStreakMilestone - streakInfo.days;
    if (remaining <= 7) {
      goals.push({
        type: 'streak',
        message: `あと${remaining}日で連続${nextStreakMilestone}日達成！🔥`,
        icon: '🔥'
      });
    }
  }
  
  return goals.slice(0, 3); // 最大3つまで
}

// 統計データを収集
function collectLearningStats() {
  const stats = {
    total: {
      lessonsCompleted: 0,
      totalLessons: 0,
      totalTime: 0, // 秒単位
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0
    },
    bySubject: {
      'sci': { name: '理科わかる編', completed: 0, total: 0, totalTime: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      'science_drill': { name: '理科おぼえる編', completed: 0, total: 0, totalTime: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      'soc': { name: '社会わかる編', completed: 0, total: 0, totalTime: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      'social_drill': { name: '社会おぼえる編', completed: 0, total: 0, totalTime: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 }
    },
    byGrade: {
      4: { name: '小4', completed: 0, total: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      5: { name: '小5', completed: 0, total: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      6: { name: '小6', completed: 0, total: 0, totalQuestions: 0, correctAnswers: 0, averageScore: 0 }
    },
    recentSessions: []
  };
  
  if (!state.catalog || state.catalog.length === 0) {
    console.warn('カタログが読み込まれていません');
    return stats;
  }
  
  // 全レッスンをループ
  state.catalog.forEach(lesson => {
    const progress = getLessonProgress(lesson.id);
    const isCompleted = isLessonCompleted(lesson.id);
    
    // 総合統計
    stats.total.totalLessons++;
    if (isCompleted) {
      stats.total.lessonsCompleted++;
      
      if (progress && progress.detail) {
        const { correct = 0, total = 0, timeSec = 0 } = progress.detail;
        stats.total.totalTime += timeSec;
        stats.total.totalQuestions += total;
        stats.total.correctAnswers += correct;
      }
    }
    
    // 教科別統計
    if (stats.bySubject[lesson.subject]) {
      const subjectStats = stats.bySubject[lesson.subject];
      subjectStats.total++;
      if (isCompleted) {
        subjectStats.completed++;
        if (progress && progress.detail) {
          const { correct = 0, total = 0, timeSec = 0 } = progress.detail;
          subjectStats.totalTime += timeSec;
          subjectStats.totalQuestions += total;
          subjectStats.correctAnswers += correct;
        }
      }
    }
    
    // 学年別統計
    if (lesson.grade && stats.byGrade[lesson.grade]) {
      const gradeStats = stats.byGrade[lesson.grade];
      gradeStats.total++;
      if (isCompleted) {
        gradeStats.completed++;
        if (progress && progress.detail) {
          const { correct = 0, total = 0 } = progress.detail;
          gradeStats.totalQuestions += total;
          gradeStats.correctAnswers += correct;
        }
      }
    }
    
    // 最近の学習履歴（完了したレッスンのみ）
    if (isCompleted && progress && progress.at) {
      stats.recentSessions.push({
        lessonId: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        grade: lesson.grade,
        date: new Date(progress.at),
        correct: progress.detail?.correct || 0,
        total: progress.detail?.total || 0,
        timeSec: progress.detail?.timeSec || 0,
        score: progress.score || 0
      });
    }
  });
  
  // 平均正答率を計算
  if (stats.total.totalQuestions > 0) {
    stats.total.averageScore = (stats.total.correctAnswers / stats.total.totalQuestions * 100).toFixed(1);
  }
  
  // 教科別の平均正答率を計算
  Object.keys(stats.bySubject).forEach(subject => {
    const subjectStats = stats.bySubject[subject];
    if (subjectStats.totalQuestions > 0) {
      subjectStats.averageScore = (subjectStats.correctAnswers / subjectStats.totalQuestions * 100).toFixed(1);
    }
  });
  
  // 学年別の平均正答率を計算
  Object.keys(stats.byGrade).forEach(grade => {
    const gradeStats = stats.byGrade[grade];
    if (gradeStats.totalQuestions > 0) {
      gradeStats.averageScore = (gradeStats.correctAnswers / gradeStats.totalQuestions * 100).toFixed(1);
    }
  });
  
  // 最近の学習履歴を日時順（新しい順）にソート
  stats.recentSessions.sort((a, b) => b.date - a.date);
  stats.recentSessions = stats.recentSessions.slice(0, 10); // 最新10件
  
  return stats;
}

// 時間をフォーマット（秒 → 時間分秒）
function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0分';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  } else if (minutes > 0) {
    return `${minutes}分`;
  } else {
    return `${secs}秒`;
  }
}

// 統計モーダルを表示
function showStatsModal() {
  const modal = document.getElementById('statsModal');
  const content = document.getElementById('statsContent');
  
  if (!modal || !content) {
    console.error('統計モーダルの要素が見つかりません');
    return;
  }
  
  // 統計データを収集
  const stats = collectLearningStats();
  const streakInfo = getStreakInfo();
  
  // 次の目標を取得
  const nextGoals = getNextGoal(stats);
  const totalProgress = stats.total.totalLessons > 0 
    ? Math.round((stats.total.lessonsCompleted / stats.total.totalLessons) * 100) 
    : 0;
  const achievementInfo = getAchievementInfo(totalProgress);
  
  // HTMLを生成
  let html = '';
  
  // 励ましメッセージと次の目標
  html += `
    <div class="mb-6 bg-gradient-to-r ${achievementInfo.bgGradient} rounded-lg p-6 border-2 border-${achievementInfo.color}-300 shadow-lg">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-4xl">${achievementInfo.icon}</span>
        <div>
          <div class="text-2xl font-bold ${achievementInfo.textColor}">${achievementInfo.message}</div>
          <div class="text-sm text-slate-600 mt-1">総合進捗: ${totalProgress}% ${achievementInfo.stars}</div>
        </div>
      </div>
      ${nextGoals.length > 0 ? `
        <div class="mt-4 pt-4 border-t border-${achievementInfo.color}-200">
          <div class="text-sm font-semibold text-slate-700 mb-2">🎯 次の目標</div>
          <div class="space-y-1">
            ${nextGoals.map(goal => `
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span>${goal.icon}</span>
                <span>${goal.message}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  // 総合統計カード（フェードイン用のクラスを追加）
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.1s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📈 総合統計</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div class="text-sm text-slate-600 mb-1">総学習時間</div>
          <div class="text-2xl font-bold text-blue-700" data-animate="time" data-value="${stats.total.totalTime}">0分</div>
        </div>
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div class="text-sm text-slate-600 mb-1">完了レッスン</div>
          <div class="text-2xl font-bold text-green-700" data-animate="number" data-value="${stats.total.lessonsCompleted}">0</div>
          <div class="text-xs text-slate-500">/ ${stats.total.totalLessons}</div>
        </div>
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div class="text-sm text-slate-600 mb-1">平均正答率</div>
          <div class="text-2xl font-bold text-purple-700" data-animate="percent" data-value="${parseFloat(stats.total.averageScore) || 0}">0%</div>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div class="text-sm text-slate-600 mb-1">連続学習</div>
          <div class="text-2xl font-bold text-orange-700" data-animate="number" data-value="${streakInfo.days}">0</div>
          <div class="text-xs text-slate-500">Lv.${streakInfo.level}</div>
        </div>
      </div>
    </div>
  `;
  
  // 教科別統計
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.3s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📚 教科別統計</h3>
      <div class="space-y-4">
  `;
  
  Object.keys(stats.bySubject).forEach((subject, index) => {
    const subjectStats = stats.bySubject[subject];
    const progressPercent = subjectStats.total > 0 ? Math.round((subjectStats.completed / subjectStats.total) * 100) : 0;
    const subjectAchievement = getAchievementInfo(progressPercent);
    
    html += `
      <div class="bg-gradient-to-br ${subjectAchievement.bgGradient} rounded-lg p-4 border-l-4 border-${subjectAchievement.color}-500 transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">${subjectAchievement.icon}</span>
            <div class="font-semibold text-slate-800">${subjectStats.name}</div>
          </div>
          <div class="text-sm text-slate-600">完了: ${subjectStats.completed}/${subjectStats.total}</div>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-slate-600">進捗</span>
            <span class="font-semibold text-slate-800" data-animate="percent" data-value="${progressPercent}">0%</span>
            <span class="text-xs ${subjectAchievement.textColor}">${subjectAchievement.stars}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r ${subjectAchievement.gradient} h-3 rounded-full progress-bar" data-progress="${progressPercent}" style="width: 0%"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm mt-3">
          <div>
            <span class="text-slate-600">平均正答率: </span>
            <span class="font-semibold text-slate-800" data-animate="percent" data-value="${parseFloat(subjectStats.averageScore) || 0}">0%</span>
          </div>
          <div>
            <span class="text-slate-600">学習時間: </span>
            <span class="font-semibold text-slate-800">${formatTime(subjectStats.totalTime)}</span>
          </div>
        </div>
        <div class="mt-2 text-xs ${subjectAchievement.textColor} font-semibold">
          ${subjectAchievement.message}
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  // 学年別統計
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.5s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">🎓 学年別統計</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  `;
  
  [4, 5, 6].forEach(grade => {
    const gradeStats = stats.byGrade[grade];
    const gradeProgress = gradeStats.total > 0 ? Math.round((gradeStats.completed / gradeStats.total) * 100) : 0;
    const gradeAchievement = getAchievementInfo(gradeProgress);
    
    html += `
      <div class="bg-gradient-to-br ${gradeAchievement.bgGradient} rounded-lg p-4 border-l-4 border-${gradeAchievement.color}-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${gradeAchievement.icon}</span>
          <div class="text-lg font-bold ${gradeAchievement.textColor}">${gradeStats.name}</div>
        </div>
        <div class="text-sm text-slate-600 mb-1">完了: ${gradeStats.completed}/${gradeStats.total}</div>
        <div class="text-sm mb-2">
          <span class="text-slate-600">平均正答率: </span>
          <span class="font-semibold text-slate-800" data-animate="percent" data-value="${parseFloat(gradeStats.averageScore) || 0}">0%</span>
        </div>
        <div class="text-xs ${gradeAchievement.textColor} font-semibold">
          ${gradeAchievement.stars} ${gradeAchievement.message}
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  // 最近の学習履歴
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.7s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📝 最近の学習</h3>
  `;
  
  if (stats.recentSessions.length === 0) {
    html += `
      <div class="text-center py-8 text-slate-500">
        <p class="text-lg mb-2">📚 まだ学習履歴がありません</p>
        <p class="text-sm">レッスンを完了すると、ここに表示されます</p>
      </div>
    `;
  } else {
    html += `<div class="space-y-3">`;
    stats.recentSessions.forEach((session, index) => {
      const dateStr = session.date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const scorePercent = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
      const sessionAchievement = getAchievementInfo(scorePercent);
      
      html += `
        <div class="bg-gradient-to-r ${sessionAchievement.bgGradient} rounded-lg p-4 border-l-4 border-${sessionAchievement.color}-500 transform transition-all duration-300 hover:scale-102 hover:shadow-lg" style="animation: fadeInUp 0.4s ease-out ${0.8 + index * 0.1}s forwards; opacity: 0;">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">${sessionAchievement.icon}</span>
                <div class="font-semibold text-slate-800">${session.title}</div>
              </div>
              <div class="text-sm text-slate-500 ml-7">${dateStr}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
            <div>
              <span class="text-slate-600">正答率: </span>
              <span class="font-semibold ${sessionAchievement.textColor}">${scorePercent}%</span>
              <span class="text-xs ml-1">${sessionAchievement.stars}</span>
            </div>
            <div>
              <span class="text-slate-600">問題数: </span>
              <span class="font-semibold text-slate-800">${session.total}問</span>
            </div>
            <div>
              <span class="text-slate-600">時間: </span>
              <span class="font-semibold text-slate-800">${formatTime(session.timeSec)}</span>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }
  
  html += `
    </div>
  `;
  
  content.innerHTML = html;
  
  // モーダルを表示
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  
  // アニメーションを実行（少し遅延させてから開始）
  setTimeout(() => {
    // 数値のカウントアップアニメーション
    const numberElements = content.querySelectorAll('[data-animate="number"]');
    numberElements.forEach(el => {
      const value = parseInt(el.getAttribute('data-value')) || 0;
      animateValue(el, 0, value, 1500);
    });
    
    // パーセンテージのカウントアップアニメーション
    const percentElements = content.querySelectorAll('[data-animate="percent"]');
    percentElements.forEach(el => {
      const value = parseFloat(el.getAttribute('data-value')) || 0;
      animatePercent(el, 0, value, 1500);
    });
    
    // 時間のアニメーション（特別処理）
    const timeElement = content.querySelector('[data-animate="time"]');
    if (timeElement) {
      const totalSeconds = parseInt(timeElement.getAttribute('data-value')) || 0;
      let currentSeconds = 0;
      const duration = 2000;
      const increment = totalSeconds / (duration / 16); // 60fps想定
      
      const timeInterval = setInterval(() => {
        currentSeconds += increment;
        if (currentSeconds >= totalSeconds) {
          currentSeconds = totalSeconds;
          clearInterval(timeInterval);
        }
        timeElement.textContent = formatTime(Math.floor(currentSeconds));
      }, 16);
    }
    
    // プログレスバーのアニメーション
    const progressBars = content.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
      const targetPercent = parseInt(bar.getAttribute('data-progress')) || 0;
      animateProgressBar(bar, targetPercent, 1500);
    });
  }, 200);
  
  // 閉じるボタンのイベント
  const closeBtn = document.getElementById('statsModalClose');
  if (closeBtn) {
    closeBtn.onclick = () => closeStatsModal();
  }
  
  // 背景クリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeStatsModal();
    }
  };
  
  // エスケープキーで閉じる
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeStatsModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// 統計モーダルを閉じる
function closeStatsModal() {
  const modal = document.getElementById('statsModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// ===== 連続学習記録システム =====

// 連続学習記録の詳細データを取得
function getStreakDetails() {
  const streakInfo = getStreakInfo();
  const streakData = JSON.parse(localStorage.getItem(STREAK_STORAGE_KEY) || '{"days": 0, "lastDate": ""}');
  const unlockedThemes = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '[]');
  const currentTheme = localStorage.getItem(CURRENT_THEME_KEY) || 'default';
  
  // 次のレベルを取得
  const currentLevelDef = LEVEL_DEFINITIONS.find(def => def.level === streakInfo.level);
  const nextLevelDef = LEVEL_DEFINITIONS.find(def => def.level === streakInfo.level + 1);
  
  // 最近の学習日を計算（過去30日間）
  const recentDays = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時刻をリセット
  const learnedDates = new Set();
  
  // 進捗データから学習日を取得
  if (state.catalog && state.catalog.length > 0) {
    state.catalog.forEach(lesson => {
      const progress = getLessonProgress(lesson.id);
      if (progress && progress.at) {
        const progressDate = new Date(progress.at);
        progressDate.setHours(0, 0, 0, 0); // 時刻をリセット
        const dateStr = progressDate.toISOString().split('T')[0];
        learnedDates.add(dateStr);
      }
    });
  }
  
  // 連続学習の最終日も追加
  if (streakData.lastDate) {
    learnedDates.add(streakData.lastDate);
  }
  
  // 30日前の日付を取得
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  
  // 最初の日をその週の日曜日に合わせる
  const firstDayOfWeek = startDate.getDay(); // 0=日曜日, 1=月曜日, ...
  const calendarStartDate = new Date(startDate);
  calendarStartDate.setDate(calendarStartDate.getDate() - firstDayOfWeek);
  
  // カレンダーに表示する日数（30日 + 最初の週の余分な日数）
  const totalDays = 30 + firstDayOfWeek;
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(calendarStartDate);
    date.setDate(calendarStartDate.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    
    // 30日前より前の日付は空白として扱う
    if (date < startDate) {
      recentDays.push({
        date: date,
        dateStr: dateStr,
        isLearned: false,
        dayOfWeek: date.getDay(),
        isToday: false,
        isEmpty: true // 空白セル用のフラグ
      });
      continue;
    }
    
    const isToday = date.getTime() === today.getTime();
    
    // 学習したかどうかを判定
    const isLearned = learnedDates.has(dateStr) || 
                      (isToday && streakData.days > 0); // 今日は連続中なら学習済み
    
    recentDays.push({
      date: date,
      dateStr: dateStr,
      isLearned: isLearned,
      dayOfWeek: date.getDay(),
      isToday: isToday,
      isEmpty: false
    });
  }
  
  return {
    days: streakInfo.days,
    level: streakInfo.level,
    lastDate: streakData.lastDate,
    currentLevelDef,
    nextLevelDef,
    nextLevelDays: nextLevelDef ? nextLevelDef.days : null,
    remainingDays: nextLevelDef ? Math.max(0, nextLevelDef.days - streakInfo.days) : null,
    progressToNextLevel: nextLevelDef && currentLevelDef 
      ? Math.min(100, Math.round(((streakInfo.days - currentLevelDef.days) / (nextLevelDef.days - currentLevelDef.days)) * 100))
      : 100,
    unlockedThemes,
    currentTheme,
    recentDays,
    allThemes: THEME_DEFINITIONS
  };
}

// 連続学習記録モーダルを表示
function showStreakModal() {
  const modal = document.getElementById('streakModal');
  const content = document.getElementById('streakContent');
  
  if (!modal || !content) {
    console.error('連続学習記録モーダルの要素が見つかりません');
    return;
  }
  
  const details = getStreakDetails();
  
  // HTMLを生成
  let html = '';
  
  // メインヘッダー（大きな連続日数表示）
  const achievementInfo = getAchievementInfo(details.progressToNextLevel);
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.1s forwards;">
      <div class="bg-gradient-to-br ${achievementInfo.bgGradient} rounded-2xl p-8 text-center border-4 border-${achievementInfo.color}-400 shadow-2xl">
        <div class="text-6xl mb-4" style="animation: pulse 2s ease-in-out infinite;">🔥</div>
        <div class="text-5xl sm:text-6xl font-bold ${achievementInfo.textColor} mb-2" data-animate="number" data-value="${details.days}">0</div>
        <div class="text-2xl font-semibold text-slate-700 mb-4">日連続学習中！</div>
        <div class="text-xl ${achievementInfo.textColor} font-bold mb-2">${achievementInfo.message}</div>
        <div class="text-lg text-slate-600">レベル ${details.level} ${achievementInfo.stars}</div>
      </div>
    </div>
  `;
  
  // 次のレベルまでの進捗
  if (details.nextLevelDef) {
    html += `
      <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.3s forwards;">
        <h3 class="text-lg font-bold text-slate-800 mb-4">🎯 次のレベルまで</h3>
        <div class="bg-gradient-to-r from-orange-50 to-amber-100 rounded-lg p-6 border-2 border-orange-300">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-xl font-bold text-orange-700">レベル ${details.nextLevelDef.level}</div>
              <div class="text-sm text-slate-600">${details.nextLevelDef.days}日で達成</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-orange-700" data-animate="number" data-value="${details.remainingDays}">0</div>
              <div class="text-sm text-slate-600">日残り</div>
            </div>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div class="bg-gradient-to-r from-orange-400 to-amber-500 h-4 rounded-full progress-bar" data-progress="${details.progressToNextLevel}" style="width: 0%"></div>
          </div>
          <div class="text-center mt-2 text-sm text-slate-600">
            <span data-animate="percent" data-value="${details.progressToNextLevel}">0%</span> 達成
          </div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.3s forwards;">
        <div class="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-lg p-6 border-2 border-yellow-300 text-center">
          <div class="text-4xl mb-2">🏆</div>
          <div class="text-xl font-bold text-yellow-700">最高レベル達成！</div>
          <div class="text-sm text-slate-600 mt-2">素晴らしい継続力です！</div>
        </div>
      </div>
    `;
  }
  
  // 最近の学習カレンダー（過去30日間）
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.5s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📅 最近の学習カレンダー</h3>
      <div class="bg-slate-50 rounded-lg p-4">
        <div class="grid grid-cols-7 gap-2">
  `;
  
  // 曜日ヘッダー
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  weekDays.forEach(day => {
    html += `<div class="text-center text-xs font-semibold text-slate-500 py-1">${day}</div>`;
  });
  
  // カレンダー日付
  details.recentDays.forEach((dayInfo, index) => {
    // 空白セルの場合
    if (dayInfo.isEmpty) {
      html += `
        <div class="aspect-square rounded-lg bg-transparent flex items-center justify-center text-xs font-semibold">
        </div>
      `;
      return;
    }
    
    const dayNum = dayInfo.date.getDate();
    let bgColor, textColor, border;
    
    if (dayInfo.isToday) {
      // 今日
      bgColor = dayInfo.isLearned 
        ? 'bg-gradient-to-br from-orange-400 to-red-500' 
        : 'bg-gradient-to-br from-orange-100 to-orange-200';
      textColor = dayInfo.isLearned ? 'text-white' : 'text-orange-700';
      border = 'border-2 border-orange-500';
    } else if (dayInfo.isLearned) {
      // 学習日
      bgColor = 'bg-gradient-to-br from-green-400 to-emerald-500';
      textColor = 'text-white';
      border = '';
    } else {
      // 未学習日
      bgColor = 'bg-slate-200';
      textColor = 'text-slate-500';
      border = '';
    }
    
    html += `
      <div class="aspect-square rounded-lg ${bgColor} ${textColor} ${border} flex items-center justify-center text-xs font-semibold transform transition-all duration-300 hover:scale-110 shadow-sm" title="${dayInfo.dateStr} ${dayInfo.isLearned ? '学習済み' : '未学習'}">
        ${dayNum}
      </div>
    `;
  });
  
  html += `
        </div>
        <div class="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
            <span class="text-slate-600">学習日</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-red-500 border-2 border-orange-500"></div>
            <span class="text-slate-600">今日（学習済み）</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-slate-200"></div>
            <span class="text-slate-600">未学習</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // アンロック済みテーマ
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.7s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">🎨 アンロック済みテーマ</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
  `;
  
  details.allThemes.forEach((theme, index) => {
    const isUnlocked = details.unlockedThemes.includes(theme.id);
    const isCurrent = details.currentTheme === theme.id;
    const bgColor = isUnlocked 
      ? (isCurrent ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-gradient-to-br from-slate-100 to-slate-200')
      : 'bg-gradient-to-br from-slate-50 to-slate-100 opacity-50';
    const textColor = isUnlocked ? 'text-slate-800' : 'text-slate-400';
    const border = isCurrent ? 'border-4 border-blue-500' : isUnlocked ? 'border-2 border-slate-300' : 'border-2 border-slate-200';
    
    html += `
      <div class="bg-gradient-to-br ${bgColor} rounded-lg p-4 text-center ${border} transform transition-all duration-300 hover:scale-105 ${isUnlocked ? 'cursor-pointer' : ''}" title="${isUnlocked ? theme.name : '未アンロック'}">
        <div class="text-3xl mb-2">${isUnlocked ? theme.icon : '🔒'}</div>
        <div class="text-sm font-semibold ${textColor}">${theme.name}</div>
        ${isCurrent ? '<div class="text-xs text-blue-600 font-bold mt-1">使用中</div>' : ''}
        ${!isUnlocked ? `<div class="text-xs text-slate-400 mt-1">Lv.${theme.requiredLevel}</div>` : ''}
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  // モチベーションメッセージ
  const motivationalMessages = [
    { days: 100, message: '100日達成！伝説的な継続力です！💎', icon: '💎' },
    { days: 60, message: '2ヶ月達成！あなたは学習の達人です！🔥', icon: '🔥' },
    { days: 30, message: '1ヶ月達成！本当に素晴らしいです！👑', icon: '👑' },
    { days: 14, message: '2週間達成！学習が習慣になっています！🎉', icon: '🏆' },
    { days: 7, message: '1週間達成！素晴らしい継続力です！✨', icon: '🌟' },
    { days: 3, message: '3日連続！習慣がついてきました！💪', icon: '⭐' },
    { days: 0, message: '今日から始めましょう！🚀', icon: '🌱' }
  ];
  
  const currentMessage = motivationalMessages.find(msg => details.days >= msg.days) || motivationalMessages[motivationalMessages.length - 1];
  
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.9s forwards;">
      <div class="bg-gradient-to-r from-purple-50 to-pink-100 rounded-lg p-6 border-2 border-purple-300 text-center">
        <div class="text-4xl mb-2">${currentMessage.icon}</div>
        <div class="text-xl font-bold text-purple-700">${currentMessage.message}</div>
        <div class="text-sm text-slate-600 mt-2">毎日の小さな積み重ねが大きな成果につながります</div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
  
  // モーダルを表示
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  
  // アニメーションを実行
  setTimeout(() => {
    // 数値のカウントアップアニメーション
    const numberElements = content.querySelectorAll('[data-animate="number"]');
    numberElements.forEach(el => {
      const value = parseInt(el.getAttribute('data-value')) || 0;
      animateValue(el, 0, value, 2000);
    });
    
    // パーセンテージのカウントアップアニメーション
    const percentElements = content.querySelectorAll('[data-animate="percent"]');
    percentElements.forEach(el => {
      const value = parseFloat(el.getAttribute('data-value')) || 0;
      animatePercent(el, 0, value, 2000);
    });
    
    // プログレスバーのアニメーション
    const progressBars = content.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
      const targetPercent = parseInt(bar.getAttribute('data-progress')) || 0;
      animateProgressBar(bar, targetPercent, 2000);
    });
  }, 200);
  
  // 閉じるボタンのイベント
  const closeBtn = document.getElementById('streakModalClose');
  if (closeBtn) {
    closeBtn.onclick = () => closeStreakModal();
  }
  
  // 背景クリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeStreakModal();
    }
  };
  
  // エスケープキーで閉じる
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeStreakModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// 連続学習記録モーダルを閉じる
function closeStreakModal() {
  const modal = document.getElementById('streakModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// ===== アカウント情報システム =====

// アカウント情報メニューボタンの表示制御
function updateAccountMenuButton() {
  const accountBtn = document.getElementById('menuAccountBtn');
  if (!accountBtn) return;
  
  if (state.user) {
    accountBtn.classList.remove('hidden');
  } else {
    accountBtn.classList.add('hidden');
  }
}

// アカウント情報モーダルを表示
function showAccountModal() {
  const modal = document.getElementById('accountModal');
  const content = document.getElementById('accountContent');
  
  if (!modal || !content) {
    console.error('アカウント情報モーダルの要素が見つかりません');
    return;
  }
  
  if (!state.user) {
    alert('ログインが必要です');
    return;
  }
  
  const user = state.user;
  const entitlements = Array.from(state.userEntitlements);
  const unlockedThemes = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '[]');
  const streakInfo = getStreakInfo();
  
  // HTMLを生成
  let html = '';
  
  // ユーザー情報カード
  const userInitial = user.displayName 
    ? user.displayName.charAt(0).toUpperCase() 
    : user.email 
      ? user.email.charAt(0).toUpperCase() 
      : '👤';
  const userName = user.displayName || user.email || 'ユーザー';
  const userEmail = user.email || '';
  const isEmailVerified = user.emailVerified !== false;
  
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.1s forwards;">
      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-3xl text-white font-bold">
            ${userInitial}
          </div>
          <div class="flex-1">
            <div class="text-xl font-bold text-slate-800 mb-1">${userName}</div>
            <div class="text-sm text-slate-600">${userEmail}</div>
            ${isEmailVerified ? `
              <div class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span>✓</span>
                <span>メール確認済み</span>
              </div>
            ` : `
              <div class="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <span>⚠</span>
                <span>メール未確認</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 学習統計サマリー
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.3s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📊 学習サマリー</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-700">${streakInfo.days}</div>
          <div class="text-xs text-slate-600 mt-1">連続学習日数</div>
        </div>
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-700">Lv.${streakInfo.level}</div>
          <div class="text-xs text-slate-600 mt-1">現在のレベル</div>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-orange-700">${unlockedThemes.length}</div>
          <div class="text-xs text-slate-600 mt-1">アンロックテーマ</div>
        </div>
      </div>
    </div>
  `;
  
  // 購入済みコンテンツ
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.5s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">💳 購入済みコンテンツ</h3>
  `;
  
  if (entitlements.length === 0) {
    html += `
      <div class="bg-slate-50 rounded-lg p-6 text-center">
        <div class="text-4xl mb-2">📚</div>
        <div class="text-slate-600 mb-2">購入済みコンテンツはありません</div>
        <div class="text-sm text-slate-500">コンテンツを購入すると、ここに表示されます</div>
      </div>
    `;
  } else {
    html += `<div class="space-y-3">`;
    
    entitlements.forEach(entitlementId => {
      // PACKSから該当するパックを検索
      const pack = PACKS.find(p => p.id === entitlementId || p.productId === entitlementId);
      if (pack) {
        html += `
          <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 border-l-4 border-green-500 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">✅</span>
              <div>
                <div class="font-semibold text-slate-800">${pack.label}</div>
                <div class="text-xs text-slate-600">購入済み</div>
              </div>
            </div>
            <div class="text-sm text-green-600 font-semibold">利用可能</div>
          </div>
        `;
      } else {
        // パックが見つからない場合はIDをそのまま表示
        html += `
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border-l-4 border-slate-300 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📦</span>
              <div>
                <div class="font-semibold text-slate-800">${entitlementId}</div>
                <div class="text-xs text-slate-600">購入済み</div>
              </div>
            </div>
            <div class="text-sm text-slate-600 font-semibold">利用可能</div>
          </div>
        `;
      }
    });
    
    html += `</div>`;
  }
  
  html += `
    </div>
  `;
  
  // アカウント設定（将来拡張用）
  const userId = user.uid || user.id || 'N/A';
  const loginProvider = getLoginProviderName(user);
  
  html += `
    <div class="mb-6 stats-section opacity-0" style="animation: fadeInUp 0.6s ease-out 0.7s forwards;">
      <h3 class="text-lg font-bold text-slate-800 mb-4">⚙️ アカウント設定</h3>
      <div class="bg-slate-50 rounded-lg p-4">
        <div class="text-sm text-slate-600 space-y-2">
          <p><span class="font-semibold">アカウントID:</span> <span class="font-mono text-xs bg-slate-200 px-2 py-1 rounded">${userId}</span></p>
          <p><span class="font-semibold">ログイン方法:</span> ${loginProvider}</p>
          <p class="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-200">※ その他の設定機能は今後追加予定です</p>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
  
  // モーダルを表示
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  
  // 閉じるボタンのイベント
  const closeBtn = document.getElementById('accountModalClose');
  if (closeBtn) {
    closeBtn.onclick = () => closeAccountModal();
  }
  
  // 背景クリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeAccountModal();
    }
  };
  
  // エスケープキーで閉じる
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeAccountModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// ログインプロバイダー名を取得
function getLoginProviderName(user) {
  if (!user) return '不明';
  
  if (user.providerData && user.providerData.length > 0) {
    const provider = user.providerData[0].providerId;
    if (provider === 'google.com') return 'Googleアカウント';
    if (provider === 'password') return 'メール/パスワード';
    return provider;
  }
  
  // フォールバック
  if (user.email) return 'メール/パスワード';
  return '不明';
}

// アカウント情報モーダルを閉じる
function closeAccountModal() {
  const modal = document.getElementById('accountModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

