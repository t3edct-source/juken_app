# Stripe Webhook 署名検証の検証レポート

**日付**: 2025-01-27  
**対象ファイル**: `netlify/functions/stripe-webhook.js`  
**検証内容**: Netlify Functions での Stripe Webhook 署名検証の堅牢性

## 現状の実装

### 現在のコード

```javascript
exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,        // ← 生のボディを直接使用
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
  // ...
};

exports.config = { bodyParser: false };  // ← 設定は正しい
```

## 指摘された問題点

### 🔴 潜在的な問題

1. **Base64エンコードの未処理**
   - Netlify Functions では、`event.isBase64Encoded === true` の場合、`event.body` が Base64 エンコードされている
   - 現在の実装では、このチェックがなく、Base64 エンコードされた body をそのまま `constructEvent` に渡している
   - **結果**: 署名検証が失敗する可能性がある

2. **Content-Type の未確認**
   - `event.headers['content-type']` を確認していない
   - 予期しない形式のリクエストを処理してしまう可能性がある

3. **bodyParser 設定の不確実性**
   - `exports.config = { bodyParser: false };` は正しい設定だが、Netlify のフレームワーク/ビルド方式によっては効かない場合がある
   - この設定が効かない場合、`event.body` が JSON としてパースされてしまい、署名検証が失敗する

## 検証結果

### ✅ 現在動作している理由（推測）

1. **Netlify Functions のデフォルト動作**
   - 現在の環境では、`bodyParser: false` が正しく機能している
   - `event.body` が文字列として生の状態で渡されている

2. **Base64 エンコードされていない可能性**
   - 現在のリクエストでは `event.isBase64Encoded` が `false` または未設定
   - そのため、`event.body` がそのまま使用できている

### ⚠️ 潜在的なリスク

1. **環境変更による影響**
   - Netlify のアップデートや設定変更により、動作が変わる可能性
   - 別の環境（ステージング、本番）で異なる動作をする可能性

2. **リクエスト形式の変更**
   - Stripe からのリクエスト形式が変更される可能性（低いがゼロではない）
   - プロキシやロードバランサーによる加工の可能性

## 推奨される改善策

### 優先度: 高（堅牢性の向上）

以下の改善により、様々な環境やリクエスト形式に対応できるようになります：

```javascript
exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  
  // Content-Type の確認（オプション、デバッグ用）
  const contentType = event.headers["content-type"] || event.headers["Content-Type"];
  console.log("Content-Type:", contentType);
  console.log("isBase64Encoded:", event.isBase64Encoded);
  
  // 生のボディを取得
  let rawBody = event.body;
  
  // Base64 エンコードされている場合はデコード
  if (event.isBase64Encoded) {
    console.log("Base64 デコードを実行");
    rawBody = Buffer.from(event.body, 'base64').toString('utf8');
  }
  
  // body が文字列でない場合（オブジェクトなど）の処理
  if (typeof rawBody !== 'string') {
    console.error("Body is not a string:", typeof rawBody);
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: "Invalid body format" }) 
    };
  }
  
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,  // ← 処理済みの生ボディ
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("signature error:", err.message);
    console.error("Body type:", typeof rawBody);
    console.error("Body length:", rawBody ? rawBody.length : 0);
    console.error("Body preview:", rawBody ? rawBody.substring(0, 100) : "empty");
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }) 
    };
  }
  
  // 以降の処理は同じ
  // ...
};

exports.config = { bodyParser: false };
```

### 改善点の詳細

1. **`event.isBase64Encoded` のチェック**
   - Base64 エンコードされている場合はデコード
   - これにより、様々な環境で動作する

2. **型チェック**
   - `rawBody` が文字列であることを確認
   - オブジェクトやその他の型の場合はエラーを返す

3. **詳細なログ出力**
   - デバッグ時に問題を特定しやすくする
   - `Content-Type`、`isBase64Encoded`、body の型と長さをログ出力

4. **エラーレスポンスの改善**
   - JSON 形式でエラーを返す（一貫性のため）

## テスト方法

### 1. 現在の動作確認（推奨）

**Stripe CLI を使用したローカルテスト**:

```bash
# ターミナル1: Stripe CLI でローカルリスナーを起動
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# ターミナル2: Netlify Dev を起動
netlify dev

# ターミナル3: テストイベントを送信
stripe trigger checkout.session.completed
```

**Netlify Functions のログを確認**:
- Netlify ダッシュボードの Functions ログを確認
- `signature error` が発生していないか確認
- 成功ログ `✅ write entitlement` が出力されているか確認

### 2. 診断版での検証（推奨）

`stripe-webhook.verification.js` を一時的に使用して、実際の環境での動作を確認：

```bash
# 1. 一時的にファイル名を変更
mv netlify/functions/stripe-webhook.js netlify/functions/stripe-webhook.original.js
mv netlify/functions/stripe-webhook.verification.js netlify/functions/stripe-webhook.js

# 2. デプロイ（ステージング環境推奨）
netlify deploy --prod=false

# 3. テストイベントを送信
stripe trigger checkout.session.completed

# 4. ログを確認
# Netlify ダッシュボードで以下を確認:
# - event.isBase64Encoded の値
# - event.body type の値
# - Content-Type の値
# - 署名検証の成功/失敗

# 5. 元に戻す
mv netlify/functions/stripe-webhook.js netlify/functions/stripe-webhook.verification.js
mv netlify/functions/stripe-webhook.original.js netlify/functions/stripe-webhook.js
```

### 3. Base64 エンコードのテスト

以下のようなテストコードで、Base64 エンコードされた body を処理できるか確認：

```javascript
// テスト用のモックイベント
const mockEvent = {
  body: Buffer.from("test body").toString('base64'),
  isBase64Encoded: true,
  headers: {
    "stripe-signature": "test-signature",
    "content-type": "application/json"
  }
};
```

### 4. ログの確認項目

Netlify Functions のログで以下を確認：
- ✅ `Content-Type` の値（通常は `application/json`）
- ✅ `isBase64Encoded` の値（`true` または `false`/`undefined`）
- ✅ `event.body type` の値（通常は `string`）
- ✅ `event.body length` の値（0 より大きい）
- ✅ 署名検証エラーの有無（`signature error` が出力されていないか）
- ✅ 成功ログ（`✅ write entitlement` が出力されているか）

### 5. 問題が発生している場合の確認

もし署名検証エラーが発生している場合：

1. **ログで `isBase64Encoded: true` が表示される場合**
   - Base64 デコード処理が必要
   - 改善コードを実装する必要がある

2. **ログで `body type: object` が表示される場合**
   - `bodyParser: false` が効いていない
   - Netlify の設定を確認する必要がある

3. **ログで `body length: 0` が表示される場合**
   - body が正しく渡されていない
   - Netlify Functions の設定を確認する必要がある

## 結論

### 現状評価

- **現在の動作**: 🟢 **正常**（エラーが発生していない）
- **堅牢性**: 🟡 **改善の余地あり**

### 推奨アクション

1. **即座の対応**: 不要（現在エラーが発生していない）
2. **推奨される対応**: 上記の改善コードを実装（堅牢性の向上）
3. **監視**: ログで署名検証エラーが発生していないか定期的に確認

### 実装の優先順位

- **高**: Base64 デコード処理の追加
- **中**: 型チェックとログ出力の追加
- **低**: Content-Type の確認（デバッグ用）

## 参考資料

- [Stripe Webhook 署名検証](https://stripe.com/docs/webhooks/signatures)
- [Netlify Functions ドキュメント](https://docs.netlify.com/functions/overview/)
- [AWS Lambda イベント形式（Netlify Functions は Lambda 互換）](https://docs.aws.amazon.com/lambda/latest/dg/with-api-gateway.html)

