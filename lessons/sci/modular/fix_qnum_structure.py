# -*- coding: utf-8 -*-
"""
レッスン2のqnumを1-20に正しく振り直す
"""

import re

with open('wakaru/earth_earthquake_structure.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 問題オブジェクトを抽出
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

# qnumを1-20に振り直す
new_questions = []
for i, q in enumerate(questions, 1):
    # qnumを変更
    q = re.sub(r'"qnum":\s*\d+', f'"qnum": {i}', q)
    new_questions.append(q)

# 新しいファイルを作成
new_content = "// 地震のしくみ（詳細）\n"
new_content += "// レッスンID: sci.earth.earthquake_structure\n"
new_content += "// 出典: 中学受験まるっとチェック2 - セクション25、既存の地震のしくみレッスン\n"
new_content += "\nwindow.questions = [\n"

for i, q in enumerate(new_questions):
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
    if i < len(new_questions) - 1:
        q_indented = q_indented.rstrip() + ','
    new_content += q_indented + '\n'

new_content += "];\n"

with open('wakaru/earth_earthquake_structure.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"修正完了: レッスン2は{len(new_questions)}問")

