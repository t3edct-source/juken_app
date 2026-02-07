#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全レッスンタイトル一覧生成スクリプト
catalog.jsonからwakaruモードのレッスンを抽出
"""

import json
import re

# catalog.jsonを読み込む
with open('catalog.json', 'r', encoding='utf-8-sig') as f:
    catalog = json.load(f)

# index_modular.htmlからeraMapを抽出
with open('lessons/sci/modular/wakaru/index_modular.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# eraMapを抽出
era_map_match = re.search(r'const eraMap = \{([^}]+)\};', html_content, re.DOTALL)
era_map = {}
if era_map_match:
    era_map_str = era_map_match.group(1)
    for line in era_map_str.split('\n'):
        line = line.strip()
        if not line or line.startswith('//'):
            continue
        match = re.search(r"'([^']+)':\s*'([^']+)'", line)
        if match:
            era_id = match.group(1)
            title = match.group(2)
            era_map[era_id] = title

# catalog.jsonから、wakaruモードのindex_modular.htmlを使用しているレッスンを抽出
wakaru_lessons = []
for lesson in catalog:
    path = lesson.get('path', '')
    if 'lessons/sci/modular/wakaru/index_modular.html' in path and 'mode=wakaru' in path:
        wakaru_lessons.append({
            'id': lesson.get('id'),
            'title': lesson.get('title'),
            'grade': lesson.get('grade'),
            'subject': lesson.get('subject', 'sci')
        })

# 学年別・分野別にソート
wakaru_lessons.sort(key=lambda x: (x['grade'], x['id']))

# 結果を表示
print("# 全レッスンタイトル一覧\n")
print(f"総レッスン数: {len(wakaru_lessons)}件\n")

# 学年別にグループ化
by_grade = {}
for lesson in wakaru_lessons:
    grade = lesson['grade']
    if grade not in by_grade:
        by_grade[grade] = []
    by_grade[grade].append(lesson)

# 分野別に分類
def get_category(lesson_id):
    if 'biology' in lesson_id:
        return '生物'
    elif 'physics' in lesson_id:
        return '物理'
    elif 'chemistry' in lesson_id:
        return '化学'
    elif 'earth' in lesson_id:
        return '地学'
    elif 'comprehensive' in lesson_id:
        return '総合'
    else:
        return 'その他'

for grade in sorted(by_grade.keys()):
    print(f"## 小{grade}\n")
    
    # 分野別にグループ化
    by_category = {}
    for lesson in by_grade[grade]:
        category = get_category(lesson['id'])
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(lesson)
    
    # 分野ごとに表示
    category_order = ['生物', '物理', '化学', '地学', '総合', 'その他']
    for category in category_order:
        if category not in by_category:
            continue
        
        print(f"### {category}\n")
        for lesson in sorted(by_category[category], key=lambda x: x['id']):
            lesson_id = lesson['id']
            lesson_title = lesson['title']
            in_era_map = lesson_id in era_map
            title_match = in_era_map and era_map[lesson_id] == lesson_title
            
            # ステータス表示
            if not in_era_map:
                status = "[未登録]"
            elif not title_match:
                status = f"[不一致: eraMap='{era_map[lesson_id]}']"
            else:
                status = "[OK]"
            
            print(f"- {status} `{lesson_id}`")
            print(f"  - **{lesson_title}**")
            if not in_era_map:
                print(f"  - 追加コード: `'{lesson_id}': '{lesson_title}',`")
            elif not title_match:
                print(f"  - 修正コード: `'{lesson_id}': '{lesson_title}',`")
        print()

print("## 統計\n")
missing = [l for l in wakaru_lessons if l['id'] not in era_map]
mismatch = [l for l in wakaru_lessons if l['id'] in era_map and era_map[l['id']] != l['title']]
ok = [l for l in wakaru_lessons if l['id'] in era_map and era_map[l['id']] == l['title']]

print(f"- 総レッスン数: {len(wakaru_lessons)}件")
print(f"- eraMapに未登録: {len(missing)}件")
print(f"- タイトル不一致: {len(mismatch)}件")
print(f"- 正常: {len(ok)}件")

