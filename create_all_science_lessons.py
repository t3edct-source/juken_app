#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
from pathlib import Path

# catalog.jsonを読み込む
with open('catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# 理科レッスンを抽出
sci_lessons = [e for e in catalog if e['subject'] == 'sci']
oboeru_lessons = [e for e in catalog if e['subject'] == 'science_drill']

print(f'📚 理科レッスン: {len(sci_lessons)}個 (わかる編)')
print(f'📝 覚える編レッスン: {len(oboeru_lessons)}個')

# テンプレート
oboeru_template = """window.questions = [
  // 問題データをここに追加してください
];"""

wakaru_template = """window.questions = [
  // 問題データをここに追加してください
];"""

# ディレクトリを作成
oboeru_dir = Path('lessons/sci/modular/oboeru')
wakaru_dir = Path('lessons/sci/modular/wakaru')
oboeru_dir.mkdir(parents=True, exist_ok=True)
wakaru_dir.mkdir(parents=True, exist_ok=True)

# IDからファイル名を生成
def id_to_filename(lesson_id):
    return lesson_id.replace('sci.', '').replace('.', '_')

# 覚える編の.jsファイルを作成
oboeru_created = 0
oboeru_skipped = 0
for lesson in oboeru_lessons:
    filename = f"{id_to_filename(lesson['id'])}.js"
    filepath = oboeru_dir / filename
    
    if not filepath.exists():
        filepath.write_text(oboeru_template, encoding='utf-8')
        oboeru_created += 1
    else:
        oboeru_skipped += 1

# わかる編の.jsファイルを作成
wakaru_created = 0
wakaru_skipped = 0
for lesson in sci_lessons:
    filename = f"{id_to_filename(lesson['id'])}.js"
    filepath = wakaru_dir / filename
    
    if not filepath.exists():
        filepath.write_text(wakaru_template, encoding='utf-8')
        wakaru_created += 1
    else:
        wakaru_skipped += 1

print(f'\n✅ 覚える編: {oboeru_created}個作成, {oboeru_skipped}個スキップ')
print(f'✅ わかる編: {wakaru_created}個作成, {wakaru_skipped}個スキップ')

# loader.jsを更新
oboeru_loader_path = oboeru_dir / 'loader.js'
oboeru_loader_content = oboeru_loader_path.read_text(encoding='utf-8')

# mapオブジェクトの終わりを見つける
map_end = oboeru_loader_content.find('  };')
if map_end > 0:
    before_map = oboeru_loader_content[:map_end]
    after_map = oboeru_loader_content[map_end:]
    
    # 新しいマッピングを生成
    new_mappings = []
    for lesson in oboeru_lessons:
        filename = id_to_filename(lesson['id'])
        new_mappings.append(f"    '{lesson['id']}': '{filename}.js',")
    
    oboeru_loader_content = before_map + '\n' + '\n'.join(new_mappings) + '\n' + after_map
    oboeru_loader_path.write_text(oboeru_loader_content, encoding='utf-8')
    print('✅ oboeru/loader.jsを更新しました')

# wakaru/loader.jsを更新
wakaru_loader_path = wakaru_dir / 'loader.js'
wakaru_loader_content = wakaru_loader_path.read_text(encoding='utf-8')

map_end = wakaru_loader_content.find('  };')
if map_end > 0:
    before_map = wakaru_loader_content[:map_end]
    after_map = wakaru_loader_content[map_end:]
    
    new_mappings = []
    for lesson in sci_lessons:
        filename = id_to_filename(lesson['id'])
        new_mappings.append(f"    '{lesson['id']}': '{filename}.js',")
    
    wakaru_loader_content = before_map + '\n' + '\n'.join(new_mappings) + '\n' + after_map
    wakaru_loader_path.write_text(wakaru_loader_content, encoding='utf-8')
    print('✅ wakaru/loader.jsを更新しました')

# index_modular.htmlを更新
oboeru_index_path = oboeru_dir / 'index_modular.html'
oboeru_index_content = oboeru_index_path.read_text(encoding='utf-8')

era_map_end = oboeru_index_content.find('    };')
if era_map_end > 0:
    before_era_map = oboeru_index_content[:era_map_end]
    after_era_map = oboeru_index_content[era_map_end:]
    
    new_era_mappings = []
    for lesson in oboeru_lessons:
        new_era_mappings.append(f"      '{lesson['id']}': '{lesson['title']}',")
    
    oboeru_index_content = before_era_map + '\n' + '\n'.join(new_era_mappings) + '\n' + after_era_map
    oboeru_index_path.write_text(oboeru_index_content, encoding='utf-8')
    print('✅ oboeru/index_modular.htmlを更新しました')

# wakaru/index_modular.htmlを更新（社会のマッピングを削除して理科用だけにする）
wakaru_index_path = wakaru_dir / 'index_modular.html'
wakaru_index_content = wakaru_index_path.read_text(encoding='utf-8')

# eraMapの開始と終了を見つける
era_map_start = wakaru_index_content.find('const eraMap = {')
era_map_end = wakaru_index_content.find('    };', era_map_start)

if era_map_start > 0 and era_map_end > 0:
    before_era_map = wakaru_index_content[:era_map_start + len('const eraMap = {')]
    after_era_map = wakaru_index_content[era_map_end:]
    
    # 理科用のマッピングのみを生成
    new_era_mappings = []
    for lesson in sci_lessons:
        new_era_mappings.append(f"      '{lesson['id']}': '{lesson['title']}',")
    
    wakaru_index_content = before_era_map + '\n' + '\n'.join(new_era_mappings) + '\n' + after_era_map
    wakaru_index_path.write_text(wakaru_index_content, encoding='utf-8')
    print('✅ wakaru/index_modular.htmlを更新しました（社会のマッピングを削除）')

# catalog.jsonのpathを更新
catalog_updated = 0
for entry in catalog:
    if entry['subject'] in ['sci', 'science_drill']:
        old_path = entry['path']
        if 'modular' not in old_path:
            if entry['subject'] == 'sci':
                entry['path'] = f"lessons/sci/modular/wakaru/index_modular.html?era={entry['id']}&mode=wakaru"
            elif entry['subject'] == 'science_drill':
                entry['path'] = f"lessons/sci/modular/oboeru/index_modular.html?era={entry['id']}&mode=oboeru"
            catalog_updated += 1

with open('catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
    f.write('\n')

print(f'✅ catalog.jsonのpathを{catalog_updated}個更新しました')
print('\n🎉 全レッスンの基本構造作成完了！')

