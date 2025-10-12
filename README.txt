=== システムバックアップ ===
作成日時: 2025-09-27 15:25:21
作成理由: 復習レッスン自動生成機能の実装前バックアップ

=== バックアップ内容 ===
- app.js (メインアプリケーション)
- catalog.json (レッスンカタログ)
- index.html (メインページ)
- firebaseConfig.js (Firebase設定)
- styles.css (スタイルシート)
- netlify/ (Netlify Functions)
- deploy/ (デプロイ用ファイル)

=== 現在の状態 ===
- 社会おぼえる編: 34レッスン (歴史12, 地理16, 公民6)
- 社会わかる編: 36レッスン (歴史12, 地理18, 公民6)
- 歴史分野: わかる編とおぼえる編が1:1対応 (12レッスンずつ)
- 認証システム: Firebase Auth + Firestore entitlements
- 購入システム: Stripe Checkout統合済み

=== 復元方法 ===
問題が発生した場合:
1. このディレクトリから元のファイルをコピー
2. deploy/catalog.json も忘れずに復元
3. Netlify Functionsの再デプロイが必要な場合あり
