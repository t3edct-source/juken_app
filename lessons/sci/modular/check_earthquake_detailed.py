# -*- coding: utf-8 -*-
"""
earth_earthquake_structure.jsを詳細にチェック
"""

import re

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

print("="*80)
print("earth_earthquake_structure.js 詳細チェック")
print("="*80)

# 1. ファイルの基本構造
print("\n[1] ファイルの基本構造")
if 'window.questions' in content:
    print("  [OK] window.questionsが存在")
else:
    print("  [ERROR] window.questionsが存在しません")

if content.rstrip().endswith('];'):
    print("  [OK] ファイルは ]; で終わっています")
else:
    print(f"  [ERROR] ファイルの最後: {repr(content[-50:])}")

# 2. 問題オブジェクトの数
qnum_matches = re.findall(r'"qnum":\s*(\d+)', content)
print(f"\n[2] 問題数: {len(qnum_matches)}問")
if qnum_matches:
    qnums = [int(q) for q in qnum_matches]
    expected = list(range(1, len(qnums) + 1))
    if qnums == expected:
        print("  [OK] qnumは1から連続しています")
    else:
        print(f"  [ERROR] qnumが連続していません: {qnums[:10]}...")

# 3. 問題オブジェクトの構造を確認
print("\n[3] 問題オブジェクトの構造")
# 最初の3つの問題オブジェクトを確認
pattern = r'window\.questions\s*=\s*\[(.*?)\];'
match = re.search(pattern, content, re.DOTALL)
if match:
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
    
    print(f"  抽出された問題オブジェクト数: {len(questions)}")
    
    # 最初の3つの問題を詳細に確認
    for i, q in enumerate(questions[:3], 1):
        print(f"\n  問題 {i}:")
        
        # qnum
        qnum_match = re.search(r'"qnum":\s*(\d+)', q)
        if qnum_match:
            print(f"    qnum: {qnum_match.group(1)}")
        else:
            print(f"    [ERROR] qnumが見つかりません")
        
        # text
        text_match = re.search(r'"text":\s*"([^"]+)"', q)
        if text_match:
            print(f"    text: {text_match.group(1)[:50]}...")
        else:
            print(f"    [ERROR] textが見つかりません")
        
        # choices
        if '"choices":' in q:
            print(f"    [OK] choicesが存在")
        else:
            print(f"    [ERROR] choicesが見つかりません")
        
        # answer
        answer_match = re.search(r'"answer":\s*(\d+)', q)
        if answer_match:
            print(f"    answer: {answer_match.group(1)}")
        else:
            print(f"    [ERROR] answerが見つかりません")
        
        # source
        if '"source":' in q:
            # sourceフィールドが複数行にわたっているか確認
            source_match = re.search(r'"source":\s*"(.*?)"', q, re.DOTALL)
            if source_match:
                source_text = source_match.group(1)
                if '\n' in source_text and '\\n' not in source_text[:100]:
                    print(f"    [ERROR] sourceフィールドが複数行にわたっています（改行がエスケープされていません）")
                else:
                    print(f"    [OK] sourceが存在")
            else:
                print(f"    [WARN] sourceの内容を抽出できませんでした")
        else:
            print(f"    [ERROR] sourceが見つかりません")
        
        # カンマの確認
        if q.rstrip().endswith(','):
            print(f"    [OK] カンマあり")
        elif i < len(questions):
            print(f"    [WARN] カンマなし（最後の問題でない場合）")

# 4. JavaScriptとして評価を試みる
print("\n[4] JavaScriptとして評価を試みます...")
try:
    class MockWindow:
        pass
    
    exec_globals = {'window': MockWindow()}
    exec(content, exec_globals)
    
    if hasattr(exec_globals['window'], 'questions'):
        questions = exec_globals['window'].questions
        print(f"  [OK] window.questionsが読み込まれました: {len(questions)}問")
    else:
        print("  [ERROR] window.questionsが定義されていません")
except SyntaxError as e:
    print(f"  [ERROR] 構文エラー: {e}")
    print(f"    行: {e.lineno}, 位置: {e.offset}")
    if e.text:
        print(f"    該当行: {e.text.strip()}")
except Exception as e:
    print(f"  [ERROR] 実行エラー: {e}")
    import traceback
    traceback.print_exc()

