// Firebase v10 CDN 版を利用
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// 他ファイルから利用できるようエクスポート
export { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification };
