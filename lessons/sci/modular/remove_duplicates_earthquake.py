# -*- coding: utf-8 -*-
"""
レッスン18の重複問題を削除し、qnumを再振り当て
"""

import re
import os
from pathlib import Path

def extract_all_questions(content):
    """すべての問題オブジェクトを抽出"""
    questions = {}
    
    # window.questions = [ の部分を抽出
    pattern = r'window\.questions\s*=\s*\[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return questions
    
    questions_text = match.group(1)
    
    # 各問題オブジェクトを抽出
    brace_count = 0
    current_question = ""
    in_string = False
    escape_next = False
    
    for char in questions_text:
        if escape_next:
            current_question += char
            escape_next = False
            continue
        
        if char == '\\':
            escape_next = True
            current_question += char
            continue
        
        if char == '"' and not escape_next:
            in_string = not in_string
        
        if not in_string:
            if char == '{':
                if brace_count == 0:
                    current_question = ""
                brace_count += 1
                current_question += char
            elif char == '}':
                current_question += char
                brace_count -= 1
                if brace_count == 0:
                    # qnumを抽出
                    qnum_match = re.search(r'"qnum":\s*(\d+)', current_question)
                    if qnum_match:
                        qnum = int(qnum_match.group(1))
                        questions[qnum] = current_question.strip()
                    current_question = ""
            else:
                if brace_count > 0:
                    current_question += char
        else:
            if brace_count > 0:
                current_question += char
    
    return questions

def remove_duplicates_and_renumber(filepath, duplicate_qnums):
    """重複問題を削除し、qnumを再振り当て"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {filepath} - {e}")
        return False
    
    # 問題オブジェクトを抽出
    questions = extract_all_questions(content)
    
    print(f"元の問題数: {len(questions)}問")
    print(f"削除する問題: Q{duplicate_qnums}")
    
    # 重複問題を削除
    for qnum in duplicate_qnums:
        if qnum in questions:
            del questions[qnum]
            print(f"  Q{qnum}を削除しました")
    
    print(f"削除後の問題数: {len(questions)}問")
    
    # qnumを1から順に再振り当て
    sorted_qnums = sorted([q for q in questions.keys() if q not in duplicate_qnums])
    reordered_blocks = []
    
    for new_qnum, old_qnum in enumerate(sorted_qnums, 1):
        question_block = questions[old_qnum]
        # qnumを新しい番号に変更
        updated_block = re.sub(r'"qnum":\s*\d+', f'"qnum": {new_qnum}', question_block, count=1)
        reordered_blocks.append(updated_block)
    
    # 新しい配列を作成（各問題の後にカンマを追加、最後の問題は除く）
    formatted_blocks = []
    for i, block in enumerate(reordered_blocks):
        if i < len(reordered_blocks) - 1:
            formatted_blocks.append(block + ',')
        else:
            formatted_blocks.append(block)
    
    new_array_content = '\n'.join(formatted_blocks)
    
    # 元のwindow.questions = [...] を置き換え
    pattern = r'window\.questions\s*=\s*\[[\s\S]*?\];'
    new_content = re.sub(pattern, f'window.questions = [\n{new_array_content}\n];', content, flags=re.DOTALL)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] {len(reordered_blocks)}問に再振り当てしました: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"[ERROR] ファイル書き込みエラー: {filepath} - {e}")
        return False

def main():
    """メイン処理"""
    import os
    # レッスン18: Q22, Q24を削除
    remove_duplicates_and_renumber('wakaru/earth_earthquake_structure.js', [22, 24])

if __name__ == '__main__':
    main()

