#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
タイトル表示チェックリスト生成スクリプト
catalog.jsonのレッスンIDとindex_modular.htmlのeraMapを比較
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
if not era_map_match:
    print("eraMapが見つかりません")
    exit(1)

era_map_str = era_map_match.group(1)
era_map = {}

# eraMapの各エントリをパース
for line in era_map_str.split('\n'):
    line = line.strip()
    if not line or line.startswith('//'):
        continue
    # 'sci.xxx': 'タイトル', の形式を抽出
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
            'grade': lesson.get('grade')
        })

# チェックリストを作成
print("# タイトル表示チェックリスト\n")
print("## 概要")
print(f"- catalog.jsonに登録されているwakaruモードのレッスン数: {len(wakaru_lessons)}")
print(f"- eraMapに登録されているレッスン数: {len(era_map)}")
print()

# カテゴリ別にチェック
missing_in_era_map = []
found_in_era_map = []

for lesson in wakaru_lessons:
    lesson_id = lesson['id']
    lesson_title = lesson['title']
    grade = lesson['grade']
    
    if lesson_id in era_map:
        found_in_era_map.append({
            'id': lesson_id,
            'title': lesson_title,
            'era_map_title': era_map[lesson_id],
            'grade': grade,
            'match': lesson_title == era_map[lesson_id]
        })
    else:
        missing_in_era_map.append({
            'id': lesson_id,
            'title': lesson_title,
            'grade': grade
        })

# 結果を表示
print("## [NG] eraMapに登録されていないレッスン（タイトルが表示されない）\n")
if missing_in_era_map:
    for lesson in missing_in_era_map:
        print(f"- [ ] `{lesson['id']}` - **{lesson['title']}** (小{lesson['grade']})")
        print(f"  - 追加が必要: `'{lesson['id']}': '{lesson['title']}',`")
    print()
else:
    print("[OK] すべてのレッスンがeraMapに登録されています\n")

print("## [OK] eraMapに登録されているレッスン\n")
if found_in_era_map:
    # タイトルが一致しないものを先に表示
    title_mismatch = [l for l in found_in_era_map if not l['match']]
    title_match = [l for l in found_in_era_map if l['match']]
    
    if title_mismatch:
        print("### [WARN] タイトルが一致しないレッスン\n")
        for lesson in title_mismatch:
            print(f"- [ ] `{lesson['id']}`")
            print(f"  - catalog.json: **{lesson['title']}**")
            print(f"  - eraMap: **{lesson['era_map_title']}**")
            print(f"  - 修正が必要")
        print()
    
    if title_match:
        print(f"### [OK] タイトルが一致しているレッスン ({len(title_match)}件)\n")
        # 学年別にグループ化
        by_grade = {}
        for lesson in title_match:
            grade = lesson['grade']
            if grade not in by_grade:
                by_grade[grade] = []
            by_grade[grade].append(lesson)
        
        for grade in sorted(by_grade.keys()):
            print(f"#### 小{grade}\n")
            for lesson in sorted(by_grade[grade], key=lambda x: x['id']):
                print(f"- [x] `{lesson['id']}` - {lesson['title']}")
            print()

print("## 統計\n")
print(f"- eraMapに登録されていない: {len(missing_in_era_map)}件")
print(f"- タイトルが一致しない: {len([l for l in found_in_era_map if not l['match']])}件")
print(f"- 正常: {len([l for l in found_in_era_map if l['match']])}件")

