# ステップナビ アプリケーション仕様書

## 📋 アプリケーション概要

**アプリ名**: ステップナビ  
**提供元**: T3エデュケーション  
**対象**: 小4・小5・小6向け 学校準拠＋中学受験 理科・社会 学習アプリ  
**技術スタック**: 
- フロントエンド: HTML5, CSS3, JavaScript (ES6+)
- バックエンド: Netlify Functions
- 認証・データベース: Firebase Authentication, Firestore
- 決済: Stripe Checkout
- PWA: Service Worker対応

---

## 🏗️ アーキテクチャ

### ファイル構成

```
juken/
├── index.html              # メインHTMLファイル
├── app.js                   # メインアプリケーションロジック（約8000行）
├── styles.css               # スタイルシート
├── sw.js                    # Service Worker（PWA用）
├── manifest.json            # PWAマニフェスト
├── catalog.json             # レッスンカタログ（全レッスンのメタデータ）
├── firebaseconfig.js        # Firebase設定
├── package.json             # 依存関係
├── netlify.toml             # Netlify設定
├── netlify/
│   └── functions/
│       ├── create-checkout-session.js  # Stripe決済セッション作成
│       └── stripe-webhook.js          # Stripe Webhook処理
├── data/
│   └── encouragement-messages.json   # 励ましメッセージデータ
├── images/
│   ├── hero/                # ヒーロー画像
│   ├── subjects/            # 教科アイコン
│   └── character/           # キャラクター画像
└── lessons/
    ├── sci/                 # 理科レッスン
    │   ├── biology/         # 生物
    │   ├── chemistry/       # 化学
    │   ├── physics/         # 物理
    │   ├── earth/           # 地学
    │   └── comprehensive/   # 総合問題
    └── soc/                 # 社会レッスン
        └── modular/         # モジュール形式
            ├── wakaru/      # わかる編
            └── oboeru/      # おぼえる編
```

---

## 🔐 認証システム

### Firebase Authentication

**実装方法**:
- Firebase Authenticationを使用
- 対応ログイン方法:
  - Googleアカウント（`signInWithPopup`）
  - メール/パスワード（`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`）
- メール確認機能あり（`sendEmailVerification`）

**状態管理**:
- `state.user`: 現在のユーザー情報
  - `uid` / `id`: ユーザーID
  - `email`: メールアドレス
  - `displayName`: 表示名
  - `emailVerified`: メール確認状態
  - `providerData`: ログインプロバイダー情報

**認証状態の監視**:
- `onAuthStateChanged`で認証状態を監視
- `syncFirebaseAuth(user)`関数でアプリ状態を同期
- ログイン/ログアウト時にUIを自動更新

---

## 💳 購入システム

### Stripe Checkout統合

**パック構成**:
- 小4理科、小4社会
- 小5理科、小5社会
- 小6理科、小6社会
- 各パック: 2,980円

**購入フロー**:
1. ユーザーが「購入」ボタンをクリック
2. ログイン状態を確認（未ログインの場合はログイン要求）
3. メール確認状態をチェック（メール/パスワードログインの場合）
4. Netlify Function (`create-checkout-session`) を呼び出し
5. Stripe Checkoutセッションを作成
6. Stripe Checkoutページにリダイレクト
7. 決済完了後、Webhook (`stripe-webhook`) でFirestoreにentitlementを保存
8. 購入完了画面を表示

**Entitlements管理**:
- Firestore: `users/{userId}/entitlements/{productId}`
- `state.userEntitlements`: Set形式でメモリに保持
- リアルタイム監視: `onSnapshot`で変更を検知
- ローカルフォールバック: `localStorage`の`purchases`キー

**アクセス制御**:
- `hasEntitlement(sku)`: パックIDまたはproductIdでentitlementをチェック
- 未購入コンテンツは「🔒 購入が必要」バッジを表示

---

## 📚 学習システム

### レッスン構造

**カタログ形式**: `catalog.json`
- 各レッスンは以下の情報を持つ:
  ```json
  {
    "id": "sci.physics.motion",
    "grade": 6,
    "subject": "sci",
    "title": "物体の運動とてこ",
    "duration_min": 15,
    "sku_required": null,
    "path": "lessons/sci/physics/motion/output.html",
    "format": "html",
    "tags": ["物理", "運動", "てこ"]
  }
  ```

**教科分類**:
- `sci`: 理科わかる編
- `science_drill`: 理科おぼえる編
- `soc`: 社会わかる編
- `social_drill`: 社会おぼえる編

**学年分類**:
- `grade`: 4, 5, 6

**理科の分類**:
- 小4: 基礎現象 × 自然観察
- 小5: 実験・数値・計測
- 小6: 発展分野（発展・総合に分かれる）

### レッスン表示

**タブ構成**:
- ⭐ おすすめ学習
- 🔬 理科わかる
- 🧪 理科おぼえる
- 🌍 社会わかる
- 📍 社会おぼえる

**表示モード**:
1. **通常表示**: グリッド形式でレッスンカードを表示
2. **単元別表示**: 社会おぼえる編、理科（全学年）は単元別にグループ化
   - 左側: 単元一覧（アイコン付き）
   - 右側: 選択された単元のレッスン一覧
   - モバイル: 単元一覧はアイコン帯に縮約

**レッスンカード**:
- タイトル、アイコン、進捗バー、完了バッジ
- 完了済みレッスンはグレースケール表示
- 未購入レッスンは「🔒 購入が必要」バッジ

**おすすめ学習**:
- 復習レッスン（現在は無効化）
- 各教科から1つずつ推薦
- わかる編→おぼえる編の順で処理
- 最後に学習したレッスンの次を推薦

### レッスン実行

**レッスン読み込み**:
- `iframe`でレッスンHTMLを読み込み
- または直接DOMにレンダリング

**進捗保存**:
- レッスン完了時に`saveLessonProgress(id, correct, total, seconds)`を呼び出し
- `localStorage`に`progress:{lessonId}`として保存
- データ形式:
  ```json
  {
    "lessonId": "sci.physics.motion",
    "score": 0.9,
    "detail": {
      "correct": 9,
      "total": 10,
      "timeSec": 720
    },
    "at": 1705123456789
  }
  ```

**完了判定**:
- `isLessonCompleted(lessonId)`: `detail.correct > 0`で判定

---

## 📊 進捗管理システム

### データ保存

**localStorageキー**:
- `progress:{lessonId}`: 各レッスンの進捗
- `learningHistory_{mode}`: 学習履歴（wakaru/oboeru）
- `learningStreak`: 連続学習日数
- `unlockedThemes`: アンロック済みテーマ
- `currentTheme`: 現在のテーマ
- `purchases`: 購入情報（ローカルフォールバック）
- `currentGrade`: 現在の学年

**進捗データ構造**:
```javascript
{
  lessonId: string,
  score: number,        // 0.0 - 1.0
  detail: {
    correct: number,    // 正答数
    total: number,      // 総問題数
    timeSec: number     // 学習時間（秒）
  },
  at: number            // タイムスタンプ
}
```

### 進捗表示

**レッスンカード**:
- 進捗バーで完了率を表示
- 完了済みはチェックマーク表示

**単元別表示**:
- 各単元の完了レッスン数/総レッスン数
- 進捗パーセンテージ
- プログレスバー

---

## 🔥 連続学習日数・レベルシステム

### 連続学習日数の管理

**データ保存**:
- `localStorage`の`learningStreak`キー
- データ形式:
  ```json
  {
    "days": 7,
    "lastDate": "2025-01-15"
  }
  ```

**更新ロジック** (`updateStreakDays()`):
1. 今日の日付を取得（YYYY-MM-DD形式）
2. 前回の学習日と比較
3. 昨日学習していた場合: 連続日数を+1
4. 連続が途切れた場合: リセットして1日から
5. レベルアップをチェック
6. テーマをアンロック

**レベル定義**:
```javascript
const LEVEL_DEFINITIONS = [
  { days: 0, level: 1, theme: 'default' },
  { days: 3, level: 2, theme: 'spring' },
  { days: 7, level: 3, theme: 'summer' },
  { days: 14, level: 4, theme: 'autumn' },
  { days: 30, level: 5, theme: 'winter' },
  { days: 60, level: 6, theme: 'night' },
  { days: 100, level: 7, theme: 'starry' }
];
```

**レベル計算**:
- `getLevelFromDays(days)`: 連続日数からレベルを計算
- `getStreakInfo()`: 現在の連続日数とレベルを取得

---

## 🎨 背景テーマシステム

### テーマ定義

**テーマ一覧**:
```javascript
const THEME_DEFINITIONS = [
  { id: 'default', name: 'デフォルト', icon: '🌻', requiredLevel: 1 },
  { id: 'spring', name: '春', icon: '🌸', requiredLevel: 2 },
  { id: 'summer', name: '夏', icon: '☀️', requiredLevel: 3 },
  { id: 'autumn', name: '秋', icon: '🍂', requiredLevel: 4 },
  { id: 'winter', name: '冬', icon: '❄️', requiredLevel: 5 },
  { id: 'night', name: '夜', icon: '🌙', requiredLevel: 6 },
  { id: 'starry', name: '星空', icon: '⭐', requiredLevel: 7 }
];
```

**アンロックシステム**:
- レベルアップ時に自動でテーマをアンロック
- `unlockThemeForLevel(level)`: レベルに応じたテーマをアンロック
- `localStorage`の`unlockedThemes`に保存

**テーマ適用**:
- `applyCurrentTheme()`: 現在のテーマを適用
- `body`要素に`theme-{themeId}`クラスを追加
- 背景装飾要素にもクラスを適用

**テーマ選択UI**:
- モーダル形式で表示
- アンロック済みテーマは選択可能
- 未アンロックテーマはグレーアウト
- 現在のテーマは強調表示

---

## 📊 学習統計ページ

### 表示内容

**総合統計**:
- 総学習時間（秒単位、フォーマット表示）
- 完了レッスン数（完了/全体）
- 平均正答率（%）
- 連続学習日数とレベル

**教科別統計**:
- 理科わかる編、理科おぼえる編
- 社会わかる編、社会おぼえる編
- 各教科の完了数、進捗率、平均正答率、学習時間
- プログレスバーで進捗を可視化

**学年別統計**:
- 小4、小5、小6
- 各学年の完了数と平均正答率

**最近の学習履歴**:
- 直近10件の学習記録
- レッスン名、日時、正答率、問題数、学習時間

### UI特徴

**アニメーション**:
- 数値のカウントアップアニメーション
- パーセンテージのカウントアップ
- プログレスバーのスムーズな伸び
- カードの順次フェードイン

**達成度に応じた色とメッセージ**:
- 80%以上: 緑「完璧です！🎉」⭐⭐⭐⭐⭐
- 60-80%: オレンジ「順調です！✨」⭐⭐⭐⭐
- 30-60%: 黄色「頑張っています！💪」⭐⭐⭐
- 30%未満: グレー「これからです！🎯」⭐

**励ましメッセージと次の目標**:
- 総合進捗に応じたメッセージ表示
- 次の目標の提示（例：「あと5レッスンで50%達成！」）
- 連続学習目標の表示

---

## 🔥 連続学習記録ページ

### 表示内容

**メインヘッダー**:
- 大きな連続日数表示（アニメーション付き）
- 達成度に応じた色とメッセージ
- レベルとスター評価

**次のレベルまでの進捗**:
- 次のレベルまでの残り日数
- プログレスバーで進捗を可視化
- 達成率のパーセンテージ
- 最高レベル達成時の特別表示

**学習カレンダー（過去30日間）**:
- 7列×約4週間のカレンダー表示
- 学習日は緑色で表示
- 今日はオレンジ色で強調
- ホバーで拡大
- 実際の学習履歴を反映

**アンロック済みテーマ**:
- 全テーマを一覧表示
- アンロック済み/未アンロックを色分け
- 現在使用中のテーマを強調表示
- 未アンロックテーマには必要なレベルを表示

**モチベーションメッセージ**:
- 連続日数に応じたメッセージ
  - 0日: 「今日から始めましょう！🚀」
  - 3日: 「3日連続！習慣がついてきました！💪」
  - 7日: 「1週間達成！素晴らしい継続力です！✨」
  - 14日: 「2週間達成！学習が習慣になっています！🎉」
  - 30日: 「1ヶ月達成！本当に素晴らしいです！👑」
  - 60日: 「2ヶ月達成！あなたは学習の達人です！🔥」
  - 100日: 「100日達成！伝説的な継続力です！💎」

### UI特徴

- アニメーション効果（カウントアップ、プログレスバー）
- カラフルなグラデーション背景
- インタラクティブなカレンダー

---

## 👤 アカウント情報ページ

### 表示内容（ログイン時のみ表示）

**ユーザー情報カード**:
- ユーザー名（表示名またはメールアドレス）
- メールアドレス
- メール確認状態（確認済み/未確認）
- アバター（名前の頭文字を円形アイコンで表示）

**学習サマリー**:
- 連続学習日数
- 現在のレベル
- アンロック済みテーマ数

**購入済みコンテンツ**:
- 購入済みパックの一覧表示
- 各パックのラベルとステータス
- 購入済みコンテンツがない場合のメッセージ

**アカウント設定**:
- アカウントID（Firebase UID）
- ログイン方法（Googleアカウント/メール・パスワード）
- 将来の拡張機能への案内

---

## 💾 データエクスポート/インポート機能

### エクスポート機能

**保存対象データ**:
- `progress:*`: 全レッスンの進捗データ
- `learningHistory_*`: 学習履歴
- `checkpoint:*`: チェックポイント
- `learningStreak`: 連続学習日数
- `unlockedThemes`: アンロック済みテーマ
- `currentTheme`: 現在のテーマ
- `purchases`: 購入情報
- `currentGrade`: 現在の学年

**除外データ**:
- `lessonCompleteMessage`: 一時メッセージ
- `questionAnswers`: 一時回答データ
- 移行フラグなど

**エクスポート方法**:
1. ファイルとして自動ダウンロード（推奨）
2. クリップボードにもコピー（同じ端末内での一時保存用）

**ファイル形式**:
- JSON形式
- ファイル名: `学習データ_YYYY-MM-DDTHH-mm-ss.json`
- メタデータを含む:
  ```json
  {
    "version": "1.0",
    "exportDate": "2025-01-15T10:30:00.000Z",
    "data": { ... }
  }
  ```

### インポート機能

**読み込み方法**:
1. ファイルを選択（推奨：別端末から移す場合）
2. クリップボードから貼り付け（同じ端末内の場合）

**処理フロー**:
1. 現在のデータをバックアップ提案
2. データ形式の検証（JSON）
3. バージョンチェック
4. データ内容の確認ダイアログ
5. localStorageにインポート
6. UIを自動更新

**エラーハンドリング**:
- 不正なJSON形式の検出
- データサイズ制限の警告
- 部分的なインポート失敗の通知

---

## 🎨 UI/UXシステム

### メニューシステム

**メニューボタン**:
- ヘッダー右端に「☰ メニュー」ボタン
- クリックでサイドパネルを表示

**メニュー項目**:
1. 📊 学習統計
2. 🔥 連続学習記録
3. 🎨 背景テーマ
4. 💾 学習データを保存
5. 📥 学習データを読み込み
6. 👤 アカウント情報（ログイン時のみ）
7. 📱 アプリに追加（PWAインストール可能時のみ）
8. ❓ ヘルプ（準備中）

**メニューパネル**:
- 右側からスライドイン
- 背景オーバーレイ
- エスケープキーまたは背景クリックで閉じる

### 励ましメッセージシステム

**データ管理**:
- `data/encouragement-messages.json`から読み込み
- フォールバック: `getDefaultEncouragementData()`

**メッセージタイプ**:
1. **日付対応メッセージ** (`dailyMessages`):
   - 特定の日付に表示されるメッセージ
   - 例: 1月1日「🎍 新年あけましておめでとうございます！」
2. **ランダムメッセージ** (`randomMessages`):
   - ランダムに選択されるメッセージ

**キャラクター画像**:
- 各メッセージに対応するキャラクター画像を指定
- `images/character/`ディレクトリに配置
- 画像読み込み失敗時は🎓絵文字でフォールバック

**表示場所**:
- おすすめタブ選択時、ヒーロー画像エリア内に表示
- マンガ風の吹き出しスタイル
- キャラクター画像とメッセージを組み合わせて表示

### レスポンシブデザイン

**ブレークポイント**:
- モバイル: `max-width: 768px`
- デスクトップ: `min-width: 769px`

**モバイル対応**:
- 単元一覧をアイコン帯に縮約
- タブ名を短縮表示（例：「小4理科：基礎現象 × 自然観察」→「小4」）
- カードを縦に並べる
- メニューパネルを全画面表示

---

## 📱 PWA機能

### Service Worker

**ファイル**: `sw.js`

**機能**:
- オフライン対応（キャッシュ戦略）
- アセットのキャッシュ
- Firebase予約パス（`/__/`）は素通し
- キャッシュ更新の管理

**キャッシュ戦略**:
- GETリクエストのみキャッシュ
- キャッシュ優先、ネットワークフォールバック
- 動的なキャッシュ更新

### マニフェスト

**ファイル**: `manifest.json`

**設定**:
- アプリ名: 「ステップナビ」
- 表示モード: `standalone`
- 背景色: `#f8fafc`
- テーマ色: `#2563eb`
- アイコン: `favicon.png` (192x192)

**インストール**:
- ブラウザが自動検出
- 「アプリに追加」ボタンでインストール可能
- メニューからもアクセス可能

---

## 🎯 データフロー

### レッスン完了時の処理

1. レッスン内で`lesson:complete`メッセージを送信
2. `registerProgressAPI()`でメッセージを受信
3. `saveLessonProgress(id, correct, total, seconds)`を呼び出し
4. `saveProgress(lessonId, score, detail)`でlocalStorageに保存
5. `updateStreakDays()`で連続学習日数を更新
6. レベルアップチェックとテーマアンロック
7. UIを更新（`renderHome()`）

### 認証状態の同期

1. Firebase `onAuthStateChanged`で認証状態を監視
2. `syncFirebaseAuth(user)`を呼び出し
3. `state.user`を更新
4. `loadUserEntitlements(userId)`でentitlementsを読み込み
5. `startEntitlementsListener(userId)`でリアルタイム監視を開始
6. UIを更新（ヘッダーボタン、購入ボタン、メニュー）

---

## 🔧 主要な関数・クラス

### 認証関連
- `syncFirebaseAuth(user)`: 認証状態をアプリに同期
- `updateHeaderButtons(user)`: ヘッダーボタンの表示制御
- `updateAccountMenuButton()`: アカウント情報メニューボタンの表示制御

### 進捗管理
- `saveLessonProgress(id, correct, total, seconds)`: レッスン進捗を保存
- `getLessonProgress(lessonId)`: レッスン進捗を取得
- `isLessonCompleted(lessonId)`: レッスン完了判定
- `saveLearningHistory(lessonId, mode, sessionData)`: 学習履歴を保存

### 連続学習
- `updateStreakDays()`: 連続学習日数を更新
- `getStreakInfo()`: 連続学習情報を取得
- `getLevelFromDays(days)`: 日数からレベルを計算
- `unlockThemeForLevel(level)`: レベルに応じてテーマをアンロック

### テーマ管理
- `initThemeSystem()`: テーマシステムの初期化
- `openThemeModal()`: テーマ選択モーダルを開く
- `selectTheme(themeId)`: テーマを選択
- `applyCurrentTheme()`: 現在のテーマを適用

### 統計・記録
- `collectLearningStats()`: 学習統計データを収集
- `showStatsModal()`: 学習統計モーダルを表示
- `getStreakDetails()`: 連続学習記録の詳細データを取得
- `showStreakModal()`: 連続学習記録モーダルを表示
- `showAccountModal()`: アカウント情報モーダルを表示

### データ管理
- `exportLearningData()`: 学習データをエクスポート
- `importLearningData()`: 学習データをインポート
- `collectExportData()`: エクスポート対象データを収集

### UI表示
- `renderHome()`: ホーム画面を描画
- `renderSubjectUnits(units, subjectName)`: 単元別表示
- `renderUnits(units)`: 単元一覧を描画
- `selectUnit(unitId)`: 単元を選択
- `getRecommendedLessons()`: おすすめレッスンを取得

### 購入関連
- `hasEntitlement(sku)`: entitlementをチェック
- `loadUserEntitlements(userId)`: ユーザーのentitlementsを読み込み
- `startEntitlementsListener(userId)`: entitlementsをリアルタイム監視
- `startPurchase(productId, packLabel)`: 購入処理を開始

---

## 📐 データ構造

### state オブジェクト

```javascript
const state = {
  user: null,                    // 現在のユーザー情報
  catalog: [],                   // レッスンカタログ
  current: null,                 // 現在のレッスン
  selectedGrade: null,            // 選択された学年
  selectedSubject: null,          // 選択された教科
  userEntitlements: new Set(),   // 購入済みコンテンツ（Set形式）
  wrongQuestions: []             // 間違えた問題の記録（現在は無効化）
};
```

### レッスンカタログ構造

```json
{
  "id": "sci.physics.motion",
  "grade": 6,
  "subject": "sci",
  "title": "物体の運動とてこ",
  "duration_min": 15,
  "sku_required": null,
  "path": "lessons/sci/physics/motion/output.html",
  "format": "html",
  "tags": ["物理", "運動", "てこ"]
}
```

### 進捗データ構造

```json
{
  "lessonId": "sci.physics.motion",
  "score": 0.9,
  "detail": {
    "correct": 9,
    "total": 10,
    "timeSec": 720
  },
  "at": 1705123456789
}
```

### 連続学習データ構造

```json
{
  "days": 7,
  "lastDate": "2025-01-15"
}
```

---

## 🎨 スタイリング

### CSSフレームワーク
- Tailwind CSS（CDN経由）

### 主要なスタイルクラス
- `.card`: レッスンカードの基本スタイル
- `.card.completed`: 完了済みレッスンのスタイル
- `.badge`: バッジスタイル（lock, open, complete, recommend）
- `.progress-bar`: 進捗バー
- `.theme-{themeId}`: 背景テーマクラス
- `.stats-section`: 統計セクション（フェードインアニメーション）

### アニメーション
- `@keyframes fadeInUp`: フェードイン＋上方向移動
- `@keyframes pulse`: パルスアニメーション（連続学習アイコン用）

---

## 🔄 イベント処理

### グローバルイベント委譲
- `setupGlobalEventDelegation()`: ドキュメント全体でのイベント監視
- `data-action`属性でアクションを指定
- クリックイベントを一元管理

### メニューアクション
- `handleMenuAction(action)`: メニュー項目のクリックを処理
- 各アクションに応じて適切な関数を呼び出し

---

## 📦 外部サービス統合

### Firebase
- **Authentication**: ユーザー認証
- **Firestore**: Entitlements管理
- **設定**: `firebaseconfig.js`から読み込み

### Stripe
- **Checkout**: 決済処理
- **Webhook**: 決済完了後の処理
- **Netlify Functions**: サーバーサイド処理

### Netlify
- **Functions**: サーバーレス関数
- **デプロイ**: 自動デプロイ対応

---

## 🚀 初期化フロー

1. `DOMContentLoaded`イベントで開始
2. Firebase認証状態の監視を設定
3. `syncFirebaseAuth`関数をグローバルに公開
4. グローバルイベント委譲を設定
5. `startup()`関数を実行:
   - カタログを読み込み
   - 学年を設定
   - アプリビューを描画
   - テーマシステムを初期化
   - メニューシステムを初期化
   - 励ましメッセージデータを読み込み
6. 初期化時のログイン状態を確認

---

## 🎯 主要な機能一覧

### 実装済み機能
1. ✅ Firebase認証（Google/メール・パスワード）
2. ✅ Stripe決済統合
3. ✅ Entitlements管理（Firestore）
4. ✅ レッスン表示（通常/単元別）
5. ✅ 進捗管理（localStorage）
6. ✅ 連続学習日数・レベルシステム
7. ✅ 背景テーマシステム
8. ✅ 学習統計ページ（アニメーション付き）
9. ✅ 連続学習記録ページ（カレンダー付き）
10. ✅ データエクスポート/インポート
11. ✅ アカウント情報ページ
12. ✅ メニューシステム
13. ✅ 励ましメッセージシステム
14. ✅ PWA機能（Service Worker）
15. ✅ レスポンシブデザイン

### 準備中機能
- ⚠️ ヘルプ機能

---

## 📝 技術的な詳細

### ブラウザ対応
- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- Service Worker対応
- localStorage対応
- Clipboard API対応（エクスポート/インポート）

### パフォーマンス
- レッスンカタログの遅延読み込み
- 画像の最適化
- Service Workerによるキャッシュ
- イベント委譲による効率的なイベント処理

### セキュリティ
- Firebase Authenticationによる認証
- Firestoreのセキュリティルール
- Stripeによる安全な決済処理
- メール確認によるアカウント保護

---

## 🔍 デバッグ・開発用機能

### 開発用関数
- `testProgressSystem()`: 進捗システムのテスト
- `clearAllDevelopmentData()`: 開発データのクリア
- グローバル関数の公開（`window.saveLessonProgress`など）

### ログ出力
- コンソールに詳細なログを出力
- エラー時の適切なエラーハンドリング

---

## 📚 レッスン構造

### 理科レッスン
- **生物**: 植物、動物、人体など
- **化学**: 水溶液、状態変化など
- **物理**: 電気、運動、てこなど
- **地学**: 天気、地層、星座など
- **総合**: 複合的な問題

### 社会レッスン
- **歴史**: 各時代の学習
- **地理**: 都道府県、地域学習
- **公民**: 憲法、政治など

### レッスンファイル形式
- HTML形式（`output.html`）
- iframeで読み込み
- または直接DOMにレンダリング

---

## 🎨 UIコンポーネント

### カラーパレット
- 青系: 学習時間、アカウント情報
- 緑系: 完了、学習日
- 紫系: 正答率、モチベーション
- オレンジ系: 連続学習、警告
- 黄色系: 進行中、注意

### アイコン
- 絵文字を多用（📊、🔥、🎨、💾など）
- 視覚的な分かりやすさを重視

---

## 📱 モバイル最適化

### 表示最適化
- タブ名の短縮表示
- 単元一覧のアイコン帯表示
- カードの縦並び
- メニューパネルの全画面表示

### 操作性
- タッチフレンドリーなボタンサイズ
- スワイプ操作への対応（将来拡張可能）

---

この仕様書は、アプリケーションの全機能を網羅的にまとめたものです。ChatGPTに渡す際は、このファイルをそのまま使用できます。

