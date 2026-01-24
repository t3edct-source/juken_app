# -*- coding: utf-8 -*-
"""
3つのファイルのJavaScript構文をチェック
"""

import re
import os

def check_js_syntax(filepath):
    """JavaScript構文をチェック"""
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
    print(f"チェック中: {os.path.basename(filepath)}")
    print(f"{'='*80}")
    
    errors = []
    
    # 1. window.questions = [ の存在確認
    if 'window.questions' not in content:
        errors.append("window.questionsが定義されていません")
    else:
        print("[OK] window.questionsが定義されています")
    
    # 2. 配列の開始と終了を確認
    if 'window.questions = [' not in content:
        errors.append("window.questions = [ が見つかりません")
    else:
        print("[OK] window.questions = [ が見つかりました")
    
    if content.rstrip().endswith('];'):
        print("[OK] ファイルは ]; で終わっています")
    else:
        errors.append("ファイルが ]; で終わっていません")
        print(f"[ERROR] ファイルの最後: {content[-50:]}")
    
    # 3. 問題オブジェクトの数を確認
    qnum_matches = re.findall(r'"qnum":\s*(\d+)', content)
    if qnum_matches:
        print(f"[OK] 問題数: {len(qnum_matches)}問")
        # qnumが1から連続しているか確認
        qnums = [int(q) for q in qnum_matches]
        expected = list(range(1, len(qnums) + 1))
        if qnums != expected:
            errors.append(f"qnumが連続していません: {qnums[:10]}...")
            print(f"[ERROR] qnumの順序: {qnums[:10]}...")
        else:
            print("[OK] qnumは1から連続しています")
    else:
        errors.append("問題が見つかりません")
    
    # 4. カンマの問題を確認
    # 最後の問題の後にカンマがあるかチェック
    pattern = r'window\.questions\s*=\s*\[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        array_content = match.group(1)
        # 最後の } の後にカンマがあるかチェック
        last_brace = array_content.rfind('}')
        if last_brace > 0:
            after_last_brace = array_content[last_brace+1:].strip()
            if after_last_brace.startswith(','):
                errors.append("最後の問題の後にカンマがあります")
                print(f"[ERROR] 最後の問題の後: {after_last_brace[:50]}")
            else:
                print("[OK] 最後の問題の後にカンマはありません")
    
    # 5. 文字列リテラルの問題を確認
    # 未終了の文字列リテラルをチェック
    quote_count = content.count('"')
    if quote_count % 2 != 0:
        errors.append("文字列リテラルが正しく閉じられていません（引用符の数が奇数）")
        print(f"[ERROR] 引用符の数: {quote_count}（奇数）")
    else:
        print("[OK] 文字列リテラルは正しく閉じられています")
    
    # 6. インデントの問題を確認
    lines = content.split('\n')
    question_start_lines = []
    for i, line in enumerate(lines, 1):
        if '"qnum":' in line:
            question_start_lines.append((i, line[:80]))
    
    if question_start_lines:
        print(f"[OK] 問題の開始行: {len(question_start_lines)}箇所")
        # 最初の数行を表示
        for line_num, line_content in question_start_lines[:3]:
            print(f"  行{line_num}: {line_content}")
    
    # エラーを表示
    if errors:
        print(f"\n[エラー] {len(errors)}件の問題が見つかりました:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("\n[OK] 構文エラーは見つかりませんでした")
        return True

def main():
    """メイン処理"""
    files = [
        'wakaru/earth_earthquake_structure.js',
        'wakaru/earth_weather_observation_pressure_wind.js',
        'wakaru/biology_food_chain.js'
    ]
    
    results = []
    for filepath in files:
        result = check_js_syntax(filepath)
        results.append((filepath, result))
    
    print(f"\n{'='*80}")
    print("サマリー")
    print(f"{'='*80}")
    for filepath, result in results:
        status = "OK" if result else "エラーあり"
        print(f"{os.path.basename(filepath)}: {status}")

if __name__ == '__main__':
    main()

