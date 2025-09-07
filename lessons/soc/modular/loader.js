// loader.js（小学生社会・専用）: era クエリで教材データを読み込む
(function() {
  const params = new URLSearchParams(window.location.search);
  const era = params.get('era') || 'japan_geo1_front'; // デフォルト：① 世界の国と日本の地形（前半）

  // 小5社会：単元マップ（まずは Unit1 の前半・後半）
  const map = {
    japan_geo1_front: 'japan_geography_front_rich.js',
    japan_geo1_back: 'japan_geography_back_rich.js'
    // 以後、追加単元：
    // geo_climate_front: 'geo_climate_front.js',
    // geo_climate_back: 'geo_climate_back.js',
    // ...（必要に応じて拡張）
  };

  const file = map[era];
  if (!file) {
    alert('未対応の単元キーです: ' + era);
    return;
  }
  const s = document.createElement('script');
  s.src = file;
  s.onload = () => {
    if (!window.questions) {
      console.error('学習データの読み込みに失敗しました: ' + file);
    }
  };
  s.onerror = () => console.error('学習データを読み込めませんでした: ' + file);
  document.head.appendChild(s);
})();