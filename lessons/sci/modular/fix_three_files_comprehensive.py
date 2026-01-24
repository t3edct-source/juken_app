# -*- coding: utf-8 -*-
"""
3つのファイルを包括的に修正
1. インデントの修正（問題オブジェクトを2スペースに）
2. カンマの追加（欠けているカンマを追加）
"""

import re
import os

def fix_file(filepath):
    """ファイルを包括的に修正"""
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
    
    # 1. インデントの修正：window.questions = [ の後の { を   { に変更
    # より確実な方法：行単位で処理
    lines = content.split('\n')
    new_lines = []
    in_array = False
    prev_line_was_qnum = False
    
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
            
            # 問題オブジェクトの開始 { を修正
            if stripped == '{':
                new_lines.append('  {')
                continue
            
            # 問題オブジェクトの終了 }, を修正
            if stripped == '},' or stripped == '}':
                new_lines.append('  ' + stripped)
                continue
            
            # カンマが欠けている場合を修正（earth_weather_observation_pressure_wind.js用）
            # "qnum": 数字 の後にカンマがない場合
            if re.match(r'^\s*"qnum":\s*\d+\s*$', line):
                if not line.rstrip().endswith(','):
                    new_lines.append(line.rstrip() + ',')
                    continue
            
            # "text": "..." の後にカンマがない場合（ただし、sourceフィールドの場合は除く）
            if re.match(r'^\s*"text":\s*"[^"]+"\s*$', line):
                if not line.rstrip().endswith(',') and i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line.startswith('"choices"'):
                        new_lines.append(line.rstrip() + ',')
                        continue
            
            # "choices": [ の後にカンマがない場合（最後の問題でない限り）
            if re.match(r'^\s*"choices":\s*\[', line):
                # この行はそのまま
                new_lines.append(line)
                continue
            
            # "answer": 数字 の後にカンマがない場合
            if re.match(r'^\s*"answer":\s*\d+\s*$', line):
                if not line.rstrip().endswith(','):
                    new_lines.append(line.rstrip() + ',')
                    continue
            
            # "tags": [...] の後にカンマがない場合
            if re.match(r'^\s*"tags":\s*\[', line):
                # この行はそのまま（複数行にわたる可能性がある）
                new_lines.append(line)
                continue
            
            # "difficulty": 数字 の後にカンマがない場合
            if re.match(r'^\s*"difficulty":\s*\d+\s*$', line):
                if not line.rstrip().endswith(','):
                    new_lines.append(line.rstrip() + ',')
                    continue
            
            # "asof": "..." の後にカンマがない場合（最後の問題でない限り）
            if re.match(r'^\s*"asof":\s*"[^"]+"\s*$', line):
                # 最後の問題でない場合はカンマを追加
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line == '{' or next_line.startswith('"qnum"'):
                        # 次の問題があるのでカンマは不要（}, の後にカンマがある）
                        new_lines.append(line)
                        continue
                    elif next_line == '}':
                        # 最後の問題なのでカンマは不要
                        new_lines.append(line)
                        continue
                new_lines.append(line)
                continue
            
            # その他の行はそのまま
            new_lines.append(line)
        else:
            new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # 2. より確実なカンマ修正：正規表現で
    # "qnum": 数字 の後にカンマがない場合
    new_content = re.sub(r'("qnum":\s*\d+)(\s*)(\n\s*"text")', r'\1,\2\3', new_content)
    
    # "text": "..." の後にカンマがない場合（ただし、sourceフィールドの場合は除く）
    new_content = re.sub(r'("text":\s*"[^"]+")(\s*)(\n\s*"choices")', r'\1,\2\3', new_content)
    
    # "answer": 数字 の後にカンマがない場合
    new_content = re.sub(r'("answer":\s*\d+)(\s*)(\n\s*"source")', r'\1,\2\3', new_content)
    new_content = re.sub(r'("answer":\s*\d+)(\s*)(\n\s*"tags")', r'\1,\2\3', new_content)
    
    # "difficulty": 数字 の後にカンマがない場合
    new_content = re.sub(r'("difficulty":\s*\d+)(\s*)(\n\s*"asof")', r'\1,\2\3', new_content)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] 修正完了: {os.path.basename(filepath)}")
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
        fix_file(filepath)

if __name__ == '__main__':
    main()

