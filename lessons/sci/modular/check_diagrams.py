#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解説のテキスト図解の有無を確認
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
    
    # 各問題のsourceフィールドを抽出
    pattern = r'"qnum":\s*(\d+).*?"source":\s*"([^"]*(?:"[^"]*"[^"]*)*)"'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    print(f"ファイル: {filepath.name}")
    print(f"問題数: {len(matches)}")
    print()
    
    diagrams_found = 0
    diagrams_missing = []
    
    for match in matches:
        qnum = int(match.group(1))
        source = match.group(2)
        
        # 図解の有無を確認（<div style= が含まれているか）
        has_diagram = '<div style=' in source
        
        if has_diagram:
            diagrams_found += 1
            # 図解の内容を確認
            div_match = re.search(r'<div style="[^"]*">(.*?)</div>', source, re.DOTALL)
            if div_match:
                diagram_content = div_match.group(1)
                # 改行エスケープを実際の改行に変換して確認
                diagram_content = diagram_content.replace('\\n', '\n')
                lines = diagram_content.strip().split('\n')
                non_empty_lines = [line for line in lines if line.strip()]
                if len(non_empty_lines) < 3:
                    print(f"  Q{qnum}: 図解あり（内容が少ない: {len(non_empty_lines)}行）")
                else:
                    print(f"  Q{qnum}: 図解あり（{len(non_empty_lines)}行）")
            else:
                print(f"  Q{qnum}: 図解タグあり（内容なし）")
        else:
            diagrams_missing.append(qnum)
            print(f"  Q{qnum}: 図解なし")
    
    print()
    print(f"図解あり: {diagrams_found}問")
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

