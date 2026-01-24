# -*- coding: utf-8 -*-
"""
地震のしくみレッスンの問題を分析し、分割案を提案
"""

import re
import json

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 問題を抽出
pattern = r'window\.questions\s*=\s*\[(.*?)\];'
match = re.search(pattern, content, re.DOTALL)
if match:
    array_content = match.group(1)
    
    questions = []
    brace_count = 0
    current_obj = ""
    in_string = False
    escape_next = False
    
    for char in array_content:
        if escape_next:
            current_obj += char
            escape_next = False
            continue
        
        if char == '\\':
            escape_next = True
            current_obj += char
            continue
        
        if char == '"' and not escape_next:
            in_string = not in_string
        
        if not in_string:
            if char == '{':
                if brace_count == 0:
                    current_obj = ""
                brace_count += 1
                current_obj += char
            elif char == '}':
                current_obj += char
                brace_count -= 1
                if brace_count == 0:
                    questions.append(current_obj.strip())
                    current_obj = ""
            else:
                if brace_count > 0:
                    current_obj += char
        else:
            if brace_count > 0:
                current_obj += char

print("="*80)
print("地震のしくみレッスン 問題分析")
print("="*80)
print(f"\n総問題数: {len(questions)}問\n")

# 問題を分類
def categorize_question(text):
    """問題をカテゴリに分類"""
    # 基礎概念（地震の起こり方、震源、震央、震度、マグニチュード）
    if any(keyword in text for keyword in ['地震は何が', '急にずれる', '岩盤が急にずれる', '震源の真上', 'ゆれの大きさ', '規模（エネルギー量）']):
        return '基礎概念_地震の基本'
    
    # 震源の深さとゆれ
    if any(keyword in text for keyword in ['震源が深い', '震源が浅い']):
        return '基礎概念_震源の深さ'
    
    # 地震波
    if '地震波' in text and '何という' in text:
        return '基礎概念_地震波'
    
    # P波・S波
    if any(keyword in text for keyword in ['速く伝わる', 'ゆっくり伝わり', '最初に届く', 'P波', 'S波']):
        return '基礎概念_P波・S波'
    
    # 初期び動・主要動
    if any(keyword in text for keyword in ['初期び動', '主要動']):
        return '基礎概念_初期び動・主要動'
    
    # 初期び動けい続時間
    if '初期び動けい続時間' in text:
        return '応用_初期び動けい続時間'
    
    # マグニチュードとエネルギー
    if 'マグニチュードが1' in text or '約32倍' in text:
        return '基礎概念_マグニチュード'
    
    # 地盤と震度
    if any(keyword in text for keyword in ['地盤', '震央から遠い', '建物が倒れ', '固い地盤']):
        return '基礎概念_地盤と震度'
    
    # 断層
    if '断層' in text:
        return '基礎概念_断層'
    
    # 津波
    if '津波' in text:
        return '基礎概念_津波'
    
    # 防災
    if any(keyword in text for keyword in ['避難', '火災', '防災']):
        return '応用_防災'
    
    # プレート
    if 'プレート' in text:
        return '応用_プレート'
    
    # 活断層
    if '活断層' in text:
        return '応用_活断層'
    
    # 液状化
    if '液状化' in text:
        return '応用_液状化'
    
    # 緊急地震速報
    if '緊急地震速報' in text:
        return '応用_緊急地震速報'
    
    # 震度とマグニチュードの違い
    if '震度とマグニチュード' in text:
        return '応用_震度とマグニチュードの違い'
    
    # P波とS波の速さ
    if 'P波とS波の速さ' in text:
        return '基礎概念_P波とS波の速さ'
    
    # 震央とゆれの伝わり方
    if '震央を中心' in text:
        return '応用_震央とゆれの伝わり方'
    
    return 'その他'

# 問題を分類
categorized = {}
for i, q in enumerate(questions, 1):
    # qnumとtextを抽出
    qnum_match = re.search(r'"qnum":\s*(\d+)', q)
    text_match = re.search(r'"text":\s*"([^"]+)"', q)
    
    if qnum_match and text_match:
        qnum = int(qnum_match.group(1))
        text = text_match.group(1)
        category = categorize_question(text)
        
        if category not in categorized:
            categorized[category] = []
        categorized[category].append({
            'qnum': qnum,
            'text': text
        })

# 分類結果を表示
print("【問題の分類】")
for category in sorted(categorized.keys()):
    print(f"\n{category}: {len(categorized[category])}問")
    for item in categorized[category]:
        print(f"  Q{item['qnum']}: {item['text']}")

# 分割案を提案
print("\n" + "="*80)
print("分割案の提案")
print("="*80)

# 案1: 30問の1レッスン
print("\n【案1】30問の1レッスン")
print("基礎的な内容を中心に、重要な問題を30問に絞る")
print("削除候補: 重複問題（Q21-Q26）、一部の応用問題")

# 案2: 20問のレッスン2つ
print("\n【案2】20問のレッスン2つ")
print("\nレッスン1: 地震の基礎（20問）")
print("  - 地震の起こり方")
print("  - 震源・震央・震度・マグニチュード")
print("  - 地震波（P波・S波）")
print("  - 地盤と震度")
print("  - 断層・津波")
print("  - 防災の基礎")

print("\nレッスン2: 地震のしくみ（詳細）（20問）")
print("  - 初期び動・主要動")
print("  - 初期び動けい続時間")
print("  - プレートと地震")
print("  - 活断層")
print("  - 液状化")
print("  - 緊急地震速報")
print("  - 震度とマグニチュードの違い")
print("  - その他の応用")

# 具体的な分割案
print("\n" + "="*80)
print("具体的な分割案（案2）")
print("="*80)

lesson1_qnums = []
lesson2_qnums = []

for category, items in categorized.items():
    if '基礎概念' in category or category == '応用_防災':
        for item in items[:20]:  # 基礎概念は最初の20問まで
            if item['qnum'] not in lesson1_qnums:
                lesson1_qnums.append(item['qnum'])
    elif '応用' in category:
        for item in items:
            if item['qnum'] not in lesson2_qnums:
                lesson2_qnums.append(item['qnum'])

# 重複を削除し、ソート
lesson1_qnums = sorted(list(set(lesson1_qnums)))[:20]
lesson2_qnums = sorted(list(set(lesson2_qnums)))[:20]

print(f"\nレッスン1（地震の基礎）: {len(lesson1_qnums)}問")
print(f"Q{lesson1_qnums[0]}～Q{lesson1_qnums[-1]}")

print(f"\nレッスン2（地震のしくみ詳細）: {len(lesson2_qnums)}問")
print(f"Q{lesson2_qnums[0]}～Q{lesson2_qnums[-1]}")

