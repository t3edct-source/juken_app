# -*- coding: utf-8 -*-
"""
最終的な問題を修正
1. 問題オブジェクトの後にカンマを追加（最後の問題以外）
2. sourceフィールドの文字列リテラルを確認
"""

import re

def fix_file(filepath):
    """ファイルを修正"""
    print(f"\n{'='*80}")
    print(f"修正中: {filepath}")
    print(f"{'='*80}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    in_array = False
    question_count = 0
    
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
            
            # 問題オブジェクトの終了を検出
            if stripped == '}' or stripped == '},':
                # 次の行を確認
                if i + 1 < len(lines):
                    next_stripped = lines[i + 1].strip()
                    # 次の問題がある場合はカンマを追加
                    if next_stripped == '{' or next_stripped.startswith('"qnum"'):
                        new_lines.append('  },')
                        question_count += 1
                        continue
                    # 配列の終了の場合はカンマなし
                    elif next_stripped == '];':
                        new_lines.append('  }')
                        question_count += 1
                        continue
                
                # その他の場合は既存の形式を維持
                new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"[OK] 修正完了: {question_count}問を処理")

def main():
    files = [
        'wakaru/earth_earthquake_structure.js',
        'wakaru/earth_weather_observation_pressure_wind.js',
        'wakaru/biology_food_chain.js'
    ]
    
    for filepath in files:
        fix_file(filepath)

if __name__ == '__main__':
    main()

