# 画像配置時のチェックポイント

## 問題の概要

レッスンファイル（`.js`）に画像を配置した後、問題が表示されなくなる現象が発生しました。

## 原因

JavaScriptの文字列リテラル内で画像タグ（`<img>`）を使用する際、**引用符がエスケープされていない**ことが原因でした。

### 問題のあるコード例

```javascript
"source": "説明文です。<img src="../images/path/image.png" alt="図解" style="max-width: 100%;">",
```

この場合、JavaScriptの文字列リテラル（`"..."`）内で引用符（`"`）が使用されているため、文字列が途中で終了してしまい、構文エラーが発生します。

## 修正方法

画像タグ内のすべての引用符を**バックスラッシュでエスケープ**する必要があります。

### 正しいコード例

```javascript
"source": "説明文です。<img src=\"../images/path/image.png\" alt=\"図解\" style=\"max-width: 100%;\">",
```

### 修正が必要な箇所

画像タグ内の以下の3つの属性で引用符をエスケープする必要があります：

1. `src` 属性: `src="..."` → `src=\"...\"`
2. `alt` 属性: `alt="..."` → `alt=\"...\"`
3. `style` 属性: `style="..."` → `style=\"...\"`

## チェックポイント

画像を配置する際は、以下の点を必ず確認してください：

### ✅ 必須チェック項目

1. **引用符のエスケープ**
   - [ ] 画像タグ内のすべての引用符が `\"` でエスケープされているか
   - [ ] `src` 属性の引用符がエスケープされているか
   - [ ] `alt` 属性の引用符がエスケープされているか
   - [ ] `style` 属性の引用符がエスケープされているか

2. **構文の確認**
   - [ ] JavaScriptの構文エラーがないか
   - [ ] 文字列リテラルが正しく閉じられているか
   - [ ] カンマや括弧が正しく配置されているか

3. **画像パスの確認**
   - [ ] 画像ファイルのパスが正しいか
   - [ ] 画像ファイルが実際に存在するか
   - [ ] パスの区切り文字（`/`）が正しいか

### 📝 正しい画像タグの形式

```javascript
"source": "説明文です。<img src=\"../images/カテゴリ/フォルダ/画像ファイル名.png\" alt=\"図解\" style=\"max-width: 100%; margin: 1rem 0; border-radius: 8px; display: block;\">",
```

## 修正スクリプトの例

画像タグの引用符を一括でエスケープするスクリプト例：

```javascript
const fs = require('fs');

const filePath = 'lessons/sci/modular/wakaru/レッスンファイル名.js';
let content = fs.readFileSync(filePath, 'utf8');

// 画像タグ内の引用符をエスケープ
const sourceRegex = /("source":\s*")([^"]*?)(<img src=")([^"]+)(" alt=")([^"]+)(" style=")([^"]+)(">)/g;

content = content.replace(sourceRegex, (match, prefix, text, img1, src, img2, alt, img3, style, img4) => {
  return `${prefix}${text}<img src=\\"${src}\\" alt=\\"${alt}\\" style=\\"${style}\\">`;
});

fs.writeFileSync(filePath, content, 'utf8');
```

## 今後の注意点

1. **画像を配置する際は必ず引用符をエスケープする**
   - 手動で配置する場合は、`\"` を使用する
   - スクリプトで自動配置する場合は、エスケープ処理を含める

2. **配置後の確認**
   - ブラウザで問題が正しく表示されるか確認する
   - ブラウザの開発者ツールでJavaScriptエラーがないか確認する

3. **既存ファイルの確認**
   - 新しい画像を配置する際は、既存の画像タグの形式を参考にする
   - 一貫性を保つ

## 関連ファイル

- レッスンファイル: `lessons/sci/modular/wakaru/*.js`
- 画像ファイル: `lessons/sci/modular/images/`

## 更新履歴

- 2025-01-XX: 初版作成（画像タグの引用符エスケープ問題のドキュメント化）

