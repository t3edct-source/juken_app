// 流れる電流と方位磁針
// レッスンID: sci.physics.current_compass
// 出典: 中学受験まるっとチェック3 - セクション62

window.questions = [
  {
    "qnum": 1,
    "text": "磁界とは何ですか？",
    "choices": [
      "磁石の力（磁力）がはたらく空間",
      "電流が流れる空間",
      "電気が流れる空間",
      "音が伝わる空間"],
    "answer": 0,
    "source": "磁界とは、磁石の力（磁力）がはたらく空間です。磁石のまわりには、目には見えませんが、磁力がはたらく空間が広がっています。この空間を磁界といいます。方位磁針が磁石に引き寄せられるのは、この磁界のためです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">磁界\n\n  ┌─────────┐\n  │ 磁界   │ ← 磁力がはたらく空間\n  │  N  S  │\n  │ 磁石   │\n  └─────────┘\n      ↑\n  方位磁針が引き寄せられる\n\n【特徴】\n  目には見えない\n  磁石のまわりに広がる</div>",
    "tags": ["磁界", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 2,
    "text": "磁界の向きは、何がさす向きですか？",
    "choices": [
      "方位磁針のN極",
      "方位磁針のS極",
      "電流の向き",
      "磁石の向き"],
    "answer": 0,
    "source": "磁界の向きは、方位磁針のN極がさす向きです。磁界には向きがあり、その向きは方位磁針のN極がさす方向で表します。磁石のN極からS極に向かう向きが磁界の向きです。方位磁針を磁界の中に置くと、N極が磁界の向きを指し、S極が反対の向きを指します。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">磁界の向きと方位磁針\n\n    N極がさす向き  →  磁界の向き\n\n    N   S   磁石\n    │   │\n   (N) 方位磁針\n    ↑\n    ここが磁界の向き</div>",
    "tags": ["磁界", "向き", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 3,
    "text": "磁力線とは何ですか？",
    "choices": [
      "磁界の向きに沿ってかいた線",
      "電流の向きに沿ってかいた線",
      "電気の流れを表す線",
      "音の広がりを表す線"],
    "answer": 0,
    "source": "磁力線とは、磁界の向きに沿ってかいた線です。磁界が強いほど線は密になります。磁力線は、磁界の向きを視覚的に表すための線で、磁界が強い場所ほど磁力線が密に描かれます。磁石のN極からS極に向かって描かれます。磁力線が密な場所ほど磁界が強く、磁力線が粗い場所ほど磁界が弱いです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">磁力線のイメージ\n\n    N 極        S 極\n    ─┬────────┬─\n     │  →→→→→→ │  磁力線\n     │  →→→→→→ │\n     │  →→→→→→ │\n\n  ・線の向き：N → S\n  ・線が密：磁界が強い</div>",
    "tags": ["磁力線", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 4,
    "text": "導線に電流を流すと、電流のまわりに何ができますか？",
    "choices": [
      "磁界",
      "電気",
      "熱",
      "光"],
    "answer": 0,
    "source": "導線に電流を流すと、電流のまわりに磁界ができます。電流が流れると、そのまわりに磁界が発生します。これは、電流と磁界の関係を示す重要な現象で、電磁石の原理にもなっています。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">電流と磁界\n\n  導線\n  ──── ← 電流が流れる\n      │\n      │ 磁界ができる\n      │\n      ↓\n\n【電流が流れる】\n      ↓\n【まわりに磁界ができる】\n\n電磁石の原理</div>",
    "tags": ["電流", "磁界", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 5,
    "text": "電流のまわりの磁界の向きは、電流の向きに対してどうなりますか？",
    "choices": [
      "左回り",
      "右回り",
      "前後",
      "上下"],
    "answer": 1,
    "source": "電流のまわりの磁界の向きは、電流の向きに対して右回りです。電流が流れる向きを正面から見たとき、磁界は時計回り（右回り）に発生します。この関係は、右ねじの法則で表すことができます。右ねじを電流の向きに進めながら回すと、その回す向きが磁界の向きになります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">電流と磁界の向き\n\n  画面の奥へ流れる電流（×で表す）\n\n        ○ 磁界の向き（右回り）\n      ↻  │\n   ↻     │\n        × ─ 電流の向き（奥へ）\n\n・電流を正面から見る\n・磁界は右回り（時計回り）</div>",
    "tags": ["電流", "磁界", "向き", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 6,
    "text": "右ねじの法則とは何ですか？",
    "choices": [
      "電流の流れる向きに右ねじの進む向きを合わせると、右ねじを回す向きが磁界の向きになる",
      "電流の流れる向きに左ねじの進む向きを合わせると、左ねじを回す向きが磁界の向きになる",
      "電流の流れる向きが磁界の向きになる",
      "磁界の向きにねじの進む向きを合わせると、電流の向きが決まる"],
    "answer": 0,
    "source": "右ねじの法則とは、電流の流れる向きに右ねじの進む向きを合わせると、右ねじを回す向きが磁界の向きになるという法則です。この法則を使うと、電流の向きから磁界の向きを簡単に求めることができます。右ねじを電流の向きに進めながら回すと、その回す向きが磁界の向きになります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">右ねじの法則\n\n    右ねじを\n    進める向き  →  電流の向き\n\n    回す向き    →  磁界の向き\n\n  ・右ねじを進める方向＝電流\n  ・回す方向＝磁界（右回り）</div>",
    "tags": ["右ねじの法則", "基本"],
    "difficulty": 2,
    "asof": "2026-01-03"
  },
  {
    "qnum": 7,
    "text": "導線（電流）に近いほど、磁界はどうなりますか？",
    "choices": [
      "強くなる",
      "弱くなる",
      "変わらない",
      "一度強くなってから弱くなる"],
    "answer": 0,
    "source": "導線（電流）に近いほど、磁界は強くなります。そのため、方位磁針のふれは大きくなります。磁界の強さは、電流からの距離に反比例するため、導線に近いほど磁界が強くなります。磁界が強いと、方位磁針のN極がより大きくふれるようになります。例えば、導線から1cmの位置と2cmの位置では、1cmの位置の方が磁界が強く、方位磁針のふれも大きくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">距離と磁界の強さ\n\n  導線\n  ────\n    │  ← 1cm（近い） 強い磁界\n   (N) 方位磁針：大きくふれる\n\n    │      ← 2cm（遠い） 弱い磁界\n   (N) 方位磁針：少しだけふれる\n\n近いほど磁界が強い → ふれが大きい</div>",
    "tags": ["磁界", "強さ", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 8,
    "text": "導線を流れる電流が大きいほど、磁界はどうなりますか？",
    "choices": [
      "強くなる",
      "弱くなる",
      "変わらない",
      "一度強くなってから弱くなる"],
    "answer": 0,
    "source": "導線を流れる電流が大きいほど、磁界は強くなります。そのため、方位磁針のふれは大きくなります。磁界の強さは、電流の大きさに比例するため、電流が大きいほど磁界が強くなります。磁界が強いと、方位磁針のN極がより大きくふれるようになります。例えば、電流が2倍になると、磁界も2倍になり、方位磁針のふれも2倍になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">電流と磁界の強さ\n\n  電流が小さいとき\n    ▶ 磁界：弱い\n    ▶ 方位磁針のふれ：小さい\n\n  電流が大きいとき\n    ▶ 磁界：強い\n    ▶ 方位磁針のふれ：大きい\n\n電流↑ → 磁界↑ → ふれ↑</div>",
    "tags": ["電流", "磁界", "強さ", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 9,
    "text": "同じはたらきをする導線が2本以上あるほど、磁界はどうなりますか？",
    "choices": [
      "強くなる",
      "弱くなる",
      "変わらない",
      "一度強くなってから弱くなる"],
    "answer": 0,
    "source": "同じはたらきをする導線が2本以上あるほど、磁界は強くなります。導線を巻いたときなどです。そのため、方位磁針のふれは大きくなります。導線をコイルのように巻くと、各巻きの磁界が重なり合って、より強い磁界ができます。これが電磁石の原理です。巻き数が多いほど、磁界は強くなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">導線の本数と磁界\n\n【1本だけ】\n  ────\n   ↻ 磁界：1本分\n\n【2本（同じ向き）】\n  ────  ────\n   ↻   ＋   ↻  → 磁界が重なって強くなる\n\n巻き数↑ → 磁界↑ → 方位磁針のふれ↑</div>",
    "tags": ["導線", "磁界", "強さ", "基本"],
    "difficulty": 2,
    "asof": "2026-01-03"
  },
  {
    "qnum": 10,
    "text": "逆のはたらきをする導線があると、方位磁針はどうなりますか？",
    "choices": [
      "ふれる",
      "ふれない",
      "どちらでもよい",
      "最初だけふれる"],
    "answer": 1,
    "source": "逆のはたらきをする導線があると、方位磁針はふれません。逆方向の電流が流れる導線があると、それぞれが作る磁界が打ち消し合うため、全体として磁界がなくなります。そのため、方位磁針はふれなくなります。例えば、2本の導線に逆方向の同じ大きさの電流を流すと、磁界が打ち消し合って、方位磁針はふれません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">逆向きの電流と磁界\n\n  上向き電流と下向き電流\n\n   ↑ 電流        ↓ 電流\n   ────      ────\n   ↻ 磁界      ↺ 磁界\n\n  2つの磁界が反対向き\n  → たがいに打ち消し合う\n  → 方位磁針はふれない</div>",
    "tags": ["導線", "方位磁針", "基本"],
    "difficulty": 2,
    "asof": "2026-01-03"
  },
  {
    "qnum": 11,
    "text": "方位磁針のふれ方を調べるとき、右手のひらと方位磁針で導線をはさみ、電流の向きに指先を合わせたとき、N極はどちらにふれますか？",
    "choices": [
      "親指の向き",
      "小指の向き",
      "人差し指の向き",
      "手のひらの向き"],
    "answer": 0,
    "source": "方位磁針のふれ方を調べるとき、右手のひらと方位磁針で導線をはさみ、電流の向きに指先を合わせたとき、N極は親指の向きにふれます。これは、右手の法則と呼ばれる方法で、電流の向きから磁界の向きを簡単に求めることができます。右手の法則を使うと、電流の向きから磁界の向きを簡単に判断できます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">右手と方位磁針\n\n  ・右手で導線をはさむ\n  ・指先：電流の向き\n  ・親指：N極がふれる向き\n\n        親指 ↑  N極のふれ\n        ┌─────┐\n        │ 右手   │\n        └─────┘\n           ↓ 指先（電流の向き）</div>",
    "tags": ["方位磁針", "ふれ", "基本"],
    "difficulty": 2,
    "asof": "2026-01-03"
  },
  {
    "qnum": 12,
    "text": "導線を巻きつけると、磁界はどうなりますか？",
    "choices": [
      "強くなる",
      "弱くなる",
      "変わらない",
      "一度強くなってから弱くなる"],
    "answer": 0,
    "source": "導線を巻きつけると、磁界が強くなります。導線をコイルのように巻くと、各巻きの磁界が重なり合って、より強い磁界ができます。巻き数が多いほど、磁界は強くなります。これが電磁石の原理です。例えば、巻き数が2倍になると、磁界も2倍になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">コイルと磁界\n\n【1巻き】\n   ─( )─  磁界：1巻き分\n\n【たくさん巻く】\n   ─( ))))─  磁界：何巻き分も重なって強くなる\n\n巻き数↑ → 磁界↑ → 方位磁針のふれ↑</div>",
    "tags": ["導線", "磁界", "強さ", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 13,
    "text": "電流を大きくするには、どうすればよいですか？",
    "choices": [
      "かん電池を直列につなぐ",
      "かん電池を並列につなぐ",
      "かん電池を減らす",
      "スイッチを切る"],
    "answer": 0,
    "source": "電流を大きくするには、かん電池を直列につなぎます。かん電池を直列につなぐと、電圧が大きくなり、電流も大きくなります。かん電池の個数に比例して電流が大きくなるため、より強い磁界を作ることができます。例えば、かん電池を2個直列につなぐと、電圧が2倍になり、電流も2倍になります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">直列つなぎと電流\n\n【1個】\n  [+]─[-] → 電流：1倍\n\n【2個直列】\n  [+]─[-][+]─[-] → 電流：2倍\n\nかん電池の数↑ → 電圧↑ → 電流↑ → 磁界↑</div>",
    "tags": ["電流", "かん電池", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 14,
    "text": "2本の導線を平行に並べ、それぞれの導線に逆方向の同じ大きさの電流を流すと、方位磁針はどうなりますか？",
    "choices": [
      "ふれる",
      "ふれない",
      "どちらでもよい",
      "最初だけふれる"],
    "answer": 1,
    "source": "2本の導線を平行に並べ、それぞれの導線に逆方向の同じ大きさの電流を流すと、逆のはたらきをする導線があるため、方位磁針はふれません。逆方向の電流が流れる導線があると、それぞれが作る磁界が打ち消し合うため、全体として磁界がなくなります。そのため、方位磁針はふれなくなります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">逆向きの電流（2本平行）\n\n   ↑ 電流        ↓ 電流\n   ────      ────\n   ↻ 磁界      ↺ 磁界\n\n真ん中付近では\n  ↻ と ↺ が反対向き\n  → 打ち消し合う\n  → 方位磁針はふれない</div>",
    "tags": ["導線", "方位磁針", "基本"],
    "difficulty": 2,
    "asof": "2026-01-03"
  },
  {
    "qnum": 15,
    "text": "方位磁針は、導線のどこに置きますか？",
    "choices": [
      "導線の上",
      "導線の下",
      "導線の上または下",
      "導線から離れた場所"],
    "answer": 2,
    "source": "方位磁針は、導線の上または下に置きます。電流が流れる導線のまわりには、円形の磁界ができます。この磁界を検出するため、方位磁針は導線の上または下に置きます。導線の横に置いても磁界を検出できますが、上または下に置くのが一般的です。導線の上または下に置くことで、磁界の向きをはっきりと確認できます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">導線と方位磁針の位置\n\n   (N) 方位磁針    ← 導線の上\n      ────  導線\n   (N) 方位磁針    ← 導線の下\n\n導線の上・下に置くと\n  → まわりの磁界の向きがよくわかる</div>",
    "tags": ["方位磁針", "導線", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 16,
    "text": "磁力線が密になっているほど、磁界はどうなりますか？",
    "choices": [
      "強い",
      "弱い",
      "変わらない",
      "一度強くなってから弱くなる"],
    "answer": 0,
    "source": "磁力線が密になっているほど、磁界は強いです。磁力線は、磁界の強さを視覚的に表すための線で、磁界が強い場所ほど磁力線が密に描かれます。磁石のN極とS極の近くでは、磁力線が密になり、磁界が強くなります。磁力線が粗い場所では磁界が弱く、磁力線が密な場所では磁界が強いです。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">磁力線の密度と強さ\n\n【磁界が強い】\n  N→→→→→S  （線がたくさん）\n\n【磁界が弱い】\n  N→   →   →S  （線が少ない）\n\n線が密：磁界が強い\n線が粗：磁界が弱い</div>",
    "tags": ["磁力線", "磁界", "強さ", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 17,
    "text": "発光ダイオードは、電流がどの向きに流れたときだけ発光しますか？",
    "choices": [
      "長いほうの端子（+極）から短いほうの端子（-極）に流れたとき",
      "短いほうの端子（-極）から長いほうの端子（+極）に流れたとき",
      "どちらの向きでも発光する",
      "電流が流れていないとき"],
    "answer": 0,
    "source": "発光ダイオードは、電流が長いほうの端子（+極）から短いほうの端子（-極）に流れたときだけ発光します。発光ダイオードは、電流が一方向にしか流れない性質（整流作用）を持っているため、正しい向きに電流を流さないと発光しません。逆方向に電流を流すと、発光せず、電流も流れません。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">発光ダイオードの向き\n\n    (+) 長い端子 →──▶│>|──→ (-) 短い端子\n           電流がこの向きに流れると光る\n\n    逆向き\n    (-) ──▶│<|──→ (+)\n      電流は流れない → 光らない</div>",
    "tags": ["発光ダイオード", "電流", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 18,
    "text": "電流計は、はかりたい部分にどのようにつなぎますか？",
    "choices": [
      "直列",
      "並列",
      "どちらでもよい",
      "どこにもつながない"],
    "answer": 0,
    "source": "電流計は、はかりたい部分に直列につなぎます。電流は、回路のどの部分でも同じ大きさなので、電流計を直列につなぐことで、その部分を流れる電流を正確にはかることができます。並列につなぐと、電流計に流れる電流が変わってしまい、正確にはかれません。直列につなぐことで、回路全体を流れる電流を正確にはかることができます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">電流計のつなぎ方\n\n【正しい例：直列】\n  電池 ─ 電流計 ─ 豆電球 ─ 戻る\n\n【誤った例：並列】\n  電池 ─ 豆電球 ─ 戻る\n              │\n            電流計（並列）\n\n直列につなぐ → 回路を流れる電流そのものをはかれる</div>",
    "tags": ["電流計", "使い方", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 19,
    "text": "電流計の端子は、はじめはどの端子につなぎますか？",
    "choices": [
      "最大（5A）の端子",
      "最小の端子",
      "どちらでもよい",
      "真ん中の端子"],
    "answer": 0,
    "source": "電流計の端子は、はじめは最大（5A）の端子につなぎます。大きな電流が流れて電流計がこわれるのを防ぐためです。電流計には複数の端子があり、はじめは最大の端子につなぎます。針のふれが小さいときは、順に小さな端子につなぎ変えて、より正確な値を読み取ります。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">電流計の端子の選び方\n\n【はじめ】\n  5A端子 → 安全に様子を見る\n\n【ふれが小さいとき】\n  1A端子 → さらに細かく読む\n  0.5A端子 → もっと細かく読む\n\n大きい端子から始めて、必要に応じて小さい端子へ</div>",
    "tags": ["電流計", "使い方", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  },
  {
    "qnum": 20,
    "text": "電流計の針のふれが小さいときは、どうしますか？",
    "choices": [
      "順に小さな端子につなぎ変える",
      "大きな端子につなぎ変える",
      "そのままにする",
      "回路を切る"],
    "answer": 0,
    "source": "電流計の針のふれが小さいときは、順に小さな端子につなぎ変えます。針のふれが小さいと、正確な値を読み取ることが難しいため、より小さな端子につなぎ変えることで、針のふれを大きくし、より正確な値を読み取ることができます。例えば、5A端子で針のふれが小さいときは、1A端子や0.5A端子につなぎ変えます。<div style=\"font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;\">針のふれと端子\n\n【針のふれが小さい】\n  → 小さな端子へ\n     5A → 1A → 0.5A\n\n【針のふれが大きすぎる】\n  → 大きな端子へ\n     0.5A → 1A → 5A\n\nちょうど読みやすいふれになる端子を選ぶ</div>",
    "tags": ["電流計", "使い方", "基本"],
    "difficulty": 1,
    "asof": "2026-01-03"
  }
];

