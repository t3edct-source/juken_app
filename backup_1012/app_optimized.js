// Firebase認証基盤統合版 - メインアプリケーション（最適化版）
console.log('🚀 app.js 読み込み開始 - Version 20241219-002-optimized');

// Firebase Firestore 関数のインポート（entitlements チェック用）
import { 
  db, collection, doc, getDoc, getDocs, onSnapshot, setDoc,
  auth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, 
  createUserWithEmailAndPassword, sendEmailVerification 
} from './firebaseConfig.js';

// 復習システムモジュールのインポート
import { reviewSystem } from './modules/reviewSystem.js';

// 起動時セルフチェック
(function bootCheck(){
  console.log('🔍 bootCheck: window.firebaseAuth =', !!window.firebaseAuth);
  if (!window.firebaseAuth) {
    console.error('❌ firebaseAuth 未定義（app.jsが読まれていない可能性）');
  } else {
    console.log('✅ firebaseAuth 確認済み');
    console.log('🔍 利用可能な認証メソッド:', Object.keys(window.firebaseAuth));
  }
})();

async function waitForFirebaseAuth(timeout=3000){
  const t0 = performance.now();
  while(!window.firebaseAuth){
    if (performance.now()-t0>timeout) throw new Error('firebaseAuth not ready');
    await new Promise(r=>setTimeout(r,50));
  }
  console.log('✅ firebaseAuth 準備完了');
}

// 文字列安全化＆省略ユーティリティ
const toStr = v => v == null ? '' : String(v);
const trunc = (v, n = 80) => { 
  const s = toStr(v); 
  return s.length > n ? s.slice(0, n) + '…' : s; 
};

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
    
    // 3) ヘッダーボタンの切り替え
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const purchaseBtn = document.getElementById('purchaseBtn');
    
    if (btnLogin) btnLogin.classList.toggle('hidden', isIn);
    if (btnLogout) btnLogout.classList.toggle('hidden', !isIn);
    
    if (purchaseBtn) {
      purchaseBtn.disabled = !isIn;
      purchaseBtn.textContent = isIn ? '💳 購入' : 'ログイン必要';
    }
    
    // UI更新処理があればここに追加
    try {
      if (typeof updateHeaderButtons === 'function') {
        updateHeaderButtons(user);
      }
      if (typeof updatePurchaseButtons === 'function') {
        updatePurchaseButtons(user);
      }
      if (typeof renderAppView === 'function') {
        renderAppView();
      }
    } catch (error) {
      console.warn('⚠️ UI更新中にエラー:', error);
    }
    
    console.log('🎯 UI切り替え完了:', isIn ? 'ログイン状態' : 'ログアウト状態');
  };
  
  // Firebase認証状態の監視を設定
  onAuthStateChanged(auth, window.syncFirebaseAuth);
  
  // イベント委譲を設定
  console.log('🚀 DOMContentLoaded: イベント委譲を設定します');
  setupGlobalEventDelegation();
  
  // アプリケーションの初期化を実行
  await startup();
  
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
  
  // タブイベントリスナーを設定
  const subjectTabs = document.querySelectorAll(".subject-tab");
  console.log('🎯 タブ要素数:', subjectTabs.length);
  
  subjectTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      console.log('📌 タブクリック:', tab.dataset.subject || tab.textContent);
      
      // アクティブタブの切り替え
      subjectTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      // ホームビューを表示
      showHomeView();
      
      // currentSubjectを更新
      const subject = tab.dataset.subject || 'recommended';
      window.currentSubject = subject;
      
      // ホーム画面を再描画
      if (typeof renderHome === 'function') {
        renderHome();
      }
    });
  });
  
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
  
  if (urlParams.get('success') === 'true') {
    console.log('🎉 Stripe Checkout 成功');
    showPurchaseSuccessMessage();
    
    // URLパラメータをクリア
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  } else if (urlParams.get('canceled') === 'true') {
    console.log('❌ Stripe Checkout キャンセル');
    showPurchaseCancelMessage();
    
    // URLパラメータをクリア
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

function showPurchaseSuccessMessage() {
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">🎉</span>
      <span class="toast-message">購入が完了しました！すぐに学習を始められます。</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // アニメーション表示
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // 4秒後に自動削除
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

function showPurchaseCancelMessage() {
  const toast = document.createElement('div');
  toast.className = 'toast cancel';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">ℹ️</span>
      <span class="toast-message">購入がキャンセルされました。いつでも再度お試しいただけます。</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // アニメーション表示
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // 4秒後に自動削除
  setTimeout(() => {
    toast.classList.remove('show');
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
  // 復習関連の状態は reviewSystem モジュールで管理
  get wrongQuestions() { return reviewSystem.wrongQuestions; },
  get reviewLessons() { return reviewSystem.reviewLessons; }
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
const PACK_CONTENTS = {
  'g4-sci': {
    title: '小4 理科',
    description: '物理・化学・生物・地学の基礎を学習',
    features: ['基本的な実験の理解', '身近な自然現象の学習', '観察・記録の方法'],
    topics: ['季節と生き物', '電気の働き', '水の変化', '星の動き']
  },
  'g4-soc': {
    title: '小4 社会',
    description: '地域社会と日本の地理・歴史の基礎',
    features: ['都道府県の位置と特色', '地図の読み方', '歴史の流れ'],
    topics: ['住んでいる県', '特色ある地域', '県内の伝統・文化', '地域の発展']
  },
  'g5-sci': {
    title: '小5 理科',
    description: 'より発展的な理科の概念と実験',
    features: ['詳細な実験手順', '科学的思考の育成', '仮説と検証'],
    topics: ['植物の発芽・成長', '魚の誕生', '台風と気象', '振り子の運動']
  },
  'g5-soc': {
    title: '小5 社会',
    description: '日本の国土と産業の理解',
    features: ['日本の地形と気候', '各地の産業', '環境問題への理解'],
    topics: ['日本の国土', '農業・水産業', '工業生産', '情報産業']
  },
  'g6-sci': {
    title: '小6 理科',
    description: '中学理科への準備となる発展内容',
    features: ['複雑な実験の理解', '科学的な考察力', '環境との関わり'],
    topics: ['人の体のつくり', '植物のつくり', '大地のつくり', '月と太陽']
  },
  'g6-soc': {
    title: '小6 社会',
    description: '日本の歴史と政治の基礎',
    features: ['歴史の流れの理解', '政治の仕組み', '国際理解'],
    topics: ['縄文・弥生時代', '奈良・平安時代', '鎌倉・室町時代', '江戸時代', '明治以降', '現代社会']
  }
};

// ===== 購入・学年状態管理 =====
function getCurrentGrade() {
  return parseInt(localStorage.getItem('currentGrade')) || null;
}

function setCurrentGrade(grade) {
  localStorage.setItem('currentGrade', grade.toString());
  console.log(`📚 学年を小${grade}に設定`);
}

// 学年に応じたパックを取得
function getPacksForGrade(grade) {
  return PACKS.filter(pack => pack.grade === grade);
}

// 教科に応じたパックを取得
function getPacksForSubject(subject) {
  const subjectMap = {
    '理科': 'sci',
    '社会': 'soc'
  };
  const subjectCode = subjectMap[subject] || subject;
  return PACKS.filter(pack => pack.subject === subject || pack.id.includes(subjectCode));
}

// パックIDからパック情報を取得
function getPackById(packId) {
  return PACKS.find(pack => pack.id === packId);
}

// ユーザーのentitlements（購入済みコンテンツ）を読み込む
async function loadUserEntitlements(userId) {
  try {
    console.log('🔍 ユーザーのentitlementsを読み込み中...', userId);
    
    const userDocRef = doc(db, 'entitlements', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('📦 Firestore entitlements データ:', data);
      
      // entitlementsフィールドが配列の場合
      if (data.entitlements && Array.isArray(data.entitlements)) {
        state.userEntitlements = new Set(data.entitlements);
        console.log('✅ entitlements読み込み完了（配列形式）:', Array.from(state.userEntitlements));
      }
      // 直接プロダクトIDがフィールドとして存在する場合
      else {
        const entitlements = [];
        Object.keys(data).forEach(key => {
          if (data[key] === true) {
            entitlements.push(key);
          }
        });
        state.userEntitlements = new Set(entitlements);
        console.log('✅ entitlements読み込み完了（オブジェクト形式）:', Array.from(state.userEntitlements));
      }
    } else {
      console.log('📝 ユーザーのentitlementsドキュメントが存在しません');
      state.userEntitlements = new Set();
    }
    
    console.log('🎯 最終的なentitlements:', Array.from(state.userEntitlements));
  } catch (error) {
    console.error('❌ entitlements読み込みエラー:', error);
    state.userEntitlements = new Set();
  }
}

// entitlementsのリアルタイム監視を開始
function startEntitlementsListener(userId) {
  try {
    console.log('🎧 entitlementsのリアルタイム監視を開始:', userId);
    
    const userDocRef = doc(db, 'entitlements', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      console.log('🔄 entitlements更新を検出');
      
      if (doc.exists()) {
        const data = doc.data();
        console.log('📦 更新されたentitlements:', data);
        
        // entitlementsフィールドが配列の場合
        if (data.entitlements && Array.isArray(data.entitlements)) {
          state.userEntitlements = new Set(data.entitlements);
        }
        // 直接プロダクトIDがフィールドとして存在する場合
        else {
          const entitlements = [];
          Object.keys(data).forEach(key => {
            if (data[key] === true) {
              entitlements.push(key);
            }
          });
          state.userEntitlements = new Set(entitlements);
        }
        
        console.log('🎯 更新後のentitlements:', Array.from(state.userEntitlements));
        
        // UI更新
        updateUIAfterEntitlementsChange();
      }
    }, (error) => {
      console.error('❌ entitlements監視エラー:', error);
    });
    
    // クリーンアップ関数をグローバルに保存
    window.entitlementsUnsubscribe = unsubscribe;
    
  } catch (error) {
    console.error('❌ entitlements監視開始エラー:', error);
  }
}

// entitlements変更後のUI更新
function updateUIAfterEntitlementsChange() {
  console.log('🔄 entitlements変更後のUI更新を実行');
  
  // 購入ボタンの状態を更新
  updatePurchaseButtonsState(state.user);
  
  // ホーム画面を再描画（購入済みコンテンツの表示更新）
  if (typeof renderHome === 'function') {
    renderHome();
  }
  
  // アプリビューを再描画
  if (typeof renderAppView === 'function') {
    renderAppView();
  }
}

// 購入ボタンの状態を更新
function updatePurchaseButtonsState(user) {
  console.log('🔄 購入ボタン状態を更新中...', {
    user: !!user,
    entitlements: Array.from(state.userEntitlements)
  });
  
  // ヘッダーの購入ボタン
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (purchaseBtn) {
    if (user) {
      purchaseBtn.disabled = false;
      purchaseBtn.textContent = '💳 購入';
    } else {
      purchaseBtn.disabled = true;
      purchaseBtn.textContent = 'ログイン必要';
    }
  }
  
  // 各パックの購入ボタン（動的に生成される場合があるため、イベント委譲で処理）
  console.log('✅ 購入ボタン状態更新完了');
}

function loginMock(){
  console.log('🔐 ログインボタンクリック（モック）');
  
  // 認証UIを表示
  const authBox = document.getElementById('authBox');
  if (authBox) {
    authBox.classList.remove('hidden');
    authBox.style.display = 'block';
    console.log('📱 認証UIを表示');
  }
}

function logoutMock(){
  console.log('🚪 ログアウトボタンクリック（モック）');
  
  // Firebase signOut を呼び出し
  if (window.firebaseAuth && window.firebaseAuth.signOut) {
    window.firebaseAuth.signOut(window.firebaseAuth.auth);
  }
  
  // UI更新
  document.getElementById('btnLogin')?.classList.remove('hidden');
  document.getElementById('btnLogout')?.classList.add('hidden');
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
    state.user = null;
    state.userEntitlements = new Set();
    
    // UI更新
    document.getElementById('btnLogin')?.classList.remove('hidden');
    document.getElementById('btnLogout')?.classList.add('hidden');
    
    // 購入ボタンを無効化
    const purchaseBtn = document.getElementById('purchaseBtn');
    if (purchaseBtn) {
      purchaseBtn.disabled = true;
      purchaseBtn.textContent = 'ログイン必要';
    }
    
    // entitlements監視を停止
    if (window.entitlementsUnsubscribe) {
      window.entitlementsUnsubscribe();
      window.entitlementsUnsubscribe = null;
    }
    
    console.log('✅ ログアウト処理完了');
  }
}

// entitlementチェック関数
function hasEntitlement(sku) {
  const hasAccess = state.userEntitlements.has(sku);
  
  console.log('🔐 entitlementチェック:', {
    sku,
    hasAccess,
    userEntitlements: Array.from(state.userEntitlements),
    user: !!state.user
  });
  
  return hasAccess;
}

// ===== Stripe Checkout連携機能 =====
async function startPurchase(productId, productName) {
  console.log('💳 購入処理開始:', { productId, productName });
  
  if (!state.user) {
    alert('購入するにはログインが必要です。');
    return;
  }
  
  if (!state.user.emailVerified) {
    alert('購入するにはメールアドレスの確認が必要です。確認メールをご確認ください。');
    return;
  }
  
  try {
    console.log('📡 Netlify Functions へリクエスト送信中...', {
      productId,
      userId: state.user.id,
      userEmail: state.user.email
    });
    
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        userId: state.user.id,
        userEmail: state.user.email,
        productName: productName
      })
    });
    
    console.log('📡 レスポンス受信:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ サーバーエラー:', errorText);
      throw new Error(`サーバーエラー: ${response.status} ${response.statusText}`);
    }
    
    const { url } = await response.json();
    console.log('🔗 Checkout URL取得:', url);
    
    // Stripe Checkoutページにリダイレクト
    window.location.href = url;
    
  } catch (error) {
    console.error('❌ 購入処理エラー:', error);
    alert('購入処理中にエラーが発生しました。しばらく待ってから再度お試しください。');
  }
}

// グローバル関数として公開
window.startPurchase = startPurchase;

async function loadCatalog(){
  console.log('📚 catalog.json を読み込み中...');
  
  const paths = ['./catalog.json', '../catalog.json'];
  
  for (const path of paths) {
    try {
      console.log(`🔍 ${path} を試行中...`);
      const response = await fetch(path);
      
      if (!response.ok) {
        console.warn(`⚠️ ${path} の読み込みに失敗: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      state.catalog = data;
      console.log(`✅ ${path} から catalog を読み込み完了:`, state.catalog.length, '件');
      return;
      
    } catch (error) {
      console.warn(`⚠️ ${path} の読み込みエラー:`, error.message);
    }
  }
  
  console.error('❌ すべてのパスで catalog.json の読み込みに失敗');
  state.catalog = [];
}

function setHash(view, arg=''){
  const hash = arg ? `#/${view}/${arg}` : `#/${view}`;
  console.log('🔗 ハッシュ設定:', hash);
  location.hash = hash;
}

function route(){
  const hash = location.hash || '#/home';
  console.log('🧭 ルーティング:', hash);
  
  const [, view, arg] = hash.split('/');
  
  if (view==='home') {
    clearSessionResult(); // ホームに戻る時は結果をクリア
    showOnly('home'); 
    renderHome();
  }
  else if (view==='lesson') renderLesson(arg);
  else if (view==='purchase') renderPurchase(arg);
  else if (view==='result') renderResult(arg);
  else if (view==='review') reviewSystem.renderReviewLesson(arg);
  else { 
    clearSessionResult(); // デフォルトでホームに戻る時もクリア
    showOnly('home'); 
    renderHome(); 
  }
}

function showOnly(target){
  const views = ['home', 'lesson', 'purchase', 'result'];
  const map = { home:'homeView', lesson:'lessonView', purchase:'purchaseView', result:'resultView', review:'homeView' };
  
  views.forEach(v => {
    const el = document.getElementById(map[v]);
    if (el) {
      if (v === target) {
        el.classList.remove('hidden');
        el.style.display = 'block';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
  });
  
  // タイトル更新
  const titles = {
    'home': 'ホーム',
    'lesson': 'レッスン',
    'purchase': '購入',
    'result': '結果',
    'review': '復習レッスン'
  };
  
  document.title = `ステップナビ | ${titles[target] || 'ホーム'}`;
}

let currentSubject = 'recommended'; // デフォルトは「おすすめ学習」

function renderHome(){
  console.log('🏠 ホーム画面を描画中...');
  console.log('現在の教科:', currentSubject);
  console.log('復習レッスン:', state.reviewLessons ? `${state.reviewLessons.length}件` : 'undefined');
  
  // 推薦リスト（復習・未完了・完了）をここで一元管理
  let recommendations = [];

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
        sku_required: false, // 復習レッスンは無料
        type: 'review',
        reviewLesson: reviewLesson // 元の復習レッスンデータを保持
      };
      recommendations.push(reviewEntry);
    });
  } else {
    console.log('復習レッスンはありません');
  }
  
  const currentGrade = getCurrentGrade();
  if (!currentGrade) {
    console.log('⚠️ 学年が設定されていません');
    return;
  }
  
  console.log(`📚 小${currentGrade} のコンテンツを表示`);
  
  let displayCatalog = [];
  
  // 教科フィルタリング
  if (currentSubject === 'recommended') {
    // おすすめ学習：復習レッスン + 未完了レッスン + 完了済みレッスンの順（復習は上で投入済み）
    
    // 2. 未完了レッスンを追加
    const incompleteLessons = state.catalog.filter(item => 
      item.grade === currentGrade && !isLessonCompleted(item.id)
    ).slice(0, 6); // 最大6件
    
    recommendations.push(...incompleteLessons);
    
    // 3. 完了済みレッスンを追加（復習用）
    const completedLessons = state.catalog.filter(item => 
      item.grade === currentGrade && isLessonCompleted(item.id)
    ).slice(0, 4); // 最大4件
    
    recommendations.push(...completedLessons);
    
    displayCatalog = recommendations;
  } else {
    // 特定教科：該当する教科のみ表示
    displayCatalog = state.catalog.filter(item => 
      item.grade === currentGrade && 
      (item.subject === currentSubject || item.id.includes(currentSubject))
    );
  }
  
  console.log('最終的な推薦リスト（復習レッスン含む）:', recommendations);
  
  // 学年選択UI（簡略版）
  const gradeSelector = `
    <div class="grade-selector mb-4">
      <div class="grade-buttons">
        ${[4,5,6].map(g => `
          <button class="grade-btn ${g === currentGrade ? 'active' : ''}" 
                  data-action="set-grade" data-grade="${g}">
            小${g}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  // 復習ダッシュボード専用表示は削除（復習レッスンは通常のおすすめレッスンに統合）
  
  const list = document.getElementById('lessonList');
  if (!list) {
    console.error('❌ lessonList要素が見つかりません');
    return;
  }
  
  // homeView の基本構造を復元（復習ダッシュボードから切り替えた場合）
  const homeView = document.getElementById('homeView');
  if (homeView && !homeView.querySelector('.subject-tabs')) {
    console.log('🔄 homeView の基本構造を復元中...');
    location.reload(); // 簡易的な復元
    return;
  }
  
  list.innerHTML = gradeSelector;
  
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
    if (currentSubject === 'recommended') {
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
      div.onclick = () => reviewSystem.openReviewLesson(entry.id);
    } else {
      div.onclick = () => setHash('lesson', entry.id);
    }
    
    list.appendChild(div);
  });
  
  console.log('✅ ホーム画面描画完了');
}

// 教科名を取得
function getSubjectName(subject) {
  const names = {
    'sci': '理科',
    'soc': '社会', 
    'math': '算数',
    'jpn': '国語',
    'eng': '英語',
    'review': '復習'
  };
  return names[subject] || subject;
}

// レッスン完了状態をチェック
function isLessonCompleted(lessonId) {
  const progress = localStorage.getItem(`lesson_progress_${lessonId}`);
  return !!progress;
}

// レッスンのスコア情報を取得
function getLessonScoreInfo(lessonId) {
  const progress = localStorage.getItem(`lesson_progress_${lessonId}`);
  if (!progress) return null;
  
  try {
    const data = JSON.parse(progress);
    return {
      correct: data.correct || 0,
      total: data.total || 0,
      formattedDate: new Date(data.completedAt).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric'
      })
    };
  } catch (error) {
    console.error('スコア情報の解析エラー:', error);
    return null;
  }
}

function renderLesson(id){
  console.log('📚 レッスン表示:', id);
  
  if (!id) {
    console.error('❌ レッスンIDが指定されていません');
    return;
  }
  
  showOnly('lesson');
  
  const lesson = state.catalog.find(item => item.id === id);
  if (!lesson) {
    console.error('❌ レッスンが見つかりません:', id);
    return;
  }
  
  state.current = lesson;
  
  // レッスンタイトルを設定
  const titleEl = document.getElementById('lessonTitle');
  if (titleEl) {
    titleEl.textContent = lesson.title;
  }
  
  // iframe でレッスンを読み込み
  const frame = document.getElementById('lessonFrame');
  if (frame) {
    const lessonUrl = `./lessons/${lesson.path}`;
    console.log('🔗 レッスンURL:', lessonUrl);
    frame.src = lessonUrl;
  }
}

function renderPurchase(arg){
  console.log('💳 購入画面表示:', arg);
  showOnly('purchase');
  
  const text = document.getElementById('purchaseText');
  if (text) {
    text.textContent = `${arg} の購入が必要です。`;
  }
}

function renderResult(id){
  console.log('📊 結果画面表示:', id);
  showOnly('result');
  
  // セッション結果を取得
  const sessionResult = getSessionResult();
  console.log('📊 セッション結果:', sessionResult);
  
  if (!sessionResult) {
    console.warn('⚠️ セッション結果が見つかりません');
    return;
  }
  
  const { correct, total, seconds } = sessionResult;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // 結果に応じたメッセージとアイコン
  let resultMessage = '';
  let resultIcon = '';
  
  if (percentage === 100) {
    resultMessage = '🎉 完璧です！素晴らしい成績です！';
    resultIcon = '🏆';
  } else if (percentage >= 80) {
    resultMessage = '👏 よくできました！';
    resultIcon = '🌟';
  } else if (percentage >= 60) {
    resultMessage = '📚 もう少し頑張りましょう！';
    resultIcon = '💪';
  } else {
    resultMessage = '💪 復習して再チャレンジしよう！';
    resultIcon = '📖';
  }
  
  const resultBox = document.getElementById('resultBox');
  if (resultBox) {
    resultBox.innerHTML = `
      <div class="result-container">
        <div class="result-header">
          <div class="result-icon">${resultIcon}</div>
          <h2 class="result-title">学習完了！</h2>
          <p class="result-message">${resultMessage}</p>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <div class="stat-value">${percentage}%</div>
            <div class="stat-label">正解率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${correct}</div>
            <div class="stat-label">正解数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${total}</div>
            <div class="stat-label">総問題数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${seconds}</div>
            <div class="stat-label">秒</div>
          </div>
        </div>
        
        <div class="result-actions">
          <div class="action-buttons">
            <button data-action="retry-lesson" data-lesson-id="${id}" class="flex-1 px-4 py-3 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold transition-all duration-200">
              <div class="flex items-center justify-center gap-2">
                <span>🔄</span>
                <span>もう一度</span>
              </div>
            </button>
            <a href="#/home" class="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-center transition-all duration-200">
              <div class="flex items-center justify-center gap-2">
                <span>🏠</span>
                <span>ホームに戻る</span>
              </div>
            </a>
          </div>
          
          <div class="continue-learning mt-4">
            <p class="text-sm text-slate-600 mb-3">学習を続けませんか？</p>
            <div class="recommended-actions">
              <button class="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200">
                <span>📚</span>
                再学習
              </button>
              <button class="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-all duration-200">
                <span>🎯</span>
                類似問題
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// 個別問題の回答記録（復習システム用）
window.addEventListener('message', (ev)=>{
  console.log('🔔 メッセージを受信しました:', ev.data);
  console.log('🔔 送信元オリジン:', ev.origin);
  console.log('🔔 現在のオリジン:', location.origin);
  
  // オリジンチェックを無効化（ローカル開発用）
  console.log('✅ オリジンチェックをスキップ:', ev.origin);
  const d=ev.data||{};
  
  // 個別問題の回答記録（復習システム用）
  if (d.type === 'question:answered') {
    console.log('問題回答メッセージを受信:', d);
    if (window.handleQuestionAnswered) {
      window.handleQuestionAnswered(d);
    }
    return;
  }
  
  // レッスン完了処理
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
    console.log('💾 セッション結果を保存中:', { id, correct, total, seconds });
    saveSessionResult(id, correct, total, seconds);
    console.log('💾 セッション結果保存完了:', getSessionResult());
    
    setHash('result', id);
  } else if (d.type==='lesson:goBack'){
    console.log('戻るメッセージを受信しました');
    // iframe内から戻るボタンが押された場合、ホーム画面に戻る
    setHash('home');
  }
});

function escapeHtml(s){return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);}

// PWA インストール機能
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
        console.log(`PWAインストール結果: ${outcome}`);
        
        // プロンプトを使用済みにする
        deferredPrompt = null;
        
        // ボタンを非表示にする
        installBtn.classList.add('hidden');
      }
    });
  }
});

// レッスン進捗の保存
function saveLessonProgress(lessonId, correct, total, seconds) {
  const progressData = {
    lessonId,
    correct,
    total,
    seconds,
    completedAt: Date.now(),
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0
  };
  
  localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(progressData));
  console.log('📊 レッスン進捗を保存:', progressData);
}

// セッション結果の一時保存（結果画面用）
function saveSessionResult(lessonId, correct, total, seconds) {
  const sessionData = {
    lessonId,
    correct,
    total,
    seconds,
    timestamp: Date.now()
  };
  
  sessionStorage.setItem('currentSessionResult', JSON.stringify(sessionData));
  console.log('💾 セッション結果を一時保存:', sessionData);
}

// セッション結果の取得
function getSessionResult() {
  try {
    const stored = sessionStorage.getItem('currentSessionResult');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ セッション結果の取得エラー:', error);
    return null;
  }
}

// セッション結果のクリア
function clearSessionResult() {
  sessionStorage.removeItem('currentSessionResult');
  console.log('🗑️ セッション結果をクリア');
}

// 年表示の更新
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

async function startup(){
  // 🎉 Stripe Checkout 結果をチェック（最初に実行）
  handleCheckoutResult();
  
  // 🎓 復習システムを初期化
  try {
    reviewSystem.initialize();
    console.log('✅ 復習システム初期化成功');
  } catch (error) {
    console.error('❌ 復習システム初期化エラー:', error);
    console.log('⚠️ 復習システムなしで続行します');
  }
  
  document.getElementById('btnLogin')?.addEventListener('click', loginMock);
  document.getElementById('btnLogout')?.addEventListener('click', logoutMock);
  
  // 🚀 グローバルイベント委譲を追加（②本格対応）
  setupGlobalEventDelegation();
  
  // 📌 教科タブのイベントリスナーを設定
  setupSubjectTabs();
  
  await loadCatalog();
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
  
  // 購入モーダルのセットアップ
  setupPurchaseModal();
  
  // 初期状態で購入ボタンを無効化（未ログイン状態）
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (purchaseBtn) {
    purchaseBtn.disabled = true;
    purchaseBtn.textContent = 'ログイン必要';
  }
  
  console.log('🔍 startup完了時の確認:', {
    'window.modalPurchasePack': typeof window.modalPurchasePack,
    'window.openPack': typeof window.openPack,
    'window.setCurrentGrade': typeof window.setCurrentGrade,
    'window.renderAppView': typeof window.renderAppView
  });
}

// 🚀 グローバルイベント委譲の設定（②本格対応）
function setupGlobalEventDelegation() {
  console.log('🚀 グローバルイベント委譲を設定中...');
  
  // document全体でのクリックイベントを監視（広めに拾う）
  document.addEventListener('click', (e) => {
    // data-action / data-act / class など広めに拾う
    const el = e.target.closest('[data-action],[data-act],.open-btn,button');
    if (!el) return;

    // 1) ボタンが form 内ならデフォルト submit を止める
    if (el.tagName === 'BUTTON' && el.closest('form')) e.preventDefault();

    // 2) action / reviewId を多段で取得
    let action = el.dataset.action || el.dataset.act || '';
    let reviewId = el.dataset.reviewId || el.dataset.reviewid || '';
    let packId = el.dataset.packId || el.dataset.pack || '';

    // 親カードに review-id が載っているケースもカバー
    if (!reviewId) {
      const card = el.closest('[data-review-id],[data-reviewid]');
      if (card) reviewId = card.dataset.reviewId || card.dataset.reviewid;
    }

    // テキストが「開く」「復習する」の場合は action 推定（フォールバック）
    if (!action && el.textContent) {
      const text = el.textContent.trim();
      if (text === '開く' || text === '復習する') action = 'open-review';
    }

    const grade = el.getAttribute('data-grade');
    const type = el.getAttribute('data-type');
    const subject = el.getAttribute('data-subject');
    
    console.log('🎯 イベント委譲でクリック検出:', { action, packId, reviewId, grade, type, subject });

    // 3) 復習レッスンを開く（最優先）
    if (action === 'open-review' && reviewId) {
      console.log('📂 復習レッスンを開く:', reviewId);
      reviewSystem.openReviewLesson(reviewId);
      return;
    }
    
    // 各アクションに応じて適切な関数を呼び出し
    switch (action) {
      case 'purchase':
        console.log('🛒 購入アクション実行:', packId);
        modalPurchasePack(packId);
        break;
      case 'open':
        console.log('📂 開放アクション実行:', packId);
        if (packId) openPack(packId);
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
        reviewSystem.getReviewSystemStatus();
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
        const lessonId = el.getAttribute('data-lesson-id');
        console.log('🔄 レッスン再挑戦アクション実行:', lessonId);
        if (lessonId) {
          setHash('lesson', lessonId);
        }
        break;
      case 'open-review':
        console.log('📝 復習レッスン開始アクション実行');
        if (reviewId) {
          console.log('🎯 復習レッスンを開く:', reviewId);
          reviewSystem.openReviewLesson(reviewId);
        }
        break;
      default:
        console.warn('⚠️ 未対応のアクション:', action);
    }
  });
  
  console.log('✅ グローバルイベント委譲設定完了');
}

// localStorage を定期的にチェックして未処理メッセージを処理
window.addEventListener('storage', (e) => {
  if (e.key === 'lessonCompleteMessage' && e.newValue) {
    console.log('📦 storage イベントでメッセージを受信');
    try {
      const data = JSON.parse(e.newValue);
      console.log('📦 受信データ:', data);
      
      if (data.type === 'lesson:complete') {
        const id = data.lessonId;
        const correct = data.detail?.correct ?? 0;
        const total = data.detail?.total ?? 0;
        const seconds = data.detail?.timeSec ?? 0;
        
        console.log('📦 storage経由で完了処理:', {id, correct, total, seconds});
        
        // 進捗を保存
        saveLessonProgress(id, correct, total, seconds);
        saveSessionResult(id, correct, total, seconds);
        
        // 結果画面に遷移
        setHash('result', id);
        
        // メッセージをクリア
        localStorage.removeItem('lessonCompleteMessage');
      }
    } catch (error) {
      console.error('❌ storage メッセージの処理エラー:', error);
    }
  }
});

// 復習システムは modules/reviewSystem.js で管理

// Firebase認証は firebaseConfig.js で初期化済み

// ログイン配線（submit / Google）
function setupLoginHandlers() {
  console.log('🔑 ログインハンドラーをセットアップ');
  
  // フォーム送信処理
  const loginForm = document.getElementById('login-form');
  console.log('🔍 ログインフォーム要素:', !!loginForm);
  
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 ログインフォーム送信イベント発火');
    
    const emailInput = document.querySelector('#login-email');
    const passInput = document.querySelector('#login-password');
    console.log('🔍 入力要素:', { email: !!emailInput, password: !!passInput });
    
    const email = emailInput?.value.trim();
    const pass = passInput?.value;
    console.log('🔍 入力値:', { email: email ? '***@***' : 'empty', password: pass ? '***' : 'empty' });
    
    if (!email || !pass) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      console.log('🔍 Firebase認証を待機中...');
      await waitForFirebaseAuth();
      
      const { auth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } = window.firebaseAuth;
      console.log('🔍 認証メソッド取得:', { 
        auth: !!auth, 
        setPersistence: !!setPersistence, 
        signInWithEmailAndPassword: !!signInWithEmailAndPassword 
      });
      
      console.log('🔍 認証処理開始...');
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, pass);
      console.log('✅ メール/パスワードログイン成功');
    } catch (e) {
      console.error('❌ ログインエラー:', e);
      alert('ログイン失敗：' + (e.code || e.message));
    }
  });
  
  // Googleログイン処理
  const googleLoginBtn = document.querySelector('[data-action="google-login"]');
  console.log('🔍 Googleログインボタン要素:', !!googleLoginBtn);
  
  googleLoginBtn?.addEventListener('click', async () => {
    console.log('🔍 Googleログイン開始');
    
    try {
      await waitForFirebaseAuth();
      console.log('🔍 window.firebaseAuth の内容:', Object.keys(window.firebaseAuth));
      
      const { auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } = window.firebaseAuth;
      console.log('🔍 取得した認証メソッド:', { 
        auth: !!auth, 
        GoogleAuthProvider: !!GoogleAuthProvider, 
        signInWithPopup: !!signInWithPopup, 
        signInWithRedirect: !!signInWithRedirect 
      });
      
      const provider = new GoogleAuthProvider();
      
      try {
        console.log('🔍 ポップアップログインを試行...');
        await signInWithPopup(auth, provider);
        console.log('✅ Googleログイン成功（ポップアップ）');
      } catch (e) {
        console.log('❌ ポップアップログインエラー:', e);
        const code = e?.code || '';
        if (['auth/internal-error', 'auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/operation-not-supported-in-this-environment'].includes(code)) {
          console.log('🔄 ポップアップ失敗、リダイレクトに切り替え');
          
          if (!signInWithRedirect) {
            console.error('❌ signInWithRedirect 関数が利用できません');
            throw new Error('リダイレクトログインがサポートされていません');
          }
          
          console.log('🔍 リダイレクトログインを実行...');
          await signInWithRedirect(auth, provider);
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error('❌ Googleログインエラー:', e);
      alert('Googleログイン失敗：' + (e.code || e.message));
    }
  });
}

// グローバル状態をwindowに公開
window.state = state;

// ===== 不足している関数を追加 =====

// 購入モーダル関連
function modalPurchasePack(packId) {
  console.log('🛒 購入モーダルを開く:', packId);
  // 購入モーダルの実装（簡略版）
  alert(`${packId} の購入機能は開発中です。`);
}

function openPack(packId) {
  console.log('📂 パックを開く:', packId);
  // パック開放の実装（簡略版）
  alert(`${packId} を開きます。`);
}

function renderAppView() {
  console.log('📱 アプリビューを描画');
  // アプリビューの描画（簡略版）
  renderHome();
}

// 教科タブのセットアップ
function setupSubjectTabs() {
  console.log('📌 教科タブのイベントリスナーを設定');
  
  const subjectTabs = document.querySelectorAll('.subject-tab');
  subjectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      console.log('📌 タブクリック:', tab.dataset.subject);
      
      // アクティブタブの切り替え
      subjectTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // currentSubjectを更新
      const subject = tab.dataset.subject || 'recommended';
      currentSubject = subject;
      
      // 教科イラストを更新
      updateSubjectHero(subject);
      
      // ホーム画面を再描画
      renderHome();
    });
  });
}

// 教科イラストの更新
function updateSubjectHero(subject) {
  console.log('🎨 教科イラストを更新:', subject);
  
  const heroImg = document.getElementById('subjectHero');
  const heroMessage = document.getElementById('subjectMessage');
  
  const heroData = {
    'recommended': {
      image: './images/hero/hero-main.png',
      message: '中学受験合格に向けて、理科・社会を徹底攻略！'
    },
    'sci': {
      image: './images/subjects/science.png',
      message: '実験と観察で理科を楽しく学ぼう！'
    },
    'soc': {
      image: './images/subjects/social.png',
      message: '歴史と地理で社会を深く理解しよう！'
    }
  };
  
  const data = heroData[subject] || heroData['recommended'];
  
  if (heroImg) {
    heroImg.src = data.image;
    heroImg.alt = `${subject} 学習イラスト`;
  }
  
  if (heroMessage) {
    heroMessage.textContent = data.message;
  }
}

// 教科選択
function selectSubject(subject) {
  console.log('📚 教科を選択:', subject);
  currentSubject = subject;
  updateSubjectHero(subject);
  renderHome();
}

// 購入モーダルのセットアップ
function setupPurchaseModal() {
  console.log('🛒 購入モーダルをセットアップ');
  
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (purchaseBtn) {
    purchaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      console.log('🛒 購入ボタンクリック - 認証状態:', state.user);
      console.log('🛒 購入ボタンクリック - ボタン状態:', {
        disabled: purchaseBtn.disabled,
        textContent: purchaseBtn.textContent
      });
      console.log('🛒 購入ボタンクリック - ユーザー情報:', {
        user: !!state.user,
        emailVerified: state.user?.emailVerified
      });
      console.log('🛒 購入ボタンクリック - window.state:', window.state);
      console.log('🛒 購入ボタンクリック - グローバル確認:', {
        hasState: !!window.state,
        hasUser: !!window.state?.user
      });
      
      if (!state.user) {
        alert('購入するにはログインが必要です。');
        return;
      }
      
      if (!state.user.emailVerified) {
        alert('購入するにはメールアドレスの確認が必要です。');
        return;
      }
      
      // 購入モーダルを開く
      openPurchaseModal();
    });
  }
}

function openPurchaseModal() {
  console.log('🛒 購入モーダルを開く');
  alert('購入モーダルは開発中です。');
}

function closePurchaseModal() {
  console.log('❌ 購入モーダルを閉じる');
}

function closePurchaseConfirmModal() {
  console.log('❌ 購入確認モーダルを閉じる');
}

function closePurchaseCompleteModal() {
  console.log('✅ 購入完了モーダルを閉じる');
}

function handleModalAuthRequired(type) {
  console.log('🔒 認証要求処理:', type);
  alert('ログインが必要です。');
}

function processPurchase(packId) {
  console.log('💳 購入処理:', packId);
  alert(`${packId} の購入処理は開発中です。`);
}

function showReviewSystemDebugInfo() {
  console.log('🔧 復習システムデバッグ情報を表示');
  reviewSystem.getReviewSystemStatus();
}

// クリック委譲（開くボタン／アンカー既定動作の抑止）
function setupClickDelegation() {
  console.log('🖱️ クリック委譲をセットアップ');
  
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action],[data-act],.open-btn,button,a');
    if (!el) return;
    
    const href = el.getAttribute && el.getAttribute('href');
    if ((el.tagName === 'BUTTON' && el.closest('form')) || 
        (el.tagName === 'A' && (!href || href === '#'))) {
      e.preventDefault();
    }

    let action = el.dataset.action || el.dataset.act || '';
    let reviewId = el.dataset.reviewId || el.dataset.reviewid || '';
    let packId = el.dataset.packId || el.dataset.pack;

    // 「開く」ボタンの場合は自動でopen-reviewアクションに
    if (!action && el.textContent?.trim() === '開く') {
      action = 'open-review';
    }
    
    // reviewIdを親要素から取得
    if (!reviewId) {
      const card = el.closest('[data-review-id],[data-reviewid]');
      if (card) reviewId = card.dataset.reviewId || card.dataset.reviewid;
    }

    console.log('🖱️ クリックイベント:', { 
      element: el.tagName, 
      id: el.id, 
      action, 
      reviewId, 
      packId,
      text: el.textContent?.trim()
    });

    if (action === 'open-review' && reviewId) {
      console.log('📖 復習レッスンを開く:', reviewId);
      if (window.openReviewLesson) {
        window.openReviewLesson(reviewId);
      } else if (reviewSystem?.openReviewLesson) {
        reviewSystem.openReviewLesson(reviewId);
      } else {
        console.error('❌ openReviewLesson 関数が見つかりません');
      }
      return;
    }
    
    if (action === 'open' && packId) {
      console.log('📦 パックを開く:', packId);
      if (window.openPack) {
        window.openPack(packId);
      } else {
        console.error('❌ openPack 関数が見つかりません');
      }
      return;
    }
    
    if (!action) {
      console.warn('⚠️ アクションが指定されていません:', el);
    }
  });
}

// 必要な関数をグローバルに公開
window.modalPurchasePack = modalPurchasePack;
window.openPack = openPack;
window.setCurrentGrade = setCurrentGrade;
window.renderAppView = renderAppView;
window.setupSubjectTabs = setupSubjectTabs;
window.updateSubjectHero = updateSubjectHero;
window.selectSubject = selectSubject;

// 復習システム関数は reviewSystem モジュールから自動的に公開される

// 初期化処理
async function initializeApp() {
  console.log('🚀 アプリケーション初期化開始');
  
  try {
    // Firebase認証の準備を待つ
    await waitForFirebaseAuth();
    
    // ログインハンドラーをセットアップ
    setupLoginHandlers();
    
    // クリック委譲をセットアップ
    setupClickDelegation();
    
    console.log('✅ アプリケーション初期化完了');
  } catch (error) {
    console.error('❌ アプリケーション初期化エラー:', error);
  }
}

// アプリ起動時に初期化実行
initializeApp();

console.log('✅ app.js 読み込み完了 - 最適化版');
