console.log('地図学習用JavaScriptファイルが読み込まれました');

// 地図学習用レッスンの初期化
function initializeMapLesson() {
  console.log('地図学習用レッスンを初期化します');
  
  // 既存の地図コンテナを削除
  const existingMapContainer = document.getElementById('map-container');
  if (existingMapContainer) {
    existingMapContainer.remove();
  }
  
  // 地図コンテナを作成
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map-container';
  mapContainer.style.cssText = `
    width: 100%;
    height: 400px;
    margin: 20px 0;
    border: 2px solid #ddd;
    border-radius: 10px;
    background: #f0f0f0;
    display: block;
    overflow: hidden;
  `;
  mapContainer.innerHTML = '地図が読み込まれています...';
  
  // 問題ボックスの前に地図を挿入
  const questionBox = document.querySelector('.question-box');
  if (questionBox) {
    questionBox.insertBefore(mapContainer, questionBox.firstChild);
    console.log('地図コンテナを挿入しました');
  } else {
    console.log('問題ボックスが見つかりません');
  }
  
  // 地図を初期化
  setTimeout(() => {
    initializeMap();
  }, 1000);
}

// 地図の初期化
function initializeMap() {
  console.log('地図を初期化します');
  
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    console.log('地図コンテナが見つかりません');
    return;
  }
  
  console.log('地図コンテナが見つかりました:', mapContainer);
  
  // 地図の表示を強制的に実行
  try {
    console.log('地図の内容を設定します');
    
    // 地図コンテナのスタイルをリセット
    mapContainer.style.cssText = `
      width: 100%;
      height: 400px;
      margin: 20px 0;
      border: 2px solid #ddd;
      border-radius: 10px;
      background: #f0f0f0;
      display: block;
      overflow: hidden;
      position: relative;
    `;
    
    // インタラクティブな地図表示
    mapContainer.innerHTML = `
      <div style="text-align: center; padding: 20px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; background: white; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">🗺️ 北海道地方の地図</h3>
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p style="margin: 5px 0;"><strong>面積:</strong> 83,424 km²</p>
          <p style="margin: 5px 0;"><strong>人口:</strong> 約530万人</p>
          <p style="margin: 5px 0;"><strong>気候:</strong> 亜寒帯</p>
          <p style="margin: 5px 0;"><strong>主要都市:</strong> 札幌、函館、旭川</p>
        </div>
        <div style="background: #fff; border: 2px solid #4a90e2; border-radius: 8px; padding: 10px; margin: 10px 0;">
          <p style="color: #4a90e2; font-weight: bold;">📌 地図で学ぶ地理シリーズ</p>
          <p style="color: #666; font-size: 14px;">インタラクティブな地図で地理を学習しましょう</p>
        </div>
        <div style="background: #f0f8ff; border: 2px solid #87ceeb; border-radius: 8px; padding: 15px; margin: 10px 0;">
          <p style="color: #4682b4; font-weight: bold; margin-bottom: 10px;">🎯 地図学習のポイント</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">• 北海道の位置と形状を確認</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">• 主要都市の位置関係を理解</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">• 気候帯と地形の関係を学習</p>
        </div>
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin: 10px 0;">
          <p style="color: #856404; font-weight: bold; margin-bottom: 10px;">⚠️ 地図表示について</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">現在は簡易版の地図情報を表示しています</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">完全版のインタラクティブ地図は準備中です</p>
        </div>
      </div>
    `;
    
    console.log('地図の内容を設定しました');
    console.log('地図コンテナの内容:', mapContainer.innerHTML);
    
    // 地図の表示を強制的に実行
    setTimeout(() => {
      console.log('地図の表示を強制実行します');
      mapContainer.style.display = 'block';
      mapContainer.style.visibility = 'visible';
      mapContainer.style.opacity = '1';
    }, 100);
  } catch (error) {
    console.error('地図の設定でエラーが発生しました:', error);
  }
  
  console.log('地図の表示が完了しました');
}

// 地図の初期化を遅延実行
setTimeout(() => {
  console.log('地図初期化を開始します');
  initializeMapLesson();
}, 2000);

window.questions = [
  {
    "qnum": 1,
    "text": "地図で学ぶ地理 - 北海道地方の気候はどれですか？",
    "choices": [
      "亜寒帯",
      "温帯",
      "冷帯",
      "熱帯"
    ],
    "answer": 0,
    "source": "北海道は**亜寒帯気候**で、冬は寒く夏は涼しい気候です。地図で確認すると、北海道は日本列島の最北端に位置し、緯度が高いため亜寒帯気候となっています。\n\n**地図での確認ポイント：**\n- 北海道の位置：日本列島の最北端\n- 緯度：北緯41度〜45度\n- 気候の特徴：冬の寒さが厳しく、夏は涼しい",
    "tags": ["地図学習", "地理", "北海道", "気候"],
    "difficulty": 1,
    "asof": "2025-01-27"
  },
  {
    "qnum": 2,
    "text": "地図で学ぶ地理 - 北海道の道庁所在地はどこですか？",
    "choices": [
      "旭川",
      "札幌",
      "函館",
      "釧路"
    ],
    "answer": 1,
    "source": "**札幌市**が北海道の道庁所在地で、人口約197万人の最大都市です。\n\n**地図での確認ポイント：**\n- 札幌の位置：北海道の中央部\n- 人口：約197万人（北海道最大）\n- 役割：道庁所在地、政令指定都市\n- 地理的特徴：石狩平野に位置",
    "tags": ["地図学習", "地理", "北海道", "都市"],
    "difficulty": 1,
    "asof": "2025-01-27"
  },
  {
    "qnum": 3,
    "text": "地図で学ぶ地理 - 北海道の特産物はどれですか？",
    "choices": [
      "みかん",
      "じゃがいも",
      "りんご",
      "ぶどう"
    ],
    "answer": 1,
    "source": "北海道は**じゃがいも**の生産が盛んで、全国の約8割を生産しています。\n\n**地図での確認ポイント：**\n- 主要産地：十勝平野、根釧台地\n- 生産量：全国の約8割\n- その他の特産物：乳製品、甜菜、水産物\n- 地理的条件：冷涼な気候が適している",
    "tags": ["地図学習", "地理", "北海道", "特産物"],
    "difficulty": 1,
    "asof": "2025-01-27"
  },
  {
    "qnum": 4,
    "text": "地図で学ぶ地理 - 北海道で最も長い川はどれですか？",
    "choices": [
      "石狩川",
      "天塩川",
      "十勝川",
      "釧路川"
    ],
    "answer": 0,
    "source": "**石狩川**は北海道で最も長い川で、全長268kmです。\n\n**地図での確認ポイント：**\n- 流路：大雪山系から石狩平野を流れる\n- 長さ：268km（北海道最長）\n- 流域：石狩平野の主要河川\n- 支流：空知川、夕張川など",
    "tags": ["地図学習", "地理", "北海道", "河川"],
    "difficulty": 2,
    "asof": "2025-01-27"
  },
  {
    "qnum": 5,
    "text": "地図で学ぶ地理 - 北海道の主要産業はどれですか？",
    "choices": [
      "重工業",
      "農業",
      "金融業",
      "IT産業"
    ],
    "answer": 1,
    "source": "北海道は**農業**が主要産業で、じゃがいも、甜菜、乳製品の生産が盛んです。\n\n**地図での確認ポイント：**\n- 農業地域：十勝平野、根釧台地、石狩平野\n- 主要作物：じゃがいも、甜菜、小麦、豆類\n- 畜産業：乳牛、肉牛の飼育\n- 水産業：太平洋、日本海、オホーツク海",
    "tags": ["地図学習", "地理", "北海道", "産業"],
    "difficulty": 2,
    "asof": "2025-01-27"
  },
  {
    "qnum": 6,
    "text": "地図で学ぶ地理 - 北海道の主要山脈はどれですか？",
    "choices": [
      "大雪山",
      "日高山脈",
      "石狩山地",
      "すべて"
    ],
    "answer": 3,
    "source": "北海道の主要山脈は**大雪山、日高山脈、石狩山地**すべてです。\n\n**地図での確認ポイント：**\n- **大雪山**：北海道の中央部、最高峰は旭岳（2,291m）\n- **日高山脈**：北海道の南部、南北に連なる\n- **石狩山地**：石狩川の上流域に位置\n- 地形の特徴：火山性の山地が多い",
    "tags": ["地図学習", "地理", "北海道", "山脈"],
    "difficulty": 2,
    "asof": "2025-01-27"
  },
  {
    "qnum": 7,
    "text": "地図で学ぶ地理 - 北海道の面積はどれくらいですか？",
    "choices": [
      "約5万km²",
      "約8万km²",
      "約10万km²",
      "約12万km²"
    ],
    "answer": 1,
    "source": "北海道の面積は**約8万km²**（83,424km²）で、日本の総面積の約22%を占めます。\n\n**地図での確認ポイント：**\n- 面積：83,424km²\n- 日本の総面積に占める割合：約22%\n- 都道府県別面積：1位\n- 地理的特徴：日本列島の約1/5を占める",
    "tags": ["地図学習", "地理", "北海道", "面積"],
    "difficulty": 2,
    "asof": "2025-01-27"
  },
  {
    "qnum": 8,
    "text": "地図で学ぶ地理 - 北海道の人口はどれくらいですか？",
    "choices": [
      "約300万人",
      "約400万人",
      "約500万人",
      "約600万人"
    ],
    "answer": 2,
    "source": "北海道の人口は**約500万人**（約530万人）です。\n\n**地図での確認ポイント：**\n- 人口：約530万人\n- 人口密度：約64人/km²（全国平均の約1/5）\n- 主要都市：札幌（197万）、旭川（32万）、函館（26万）\n- 人口の特徴：都市部に集中",
    "tags": ["地図学習", "地理", "北海道", "人口"],
    "difficulty": 2,
    "asof": "2025-01-27"
  }
];
