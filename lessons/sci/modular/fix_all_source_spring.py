# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のsourceフィールド内の改行を\nに変換するスクリプト（改良版）
"""

import re

def fix_source_fields(filepath):
    """sourceフィールド内の改行を\nに変換"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    content = ''.join(lines)
    
    # sourceフィールドを抽出
    # "source": "..." のパターン（複数行にわたる可能性がある）
    # より確実な方法：sourceフィールドの開始から終了までを抽出
    
    # まず、全体を1行ずつ処理して、sourceフィールドの範囲を特定
    new_lines = []
    in_source = False
    source_start_idx = -1
    source_content = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # sourceフィールドの開始を検出
        if '"source":' in line and not in_source:
            # sourceフィールドの開始
            in_source = True
            source_start_idx = i
            source_content = [line]
            
            # この行に閉じ引用符があるかチェック
            if line.count('"') >= 3:  # "source": "..." の形式
                # 閉じ引用符の位置を確認
                quote_count = 0
                for j, char in enumerate(line):
                    if char == '"':
                        quote_count += 1
                        if quote_count == 3:  # 開始引用符、フィールド名の引用符、値の開始引用符
                            # 値の開始
                            pass
                        elif quote_count >= 4:  # 値の終了引用符
                            # sourceフィールドが1行で終わる
                            in_source = False
                            # この行の改行を\nに変換
                            fixed_line = line.rstrip('\n').replace('\n', '\\n')
                            new_lines.append(fixed_line + '\n')
                            i += 1
                            continue
            
            i += 1
            continue
        
        if in_source:
            source_content.append(line)
            
            # 閉じ引用符を探す（行末の", の前）
            if line.rstrip().endswith('",') or (line.rstrip().endswith('"') and i < len(lines) - 1 and lines[i+1].strip().startswith(',')):
                # sourceフィールドの終了
                # すべての改行を\nに変換
                fixed_source = ''.join(source_content).rstrip('\n')
                
                # 改行を\nに変換（ただし、文字列リテラル内の改行のみ）
                # 最初の"source": "の後の部分のみを処理
                parts = fixed_source.split('"source": "', 1)
                if len(parts) == 2:
                    before = parts[0] + '"source": "'
                    source_value = parts[1]
                    
                    # 最後の",を除く
                    if source_value.endswith('",'):
                        source_value = source_value[:-2]
                        after = '",'
                    elif source_value.endswith('"'):
                        source_value = source_value[:-1]
                        after = '"'
                    else:
                        after = ''
                    
                    # 改行を\nに変換
                    source_value = source_value.replace('\n', '\\n')
                    
                    fixed_source = before + source_value + after
                
                new_lines.append(fixed_source)
                in_source = False
                source_content = []
            else:
                # まだsourceフィールド内
                pass
            
            i += 1
            continue
        
        # 通常の行
        new_lines.append(line)
        i += 1
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(''.join(new_lines))
    
    print(f"sourceフィールドの改行を修正しました: {filepath}")

if __name__ == '__main__':
    fix_source_fields('wakaru/physics_spring_force_buoyancy_integrated.js')

