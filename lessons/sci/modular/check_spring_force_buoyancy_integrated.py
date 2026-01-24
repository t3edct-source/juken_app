# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のチェックスクリプト
- レッスン内での重複チェック
- 他レッスンとの重複チェック
- 学習順序の確認
- 図解の有無確認
"""

import re
import os
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

def check_duplicates_within_lesson(questions):
    """レッスン内での重複チェック"""
    text_to_qnums = defaultdict(list)
    text_choices_to_qnums = defaultdict(list)
    
    for q in questions:
        text = q['text']
        choices_str = '|'.join(sorted(q['choices']))
        text_choices = f"{text}|{choices_str}"
        
        text_to_qnums[text].append(q['qnum'])
        text_choices_to_qnums[text_choices].append(q['qnum'])
    
    duplicates_text = {k: v for k, v in text_to_qnums.items() if len(v) > 1}
    duplicates_full = {k: v for k, v in text_choices_to_qnums.items() if len(v) > 1}
    
    return duplicates_text, duplicates_full

def check_duplicates_with_other_lessons(target_file, other_files):
    """他レッスンとの重複チェック"""
    target_questions = extract_questions(target_file)
    target_texts = {q['text']: q['qnum'] for q in target_questions}
    
    duplicates = []
    for other_file in other_files:
        if not os.path.exists(other_file):
            continue
        other_questions = extract_questions(other_file)
        for q in other_questions:
            if q['text'] in target_texts:
                duplicates.append({
                    'target_qnum': target_texts[q['text']],
                    'other_file': os.path.basename(other_file),
                    'other_qnum': q['qnum'],
                    'text': q['text']
                })
    
    return duplicates

def categorize_question(text):
    """問題をカテゴリに分類"""
    text_lower = text.lower()
    
    # 基礎概念
    if any(kw in text for kw in ['何という', '何という？', '何というか', '何というか？', 
                                  '何を測る', '何を測る？', '何を測る道具', '何を測る道具？',
                                  '単位は', '単位は？', '関係がある', '関係がある？',
                                  'どうなる', 'どうなる？', 'どうなりますか', 'どうなりますか？']):
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
                                 '比は', '比は？', '和は', '和は？', '差は', '差は？']):
        return (1, '計算・応用')
    
    # その他
    return (2, 'その他')

def check_learning_order(questions):
    """学習順序の確認"""
    categorized = []
    for q in questions:
        category = categorize_question(q['text'])
        categorized.append({
            'qnum': q['qnum'],
            'text': q['text'],
            'category': category
        })
    
    # カテゴリごとにグループ化
    by_category = defaultdict(list)
    for item in categorized:
        by_category[item['category']].append(item)
    
    return categorized, by_category

def check_diagrams(filepath):
    """図解の有無を確認"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # qnumとsourceを抽出
    pattern = r'"qnum":\s*(\d+).*?"source":\s*"([^"]*(?:<div[^>]*>.*?</div>)?[^"]*)"'
    
    diagrams = {}
    matches = re.finditer(pattern, content, re.DOTALL)
    for match in matches:
        qnum = int(match.group(1))
        source = match.group(2)
        
        # <div>タグがあるかチェック
        has_diagram = '<div' in source and '</div>' in source
        # 図解の内容をチェック（3行以上または画像）
        has_content = False
        if has_diagram:
            div_content = re.search(r'<div[^>]*>(.*?)</div>', source, re.DOTALL)
            if div_content:
                div_text = div_content.group(1)
                # 改行や文字が3行以上あるか
                lines = [l.strip() for l in div_text.split('\n') if l.strip()]
                has_content = len(lines) >= 3
        
        diagrams[qnum] = {
            'has_diagram': has_diagram,
            'has_content': has_content
        }
    
    return diagrams

def main():
    target_file = 'wakaru/physics_spring_force_buoyancy_integrated.js'
    
    # 他の関連ファイル
    other_files = [
        'wakaru/physics_force_motion_pulley_integrated.js',
        'oboeru/physics_spring_force_oboeru.js',
    ]
    
    print(f"ファイル: {target_file}")
    print(f"問題数: ", end="")
    
    questions = extract_questions(target_file)
    print(f"{len(questions)}問\n")
    
    # レポートを書き込む
    report = []
    report.append("=" * 80)
    report.append("ばねと力・ばねと浮力統合版 確認レポート")
    report.append("=" * 80)
    report.append("")
    
    # ＜１＞ レッスン内での問題内容の重複チェック
    report.append("=" * 80)
    report.append("＜１＞ レッスン内での問題内容の重複チェック")
    report.append("=" * 80)
    report.append("")
    
    duplicates_text, duplicates_full = check_duplicates_within_lesson(questions)
    
    if duplicates_text:
        report.append("[注意] 同じ問題文の問題があります：")
        for text, qnums in duplicates_text.items():
            report.append(f"  {text[:50]}... → Q{qnums}")
        report.append("")
    else:
        report.append("[OK] レッスン内での問題文の重複はありません")
        report.append("")
    
    if duplicates_full:
        report.append("[注意] 完全な重複（問題文+選択肢）があります：")
        for text_choices, qnums in duplicates_full.items():
            text = text_choices.split('|')[0]
            report.append(f"  {text[:50]}... → Q{qnums}")
        report.append("")
    else:
        report.append("[OK] レッスン内での完全な重複（問題文+選択肢）はありません")
        report.append("")
    
    # ＜１＞ 他レッスンとの問題の重複チェック
    report.append("=" * 80)
    report.append("＜１＞ 他レッスンとの問題の重複チェック")
    report.append("=" * 80)
    report.append("")
    
    duplicates_other = check_duplicates_with_other_lessons(target_file, other_files)
    
    if duplicates_other:
        report.append("[注意] 他レッスンとの重複があります：")
        for dup in duplicates_other:
            report.append(f"  Q{dup['target_qnum']}: {dup['text'][:50]}...")
            report.append(f"    → {dup['other_file']} の Q{dup['other_qnum']}")
        report.append("")
    else:
        report.append("[OK] 他レッスンとの重複はありません")
        report.append("")
    
    # ＜２＞ 学習の並びが概念理解の順になっているか確認
    report.append("=" * 80)
    report.append("＜２＞ 学習の並びが概念理解の順になっているか確認")
    report.append("=" * 80)
    report.append("")
    
    categorized, by_category = check_learning_order(questions)
    
    report.append("現在の並び:")
    for item in categorized:
        cat_name = item['category'][1]
        report.append(f"  Q{item['qnum']:2d}: {item['text'][:50]}... → {cat_name}")
    report.append("")
    
    # カテゴリごとの分布
    report.append("カテゴリごとの分布:")
    for cat, items in sorted(by_category.items()):
        qnums = [item['qnum'] for item in items]
        report.append(f"  {cat[1]}: {len(items)}問 (Q{min(qnums)}-Q{max(qnums)})")
    report.append("")
    
    # 推奨順序
    report.append("推奨される学習順序:")
    report.append("  1. 基礎概念（ばねののび、浮力、重力、力）")
    report.append("  2. 計算・応用")
    report.append("  3. その他")
    report.append("")
    
    # 現在の順序が適切かチェック
    current_order_ok = True
    last_category_priority = -1
    for item in categorized:
        priority = item['category'][0]
        if priority < last_category_priority:
            current_order_ok = False
            break
        last_category_priority = priority
    
    if current_order_ok:
        report.append("[OK] 学習順序は概ね適切です")
    else:
        report.append("[注意] 学習順序の見直しを推奨します")
    report.append("")
    
    # ＜３＞ テキスト解説（図解）がすべての問題に入っているか確認
    report.append("=" * 80)
    report.append("＜３＞ テキスト解説（図解）がすべての問題に入っているか確認")
    report.append("=" * 80)
    report.append("")
    
    diagrams = check_diagrams(target_file)
    
    with_diagram = 0
    without_diagram = 0
    without_content = 0
    
    for qnum in range(1, len(questions) + 1):
        if qnum in diagrams:
            if diagrams[qnum]['has_diagram'] and diagrams[qnum]['has_content']:
                with_diagram += 1
                report.append(f"  Q{qnum:2d}: 図解あり（内容あり）")
            elif diagrams[qnum]['has_diagram']:
                without_content += 1
                report.append(f"  Q{qnum:2d}: 図解あり（内容不足）")
            else:
                without_diagram += 1
                report.append(f"  Q{qnum:2d}: 図解なし")
        else:
            without_diagram += 1
            report.append(f"  Q{qnum:2d}: 図解なし（問題が見つかりません）")
    
    report.append("")
    report.append(f"図解あり（内容あり）: {with_diagram}問")
    report.append(f"図解あり（内容不足）: {without_content}問")
    report.append(f"図解なし: {without_diagram}問")
    report.append("")
    
    # 確認完了
    report.append("=" * 80)
    report.append("確認完了")
    report.append("=" * 80)
    
    # レポートをファイルに保存
    report_text = '\n'.join(report)
    with open('spring_force_buoyancy_integrated_check_report.txt', 'w', encoding='utf-8') as f:
        f.write(report_text)
    
    # コンソールにも出力
    print(report_text)

if __name__ == '__main__':
    main()

