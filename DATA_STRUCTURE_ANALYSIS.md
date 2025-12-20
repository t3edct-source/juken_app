# データ構造分析レポート

## 📋 確認日時
2025年1月27日

## 🔍 現在のデータ構造

### 1. レッスンカタログ (`catalog.json`)

**構造:**
```json
[
  {
    "id": "soc.history.heian",
    "grade": 5,
    "subject": "soc",
    "title": "平安時代の文化と政治",
    "duration_min": 18,
    "sku_required": "g5-soc",
    "path": "lessons/soc/history/heian/output.html",
    "format": "html",
    "tags": ["歴史", "平安時代", "貴族政治"]
  },
  ...
]
```

**特徴:**
- 配列形式（約3000行以上）
- 各レッスンは独立したオブジェクト
- 検索は`find()`や`filter()`でO(n)の計算量

**問題点:**
- ⚠️ レッスンIDでの検索が非効率（配列全体を走査）
- ⚠️ 学年・教科でのフィルタリングが毎回配列全体を走査
- ⚠️ ファイルサイズが大きい（約3000行）

### 2. localStorage データ構造

#### 進捗データ
**キー形式:** `progress:{lessonId}`
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

**問題点:**
- ⚠️ 各レッスンごとに個別キーが生成される
- ⚠️ レッスン数が多い場合、大量のキーが生成される可能性
- ⚠️ 全進捗データの取得には`Object.keys(localStorage)`で全キーを走査する必要がある

#### 学習履歴
**キー形式:** `learningHistory_{mode}` (wakaru/oboeru)
```json
{
  "sessions": [
    {
      "lessonId": "sci.physics.motion",
      "mode": "wakaru",
      "timestamp": 1705123456789,
      ...
    }
  ]
}
```

**問題点:**
- ⚠️ セッションが増えると配列が大きくなる
- ⚠️ 古いセッションの削除処理が不十分な可能性

#### チェックポイント
**キー形式:** `checkpoint:{lessonId}`
- 一時的な保存データ
- レッスン完了時に削除される

#### その他のデータ
- `learningStreak`: 連続学習日数
- `unlockedThemes`: アンロック済みテーマ（配列）
- `currentTheme`: 現在のテーマ（文字列）
- `purchases`: 購入情報（配列）
- `currentGrade`: 現在の学年（数値）

### 3. 励ましメッセージ (`data/encouragement-messages.json`)

**構造:**
```json
[
  {
    "id": "A01_cynical_normal",
    "baseId": "A01",
    "tone": "cynical",
    "season": "autumn",
    "message": "勉強を始めるときは、一番簡単な1問から入ると集中しやすい。"
  },
  ...
]
```

**問題点:**
- ⚠️ 同じ`baseId`で異なる`tone`と`season`の組み合わせが重複
- ⚠️ 配列形式で検索が非効率
- ⚠️ 約3300行のデータ

## ⚠️ 主な問題点

### 1. パフォーマンスの問題

#### catalog.json
- **問題**: 配列形式のため、レッスンIDでの検索がO(n)
- **影響**: レッスン数が増えると検索が遅くなる
- **現在の使用箇所**: `state.catalog.find(lesson => lesson.id === id)`

#### localStorage
- **問題**: 進捗データが個別キーで分散
- **影響**: 全進捗データの取得・集計が非効率
- **現在の使用箇所**: 統計表示、進捗バー表示

### 2. ストレージ効率の問題

#### localStorage キーの分散
- **問題**: `progress:*`形式で各レッスンごとにキーが生成
- **影響**: 
  - localStorageのキー数が増える（上限は約5000-10000）
  - 全キーの取得に時間がかかる
  - データの一括操作が困難

#### データの重複
- **問題**: encouragement-messages.jsonに重複データ
- **影響**: ファイルサイズが大きくなる

### 3. データ整合性の問題

#### 進捗データの分散
- **問題**: 各レッスンの進捗が個別キーに保存
- **影響**: 
  - データの一貫性チェックが困難
  - バックアップ・復元が複雑
  - データ移行が困難

## 💡 最適化提案

### 提案1: catalog.jsonのインデックス化

**現在:**
```javascript
// O(n)の検索
const lesson = state.catalog.find(lesson => lesson.id === id);
```

**最適化後:**
```javascript
// インデックスマップを作成
const catalogIndex = new Map();
state.catalog.forEach(lesson => {
  catalogIndex.set(lesson.id, lesson);
});

// O(1)の検索
const lesson = catalogIndex.get(id);
```

**メリット:**
- 検索速度がO(n) → O(1)に改善
- 学年・教科でのフィルタリングも事前にインデックス化可能

### 提案2: 進捗データの統合

**現在:**
```
progress:sci.physics.motion → {...}
progress:soc.history.heian → {...}
...
```

**最適化後:**
```
progress → {
  "sci.physics.motion": {...},
  "soc.history.heian": {...},
  ...
}
```

**メリット:**
- localStorageのキー数を大幅に削減
- 全進捗データの一括取得が高速化
- データの一貫性が向上

**デメリット:**
- 1つのキーのサイズが大きくなる（localStorageの上限は約5-10MB）
- 部分更新のたびに全体を読み書きする必要がある

### 提案3: 学習履歴の制限とアーカイブ

**現在:**
```json
{
  "sessions": [/* 無制限に追加 */]
}
```

**最適化後:**
```json
{
  "sessions": [/* 最新100件のみ */],
  "archived": [/* 古いデータは別キーに移動 */]
}
```

**メリット:**
- メモリ使用量の削減
- パフォーマンスの向上

### 提案4: encouragement-messages.jsonの構造化

**現在:**
```json
[
  {"id": "A01_cynical_normal", "baseId": "A01", ...},
  {"id": "A01_cynical_season", "baseId": "A01", ...},
  ...
]
```

**最適化後:**
```json
{
  "A01": {
    "message": "勉強を始めるときは、一番簡単な1問から入ると集中しやすい。",
    "variants": {
      "cynical": {"normal": {...}, "season": {...}},
      "encourage": {"normal": {...}, "season": {...}}
    }
  },
  ...
}
```

**メリット:**
- データの重複を削減
- 検索が高速化
- ファイルサイズの削減

### 提案5: インデックスファイルの作成

**catalog-index.json を作成:**
```json
{
  "byId": {
    "sci.physics.motion": {...},
    "soc.history.heian": {...}
  },
  "byGrade": {
    "4": ["sci.biology.plants", ...],
    "5": [...],
    "6": [...]
  },
  "bySubject": {
    "sci": [...],
    "soc": [...]
  }
}
```

**メリット:**
- 検索の高速化
- フィルタリングの高速化

## 📊 最適化の優先度

### 高優先度
1. **進捗データの統合** - localStorageのキー数削減、パフォーマンス向上
2. **catalog.jsonのインデックス化** - 検索速度の改善

### 中優先度
3. **学習履歴の制限** - メモリ使用量の削減
4. **encouragement-messages.jsonの構造化** - ファイルサイズの削減

### 低優先度
5. **インデックスファイルの作成** - さらなる最適化

## 🔧 実装時の注意点

### データ移行
- 既存のデータ構造から新しい構造への移行処理が必要
- 移行スクリプトの作成
- バックアップ機能の確認

### 後方互換性
- 既存のコードとの互換性を保つ
- 段階的な移行を検討

### パフォーマンステスト
- 最適化前後のパフォーマンス比較
- 大量データでのテスト

## 📝 次のステップ

1. **進捗データの統合**を実装
2. **catalog.jsonのインデックス化**を実装
3. パフォーマンステストを実施
4. 必要に応じて他の最適化を実施

