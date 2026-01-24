# -*- coding: utf-8 -*-
"""
earth_earthquake_structure.jsのsourceフィールド内の引用符をエスケープ
"""

import re

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# sourceフィールド内の引用符をエスケープ
# "source": "..." のパターンを探し、内部の引用符をエスケープ

def fix_source_quotes(match):
    prefix = match.group(1)
    source_text = match.group(2)
    suffix = match.group(3)
    
    # 文字列リテラル内の引用符をエスケープ
    # ただし、既にエスケープされているものは除く
    # エスケープされていない " を \" に変換
    # ただし、全角の「」はそのまま
    
    # エスケープされていない " を \" に変換
    # ただし、\ の後の " は既にエスケープされているので除く
    fixed_text = ""
    i = 0
    while i < len(source_text):
        if source_text[i] == '"' and (i == 0 or source_text[i-1] != '\\'):
            # エスケープされていない引用符
            fixed_text += '\\"'
        else:
            fixed_text += source_text[i]
        i += 1
    
    return prefix + fixed_text + suffix

# "source": "..." のパターンを探す
pattern = r'("source":\s*")(.*?)(")'
new_content = re.sub(pattern, fix_source_quotes, content, flags=re.DOTALL)

# しかし、これはすべての引用符をエスケープしてしまうので、より慎重に
# 実際には、sourceフィールド内の引用符は全角の「」なので問題ないはず
# しかし、半角の " が含まれている場合はエスケープが必要

# より確実な方法：sourceフィールド内の半角引用符を確認
lines = new_content.split('\n')
new_lines = []
i = 0

while i < len(lines):
    line = lines[i]
    
    if '"source":' in line:
        # sourceフィールドが1行で完結している場合
        if line.count('"') >= 2 and line.rstrip().endswith('",'):
            # 文字列リテラル内の半角引用符をエスケープ
            # "source": "..." の部分を抽出
            match = re.search(r'("source":\s*")(.*)(",)', line)
            if match:
                prefix = match.group(1)
                source_text = match.group(2)
                suffix = match.group(3)
                
                # エスケープされていない半角引用符をエスケープ
                fixed_source = ""
                j = 0
                while j < len(source_text):
                    if source_text[j] == '"' and (j == 0 or source_text[j-1] != '\\'):
                        fixed_source += '\\"'
                    else:
                        fixed_source += source_text[j]
                    j += 1
                
                new_line = prefix + fixed_source + suffix
                new_lines.append(new_line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)
    
    i += 1

new_content = '\n'.join(new_lines)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("修正完了: earth_earthquake_structure.js")

