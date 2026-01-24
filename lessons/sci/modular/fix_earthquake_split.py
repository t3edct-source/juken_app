# -*- coding: utf-8 -*-
"""
地震レッスンの分割を修正
- レッスン1: 地震の基礎（20問）- Q1-Q20
- レッスン2: 地震のしくみ（詳細）（20問）- Q27-Q45（Q21-Q26は重複なので除外）
"""

import re

# レッスン1を修正（Q27を削除して20問にする）
with open('wakaru/earth_earthquake_basic.js', 'r', encoding='utf-8') as f:
    content1 = f.read()

# Q27を削除
pattern = r'  \{[^}]*"qnum":\s*21[^}]*\},?\n'
content1 = re.sub(pattern, '', content1, flags=re.DOTALL)

# qnumを1-20に振り直す（既に1-20になっているはず）
# 念のため確認
qnum_matches = re.findall(r'"qnum":\s*(\d+)', content1)
print(f"レッスン1のqnum: {sorted([int(q) for q in qnum_matches])}")

with open('wakaru/earth_earthquake_basic.js', 'w', encoding='utf-8') as f:
    f.write(content1)

# レッスン2を修正（Q27を追加して20問にする）
with open('wakaru/earth_earthquake_structure.js', 'r', encoding='utf-8') as f:
    content2 = f.read()

# 元のファイルからQ27を取得
with open('wakaru/earth_earthquake_structure.js', 'r', encoding='utf-8') as f:
    original_content = f.read()

# Q27を抽出（元のファイルから）
pattern = r'  \{[^}]*"qnum":\s*27[^}]*\},?\n'
q27_match = re.search(pattern, original_content, re.DOTALL)
if q27_match:
    q27_text = q27_match.group(0)
    # qnumを1に変更
    q27_text = re.sub(r'"qnum":\s*27', '"qnum": 1', q27_text)
    
    # レッスン2の最初に追加（window.questions = [の後）
    content2 = re.sub(
        r'(window\.questions\s*=\s*\[\s*\n)',
        r'\1' + q27_text,
        content2
    )
    
    # 既存のqnumを2-19に変更
    for i in range(1, 20):
        old_qnum = i
        new_qnum = i + 1
        content2 = re.sub(
            rf'"qnum":\s*{old_qnum}(?=\s*[,}])',
            f'"qnum": {new_qnum}',
            content2
        )

qnum_matches = re.findall(r'"qnum":\s*(\d+)', content2)
print(f"レッスン2のqnum: {sorted([int(q) for q in qnum_matches])}")

with open('wakaru/earth_earthquake_structure.js', 'w', encoding='utf-8') as f:
    f.write(content2)

print("\n修正完了:")
print("  - レッスン1: 20問（Q1-Q20）")
print("  - レッスン2: 20問（Q27-Q45）")

