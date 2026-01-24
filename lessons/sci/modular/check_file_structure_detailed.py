# -*- coding: utf-8 -*-
"""
ファイル構造を詳細にチェック
"""

import re
import json

def check_file_detailed(filepath):
    """ファイル構造を詳細にチェック"""
    print(f"\n{'='*80}")
    print(f"詳細チェック: {filepath}")
    print(f"{'='*80}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 問題オブジェクトの抽出を試みる
    try:
        # window.questions = [...] の部分を抽出
        pattern = r'window\.questions\s*=\s*\[(.*?)\];'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            print("[ERROR] window.questions = [...] が見つかりません")
            return
        
        array_content = match.group(1)
        
        # 問題オブジェクトを抽出
        questions = []
        brace_count = 0
        current_obj = ""
        in_string = False
        escape_next = False
        
        for char in array_content:
            if escape_next:
                current_obj += char
                escape_next = False
                continue
            
            if char == '\\':
                escape_next = True
                current_obj += char
                continue
            
            if char == '"' and not escape_next:
                in_string = not in_string
            
            if not in_string:
                if char == '{':
                    if brace_count == 0:
                        current_obj = ""
                    brace_count += 1
                    current_obj += char
                elif char == '}':
                    current_obj += char
                    brace_count -= 1
                    if brace_count == 0:
                        questions.append(current_obj.strip())
                        current_obj = ""
                else:
                    if brace_count > 0:
                        current_obj += char
            else:
                if brace_count > 0:
                    current_obj += char
        
        print(f"[OK] 問題オブジェクト数: {len(questions)}")
        
        # 最初の3つの問題オブジェクトを確認
        for i, q in enumerate(questions[:3], 1):
            print(f"\n問題 {i}:")
            # qnumを抽出
            qnum_match = re.search(r'"qnum":\s*(\d+)', q)
            if qnum_match:
                print(f"  qnum: {qnum_match.group(1)}")
            else:
                print(f"  [ERROR] qnumが見つかりません")
            
            # textを抽出
            text_match = re.search(r'"text":\s*"([^"]+)"', q)
            if text_match:
                print(f"  text: {text_match.group(1)[:50]}...")
            else:
                print(f"  [ERROR] textが見つかりません")
            
            # カンマの確認
            if q.rstrip().endswith(','):
                print(f"  [OK] カンマあり")
            elif i < len(questions):
                print(f"  [WARN] カンマなし（最後の問題でない場合）")
        
        # 最後の問題を確認
        if questions:
            last_q = questions[-1]
            if last_q.rstrip().endswith(','):
                print(f"\n[WARN] 最後の問題の後にカンマがあります")
            else:
                print(f"\n[OK] 最後の問題の後にカンマはありません")
        
    except Exception as e:
        print(f"[ERROR] 問題オブジェクトの抽出中にエラー: {e}")
        import traceback
        traceback.print_exc()
    
    # 2. 実際にJavaScriptとして評価してみる
    print(f"\n{'='*80}")
    print("JavaScriptとして評価を試みます...")
    print(f"{'='*80}")
    
    try:
        # windowオブジェクトをモック
        class MockWindow:
            pass
        
        # グローバルスコープで実行
        exec_globals = {'window': MockWindow()}
        exec(content, exec_globals)
        
        if hasattr(exec_globals['window'], 'questions'):
            questions = exec_globals['window'].questions
            print(f"[OK] window.questionsが読み込まれました: {len(questions)}問")
            
            # 最初の3問を確認
            for i, q in enumerate(questions[:3], 1):
                print(f"  Q{q.get('qnum', '?')}: {q.get('text', '')[:50]}...")
        else:
            print("[ERROR] window.questionsが定義されていません")
    except SyntaxError as e:
        print(f"[ERROR] 構文エラー: {e}")
        print(f"  行: {e.lineno}, 位置: {e.offset}")
        if e.text:
            print(f"  該当行: {e.text.strip()}")
    except Exception as e:
        print(f"[ERROR] 実行エラー: {e}")
        import traceback
        traceback.print_exc()

def main():
    files = [
        'wakaru/earth_earthquake_structure.js',
        'wakaru/earth_weather_observation_pressure_wind.js',
        'wakaru/biology_food_chain.js'
    ]
    
    for filepath in files:
        check_file_detailed(filepath)

if __name__ == '__main__':
    main()

