#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解説のテキスト図解の有無を確認（修正版）
"""

import re
from pathlib import Path

def check_diagrams(filepath):
    """図解の有無を確認"""
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
    
    diagrams_found = 0
    diagrams_missing = []
    diagrams_with_content = 0
    
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
                diagrams_found += 1
                # 図解の内容を確認
                div_match = re.search(r'<div style="[^"]*">(.*?)</div>', source, re.DOTALL)
                if div_match:
                    diagram_content = div_match.group(1)
                    lines = diagram_content.strip().split('\n')
                    non_empty_lines = [line for line in lines if line.strip()]
                    if len(non_empty_lines) >= 3:
                        diagrams_with_content += 1
                        print(f"  Q{qnum}: 図解あり（{len(non_empty_lines)}行の内容）")
                    else:
                        print(f"  Q{qnum}: 図解タグあり（内容が少ない: {len(non_empty_lines)}行）")
                else:
                    print(f"  Q{qnum}: 図解タグあり（内容なし）")
            else:
                diagrams_missing.append(qnum)
                print(f"  Q{qnum}: 図解なし")
        else:
            diagrams_missing.append(qnum)
            print(f"  Q{qnum}: sourceフィールドが見つかりません")
    
    print()
    print(f"図解あり: {diagrams_found}問")
    print(f"図解あり（内容3行以上）: {diagrams_with_content}問")
    print(f"図解なし: {len(diagrams_missing)}問")
    if diagrams_missing:
        print(f"図解なしの問題: {diagrams_missing}")
    print()

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    target_files = [
        base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        base_dir / 'wakaru' / 'physics_light_properties.js'  # 比較用
    ]
    
    print("=" * 80)
    print("解説のテキスト図解の有無を確認")
    print("=" * 80)
    print()
    
    for filepath in target_files:
        if filepath.exists():
            check_diagrams(filepath)
            print()
        else:
            print(f"[ERROR] ファイルが見つかりません: {filepath}")
            print()
    
    print("=" * 80)

if __name__ == "__main__":
    main()

