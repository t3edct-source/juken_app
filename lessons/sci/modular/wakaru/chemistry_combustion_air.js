// chemistry_combustion_air.js
window.questions = [

  // =========================
  // 超基本語彙チェック（1〜5）
  // =========================
  {
    qnum: 1,
    text: "物が燃えるために必要な3つの条件をまとめて何という？",
    choices: ["燃焼の三条件", "三態変化", "燃焼反応", "空気の成分"],
    answer: 0,
    source: "物が燃れつづけるためには、三つのことがそろっている必要があります。一つ目は、燃えるもとになる物があることです。二つ目は、燃えるのを助ける気体がまわりにあることです。三つ目は、ある程度以上のあたたかさがあることです。この三つをまとめて 燃焼の三条件 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼の三条件\n\n【三つの条件】\n    ┌─────────────┐\n    │  ① 可燃物   │  燃えるもとになる物\n    │  （木・紙など）│\n    ├─────────────┤\n    │  ② 酸素     │  燃えるのを助ける気体\n    │  （空気中）  │\n    ├─────────────┤\n    │  ③ 温度     │  ある程度以上のあたたかさ\n    │  （発火点以上）│\n    └─────────────┘\n        ↓\n    三つがそろうと\n        ↓\n    燃焼が続く\n\n三条件がそろわないと燃焼は続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 2,
    text: "物が燃えるときに必要な、燃えるもととなる物を何という？",
    choices: ["可燃物", "不燃物", "助燃物", "生成物"],
    answer: 0,
    source: "火がついて燃えるためには、燃えるもとになる物が必要です。木や紙、ろうそくのろうなどがこれにあたります。このように、火がついて燃えるもとになる物を 可燃物 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">可燃物\n\n【可燃物の例】\n    ┌─────┐\n    │  木  │\n    └─────┘\n    ┌─────┐\n    │  紙  │\n    └─────┘\n    ┌─────┐\n    │ ろう │\n    └─────┘\n\n【燃えるもとになる物】\n    可燃物 + 酸素 + 温度\n        ↓\n    燃焼が起こる\n\n可燃物：火がついて燃えるもとになる物</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 3,
    text: "燃焼を助けるはたらきをもつ気体を何という？",
    choices: ["酸素", "二酸化炭素", "窒素", "水蒸気"],
    answer: 0,
    source: "物が燃れるときには、まわりの空気の中にある気体がはたらいています。この気体があることで、火は消えずに燃れつづけます。燃焼を助けるはたらきをもつ気体を 酸素 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸素の役割\n\n【燃焼の様子】\n    ┌─────┐\n    │ 可燃物│\n    └─────┘\n        │\n        │ 酸素（O₂）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃焼が続く\n    └─────┘\n\n【空気中の酸素】\n    空気\n    ├─ 酸素（約21%）← 燃焼を助ける\n    ├─ 窒素（約78%）\n    └─ その他\n\n酸素がある → 燃焼が続く\n酸素がない → 燃焼が止まる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 4,
    text: "燃焼が続くために必要な、ある程度以上の温度を何という？",
    choices: ["発火点", "融点", "沸点", "凝固点"],
    answer: 0,
    source: "物は、どんな温度でもすぐに燃えるわけではありません。ある程度以上あたたかくならないと、燃え始めません。物が燃え始めるために必要な最低の温度を 発火点 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">発火点\n\n【温度と燃焼】\n  温度\n    ↑\n 発火点│━━━━━━━━━━━━━━\n     │  燃え始める\n     │\n     │  ↑ 温度が上がる\n     │\n   0℃└──────────────→\n\n【発火点より低い】\n    温度 < 発火点\n        ↓\n    燃えない\n\n【発火点以上】\n    温度 ≥ 発火点\n        ↓\n    燃え始める\n\n発火点：燃え始める最低の温度</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 5,
    text: "燃焼によって新しくできる物質を何という？",
    choices: ["生成物", "可燃物", "反応物", "溶質"],
    answer: 0,
    source: "物が燃れると、もとの物のままではいられません。燃えたあとには、ちがう物が新しくできます。燃焼によって新しくできる物を 生成物 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">生成物\n\n【燃焼の変化】\n    可燃物（木など）\n        +\n    酸素\n        ↓\n    燃焼\n        ↓\n    生成物（二酸化炭素など）\n\n【例】\n    木 + 酸素 → 二酸化炭素 + 水\n    （可燃物）    （生成物）\n\n生成物：燃焼によって新しくできる物</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // =========================
  // 思考・実験問題（6〜20）
  // =========================
  {
    qnum: 6,
    text: "ろうそくが燃え続けるために必要な条件として正しい組み合わせはどれ？",
    choices: [
      "可燃物・酸素・適当な温度",
      "水・酸素・温度",
      "可燃物・二酸化炭素・温度",
      "空気・水・温度"
    ],
    answer: 0,
    source: "ろうそくが燃れつづけるためには、三つの条件がそろっている必要があります。燃えるもとになるろう、燃焼を助ける酸素、そして十分な温度です。この三つがそろうと、火は消えずに燃れつづけます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ろうそくが燃え続ける条件\n\n【三つの条件】\n    ┌─────────────┐\n    │  ① ろう      │  可燃物\n    │  （可燃物）   │\n    ├─────────────┤\n    │  ② 酸素      │  空気中から\n    │  （空気中）   │\n    ├─────────────┤\n    │  ③ 温度      │  十分な温度\n    │  （発火点以上）│\n    └─────────────┘\n        ↓\n    三つがそろう\n        ↓\n    ┌─────┐\n    │   🔥  │  燃え続ける\n    └─────┘\n\n三条件がそろわないと消える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 7,
    text: "ろうそくにガラスびんをかぶせると、しばらくして火が消える主な理由はどれ？",
    choices: [
      "酸素が使われ、補給されなくなるから",
      "二酸化炭素が冷えるから",
      "ろうが減るから",
      "温度が急に上がるから"
    ],
    answer: 0,
    source: "ろうそくが燃れるとき、まわりの酸素が使われています。ガラスびんをかぶせると、新しい空気が中に入ってきません。そのため酸素が少なくなり、燃焼が続かなくなって火が消えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">びんをかぶせると火が消える理由\n\n【びんをかぶせる前】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃えている\n    └─────┘\n    酸素が使われる\n    新しい空気が入る\n\n【びんをかぶせた後】\n    ┌─────────┐\n    │         │\n    │   🔥    │  酸素が減る\n    │         │  新しい空気が入らない\n    └─────────┘\n        ↓\n    酸素が足りなくなる\n        ↓\n    火が消える\n\n酸素が補給されない → 燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 8,
    text: "燃えている物に水をかけると火が消える理由として最も適切なものはどれ？",
    choices: [
      "温度を下げ、発火点より低くするから",
      "酸素を増やすから",
      "可燃物を増やすから",
      "二酸化炭素を分解するから"
    ],
    answer: 0,
    source: "燃焼が続くためには、発火点以上の温度が必要です。水をかけると、燃えている部分の温度が一気に下がります。温度が発火点より低くなると、燃焼は続けられなくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水をかけると火が消える理由\n\n【水をかける前】\n  温度\n    ↑\n 発火点│━━━━━━━━━━━━━━\n     │  燃えている\n     │\n    └──────────────→\n\n【水をかける】\n    ┌─────┐\n    │   🔥  │\n    └─────┘\n        ↓\n    水をかける\n        ↓\n  温度\n    ↑\n 発火点│\n     │\n     │  ↓ 温度が下がる\n     │\n   0℃└──────────────→\n    温度 < 発火点\n        ↓\n    火が消える\n\n温度が発火点より低くなる → 燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 9,
    text: "火災時に濡れた布で口をおさえる理由として正しいものはどれ？",
    choices: [
      "酸素の吸入を減らし、煙を吸いにくくするから",
      "温度を上げるから",
      "二酸化炭素を増やすから",
      "可燃物を減らすから"
    ],
    answer: 0,
    source: "火事のときには、空気中に煙が多くまじります。煙をたくさん吸いこむと、体に悪い影響があります。ぬれた布で口をおさえると、煙を吸いこみにくくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ぬれた布で口をおさえる理由\n\n【火事のとき】\n    ┌─────┐\n    │ 煙   │\n    │ 煙   │  空気中に煙がまじる\n    │ 煙   │\n    └─────┘\n        ↓\n    煙を吸いこむ\n        ↓\n    体に悪い影響\n\n【ぬれた布でおさえる】\n    ┌─────┐\n    │ 煙   │\n    │ 煙   │\n    └─────┘\n    ────────────\n    ぬれた布\n        ↓\n    煙を吸いこみにくくなる\n\nぬれた布 → 煙を遮る → 安全</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 10,
    text: "燃えているろうそくにふたをすると消える。このとき、取り除かれた条件はどれ？",
    choices: ["酸素", "可燃物", "温度", "生成物"],
    answer: 0,
    source: "ろうそくが燃れるためには、まわりに酸素が必要です。ふたをすると、外から空気が入らなくなります。そのため酸素がなくなり、燃焼が続かなくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ふたをすると火が消える理由\n\n【ふたをする前】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃えている\n    └─────┘\n    酸素が供給される\n\n【ふたをした後】\n    ┌─────────┐\n    │   ふた   │\n    ├─────────┤\n    │   🔥    │  酸素が使われる\n    └─────────┘\n    外から空気が入らない\n        ↓\n    酸素がなくなる\n        ↓\n    火が消える\n\n酸素が取り除かれる → 燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 11,
    text: "同じろうそくを、空気中と酸素を多く含む容器で燃やした。結果として正しいものはどれ？",
    choices: [
      "酸素が多い方が激しく燃える",
      "どちらも同じ燃え方をする",
      "酸素が多い方がすぐ消える",
      "空気中では燃えない"
    ],
    answer: 0,
    source: "燃焼は、酸素の量によって強さが変わります。酸素が多いほど、燃焼ははげしく進みます。そのため、酸素を多くふくむ容器では、火は強く燃えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸素が多いと激しく燃える理由\n\n【空気中】\n    空気（酸素：約21%）\n        ↓\n    ┌─────┐\n    │   🔥  │  普通に燃える\n    └─────┘\n\n【酸素が多い容器】\n    酸素（約100%）\n        ↓\n    ┌─────┐\n    │  🔥🔥 │  激しく燃える\n    └─────┘\n\n【関係】\n    酸素が多い → 燃焼がはげしい\n    酸素が少ない → 燃焼が弱い\n\n酸素の量 → 燃焼の強さ</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 12,
    text: "二酸化炭素が多い容器で火が消えやすい理由として正しいものはどれ？",
    choices: [
      "燃焼を助ける酸素が少ないから",
      "温度が高くなるから",
      "可燃物が増えるから",
      "発火点が下がるから"
    ],
    answer: 0,
    source: "二酸化炭素は、燃焼を助けるはたらきをしません。二酸化炭素が多いと、その分、酸素が少なくなります。酸素が少ないと、燃焼は続きにくくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">二酸化炭素が多いと火が消えやすい理由\n\n【空気中】\n    空気\n    ├─ 酸素（約21%）← 燃焼を助ける\n    ├─ 窒素（約78%）\n    └─ その他\n        ↓\n    ┌─────┐\n    │   🔥  │  燃える\n    └─────┘\n\n【二酸化炭素が多い容器】\n    二酸化炭素（多い）\n    酸素（少ない）← 燃焼を助けない\n        ↓\n    ┌─────┐\n    │   🔥  │  消える\n    └─────┘\n\n二酸化炭素が多い → 酸素が少ない → 燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 13,
    text: "燃焼が始まるときに、最初に必要となる条件はどれ？",
    choices: [
      "発火点以上の温度",
      "二酸化炭素",
      "水",
      "窒素"
    ],
    answer: 0,
    source: "物が燃れ始めるためには、まず温度が大切です。温度が発火点より低いままでは、燃焼は起こりません。はじめに必要なのは、発火点以上の温度です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼が始まるとき\n\n【温度が発火点より低い】\n  温度\n    ↑\n 発火点│\n     │\n     │  温度 < 発火点\n     │\n   0℃└──────────────→\n    燃焼は起こらない\n\n【温度が発火点以上】\n  温度\n    ↑\n 発火点│━━━━━━━━━━━━━━\n     │  温度 ≥ 発火点\n     │  燃焼が始まる\n     │\n    └──────────────→\n\nはじめに必要な条件：発火点以上の温度</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 14,
    text: "ろうそくの炎の周りにある透明な部分の役割として正しいものはどれ？",
    choices: [
      "空気中の酸素を取り入れている",
      "二酸化炭素を出している",
      "水を発生させている",
      "温度を下げている"
    ],
    answer: 0,
    source: "ろうそくの炎のまわりには、目に見えにくい部分があります。この部分から、空気中の酸素が炎の中に入りこみます。酸素が入ることで、燃焼は続いています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">炎の周りの透明な部分\n\n【ろうそくの炎】\n        空気\n        ↓\n    ┌─────────┐\n    │ 透明な部分│ ← 目に見えにくい\n    │   酸素    │   空気中の酸素が入る\n    ├─────────┤\n    │   🔥 炎   │\n    └─────────┘\n\n【酸素の流れ】\n    空気中の酸素\n        ↓\n    透明な部分を通る\n        ↓\n    炎の中に入る\n        ↓\n    燃焼が続く\n\n透明な部分：酸素を取り入れる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 15,
    text: "同じ量の可燃物でも、細かくするとよく燃える理由として正しいものはどれ？",
    choices: [
      "空気にふれる面積が大きくなるから",
      "重さが軽くなるから",
      "発火点が下がるから",
      "二酸化炭素が減るから"
    ],
    answer: 0,
    source: "同じ量の物でも、細かくすると空気にふれる部分が増えます。空気にふれる部分が多いほど、酸素と反応しやすくなります。そのため、細かい方がよく燃えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">細かくするとよく燃える理由\n\n【大きい塊】\n    ┌─────┐\n    │     │  表面積：小さい\n    │     │  空気にふれる部分：少ない\n    └─────┘\n    燃えにくい\n\n【細かくした】\n    ┌─┐ ┌─┐\n    │ │ │ │  表面積：大きい\n    └─┘ └─┘  空気にふれる部分：多い\n    ┌─┐ ┌─┐  酸素と反応しやすい\n    │ │ │ │\n    └─┘ └─┘\n    よく燃える\n\n表面積が大きい → 酸素と反応しやすい → よく燃える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 16,
    text: "鉄粉が空気中でゆっくり変化する現象として正しいものはどれ？",
    choices: [
      "酸化",
      "燃焼",
      "蒸発",
      "凝固"
    ],
    answer: 0,
    source: "鉄は、空気中の酸素と少しずつ結びつきます。この変化は、火が出るほどはげしくはありません。このように、酸素と結びつく変化を 酸化 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸化\n\n【鉄の酸化】\n    鉄 + 酸素\n        ↓\n    少しずつ結びつく\n        ↓\n    酸化（ゆっくり）\n\n【燃焼との違い】\n    燃焼：酸化がはげしく起こる\n    （火が出る）\n    \n    酸化：酸素と結びつく変化\n    （ゆっくり）\n\n【例】\n    鉄粉 + 酸素 → 酸化（ゆっくり）\n    木 + 酸素 → 燃焼（はげしい）\n\n酸化：酸素と結びつく変化</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 17,
    text: "燃焼と酸化の関係として正しい説明はどれ？",
    choices: [
      "燃焼は酸化の一種である",
      "酸化は燃焼より速い",
      "燃焼は酸素を使わない",
      "酸化では熱が出ない"
    ],
    answer: 0,
    source: "酸化は、物が酸素と結びつく変化です。燃焼は、その酸化がとてもはげしく起こる場合です。つまり、燃焼は酸化の一種です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼と酸化の関係\n\n【酸化】\n    物 + 酸素 → 結びつく変化\n    （広い意味）\n\n【燃焼】\n    物 + 酸素 → はげしく結びつく\n    （火が出る）\n\n【関係】\n    酸化（広い）\n        │\n        ├─ 燃焼（はげしい酸化）\n        └─ その他の酸化（ゆっくり）\n\n【例】\n    燃焼：木が燃える（はげしい）\n    酸化：鉄がさびる（ゆっくり）\n\n燃焼は酸化の一種</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 18,
    text: "消火器に使われる二酸化炭素のはたらきとして正しいものはどれ？",
    choices: [
      "酸素を遮り、燃焼を止める",
      "可燃物を増やす",
      "温度を上げる",
      "発火点を下げる"
    ],
    answer: 0,
    source: "燃焼には、酸素が必要です。二酸化炭素を出すと、火のまわりの酸素をさえぎります。そのため、燃焼が続かなくなり、火が消えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">二酸化炭素消火器のはたらき\n\n【消火器を使う前】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃えている\n    └─────┘\n    酸素が供給される\n\n【二酸化炭素を出す】\n    二酸化炭素\n        ↓\n    ┌─────────┐\n    │   🔥  │  酸素をさえぎる\n    └─────────┘\n    二酸化炭素でおおう\n        ↓\n    酸素が入らない\n        ↓\n    火が消える\n\n二酸化炭素 → 酸素をさえぎる → 消火</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 19,
    text: "天ぷら油の火災に水をかけてはいけない理由として正しいものはどれ？",
    choices: [
      "水がはねて油が広がり、燃焼が激しくなるから",
      "水が油を分解するから",
      "温度が下がりすぎるから",
      "二酸化炭素が発生するから"
    ],
    answer: 0,
    source: "高温の油に水をかけると、水が一気に蒸発します。そのとき、油がはねて広がり、火もいっしょに広がります。そのため、油の火事に水をかけるのは危険です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">油火災に水をかけてはいけない理由\n\n【高温の油】\n    ┌─────┐\n    │ 油 🔥 │  高温の油\n    └─────┘\n        ↓\n    水をかける\n        ↓\n【危険】\n    水が一気に蒸発\n        ↓\n    油がはねる\n        ↓\n    火が広がる\n    ┌─────┐\n    │ 🔥🔥🔥 │  危険！\n    └─────┘\n\n【正しい消火方法】\n    ふたでおおう（酸素をさえぎる）\n    消火器を使う\n\n水をかける → 油がはねる → 火が広がる（危険）</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 20,
    text: "燃焼を確実に止める方法として最も適切なものはどれ？",
    choices: [
      "燃焼の三条件のうち1つ以上を取り除く",
      "可燃物を増やす",
      "酸素を増やす",
      "温度を上げる"
    ],
    answer: 0,
    source: "燃焼が続くためには、燃焼の三条件が必要です。この三つのうち、どれか一つでも取り除くと、燃焼は続きません。そのため、三条件のうち一つ以上を取り除くことが、確実な消火方法です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼を確実に止める方法\n\n【燃焼の三条件】\n    ┌─────────────┐\n    │  ① 可燃物   │\n    ├─────────────┤\n    │  ② 酸素     │\n    ├─────────────┤\n    │  ③ 温度     │\n    └─────────────┘\n        ↓\n    三つがそろっている\n        ↓\n    燃焼が続く\n\n【消火方法】\n    ①を取り除く：可燃物を取り除く\n    ②を取り除く：酸素をさえぎる\n    ③を取り除く：温度を下げる\n        ↓\n    どれか一つでも取り除く\n        ↓\n    燃焼が止まる\n\n三条件の一つ以上を取り除く → 確実な消火</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 21,
    text: "燃えているろうそくに、上からコップをかぶせると火が消える理由として正しいものはどれか。",
    choices: [
      "酸素が使われ、新しく入らなくなるから",
      "火が水に変わるから",
      "ろうそくが冷えるから",
      "光がなくなるから"
    ],
    answer: 0,
    source: "ろうそくが燃れるときには、まわりの空気中の酸素が使われます。コップをかぶせると、外から新しい空気が入らなくなります。そのため、酸素が足りなくなり、燃焼が続かなくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">コップをかぶせると火が消える理由\n\n【コップをかぶせる前】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃えている\n    └─────┘\n    酸素が供給される\n\n【コップをかぶせた後】\n    ┌─────────┐\n    │  コップ  │\n    ├─────────┤\n    │   🔥    │  酸素が使われる\n    └─────────┘\n    外から空気が入らない\n        ↓\n    酸素が足りなくなる\n        ↓\n    火が消える\n\n酸素が補給されない → 燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 22,
    text: "たき火にうちわで風を送ると、火が強くなる理由として正しいものはどれか。",
    choices: [
      "酸素がたくさん送られるから",
      "火が軽くなるから",
      "温度が下がるから",
      "煙がなくなるから"
    ],
    answer: 0,
    source: "燃焼は、酸素があるほど強く進みます。うちわで風を送ると、新しい空気が火のまわりに入ります。その空気にふくまれる酸素によって、燃焼が強くなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">うちわで風を送ると火が強くなる理由\n\n【風を送る前】\n    ┌─────┐\n    │   🔥  │  普通に燃える\n    └─────┘\n    酸素：普通\n\n【うちわで風を送る】\n    うちわ\n        ↓\n    風（空気）\n        ↓\n    ┌─────┐\n    │  🔥🔥 │  激しく燃える\n    └─────┘\n    新しい空気が入る\n    酸素がたくさん供給される\n\n【関係】\n    風を送る → 空気が入る → 酸素が増える → 燃焼が強くなる\n\n酸素がたくさん送られる → 燃焼が強くなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 23,
    text: "マッチをこすると火がつく理由として正しいものはどれか。",
    choices: [
      "こすって温度が上がり、発火点に達するから",
      "酸素がなくなるから",
      "水が出てくるから",
      "二酸化炭素ができるから"
    ],
    answer: 0,
    source: "物が燃れ始めるためには、ある温度以上になる必要があります。マッチをこすると、こすった部分があたたまります。温度が発火点に達すると、燃焼が始まります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">マッチをこすると火がつく理由\n\n【マッチをこする前】\n  温度\n    ↑\n 発火点│\n     │\n     │  温度 < 発火点\n     │\n   0℃└──────────────→\n    燃えない\n\n【マッチをこする】\n    マッチをこする\n        ↓\n    こすった部分があたたまる\n        ↓\n  温度\n    ↑\n 発火点│━━━━━━━━━━━━━━\n     │  温度 ≥ 発火点\n     │\n    └──────────────→\n    燃焼が始まる\n\nこする → 温度が上がる → 発火点に達する → 火がつく</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 24,
    text: "花火が空中でも燃える理由として正しいものはどれか。",
    choices: [
      "空気中に酸素があるから",
      "水が入っているから",
      "地面が近いから",
      "風が止まっているから"
    ],
    answer: 0,
    source: "空気の中には、燃焼を助ける酸素がふくまれています。地上でも空中でも、酸素がある場所では燃焼が起こります。そのため、花火は空中でも燃えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">花火が空中でも燃える理由\n\n【地上】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃える\n    └─────┘\n    地上でも酸素がある\n\n【空中】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃える\n    └─────┘\n    空中でも酸素がある\n\n【共通点】\n    地上・空中ともに\n    空気中に酸素がある\n        ↓\n    燃焼が起こる\n\n空気中に酸素がある → どこでも燃える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 25,
    text: "燃焼についての説明として正しいものはどれか。",
    choices: [
      "酸素がなければ燃焼は起こらない",
      "温度があれば必ず燃える",
      "水があれば燃える",
      "二酸化炭素が多いほど燃える"
    ],
    answer: 0,
    source: "燃焼は、燃える物・酸素・温度の三つがそろって起こります。温度だけが高くても、酸素がなければ燃焼は続きません。燃焼には必ず酸素が必要です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼についての正しい説明\n\n【燃焼の三条件】\n    ┌─────────────┐\n    │  ① 可燃物   │\n    ├─────────────┤\n    │  ② 酸素     │ ← 必ず必要\n    ├─────────────┤\n    │  ③ 温度     │\n    └─────────────┘\n\n【誤った考え】\n    × 温度があれば必ず燃える\n    × 水があれば燃える\n    × 二酸化炭素が多いほど燃える\n\n【正しい考え】\n    ✓ 酸素がなければ燃焼は起こらない\n    ✓ 三条件がそろって初めて燃焼が起こる\n\n酸素がなければ燃焼は起こらない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 26,
    text: "二酸化炭素について、正しい説明はどれか。",
    choices: [
      "燃焼を助けない気体である",
      "火を強くする気体である",
      "燃える気体である",
      "酸素と同じはたらきをする"
    ],
    answer: 0,
    source: "気体には、燃焼を助けるものと、助けないものがあります。二酸化炭素は、燃焼を助けるはたらきをしません。そのため、二酸化炭素が多いと火は消えやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">二酸化炭素について\n\n【気体の種類】\n    燃焼を助ける気体\n    └─ 酸素（O₂）\n    \n    燃焼を助けない気体\n    └─ 二酸化炭素（CO₂）\n    └─ 窒素（N₂）\n\n【二酸化炭素の性質】\n    × 燃焼を助けない\n    × 火を強くしない\n    × 燃える気体ではない\n    × 酸素と同じはたらきをしない\n\n【二酸化炭素が多いと】\n    二酸化炭素が多い\n        ↓\n    酸素が少なくなる\n        ↓\n    火が消えやすくなる\n\n二酸化炭素：燃焼を助けない気体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 27,
    text: "「水をかければ、どんな火も消える」という考えについて正しいものはどれか。",
    choices: [
      "燃えている物によっては危険な場合がある",
      "いつでも安全である",
      "火は必ず小さくなる",
      "燃焼が強くなる"
    ],
    answer: 0,
    source: "水は、温度を下げることで火を消すはたらきをします。しかし、高温の油に水をかけると、油がはねて火が広がります。そのため、水が使えない火事もあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「水をかければ、どんな火も消える」という考え\n\n【水が使える場合】\n    普通の火事\n        ↓\n    水をかける\n        ↓\n    温度が下がる\n        ↓\n    火が消える\n\n【水が使えない場合】\n    高温の油の火事\n        ↓\n    水をかける\n        ↓\n    水が一気に蒸発\n        ↓\n    油がはねる\n        ↓\n    火が広がる（危険！）\n\n【正しい考え】\n    × どんな火も水で消える\n    ✓ 燃えている物によっては危険な場合がある\n\n水が使えない火事もある</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 28,
    text: "細かくした物の方がよく燃える理由として正しいものはどれか。",
    choices: [
      "空気にふれる面積が大きくなるから",
      "重さが軽くなるから",
      "水分が増えるから",
      "温度が下がるから"
    ],
    answer: 0,
    source: "燃焼は、物が酸素と反応することで起こります。細かくすると、空気にふれる部分が増えます。そのため、酸素と反応しやすくなり、よく燃えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">細かくした物がよく燃える理由\n\n【大きい塊】\n    ┌─────┐\n    │     │  表面積：小さい\n    │     │  空気にふれる部分：少ない\n    └─────┘\n    酸素と反応しにくい\n    燃えにくい\n\n【細かくした】\n    ┌─┐ ┌─┐\n    │ │ │ │  表面積：大きい\n    └─┘ └─┘  空気にふれる部分：多い\n    ┌─┐ ┌─┐  酸素と反応しやすい\n    │ │ │ │\n    └─┘ └─┘\n    よく燃える\n\n【関係】\n    細かくする → 表面積が大きくなる\n    → 酸素と反応しやすくなる → よく燃える\n\n空気にふれる面積が大きくなる → よく燃える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 29,
    text: "消火で「空気をさえぎる」方法が有効な理由として正しいものはどれか。",
    choices: [
      "酸素を取り入れられなくするから",
      "水がなくなるから",
      "火が軽くなるから",
      "煙が消えるから"
    ],
    answer: 0,
    source: "燃焼が続くためには、酸素が必要です。ぬれた布やふたでおおうと、空気が入りにくくなります。その結果、酸素が足りなくなり、燃焼は止まります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">「空気をさえぎる」消火方法\n\n【空気をさえぎる前】\n    空気（酸素）\n        ↓\n    ┌─────┐\n    │   🔥  │  燃えている\n    └─────┘\n    酸素が供給される\n\n【空気をさえぎる】\n    ┌─────────┐\n    │ ぬれた布 │\n    │ またはふた│\n    ├─────────┤\n    │   🔥    │  空気が入らない\n    └─────────┘\n    酸素が取り入れられない\n        ↓\n    酸素が足りなくなる\n        ↓\n    燃焼が止まる\n\n空気をさえぎる → 酸素が取り入れられない → 消火</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 30,
    text: "燃焼について考えるとき、大切な考え方として正しいものはどれか。",
    choices: [
      "何が燃焼の条件になっているかを見る",
      "見た目の大きさだけを見る",
      "火の色だけを見る",
      "早く消えるかだけを見る"
    ],
    answer: 0,
    source: "燃焼は、燃える物・酸素・温度の三つの条件で決まります。理科では、現象だけでなく、成り立つ条件を考えることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼について考えるときの大切な考え方\n\n【燃焼の三条件】\n    ┌─────────────┐\n    │  ① 可燃物   │\n    ├─────────────┤\n    │  ② 酸素     │\n    ├─────────────┤\n    │  ③ 温度     │\n    └─────────────┘\n\n【大切な考え方】\n    ✓ 何が燃焼の条件になっているかを見る\n    ✓ 三条件がそろっているか確認する\n    ✓ 条件が欠けるとどうなるか考える\n\n【見てはいけないこと】\n    × 見た目の大きさだけを見る\n    × 火の色だけを見る\n    × 早く消えるかだけを見る\n\n【理科の考え方】\n    現象だけでなく\n    成り立つ条件を考える\n\n何が燃焼の条件になっているかを見る</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  }
];
