# -*- coding: utf-8 -*-
"""
3つのファイルのインデントを修正
問題オブジェクトを2スペースのインデントに統一
"""

import re
import os

def fix_indentation(filepath):
    """インデントを修正"""
    if not os.path.exists(filepath):
        print(f"[ERROR] ファイルが見つかりません: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込み失敗: {filepath} - {e}")
        return False
    
    print(f"\n{'='*80}")
    print(f"修正中: {os.path.basename(filepath)}")
    print(f"{'='*80}")
    
    # window.questions = [ の後の問題オブジェクトのインデントを修正
    # パターン1: ^\{ を ^  { に変更（行頭の { を2スペースのインデントに）
    lines = content.split('\n')
    new_lines = []
    in_array = False
    
    for i, line in enumerate(lines):
        if 'window.questions = [' in line:
            in_array = True
            new_lines.append(line)
        elif in_array and line.strip() == '];':
            in_array = False
            new_lines.append(line)
        elif in_array:
            # 問題オブジェクトの開始 { を修正
            if line.strip() == '{':
                new_lines.append('  {')
            # 問題オブジェクトの終了 }, を修正
            elif line.strip() == '},' or line.strip() == '}':
                # 前の行が問題オブジェクトの終了か確認
                if i > 0 and ('}' in lines[i-1] or '"asof"' in lines[i-1]):
                    new_lines.append('  ' + line.strip())
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # より確実な方法：正規表現で修正
    # window.questions = [ の後の { を   { に変更
    pattern = r'(window\.questions\s*=\s*\[\s*)\{'
    replacement = r'\1  {'
    new_content = re.sub(pattern, new_content, flags=re.MULTILINE)
    
    # 配列内の行頭の { を   { に変更（ただし、既にインデントがある場合は除く）
    # より確実な方法：配列内のすべての { を確認
    lines = new_content.split('\n')
    new_lines = []
    in_array = False
    brace_count = 0
    
    for i, line in enumerate(lines):
        if 'window.questions = [' in line:
            in_array = True
            new_lines.append(line)
            continue
        elif line.strip() == '];':
            in_array = False
            new_lines.append(line)
            continue
        
        if in_array:
            stripped = line.strip()
            # 問題オブジェクトの開始 { を確認
            if stripped == '{' and brace_count == 0:
                new_lines.append('  {')
                brace_count = 1
            # 問題オブジェクトの終了 } を確認
            elif stripped == '},' or stripped == '}':
                if brace_count > 0:
                    brace_count = 0
                    new_lines.append('  ' + stripped)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] インデントを修正しました: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"[ERROR] ファイル書き込み失敗: {filepath} - {e}")
        return False

def main():
    """メイン処理"""
    files = [
        'wakaru/earth_earthquake_structure.js',
        'wakaru/earth_weather_observation_pressure_wind.js',
        'wakaru/biology_food_chain.js'
    ]
    
    for filepath in files:
        fix_indentation(filepath)

if __name__ == '__main__':
    main()

