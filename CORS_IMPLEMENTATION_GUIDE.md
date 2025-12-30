# CORS設定改善の実装ガイド

**実装日**: 2025-01-27  
**対象ファイル**: `netlify/functions/create-checkout-session.js`

## 実装内容

### 変更点

1. **オリジン検証機能の追加**
   - 許可されたオリジンのみアクセス可能に
   - 外部オリジンからのアクセスをブロック

2. **環境変数による柔軟な設定**
   - `ALLOWED_ORIGINS` 環境変数で許可オリジンを指定可能
   - 環境変数が未設定の場合は `URL` 環境変数から自動推測

3. **詳細なログ出力**
   - オリジン情報をログに記録
   - 不正アクセスの検出と監視が容易に

## 実装された機能

### 1. オリジン検証

```javascript
// 許可するオリジンのリストを取得
const getAllowedOrigins = () => {
  // 環境変数から取得（推奨）
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  }
  
  // 環境変数が設定されていない場合、URL環境変数から推測
  // ...
};
```

### 2. アクセス制御

- 同一オリジンからのリクエスト: 常に許可
- 許可されたオリジンからのリクエスト: 許可
- 許可されていないオリジンからのリクエスト: 403エラーを返す

### 3. ログ出力

不正アクセスが検出された場合、以下の情報をログに記録：
- オリジン
- 許可されているオリジンリスト
- リファラー
- IPアドレス

## 環境変数の設定

### 推奨設定（Netlify ダッシュボード）

1. **Netlify ダッシュボードにログイン**
2. **サイト設定 > Environment variables** に移動
3. **以下の環境変数を追加**:

```
ALLOWED_ORIGINS=https://your-site.netlify.app,https://www.your-site.netlify.app
```

**注意**: 
- カンマ区切りで複数のオリジンを指定可能
- 開発環境用に `http://localhost:8888` を追加する場合は、環境ごとに設定

### 環境ごとの設定

#### 本番環境（Production）

```
ALLOWED_ORIGINS=https://your-site.netlify.app,https://www.your-site.netlify.app
```

#### 開発環境（Development / Deploy previews）

```
ALLOWED_ORIGINS=https://your-site.netlify.app,https://www.your-site.netlify.app,http://localhost:8888,http://127.0.0.1:8888
```

### 環境変数が未設定の場合

環境変数 `ALLOWED_ORIGINS` が設定されていない場合、以下のロジックで自動的に許可オリジンを決定します：

1. `URL` 環境変数から本番ドメインを取得
2. `www` 付きのバージョンも自動追加
3. 開発環境用に `localhost:8888` と `127.0.0.1:8888` を追加

**注意**: 本番環境では必ず `ALLOWED_ORIGINS` を設定することを推奨します。

## 動作確認

### 1. 同一オリジンからのアクセス

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

**期待される結果**: 正常に動作（200 OK）

### 2. 外部オリジンからのアクセス

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

**期待される結果**: 403エラー（Origin not allowed）

### 3. ログの確認

Netlify Functions のログで以下を確認：

- ✅ 正常なアクセス: `origin: same-origin` または許可されたオリジン
- ⚠️ 不正アクセス: `⚠️ 許可されていないオリジンからのアクセス:` のログ

## トラブルシューティング

### 問題: 同一オリジンからのアクセスが403エラーになる

**原因**: 環境変数の設定が不適切

**解決策**:
1. `ALLOWED_ORIGINS` 環境変数を確認
2. `URL` 環境変数が正しく設定されているか確認
3. ログで実際のオリジンを確認

### 問題: 開発環境で動作しない

**原因**: 開発環境用のオリジンが許可リストに含まれていない

**解決策**:
1. 開発環境の環境変数に `http://localhost:8888` を追加
2. または、`ALLOWED_ORIGINS` に開発環境用のURLを含める

### 問題: カスタムドメインが動作しない

**原因**: カスタムドメインが許可リストに含まれていない

**解決策**:
1. `ALLOWED_ORIGINS` にカスタムドメインを追加
2. `www` 付きと `www` なしの両方を追加することを推奨

## セキュリティ上の注意事項

1. **環境変数の管理**
   - 本番環境では必ず `ALLOWED_ORIGINS` を設定
   - 開発環境用のURLを本番環境に含めない

2. **ログの監視**
   - 定期的にログを確認し、不正アクセスを検出
   - `⚠️ 許可されていないオリジンからのアクセス` のログを監視

3. **追加のセキュリティ対策**
   - 認証トークンの検証（将来的な改善案）
   - リファラー検証（補助的な検証として）

## 次のステップ

1. ✅ CORS設定の改善（完了）
2. ⏳ 環境変数の設定（Netlify ダッシュボードで実施）
3. ⏳ 動作確認テストの実施
4. ⏳ 本番環境へのデプロイ
5. ⏳ ログの監視開始

## 参考資料

- [CORS設定のセキュリティ検証レポート](./CORS_SECURITY_VERIFICATION.md)
- [Netlify Functions ドキュメント](https://docs.netlify.com/functions/overview/)
- [MDN: CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)

