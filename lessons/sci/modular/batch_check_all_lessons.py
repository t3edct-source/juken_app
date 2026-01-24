# -*- coding: utf-8 -*-
"""
複数レッスンの一括チェックスクリプト
- 重複チェック（レッスン内、他レッスン間）
- 学習順序チェック
- 図解の有無チェック
"""

import re
import os
from collections import defaultdict

# 対象レッスンのファイル名マッピング
TARGET_LESSONS = {
    "10": "physics_light_properties.js",
    "12": "physics_force_motion_pulley_integrated.js",
    "13": "physics_pendulum_moving_weight_integrated.js",
    "14": "physics_balance.js",
    "15": "physics_current_compass.js",
    "16": "earth_volcano_structure_land_change_integrated.js",
    "18": "earth_earthquake_structure.js",
    "20": "earth_strata_formation.js",
    "21": "earth_various_landforms.js",
    "22": "earth_fossils_strata.js",
    "23": "earth_land_river_erosion.js",
    "24": "earth_sun_movement.js",
    "25": "earth_moon_movement.js",
    "26": "earth_weather_observation_pressure_wind.js",
    "27": "earth_temperature_changes.js",
    "28": "biology_animal_classification.js",
    "29": "biology_living_things_seasons.js",
    "30": "biology_food_chain.js",
    "31": "biology_photosynthesis.js",
    "32": "biology_plant_structure_transpiration_integrated.js",
    "33": "biology_plant_classification.js",
    "34": "biology_digestion_absorption.js",
    "35": "chemistry_solution_integrated.js",
    "37": "chemistry_physics_heat_transfer.js",
}

def extract_questions(filepath):
    """JavaScriptファイルから問題を抽出"""
    if not os.path.exists(filepath):
        return []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  エラー: ファイル読み込み失敗 - {e}")
        return []
    
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

def check_duplicates_with_other_lessons(target_file, all_files):
    """他レッスンとの重複チェック"""
    target_questions = extract_questions(target_file)
    target_texts = {q['text']: q['qnum'] for q in target_questions}
    
    duplicates = []
    for other_file in all_files:
        if other_file == target_file:
            continue
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
    """問題をカテゴリに分類（簡易版）"""
    text_lower = text.lower()
    
    # 基礎概念
    if any(kw in text for kw in ['何という', '何という？', '何というか', '何というか？', 
                                  '何を測る', '何を測る？', '何を測る道具', '何を測る道具？',
                                  '単位は', '単位は？', '関係がある', '関係がある？',
                                  'どうなる', 'どうなる？', 'どうなりますか', 'どうなりますか？']):
        return (0, '基礎概念')
    
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
    
    # 現在の順序が適切かチェック
    current_order_ok = True
    last_category_priority = -1
    for item in categorized:
        priority = item['category'][0]
        if priority < last_category_priority:
            current_order_ok = False
            break
        last_category_priority = priority
    
    return categorized, by_category, current_order_ok

def check_diagrams(filepath):
    """図解の有無を確認"""
    if not os.path.exists(filepath):
        return {}
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  エラー: ファイル読み込み失敗 - {e}")
        return {}
    
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
                lines = [l.strip() for l in div_text.split('\\n') if l.strip()]
                has_content = len(lines) >= 3
        
        diagrams[qnum] = {
            'has_diagram': has_diagram,
            'has_content': has_content
        }
    
    return diagrams

def check_lesson(lesson_id, filename):
    """1つのレッスンをチェック"""
    filepath = f'wakaru/{filename}'
    
    print(f"\n{'='*80}")
    print(f"レッスン {lesson_id}: {filename}")
    print(f"{'='*80}")
    
    if not os.path.exists(filepath):
        print(f"  [エラー] ファイルが見つかりません: {filepath}")
        return None
    
    questions = extract_questions(filepath)
    if not questions:
        print(f"  [エラー] 問題が見つかりません")
        return None
    
    print(f"  問題数: {len(questions)}問")
    
    # レポートデータ
    report = {
        'lesson_id': lesson_id,
        'filename': filename,
        'question_count': len(questions),
        'duplicates_within': None,
        'duplicates_other': None,
        'learning_order_ok': None,
        'diagrams': None
    }
    
    # ＜１＞ レッスン内での重複チェック
    duplicates_text, duplicates_full = check_duplicates_within_lesson(questions)
    report['duplicates_within'] = {
        'text': len(duplicates_text),
        'full': len(duplicates_full)
    }
    
    if duplicates_text:
        print(f"  [注意] 同じ問題文: {len(duplicates_text)}組")
    else:
        print(f"  [OK] レッスン内での問題文の重複なし")
    
    if duplicates_full:
        print(f"  [注意] 完全な重複: {len(duplicates_full)}組")
    else:
        print(f"  [OK] レッスン内での完全な重複なし")
    
    # ＜１＞ 他レッスンとの重複チェック
    all_files = [f'wakaru/{f}' for f in TARGET_LESSONS.values()]
    duplicates_other = check_duplicates_with_other_lessons(filepath, all_files)
    report['duplicates_other'] = len(duplicates_other)
    
    if duplicates_other:
        print(f"  [注意] 他レッスンとの重複: {len(duplicates_other)}問")
    else:
        print(f"  [OK] 他レッスンとの重複なし")
    
    # ＜２＞ 学習順序の確認
    categorized, by_category, order_ok = check_learning_order(questions)
    report['learning_order_ok'] = order_ok
    
    if order_ok:
        print(f"  [OK] 学習順序は概ね適切")
    else:
        print(f"  [注意] 学習順序の見直しを推奨")
        print(f"    カテゴリ分布:")
        for cat, items in sorted(by_category.items()):
            print(f"      {cat[1]}: {len(items)}問")
    
    # ＜３＞ 図解の有無確認
    diagrams = check_diagrams(filepath)
    report['diagrams'] = diagrams
    
    with_diagram = sum(1 for d in diagrams.values() if d['has_diagram'] and d['has_content'])
    without_diagram = len(questions) - with_diagram
    
    print(f"  図解あり: {with_diagram}問")
    print(f"  図解なし: {without_diagram}問")
    
    return report

def main():
    """メイン処理"""
    print("="*80)
    print("複数レッスンの一括チェック")
    print("="*80)
    
    reports = []
    
    # 各レッスンをチェック
    for lesson_id, filename in sorted(TARGET_LESSONS.items(), key=lambda x: int(x[0])):
        report = check_lesson(lesson_id, filename)
        if report:
            reports.append(report)
    
    # サマリーレポート
    print(f"\n{'='*80}")
    print("サマリーレポート")
    print(f"{'='*80}\n")
    
    print(f"{'レッスン':<6} {'ファイル名':<50} {'問題数':<6} {'重複内':<8} {'重複外':<8} {'順序':<6} {'図解':<8}")
    print("-" * 100)
    
    for report in reports:
        dup_within = f"{report['duplicates_within']['text']}/{report['duplicates_within']['full']}"
        dup_other = str(report['duplicates_other'])
        order = "OK" if report['learning_order_ok'] else "注意"
        
        diagrams = report['diagrams']
        with_diagram = sum(1 for d in diagrams.values() if d['has_diagram'] and d['has_content']) if diagrams else 0
        diagram_status = f"{with_diagram}/{report['question_count']}"
        
        print(f"{report['lesson_id']:<6} {report['filename']:<50} {report['question_count']:<6} {dup_within:<8} {dup_other:<8} {order:<6} {diagram_status:<8}")
    
    # レポートをファイルに保存
    with open('batch_check_report.txt', 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("複数レッスンの一括チェックレポート\n")
        f.write("="*80 + "\n\n")
        
        for report in reports:
            f.write(f"\nレッスン {report['lesson_id']}: {report['filename']}\n")
            f.write(f"  問題数: {report['question_count']}問\n")
            f.write(f"  レッスン内重複: {report['duplicates_within']['text']}組（問題文）、{report['duplicates_within']['full']}組（完全）\n")
            f.write(f"  他レッスン重複: {report['duplicates_other']}問\n")
            f.write(f"  学習順序: {'OK' if report['learning_order_ok'] else '注意'}\n")
            
            diagrams = report['diagrams']
            if diagrams:
                with_diagram = sum(1 for d in diagrams.values() if d['has_diagram'] and d['has_content'])
                f.write(f"  図解: {with_diagram}/{report['question_count']}問\n")
            f.write("\n")
    
    print(f"\n詳細レポートは batch_check_report.txt に保存しました")

if __name__ == '__main__':
    main()

