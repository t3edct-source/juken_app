# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版に図解を追加するスクリプト
"""

import re

def add_diagram_to_question(source_text, qnum, text):
    """問題文に応じて適切な図解を追加"""
    
    # 既に図解がある場合はスキップ
    if '<div' in source_text:
        return source_text
    
    # 問題文に応じて図解を生成
    diagram = ""
    
    if qnum == 4:  # ばね全体の長さ
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">ばね全体の長さ

【おもりをつるす前】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ もとの長さ：10cm
         │
    ┌─────┐
    │ フック│
    └─────┘

【おもりをつるした後】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══ のび：2cm
    ═══
         │
    ┌─────┐
    │ 重り │
    └─────┘

全体の長さ = もとの長さ + のび
全体の長さ = 10cm + 2cm = 12cm</div>"""
    
    elif qnum == 5:  # 1cmのばすのに必要な重さ
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">1cmのばすのに必要な重さ

【20gで1cmのびるばね】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ のび：1cm
         │
    ┌─────┐
    │ 20g  │
    └─────┘

計算式：
  1cmのばすのに必要な重さ = 重さ ÷ のび
  = 20g ÷ 1cm = 20g/cm

この値が大きいほど硬いばね</div>"""
    
    elif qnum == 7:  # のびを正確にはかる
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">のびを正確にはかる方法

【おもりをつるす前】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ もとの長さ：10cm
         │
    ┌─────┐
    │ フック│
    └─────┘

【おもりをつるした後】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══ 全体の長さ：12cm
    ═══
         │
    ┌─────┐
    │ 重り │
    └─────┘

のび = 全体の長さ - もとの長さ
のび = 12cm - 10cm = 2cm</div>"""
    
    elif qnum == 8 or qnum == 9:  # 計算問題
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">ばねの計算

【40gで17cm】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══ 全体：17cm
    ═══
         │
    ┌─────┐
    │ 40g  │
    └─────┘

【60gで18cm】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══
    ═══ 全体：18cm
    ═══
         │
    ┌─────┐
    │ 60g  │
    └─────┘

重さの差：60g - 40g = 20g
長さの差：18cm - 17cm = 1cm
→ 20gで1cmのびる
→ 1cmのばすのに20g必要</div>"""
    
    elif qnum == 12:  # グラフ
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">ばねののびと重さのグラフ

重さ(g)
  │
300│                    ●
  │                ●
200│            ●
  │        ●
100│    ●
  │●
  └────────────────────── のび(cm)
   0  1  2  3  4  5

特徴：
  • 原点を通る直線
  • 比例の関係
  • 傾きがばねの硬さ</div>"""
    
    elif qnum == 13:  # 直列つなぎ
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">直列つなぎ

【1本のばね】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ のび：1cm
         │
    ┌─────┐
    │ 100g │
    └─────┘

【2本を直列つなぎ】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね1
    ═══ のび：1cm
         │
    ═══ ばね2
    ═══ のび：1cm
         │
    ┌─────┐
    │ 100g │
    └─────┘

全体ののび = 1cm + 1cm = 2cm（2倍）</div>"""
    
    elif qnum == 14:  # 並列つなぎ
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">並列つなぎ

【1本のばね】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ のび：1cm
         │
    ┌─────┐
    │ 100g │
    └─────┘

【2本を並列つなぎ】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね1  ═══ ばね2
    ═══ のび：0.5cm
         │
    ┌─────┐
    │ 100g │
    └─────┘

1本あたり：50g（半分）
のび：0.5cm（半分）</div>"""
    
    elif qnum == 15 or qnum == 16:  # 直列・並列の力
        if qnum == 15:
            diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">直列つなぎの力

【2本を直列つなぎ】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね1（100g）
    ═══
         │
    ═══ ばね2（100g）
    ═══
         │
    ┌─────┐
    │ 100g │
    └─────┘

各ばねにかかる力：
  上側のばね：100g
  下側のばね：100g
  → 同じ力がかかる</div>"""
        else:
            diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">並列つなぎの力

【2本を並列つなぎ】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね1  ═══ ばね2
    ═══ (50g)  ═══ (50g)
         │
    ┌─────┐
    │ 100g │
    └─────┘

各ばねにかかる力：
  ばね1：50g（半分）
  ばね2：50g（半分）
  → 力が分担される</div>"""
    
    elif qnum == 17:  # 逆比
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">のびが同じときの重さの比

【ばねA：20gで1cm】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばねA
    ═══ のび：1cm
         │
    ┌─────┐
    │ 20g  │
    └─────┘

【ばねB：10gで1cm】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばねB
    ═══ のび：1cm
         │
    ┌─────┐
    │ 10g  │
    └─────┘

のびの比：1:1
重さの比：20:10 = 2:1（逆比）</div>"""
    
    elif qnum == 21 or qnum == 22:  # 硬さ
        if qnum == 21:
            diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">ばねの硬さ

【のびやすいばね（柔らかい）】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══ のび：大きい
    ═══
         │
    ┌─────┐
    │ 100g │
    └─────┘

【のびにくいばね（硬い）】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ のび：小さい
         │
    ┌─────┐
    │ 100g │
    └─────┘

のびにくい = 硬い
のびやすい = 柔らかい</div>"""
        else:
            diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">同じ重さでののび

【のびやすいばね】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
    ═══
    ═══ のび：5cm（大きい）
    ═══
         │
    ┌─────┐
    │ 100g │
    └─────┘

【のびにくいばね】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══ のび：1cm（小さい）
         │
    ┌─────┐
    │ 100g │
    └─────┘

同じ重さでも
のびやすいばねの方がのびが大きい</div>"""
    
    elif qnum == 23:  # つり合い
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">ばねと力のつり合い

【同じ力がはたらく場合】
    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね1
    ═══ のび：同じ
         │
    ═══ ばね2
    ═══ のび：同じ
         │
    ┌─────┐
    │ 100g │
    └─────┘

同じ硬さのばねに
同じ大きさの力を加える
→ のびは同じ</div>"""
    
    elif qnum == 24:  # 力のつり合い
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">力のつり合い

    ┌─────┐
    │ かべ │
    └─────┘
         │
    ═══ ばね
    ═══
         │
    ┌─────┐
    │ 重り │
    └─────┘

かべがばねを引く力 ← → おもりがばねを引く力
         ↑
    大きさが等しい（つり合い）</div>"""
    
    elif qnum == 25:  # かっ車
        diagram = """<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">かっ車を使った場合

    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
         │
    ┌─────┐
    │ かっ車│
    └─────┘
         │
    ┌─────┐
    │ 100g │
    └─────┘

かっ車は力を伝えるだけ
→ ばねにかかる力 = おもりの重さ
→ 100g</div>"""
    
    else:
        # デフォルトの図解
        diagram = f"""<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">【Q{qnum}の図解】

    ┌─────┐
    │ 固定 │
    └─────┘
         │
    ═══ ばね
    ═══
         │
    ┌─────┐
    │ 重り │
    └─────┘

ばねと力の関係を理解しましょう</div>"""
    
    # 図解を追加
    if diagram:
        # sourceの最後に図解を追加（閉じ引用符の前に）
        if source_text.endswith('"'):
            source_text = source_text[:-1] + diagram + '"'
        else:
            source_text = source_text + diagram
    
    return source_text

def main():
    filepath = 'wakaru/physics_spring_force_buoyancy_integrated.js'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 各問題のsourceを抽出して図解を追加
    pattern = r'("qnum":\s*(\d+).*?"text":\s*"([^"]+)".*?"source":\s*")([^"]*(?:<div[^>]*>.*?</div>)?[^"]*)(")'
    
    def replace_source(match):
        prefix = match.group(1)
        qnum = int(match.group(2))
        text = match.group(3)
        source = match.group(4)
        suffix = match.group(5)
        
        new_source = add_diagram_to_question(source, qnum, text)
        return prefix + new_source + suffix
    
    new_content = re.sub(pattern, replace_source, content, flags=re.DOTALL)
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"図解の追加が完了しました: {filepath}")

if __name__ == '__main__':
    main()

