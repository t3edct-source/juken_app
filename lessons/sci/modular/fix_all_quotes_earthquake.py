# -*- coding: utf-8 -*-
"""
earth_earthquake_structure.jsのsourceフィールド内のすべての半角引用符をエスケープ
"""

import re

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# sourceフィールド内の半角引用符をエスケープ
# "source": "..." のパターンを探し、内部の半角引用符をエスケープ

def fix_source_quotes(match):
    prefix = match.group(1)
    source_text = match.group(2)
    suffix = match.group(3)
    
    # エスケープされていない半角引用符をエスケープ
    # ただし、既にエスケープされているもの（\"）は除く
    fixed_text = ""
    i = 0
    while i < len(source_text):
        if source_text[i] == '"' and (i == 0 or source_text[i-1] != '\\'):
            # エスケープされていない半角引用符
            fixed_text += '\\"'
        else:
            fixed_text += source_text[i]
        i += 1
    
    return prefix + fixed_text + suffix

# "source": "..." のパターンを探す（複数行対応）
pattern = r'("source":\s*")(.*?)(",)'
new_content = re.sub(pattern, fix_source_quotes, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("修正完了: earth_earthquake_structure.js（sourceフィールド内の半角引用符をエスケープ）")

