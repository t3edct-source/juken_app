// Firebase v10 CDN 版を利用
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// あなたのプロジェクト専用の firebaseConfig を貼る
const firebaseConfig = {
  apiKey: "AIzaSyD7WHlIcOz1dwvp3nWOpvJdd9prSomZThA",
  authDomain: "t3ed-a1f61.firebaseapp.com",
  projectId: "t3ed-a1f61",
  storageBucket: "t3ed-a1f61.firebasestorage.app",
  messagingSenderId: "831266462265",
  appId: "1:831266462265:web:116d109b511d76a4f7cbe8",
  measurementId: "G-NM2EHERB79"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase Auth の言語を日本語に設定
auth.languageCode = 'ja';
console.log('🇯🇵 Firebase Auth言語設定: 日本語');

// 認証ドメインの設定を確認
console.log('🔥 Firebase初期化完了:', {
  authDomain: firebaseConfig.authDomain,
  currentOrigin: window.location.origin,
  projectId: firebaseConfig.projectId,
  language: auth.languageCode
});

// 他ファイルから利用できるようエクスポート
export { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification, collection, doc, getDoc, getDocs, onSnapshot };

// 暫定的にFirestore関数もグローバル公開（ES Module読み込み問題の回避用）
window.firebaseConfig = {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot
};
