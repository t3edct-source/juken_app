#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のsourceフィールドを1行にまとめる修正スクリプト
"""

import re
from pathlib import Path

def fix_all_source_fields(filepath):
    """すべてのsourceフィールドを1行にまとめる"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {filepath} - {e}")
        return False
    
    new_lines = []
    i = 0
    fixed_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        # sourceフィールドの開始を探す
        if '"source":' in line:
            source_start_pos = line.find('"source":')
            prefix = line[:source_start_pos]
            
            # 開始の引用符の位置を探す
            quote_start = line.find('"', source_start_pos + len('"source":'))
            if quote_start != -1:
                # 文字列の開始
                source_content = line[quote_start + 1:]
                
                # 終了の引用符を探す
                if source_content.rstrip().endswith('",'):
                    # 既に1行で完結している
                    new_lines.append(line)
                    i += 1
                    continue
                
                # 複数行にわたっている場合
                i += 1
                while i < len(lines):
                    next_line = lines[i]
                    
                    # 終了の引用符を探す
                    if '",' in next_line:
                        end_quote_pos = next_line.find('",')
                        if end_quote_pos != -1:
                            # 終了を見つけた
                            source_content += '\n' + next_line[:end_quote_pos]
                            suffix = next_line[end_quote_pos + 2:]  # ", の後
                            
                            # 改行を\nに変換（既存のエスケープは保持）
                            # 実際の改行を\nに変換
                            source_content = source_content.replace('\\n', '\x00')  # 一時的に置換
                            source_content = source_content.replace('\n', '\\n')
                            source_content = source_content.replace('\x00', '\\n')  # 元に戻す
                            
                            new_lines.append(prefix + '"source": "' + source_content + '",' + suffix)
                            fixed_count += 1
                            i += 1
                            break
                        else:
                            source_content += '\n' + next_line
                            i += 1
                    else:
                        source_content += '\n' + next_line
                        i += 1
                continue
        
        new_lines.append(line)
        i += 1
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"[OK] {fixed_count}個のsourceフィールドを修正しました: {filepath}")
        return True
    except Exception as e:
        print(f"[ERROR] ファイル書き込みエラー: {filepath} - {e}")
        return False

if __name__ == "__main__":
    fix_all_source_fields('wakaru/physics_spring_force_buoyancy_integrated.js')

