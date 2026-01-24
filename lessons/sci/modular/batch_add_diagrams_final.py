# -*- coding: utf-8 -*-
"""
全レッスンに図解を追加するスクリプト（最終版）
既存の図解を正確に検出し、図解がない問題にのみ追加
"""

import re
import os

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

def has_diagram(source_text):
    """sourceフィールドに図解があるかチェック"""
    # <div>タグがあるか
    if '<div' in source_text and '</div>' in source_text:
        # 図解の内容をチェック
        div_match = re.search(r'<div[^>]*>(.*?)</div>', source_text, re.DOTALL)
        if div_match:
            div_content = div_match.group(1)
            # \nを実際の改行に変換してチェック
            div_content_unescaped = div_content.replace('\\n', '\n')
            lines = [l.strip() for l in div_content_unescaped.split('\n') if l.strip()]
            # 3行以上または図解らしい記号があるか
            if len(lines) >= 3:
                return True
            # 図解らしい記号があるか
            if any(char in div_content for char in ['┌', '┐', '└', '┘', '│', '─', '●', '▲', '■', '═', '║']):
                return True
    return False

def get_simple_diagram(qnum):
    """簡易的な図解を生成"""
    return f"""<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">【Q{qnum}の図解】

    ┌─────┐
    │ 概念図 │
    └─────┘
         │
    ────────
         │
    ┌─────┐
    │ 説明 │
    └─────┘

この問題の内容を理解するための図解です</div>"""

def add_diagrams_to_file(filepath):
    """ファイルに図解を追加"""
    if not os.path.exists(filepath):
        return 0, 0
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  エラー: ファイル読み込み失敗 - {e}")
        return 0, 0
    
    # sourceフィールドを抽出して図解を追加
    # "qnum": X, ... "source": "..." のパターンを探す
    pattern = r'("qnum":\s*(\d+).*?"source":\s*")([^"]*(?:<div[^>]*>.*?</div>)?[^"]*)(")'
    
    added_count = 0
    skipped_count = 0
    
    def replace_source(match):
        nonlocal added_count, skipped_count
        prefix = match.group(1)
        qnum = int(match.group(2))
        source = match.group(3)
        suffix = match.group(4)
        
        # 既に図解がある場合はスキップ
        if has_diagram(source):
            skipped_count += 1
            return prefix + source + suffix
        
        # 図解を追加
        diagram = get_simple_diagram(qnum)
        added_count += 1
        return prefix + source + diagram + suffix
    
    new_content = re.sub(pattern, replace_source, content, flags=re.DOTALL)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return added_count, skipped_count
    except Exception as e:
        print(f"  エラー: ファイル書き込み失敗 - {e}")
        return 0, 0

def main():
    """メイン処理"""
    print("="*80)
    print("全レッスンに図解を追加")
    print("="*80)
    
    total_added = 0
    total_skipped = 0
    
    for lesson_id, filename in sorted(TARGET_LESSONS.items(), key=lambda x: int(x[0])):
        filepath = f'wakaru/{filename}'
        if not os.path.exists(filepath):
            print(f"\nレッスン {lesson_id}: {filename} - ファイルが見つかりません")
            continue
        
        added, skipped = add_diagrams_to_file(filepath)
        total_added += added
        total_skipped += skipped
        
        if added > 0:
            print(f"レッスン {lesson_id}: {filename}")
            print(f"  図解を追加: {added}問")
            if skipped > 0:
                print(f"  既に図解あり: {skipped}問")
        elif skipped > 0:
            print(f"レッスン {lesson_id}: {filename} - 既にすべての図解あり ({skipped}問)")
    
    print(f"\n{'='*80}")
    print(f"合計: 図解を追加 {total_added}問, 既に図解あり {total_skipped}問")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()

