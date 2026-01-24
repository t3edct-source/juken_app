#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sourceフィールドを1行にまとめる修正スクリプト
"""

import re
from pathlib import Path

def fix_source_fields(filepath):
    """sourceフィールドを1行にまとめる"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {filepath} - {e}")
        return False
    
    # sourceフィールドを抽出して修正
    # "source": "..." のパターンを探す（複数行にわたる場合も含む）
    pattern = r'"source":\s*"([^"]*(?:"[^"]*"[^"]*)*)"'
    
    def replace_source(match):
        source_content = match.group(1)
        # 実際の改行を\nに変換
        source_content = source_content.replace('\n', '\\n')
        # 既にエスケープされている\nはそのまま
        source_content = source_content.replace('\\\\n', '\\n')
        return f'"source": "{source_content}"'
    
    # より正確な方法：sourceフィールドの開始から終了までを抽出
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if '"source":' in line and line.strip().endswith('"') == False:
            # sourceフィールドの開始
            source_start = line.find('"source":')
            prefix = line[:source_start]
            # 開始の引用符の後を取得
            quote_start = line.find('"', source_start + len('"source":'))
            if quote_start != -1:
                # 文字列の開始
                source_content = line[quote_start + 1:]
                i += 1
                # 終了の引用符を探す
                while i < len(lines):
                    if '"' in lines[i] and not lines[i].strip().startswith('//'):
                        # 終了の引用符を見つけた
                        end_quote_pos = lines[i].find('",')
                        if end_quote_pos != -1:
                            source_content += '\n' + lines[i][:end_quote_pos]
                            suffix = lines[i][end_quote_pos + 2:]  # ", の後
                            # 改行を\nに変換
                            source_content = source_content.replace('\n', '\\n')
                            # 既存のエスケープを保持
                            source_content = source_content.replace('\\\\n', '\\n')
                            new_lines.append(prefix + '"source": "' + source_content + '",' + suffix)
                            i += 1
                            break
                        else:
                            source_content += '\n' + lines[i]
                            i += 1
                    else:
                        source_content += '\n' + lines[i]
                        i += 1
                continue
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] sourceフィールドを修正しました: {filepath.name}")
        return True
    except Exception as e:
        print(f"[ERROR] ファイル書き込みエラー: {filepath} - {e}")
        return False

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    target_files = [
        base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        base_dir / 'oboeru' / 'earth_sun_movement_shadow_oboeru.js'
    ]
    
    print("=" * 80)
    print("sourceフィールドの修正")
    print("=" * 80)
    print()
    
    for filepath in target_files:
        if filepath.exists():
            fix_source_fields(filepath)
            print()
        else:
            print(f"[ERROR] ファイルが見つかりません: {filepath}")
            print()
    
    print("=" * 80)
    print("修正完了")
    print("=" * 80)

if __name__ == "__main__":
    main()

