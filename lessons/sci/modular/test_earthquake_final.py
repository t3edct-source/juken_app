# -*- coding: utf-8 -*-
"""
earth_earthquake_structure.jsを実際にJavaScriptとして評価
"""

import subprocess
import os

filepath = 'wakaru/earth_earthquake_structure.js'

# Node.jsで直接評価
print("="*80)
print("Node.jsでJavaScript構文をチェック")
print("="*80)

try:
    result = subprocess.run(
        ['node', '-c', filepath],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace'
    )
    
    if result.returncode == 0:
        print("[OK] JavaScript構文は正しいです")
    else:
        print(f"[ERROR] JavaScript構文エラー:")
        print(result.stderr)
except FileNotFoundError:
    print("[WARN] Node.jsが見つかりません。Pythonで評価を試みます...")
    
    # Pythonで評価を試みる
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # コメントを削除
    lines = content.split('\n')
    content_no_comments = '\n'.join([l for l in lines if not l.strip().startswith('//')])
    
    try:
        class MockWindow:
            pass
        
        exec_globals = {'window': MockWindow()}
        exec(content_no_comments, exec_globals)
        
        if hasattr(exec_globals['window'], 'questions'):
            questions = exec_globals['window'].questions
            print(f"[OK] window.questionsが読み込まれました: {len(questions)}問")
        else:
            print("[ERROR] window.questionsが定義されていません")
    except SyntaxError as e:
        print(f"[ERROR] 構文エラー: {e}")
        print(f"  行: {e.lineno}")
        if e.text:
            print(f"  該当行: {e.text.strip()[:100]}")
    except Exception as e:
        print(f"[ERROR] 実行エラー: {e}")

