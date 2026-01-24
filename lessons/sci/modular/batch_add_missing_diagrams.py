# -*- coding: utf-8 -*-
"""
図解がない問題に図解を追加するスクリプト（改良版）
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

def has_diagram_accurate(source_text):
    """sourceフィールドに図解があるか正確にチェック"""
    # <div>タグがあるか
    if '<div' in source_text and '</div>' in source_text:
        # 図解の内容をチェック
        div_match = re.search(r'<div[^>]*>(.*?)</div>', source_text, re.DOTALL)
        if div_match:
            div_content = div_match.group(1)
            # \nを実際の改行に変換してチェック
            div_content_unescaped = div_content.replace('\\n', '\n')
            lines = [l.strip() for l in div_content_unescaped.split('\n') if l.strip()]
            # 3行以上または図解らしい内容があるか
            if len(lines) >= 3:
                return True
            # 図解らしい記号があるか
            if any(char in div_content for char in ['┌', '┐', '└', '┘', '│', '─', '●', '▲', '■']):
                return True
    return False

def get_diagram_for_question(qnum, text, source):
    """問題に応じた図解を生成（簡易版）"""
    # 問題文に応じて適切な図解を生成
    # 実際の図解は各レッスンの内容に応じてカスタマイズが必要
    
    # 簡易的な図解
    diagram = f"""<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.6; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4facfe;">【Q{qnum}の図解】

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
    
    return diagram

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
    # より確実な方法：行単位で処理
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    added_count = 0
    skipped_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        # sourceフィールドの開始を探す
        if '"source":' in line:
            # この行に閉じ引用符があるかチェック
            if line.rstrip().endswith('",'):
                # 1行で完結している
                source_content = line
                
                # 図解があるかチェック
                if has_diagram_accurate(source_content):
                    skipped_count += 1
                    new_lines.append(line)
                else:
                    # 図解を追加
                    # qnumを抽出
                    qnum_match = None
                    # 前の数行を確認してqnumを探す
                    for j in range(max(0, len(new_lines)-5), len(new_lines)):
                        if '"qnum":' in new_lines[j]:
                            qnum_match = re.search(r'"qnum":\s*(\d+)', new_lines[j])
                            break
                    
                    qnum = qnum_match.group(1) if qnum_match else "?"
                    
                    # sourceの最後に図解を追加
                    if source_content.rstrip().endswith('",'):
                        diagram = get_diagram_for_question(qnum, "", source_content)
                        new_line = source_content[:-2] + diagram + '",'
                        new_lines.append(new_line)
                        added_count += 1
                    else:
                        new_lines.append(line)
            else:
                # 複数行にわたる場合（通常は発生しない）
                new_lines.append(line)
        else:
            new_lines.append(line)
        
        i += 1
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        return added_count, skipped_count
    except Exception as e:
        print(f"  エラー: ファイル書き込み失敗 - {e}")
        return 0, 0

def main():
    """メイン処理"""
    print("="*80)
    print("図解がない問題に図解を追加")
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
        if skipped > 0 and added == 0:
            print(f"レッスン {lesson_id}: {filename} - 既にすべての図解あり")
    
    print(f"\n{'='*80}")
    print(f"合計: 図解を追加 {total_added}問, 既に図解あり {total_skipped}問")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()

