# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のsourceフィールド内の改行を\nに変換するスクリプト（最終版）
"""

import re

def fix_source_newlines(filepath):
    """sourceフィールド内の改行を\nに変換"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # sourceフィールドを抽出して修正
    # "source": "..." のパターン（複数行にわたる可能性がある）
    
    # より確実な方法：sourceフィールドの開始から終了までを抽出
    # パターン: "source": " から ", まで（複数行にわたる可能性）
    
    def fix_source_match(match):
        full_match = match.group(0)
        source_value = match.group(1)
        
        # 既に\nでエスケープされている場合はスキップ
        if '\\n' in source_value and '\n' not in source_value:
            return full_match
        
        # 改行を\nに変換
        fixed_value = source_value.replace('\n', '\\n')
        
        # 元の形式に戻す
        return f'"source": "{fixed_value}"'
    
    # sourceフィールドを抽出（複数行対応）
    # "source": " から ", までを抽出
    pattern = r'"source":\s*"((?:[^"\\]|\\.|"(?!\s*",))*?)"\s*,'
    
    # より確実な方法：行単位で処理
    lines = content.split('\n')
    new_lines = []
    in_source = False
    source_lines = []
    source_indent = ''
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # sourceフィールドの開始を検出
        if '"source":' in stripped and not in_source:
            # インデントを取得
            source_indent = line[:len(line) - len(line.lstrip())]
            
            # この行に閉じ引用符があるかチェック
            if stripped.count('"') >= 4:  # "source": "..." の形式
                # 1行で完結している場合
                # 改行を\nに変換
                fixed_line = line.replace('\n', '\\n')
                # ただし、文字列リテラル内の改行のみ
                parts = fixed_line.split('"source": "', 1)
                if len(parts) == 2:
                    before = parts[0] + '"source": "'
                    rest = parts[1]
                    # 最後の ", を探す
                    quote_pos = rest.rfind('",')
                    if quote_pos != -1:
                        source_value = rest[:quote_pos]
                        after = rest[quote_pos:]
                        # 改行を\nに変換
                        source_value = source_value.replace('\n', '\\n')
                        fixed_line = before + source_value + after
                
                new_lines.append(fixed_line)
            else:
                # 複数行にわたる場合
                in_source = True
                source_lines = [line]
            i += 1
            continue
        
        if in_source:
            source_lines.append(line)
            
            # 閉じ引用符を探す
            if '",' in stripped or (stripped.endswith('"') and i < len(lines) - 1):
                # sourceフィールドの終了
                # すべての行を結合
                source_content = '\n'.join(source_lines)
                
                # 改行を\nに変換（文字列リテラル内の改行のみ）
                # "source": " の後の部分を抽出
                parts = source_content.split('"source": "', 1)
                if len(parts) == 2:
                    before = parts[0] + '"source": "'
                    rest = parts[1]
                    # 最後の ", を探す
                    quote_pos = rest.rfind('",')
                    if quote_pos != -1:
                        source_value = rest[:quote_pos]
                        after = rest[quote_pos:]
                        # 改行を\nに変換
                        source_value = source_value.replace('\n', '\\n')
                        # 1行にまとめる
                        fixed_source = before + source_value + after
                        new_lines.append(fixed_source)
                    else:
                        new_lines.extend(source_lines)
                else:
                    new_lines.extend(source_lines)
                
                in_source = False
                source_lines = []
            i += 1
            continue
        
        # 通常の行
        new_lines.append(line)
        i += 1
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f"sourceフィールドの改行を修正しました: {filepath}")

if __name__ == '__main__':
    fix_source_newlines('wakaru/physics_spring_force_buoyancy_integrated.js')

