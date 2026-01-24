# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版の学習順序を再配置するスクリプト
"""

import re
import json

def extract_questions(content):
    """JavaScriptファイルから問題を抽出"""
    questions = []
    
    # window.questions = [ の部分を抽出
    pattern = r'window\.questions\s*=\s*\[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return questions
    
    questions_text = match.group(1)
    
    # 各問題オブジェクトを抽出
    # { から対応する } までを抽出
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
                    # 問題オブジェクトが完成
                    questions.append(current_question.strip())
                    current_question = ""
            else:
                if brace_count > 0:
                    current_question += char
        else:
            if brace_count > 0:
                current_question += char
    
    return questions

def categorize_question(question_text):
    """問題をカテゴリに分類"""
    # textフィールドを抽出
    text_match = re.search(r'"text":\s*"([^"]+)"', question_text)
    if not text_match:
        return (2, 'その他')
    
    text = text_match.group(1)
    
    # 基礎概念
    if any(kw in text for kw in ['何という', '何という？', '何というか', '何というか？', 
                                  '何を測る', '何を測る？', '何を測る道具', '何を測る道具？',
                                  '単位は', '単位は？', '関係がある', '関係がある？',
                                  'どうなる', 'どうなる？', 'どうなりますか', 'どうなりますか？',
                                  '何と何の', '何と何の和', '何と何の和ですか']):
        if 'ばね' in text and ('のび' in text or '伸び' in text):
            return (0, '基礎概念_ばねののび')
        elif '浮力' in text or '浮く' in text or '沈む' in text:
            return (0, '基礎概念_浮力')
        elif '重力' in text or '重さ' in text:
            return (0, '基礎概念_重力')
        elif '力' in text:
            return (0, '基礎概念_力')
        else:
            return (0, '基礎概念_その他')
    
    # 計算・応用
    if any(kw in text for kw in ['計算', '求める', '求める？', '求めるには', '求めるには？',
                                 '何g', '何cm', '何N', '何倍', '何倍？', '何倍になる',
                                 '比は', '比は？', '和は', '和は？', '差は', '差は？',
                                 '40g', '60g', '100g', '17cm', '18cm']):
        return (1, '計算・応用')
    
    # その他
    return (2, 'その他')

def reorder_questions(filepath, new_order):
    """問題を新しい順序で並べ替える"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 問題を抽出
    questions = extract_questions(content)
    
    if len(questions) != len(new_order):
        print(f"エラー: 問題数が一致しません（抽出: {len(questions)}, 指定: {len(new_order)}）")
        return False
    
    # 新しい順序で問題を並べ替え
    reordered_questions = []
    for new_qnum, old_qnum in enumerate(new_order, 1):
        old_question = questions[old_qnum - 1]
        
        # qnumを更新
        old_question = re.sub(r'"qnum":\s*\d+', f'"qnum": {new_qnum}', old_question)
        reordered_questions.append(old_question)
    
    # 新しい問題配列を作成
    new_questions_array = ',\n  '.join(reordered_questions)
    
    # ファイルの内容を置き換え
    pattern = r'window\.questions\s*=\s*\[.*?\];'
    replacement = f'window.questions = [\n  {new_questions_array}\n];'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True

def main():
    filepath = 'wakaru/physics_spring_force_buoyancy_integrated.js'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 問題を抽出
    questions = extract_questions(content)
    
    if not questions:
        print("エラー: 問題が見つかりませんでした")
        return
    
    print(f"問題数: {len(questions)}問")
    
    # 各問題をカテゴリに分類
    categorized = []
    for i, q in enumerate(questions, 1):
        category = categorize_question(q)
        categorized.append({
            'qnum': i,
            'question': q,
            'category': category
        })
    
    # カテゴリごとにグループ化
    by_category = {}
    for item in categorized:
        cat_key = item['category']
        if cat_key not in by_category:
            by_category[cat_key] = []
        by_category[cat_key].append(item)
    
    # 推奨順序で並べ替え
    # 1. 基礎概念（ばねののび、浮力、重力、力、その他）
    # 2. 計算・応用
    # 3. その他
    
    category_order = [
        (0, '基礎概念_ばねののび'),
        (0, '基礎概念_力'),
        (0, '基礎概念_重力'),
        (0, '基礎概念_浮力'),
        (0, '基礎概念_その他'),
        (1, '計算・応用'),
        (2, 'その他')
    ]
    
    new_order = []
    for cat_priority, cat_name in category_order:
        cat_key = (cat_priority, cat_name)
        if cat_key in by_category:
            for item in by_category[cat_key]:
                new_order.append(item['qnum'])
    
    print(f"\n新しい順序: {new_order}")
    
    # 問題を再配置
    if reorder_questions(filepath, new_order):
        print(f"\n学習順序の再配置が完了しました: {filepath}")
    else:
        print("\nエラー: 再配置に失敗しました")

if __name__ == '__main__':
    main()

