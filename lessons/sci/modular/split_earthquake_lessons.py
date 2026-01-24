# -*- coding: utf-8 -*-
"""
地震のしくみレッスンを2つに分割
- レッスン1: 地震の基礎（20問）
- レッスン2: 地震のしくみ（詳細）（20問）
"""

import re
import json

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# コメント行を抽出
comments = []
for line in content.split('\n'):
    if line.strip().startswith('//'):
        comments.append(line)

# 問題を抽出
pattern = r'window\.questions\s*=\s*\[(.*?)\];'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("エラー: window.questionsが見つかりません")
    exit(1)

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

print(f"抽出された問題数: {len(questions)}問")

# 各問題のqnumを取得
question_dict = {}
for q in questions:
    qnum_match = re.search(r'"qnum":\s*(\d+)', q)
    if qnum_match:
        qnum = int(qnum_match.group(1))
        question_dict[qnum] = q

# レッスン1: 地震の基礎（20問）
# Q1-Q20, Q27
lesson1_qnums = list(range(1, 21)) + [27]
lesson1_questions = []
for i, qnum in enumerate(lesson1_qnums, 1):
    if qnum in question_dict:
        q = question_dict[qnum]
        # qnumを1-20に振り直す
        q = re.sub(r'"qnum":\s*\d+', f'"qnum": {i}', q)
        lesson1_questions.append(q)
    else:
        print(f"警告: Q{qnum}が見つかりません")

# レッスン2: 地震のしくみ（詳細）（20問）
# Q28-Q45（Q21-Q26は重複なので除外）
lesson2_qnums = list(range(28, 46))
lesson2_questions = []
for i, qnum in enumerate(lesson2_qnums, 1):
    if qnum in question_dict:
        q = question_dict[qnum]
        # qnumを1-20に振り直す
        q = re.sub(r'"qnum":\s*\d+', f'"qnum": {i}', q)
        lesson2_questions.append(q)
    else:
        print(f"警告: Q{qnum}が見つかりません")

print(f"\nレッスン1: {len(lesson1_questions)}問")
print(f"レッスン2: {len(lesson2_questions)}問")

# レッスン1のファイルを作成
lesson1_content = "// 地震の基礎\n"
lesson1_content += "// レッスンID: sci.earth.earthquake_basic\n"
lesson1_content += "// 出典: 中学受験まるっとチェック2 - セクション25、既存の地震のしくみレッスン\n"
lesson1_content += "\nwindow.questions = [\n"
for i, q in enumerate(lesson1_questions):
    # インデントを調整
    lines = q.split('\n')
    indented_lines = []
    for line in lines:
        if line.strip():
            if line.strip().startswith('{'):
                indented_lines.append('  {')
            elif line.strip().startswith('}'):
                indented_lines.append('  }')
            else:
                indented_lines.append('    ' + line.strip())
        else:
            indented_lines.append('')
    
    q_indented = '\n'.join(indented_lines)
    if i < len(lesson1_questions) - 1:
        q_indented = q_indented.rstrip() + ','
    lesson1_content += q_indented + '\n'
lesson1_content += "];\n"

# レッスン2のファイルを作成
lesson2_content = "// 地震のしくみ（詳細）\n"
lesson2_content += "// レッスンID: sci.earth.earthquake_structure\n"
lesson2_content += "// 出典: 中学受験まるっとチェック2 - セクション25、既存の地震のしくみレッスン\n"
lesson2_content += "\nwindow.questions = [\n"
for i, q in enumerate(lesson2_questions):
    # インデントを調整
    lines = q.split('\n')
    indented_lines = []
    for line in lines:
        if line.strip():
            if line.strip().startswith('{'):
                indented_lines.append('  {')
            elif line.strip().startswith('}'):
                indented_lines.append('  }')
            else:
                indented_lines.append('    ' + line.strip())
        else:
            indented_lines.append('')
    
    q_indented = '\n'.join(indented_lines)
    if i < len(lesson2_questions) - 1:
        q_indented = q_indented.rstrip() + ','
    lesson2_content += q_indented + '\n'
lesson2_content += "];\n"

# ファイルに書き込み
with open('wakaru/earth_earthquake_basic.js', 'w', encoding='utf-8') as f:
    f.write(lesson1_content)

with open('wakaru/earth_earthquake_structure.js', 'w', encoding='utf-8') as f:
    f.write(lesson2_content)

print("\n分割完了:")
print("  - wakaru/earth_earthquake_basic.js (レッスン1: 地震の基礎、20問)")
print("  - wakaru/earth_earthquake_structure.js (レッスン2: 地震のしくみ（詳細）、20問)")

