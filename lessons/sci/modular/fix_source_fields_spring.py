# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のsourceフィールド内の改行を\nに変換するスクリプト
"""

import re

def fix_source_fields(filepath):
    """sourceフィールド内の改行を\nに変換"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # sourceフィールドを抽出して修正
    # "source": "..." のパターンを探す
    pattern = r'"source":\s*"([^"]*(?:<div[^>]*>.*?</div>)?[^"]*)"'
    
    def replace_source(match):
        source_content = match.group(1)
        
        # 既に\nでエスケープされている場合はスキップ
        if '\\n' in source_content and '\n' not in source_content:
            return match.group(0)
        
        # 改行を\nに変換（ただし、既にエスケープされているものは除く）
        # 実際の改行文字を\nに変換
        # ただし、<div>タグ内の改行はそのまま（HTMLとして表示されるため）
        
        # まず、<div>タグの内容を一時的に置き換え
        div_placeholders = []
        div_pattern = r'(<div[^>]*>)(.*?)(</div>)'
        
        def replace_div(m):
            placeholder = f"__DIV_PLACEHOLDER_{len(div_placeholders)}__"
            div_placeholders.append((placeholder, m.group(0)))
            return placeholder
        
        source_with_placeholders = re.sub(div_pattern, replace_div, source_content, flags=re.DOTALL)
        
        # 改行を\nに変換
        fixed_source = source_with_placeholders.replace('\n', '\\n')
        
        # プレースホルダーを元に戻す
        for placeholder, original in div_placeholders:
            fixed_source = fixed_source.replace(placeholder, original)
        
        return f'"source": "{fixed_source}"'
    
    # sourceフィールドを修正
    new_content = re.sub(pattern, replace_source, content, flags=re.DOTALL)
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"sourceフィールドの改行を修正しました: {filepath}")

if __name__ == '__main__':
    fix_source_fields('wakaru/physics_spring_force_buoyancy_integrated.js')

