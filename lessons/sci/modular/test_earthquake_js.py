# -*- coding: utf-8 -*-
"""
earth_earthquake_structure.jsを実際に読み込んでテスト
"""

import re

filepath = 'wakaru/earth_earthquake_structure.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# コメント行を削除してテスト
# コメント行を削除
lines = content.split('\n')
new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith('//'):
        continue
    new_lines.append(line)

content_no_comments = '\n'.join(new_lines)

# JavaScriptとして評価を試みる
print("="*80)
print("コメントを削除してJavaScriptとして評価を試みます...")
print("="*80)

try:
    class MockWindow:
        pass
    
    exec_globals = {'window': MockWindow()}
    exec(content_no_comments, exec_globals)
    
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
    
    # エラーが発生した行の前後を表示
    error_line = e.lineno
    if error_line:
        lines_array = content_no_comments.split('\n')
        start = max(0, error_line - 3)
        end = min(len(lines_array), error_line + 3)
        print(f"\n  エラー行の前後:")
        for i in range(start, end):
            marker = ">>> " if i == error_line - 1 else "    "
            print(f"  {marker}{i+1}: {lines_array[i]}")
except Exception as e:
    print(f"[ERROR] 実行エラー: {e}")
    import traceback
    traceback.print_exc()

# 引用符のバランスを確認
print("\n" + "="*80)
print("引用符のバランスを確認...")
print("="*80)

quote_count = content.count('"')
print(f"引用符の総数: {quote_count}")
if quote_count % 2 != 0:
    print("[ERROR] 引用符の数が奇数です（文字列リテラルが正しく閉じられていません）")
else:
    print("[OK] 引用符の数は偶数です")

# sourceフィールド内の引用符を確認
source_matches = re.findall(r'"source":\s*"(.*?)"', content, re.DOTALL)
print(f"\nsourceフィールド数: {len(source_matches)}")
for i, source_text in enumerate(source_matches[:3], 1):
    quote_in_source = source_text.count('"')
    if quote_in_source > 0:
        print(f"  source {i}: 内部に{quote_in_source}個の引用符があります")
        # エスケープされていない引用符があるか確認
        unescaped_quotes = [m.start() for m in re.finditer(r'(?<!\\)"', source_text)]
        if unescaped_quotes:
            print(f"    [WARN] エスケープされていない引用符: {len(unescaped_quotes)}箇所")

