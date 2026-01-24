#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
組み込み結果を検証する
"""

import os
import re
from pathlib import Path

# 問題項目とレッスンのマッピング（integrate_questions.pyと同じ）
QUESTION_TO_LESSON = {
    "物理": {
        "電流計の針": {
            "oboeru": "physics_current_voltage_circuit_oboeru.js",
            "wakaru": "physics_current_voltage_circuit.js"
        },
        "加熱中の水が動く理由": {
            "oboeru": "physics_heat_properties_oboeru.js",
            "wakaru": "physics_heat_properties.js"
        }
    },
    "化学": {
        "アルカリ性の水溶液": {
            "wakaru": "chemistry_solution_integrated.js"
        },
        "水溶液の性質・識別": {
            "wakaru": "chemistry_solution_integrated.js"
        }
    },
    "生物": {
        "変温動物": {
            "wakaru": "biology_animal_classification.js"
        },
        "外骨格": {
            "wakaru": "biology_bones_muscles_senses.js"
        },
        "陰性植物の例": {
            "wakaru": "biology_plants_growth_light.js"
        },
        "二酸化炭素を多く含む血液": {
            "wakaru": "biology_heart_blood_circulation.js"
        },
        "血液循環と成分変化": {
            "wakaru": "biology_heart_blood_circulation.js"
        }
    },
    "地学": {
        "月の模様が変わらない理由": {
            "wakaru": "earth_moon_movement.js"
        },
        "日の出の方角・季節": {
            "wakaru": "earth_sun_movement.js"
        },
        "翌日の月の位置": {
            "wakaru": "earth_moon_movement.js"
        },
        "地軸の傾きと太陽の動き": {
            "wakaru": "earth_sun_movement.js"
        },
        "月の満ち欠け周期": {
            "wakaru": "earth_moon_movement.js"
        },
        "地層を構成する岩石": {
            "wakaru": "earth_strata_formation.js"
        },
        "地層の堆積順": {
            "wakaru": "earth_strata_formation.js"
        }
    }
}

# 期待される問題のキーワード
EXPECTED_KEYWORDS = {
    "電流計の針": ["電流計の針が右に振れる", "電流計の針が0の位置", "電流計の針の読み方"],
    "加熱中の水が動く理由": ["水を加熱すると", "対流", "あたためられた水が上に移動"],
    "アルカリ性の水溶液": ["アルカリ性の水溶液の性質", "アンモニア水、石灰水", "BTB液を加えると"],
    "水溶液の性質・識別": ["複数の水溶液を識別", "蒸発皿に入れて加熱", "アンモニア水と食塩水"],
    "変温動物": ["変温動物とは", "カエル、トカゲ、メダカ", "恒温動物とは"],
    "外骨格": ["外骨格とは", "こん虫、クモ、エビ、カニ", "内骨格とは"],
    "陰性植物の例": ["陰性植物とは", "シイ、カシ、シダ", "陽性植物とは"],
    "二酸化炭素を多く含む血液": ["二酸化炭素を多く含む血液", "静脈血", "動脈血"],
    "血液循環と成分変化": ["血液が肺を通るとき", "血液が全身の組織を通るとき", "動脈血と静脈血"],
    "月の模様が変わらない理由": ["月の表面の模様が常に同じ", "自転周期と公転周期", "同期自転"],
    "日の出の方角・季節": ["夏至の日の日の出", "冬至の日の日の出", "春分・秋分の日の日の出"],
    "翌日の月の位置": ["毎日同じ時刻に月を観察", "月の南中時刻", "月が1日に移動する角度"],
    "地軸の傾きと太陽の動き": ["地軸の傾きは約", "季節の変化、太陽高度の変化", "夏至の日の太陽の南中高度"],
    "月の満ち欠け周期": ["月の満ち欠けの周期は約", "公転周期より長い理由", "月の公転周期は約"],
    "地層を構成する岩石": ["れきが固まってできる岩石", "砂が固まってできる岩石", "どろが固まってできる岩石"],
    "地層の堆積順": ["地層の新旧を判断", "かぎ層", "火山灰の層"]
}

def check_file_exists(filepath):
    """ファイルの存在確認"""
    return os.path.exists(filepath)

def check_questions_in_file(filepath, keywords):
    """ファイル内に問題が含まれているか確認"""
    if not os.path.exists(filepath):
        return False, "ファイルが存在しません"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        found_keywords = []
        missing_keywords = []
        
        for keyword in keywords:
            if keyword in content:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        if len(found_keywords) == len(keywords):
            return True, f"すべてのキーワードが見つかりました ({len(keywords)}/{len(keywords)})"
        else:
            return False, f"一部のキーワードが見つかりません ({len(found_keywords)}/{len(keywords)}): {missing_keywords}"
    except Exception as e:
        return False, f"エラー: {e}"

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    print("=" * 80)
    print("組み込み結果の検証")
    print("=" * 80)
    print()
    
    total_items = 0
    success_items = 0
    failed_items = []
    
    for field, items in QUESTION_TO_LESSON.items():
        print(f"【{field}分野】")
        print("-" * 80)
        
        for item_name, lesson_map in items.items():
            total_items += 1
            keywords = EXPECTED_KEYWORDS.get(item_name, [])
            
            print(f"\n■ {item_name}")
            
            # oboeru版の確認
            if "oboeru" in lesson_map:
                oboeru_file = base_dir / "oboeru" / lesson_map["oboeru"]
                if check_file_exists(str(oboeru_file)):
                    found, msg = check_questions_in_file(str(oboeru_file), keywords)
                    if found:
                        print(f"  [OK] oboeru: {os.path.basename(oboeru_file)} - {msg}")
                        success_items += 1
                    else:
                        print(f"  [NG] oboeru: {os.path.basename(oboeru_file)} - {msg}")
                        failed_items.append((field, item_name, "oboeru", str(oboeru_file), msg))
                else:
                    print(f"  [ERROR] oboeru: ファイルが見つかりません - {oboeru_file}")
                    failed_items.append((field, item_name, "oboeru", str(oboeru_file), "ファイルが存在しません"))
            
            # wakaru版の確認
            if "wakaru" in lesson_map:
                wakaru_file = base_dir / "wakaru" / lesson_map["wakaru"]
                if check_file_exists(str(wakaru_file)):
                    found, msg = check_questions_in_file(str(wakaru_file), keywords)
                    if found:
                        print(f"  [OK] wakaru: {os.path.basename(wakaru_file)} - {msg}")
                        success_items += 1
                    else:
                        print(f"  [NG] wakaru: {os.path.basename(wakaru_file)} - {msg}")
                        failed_items.append((field, item_name, "wakaru", str(wakaru_file), msg))
                else:
                    print(f"  [ERROR] wakaru: ファイルが見つかりません - {wakaru_file}")
                    failed_items.append((field, item_name, "wakaru", str(wakaru_file), "ファイルが存在しません"))
        
        print()
    
    # サマリー
    print("=" * 80)
    print("【検証結果サマリー】")
    print("=" * 80)
    print(f"総項目数: {total_items}")
    print(f"成功: {success_items}")
    print(f"失敗: {len(failed_items)}")
    print()
    
    if failed_items:
        print("【失敗した項目】")
        for field, item_name, version, filepath, msg in failed_items:
            print(f"  - {field} / {item_name} ({version}): {os.path.basename(filepath)}")
            print(f"    理由: {msg}")
    else:
        print("すべての項目が正常に組み込まれています！")

if __name__ == "__main__":
    main()

