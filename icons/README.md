# PWAアイコン生成ガイド

このディレクトリには、PWA用のアイコンファイルを配置します。

## 必要なアイコンサイズ

以下のサイズのアイコンが必要です：

- `icon-72x72.png` - 72x72px
- `icon-96x96.png` - 96x96px
- `icon-128x128.png` - 128x128px
- `icon-144x144.png` - 144x144px
- `icon-152x152.png` - 152x152px
- `icon-192x192.png` - 192x192px（必須）
- `icon-384x384.png` - 384x384px
- `icon-512x512.png` - 512x512px（必須）

## アイコン生成方法

### 方法1: オンラインツールを使用

1. [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) を使用
2. または [RealFaviconGenerator](https://realfavicongenerator.net/) を使用

### 方法2: ImageMagickを使用（コマンドライン）

```bash
# 元のアイコンファイル（例: icon-source.png）から各サイズを生成
convert icon-source.png -resize 72x72 icons/icon-72x72.png
convert icon-source.png -resize 96x96 icons/icon-96x96.png
convert icon-source.png -resize 128x128 icons/icon-128x128.png
convert icon-source.png -resize 144x144 icons/icon-144x144.png
convert icon-source.png -resize 152x152 icons/icon-152x152.png
convert icon-source.png -resize 192x192 icons/icon-192x192.png
convert icon-source.png -resize 384x384 icons/icon-384x384.png
convert icon-source.png -resize 512x512 icons/icon-512x512.png
```

### 方法3: Photoshop/GIMP等の画像編集ソフトを使用

1. 元のアイコンファイルを開く
2. 各サイズにリサイズして保存

## アイコンのデザイン要件

- **背景**: 透明または単色背景
- **形式**: PNG形式
- **推奨**: マスク可能なアイコン（maskable icon）も用意すると、Androidでより美しく表示されます
- **最小サイズ**: 512x512px（高解像度ディスプレイ対応）

## 現在のアイコン

現在、`favicon.png`が192x192pxとして使用されていますが、上記の全サイズを用意することを推奨します。

## 注意事項

- アイコンファイルは必ず`icons/`ディレクトリに配置してください
- ファイル名は上記の命名規則に従ってください
- アイコンを更新したら、Service Workerのキャッシュバージョンも更新してください

