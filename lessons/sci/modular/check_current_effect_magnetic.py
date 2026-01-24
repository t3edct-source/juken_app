#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
電流の作用②（磁界）の確認
1. レッスン内での問題内容の重複チェック
2. 他レッスンとの問題の重複チェック
3. 学習の並びが概念理解の順になっているか確認
4. テキスト解説（図解）がすべての問題に入っているか確認
"""

import re
import json
from pathlib import Path
from collections import defaultdict

def extract_questions_from_js(filepath):
    """JavaScriptファイルから問題を抽出"""
    questions = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # window.questions = [...] の部分を抽出
        match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
        if not match:
            return questions
        
        array_content = match.group(1)
        
        # 各問題のqnumを探す
        qnum_pattern = r'"qnum":\s*(\d+)'
        qnum_matches = list(re.finditer(qnum_pattern, array_content))
        
        for i, qnum_match in enumerate(qnum_matches):
            qnum = int(qnum_match.group(1))
            start_pos = qnum_match.start()
            
            # 次の問題の開始位置を探す
            if i + 1 < len(qnum_matches):
                end_pos = qnum_matches[i + 1].start()
            else:
                end_pos = len(array_content)
            
            # この問題のtextとchoicesを抽出
            question_block = array_content[start_pos:end_pos]
            
            text_match = re.search(r'"text":\s*"([^"]*(?:\\.[^"]*)*)"', question_block, re.DOTALL)
            text = text_match.group(1) if text_match else ""
            # エスケープを処理
            text = text.replace('\\"', '"').replace('\\n', '\n')
            
            choices_match = re.search(r'"choices":\s*\[(.*?)\]', question_block, re.DOTALL)
            choices = []
            if choices_match:
                choices_str = choices_match.group(1)
                # 各選択肢を抽出
                choice_pattern = r'"([^"]*(?:\\.[^"]*)*)"'
                choices = [re.sub(r'\\(.)', r'\1', m.group(1)) for m in re.finditer(choice_pattern, choices_str)]
            
            questions.append({
                'qnum': qnum,
                'text': text,
                'choices': choices
            })
    except Exception as e:
        print(f"エラー: {filepath} - {e}")
    
    return questions

def check_duplicates_within_lesson(questions):
    """レッスン内での重複チェック"""
    print("=" * 80)
    print("＜１＞ レッスン内での問題内容の重複チェック")
    print("=" * 80)
    print()
    
    # 問題文の重複チェック
    text_to_qnums = defaultdict(list)
    for q in questions:
        text_to_qnums[q['text']].append(q['qnum'])
    
    duplicates = {text: qnums for text, qnums in text_to_qnums.items() if len(qnums) > 1}
    
    if duplicates:
        print("[重複あり] 同じ問題文が見つかりました:")
        for text, qnums in duplicates.items():
            print(f"  Q{qnums}: {text[:50]}...")
        print()
    else:
        print("[OK] レッスン内での問題文の重複はありません")
        print()
    
    # 選択肢の重複チェック（問題文と選択肢の組み合わせ）
    text_choices_to_qnums = defaultdict(list)
    for q in questions:
        key = (q['text'], tuple(sorted(q['choices'])))
        text_choices_to_qnums[key].append(q['qnum'])
    
    duplicates_full = {key: qnums for key, qnums in text_choices_to_qnums.items() if len(qnums) > 1}
    
    if duplicates_full:
        print("[重複あり] 同じ問題文と選択肢の組み合わせが見つかりました:")
        for (text, choices), qnums in duplicates_full.items():
            print(f"  Q{qnums}: {text[:50]}...")
        print()
    else:
        print("[OK] レッスン内での完全な重複（問題文+選択肢）はありません")
        print()
    
    return len(duplicates) == 0 and len(duplicates_full) == 0

def check_duplicates_with_other_lessons(target_file, all_lesson_files):
    """他レッスンとの重複チェック"""
    print("=" * 80)
    print("＜１＞ 他レッスンとの問題の重複チェック")
    print("=" * 80)
    print()
    
    target_questions = extract_questions_from_js(target_file)
    target_texts = {q['text']: q['qnum'] for q in target_questions}
    
    duplicates_found = []
    
    for lesson_file in all_lesson_files:
        if lesson_file == target_file:
            continue
        
        lesson_questions = extract_questions_from_js(lesson_file)
        lesson_name = lesson_file.name
        
        for q in lesson_questions:
            if q['text'] in target_texts:
                duplicates_found.append({
                    'target_qnum': target_texts[q['text']],
                    'other_file': lesson_name,
                    'other_qnum': q['qnum'],
                    'text': q['text']
                })
    
    if duplicates_found:
        print("[重複あり] 他レッスンとの重複が見つかりました:")
        for dup in duplicates_found:
            print(f"  対象レッスン Q{dup['target_qnum']} <-> {dup['other_file']} Q{dup['other_qnum']}")
            print(f"    問題: {dup['text'][:60]}...")
            print()
    else:
        print("[OK] 他レッスンとの重複はありません")
        print()
    
    return len(duplicates_found) == 0

def check_learning_order(questions):
    """学習の並びが概念理解の順になっているか確認"""
    print("=" * 80)
    print("＜２＞ 学習の並びが概念理解の順になっているか確認")
    print("=" * 80)
    print()
    
    # 問題を概念カテゴリに分類
    def categorize_question(text):
        text_lower = text.lower()
        
        # 基礎概念
        if '磁界' in text and ('何という' in text or '何と' in text or '作用' in text):
            return (0, '基礎概念_磁界作用')
        if '電流' in text and '磁界' in text and ('何という' in text or '何と' in text):
            return (0, '基礎概念_電流と磁界')
        
        # 概念（磁界の仕組み）
        if '磁界' in text and ('なぜ' in text or 'どうして' in text or '仕組み' in text):
            return (1, '概念_磁界の仕組み')
        if '電流' in text and '磁界' in text and ('なぜ' in text or 'どうして' in text):
            return (1, '概念_電流と磁界の関係')
        
        # 観察・実験
        if '実験' in text or '観察' in text or '調べる' in text:
            return (2, '観察方法_実験・観察')
        if '方位磁針' in text or '磁針' in text:
            return (2, '観察方法_磁針の利用')
        
        # 応用
        if '電磁石' in text:
            return (3, '応用_電磁石')
        if 'コイル' in text:
            return (3, '応用_コイル')
        if '電流' in text and ('大きい' in text or '小さい' in text) and '磁界' in text:
            return (3, '応用_電流と磁界の関係')
        
        return (4, 'その他')
    
    categorized = []
    for q in questions:
        category = categorize_question(q['text'])
        categorized.append({
            'qnum': q['qnum'],
            'text': q['text'],
            'category': category
        })
    
    # カテゴリごとにグループ化
    category_groups = defaultdict(list)
    for item in categorized:
        category_groups[item['category']].append(item)
    
    print("問題の分類:")
    for category, items in sorted(category_groups.items()):
        print(f"  {category}: {len(items)}問")
        for item in items:
            print(f"    Q{item['qnum']}: {item['text'][:50]}...")
    print()
    
    # 推奨される学習順序
    recommended_order = [
        '基礎概念_磁界作用',
        '基礎概念_電流と磁界',
        '概念_磁界の仕組み',
        '概念_電流と磁界の関係',
        '観察方法_実験・観察',
        '観察方法_磁針の利用',
        '応用_電磁石',
        '応用_コイル',
        '応用_電流と磁界の関係',
        'その他'
    ]
    
    # 現在の順序を確認
    current_order = [item['category'] for item in categorized]
    
    print("現在の順序:")
    prev_category = None
    order_issues = []
    for i, item in enumerate(categorized, 1):
        category = item['category']
        if prev_category and category != prev_category:
            prev_idx = recommended_order.index(prev_category) if prev_category in recommended_order else 999
            curr_idx = recommended_order.index(category) if category in recommended_order else 999
            if prev_idx > curr_idx:
                order_issues.append({
                    'position': i,
                    'prev': prev_category,
                    'curr': category,
                    'prev_qnum': categorized[i-2]['qnum'] if i > 1 else None,
                    'curr_qnum': item['qnum']
                })
        prev_category = category
    
    if order_issues:
        print("[注意] 学習順序に問題がある可能性があります:")
        for issue in order_issues:
            print(f"  Q{issue['curr_qnum']} ({issue['curr']}) が Q{issue['prev_qnum']} ({issue['prev']}) の後に来ています")
        print()
    else:
        print("[OK] 学習順序は概ね適切です")
        print()
    
    return len(order_issues) == 0

def check_diagrams(questions):
    """テキスト解説（図解）がすべての問題に入っているか確認"""
    print("=" * 80)
    print("＜３＞ テキスト解説（図解）がすべての問題に入っているか確認")
    print("=" * 80)
    print()
    
    try:
        with open('wakaru/physics_current_effect_magnetic.js', 'r', encoding='utf-8') as f:
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
    
    # 各問題のsourceフィールドを確認
    diagrams_info = []
    
    for q in questions:
        qnum = q['qnum']
        # この問題のsourceフィールドを探す
        pattern = rf'"qnum":\s*{qnum}.*?"source":\s*"([^"]*(?:\\.[^"]*)*)"'
        source_match = re.search(pattern, array_content, re.DOTALL)
        
        if source_match:
            source = source_match.group(1)
            # エスケープされた改行を実際の改行に変換
            source = source.replace('\\n', '\n')
            
            # 図解の有無を確認
            has_diagram = '<div style=' in source
            
            if has_diagram:
                # 図解のタイトルを抽出
                title_match = re.search(r'【([^】]+)】', source)
                title = title_match.group(1) if title_match else "タイトルなし"
                
                # 図解の内容を確認
                div_match = re.search(r'<div style="[^"]*">(.*?)</div>', source, re.DOTALL)
                if div_match:
                    diagram_content = div_match.group(1)
                    lines = diagram_content.strip().split('\n')
                    non_empty_lines = [line for line in lines if line.strip()]
                    diagrams_info.append({
                        'qnum': qnum,
                        'has_diagram': True,
                        'title': title,
                        'lines': len(non_empty_lines),
                        'has_content': len(non_empty_lines) >= 3
                    })
                else:
                    diagrams_info.append({
                        'qnum': qnum,
                        'has_diagram': True,
                        'title': title,
                        'lines': 0,
                        'has_content': False
                    })
            else:
                diagrams_info.append({
                    'qnum': qnum,
                    'has_diagram': False,
                    'title': None,
                    'lines': 0,
                    'has_content': False
                })
        else:
            diagrams_info.append({
                'qnum': qnum,
                'has_diagram': False,
                'title': None,
                'lines': 0,
                'has_content': False
            })
    
    # 結果を表示
    diagrams_with_content = 0
    diagrams_without_content = 0
    no_diagrams = []
    
    for info in diagrams_info:
        if info['has_diagram']:
            if info['has_content']:
                diagrams_with_content += 1
                print(f"  Q{info['qnum']}: 図解あり - 【{info['title']}】（{info['lines']}行の内容）")
            else:
                diagrams_without_content += 1
                print(f"  Q{info['qnum']}: 図解あり（内容が少ない） - 【{info['title']}】（{info['lines']}行）")
        else:
            no_diagrams.append(info['qnum'])
            print(f"  Q{info['qnum']}: 図解なし")
    
    print()
    print(f"図解あり（内容3行以上）: {diagrams_with_content}問")
    print(f"図解あり（内容が少ない）: {diagrams_without_content}問")
    print(f"図解なし: {len(no_diagrams)}問")
    if no_diagrams:
        print(f"図解なしの問題: {no_diagrams}")
    print()
    
    return len(no_diagrams) == 0

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    target_file = base_dir / 'wakaru' / 'physics_current_effect_magnetic.js'
    
    if not target_file.exists():
        print(f"[ERROR] ファイルが見つかりません: {target_file}")
        return
    
    # 問題を抽出
    questions = extract_questions_from_js(target_file)
    print(f"ファイル: {target_file.name}")
    print(f"問題数: {len(questions)}問")
    print()
    
    # 1. レッスン内での重複チェック
    check_duplicates_within_lesson(questions)
    
    # 2. 他レッスンとの重複チェック
    wakaru_dir = base_dir / 'wakaru'
    all_lesson_files = list(wakaru_dir.glob('*.js'))
    check_duplicates_with_other_lessons(target_file, all_lesson_files)
    
    # 3. 学習順序の確認
    check_learning_order(questions)
    
    # 4. 図解の確認
    check_diagrams(questions)
    
    print("=" * 80)
    print("確認完了")
    print("=" * 80)

if __name__ == "__main__":
    main()

