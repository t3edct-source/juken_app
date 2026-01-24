#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
すべての問題の図解を確認
"""

import re
from pathlib import Path

def check_all_diagrams(filepath):
    """すべての問題の図解を確認"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {filepath} - {e}")
        return
    
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        print("[ERROR] window.questions が見つかりません")
        return
    
    array_content = match.group(1)
    
    # 各問題のqnumとsourceを抽出
    qnum_pattern = r'"qnum":\s*(\d+)'
    qnum_matches = list(re.finditer(qnum_pattern, array_content))
    
    print(f"ファイル: {filepath.name}")
    print(f"問題数: {len(qnum_matches)}")
    print()
    
    diagrams_info = []
    
    for i, qnum_match in enumerate(qnum_matches):
        qnum = int(qnum_match.group(1))
        start_pos = qnum_match.start()
        
        # 次の問題の開始位置を探す
        if i + 1 < len(qnum_matches):
            end_pos = qnum_matches[i + 1].start()
        else:
            end_pos = len(array_content)
        
        # この問題のsourceフィールドを探す
        question_block = array_content[start_pos:end_pos]
        source_match = re.search(r'"source":\s*"([^"]*(?:\\.[^"]*)*)"', question_block, re.DOTALL)
        
        if source_match:
            source = source_match.group(1)
            # エスケープされた改行を実際の改行に変換
            source = source.replace('\\n', '\n')
            
            # 図解の有無を確認
            has_diagram = '<div style=' in source
            
            if has_diagram:
                # 図解のタイトルを抽出
                title_match = re.search(r'【([^】]+)】', source)
                title = title_match.group(1) if title_match else "タイトルなし"
                
                # 図解の内容を確認
                div_match = re.search(r'<div style="[^"]*">(.*?)</div>', source, re.DOTALL)
                if div_match:
                    diagram_content = div_match.group(1)
                    lines = diagram_content.strip().split('\n')
                    non_empty_lines = [line for line in lines if line.strip()]
                    diagrams_info.append({
                        'qnum': qnum,
                        'title': title,
                        'lines': len(non_empty_lines),
                        'has_content': len(non_empty_lines) >= 3
                    })
                else:
                    diagrams_info.append({
                        'qnum': qnum,
                        'title': title,
                        'lines': 0,
                        'has_content': False
                    })
            else:
                diagrams_info.append({
                    'qnum': qnum,
                    'title': None,
                    'lines': 0,
                    'has_content': False
                })
    
    # 結果を表示
    diagrams_with_content = 0
    diagrams_without_content = 0
    no_diagrams = []
    
    for info in diagrams_info:
        if info['title']:
            if info['has_content']:
                diagrams_with_content += 1
                print(f"  Q{info['qnum']}: 図解あり - 【{info['title']}】（{info['lines']}行）")
            else:
                diagrams_without_content += 1
                print(f"  Q{info['qnum']}: 図解あり（内容が少ない） - 【{info['title']}】（{info['lines']}行）")
        else:
            no_diagrams.append(info['qnum'])
            print(f"  Q{info['qnum']}: 図解なし")
    
    print()
    print(f"図解あり（内容3行以上）: {diagrams_with_content}問")
    print(f"図解あり（内容が少ない）: {diagrams_without_content}問")
    print(f"図解なし: {len(no_diagrams)}問")
    if no_diagrams:
        print(f"図解なしの問題: {no_diagrams}")
    print()

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    target_files = [
        base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        base_dir / 'wakaru' / 'physics_light_properties.js'  # 比較用
    ]
    
    print("=" * 80)
    print("すべての問題の図解を確認")
    print("=" * 80)
    print()
    
    for filepath in target_files:
        if filepath.exists():
            check_all_diagrams(filepath)
            print()
        else:
            print(f"[ERROR] ファイルが見つかりません: {filepath}")
            print()
    
    print("=" * 80)

if __name__ == "__main__":
    main()

