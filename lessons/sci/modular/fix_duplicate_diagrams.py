# -*- coding: utf-8 -*-
"""
重複した図解を修正するスクリプト
<div style=\<div style="... という形式を修正
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

def fix_duplicate_diagrams(filepath):
    """重複した図解を修正"""
    if not os.path.exists(filepath):
        return 0
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  エラー: ファイル読み込み失敗 - {e}")
        return 0
    
    # 重複した図解を修正
    # <div style=\<div style="... という形式を修正
    pattern = r'<div style=\<div style="([^"]+)"([^>]*)>([^<]*)</div>"([^"]*)"([^>]*)>([^<]*)</div>'
    
    def replace_duplicate(match):
        # 2つ目の図解（既存の図解）を残す
        style1 = match.group(1)
        attr1 = match.group(2)
        content1 = match.group(3)
        style2 = match.group(4)
        attr2 = match.group(5)
        content2 = match.group(6)
        
        # 既存の図解を返す
        return f'<div style="{style2}"{attr2}>{content2}</div>'
    
    new_content = re.sub(pattern, replace_duplicate, content)
    
    # より確実な方法：簡易的な図解を削除
    # 【QXXの図解】という簡易的な図解を削除
    simple_diagram_pattern = r'<div style="[^"]*">【Q\d+の図解】[^<]*</div>'
    new_content = re.sub(simple_diagram_pattern, '', new_content)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return 1
    except Exception as e:
        print(f"  エラー: ファイル書き込み失敗 - {e}")
        return 0

def main():
    """メイン処理"""
    print("="*80)
    print("重複した図解を修正")
    print("="*80)
    
    fixed_count = 0
    
    for lesson_id, filename in sorted(TARGET_LESSONS.items(), key=lambda x: int(x[0])):
        filepath = f'wakaru/{filename}'
        if fix_duplicate_diagrams(filepath):
            fixed_count += 1
            print(f"レッスン {lesson_id}: {filename} - 修正完了")
    
    print(f"\n{'='*80}")
    print(f"修正完了: {fixed_count}ファイル")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()

