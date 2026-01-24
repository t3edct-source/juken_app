#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
すべてのインデントを修正（choices配列も含む）
"""

from pathlib import Path
import re

def fix_all_indentation(filepath):
    """すべてのインデントを修正"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ];]; を修正
    content = content.replace('];];', '];')
    
    # 空行を削除（window.questions = [ の直後）
    content = re.sub(r'window\.questions = \[\s*\n\s*\{', 'window.questions = [\n  {', content)
    
    # choices配列の要素のインデントを修正
    lines = content.split('\n')
    new_lines = []
    in_choices = False
    choices_indent_level = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # choices配列の開始を検出
        if '"choices":' in stripped or '"choices": [' in stripped:
            in_choices = True
            # choicesの開始行を確認
            if '[' in stripped:
                # 同じ行に [ がある
                new_lines.append(line)
                # 次の行から choices の要素
                continue
            else:
                # 次の行に [ がある
                new_lines.append(line)
                continue
        
        # choices配列の終了を検出
        if in_choices and ']' in stripped and '"choices"' not in stripped:
            in_choices = False
            new_lines.append(line)
            continue
        
        # choices配列内の要素
        if in_choices and stripped.startswith('"') and not stripped.startswith('"choices"'):
            # 6スペースのインデント（choices配列内の要素）
            indent = '      '
            new_lines.append(indent + stripped)
        else:
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # バックアップ
    backup_path = filepath.with_suffix('.js.backup_final')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"バックアップを作成: {backup_path}")
    
    # 書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"インデント修正完了: {filepath}")
    
    return True

if __name__ == "__main__":
    base_dir = Path(__file__).parent
    target_file = base_dir / 'wakaru' / 'physics_current_circuit_integrated.js'
    
    if not target_file.exists():
        print(f"エラー: ファイルが見つかりません: {target_file}")
    else:
        fix_all_indentation(target_file)

