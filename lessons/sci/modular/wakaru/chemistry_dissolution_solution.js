// chemistry_dissolution_solution.js
window.questions = [

  // =========================
  // 超基本語彙チェック（1〜5）
  // =========================
  {
    qnum: 1,
    text: "水などの液体に物質がとけることを何という？",
    choices: ["溶解", "蒸発", "凝固", "燃焼"],
    answer: 0,
    source: "水の中に食塩や砂糖を入れると、だんだん見えなくなることがあります。このとき、物質は消えたのではなく、水の中に広がっています。このように、液体の中に物質が広がることを 溶解 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解\n\n【食塩を入れる前】\n    ┌─────┐\n    │  水   │\n    └─────┘\n        ↓\n    食塩を入れる\n        ↓\n【食塩を入れた後】\n    ┌─────┐\n    │ ● ● ●│  食塩が見える\n    │ ● ● ●│\n    └─────┘\n        ↓\n    かき混ぜる\n        ↓\n【溶けた後】\n    ┌─────┐\n    │       │  見えなくなる\n    │  水   │  水の中に広がる\n    │       │\n    └─────┘\n\n物質は消えたのではなく\n水の中に広がっている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 2,
    text: "物質がとけた液体をまとめて何という？",
    choices: ["水溶液", "混合物", "気体", "沈殿"],
    answer: 0,
    source: "水に食塩などが溶けると、水と物質がまざった状態になります。このように、物質が水に溶けてできた液体をまとめて水溶液 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水溶液\n\n【水に物質を入れる】\n    水 + 食塩\n        ↓\n    溶ける\n        ↓\n【水溶液】\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  水と物質がまざった状態\n    │       │\n    └─────┘\n\n【例】\n    食塩水：水 + 食塩\n    砂糖水：水 + 砂糖\n\n水溶液：物質が水に溶けてできた液体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 3,
    text: "水溶液で、とけている物質を何という？",
    choices: ["溶質", "溶媒", "溶液", "沈殿"],
    answer: 0,
    source: "食塩水の中では、食塩と水がいっしょになっています。このうち、水に溶けている食塩のような物質があります。水溶液の中で、溶けている物質を 溶質 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶質\n\n【食塩水】\n    ┌─────┐\n    │  水   │ ← 溶媒（とかす液体）\n    │ 食塩 │ ← 溶質（溶けている物質）\n    │       │\n    └─────┘\n\n【水溶液の構成】\n    水溶液 = 溶質 + 溶媒\n    \n    食塩水 = 食塩（溶質）+ 水（溶媒）\n\n溶質：水溶液の中で溶けている物質</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 4,
    text: "水溶液で、とかすはたらきをする液体を何という？",
    choices: ["溶媒", "溶質", "水溶液", "物質"],
    answer: 0,
    source: "食塩をとかしているのは、水です。このように、物質をとかすはたらきをしている液体があります。水溶液の中で、物質をとかしている液体を 溶媒 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶媒\n\n【食塩水】\n    ┌─────┐\n    │  水   │ ← 溶媒（とかす液体）\n    │ 食塩 │ ← 溶質（溶けている物質）\n    │       │\n    └─────┘\n\n【水溶液の構成】\n    水溶液 = 溶質 + 溶媒\n    \n    食塩水 = 食塩（溶質）+ 水（溶媒）\n\n溶媒：水溶液の中で物質をとかしている液体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 5,
    text: "水にとけにくく、底にたまる物質を何という？",
    choices: ["沈殿", "溶質", "溶媒", "水蒸気"],
    answer: 0,
    source: "水に入れた物質の中には、水に溶けにくいものもあります。溶けなかった物質は、下にたまります。このように、溶けずに下にたまった物質を 沈殿 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">沈殿\n\n【水に溶けにくい物質】\n    ┌─────┐\n    │  水   │\n    │       │\n    ├─────┤\n    │ ● ● │ ← 沈殿（溶けずに下にたまる）\n    │ ● ● │\n    └─────┘\n\n【例】\n    砂：水に溶けにくい → 沈殿\n    食塩：水に溶ける → 沈殿にならない\n\n沈殿：溶けずに下にたまった物質</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // =========================
  // 思考・実験問題（6〜20）
  // =========================
  {
    qnum: 6,
    text: "食塩を水に入れてかき混ぜると見えなくなった。このとき正しい説明はどれ？",
    choices: [
      "食塩は水に溶けて水溶液になった",
      "食塩は消えてなくなった",
      "食塩は蒸発した",
      "食塩は水に変わった"
    ],
    answer: 0,
    source: "食塩を水に入れてかき混ぜると、見えなくなります。これは、食塩が消えたのではなく、水の中に細かく広がったためです。この状態は、食塩が水に溶けて 水溶液 になっています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">食塩が水に溶ける\n\n【食塩を入れる】\n    ┌─────┐\n    │  水   │\n    │ ● ● │  食塩が見える\n    │ ● ● │\n    └─────┘\n        ↓\n    かき混ぜる\n        ↓\n【溶けた後】\n    ┌─────┐\n    │  水   │  見えなくなる\n    │       │  水の中に細かく広がる\n    │       │\n    └─────┘\n    水溶液になった\n\n食塩は消えたのではなく\n水の中に広がっている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 7,
    text: "食塩水をつくる前と後で、全体の重さを比べたとき正しいものはどれ？",
    choices: [
      "溶かす前と後で重さは同じ",
      "溶かした後の方が軽い",
      "溶かす前の方が軽い",
      "条件によって必ず変わる"
    ],
    answer: 0,
    source: "食塩を水に溶かしても、食塩そのものがなくなるわけではありません。水と食塩を合わせた全体の量は変わらないままです。そのため、溶かす前と後で 重さは変わりません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶かす前と後で重さは変わらない\n\n【溶かす前】\n    水：100g\n    食塩：10g\n    ────────\n    合計：110g\n\n【溶かした後】\n    食塩水：110g\n    （水100g + 食塩10g）\n\n【重さの変化】\n    溶かす前：110g\n    溶かした後：110g\n    ────────────\n    重さは変わらない\n\n物質はなくならない → 重さは変わらない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 8,
    text: "同じ量の水に同じ量の食塩を入れたとき、より早く溶ける条件はどれ？",
    choices: [
      "水の温度が高く、よくかき混ぜる",
      "水の温度が低く、かき混ぜない",
      "水の量が少ない",
      "容器が大きい"
    ],
    answer: 0,
    source: "物質が水に溶ける速さは、条件によって変わります。水の温度が高いと、水の動きが大きくなります。また、かき混ぜると、溶けた物質が広がりやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶ける速さを変える条件\n\n【温度が高い】\n    水（高温）\n        ↓\n    水の動きが大きい\n        ↓\n    溶ける速さ：速い\n\n【かき混ぜる】\n    かき混ぜる\n        ↓\n    溶けた物質が広がりやすい\n        ↓\n    溶ける速さ：速い\n\n【条件と速さ】\n    温度が高い + かき混ぜる\n        ↓\n    より速く溶ける\n\n条件によって溶ける速さが変わる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 9,
    text: "水の温度を上げると、多くの固体が溶けやすくなる理由として正しいものはどれ？",
    choices: [
      "水の分子の動きが活発になるから",
      "水の量が増えるから",
      "溶質が軽くなるから",
      "水が気体になるから"
    ],
    answer: 0,
    source: "水をあたためると、水の中の動きが活発になります。すると、固体の物質が水の中に入りやすくなります。そのため、多くの固体は、温度が高いほど溶けやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">温度が高いと溶けやすくなる理由\n\n【温度が低い】\n    水（低温）\n        ↓\n    水の動き：小さい\n        ↓\n    固体が入りにくい\n        ↓\n    溶けにくい\n\n【温度が高い】\n    水（高温）\n        ↓\n    水の動き：活発\n        ↓\n    固体が入りやすい\n        ↓\n    溶けやすい\n\n【関係】\n    温度が高い → 水の動きが活発\n    → 固体が入りやすい → 溶けやすい\n\n温度が高いほど溶けやすくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 10,
    text: "同じ水の量に食塩を少しずつ加えていったとき、ある量以上は溶けなくなった。この状態を何という？",
    choices: ["飽和", "沈殿", "凝固", "蒸発"],
    answer: 0,
    source: "同じ量の水に、食塩を少しずつ加えていくと、あるところで溶けなくなります。これは、水にこれ以上溶けきれなくなった状態です。このような状態を 飽和 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和\n\n【食塩を少しずつ加える】\n    水：100g\n        ↓\n    食塩：10g → 溶ける\n    食塩：20g → 溶ける\n    食塩：30g → 溶ける\n    食塩：40g → 溶けなくなる\n        ↓\n【飽和】\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  これ以上溶けない\n    ├─────┤\n    │ ● ● │  溶けきれない食塩\n    └─────┘\n\n飽和：これ以上溶けきれない状態</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 11,
    text: "飽和した食塩水の底に残った食塩について正しい説明はどれ？",
    choices: [
      "それ以上溶けないため、溶質として残っている",
      "食塩が水に変化した",
      "食塩が蒸発した",
      "水が足りなくなった"
    ],
    answer: 0,
    source: "飽和した食塩水では、もうそれ以上食塩は溶けません。溶けきれなかった食塩は、そのまま下に残ります。この残っている食塩は、なくなったわけではありません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和した食塩水の底に残った食塩\n\n【飽和した食塩水】\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  もうこれ以上溶けない\n    ├─────┤\n    │ ● ● │ ← 溶けきれない食塩\n    │ ● ● │   下に残る\n    └─────┘\n\n【残った食塩】\n    • 溶けきれなかった分\n    • なくなったわけではない\n    • そのまま下に残る\n\n溶けきれなかった食塩は下に残る</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 12,
    text: "同じ体積の水と食塩水を比べたとき、重いのはどちらか？",
    choices: ["食塩水", "水", "同じ重さ", "条件で必ず変わる"],
    answer: 0,
    source: "水に食塩が溶けると、水の中に食塩が加わります。同じ体積で比べると、食塩が入っている分だけ重くなります。そのため、食塩水は水より 重くなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">同じ体積での重さの違い\n\n【水】\n    ┌─────┐\n    │  水   │  体積：100mL\n    │       │  重さ：100g\n    └─────┘\n\n【食塩水】\n    ┌─────┐\n    │  水   │  体積：100mL\n    │ 食塩 │  重さ：110g（水100g + 食塩10g）\n    │       │\n    └─────┘\n\n【比較】\n    同じ体積（100mL）\n    水：100g\n    食塩水：110g\n    ────────────\n    食塩水の方が重い\n\n食塩が加わる → 重くなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 13,
    text: "水に溶けた物質を取り出す方法として適切なものはどれ？",
    choices: [
      "水を蒸発させる",
      "ろ過する",
      "かき混ぜる",
      "冷やすだけ"
    ],
    answer: 0,
    source: "水に溶けている物質は、ろ過では取り出せません。水だけをなくすと、溶けていた物質が残ります。このように、水を蒸発させることで、溶けていた物質を取り出せます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶けた物質を取り出す方法\n\n【食塩水】\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  食塩が溶けている\n    │       │\n    └─────┘\n        ↓\n    水を蒸発させる\n        ↓\n【水をなくす】\n    ┌─────┐\n    │       │  水がなくなる\n    │ ● ● │  食塩が残る\n    │ ● ● │\n    └─────┘\n\n【方法】\n    水を蒸発させる\n        ↓\n    溶けていた物質が残る\n\n水を蒸発させる → 溶けた物質を取り出せる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 14,
    text: "ろ過で分けることができないものはどれ？",
    choices: [
      "食塩水",
      "砂と水の混合物",
      "泥水",
      "砂利と水"
    ],
    answer: 0,
    source: "ろ過は、水に溶けていない固体を分ける方法です。溶けている物質は、水といっしょにろ紙を通り抜けます。そのため、食塩水は、ろ過では分けられません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ろ過で分けられないもの\n\n【食塩水をろ過】\n    食塩水\n        ↓\n    ┌─────┐\n    │ ろ紙 │\n    └─────┘\n        ↓\n    水 + 食塩（両方通り抜ける）\n    分けられない\n\n【砂と水をろ過】\n    砂と水\n        ↓\n    ┌─────┐\n    │ ろ紙 │\n    └─────┘\n        ↓\n    水：通り抜ける\n    砂：ろ紙に残る\n    分けられる\n\n溶けている物質 → ろ過では分けられない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 15,
    text: "同じ水の量で、より多くの食塩を溶かすために有効な方法はどれ？",
    choices: [
      "水の温度を上げる",
      "水の量を減らす",
      "容器を変える",
      "かき混ぜるのをやめる"
    ],
    answer: 0,
    source: "同じ量の水でも、条件を変えると溶ける量が変わります。水をあたためると、より多くの物質が溶けるようになります。そのため、水の温度を上げることが有効です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">より多くの物質を溶かす方法\n\n【水の温度が低い】\n    水：100g（低温）\n        ↓\n    食塩：30gまで溶ける\n\n【水の温度が高い】\n    水：100g（高温）\n        ↓\n    食塩：40gまで溶ける\n\n【関係】\n    温度が高い → より多くの物質が溶ける\n\n【有効な方法】\n    水の温度を上げる\n        ↓\n    より多くの物質が溶ける\n\n温度を上げる → より多く溶ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 16,
    text: "水溶液のこさ（濃さ）を決める主な要素として正しいものはどれ？",
    choices: [
      "溶質の量と溶媒の量",
      "溶質の色",
      "容器の形",
      "水の透明さ"
    ],
    answer: 0,
    source: "水溶液のこさは、どれだけ物質が溶けているかで決まります。同時に、水の量も関係します。このように、溶質の量と溶媒の量で、濃さが決まります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水溶液のこさ（濃さ）\n\n【濃さを決める要素】\n    ① 溶質の量（どれだけ物質が溶けているか）\n    ② 溶媒の量（水の量）\n\n【例】\n    食塩：10g + 水：100g → 濃い\n    食塩：10g + 水：200g → うすい\n\n【関係】\n    溶質が多い → 濃い\n    溶媒が多い → うすい\n\n濃さ = 溶質の量 ÷ 溶媒の量</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 17,
    text: "同じこさの食塩水を2倍にうすめるための操作として正しいものはどれ？",
    choices: [
      "同じ量の水を加える",
      "食塩を取り除く",
      "食塩を加える",
      "水を加熱する"
    ],
    answer: 0,
    source: "同じこさの食塩水をうすくするには、水を足します。食塩の量はそのままで、水の量が増えるからです。水を同じ量だけ加えると、こさは半分になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">食塩水をうすめる方法\n\n【元の食塩水】\n    食塩：10g + 水：100g\n    濃さ：10/100 = 0.1\n\n【水を同じ量だけ加える】\n    食塩：10g + 水：200g（100g + 100g）\n    濃さ：10/200 = 0.05\n\n【変化】\n    濃さ：0.1 → 0.05（半分になる）\n\n【方法】\n    水を同じ量だけ加える\n        ↓\n    食塩の量はそのまま\n    水の量が2倍になる\n        ↓\n    こさは半分になる\n\n水を同じ量だけ加える → こさは半分</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 18,
    text: "水に溶けているかどうかを判断する最も確実な方法はどれ？",
    choices: [
      "ろ過して残るかどうかを調べる",
      "色を見る",
      "においをかぐ",
      "かき混ぜる"
    ],
    answer: 0,
    source: "溶けていない物質は、ろ過するとろ紙に残ります。溶けている物質は、水といっしょに通り抜けます。そのため、ろ過で残るかどうかを調べると、溶けているか判断できます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水に溶けているかどうかの判断\n\n【溶けていない物質（砂）】\n    砂と水\n        ↓\n    ┌─────┐\n    │ ろ紙 │\n    └─────┘\n        ↓\n    砂：ろ紙に残る\n    水：通り抜ける\n        ↓\n    溶けていないと判断\n\n【溶けている物質（食塩）】\n    食塩水\n        ↓\n    ┌─────┐\n    │ ろ紙 │\n    └─────┘\n        ↓\n    食塩：通り抜ける\n    水：通り抜ける\n        ↓\n    溶けていると判断\n\nろ過で残る → 溶けていない\nろ過で通り抜ける → 溶けている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 19,
    text: "食塩水を冷やしたときに起こりやすい変化として正しいものはどれ？",
    choices: [
      "溶けていた食塩が出てくることがある",
      "食塩が完全になくなる",
      "水が必ず凍る",
      "重さが減る"
    ],
    answer: 0,
    source: "多くの固体は、温度が下がると溶けにくくなります。食塩水を冷やすと、溶けていた食塩が出てくることがあります。これは、溶けられる量が少なくなったためです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">冷やすと食塩が出てくる理由\n\n【温度が高いとき】\n    水：100g（高温）\n        ↓\n    食塩：40gまで溶ける\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  40g溶けている\n    └─────┘\n\n【冷やす】\n    水：100g（低温）\n        ↓\n    食塩：30gまでしか溶けない\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  30g溶けている\n    ├─────┤\n    │ ● ● │  10gが出てくる\n    └─────┘\n\n【理由】\n    温度が下がる → 溶けられる量が少なくなる\n    → 溶けていた食塩が出てくる\n\n冷やす → 溶けられる量が減る → 食塩が出てくる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 20,
    text: "溶解の実験結果から結論を出すとき、最も大切な考え方はどれ？",
    choices: [
      "条件と結果の関係を整理すること",
      "用語を暗記すること",
      "見た目で判断すること",
      "速く実験すること"
    ],
    answer: 0,
    source: "実験では、条件を変えると結果も変わります。何を変えて、どうなったかを整理すると、正しい結論が出せます。溶解の実験では、この関係を見ることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解の実験で大切な考え方\n\n【条件と結果の関係】\n    条件を変える → 結果も変わる\n\n【例】\n    条件：温度を上げる\n    結果：より多く溶ける\n    \n    条件：かき混ぜる\n    結果：速く溶ける\n\n【大切な考え方】\n    ✓ 何を変えたか（条件）\n    ✓ どうなったか（結果）\n    ✓ 条件と結果の関係を整理する\n\n【見てはいけないこと】\n    × 用語を暗記するだけ\n    × 見た目で判断するだけ\n    × 速く実験するだけ\n\n条件と結果の関係を整理することが大切</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 21,
    text: "砂糖を水に入れてかき混ぜると見えなくなる理由として正しいものはどれか。",
    choices: [
      "砂糖が水の中に広がるから",
      "砂糖が消えるから",
      "砂糖が軽くなるから",
      "水がなくなるから"
    ],
    answer: 0,
    source: "砂糖を水に入れると、だんだん見えなくなります。これは砂糖が消えたのではなく、水の中に細かく広がったためです。このように、物質が水の中に広がることを 溶解 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">砂糖が水に溶ける\n\n【砂糖を入れる】\n    ┌─────┐\n    │  水   │\n    │ ● ● │  砂糖が見える\n    │ ● ● │\n    └─────┘\n        ↓\n    かき混ぜる\n        ↓\n【溶けた後】\n    ┌─────┐\n    │  水   │  見えなくなる\n    │       │  水の中に細かく広がる\n    │       │\n    └─────┘\n\n砂糖は消えたのではなく\n水の中に広がっている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 22,
    text: "食塩と砂をそれぞれ水に入れたとき、ちがいとして正しいものはどれか。",
    choices: [
      "食塩は溶け、砂は溶けない",
      "どちらも溶ける",
      "どちらも消える",
      "食塩だけ沈殿する"
    ],
    answer: 0,
    source: "食塩は水の中に広がり、水と一体になります。一方、砂は水の中に広がらず、下にたまります。水に溶けるかどうかは、物質によってちがいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">食塩と砂の違い\n\n【食塩】\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  水の中に広がる\n    │       │  水と一体になる\n    └─────┘\n    溶ける\n\n【砂】\n    ┌─────┐\n    │  水   │\n    │       │\n    ├─────┤\n    │ ● ● │  下にたまる\n    │ ● ● │  広がらない\n    └─────┘\n    溶けない\n\n水に溶けるかどうかは\n物質によってちがう</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 23,
    text: "水にたらしたインクが広がっていく様子について、正しい説明はどれか。",
    choices: [
      "インクの成分が水の中に広がっている",
      "インクが水に変わっている",
      "水がインクに変わっている",
      "インクが沈殿している"
    ],
    answer: 0,
    source: "インクを水に入れると、色が広がっていきます。これは、インクの中の物質が水の中に広がっているためです。見えなくなる場合でも、物質は水の中に残っています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">インクが広がる理由\n\n【インクをたらす】\n    ┌─────┐\n    │  水   │\n    │  ●   │  インク（濃い色）\n    │       │\n    └─────┘\n        ↓\n    時間がたつ\n        ↓\n【広がる】\n    ┌─────┐\n    │ ● ● │  色が広がる\n    │ ● ● │  インクの成分が\n    │ ● ● │  水の中に広がる\n    └─────┘\n\n【見えなくなる場合】\n    色がうすくなる\n    でも物質は水の中に残っている\n\nインクの成分が水の中に広がっている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 24,
    text: "こんぶを水につけると、味が出る理由として正しいものはどれか。",
    choices: [
      "こんぶの成分が水に溶け出すから",
      "こんぶが消えるから",
      "水がこんぶになるから",
      "空気が入るから"
    ],
    answer: 0,
    source: "こんぶを水につけると、味のもとになる成分が水の中に出てきます。これは、こんぶの成分が水に溶けて広がったためです。このように、固体の成分が水に溶けることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">こんぶから味が出る理由\n\n【こんぶを水につける前】\n    ┌─────┐\n    │  水   │\n    └─────┘\n    ┌─────┐\n    │ こんぶ│  味の成分が中にある\n    └─────┘\n\n【こんぶを水につける】\n    ┌─────┐\n    │  水   │\n    │ 成分 │  味の成分が溶け出す\n    │       │\n    └─────┘\n    ┌─────┐\n    │ こんぶ│\n    └─────┘\n\n【変化】\n    こんぶの成分が水に溶ける\n        ↓\n    味が出る\n\n固体の成分が水に溶ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 25,
    text: "「物質が水に溶けると、なくなる」という考えについて正しいものはどれか。",
    choices: [
      "物質は水の中に広がっているだけ",
      "物質は完全になくなる",
      "水だけが残る",
      "空気に変わる"
    ],
    answer: 0,
    source: "物質が水に溶けても、消えてなくなるわけではありません。水の中に細かく広がって、見えなくなっているだけです。溶けた物質は、水の中に残っています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「物質が水に溶けると、なくなる」という考え\n\n【誤った考え】\n    × 物質が消えてなくなる\n    × 物質が完全になくなる\n    × 水だけが残る\n\n【正しい考え】\n    ✓ 物質は水の中に広がっているだけ\n    ✓ 見えなくなっているだけ\n    ✓ 物質は水の中に残っている\n\n【例】\n    ┌─────┐\n    │  水   │\n    │ ● ● │  物質が見える\n    │ ● ● │\n    └─────┘\n        ↓\n    溶ける\n        ↓\n    ┌─────┐\n    │  水   │\n    │       │  見えなくなる\n    │       │  でも中に残っている\n    └─────┘\n\n物質は水の中に広がっているだけ</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 26,
    text: "透明な水溶液について、正しい説明はどれか。",
    choices: [
      "水以外の物質が溶けていることがある",
      "水しか入っていない",
      "何も入っていない",
      "空気だけが入っている"
    ],
    answer: 0,
    source: "食塩水や砂糖水は、透明に見えます。しかし、中には食塩や砂糖が水に溶けています。透明でも、水以外の物質がふくまれていることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">透明な水溶液について\n\n【透明な水溶液】\n    ┌─────┐\n    │       │  透明に見える\n    │  水   │\n    │       │\n    └─────┘\n\n【中身】\n    食塩水：水 + 食塩（溶けている）\n    砂糖水：水 + 砂糖（溶けている）\n\n【誤った考え】\n    × 透明なら水だけ\n    × 何も入っていない\n    × 空気だけが入っている\n\n【正しい考え】\n    ✓ 透明でも水以外の物質が\n      ふくまれていることがある\n\n透明でも水以外の物質が溶けている</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 27,
    text: "「かき混ぜれば、どんな物質でも水に溶ける」という考えについて正しいものはどれか。",
    choices: [
      "溶けるかどうかは物質によってちがう",
      "どんな物質も必ず溶ける",
      "早くかき混ぜれば溶ける",
      "時間をかければ溶ける"
    ],
    answer: 0,
    source: "水に溶けるかどうかは、物質の性質で決まります。かき混ぜると速く溶けますが、溶けるかどうかは変わりません。溶けない物質は、どれだけかき混ぜても溶けません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「かき混ぜれば、どんな物質でも水に溶ける」という考え\n\n【誤った考え】\n    × どんな物質も必ず溶ける\n    × 早くかき混ぜれば溶ける\n    × 時間をかければ溶ける\n\n【正しい考え】\n    ✓ 溶けるかどうかは物質によってちがう\n    ✓ かき混ぜると速く溶けるが\n      溶けるかどうかは変わらない\n\n【例】\n    食塩：かき混ぜる → 速く溶ける\n    砂：かき混ぜる → 溶けない\n\n【関係】\n    かき混ぜる → 溶ける速さが変わる\n    かき混ぜる → 溶けるかどうかは変わらない\n\n溶けるかどうかは物質の性質で決まる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 28,
    text: "水をあたためると、多くの固体が溶けやすくなる理由として正しいものはどれか。",
    choices: [
      "水の中の動きが活発になるから",
      "水の量が増えるから",
      "空気が入るから",
      "水が軽くなるから"
    ],
    answer: 0,
    source: "水をあたためると、水の中の動きが大きくなります。すると、固体の物質が水の中に入りやすくなります。そのため、多くの固体は温度が高いほど溶けやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水をあたためると溶けやすくなる理由\n\n【温度が低い】\n    水（低温）\n        ↓\n    水の動き：小さい\n        ↓\n    固体が入りにくい\n        ↓\n    溶けにくい\n\n【温度が高い】\n    水（高温）\n        ↓\n    水の動き：活発（大きい）\n        ↓\n    固体が入りやすい\n        ↓\n    溶けやすい\n\n【関係】\n    温度が高い → 水の動きが活発\n    → 固体が入りやすい → 溶けやすい\n\n水の中の動きが活発になる → 溶けやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 29,
    text: "食塩水を冷やすと、食塩が出てくることがある理由として正しいものはどれか。",
    choices: [
      "溶けることができる量が少なくなるから",
      "食塩が重くなるから",
      "水がなくなるから",
      "空気が入るから"
    ],
    answer: 0,
    source: "多くの固体は、温度が下がると溶けにくくなります。冷やすと、水に溶けていられる量が少なくなります。そのため、溶けていた食塩が出てくることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">冷やすと食塩が出てくる理由\n\n【温度が高いとき】\n    水：100g（高温）\n        ↓\n    食塩：40gまで溶ける\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  40g溶けている\n    └─────┘\n\n【冷やす】\n    水：100g（低温）\n        ↓\n    食塩：30gまでしか溶けない\n    ┌─────┐\n    │  水   │\n    │ 食塩 │  30g溶けている\n    ├─────┤\n    │ ● ● │  10gが出てくる\n    └─────┘\n\n【理由】\n    温度が下がる → 溶けられる量が少なくなる\n    → 溶けていた食塩が出てくる\n\n溶けることができる量が少なくなる → 食塩が出てくる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 30,
    text: "「物質が水に溶ける」現象を考えるときに大切な見方として正しいものはどれか。",
    choices: [
      "見えなくなっても中にあると考える",
      "見えなくなったらなくなったと考える",
      "透明なら水だけだと考える",
      "色だけで判断する"
    ],
    answer: 0,
    source: "物質が水に溶けると、見えなくなることがあります。しかし、物質は水の中に広がって残っています。理科では、見えなくなっても中にあると考えることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「物質が水に溶ける」現象を考えるときの見方\n\n【物質が水に溶ける】\n    ┌─────┐\n    │  水   │\n    │ ● ● │  物質が見える\n    │ ● ● │\n    └─────┘\n        ↓\n    溶ける\n        ↓\n    ┌─────┐\n    │  水   │\n    │       │  見えなくなる\n    │       │  でも中に残っている\n    └─────┘\n\n【大切な見方】\n    ✓ 見えなくなっても中にあると考える\n    ✓ 物質は水の中に広がって残っている\n\n【見てはいけないこと】\n    × 見えなくなったらなくなったと考える\n    × 透明なら水だけだと考える\n    × 色だけで判断する\n\n見えなくなっても中にあると考えることが大切</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  }
];
