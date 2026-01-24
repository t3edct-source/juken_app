#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
インデントを修正（正常なファイルと同じ形式に）
"""

from pathlib import Path

def fix_indentation(filepath):
    """インデントを修正"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # ファイル全体を読み込み
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # window.questions = [ の後の部分を処理
    if 'window.questions = [' not in content:
        print("エラー: window.questions が見つかりません")
        return False
    
    # 配列の内容部分を抽出
    start_idx = content.find('window.questions = [')
    array_start = content.find('[', start_idx) + 1
    array_end = content.rfind('];')
    
    if array_start < 0 or array_end < 0:
        print("エラー: 配列の範囲が見つかりません")
        return False
    
    header = content[:start_idx]
    array_content = content[array_start:array_end]
    footer = content[array_end:]
    
    # 各行を処理
    new_lines = []
    in_object = False
    brace_count = 0
    
    for line in array_content.split('\n'):
        stripped = line.strip()
        
        if not stripped:
            new_lines.append('')
            continue
        
        # { を見つけたらオブジェクト開始
        if stripped == '{':
            in_object = True
            brace_count = 1
            new_lines.append('  {')
        elif stripped == '},' or stripped == '}':
            brace_count = 0
            in_object = False
            if stripped == '},':
                new_lines.append('  },')
            else:
                new_lines.append('  }')
        elif in_object:
            # オブジェクト内のフィールドは4スペース（2+2）
            new_lines.append('    ' + stripped)
        else:
            # オブジェクト外は2スペース
            new_lines.append('  ' + stripped)
    
    # 新しい配列内容を構築
    new_array = '\n'.join(new_lines)
    new_content = header + 'window.questions = [\n' + new_array + '\n];' + footer
    
    # バックアップ
    backup_path = filepath.with_suffix('.js.backup_indent')
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
        fix_indentation(target_file)

