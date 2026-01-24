# -*- coding: utf-8 -*-
"""
レッスン18と30の重複問題を確認するスクリプト
"""

import re
from collections import defaultdict

def extract_questions(filepath):
    """JavaScriptファイルから問題を抽出"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    # qnum, text, choices, answerを抽出
    pattern = r'"qnum":\s*(\d+).*?"text":\s*"([^"]+)".*?"choices":\s*\[(.*?)\].*?"answer":\s*(\d+)'
    
    matches = re.finditer(pattern, content, re.DOTALL)
    for match in matches:
        qnum = int(match.group(1))
        text = match.group(2)
        choices_str = match.group(3)
        answer = int(match.group(4))
        
        # choicesを抽出
        choices = []
        choice_pattern = r'"([^"]+)"'
        for choice_match in re.finditer(choice_pattern, choices_str):
            choices.append(choice_match.group(1))
        
        questions.append({
            'qnum': qnum,
            'text': text,
            'choices': choices,
            'answer': answer
        })
    
    return questions

def check_duplicates(questions, filename):
    """重複をチェック"""
    print(f"\n{'='*80}")
    print(f"{filename}")
    print(f"{'='*80}")
    
    # 問題文の重複チェック
    text_to_qnums = defaultdict(list)
    for q in questions:
        text_to_qnums[q['text']].append(q['qnum'])
    
    duplicates_text = {k: v for k, v in text_to_qnums.items() if len(v) > 1}
    
    if duplicates_text:
        print("\n[重複あり] 同じ問題文:")
        for text, qnums in duplicates_text.items():
            print(f"  Q{qnums}: {text}")
    else:
        print("\n[OK] 問題文の重複なし")
    
    # 完全な重複チェック
    text_choices_to_qnums = defaultdict(list)
    for q in questions:
        key = (q['text'], tuple(sorted(q['choices'])))
        text_choices_to_qnums[key].append(q['qnum'])
    
    duplicates_full = {k: v for k, v in text_choices_to_qnums.items() if len(v) > 1}
    
    if duplicates_full:
        print("\n[重複あり] 同じ問題文と選択肢:")
        for (text, choices), qnums in duplicates_full.items():
            print(f"  Q{qnums}: {text}")
            print(f"    選択肢: {choices[:3]}...")
    else:
        print("\n[OK] 完全な重複なし")

def main():
    """メイン処理"""
    # レッスン18
    questions_18 = extract_questions('wakaru/earth_earthquake_structure.js')
    check_duplicates(questions_18, 'earth_earthquake_structure.js')
    
    # レッスン30
    questions_30 = extract_questions('wakaru/biology_food_chain.js')
    check_duplicates(questions_30, 'biology_food_chain.js')

if __name__ == '__main__':
    main()

