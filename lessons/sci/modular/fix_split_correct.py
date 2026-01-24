# -*- coding: utf-8 -*-
"""
地震レッスンの分割を修正
- レッスン1: 地震の基礎（20問）- Q1-Q20
- レッスン2: 地震のしくみ（詳細）（20問）- Q27-Q45
"""

import re

# レッスン1からQ27（qnum: 21）を削除
with open('wakaru/earth_earthquake_basic.js', 'r', encoding='utf-8') as f:
    content1 = f.read()

# Q27（qnum: 21）の問題オブジェクトを削除
# 問題オブジェクト全体を抽出して削除
lines1 = content1.split('\n')
new_lines1 = []
skip_until_brace = False
brace_count = 0

for i, line in enumerate(lines1):
    if '"qnum": 21' in line:
        skip_until_brace = True
        brace_count = 0
        continue
    
    if skip_until_brace:
        if '{' in line:
            brace_count += line.count('{')
        if '}' in line:
            brace_count -= line.count('}')
            if brace_count <= 0:
                skip_until_brace = False
                # カンマも削除
                continue
        continue
    
    new_lines1.append(line)

content1 = '\n'.join(new_lines1)

with open('wakaru/earth_earthquake_basic.js', 'w', encoding='utf-8') as f:
    f.write(content1)

# レッスン2にQ27を追加（元のファイルから取得する必要があるが、既に分割されているので手動で追加）
# 元のファイルのバックアップからQ27を取得するか、直接追加
q27_content = """  {
    "qnum": 1,
    "text": "はじめの小さなゆれを何という？",
    "choices": [
      "初期び動",
      "主要動",
      "P波",
      "S波",
      "震度"
    ],
    "answer": 0,
    "source": "はじめの小さなゆれを初期び動といいます。初期び動はP波が届いて起こります。P波は地震が発生したときに発生する波のうち、速いほうの波です。",
    "tags": ["初期び動", "P波", "小さなゆれ"],
    "difficulty": 1,
    "asof": "2026-01-02"
  },"""

with open('wakaru/earth_earthquake_structure.js', 'r', encoding='utf-8') as f:
    content2 = f.read()

# Q27を最初に追加し、既存のqnumを2-19に変更
# まず既存のqnumを2-19に変更
for i in range(18, 0, -1):  # 逆順で変更
    old_pattern = f'"qnum": {i}'
    new_pattern = f'"qnum": {i+1}'
    content2 = content2.replace(old_pattern, new_pattern)

# Q27を最初に追加
content2 = content2.replace(
    'window.questions = [\n',
    'window.questions = [\n' + q27_content + '\n'
)

with open('wakaru/earth_earthquake_structure.js', 'w', encoding='utf-8') as f:
    f.write(content2)

# 確認
qnum1 = len(re.findall(r'"qnum":', content1))
qnum2 = len(re.findall(r'"qnum":', content2))

print(f"修正完了:")
print(f"  レッスン1: {qnum1}問")
print(f"  レッスン2: {qnum2}問")

