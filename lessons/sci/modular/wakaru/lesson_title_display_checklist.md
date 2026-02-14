# レッスンタイトル表示チェックリスト

レッスンのタイトルが表示されない場合に確認すべきチェックポイントをまとめています。

## チェックポイント一覧

### 1. catalog.json への登録確認

**確認場所**: `catalog.json`

**確認内容**:
- レッスンIDが正しく登録されているか
- `title`フィールドが存在し、適切な値が設定されているか
- `grade`, `subject`, `path`などの必須フィールドが正しく設定されているか

**確認方法**:
```bash
# catalog.json内でレッスンIDを検索
grep "sci.biology.environment_energy" catalog.json
```

**注意点**:
- タイトルが長すぎる場合、表示に問題が生じる可能性がある
- JSON形式が正しいか確認（カンマ、引用符など）

---

### 2. app.js の lessons 配列への登録確認

**確認場所**: `app.js` の `scienceUnits` 配列内

**確認内容**:
- 該当する単元（例: `g6`）の`lessons`配列にレッスンIDが含まれているか
- コメントでレッスン名が記載されているか

**確認方法**:
```bash
# app.js内でレッスンIDを検索
grep "sci.biology.environment_energy" app.js
```

**注意点**:
- レッスンIDは文字列として正確に記述されているか
- 単元の`lessons`配列内の適切な位置に配置されているか

**例**:
```javascript
{
  id: 'g6',
  name: '小6理科：総合と応用',
  lessons: [
    // ...
    'sci.biology.environment_energy', // 環境問題 エネルギー問題（小4から移動）
    // ...
  ]
}
```

---

### 3. loader.js への登録確認

**確認場所**: `lessons/sci/modular/wakaru/loader.js`

**確認内容**:
- `map`オブジェクト内にレッスンIDが登録されているか
- `idToFileName`関数を使用して正しいファイル名が生成されているか

**確認方法**:
```bash
# loader.js内でレッスンIDを検索
grep "sci.biology.environment_energy" lessons/sci/modular/wakaru/loader.js
```

**注意点**:
- `idToFileName`関数を使用している場合、IDからファイル名への変換が正しく行われるか確認
- 手動でファイル名を指定している場合、そのファイル名が実際に存在するか確認

**例**:
```javascript
const map = {
  // ...
  'sci.biology.environment_energy': idToFileName('sci.biology.environment_energy'),
  // ...
};
```

**idToFileName関数の動作**:
- `sci.biology.environment_energy` → `biology_environment_energy.js`

---

### 4. index_modular.html の eraMap への登録確認

**確認場所**: `lessons/sci/modular/wakaru/index_modular.html`

**確認内容**:
- `eraMap`オブジェクト内にレッスンIDが登録されているか
- タイトルが正しく設定されているか

**確認方法**:
```bash
# index_modular.html内でレッスンIDを検索
grep "sci.biology.environment_energy" lessons/sci/modular/wakaru/index_modular.html
```

**注意点**:
- **このチェックポイントが最も見落とされやすい**
- `eraMap`はレッスンページ内でタイトルを表示するために使用される
- `catalog.json`に登録されていても、`eraMap`に登録されていないとタイトルが表示されない

**例**:
```javascript
const eraMap = {
  // ...
  'sci.biology.environment_energy': '環境問題 エネルギー問題',
  // ...
};
```

---

### 5. formatLessonTitle 関数の動作確認

**確認場所**: `app.js` の `formatLessonTitle` 関数と `getScienceField` 関数

**確認内容**:
- レッスンIDが`getScienceField`関数で正しく分類されているか
- タイトルに適切な分野タグ（【生物】、【物理】、【化学】、【地学】）が追加されるか

**確認方法**:
- `app.js`内の`getScienceField`関数を確認
- レッスンIDがどの条件に該当するか確認

**例**:
```javascript
function getScienceField(lessonId) {
  if (!lessonId) return '';
  
  const id = lessonId.toLowerCase();
  if (id.includes('biology') || id.includes('生物')) {
    return '【生物】';
  }
  // ...
}

function formatLessonTitle(title, lessonId, subject) {
  if (subject === 'sci' || subject === 'science_drill') {
    const field = getScienceField(lessonId);
    if (field) {
      return field + ' ' + title;
    }
  }
  return title;
}
```

**注意点**:
- `sci.biology.environment_energy`の場合、`biology`を含むため「【生物】 環境問題 エネルギー問題」として表示される

---

### 6. 実際のJSファイルの存在確認

**確認場所**: `lessons/sci/modular/wakaru/` ディレクトリ

**確認内容**:
- `loader.js`で指定されたファイル名のJSファイルが実際に存在するか

**確認方法**:
```bash
# ファイルの存在確認
ls lessons/sci/modular/wakaru/biology_environment_energy.js
```

**注意点**:
- ファイル名は`idToFileName`関数の出力と一致している必要がある
- ファイルが存在しない場合、レッスンは読み込まれない

---

## トラブルシューティング手順

### タイトルが表示されない場合

1. **catalog.jsonを確認**
   - レッスンIDが存在するか
   - タイトルが正しく設定されているか

2. **app.jsを確認**
   - 単元の`lessons`配列に含まれているか

3. **loader.jsを確認**
   - `map`オブジェクトに登録されているか

4. **index_modular.htmlを確認** ⚠️ **重要**
   - `eraMap`に登録されているか（これが最も見落とされやすい）

5. **ブラウザのコンソールを確認**
   - `state.catalog`にレッスンが含まれているか
   - `renderUnitLessons`のログで「✅ レッスンが見つかりました」が出力されているか
   - エラーメッセージがないか

6. **ブラウザのキャッシュをクリア**
   - キャッシュが原因で古いデータが表示される可能性がある

---

## 過去の事例

### 事例1: 総合問題のタイトルが表示されない

**原因**: `catalog.json`のタイトルが長すぎた
- 例: "物理総合（光・音・電気・力・エネルギー）" → "物理総合"に短縮

**解決方法**: タイトルを短縮して他の総合問題と統一

---

### 事例2: environment_energyのタイトルが表示されない

**原因**: `index_modular.html`の`eraMap`に登録されていなかった

**解決方法**: `eraMap`に以下を追加
```javascript
'sci.biology.environment_energy': '環境問題 エネルギー問題',
```

---

## まとめ

レッスンのタイトルを表示するためには、以下の4つのファイルすべてに正しく登録されている必要があります：

1. ✅ **catalog.json** - メタデータの登録
2. ✅ **app.js** - 単元のレッスンリストへの追加
3. ✅ **loader.js** - ファイル読み込みマップへの追加
4. ✅ **index_modular.html** - eraMapへの追加 ⚠️ **見落としやすい**

特に`index_modular.html`の`eraMap`への登録は見落とされやすいため、タイトルが表示されない場合は最初に確認することを推奨します。

