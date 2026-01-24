#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JavaScriptファイルの構文チェック
"""

import re
from pathlib import Path

def check_js_file(filepath):
    """JavaScriptファイルの構文をチェック"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {e}")
        return False
    
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        print("[ERROR] window.questions が見つかりません")
        return False
    
    array_content = match.group(1)
    
    # 基本的な構造チェック
    open_braces = array_content.count('{')
    close_braces = array_content.count('}')
    commas = array_content.count(',')
    qnum_count = len(re.findall(r'"qnum":', array_content))
    
    print(f"ファイル: {filepath.name}")
    print(f"  開き括弧 {{: {open_braces}")
    print(f"  閉じ括弧 }}: {close_braces}")
    print(f"  カンマ: {commas}")
    print(f"  問題数（qnum）: {qnum_count}")
    
    # 括弧のバランスチェック
    if open_braces != close_braces:
        print(f"[ERROR] 括弧のバランスが取れていません: {open_braces} vs {close_braces}")
        return False
    
    # 問題数のチェック
    if qnum_count != 30:
        print(f"[WARN] 問題数が30問ではありません: {qnum_count}問")
    
    # 各問題オブジェクトの終了をチェック
    # 最後の問題以外は }, で終わる必要がある
    question_ends = re.findall(r'\}\s*,?\s*$', array_content, re.MULTILINE)
    print(f"  問題オブジェクトの終了: {len(question_ends)}個")
    
    # 各問題のqnumを確認
    qnums = []
    for match in re.finditer(r'"qnum":\s*(\d+)', array_content):
        qnums.append(int(match.group(1)))
    
    print(f"  qnumの範囲: {min(qnums)} - {max(qnums)}")
    
    # 連続性チェック
    expected_qnums = set(range(1, 31))
    actual_qnums = set(qnums)
    missing = expected_qnums - actual_qnums
    extra = actual_qnums - expected_qnums
    
    if missing:
        print(f"[ERROR] 欠けているqnum: {sorted(missing)}")
        return False
    
    if extra:
        print(f"[ERROR] 余分なqnum: {sorted(extra)}")
        return False
    
    print("  [OK] すべてのqnumが存在します")
    
    # 文字列のエスケープチェック
    # 未エスケープの改行や引用符をチェック
    unescaped_newlines = re.findall(r'(?<!\\)\n(?![^"]*")', array_content)
    if unescaped_newlines:
        print(f"[WARN] エスケープされていない改行が {len(unescaped_newlines)} 個あります")
    
    print("  [OK] 基本的な構文チェック完了")
    return True

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    target_files = [
        base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        base_dir / 'oboeru' / 'earth_sun_movement_shadow_oboeru.js'
    ]
    
    print("=" * 80)
    print("JavaScriptファイルの構文チェック")
    print("=" * 80)
    print()
    
    for filepath in target_files:
        if filepath.exists():
            check_js_file(filepath)
            print()
        else:
            print(f"[ERROR] ファイルが見つかりません: {filepath}")
            print()
    
    print("=" * 80)

if __name__ == "__main__":
    main()

