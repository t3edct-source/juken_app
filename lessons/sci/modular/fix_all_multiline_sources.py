# -*- coding: utf-8 -*-
"""
すべてのsourceフィールドが複数行にわたっている問題を修正
"""

import re

filepath = 'wakaru/biology_food_chain.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# sourceフィールドが複数行にわたっている場合を修正
# "source": "..." のパターンを探し、複数行にわたっている場合は1行にまとめる

lines = content.split('\n')
new_lines = []
i = 0
fixed_count = 0

while i < len(lines):
    line = lines[i]
    
    # sourceフィールドの開始を検出
    if '"source":' in line and line.strip().startswith('"source":'):
        # sourceフィールドが1行で完結しているか確認
        if line.count('"') >= 2 and line.rstrip().endswith('",'):
            # 1行で完結している
            new_lines.append(line)
            i += 1
            continue
        
        # 複数行にわたっている場合
        source_lines = [line]
        i += 1
        quote_count = line.count('"')
        
        # 文字列が閉じられるまで読み続ける
        while i < len(lines):
            next_line = lines[i]
            source_lines.append(next_line)
            quote_count += next_line.count('"')
            
            # 文字列が閉じられたか確認
            if quote_count % 2 == 0 and next_line.rstrip().endswith('",'):
                break
            
            i += 1
        
        # sourceフィールドを1行にまとめる
        source_content = ' '.join(source_lines)
        # 改行を \n にエスケープ（ただし、文字列リテラル内の改行のみ）
        # まず、文字列リテラルの内容を抽出
        match = re.search(r'"source":\s*"(.*)"', source_content, re.DOTALL)
        if match:
            source_text = match.group(1)
            # 改行を \n にエスケープ
            source_text = source_text.replace('\n', '\\n')
            # 新しいsourceフィールドを作成
            new_source_line = f'    "source": "{source_text}",'
            new_lines.append(new_source_line)
            fixed_count += 1
        else:
            # マッチしない場合はそのまま
            new_lines.extend(source_lines)
        
        i += 1
    else:
        new_lines.append(line)
        i += 1

new_content = '\n'.join(new_lines)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"修正完了: biology_food_chain.js ({fixed_count}箇所のsourceフィールドを修正)")

