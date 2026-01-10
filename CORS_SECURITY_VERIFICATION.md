# CORS設定のセキュリティ検証レポート

**日付**: 2025-01-27  
**対象ファイル**: `netlify/functions/create-checkout-session.js`  
**検証内容**: CORS設定によるセキュリティリスク

## 現状の実装

### 現在のコード

```javascript
exports.handler = async (event) => {
  // CORSヘッダーを追加
  const headers = {
    'Access-Control-Allow-Origin': '*',  // ← すべてのオリジンからアクセス可能
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  // ...
};
```

### フロントエンドからの呼び出し方法

```javascript
// app.js (line 750)
const response = await fetch("/.netlify/functions/create-checkout-session", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({
    productId: productId,
    uid: user.uid,
    // ...
  }),
});
```

## 指摘された問題点

### 🔴 セキュリティリスク

1. **任意のオリジンからのアクセス許可**
   - `Access-Control-Allow-Origin: '*'` により、すべてのドメインからこの関数を呼び出せる
   - 悪意のあるサイトからもアクセス可能

2. **潜在的な悪用シナリオ**
   - 第三者サイトが任意の `uid` を指定してリクエストを送信可能
   - 例: `https://malicious-site.com` から以下のようなリクエストを送信
     ```javascript
     fetch('https://your-site.netlify.app/.netlify/functions/create-checkout-session', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         productId: 'shakai_gakushu_5',
         uid: 'victim-user-id'  // 他人のUIDを指定
       })
     })
     ```
   - 結果: 他人のUIDで購入ページ（Stripe Checkout）を生成できる
   - **注意**: 決済自体は本人のカードが必要だが、不適切な導線を作成できる

3. **CSRF（Cross-Site Request Forgery）のリスク**
   - 悪意のあるサイトが、ユーザーがログインしている状態でリクエストを送信可能
   - ユーザーが気づかないうちに購入ページが生成される可能性

## 検証結果

### ✅ 技術的な観点

1. **同一オリジンからの呼び出し**
   - フロントエンドは相対パス `/.netlify/functions/create-checkout-session` を使用
   - これは同一オリジンからの呼び出しなので、**CORSは技術的には不要**

2. **現在の実装での動作**
   - 同一オリジンからの呼び出しは正常に動作
   - しかし、CORS設定により外部からのアクセスも可能になっている

### ⚠️ セキュリティリスクの評価

**リスクレベル**: 🟡 **中程度**

- **即座の危険性**: 低
  - 決済自体は本人のカードが必要
  - 実際の金銭被害は発生しにくい
- **潜在的な問題**: 中
  - 不適切な導線の作成が可能
  - ユーザー体験の悪化
  - ブランドイメージへの影響

## 推奨される対策

### 対策1: オリジン検証（推奨）

許可するオリジンを明示的に指定する：

```javascript
exports.handler = async (event) => {
  // 許可するオリジンのリスト
  const allowedOrigins = [
    'https://your-site.netlify.app',
    'https://www.your-site.netlify.app',
    // 開発環境用（必要に応じて）
    'http://localhost:8888',
    'http://127.0.0.1:8888',
  ];
  
  // リクエストのオリジンを取得
  const origin = event.headers.origin || event.headers.Origin || '';
  
  // オリジンの検証
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',  // 必要に応じて
  };
  
  // OPTIONSリクエスト（プリフライト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }
  
  // オリジンが許可されていない場合
  if (!isAllowedOrigin && origin) {
    console.warn('⚠️ 許可されていないオリジンからのアクセス:', origin);
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Origin not allowed' }),
    };
  }
  
  // 以降の処理は同じ
  // ...
};
```

### 対策2: CORSを完全に削除（最も安全）

同一オリジンからのみアクセスする場合、CORSヘッダーを削除：

```javascript
exports.handler = async (event) => {
  // CORSヘッダーを削除（同一オリジンのみ許可）
  // const headers = { ... };  // 削除
  
  // OPTIONSリクエストへの対応も不要
  // if (event.httpMethod === 'OPTIONS') { ... }  // 削除
  
  // 以降の処理
  // ...
  
  return {
    statusCode: 200,
    // headers,  // 削除
    body: JSON.stringify({ url: session.url }),
  };
};
```

**注意**: この場合、フロントエンドが必ず同一オリジンから呼び出す必要があります。

### 対策3: 環境変数による設定（柔軟性重視）

環境変数で許可オリジンを設定：

```javascript
exports.handler = async (event) => {
  // 環境変数から許可オリジンを取得
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://your-site.netlify.app'];
  
  const origin = event.headers.origin || event.headers.Origin || '';
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin; // 同一オリジンは常に許可
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || allowedOrigins[0]) : '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  
  // 以降の処理
  // ...
};
```

## 実装の推奨順位

### 優先度: 高

1. **対策1: オリジン検証**（推奨）
   - セキュリティを向上させつつ、柔軟性も維持
   - 開発環境と本番環境の両方に対応可能

2. **対策2: CORS削除**（最も安全）
   - 同一オリジンからのみアクセスする場合に最適
   - シンプルで安全

3. **対策3: 環境変数設定**（柔軟性重視）
   - 複数の環境で異なる設定が必要な場合に適している

## 追加のセキュリティ対策

### 1. リファラー検証（オプション）

```javascript
const referer = event.headers.referer || event.headers.Referer || '';
const allowedReferers = [
  'https://your-site.netlify.app',
  'https://www.your-site.netlify.app',
];

if (referer && !allowedReferers.some(allowed => referer.startsWith(allowed))) {
  console.warn('⚠️ 許可されていないリファラー:', referer);
  return {
    statusCode: 403,
    body: JSON.stringify({ error: 'Referer not allowed' }),
  };
}
```

**注意**: リファラーヘッダーは偽造可能なため、補助的な検証として使用。

### 2. 認証トークンの検証（推奨）

Firebase認証トークンを検証：

```javascript
// Firebase Admin SDKを使用してトークンを検証
const authToken = event.headers.authorization?.replace('Bearer ', '');
if (authToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    // uid がトークンと一致することを確認
    if (decodedToken.uid !== uid) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid user' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}
```

## テスト方法

### 1. 同一オリジンからのアクセステスト

```javascript
// ブラウザのコンソールで実行（同一オリジン）
fetch('/.netlify/functions/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'shakai_gakushu_5',
    uid: 'test-uid'
  })
})
.then(r => r.json())
.then(console.log);
```

### 2. 外部オリジンからのアクセステスト

```javascript
// 別のサイト（例: https://example.com）から実行
fetch('https://your-site.netlify.app/.netlify/functions/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'shakai_gakushu_5',
    uid: 'test-uid'
  })
})
.then(r => r.json())
.then(console.log);
```

**期待される動作**:
- 対策1実装後: 403エラーが返される
- 対策2実装後: CORSエラーが発生（ブラウザがブロック）

## 結論

### 現状評価

- **セキュリティリスク**: 🟡 **中程度**
- **即座の対応**: 不要（決済自体は保護されている）
- **推奨される対応**: オリジン検証の実装（優先度: 高）

### 推奨アクション

1. **即座の対応**: オリジン検証の実装（対策1）
2. **将来的な改善**: 認証トークンの検証を追加
3. **監視**: 不正なアクセスのログを監視

### 実装の優先順位

- **高**: オリジン検証の実装
- **中**: 認証トークンの検証
- **低**: リファラー検証（補助的）

## 実装手順

### ステップ1: 現在のドメインの確認

1. Netlify ダッシュボードでサイトのURLを確認
2. カスタムドメインがある場合はそれも確認
3. 開発環境のURLも確認（localhost:8888 など）

### ステップ2: 環境変数の設定（推奨）

Netlify ダッシュボードで環境変数を設定：

```
ALLOWED_ORIGINS=https://your-site.netlify.app,https://www.your-site.netlify.app,http://localhost:8888
```

### ステップ3: コードの更新

1. `create-checkout-session-improved.js` を参考に実装
2. または `create-checkout-session-no-cors.js` を使用（CORS完全削除版）
3. 実際のドメインに置き換える

### ステップ4: テスト

1. 同一オリジンからのアクセステスト
2. 外部オリジンからのアクセステスト（403エラーが返ることを確認）
3. 本番環境での動作確認

### ステップ5: デプロイ

1. ステージング環境でテスト
2. 問題がなければ本番環境にデプロイ
3. ログを監視して不正なアクセスがないか確認

## 参考資料

- [MDN: CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [OWASP: Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf)
- [Netlify Functions: CORS](https://docs.netlify.com/functions/overview/)

