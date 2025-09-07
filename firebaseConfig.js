// Firebase v10 CDN 版を利用
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// あなたのプロジェクト専用の firebaseConfig を貼る
const firebaseConfig = {
  apiKey: "AIzaSyD7WHlICoZ1d...（正しいキー）",
  authDomain: "t3ed-af16f.firebaseapp.com",
  projectId: "t3ed-af16f",
  storageBucket: "t3ed-af16f.appspot.com",
  messagingSenderId: "83126646265",
  appId: "1:83126646265:web:116d169b511d76a4f7cbe8",
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 他ファイルから利用できるようエクスポート
export { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut };
