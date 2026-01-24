# -*- coding: utf-8 -*-
"""
図解の有無を正確にチェックするスクリプト
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

def check_diagrams_accurate(filepath):
    """図解の有無を正確にチェック"""
    if not os.path.exists(filepath):
        return {}
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {}
    
    diagrams = {}
    
    # 各問題を抽出
    # "qnum": X から次の問題まで
    pattern = r'"qnum":\s*(\d+).*?"source":\s*"([^"]+)"'
    
    matches = re.finditer(pattern, content, re.DOTALL)
    for match in matches:
        qnum = int(match.group(1))
        source = match.group(2)
        
        # <div>タグがあるかチェック（エスケープされた文字列内も含む）
        has_diagram = False
        if '<div' in source and '</div>' in source:
            # 図解の内容をチェック
            div_match = re.search(r'<div[^>]*>(.*?)</div>', source, re.DOTALL)
            if div_match:
                div_content = div_match.group(1)
                # 改行や文字が3行以上あるか（\nでエスケープされたものも含む）
                # \nを実際の改行に変換してチェック
                div_content_unescaped = div_content.replace('\\n', '\n')
                lines = [l.strip() for l in div_content_unescaped.split('\n') if l.strip()]
                has_diagram = len(lines) >= 3
        
        diagrams[qnum] = has_diagram
    
    return diagrams

def main():
    """メイン処理"""
    print("="*80)
    print("図解の有無を正確にチェック")
    print("="*80)
    
    for lesson_id, filename in sorted(TARGET_LESSONS.items(), key=lambda x: int(x[0])):
        filepath = f'wakaru/{filename}'
        diagrams = check_diagrams_accurate(filepath)
        
        if not diagrams:
            print(f"\nレッスン {lesson_id}: {filename} - 問題が見つかりません")
            continue
        
        with_diagram = sum(1 for d in diagrams.values() if d)
        without_diagram = len(diagrams) - with_diagram
        
        print(f"\nレッスン {lesson_id}: {filename}")
        print(f"  図解あり: {with_diagram}問")
        print(f"  図解なし: {without_diagram}問")
        
        if without_diagram > 0:
            missing = [qnum for qnum, has_diag in diagrams.items() if not has_diag]
            print(f"  図解なしの問題: Q{missing[:10]}{'...' if len(missing) > 10 else ''}")

if __name__ == '__main__':
    main()

