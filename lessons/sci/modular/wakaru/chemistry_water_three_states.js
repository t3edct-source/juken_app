// chemistry_water_three_states.js
window.questions = [

  // =========================
  // 超基本語彙チェック（1〜5）
  // =========================
  {
    qnum: 1,
    text: "水が氷・水・水蒸気のように形を変えることをまとめて何という？",
    choices: ["水の三態", "水の循環", "水溶液", "状態変化"],
    answer: 0,
    source: "水は、冷やすと氷のようにかたまり、あたためると空気の中に広がります。でも、水がべつのものに変わったわけではありません。同じ水が、固体・液体・気体という三つのすがたで存在しています。この三つのすがたをまとめて、水の三態といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水の三態\n\n【固体（氷）】\n    ● ● ●\n    ● ● ●  形が決まっている\n    ● ● ●  つぶつぶが規則正しく並ぶ\n\n【液体（水）】\n    ●  ●  ●\n     ● ● ●  形が決まっていない\n    ●  ●  ●  つぶつぶが動き回る\n\n【気体（水蒸気）】\n    ●     ●\n         ●\n    ●      形が決まっていない\n      ●    つぶつぶが自由に動く\n    ●     ●  すき間が大きい\n\n同じ水が、三つのすがたで存在</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 2,
    text: "氷がとけて水になる変化を何という？",
    choices: ["融解", "凝固", "蒸発", "沸騰"],
    answer: 0,
    source: "かたい氷をあたためると、だんだんやわらかくなり、水になります。このように、固体が液体に変わることを、**融解（ゆうかい）**といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">融解（ゆうかい）\n\n【あたためる前】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●  形が決まっている\n        ↓\n    あたためる\n        ↓\n【あたためた後】\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●  形が決まっていない\n\n固体 → 液体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 3,
    text: "水が冷やされて氷になる変化を何という？",
    choices: ["凝固", "融解", "蒸発", "沸騰"],
    answer: 0,
    source: "水を冷やしていくと、動きが小さくなり、形の決まった氷になります。このように、液体が固体に変わることを、**凝固（ぎょうこ）**といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">凝固（ぎょうこ）\n\n【冷やす前】\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●  形が決まっていない\n        ↓\n    冷やす\n        ↓\n【冷やした後】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●  形が決まっている\n\n液体 → 固体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 4,
    text: "水が液体から気体に変わる変化を何という？",
    choices: ["蒸発", "凝固", "融解", "溶解"],
    answer: 0,
    source: "水は、火にかけなくても、表面から少しずつ空気の中に出ていきます。このように、液体が少しずつ気体になることを、蒸発といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">蒸発\n\n【水の表面から】\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●    空気の中に出ていく\n    ●     ●\n    ────────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●  表面から少しずつ\n\n液体 → 気体（少しずつ）</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 5,
    text: "水を加熱したとき、一定の温度で激しく気体になる現象を何という？",
    choices: ["沸騰", "蒸発", "融解", "凝固"],
    answer: 0,
    source: "水をあたためつづけると、ある温度でブクブクと泡を出し、一気に気体になります。このように、水全体が激しく気体になることを、**沸騰（ふっとう）**といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">沸騰（ふっとう）\n\n【あたためつづける】\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●    ブクブクと泡\n    ●     ●  一気に気体になる\n    ────────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●  水全体が激しく\n\n液体 → 気体（一気に）</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // =========================
  // 思考・条件判断問題（6〜20）
  // =========================
  {
    qnum: 6,
    text: "水を加熱し続けたとき、沸騰している間の水の温度はどうなる？",
    choices: ["一定のまま変わらない", "上がり続ける", "下がり続ける", "0℃になる"],
    answer: 0,
    source: "水をあたためると、はじめはどんどん温度が上がります。しかし、沸騰しているあいだは、温度は上がりません。あたためた熱が、水を気体に変えるために使われているからです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">沸騰中の温度変化\n\n【温度の変化】\n  温度\n    ↑\n 100℃│━━━━━━━━━━━━━━ 沸騰中（温度一定）\n     │\n     │  ↑\n     │  │ 温度が上がる\n     │  │\n   0℃└──┴──────────→ 時間\n\n沸騰中：\n  • 温度は上がらない\n  • 熱は水を気体に変えるために使われる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 7,
    text: "氷がとけている間、温度が変わらない理由として正しいものはどれ？",
    choices: [
      "氷が水に変わることに熱が使われるから",
      "周りの温度が下がるから",
      "水が蒸発するから",
      "氷が増えるから"
    ],
    answer: 0,
    source: "氷がとけているあいだ、氷はまだ水になりきっていません。このときの熱は、温度を上げるためではなく、融解のために使われます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">氷がとけている間\n\n【温度の変化】\n  温度\n    ↑\n     │\n     │━━━━━━━━━━━━━━ 0℃（温度一定）\n     │  氷がとけている間\n     │\n   0℃└──────────────→ 時間\n\n【状態】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●\n    ────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n\n熱は融解のために使われる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 8,
    text: "同じ量の水を広い皿と細長い容器に入れたとき、蒸発しやすいのはどちらか。その理由として正しいものはどれ？",
    choices: [
      "表面積が大きく、空気にふれる面が広いから",
      "水の量が多くなるから",
      "温度が自動的に上がるから",
      "水が軽くなるから"
    ],
    answer: 0,
    source: "水が空気に出ていくのは、水の表面からです。表面が広いほど、空気にふれる部分が多くなります。そのため、表面積が大きいほど蒸発しやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">表面積と蒸発\n\n【広い皿】\n    ────────────────\n    ●  ●  ●  ●  ●  ●\n     ● ● ● ● ● ●  表面が広い\n    ●  ●  ●  ●  ●  ●\n    ────────────────\n    蒸発しやすい\n\n【細長い容器】\n    ────\n    ●  ●\n     ● ●  表面が狭い\n    ●  ●\n    ────\n    蒸発しにくい\n\n表面積が大きい → 蒸発しやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 9,
    text: "風があると水が蒸発しやすくなる主な理由はどれ？",
    choices: [
      "水蒸気が運び去られるから",
      "水の温度が下がるから",
      "水が凍りやすくなるから",
      "水の量が減るから"
    ],
    answer: 0,
    source: "水が蒸発すると、まわりに水蒸気がたまります。風があると、この水蒸気が運び去られます。そのため、風があると蒸発は進みやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">風と蒸発\n\n【風がない場合】\n    ●     ●\n         ●\n    ●       ← 水蒸気がたまる\n      ●\n    ●     ●\n    ────────────\n    ●  ●  ●  水\n     ● ● ●\n    ●  ●  ●\n    蒸発が進みにくい\n\n【風がある場合】\n    ●     ●  ←→ 風が運び去る\n         ●\n    ●\n      ●\n    ●     ●\n    ────────────\n    ●  ●  ●  水\n     ● ● ●\n    ●  ●  ●\n    蒸発が進みやすい\n\n風がある → 蒸発しやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 10,
    text: "水蒸気が冷やされて水の粒になる変化を何という？",
    choices: ["凝結", "蒸発", "融解", "凝固"],
    answer: 0,
    source: "空気に出た水蒸気が冷やされると、また液体の水にもどります。このように、気体が液体に変わることを、**凝結（ぎょうけつ）**といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">凝結（ぎょうけつ）\n\n【冷やす前】\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●\n    ●     ●\n        ↓\n    冷やす\n        ↓\n【冷やした後】\n    ────────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n\n気体 → 液体</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 11,
    text: "湯気や雲が白く見える理由として正しいものはどれ？",
    choices: [
      "水蒸気が冷えて細かい水の粒になるから",
      "水が燃えているから",
      "空気が白くなるから",
      "光を出しているから"
    ],
    answer: 0,
    source: "やかんから出る白い湯気は、水蒸気そのものではありません。水蒸気が冷やされて、細かい水のつぶになったものです。そのつぶが光を反射するため、白く見えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">湯気が白く見える理由\n\n【やかんから出る】\n    ●     ●\n         ●\n    ●       ← 水蒸気（見えない）\n      ●\n    ●     ●\n        ↓\n    冷やされる\n        ↓\n    ●  ●  ●\n     ● ● ●  細かい水のつぶ\n    ●  ●  ●  光を反射\n        ↓\n    白く見える（湯気）\n\n水蒸気 → 水のつぶ → 白く見える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 12,
    text: "氷・水・水蒸気のうち、形が一定でないものの組み合わせはどれ？",
    choices: ["水と水蒸気", "氷だけ", "水だけ", "氷と水"],
    answer: 0,
    source: "氷は形が決まっていますが、水や気体は入れものの形に合わせて変わります。このように、形が一定でないのは、水と水蒸気です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">形の違い\n\n【氷（固体）】\n    ┌─────┐\n    │ ● ● │\n    │ ● ● │  形が決まっている\n    │ ● ● │\n    └─────┘\n\n【水（液体）】\n    ┌─────┐\n    │●  ● │\n    │ ● ● │  入れものの形に合わせる\n    │●  ● │\n    └─────┘\n\n【水蒸気（気体）】\n    ┌─────┐\n    │●   ●│\n    │  ●  │  入れものの形に合わせる\n    │●   ●│\n    └─────┘\n\n形が一定でない：水と水蒸気</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 13,
    text: "同じ体積の水と水蒸気を比べたとき、重いのはどちら？",
    choices: ["水", "水蒸気", "同じ重さ", "条件で変わらない"],
    answer: 0,
    source: "同じ体積で比べると、水は中がぎっしりつまっています。水蒸気は、つぶつぶの間にすき間がたくさんあります。そのため、同じ体積なら水の方が重くなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">同じ体積での重さの違い\n\n【水（液体）】\n    ┌─────┐\n    │● ● ●│\n    │● ● ●│  ぎっしりつまっている\n    │● ● ●│  重い\n    └─────┘\n\n【水蒸気（気体）】\n    ┌─────┐\n    │●   ●│\n    │  ●  │  すき間がたくさん\n    │●   ●│  軽い\n    └─────┘\n\n同じ体積 → 水の方が重い</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 14,
    text: "水が液体から気体になるときに、一般に起こる変化として正しいものはどれ？",
    choices: ["体積が大きくなる", "色が変わる", "重さがなくなる", "においが出る"],
    answer: 0,
    source: "水が液体から気体に変わると、つぶつぶの間が広がります。その結果、体積は大きくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">体積の変化\n\n【液体（水）】\n    ┌─────┐\n    │● ● ●│  体積：小さい\n    │● ● ●│\n    └─────┘\n        ↓\n    気体に変わる\n        ↓\n【気体（水蒸気）】\n    ┌─────────────┐\n    │●     ●     ●│  体積：大きい\n    │               │  つぶつぶの間が広がる\n    │●     ●     ●│\n    └─────────────┘\n\n液体 → 気体：体積が大きくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 15,
    text: "水蒸気そのものが目に見えない理由として正しいものはどれ？",
    choices: [
      "気体は光を反射しにくいから",
      "色が白いから",
      "空気と同じだから",
      "すぐ水になるから"
    ],
    answer: 0,
    source: "水蒸気は、色がなく、光をほとんど反射しません。そのため、水蒸気そのものは目に見えません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水蒸気が見えない理由\n\n【水蒸気】\n    ●     ●\n         ●\n    ●       ← 見えない\n      ●    色がない\n    ●     ●  光を反射しない\n\n【光の反射】\n    光 → 水蒸気 → 反射しない → 見えない\n\n水蒸気そのものは目に見えない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 16,
    text: "同じ温度の水でも、浅い容器の方が蒸発しやすいのはなぜか？",
    choices: [
      "空気にふれる表面積が大きいから",
      "水の量が少ないから",
      "容器が軽いから",
      "温度が高いから"
    ],
    answer: 0,
    source: "水が蒸発するのは、表面からです。浅い入れものでは、表面が広くなります。そのため、浅い容器の方が蒸発しやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">浅い容器と蒸発\n\n【浅い容器】\n    ────────────────\n    ●  ●  ●  ●  ●  ●\n     ● ● ● ● ● ●  表面が広い\n    ●  ●  ●  ●  ●  ●\n    ────────────────\n    蒸発しやすい\n\n【深い容器】\n    ┌─────┐\n    │●  ● │\n    │ ● ● │  表面が狭い\n    │●  ● │\n    │     │\n    └─────┘\n    蒸発しにくい\n\n浅い容器 → 表面が広い → 蒸発しやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 17,
    text: "水を冷やしていったとき、0℃で起こる変化として正しいものはどれ？",
    choices: [
      "水が氷に変わり始める",
      "水が蒸発し始める",
      "温度が急に下がる",
      "体積が必ず小さくなる"
    ],
    answer: 0,
    source: "水は冷やされると、0℃付近で氷になりはじめます。この温度を、凝固点といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">凝固点（0℃）\n\n【温度の変化】\n  温度\n    ↑\n     │\n     │  ↓ 温度が下がる\n     │\n   0℃│━━━━━━━━━━━━━━ 凝固点\n     │  氷になりはじめる\n     │\n    └──────────────→ 時間\n\n【状態変化】\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n        ↓\n    0℃で\n        ↓\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●\n\n0℃ = 凝固点</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 18,
    text: "氷がとけ終わった直後の水の温度として最も適切なものはどれ？",
    choices: ["0℃", "100℃", "氷より低い", "周りの温度と同じ"],
    answer: 0,
    source: "氷がすべてとけ終わった直後の水は、まだあたたかくなっていません。氷と同じく、0℃のままです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">氷がとけ終わった直後\n\n【温度の変化】\n  温度\n    ↑\n     │\n     │  ↑ 温度が上がる\n     │\n   0℃│━━━━━━━━━━━━━━ 0℃のまま\n     │  氷がとけている間\n     │\n    └──────────────→ 時間\n\n【状態】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●\n        ↓\n    とけ終わる\n        ↓\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●  まだ0℃</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 19,
    text: "水が蒸発するとき、最も関係が深い条件はどれ？",
    choices: ["温度・風・表面積", "色・形・重さ", "におい・味", "容器の材質"],
    answer: 0,
    source: "水の蒸発には、温度・風・表面積が関係します。このように、蒸発はまわりの条件に左右される現象です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">蒸発に関係する条件\n\n【温度】\n    温度が高い → 蒸発しやすい\n    温度が低い → 蒸発しにくい\n\n【風】\n    風がある → 水蒸気が運ばれる → 蒸発しやすい\n    風がない → 水蒸気がたまる → 蒸発しにくい\n\n【表面積】\n    表面積が大きい → 蒸発しやすい\n    表面積が小さい → 蒸発しにくい\n\n蒸発はまわりの条件に左右される</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 20,
    text: "水の状態変化について正しい説明はどれ？",
    choices: [
      "状態が変わる間、温度が一定になることがある",
      "必ず温度が上がり続ける",
      "体積は変わらない",
      "重さがなくなる"
    ],
    answer: 0,
    source: "物質が、融解・沸騰・凝固などの状態変化をしているあいだ、熱は温度を上げるためではなく、すがたを変えるために使われます。そのため、状態変化の途中では温度が一定になることがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">状態変化中の温度\n\n【融解中】\n  温度\n    ↑\n     │\n   0℃│━━━━━━━━━━━━━━ 温度一定\n     │  熱は融解に使われる\n     │\n    └──────────────→ 時間\n\n【沸騰中】\n  温度\n    ↑\n 100℃│━━━━━━━━━━━━━━ 温度一定\n     │  熱は沸騰に使われる\n     │\n    └──────────────→ 時間\n\n状態変化中：温度が一定になる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 21,
    text: "洗濯物が、晴れて風のある日に早くかわく理由として正しいものはどれか。",
    choices: [
      "水が表面から空気に出ていくから",
      "水が重くなるから",
      "空気が水になるから",
      "水が消えるから"
    ],
    answer: 0,
    source: "ぬれた洗濯物には、水がしみこんでいます。この水は、洗濯物の表面から少しずつ空気の中に出ていきます。晴れていて風があると、この水は空気に出やすくなります。このように、水が空気に出ていくことを、蒸発といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">洗濯物が早くかわく理由\n\n【ぬれた洗濯物】\n    ┌─────────┐\n    │●  ●  ● │\n    │ ● ● ● │  水がしみこんでいる\n    │●  ●  ● │\n    └─────────┘\n        ↓\n    表面から空気に出る\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●\n    ●     ●\n\n【晴れて風がある】\n    • 温度が高い → 蒸発しやすい\n    • 風がある → 水蒸気が運ばれる → 蒸発しやすい\n\n早くかわく理由：蒸発が進みやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 22,
    text: "冷たい飲み物のコップの外側がぬれてくる理由として正しいものはどれか。",
    choices: [
      "空気中の水蒸気が冷やされて水になるから",
      "コップの中の水がしみ出しているから",
      "空気が水に変わるから",
      "氷が外に出てくるから"
    ],
    answer: 0,
    source: "空気の中には、目に見えない水蒸気がふくまれています。冷たいコップにふれると、水蒸気は冷やされます。冷やされた水蒸気は、水のつぶになってあらわれます。このように、水蒸気が水にもどることを、凝結といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">コップの外側がぬれる理由\n\n【空気中】\n    ●     ●\n         ●\n    ●       ← 水蒸気（見えない）\n      ●    空気中にふくまれている\n    ●     ●\n        ↓\n    冷たいコップにふれる\n        ↓\n【コップの外側】\n    ┌─────┐\n    │●  ● │\n    │ ● ● │  水のつぶ（見える）\n    │●  ● │  凝結\n    └─────┘\n\n水蒸気 → 冷やされる → 水のつぶ</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 23,
    text: "おふろにふたをしないと、湯がさめやすくなる理由として正しいものはどれか。",
    choices: [
      "水が空気に出ていきやすくなり、熱もいっしょにうばわれるから",
      "水の量が急に減るから",
      "空気が冷えるから",
      "水が燃えるから"
    ],
    answer: 0,
    source: "あたたかいおふろの水は、表面から空気の中に出ていきます。ふたをしないと、水が空気に出る場所が広くなります。そのとき、水といっしょに熱も空気にうばわれます。水が空気に出ていくことを、蒸発といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">おふろがさめやすくなる理由\n\n【ふたをしない】\n    ────────────────\n    ●  ●  ●  ●  ●  ●\n     ● ● ● ● ● ●  表面が広い\n    ●  ●  ●  ●  ●  ●\n    ────────────────\n    水が空気に出る\n    熱もいっしょにうばわれる\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気と熱\n      ●\n    ●     ●\n        ↓\n    湯がさめる\n\n【ふたをする】\n    ┌─────────┐\n    │●  ●  ● │\n    │ ● ● ● │  表面が狭い\n    │●  ●  ● │\n    └─────────┘\n    水が出にくい\n    熱も出にくい\n        ↓\n    湯がさめにくい\n\nふたをしない → 蒸発が進む → 熱がうばわれる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 24,
    text: "冬でも、風があるとぬれた手が早くかわくことがある理由として正しいものはどれか。",
    choices: [
      "風が水蒸気を運び去るから",
      "水の温度が高いから",
      "水がこおるから",
      "空気がなくなるから"
    ],
    answer: 0,
    source: "水が空気に出るかどうかは、温度だけで決まりません。風があると、空気中の水蒸気が運び去られます。すると、また新しく水が空気に出やすくなります。このように、蒸発は風などの条件にも左右されます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">風があると早くかわく理由\n\n【風がない場合】\n    ぬれた手\n    ┌─────┐\n    │●  ● │\n    │ ● ● │  水\n    │●  ● │\n    └─────┘\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気がたまる\n      ●\n    ●     ●\n    蒸発が進みにくい\n\n【風がある場合】\n    ぬれた手\n    ┌─────┐\n    │●  ● │\n    │ ● ● │  水\n    │●  ● │\n    └─────┘\n        ↓\n    ●     ●  ←→ 風が運び去る\n         ●\n    ●\n      ●\n    ●     ●\n    蒸発が進みやすい\n\n風がある → 水蒸気が運ばれる → 蒸発しやすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 25,
    text: "「湯気」についての説明として正しいものはどれか。",
    choices: [
      "水蒸気が冷やされてできた水のつぶ",
      "水蒸気そのもの",
      "空気",
      "煙"
    ],
    answer: 0,
    source: "水が気体になると、水蒸気になります。水蒸気は色がなく、目で見ることはできません。やかんから出る白い湯気は、水蒸気が冷やされてできた、細かい水のつぶです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">湯気とは\n\n【やかんから出る】\n    ┌─────┐\n    │ やかん │\n    └─────┘\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気（見えない）\n      ●\n    ●     ●\n        ↓\n    冷やされる\n        ↓\n    ●  ●  ●\n     ● ● ●  細かい水のつぶ\n    ●  ●  ●  光を反射\n        ↓\n    白く見える（湯気）\n\n水蒸気 → 冷やされる → 水のつぶ → 湯気</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 26,
    text: "蒸発についての説明として正しいものはどれか。",
    choices: [
      "蒸発は100℃でなくても起こる",
      "蒸発は沸騰と同じ",
      "蒸発は火を使わないと起こらない",
      "蒸発は水だけに起こる"
    ],
    answer: 0,
    source: "水は、火にかけなくても、表面から少しずつ空気の中に出ていきます。このような変化は、100℃でなくても起こります。表面から少しずつ水が空気に出ることを、蒸発といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">蒸発の特徴\n\n【蒸発】\n    ────────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n    ────────────\n        ↓\n    表面から少しずつ\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●\n    ●     ●\n\n特徴：\n  • 火を使わなくても起こる\n  • 100℃でなくても起こる\n  • 表面から少しずつ\n  • 温度が高いほど進みやすい\n\n【沸騰との違い】\n  沸騰：100℃で一気に気体になる\n  蒸発：いつでも少しずつ気体になる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 27,
    text: "水が液体から気体に変わったとき、全体の重さはどうなるか。",
    choices: [
      "変わらない",
      "軽くなる",
      "重くなる",
      "なくなる"
    ],
    answer: 0,
    source: "水が液体から気体に変わっても、水そのものがなくなるわけではありません。形が変わるだけで、同じ水が空気の中に広がります。そのため、水全体の重さは変わりません。このような考え方を、物質はなくならないといいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">状態変化と重さ\n\n【液体（水）】\n    ┌─────┐\n    │● ● ●│\n    │● ● ●│  重さ：100g\n    │● ● ●│\n    └─────┘\n        ↓\n    気体に変わる\n        ↓\n【気体（水蒸気）】\n    ●     ●\n         ●\n    ●       ← 重さ：100g（同じ）\n      ●    形が変わるだけ\n    ●     ●  空気の中に広がる\n\n【物質はなくならない】\n  液体 → 気体：重さは変わらない\n  形が変わるだけ\n  同じ水が空気の中に広がる\n\n重さは変わらない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 28,
    text: "氷がとけている間に温度が上がらない理由として正しいものはどれか。",
    choices: [
      "熱が氷を水に変えるために使われるから",
      "周りが冷えているから",
      "水の量が減るから",
      "空気が入るから"
    ],
    answer: 0,
    source: "氷をあたためると、はじめは温度が上がります。しかし、氷が水に変わっているあいだは、温度は変わりません。このときの熱は、融解のために使われています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">氷がとけている間の温度\n\n【温度の変化】\n  温度\n    ↑\n     │\n     │  ↑ 温度が上がる\n     │\n   0℃│━━━━━━━━━━━━━━ 0℃のまま\n     │  氷がとけている間\n     │  熱は融解に使われる\n     │\n    └──────────────→ 時間\n\n【状態変化】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●\n        ↓\n    熱が融解に使われる\n        ↓\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n\n熱は温度を上げるためではなく\n融解のために使われる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 29,
    text: "水が沸騰している間に、温度が上がらない理由として正しいものはどれか。",
    choices: [
      "熱が水を気体にするために使われるから",
      "火の力が弱くなるから",
      "水の量が減るから",
      "空気が冷えるから"
    ],
    answer: 0,
    source: "水をあたためると、ある温度で泡を出して気体になります。このとき、水は沸騰しています。沸騰しているあいだ、熱は水を気体に変えるために使われます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">沸騰中の温度\n\n【温度の変化】\n  温度\n    ↑\n 100℃│━━━━━━━━━━━━━━ 100℃のまま\n     │  沸騰している間\n     │  熱は水を気体に変えるために使われる\n     │\n     │  ↑ 温度が上がる\n     │\n    └──────────────→ 時間\n\n【状態変化】\n    ────────────\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n        ↓\n    熱が沸騰に使われる\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●    ブクブクと泡\n    ●     ●\n\n熱は温度を上げるためではなく\n水を気体に変えるために使われる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 30,
    text: "水の状態変化について考えるときに、大切な見方として正しいものはどれか。",
    choices: [
      "何が変わり、何が変わらないかを見る",
      "見た目だけで判断する",
      "温度だけを見る",
      "早く答えることを重視する"
    ],
    answer: 0,
    source: "水が氷になったり、水蒸気になったりしても、水そのものは同じです。変わるのは、すがたや広がり方です。理科では、このように何が変わり、何が変わらないかを見ることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">状態変化の見方\n\n【変わるもの】\n    • すがた（固体・液体・気体）\n    • 広がり方（形・体積）\n    • 見え方（見える・見えない）\n\n【変わらないもの】\n    • 水そのもの（同じ物質）\n    • 重さ（全体の重さ）\n\n【例】\n    ● ● ●\n    ● ● ●  氷（固体）\n    ● ● ●\n        ↓\n    ●  ●  ●\n     ● ● ●  水（液体）\n    ●  ●  ●\n        ↓\n    ●     ●\n         ●\n    ●       ← 水蒸気（気体）\n      ●\n    ●     ●\n\n何が変わり、何が変わらないかを見る</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  }
];
