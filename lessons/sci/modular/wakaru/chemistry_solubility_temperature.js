// chemistry_solubility_temperature.js
window.questions = [

  // =========================
  // 超基本語彙チェック（1〜5）
  // =========================
  {
    qnum: 1,
    text: "一定の温度で、水100gに溶ける物質の最大の量を何という？",
    choices: ["溶解度", "濃度", "飽和", "溶質量"],
    answer: 0,
    source: "水に物質を入れると、ある量までは溶けますが、それ以上は溶けません。この「どこまで溶けるか」は、温度が同じなら決まった量になります。一定の温度で、水100gに溶ける物質の最大の量を 溶解度 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度\n\n【水に物質を入れる】\n    水：100g\n        ↓\n    物質を少しずつ加える\n        ↓\n    10g → 溶ける\n    20g → 溶ける\n    30g → 溶ける\n    40g → 溶けなくなる\n        ↓\n【限界】\n    ある量までは溶ける\n    それ以上は溶けない\n\n【溶解度】\n    一定の温度で\n    水100gに溶ける物質の最大の量\n\n温度が同じなら決まった量</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 2,
    text: "ある温度で、それ以上物質が溶けなくなった水溶液を何という？",
    choices: ["飽和水溶液", "希薄水溶液", "濃水溶液", "混合物"],
    answer: 0,
    source: "水に物質を入れていくと、あるところでそれ以上溶けなくなります。このとき、水の中には溶けきれない物質が残ります。このような水溶液を 飽和水溶液 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和水溶液\n\n【物質を入れていく】\n    水：100g\n        ↓\n    物質を加える\n        ↓\n    10g → 溶ける\n    20g → 溶ける\n    30g → 溶ける\n    40g → 溶けなくなる\n        ↓\n【飽和水溶液】\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  10g溶けきれない\n    │ ● ● │  下に残る\n    └─────┘\n\nこれ以上溶けない状態</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 3,
    text: "温度と溶解度の関係を表したグラフを何という？",
    choices: ["溶解度曲線", "状態変化曲線", "温度曲線", "比例グラフ"],
    answer: 0,
    source: "物質がどれくらい溶けるかは、温度によって変わります。温度ごとに溶解度を調べて、点をつないでいくと線になります。この、温度と溶解度の関係を表したグラフを 溶解度曲線 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度曲線\n\n【温度ごとの溶解度】\n    0℃：20g\n    20℃：30g\n    40℃：40g\n    60℃：50g\n\n【グラフ】\n  溶解度(g)\n    ↑\n  50│        ●\n    │      ╱\n  40│    ●\n    │  ╱\n  30│●\n    │\n  20│●\n    └──────────→ 温度(℃)\n    0  20  40  60\n\n【点をつなぐ】\n    点をつないでいく\n        ↓\n    線（曲線）になる\n        ↓\n    溶解度曲線\n\n温度と溶解度の関係を表したグラフ</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 4,
    text: "溶解度が温度によって変化するのは、主に何が変わるためか？",
    choices: ["水の分子の動き", "水の重さ", "容器の大きさ", "溶質の色"],
    answer: 0,
    source: "水をあたためると、水の中の動きが活発になります。すると、固体の物質が水の中に入りやすくなります。このように、水の動きが変わることで、溶解度も変わります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">温度と溶解度の関係\n\n【温度が低い】\n    水（低温）\n        ↓\n    水の動き：小さい\n        ↓\n    固体が入りにくい\n        ↓\n    溶解度：小さい\n\n【温度が高い】\n    水（高温）\n        ↓\n    水の動き：活発\n        ↓\n    固体が入りやすい\n        ↓\n    溶解度：大きい\n\n【関係】\n    水をあたためる\n        ↓\n    水の動きが活発になる\n        ↓\n    溶解度が変わる\n\n水の動きが変わる → 溶解度も変わる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 5,
    text: "溶解度が大きい物質ほど、同じ量の水に多く溶けることを何という？",
    choices: ["溶けやすい", "重い", "濃い", "沈みやすい"],
    answer: 0,
    source: "同じ量の水でも、物質によって溶ける量はちがいます。たくさん溶ける物質ほど、同じ水の量に多く入ることができます。このような物質を 溶けやすい といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶けやすい物質\n\n【同じ量の水（100g）】\n    物質A：10gまで溶ける\n    物質B：30gまで溶ける\n    物質C：50gまで溶ける\n\n【比較】\n    物質A：溶けにくい（溶解度：10g）\n    物質B：普通（溶解度：30g）\n    物質C：溶けやすい（溶解度：50g）\n\n【溶けやすい物質】\n    たくさん溶ける物質\n    同じ水の量に多く入ることができる\n\n物質によって溶ける量はちがう</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // =========================
  // 思考・条件判断問題（6〜20）
  // =========================
  {
    qnum: 6,
    text: "水100gにある物質が20g溶けている。この温度での溶解度が30gであるとき、正しい説明はどれ？",
    choices: [
      "まだ10g溶かすことができる",
      "すでに飽和している",
      "溶けすぎている",
      "溶解度は20gである"
    ],
    answer: 0,
    source: "この温度では、水100gに最大30gまで溶けます。いま溶けている量は20gなので、まだ余裕があります。30gまでのうち、あと 10g は溶かすことができます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">まだ溶かすことができる量\n\n【現在の状態】\n    水：100g\n    溶けている量：20g\n    溶解度：30g\n\n【計算】\n    溶解度：30g（最大）\n    溶けている：20g\n    ────────────\n    あと溶かせる：10g\n\n【状態】\n    ┌─────┐\n    │  水   │\n    │ 物質 │  20g溶けている\n    │       │  まだ余裕がある\n    └─────┘\n\nあと10gは溶かすことができる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 7,
    text: "水100gに物質が溶けており、これ以上溶けない状態を何という？",
    choices: ["飽和", "沈殿", "凝固", "蒸発"],
    answer: 0,
    source: "水に物質を入れていき、これ以上溶けなくなった状態があります。この状態では、どれだけ加えても溶けません。この「これ以上溶けない状態」を 飽和 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和\n\n【物質を入れていく】\n    水：100g\n        ↓\n    10g → 溶ける\n    20g → 溶ける\n    30g → 溶ける（限界）\n    40g → 溶けない\n        ↓\n【飽和】\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  10g溶けきれない\n    │ ● ● │  どれだけ加えても溶けない\n    └─────┘\n\nこれ以上溶けない状態</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 8,
    text: "同じ水の量で、温度を上げたときに起こりやすい変化として正しいものはどれ？",
    choices: [
      "より多くの物質が溶ける",
      "必ず沈殿ができる",
      "水の量が増える",
      "溶解度が小さくなる"
    ],
    answer: 0,
    source: "多くの固体は、温度が高いほど溶けやすくなります。水をあたためると、水の中の動きが大きくなるからです。そのため、同じ水の量でも、より多くの物質が溶けます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">温度を上げるとより多く溶ける\n\n【温度が低い】\n    水：100g（低温）\n        ↓\n    水の動き：小さい\n        ↓\n    物質：20gまで溶ける\n\n【温度が高い】\n    水：100g（高温）\n        ↓\n    水の動き：大きい\n        ↓\n    物質：40gまで溶ける\n\n【関係】\n    温度が高い → 水の動きが大きい\n    → より多くの物質が溶ける\n\n温度が高いほど溶けやすくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 9,
    text: "溶解度曲線を用いて溶ける量を求めるとき、必ず確認する必要がある条件はどれ？",
    choices: [
      "温度と水の量",
      "容器の形",
      "かき混ぜる速さ",
      "水の色"
    ],
    answer: 0,
    source: "溶解度は、決まった条件で比べる必要があります。基準になるのは、温度 と 水100g です。この2つを確認しないと、正しい量は求められません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度を求める条件\n\n【基準となる条件】\n    ① 温度（一定の温度）\n    ② 水100g\n\n【例】\n    温度：20℃\n    水：100g\n        ↓\n    溶解度：30g\n\n【条件がちがうと】\n    温度：40℃（ちがう）\n    水：100g\n        ↓\n    溶解度：40g（ちがう）\n\n【大切なこと】\n    温度と水100gを確認しないと\n    正しい量は求められない\n\n温度と水100gが基準</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 10,
    text: "ある温度で溶解度が40gの物質を、水200gに溶かすとき、最大で溶ける量はどれ？",
    choices: ["80g", "40g", "20g", "200g"],
    answer: 0,
    source: "溶解度が40gとは、水100gに40gまで溶けるという意味です。水が200gなら、その2倍の量まで溶けます。そのため、最大で 80g 溶けます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水の量と溶ける量の関係\n\n【溶解度が40g】\n    水100gに40gまで溶ける\n\n【水が200gの場合】\n    水：200g（2倍）\n        ↓\n    溶ける量：80g（2倍）\n\n【計算】\n    水100g：40g\n    水200g：40g × 2 = 80g\n\n【関係】\n    水の量が2倍 → 溶ける量も2倍\n\n水が200gなら最大80g溶ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 11,
    text: "飽和水溶液を冷やしたときに起こりやすい変化として正しいものはどれ？",
    choices: [
      "溶けていた物質が出てくる",
      "必ずすべて溶ける",
      "水の量が増える",
      "溶解度が大きくなる"
    ],
    answer: 0,
    source: "多くの固体は、温度が下がると溶けにくくなります。飽和水溶液を冷やすと、溶けていた物質が水の中にいられなくなります。その結果、物質が外に出てくることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和水溶液を冷やすと\n\n【あたたかいとき】\n    水：100g（高温）\n    溶解度：50g\n    ┌─────┐\n    │  水   │\n    │ 物質 │  50g溶けている\n    └─────┘\n\n【冷やす】\n    水：100g（低温）\n    溶解度：30g（下がる）\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  20gが出てくる\n    │ ● ● │\n    └─────┘\n\n温度が下がる → 溶解度が下がる\n→ 溶けていた物質が出てくる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 12,
    text: "溶解度が温度によって大きく変わる物質の特徴として正しいものはどれ？",
    choices: [
      "温度を上げると多く溶ける",
      "温度を下げると必ず溶ける",
      "温度に関係なく一定",
      "水の量で決まる"
    ],
    answer: 0,
    source: "温度を上げると、溶解度が大きく変わる物質があります。これは、あたためることで溶けやすくなるためです。このような物質は、温度が高いほど多く溶けます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">温度によって大きく変わる物質\n\n【温度と溶解度】\n    0℃：10g\n    20℃：30g\n    40℃：50g\n    60℃：70g\n\n【グラフ】\n  溶解度(g)\n    ↑\n  70│        ●\n    │      ╱\n  50│    ●\n    │  ╱\n  30│●\n    │\n  10│●\n    └──────────→ 温度(℃)\n    0  20  40  60\n\n【特徴】\n    温度を上げると\n    溶解度が大きく変わる\n        ↓\n    温度が高いほど多く溶ける\n\n温度を上げると多く溶ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 13,
    text: "同じ温度・同じ水の量で、溶解度が異なる2つの物質を比べたとき、正しい説明はどれ？",
    choices: [
      "溶解度が大きい方が多く溶ける",
      "どちらも同じ量だけ溶ける",
      "重い方が多く溶ける",
      "粒が小さい方が多く溶ける"
    ],
    answer: 0,
    source: "温度と水の量が同じなら、溶解度の大きさで比べます。溶解度が大きい物質ほど、水に多く溶けます。重さや粒の大きさでは決まりません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度の比較\n\n【同じ条件】\n    温度：20℃（同じ）\n    水：100g（同じ）\n\n【物質Aと物質B】\n    物質A：溶解度20g\n    物質B：溶解度40g\n\n【比較】\n    溶解度が大きい：物質B\n        ↓\n    物質Bの方が多く溶ける\n\n【決まらないもの】\n    × 重さ\n    × 粒の大きさ\n\n【決まるもの】\n    ✓ 溶解度の大きさ\n\n溶解度が大きいほど多く溶ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 14,
    text: "溶解度曲線より上の点が表す状態として正しいものはどれ？",
    choices: [
      "その条件では溶けきれず、物質が残る",
      "必ずすべて溶ける",
      "溶解度と同じ状態",
      "水が不足している"
    ],
    answer: 0,
    source: "溶解度曲線は、「ここまでなら溶ける」という限界を表しています。曲線より上の点は、その限界をこえています。そのため、物質はすべて溶けきれず、残りが出ます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度曲線より上の点\n\n【溶解度曲線】\n  溶解度(g)\n    ↑\n  50│━━━━━━━━━━━━━━ 曲線（限界）\n    │\n  40│\n    │\n  30│\n    │\n  20│\n    └──────────→ 温度(℃)\n\n【曲線より上の点】\n    温度：20℃\n    物質：50g（曲線より上）\n        ↓\n    限界をこえている\n        ↓\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  20g溶けきれない\n    └─────┘\n\n限界をこえている → 残りが出る</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 15,
    text: "溶解度曲線より下の点が表す状態として正しいものはどれ？",
    choices: [
      "まだ溶かすことができる",
      "必ず沈殿ができる",
      "すでに飽和している",
      "溶解度を超えている"
    ],
    answer: 0,
    source: "溶解度曲線より下の点は、まだ限界に達していません。この条件では、さらに物質を加えても溶かすことができます。まだ溶ける余地がある状態です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度曲線より下の点\n\n【溶解度曲線】\n  溶解度(g)\n    ↑\n  50│━━━━━━━━━━━━━━ 曲線（限界）\n    │\n  40│\n    │\n  30│\n    │\n  20│\n    └──────────→ 温度(℃)\n\n【曲線より下の点】\n    温度：20℃\n    物質：20g（曲線より下）\n        ↓\n    限界に達していない\n        ↓\n    ┌─────┐\n    │  水   │\n    │ 物質 │  20g溶けている\n    │       │  まだ溶ける余地がある\n    └─────┘\n\n限界に達していない → まだ溶かせる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 16,
    text: "溶解度が30gの物質が水100gに25g溶けている。この水溶液の状態として正しいものはどれ？",
    choices: [
      "まだ溶かすことができる",
      "飽和している",
      "沈殿ができている",
      "溶解度が25gである"
    ],
    answer: 0,
    source: "この温度では、水100gに30gまで溶けます。いま溶けているのは25gなので、限界には達していません。そのため、まだ 溶かすことができる 状態です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">まだ溶かすことができる状態\n\n【現在の状態】\n    水：100g\n    溶解度：30g（限界）\n    溶けている：25g\n\n【計算】\n    溶解度：30g\n    溶けている：25g\n    ────────────\n    あと溶かせる：5g\n\n【状態】\n    ┌─────┐\n    │  水   │\n    │ 物質 │  25g溶けている\n    │       │  限界に達していない\n    └─────┘\n\nまだ溶かすことができる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 17,
    text: "溶解度を比べるとき、正しい比較の方法はどれ？",
    choices: [
      "同じ温度・同じ水の量で比べる",
      "水の量を変えて比べる",
      "温度を自由に変えて比べる",
      "見た目で判断する"
    ],
    answer: 0,
    source: "溶解度は、条件が同じでないと正しく比べられません。温度と水の量をそろえて比べる必要があります。条件がちがうと、意味のある比較になりません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度を比べるとき\n\n【正しい比較】\n    物質A：温度20℃、水100g → 30g\n    物質B：温度20℃、水100g → 40g\n        ↓\n    条件が同じ\n        ↓\n    正しく比べられる\n    物質Bの方が大きい\n\n【間違った比較】\n    物質A：温度20℃、水100g → 30g\n    物質B：温度40℃、水100g → 40g\n        ↓\n    条件がちがう\n        ↓\n    意味のある比較にならない\n\n【大切なこと】\n    温度と水の量をそろえる\n        ↓\n    正しく比べられる\n\n条件をそろえて比べる必要がある</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 18,
    text: "溶解度が大きいことと、水溶液のこさが濃いことの関係として正しいものはどれ？",
    choices: [
      "必ずしも同じではない",
      "必ず同じである",
      "溶解度が大きいほど必ず濃い",
      "溶解度は関係ない"
    ],
    answer: 0,
    source: "溶解度は「最大でどれだけ溶けるか」を表します。水溶液のこさは、「実際にどれだけ溶かしたか」で決まります。そのため、溶解度が大きくても、必ず濃いとは限りません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度と水溶液のこさ\n\n【溶解度】\n    「最大でどれだけ溶けるか」\n    例：溶解度50g\n        → 最大50gまで溶ける\n\n【水溶液のこさ】\n    「実際にどれだけ溶かしたか」\n    例：10g溶かした → うすい\n    例：50g溶かした → 濃い\n\n【例】\n    溶解度：50g（大きい）\n    実際に溶かした：10g\n        ↓\n    うすい水溶液\n\n【関係】\n    溶解度が大きくても\n    実際に溶かした量が少なければ\n    うすい水溶液になる\n\n溶解度が大きくても必ず濃いとは限らない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 19,
    text: "溶解度の実験結果から結論を出すとき、最も大切な考え方はどれ？",
    choices: [
      "温度と溶ける量の関係を見ること",
      "用語を暗記すること",
      "グラフをきれいに書くこと",
      "水の色を見ること"
    ],
    answer: 0,
    source: "溶解度の実験では、温度を変えて結果を比べます。どの温度で、どれだけ溶けたかを見ることが重要です。この関係を整理して考えることが、正しい結論につながります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度の実験で大切な考え方\n\n【実験の方法】\n    温度を変える\n        ↓\n    結果を比べる\n\n【見るべきこと】\n    ① どの温度で\n    ② どれだけ溶けたか\n\n【例】\n    温度：0℃ → 20g溶けた\n    温度：20℃ → 30g溶けた\n    温度：40℃ → 40g溶けた\n        ↓\n    関係を整理する\n        ↓\n    温度が高いほど多く溶ける\n\n【大切な考え方】\n    温度と溶ける量の関係を見る\n    関係を整理して考える\n        ↓\n    正しい結論につながる\n\n温度と溶ける量の関係を見ることが大切</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // ★ 問20：メタ設問を差し替え
  {
    qnum: 20,
    text: "溶解度が50gの物質が水100gにちょうど溶けている。この水溶液を10℃下げたところ、溶解度が30gになった。起こる変化として正しいものはどれ？",
    choices: [
      "20gの物質が出てくる",
      "20g多く溶ける",
      "すべて溶けたままである",
      "水の量が減る"
    ],
    answer: 0,
    source: "はじめは、水100gに50gまで溶けていました。温度を下げると、溶解度は30gに下がります。このとき、20g分は溶けきれなくなり、水の中から出てきます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">温度を下げると物質が出てくる\n\n【はじめ】\n    水：100g（高温）\n    溶解度：50g\n    ┌─────┐\n    │  水   │\n    │ 物質 │  50g溶けている\n    └─────┘\n        ↓\n    温度を10℃下げる\n        ↓\n【温度を下げた後】\n    水：100g（低温）\n    溶解度：30g（下がる）\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  20gが出てくる\n    │ ● ● │\n    └─────┘\n\n【計算】\n    はじめ：50g溶けている\n    溶解度：30gに下がる\n    ────────────\n    20gが出てくる\n\n温度を下げる → 溶解度が下がる → 物質が出てくる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 21,
    text: "あたたかいレモン水のほうが、砂糖を多く入れられる理由として正しいものはどれか。",
    choices: [
      "温度が高いと溶解度が大きくなるから",
      "水の量が増えるから",
      "砂糖が軽くなるから",
      "かき混ぜやすいから"
    ],
    answer: 0,
    source: "水に溶ける量には限界があります。この限界は温度によって変わります。多くの固体は、温度が高いほど多く溶けます。この「最大で溶ける量」を 溶解度 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">あたたかいレモン水で砂糖を多く入れられる理由\n\n【冷たい水】\n    水：100g（低温）\n    溶解度：30g（限界）\n    砂糖：30gまで入れられる\n\n【あたたかい水】\n    水：100g（高温）\n    溶解度：50g（限界）\n    砂糖：50gまで入れられる\n\n【関係】\n    温度が高い → 溶解度が大きい\n        ↓\n    より多く砂糖を入れられる\n\n【溶解度】\n    「最大で溶ける量」\n    温度によって変わる\n\n温度が高いと溶解度が大きくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 22,
    text: "あたたかいときに作った砂糖水を冷やすと、底に砂糖が出てくる理由として正しいものはどれか。",
    choices: [
      "温度が下がると溶解度が小さくなるから",
      "砂糖が重くなるから",
      "水が減るから",
      "空気が入るから"
    ],
    answer: 0,
    source: "多くの固体は、温度が下がると溶けにくくなります。冷やすと、水に溶けていられる量が少なくなります。そのため、溶けていた砂糖が外に出てきます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">あたたかい砂糖水を冷やすと\n\n【あたたかいとき】\n    水：100g（高温）\n    溶解度：50g\n    ┌─────┐\n    │  水   │\n    │ 砂糖 │  50g溶けている\n    └─────┘\n        ↓\n    冷やす\n        ↓\n【冷やした後】\n    水：100g（低温）\n    溶解度：30g（下がる）\n    ┌─────┐\n    │  水   │\n    │ 砂糖 │  30g溶けている\n    ├─────┤\n    │ ● ● │  20gが出てくる\n    │ ● ● │  底にたまる\n    └─────┘\n\n温度が下がる → 溶解度が小さくなる\n→ 砂糖が出てくる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 23,
    text: "水溶液を冷やしたときに、溶けていた物質が固体として出てくる現象を何というか。",
    choices: [
      "再結晶",
      "沈殿",
      "蒸発",
      "凝固"
    ],
    answer: 0,
    source: "あたたかい水では多く溶けていた物質も、冷やすと溶けきれなくなります。このとき、溶けていた物質が固体として出てきます。この現象を 再結晶 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">再結晶\n\n【あたたかい水】\n    水：100g（高温）\n    溶解度：50g\n    ┌─────┐\n    │  水   │\n    │ 物質 │  50g溶けている\n    └─────┘\n        ↓\n    冷やす\n        ↓\n【冷やした後】\n    水：100g（低温）\n    溶解度：30g（下がる）\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    ├─────┤\n    │ ● ● │  20gが固体として出てくる\n    │ ● ● │  再結晶\n    └─────┘\n\n【再結晶】\n    溶けていた物質が\n    固体として出てくる現象\n\n冷やす → 再結晶が起こる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 24,
    text: "冷たい飲み物より、あたたかい飲み物のほうが甘く感じやすい理由として正しいものはどれか。",
    choices: [
      "温度が高いと、より多く砂糖を溶かせるから",
      "水の量が増えるから",
      "砂糖の味が変わるから",
      "空気が入るから"
    ],
    answer: 0,
    source: "同じ量の水でも、温度によって溶ける量が変わります。あたたかい水では、砂糖が多く溶けます。そのため、同じ水の量でも甘く感じやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">あたたかい飲み物が甘く感じやすい理由\n\n【冷たい飲み物】\n    水：100g（低温）\n    溶解度：30g\n    砂糖：30gまで溶ける\n    甘さ：普通\n\n【あたたかい飲み物】\n    水：100g（高温）\n    溶解度：50g\n    砂糖：50gまで溶ける\n    甘さ：強い\n\n【関係】\n    温度が高い → より多く砂糖を溶かせる\n        ↓\n    同じ水の量でも甘く感じやすい\n\n温度が高いとより多く砂糖を溶かせる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 25,
    text: "「かき混ぜ続ければ、いくらでも溶ける」という考えについて正しいものはどれか。",
    choices: [
      "溶ける量には限界がある",
      "かき混ぜれば必ず溶ける",
      "時間をかければ溶ける",
      "粉にすれば無限に溶ける"
    ],
    answer: 0,
    source: "水に溶ける量には、温度ごとに限界があります。かき混ぜると溶ける速さは変わりますが、限界は変わりません。この限界を 溶解度 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「かき混ぜ続ければ、いくらでも溶ける」という考え\n\n【誤った考え】\n    × かき混ぜれば必ず溶ける\n    × 時間をかければ溶ける\n    × 粉にすれば無限に溶ける\n\n【正しい考え】\n    ✓ 溶ける量には限界がある\n    ✓ かき混ぜると速さは変わるが\n      限界は変わらない\n\n【例】\n    温度：20℃\n    溶解度：30g（限界）\n        ↓\n    かき混ぜる\n        ↓\n    速く溶けるが\n    30gが限界（変わらない）\n\n【溶解度】\n    温度ごとに決まった限界\n    かき混ぜても変わらない\n\n溶ける量には限界がある</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 26,
    text: "「溶解度が大きい水溶液は、必ずこい」という考えについて正しいものはどれか。",
    choices: [
      "実際に溶かした量でこさは決まる",
      "必ずこくなる",
      "温度だけで決まる",
      "水の量は関係ない"
    ],
    answer: 0,
    source: "溶解度は「最大でどれだけ溶けるか」を表します。水溶液のこさは、「実際にどれだけ溶かしたか」で決まります。溶解度が大きくても、うすい水溶液になることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「溶解度が大きい水溶液は、必ずこい」という考え\n\n【誤った考え】\n    × 溶解度が大きい → 必ずこい\n    × 温度だけで決まる\n    × 水の量は関係ない\n\n【正しい考え】\n    ✓ 実際に溶かした量でこさは決まる\n    ✓ 溶解度が大きくても\n      うすい水溶液になることがある\n\n【例】\n    溶解度：50g（大きい）\n    実際に溶かした：10g\n        ↓\n    うすい水溶液\n\n【関係】\n    溶解度：「最大でどれだけ溶けるか」\n    こさ：「実際にどれだけ溶かしたか」\n\n実際に溶かした量でこさは決まる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 27,
    text: "溶解度について、正しい考え方はどれか。",
    choices: [
      "温度と水の量をそろえて比べる",
      "粒の大きさで決める",
      "色のこさで決める",
      "重さだけで決める"
    ],
    answer: 0,
    source: "溶解度は、決まった条件で比べる必要があります。基準になるのは、温度と水100gです。この条件をそろえてはじめて、正しく比べられます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度についての正しい考え方\n\n【基準となる条件】\n    ① 温度\n    ② 水100g\n\n【正しい考え方】\n    ✓ 温度と水の量をそろえて比べる\n        ↓\n    正しく比べられる\n\n【間違った考え方】\n    × 粒の大きさで決める\n    × 色のこさで決める\n    × 重さだけで決める\n\n【例】\n    物質A：温度20℃、水100g → 30g\n    物質B：温度20℃、水100g → 40g\n        ↓\n    条件がそろっている\n        ↓\n    正しく比べられる\n\n温度と水の量をそろえて比べる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 28,
    text: "水100gの溶解度が20gの物質を、30g入れてもすべて溶けない理由として正しいものはどれか。",
    choices: [
      "溶解度をこえているから",
      "かき混ぜ方が足りないから",
      "粉が大きいから",
      "水が冷たいから"
    ],
    answer: 0,
    source: "溶解度は、その条件で溶ける最大の量です。それ以上の量を入れても、溶けきれません。この状態では、余分な物質は固体として残ります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度をこえているとすべて溶けない理由\n\n【溶解度】\n    水100gに20gまで溶ける（最大）\n\n【30g入れた場合】\n    水：100g\n    溶解度：20g（限界）\n    入れた量：30g（限界をこえる）\n        ↓\n    ┌─────┐\n    │  水   │\n    │ 物質 │  20g溶けている\n    ├─────┤\n    │ ● ● │  10g溶けきれない\n    │ ● ● │  固体として残る\n    └─────┘\n\n【理由】\n    溶解度をこえている\n        ↓\n    それ以上の量を入れても\n    溶けきれない\n        ↓\n    余分な物質は固体として残る\n\n溶解度をこえている → すべて溶けない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 29,
    text: "飽和水溶液をあたためると、さらに物質を溶かせるようになる理由として正しいものはどれか。",
    choices: [
      "温度が上がると溶解度が大きくなるから",
      "水の量が増えるから",
      "空気が入るから",
      "物質が軽くなるから"
    ],
    answer: 0,
    source: "多くの固体は、温度が高いほど溶けやすくなります。あたためると、溶解度が大きくなります。そのため、飽和水溶液でも、さらに物質を溶かせます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">飽和水溶液をあたためると\n\n【飽和水溶液（低温）】\n    水：100g（低温）\n    溶解度：30g\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている（飽和）\n    ├─────┤\n    │ ● ● │  これ以上溶けない\n    └─────┘\n        ↓\n    あたためる\n        ↓\n【あたためた後】\n    水：100g（高温）\n    溶解度：50g（大きくなる）\n    ┌─────┐\n    │  水   │\n    │ 物質 │  30g溶けている\n    │       │  さらに20g溶かせる\n    └─────┘\n\n温度が上がる → 溶解度が大きくなる\n→ さらに物質を溶かせる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 30,
    text: "溶解度と温度の関係を考えるときに大切な見方として正しいものはどれか。",
    choices: [
      "条件をそろえて量の変化を見る",
      "見た目だけで判断する",
      "色のちがいを見る",
      "早く溶けるかを見る"
    ],
    answer: 0,
    source: "溶解度は、温度や水の量と深く関係しています。理科では、条件をそろえて、量がどう変わるかを見ることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">溶解度と温度の関係を考えるときの見方\n\n【大切な見方】\n    ✓ 条件をそろえる\n    ✓ 量の変化を見る\n\n【例】\n    条件：水100g（同じ）\n        ↓\n    温度：0℃ → 20g溶ける\n    温度：20℃ → 30g溶ける\n    温度：40℃ → 40g溶ける\n        ↓\n    量の変化を見る\n        ↓\n    温度が高いほど多く溶ける\n\n【見てはいけないこと】\n    × 見た目だけで判断する\n    × 色のちがいを見る\n    × 早く溶けるかを見る\n\n【理科の考え方】\n    条件をそろえて\n    量がどう変わるかを見る\n        ↓\n    正しい結論につながる\n\n条件をそろえて量の変化を見ることが大切</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  }
];
