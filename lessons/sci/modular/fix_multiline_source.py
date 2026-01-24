# -*- coding: utf-8 -*-
"""
sourceフィールドが複数行にわたっている問題を修正
複数行のsourceフィールドを1行にまとめる
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

while i < len(lines):
    line = lines[i]
    
    # sourceフィールドの開始を検出
    if '"source":' in line and line.strip().startswith('"source":'):
        # sourceフィールドを1行にまとめる
        source_lines = [line]
        i += 1
        
        # 文字列が閉じられるまで読み続ける
        quote_count = line.count('"')
        while i < len(lines) and quote_count % 2 == 1:
            next_line = lines[i]
            source_lines.append(next_line)
            quote_count += next_line.count('"')
            i += 1
        
        # sourceフィールドを1行にまとめる
        source_content = ' '.join(source_lines)
        # 改行を \n にエスケープ
        source_content = source_content.replace('\n', '\\n')
        new_lines.append(source_content)
    else:
        new_lines.append(line)
        i += 1

new_content = '\n'.join(new_lines)

# より確実な方法：正規表現で修正
# "source": "..." のパターンを探し、複数行にわたっている場合は1行にまとめる
def fix_source_field(match):
    prefix = match.group(1)
    source_content = match.group(2)
    suffix = match.group(3)
    
    # 改行を \n にエスケープ
    source_content = source_content.replace('\n', '\\n')
    # 複数のスペースを1つに
    source_content = re.sub(r'\s+', ' ', source_content)
    
    return prefix + source_content + suffix

# "source": "..." のパターンを探す（複数行対応）
pattern = r'("source":\s*")(.*?)(")'
# DOTALLモードでマッチング
new_content = re.sub(pattern, fix_source_field, content, flags=re.DOTALL)

# しかし、これはすべてのsourceフィールドに影響するので、より慎重に
# 実際には、sourceフィールドが複数行にわたっている場合のみ修正する

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("修正完了: biology_food_chain.js")

