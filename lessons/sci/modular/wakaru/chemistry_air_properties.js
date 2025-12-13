// chemistry_air_properties.js
window.questions = [

  // ===== 超基本語彙チェック =====
  {
    qnum: 1,
    text: "物が燃えるときに必要な気体を何という？",
    choices: ["酸素", "二酸化炭素", "窒素", "水素"],
    answer: 0,
    source: "物が燃え続けるには、まわりの空気の中にある「燃えるのを助ける気体」が必要です。この気体が多いほど燃えやすく、少ないと火は消えやすくなります。物を燃やすはたらきをもつ気体を 酸素 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸素とは\n\n【はたらき】\n  物を燃やす気体\n  燃焼を助ける\n\n【多い場合】\n  燃えやすい\n  火が続きやすい\n\n【少ない場合】\n  燃えにくい\n  火が消えやすい\n\n空気中に約21%ふくまれる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 2,
    text: "物が燃えることを理科では何という？",
    choices: ["燃焼", "蒸発", "凝固", "溶解"],
    answer: 0,
    source: "木や紙に火をつけると、熱と光が出て燃え続けます。これは、物が空気中の酸素とはたらいて変化している状態です。理科では、物が燃えることを 燃焼 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼とは\n\n【現象】\n  物が燃えること\n  熱と光が出る\n\n【しくみ】\n  物 + 酸素\n      ↓\n  変化（燃焼）\n      ↓\n  熱・光・二酸化炭素\n\n【例】\n  木 + 酸素 → 燃焼\n  紙 + 酸素 → 燃焼</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 3,
    text: "空気中に最も多く含まれている気体を何という？",
    choices: ["窒素", "酸素", "二酸化炭素", "水蒸気"],
    answer: 0,
    source: "空気は1つの気体ではなく、いくつかの気体がまざったものです。その中でいちばん多いのは、燃焼を助けない気体です。空気の大部分をしめている気体を 窒素 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">窒素とは\n\n【空気の成分】\n  ┌─────────────┐\n  │  窒素：約78%  │ ← いちばん多い\n  │  酸素：約21%  │\n  │  その他：約1% │\n  └─────────────┘\n\n【性質】\n  • 燃焼を助けない\n  • 空気の大部分をしめる\n  • 無色・無臭</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 4,
    text: "燃焼によって発生し、火を消すはたらきのある気体を何という？",
    choices: ["二酸化炭素", "酸素", "窒素", "水素"],
    answer: 0,
    source: "物が燃えると、空気中の酸素が使われ、別の気体が増えます。その気体は燃焼を助けず、火を消えやすくします。燃焼でできて火を消しやすくする気体を 二酸化炭素 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">二酸化炭素とは\n\n【できるしくみ】\n  物 + 酸素 → 燃焼\n      ↓\n  二酸化炭素ができる\n\n【性質】\n  • 燃焼を助けない\n  • 火を消えやすくする\n  • 酸素が少なくなる\n\n【はたらき】\n  燃焼をさまたげる\n  火を消しやすくする</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 5,
    text: "生物が生きるために酸素を使うはたらきを何という？",
    choices: ["呼吸", "光合成", "燃焼", "蒸発"],
    answer: 0,
    source: "人や動物は、生きるために酸素を体の中で使ってエネルギーを取り出しています。酸素を使い、二酸化炭素などを出すはたらきを 呼吸 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">呼吸とは\n\n【はたらき】\n  酸素を取り入れる\n  エネルギーを取り出す\n  二酸化炭素を出す\n\n【しくみ】\n  空気（酸素）\n      ↓\n  体の中\n      ↓\n  エネルギー + 二酸化炭素\n\n【生き物】\n  人・動物・植物\n  すべてが呼吸する</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },

  // ===== 思考・実験問題 =====
  {
    qnum: 6,
    text: "同じ長さのろうそくを、①空気中、②酸素を多く含むびん、③二酸化炭素を多く含むびんで燃やした。最も長く燃え続けるのはどれ？",
    choices: ["②", "①", "③", "すべて同じ"],
    answer: 0,
    source: "燃焼は酸素があるほど続きやすくなります。酸素が多い容器では火は長く燃え、二酸化炭素が多い容器では酸素が少なくなるので火は続きにくくなります。したがって最も長く燃えるのは、酸素を多く含む容器です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸素の量と燃焼\n\n【①空気中】\n  酸素：約21%\n  燃える時間：中くらい\n\n【②酸素が多い】\n  酸素：多い\n  燃える時間：長い ← 最長\n\n【③二酸化炭素が多い】\n  酸素：少ない\n  燃える時間：短い\n\n酸素が多いほど長く燃える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 7,
    text: "ろうそくを密閉容器の中で燃やし続けたところ、しばらくして火が消えた。この理由として正しいものはどれ？",
    choices: ["容器内の酸素が使われたから", "二酸化炭素が冷えたから", "窒素が増えたから", "空気がなくなったから"],
    answer: 0,
    source: "ろうそくは燃えるときに、まわりの酸素を使います。密閉すると新しい空気が入らず、酸素が減っていきます。酸素が足りなくなると燃焼が続かず、火は消えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">密閉容器での燃焼\n\n【はじめ】\n  容器内：酸素あり\n  ろうそく：燃える\n\n【燃え続ける】\n  酸素を使う\n  新しい空気が入らない\n  酸素が減る\n\n【酸素がなくなる】\n  酸素：足りない\n  燃焼：続かない\n  火：消える\n\n密閉すると酸素が減る</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 8,
    text: "線香を空気中と、二酸化炭素が多い容器の中で燃やした。正しい結果はどれ？",
    choices: ["二酸化炭素が多い容器ではすぐに火が消える", "二酸化炭素が多い容器の方がよく燃える", "どちらも同じ時間燃える", "空気中では火がつかない"],
    answer: 0,
    source: "二酸化炭素は燃焼を助けない気体です。二酸化炭素が多い容器では、その分だけ酸素が少なくなります。酸素が足りないと燃焼は続けられないので、二酸化炭素が多い容器では火がすぐ消えやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">二酸化炭素と燃焼\n\n【空気中】\n  酸素：ある\n  燃える：続く\n\n【二酸化炭素が多い】\n  二酸化炭素：多い\n  酸素：少ない\n  燃える：続かない\n  火：すぐ消える\n\n【理由】\n  二酸化炭素は燃焼を助けない\n  酸素が少なくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 9,
    text: "ろうそくを密閉容器で燃やした前後で、容器内の気体の変化として正しいものはどれ？",
    choices: ["酸素が減り、二酸化炭素が増える", "酸素と窒素が同じ割合で減る", "二酸化炭素が減る", "すべての気体が同じ割合で増える"],
    answer: 0,
    source: "燃焼では、空気中の 酸素 が使われます。その結果、燃えたあとには 二酸化炭素 が増えます。密閉して燃やすと外から空気が入らないので、「酸素が減り、二酸化炭素が増える」変化になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">燃焼での気体の変化\n\n【燃やす前】\n  酸素：多い\n  二酸化炭素：少ない\n\n【燃やす】\n  酸素を使う\n  二酸化炭素ができる\n\n【燃えた後】\n  酸素：減る ↓\n  二酸化炭素：増える ↑\n\n密閉すると外から空気が入らない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 10,
    text: "発芽した種子を密閉容器に入れ、しばらく置いた。このとき起こる変化として正しいものはどれ？",
    choices: ["酸素が減り、二酸化炭素が増える", "酸素が増える", "窒素が大きく減る", "空気の成分は変わらない"],
    answer: 0,
    source: "発芽した種子も生き物なので呼吸をします。呼吸では酸素を使い、二酸化炭素を出します。密閉容器では外から空気が入らないため、時間がたつと「酸素が減り、二酸化炭素が増える」状態になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">呼吸での気体の変化\n\n【はじめ】\n  酸素：多い\n  二酸化炭素：少ない\n\n【呼吸する】\n  種子が酸素を使う\n  二酸化炭素を出す\n\n【時間がたつ】\n  酸素：減る ↓\n  二酸化炭素：増える ↑\n\n密閉容器では外から空気が入らない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 11,
    text: "空気を入れた注射器の口をふさぎ、押すと押し返される。この性質として正しいものはどれ？",
    choices: ["空気は圧力をもつ", "空気は必ず上にのぼる", "空気は重さをもたない", "空気は燃えやすい"],
    answer: 0,
    source: "注射器の口をふさぐと、中の空気は外へ出られません。押すと空気はせまい場所に集まって押し返す力を出します。この、空気が内側から押す力を 圧力（あつりょく） といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">圧力とは\n\n【注射器】\n  ┌─────┐\n  │ 空気 │ ← 押す\n  └─────┘\n      ↓\n  【せまくなる】\n  ┌───┐\n  │空気│ ← 押し返す\n  └───┘\n\n【圧力】\n  空気が内側から押す力\n  押されると強くなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 12,
    text: "高い山でろうそくの火がつきにくい理由として、最も直接的な原因はどれ？",
    choices: ["空気中の酸素の量が少ないから", "空気の温度が低くなるから", "気圧が低く、火が消えるから", "二酸化炭素の量が多くなるから"],
    answer: 0,
    source: "高い山では空気がうすく、空気の量が少なくなります。空気が少ないと、その中にある酸素の量も少なくなります。燃焼には酸素が必要なので、高い山では火がつきにくくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">高い山での空気\n\n【平地】\n  空気：多い\n  酸素：多い\n  火：つきやすい\n\n【高い山】\n  空気：少ない（うすい）\n  酸素：少ない\n  火：つきにくい\n\n【理由】\n  空気が少ない\n  → 酸素も少ない\n  → 燃焼しにくい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 13,
    text: "水中でろうそくの火が燃え続けない主な理由として正しいものはどれ？",
    choices: ["燃焼に必要な酸素を十分に取り入れられないから", "水にはまったく酸素が含まれていないから", "水が冷たく、火を消すから", "二酸化炭素が多く発生するから"],
    answer: 0,
    source: "燃焼が続くには、火のまわりに酸素を取り入れ続ける必要があります。水の中では火のまわりに十分な空気（酸素）を取り込めません。そのため水中ではろうそくの火は燃え続けにくくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">水中での燃焼\n\n【空気中】\n  火のまわり：空気（酸素）\n  燃える：続く\n\n【水中】\n  火のまわり：水\n  空気（酸素）：取り込めない\n  燃える：続かない\n\n【理由】\n  酸素を取り入れられない\n  燃焼が続かない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 14,
    text: "次のうち、燃焼に関する説明として正しいものはどれ？",
    choices: ["酸素は燃焼を助けるはたらきをもつ", "窒素は燃焼を助けるはたらきをもつ", "二酸化炭素は燃焼を強める", "すべての気体は燃焼を助ける"],
    answer: 0,
    source: "燃焼を助けるはたらきをするのは酸素です。窒素や二酸化炭素は燃焼を助けません。したがって「酸素は燃焼を助けるはたらきをもつ」が正しい説明です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">気体と燃焼\n\n【燃焼を助ける】\n  ✓ 酸素\n    物を燃やすはたらき\n\n【燃焼を助けない】\n  × 窒素\n  × 二酸化炭素\n    燃焼をさまたげる\n\n【正しい説明】\n  酸素は燃焼を助ける</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 15,
    text: "空気中で最も多く含まれる気体が、燃焼を助けないことの意味として正しいものはどれ？",
    choices: ["空気全体が燃えやすいわけではない", "空気は燃えない", "酸素は不要である", "二酸化炭素が主成分である"],
    answer: 0,
    source: "空気の大部分をしめる窒素は、燃焼を助けない気体です。つまり、空気は「全部が燃えやすい気体」ではなく、燃焼を助ける酸素は空気の一部にふくまれているだけです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気の成分と燃焼\n\n【空気の成分】\n  ┌─────────────┐\n  │ 窒素：約78%  │ ← 燃焼を助けない\n  │ 酸素：約21%  │ ← 燃焼を助ける\n  │ その他：約1% │\n  └─────────────┘\n\n【意味】\n  空気全体が燃えやすい\n  わけではない\n  酸素は一部だけ</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 16,
    text: "窒素が空気中に多く含まれている利点として正しいものはどれ？",
    choices: ["燃焼が急激に進みすぎない", "物が必ず燃える", "呼吸が必要なくなる", "空気が軽くなる"],
    answer: 0,
    source: "もし空気が酸素ばかりだと、燃焼がとても強くなり、火が広がりやすくなります。空気の大部分が窒素であることで、燃焼が急激に進みすぎにくくなります。これが窒素が多い利点です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">窒素が多い利点\n\n【もし酸素ばかり】\n  燃焼：とても強い\n  火：広がりやすい\n  危険：大きい\n\n【窒素が多い】\n  燃焼：急激に進みすぎない\n  火：広がりにくい\n  安全：保たれる\n\n【利点】\n  燃焼が適度に保たれる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 17,
    text: "日中、植物を入れた密閉容器内の空気に起こりやすい変化として正しいものはどれ？",
    choices: ["酸素が増え、二酸化炭素が減る", "酸素が減り、二酸化炭素が増える", "すべての気体が減る", "空気の成分は変わらない"],
    answer: 0,
    source: "植物は日中、光があると 光合成 をします。光合成では二酸化炭素を使い、酸素を作ります。密閉容器の中ではその影響が出やすいので、日中は「酸素が増え、二酸化炭素が減る」変化が起こりやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">光合成での変化\n\n【日中】\n  光：ある\n  光合成：する\n\n【光合成】\n  二酸化炭素を使う\n  酸素を作る\n\n【結果】\n  酸素：増える ↑\n  二酸化炭素：減る ↓\n\n密閉容器では影響が出やすい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 18,
    text: "夜、植物を入れた密閉容器内の空気に起こる変化として正しいものはどれ？",
    choices: ["酸素が減り、二酸化炭素が増える", "酸素が増え、二酸化炭素が減る", "窒素が大きく減る", "空気の成分は変わらない"],
    answer: 0,
    source: "植物も生き物なので、昼も夜も呼吸をします。夜は光がなく光合成がほとんどできない一方で、呼吸で酸素を使い二酸化炭素を出します。そのため夜は「酸素が減り、二酸化炭素が増える」変化になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">夜の植物\n\n【夜】\n  光：ない\n  光合成：ほとんどしない\n  呼吸：する\n\n【呼吸】\n  酸素を使う\n  二酸化炭素を出す\n\n【結果】\n  酸素：減る ↓\n  二酸化炭素：増える ↑\n\n昼と夜で変化がちがう</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 19,
    text: "火災時に窓をむやみに開けると危険な理由として正しいものはどれ？",
    choices: ["酸素が供給され、燃焼が激しくなるから", "二酸化炭素が増えるから", "空気が重くなるから", "煙が消えるから"],
    answer: 0,
    source: "火は酸素があるほど強く燃えます。窓を開けると外から新しい空気が入り、火に酸素がたくさん供給されます。その結果、燃焼が激しくなり、火が大きくなったり燃え広がったりしやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">窓を開けると\n\n【窓を閉める】\n  空気：入らない\n  酸素：少ない\n  燃焼：弱い\n\n【窓を開ける】\n  空気：入る\n  酸素：たくさん供給\n  燃焼：激しくなる\n  火：大きくなる\n  火：広がりやすい\n\n【危険】\n  火災時は窓を開けない</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 20,
    text: "もし空気中の酸素の割合が現在より大きくなった場合、起こりやすい現象はどれ？",
    choices: ["火が燃え広がりやすくなる", "呼吸ができなくなる", "空気が軽くなる", "音が伝わらなくなる"],
    answer: 0,
    source: "燃焼は酸素が多いほど強く進みます。空気中の酸素の割合が今より大きくなると、火がつきやすくなり燃え方も激しくなります。そのため、火が燃え広がりやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">酸素が多いと\n\n【現在の空気】\n  酸素：約21%\n  燃え方：普通\n\n【酸素が増える】\n  酸素：多い\n  火：つきやすい\n  燃え方：激しい\n  火：広がりやすい\n\n【理由】\n  酸素が多いほど\n  燃焼が強く進む</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 21,
    text: "空気を入れたビニール袋を押すと、押し返される理由として正しいものはどれか。",
    choices: ["空気が押し返す力をもっているから", "水が入っているから", "ゴムがかたいから", "重さが増えるから"],
    answer: 0,
    source: "ビニール袋の中には空気が入っています。空気は押されると、もとの広さに戻ろうとします。このとき、空気は内側から押し返す力を出します。この力を 圧力（あつりょく） といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ビニール袋と圧力\n\n【押す前】\n  ┌──────┐\n  │ 空気  │\n  └──────┘\n\n【押す】\n  ┌───┐\n  │空気│ ← 押される\n  └───┘\n      ↓\n  【押し返す】\n  内側から力が出る\n  これが圧力\n\n空気はもとの広さに戻ろうとする</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 22,
    text: "注射器の口をふさいだまま押すと、強く押し返される理由として正しいものはどれか。",
    choices: ["空気がせまい所に集まり、圧力が大きくなるから", "水が出てくるから", "空気がなくなるから", "重くなるから"],
    answer: 0,
    source: "注射器の中には空気が入っています。押すと、同じ空気がよりせまい場所に集まります。すると、空気が内側から押す力が大きくなります。これを 圧力が大きくなる といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">注射器と圧力\n\n【押す前】\n  ┌─────┐\n  │ 空気 │\n  └─────┘\n  圧力：小さい\n\n【押す】\n  ┌───┐\n  │空気│ ← せまくなる\n  └───┘\n  圧力：大きくなる\n\n【理由】\n  同じ空気を\n  せまい所に集める\n  → 圧力が大きくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 23,
    text: "空気に重さがあるとわかる理由として正しいものはどれか。",
    choices: ["空気を入れる前と後で重さが変わるから", "空気が見えるから", "空気に色があるから", "空気が流れるから"],
    answer: 0,
    source: "ふくらませる前の袋と、空気を入れた後の袋を比べると重さが変わります。これは、袋の中に入った空気に重さがあるためです。このように、空気にも重さがあります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気の重さ\n\n【ふくらませる前】\n  袋：軽い\n  重さ：小さい\n\n【空気を入れる】\n  袋：重くなる\n  重さ：大きくなる\n\n【理由】\n  空気に重さがある\n  空気を入れると重くなる\n\n空気にも重さがある</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 24,
    text: "ペットボトルの中の空気を押すと、体積が小さくなる理由として正しいものはどれか。",
    choices: ["空気は押すと体積が小さくなるから", "空気が消えるから", "水に変わるから", "外に出るから"],
    answer: 0,
    source: "空気は、押されるとせまい場所に集まります。そのため、同じ空気でも体積が小さくなります。この性質を 空気は押すと体積が小さくなる といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気と体積\n\n【押す前】\n  ┌──────┐\n  │ 空気  │\n  └──────┘\n  体積：大きい\n\n【押す】\n  ┌───┐\n  │空気│\n  └───┘\n  体積：小さい\n\n【性質】\n  押すと体積が小さくなる\n  せまい場所に集まる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 25,
    text: "空気についての説明として正しいものはどれか。",
    choices: ["空気は目に見えないが、重さと体積がある", "空気は見えないので何もない", "空気は重さがない", "空気は体積をもたない"],
    answer: 0,
    source: "空気は目に見えませんが、袋に入れると場所をとります。また、入れる前と後で重さも変わります。このことから、空気には 体積と重さ があるとわかります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気の性質\n\n【見た目】\n  目に見えない\n  透明\n\n【体積】\n  袋に入れると場所をとる\n  → 体積がある\n\n【重さ】\n  入れる前と後で重さが変わる\n  → 重さがある\n\n【まとめ】\n  見えなくても\n  体積と重さがある</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 26,
    text: "「空気は軽いので、上からの力はない」という考えについて正しいものはどれか。",
    choices: ["空気は四方八方から押す力をもっている", "下からだけ押す", "上からは押さない", "力をもたない"],
    answer: 0,
    source: "空気は、まわりの物をあらゆる向きから押しています。上・下・横、どの向きにも力を出します。このような、空気が押す力を 空気の圧力 といいます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気の圧力の向き\n\n【誤った考え】\n  × 上からの力はない\n  × 下からだけ押す\n\n【正しい考え】\n  ✓ 上から押す\n  ✓ 下から押す\n  ✓ 横から押す\n  ✓ 四方八方から押す\n\n【空気の圧力】\n  あらゆる向きから\n  力を出している</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 27,
    text: "空気が押す力が大きくなる条件として正しいものはどれか。",
    choices: ["同じ空気をせまい所に集めたとき", "空気を外に出したとき", "空気がなくなったとき", "空気が冷えたとき"],
    answer: 0,
    source: "同じ量の空気を、よりせまい場所に押しこむと、空気は強く押し返そうとします。そのため、圧力は大きくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">圧力が大きくなる条件\n\n【広い場所】\n  ┌──────┐\n  │ 空気  │\n  └──────┘\n  圧力：小さい\n\n【せまい場所】\n  ┌───┐\n  │空気│\n  └───┘\n  圧力：大きい\n\n【条件】\n  同じ量の空気を\n  せまい所に集める\n  → 圧力が大きくなる</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 28,
    text: "高い山でペットボトルがへこみやすい理由として正しいものはどれか。",
    choices: ["外の空気の圧力が小さいから", "中の空気がなくなるから", "水が入るから", "温度が高いから"],
    answer: 0,
    source: "高い場所では、空気の量が少なくなります。そのため、外から押す空気の圧力も小さくなります。中と外の圧力のちがいで、ペットボトルはへこみやすくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">高い山でのペットボトル\n\n【平地】\n  外の圧力：大きい\n  中の圧力：大きい\n  へこまない\n\n【高い山】\n  外の圧力：小さい\n  中の圧力：大きい（変わらない）\n  へこみやすい\n\n【理由】\n  外の圧力が小さい\n  中と外の圧力のちがい</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 29,
    text: "ストローで飲み物が口に入ってくる理由として正しいものはどれか。",
    choices: ["外の空気が押すから", "口が吸い上げるから", "水がのぼるから", "重力がなくなるから"],
    answer: 0,
    source: "ストローで吸うと、ストローの中の空気が少なくなります。すると、外の空気の圧力のほうが大きくなります。その力で、飲み物が押し上げられて口に入ります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">ストローで飲む\n\n【吸う前】\n  ストロー内：空気あり\n  外の圧力：普通\n\n【吸う】\n  ストロー内：空気少ない\n  外の圧力：大きい\n\n【結果】\n  外の圧力で\n  飲み物が押し上げられる\n  → 口に入る\n\n外の空気が押すから</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  },
  {
    qnum: 30,
    text: "空気の性質を考えるときに大切な見方として正しいものはどれか。",
    choices: ["見えなくても、力や重さを考える", "見えないものは考えない", "色があるかを見る", "音がするかを見る"],
    answer: 0,
    source: "空気は目に見えませんが、重さや力としてあらわれます。理科では、見えないものでも、はたらきから考えることが大切です。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">空気の考え方\n\n【見た目】\n  目に見えない\n  透明\n\n【はたらき】\n  重さ：ある\n  力（圧力）：ある\n  体積：ある\n\n【大切な見方】\n  見えなくても\n  はたらきから考える\n  重さや力を考える\n\n見えないものでも考える</div>",
    tags: [],
    difficulty: 1,
    asof: "2025-01-27"
  }
];
