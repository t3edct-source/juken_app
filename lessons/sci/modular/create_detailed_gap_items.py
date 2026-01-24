#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
カバーギャップを具体的な問題項目に落とし込む
"""

import json
from collections import defaultdict

# 現在の教材レッスン名のマッピング
CURRENT_LESSONS = {
    "物理": {
        "oboeru": [
            "physics_weight_volume_basic_oboeru",
            "physics_electricity_conductivity_basic_oboeru",
            "physics_heat_properties_oboeru",
            "physics_current_voltage_circuit_oboeru",
            "physics_current_effect_heating_oboeru",
            "physics_current_effect_magnetic_oboeru",
            "physics_lever_weight_basic_oboeru",
            "physics_spring_force_oboeru",
            "physics_light_properties_oboeru",
            "physics_force_motion_oboeru"
        ],
        "wakaru": [
            "physics_weight_volume_basic",
            "physics_electricity_conductivity_basic",
            "physics_heat_properties",
            "physics_current_voltage_circuit",
            "physics_current_effect_heating",
            "physics_current_effect_magnetic",
            "physics_lever_weight_basic",
            "physics_spring_force_buoyancy_integrated",
            "physics_light_properties",
            "physics_light_reflection_refraction",
            "physics_pendulum_moving_weight_integrated",
            "physics_force_motion_pulley_integrated",
            "physics_current_circuit_integrated"
        ]
    },
    "化学": {
        "oboeru": [
            "chemistry_air_properties_oboeru",
            "chemistry_water_three_states_oboeru",
            "chemistry_combustion_air_oboeru",
            "chemistry_dissolution_solution_oboeru",
            "chemistry_solubility_temperature_oboeru"
        ],
        "wakaru": [
            "chemistry_air_combustion_integrated",
            "chemistry_water_state_integrated",
            "chemistry_solution_integrated",
            "chemistry_solubility_temperature",
            "chemistry_neutralization",
            "chemistry_solution_metal_reaction",
            "chemistry_various_gases"
        ]
    },
    "生物": {
        "oboeru": [
            "biology_seasons_living_things_summer_oboeru",
            "biology_plants_growth_light_oboeru",
            "biology_plants_observation_oboeru",
            "biology_food_chain_oboeru",
            "biology_human_body_digestion_respiration_oboeru",
            "biology_human_body_nervous_motion_oboeru"
        ],
        "wakaru": [
            "biology_seasons_living_things_summer",
            "biology_plants_growth_light",
            "biology_plants_observation",
            "biology_food_chain",
            "biology_human_body_digestion_respiration",
            "biology_human_body_nervous_motion",
            "biology_heart_blood_circulation",
            "biology_bones_muscles_senses",
            "biology_animal_classification"
        ]
    },
    "地学": {
        "oboeru": [
            "earth_constellations_seasons_oboeru",
            "earth_sun_movement_shadow_oboeru",
            "earth_weather_changes_oboeru",
            "earth_river_work_oboeru",
            "earth_volcano_structure_oboeru",
            "earth_earthquake_structure_oboeru",
            "earth_land_river_erosion_oboeru",
            "earth_clouds_fronts_weather_map_oboeru"
        ],
        "wakaru": [
            "earth_stars_constellations_integrated",
            "earth_sun_movement_shadow",
            "earth_sun_movement",
            "earth_moon_movement",
            "earth_weather_changes",
            "earth_river_work",
            "earth_volcano_structure_land_change_integrated",
            "earth_earthquake_structure",
            "earth_strata_formation",
            "earth_clouds_fronts_weather_map"
        ]
    }
}

# 未カバー内容を問題項目として整理
GAP_ITEMS = {
    "物理": [
        {
            "問題項目": "雨量ますの目盛り",
            "正答率": 1.3,
            "思考力": "B1",
            "関連レッスン": "earth_weather_changes (天気の変化)",
            "推奨追加レッスン": "physics_weather_measurement (気象観測機器)",
            "問題内容": "雨量計の目盛りの読み取りと計算"
        },
        {
            "問題項目": "複雑な回路の寿命",
            "正答率": 2.2,
            "思考力": "B1",
            "関連レッスン": "physics_current_voltage_circuit (電流と電圧・回路)",
            "推奨追加レッスン": "physics_complex_circuit_analysis (複雑な回路の分析)",
            "問題内容": "複数の豆電球や電池を含む複雑な回路での乾電池の寿命計算"
        },
        {
            "問題項目": "湿度の応用問題",
            "正答率": 5.0,
            "思考力": "B2",
            "関連レッスン": "earth_weather_changes (天気の変化)",
            "推奨追加レッスン": "physics_humidity_calculation (湿度の計算)",
            "問題内容": "湿度、水蒸気量、飽和水蒸気量の関係を使った計算問題"
        },
        {
            "問題項目": "電流計の値",
            "正答率": 7.0,
            "思考力": "A3",
            "関連レッスン": "physics_current_voltage_circuit (電流と電圧・回路)",
            "推奨追加レッスン": "physics_ammeter_reading (電流計の読み取りと計算)",
            "問題内容": "複雑な回路での電流計の値の計算"
        },
        {
            "問題項目": "ピンホールによる像",
            "正答率": 10.0,
            "思考力": "A2",
            "関連レッスン": "physics_light_properties (光の性質)",
            "推奨追加レッスン": "physics_pinhole_image (ピンホールカメラの原理)",
            "問題内容": "ピンホールを通した光による像のでき方と大きさの計算"
        },
        {
            "問題項目": "湿度と水蒸気量",
            "正答率": 10.1,
            "思考力": "A3",
            "関連レッスン": "earth_weather_changes (天気の変化)",
            "推奨追加レッスン": "physics_humidity_calculation (湿度の計算)",
            "問題内容": "湿度と水蒸気量の関係の計算"
        },
        {
            "問題項目": "長さの変わるふりこ",
            "正答率": 11.0,
            "思考力": "B1",
            "関連レッスン": "physics_pendulum_moving_weight_integrated (ふりことおもりの運動)",
            "推奨追加レッスン": "physics_pendulum_variable_length (長さが変わるふりこ)",
            "問題内容": "ふりこの長さが変化する場合の周期の計算"
        },
        {
            "問題項目": "てこの原理（応用）",
            "正答率": 12.1,
            "思考力": "B1",
            "関連レッスン": "physics_lever_weight_basic (てこのつり合い)",
            "推奨追加レッスン": "physics_lever_advanced (てこの応用問題)",
            "問題内容": "複数の力点・作用点がある場合のてこのつり合い"
        },
        {
            "問題項目": "複数のばね",
            "正答率": 13.4,
            "思考力": "A2",
            "関連レッスン": "physics_spring_force_buoyancy_integrated (ばねと力・ばねと浮力)",
            "推奨追加レッスン": "physics_multiple_springs (複数のばねの組み合わせ)",
            "問題内容": "直列・並列につないだ複数のばねののびの計算"
        },
        {
            "問題項目": "電流計の針",
            "正答率": 17.2,
            "思考力": "B1",
            "関連レッスン": "physics_current_voltage_circuit (電流と電圧・回路)",
            "推奨追加レッスン": "physics_ammeter_reading (電流計の読み取りと計算)",
            "問題内容": "電流計の針の動きと電流値の関係"
        },
        {
            "問題項目": "像の動き",
            "正答率": 18.0,
            "思考力": "B1",
            "関連レッスン": "physics_light_properties (光の性質)",
            "推奨追加レッスン": "physics_image_movement (像の動きとレンズ)",
            "問題内容": "物体を動かしたときの像の動き方"
        },
        {
            "問題項目": "加熱中の水が動く理由",
            "正答率": 19.4,
            "思考力": "A2",
            "関連レッスン": "physics_heat_properties (熱の性質)",
            "推奨追加レッスン": "physics_convection_detail (対流の詳細)",
            "問題内容": "水を加熱したときの対流のしくみ"
        },
        {
            "問題項目": "電流計の値が最小",
            "正答率": 19.6,
            "思考力": "A2",
            "関連レッスン": "physics_current_voltage_circuit (電流と電圧・回路)",
            "推奨追加レッスン": "physics_complex_circuit_analysis (複雑な回路の分析)",
            "問題内容": "複雑な回路で電流計の値が最小になる条件"
        }
    ],
    "化学": [
        {
            "問題項目": "塩酸の体積と蒸発後残る固体",
            "正答率": 4.4,
            "思考力": "B2",
            "関連レッスン": "chemistry_solution_integrated (水溶液)",
            "推奨追加レッスン": "chemistry_acid_evaporation_calculation (酸の蒸発と固体の計算)",
            "問題内容": "塩酸を蒸発させたときに残る固体の量の計算"
        },
        {
            "問題項目": "銅の一部の燃焼",
            "正答率": 7.1,
            "思考力": "B1",
            "関連レッスン": "chemistry_air_combustion_integrated (空気と燃焼)",
            "推奨追加レッスン": "chemistry_metal_combustion_calculation (金属の燃焼計算)",
            "問題内容": "金属が一部だけ燃えた場合の質量変化の計算"
        },
        {
            "問題項目": "塩酸とアルミニウムの反応",
            "正答率": 10.0,
            "思考力": "B1",
            "関連レッスン": "chemistry_solution_metal_reaction (水溶液と金属の反応)",
            "推奨追加レッスン": "chemistry_acid_metal_reaction_calculation (酸と金属の反応計算)",
            "問題内容": "塩酸とアルミニウムの反応による水素発生量の計算"
        },
        {
            "問題項目": "アルカリ性の水溶液",
            "正答率": 27.9,
            "思考力": "A2",
            "関連レッスン": "chemistry_solution_integrated (水溶液)",
            "推奨追加レッスン": "chemistry_alkaline_solution_detail (アルカリ性水溶液の詳細)",
            "問題内容": "アルカリ性水溶液の性質と識別"
        },
        {
            "問題項目": "水溶液の性質・識別",
            "正答率": 28.1,
            "思考力": "A2",
            "関連レッスン": "chemistry_solution_integrated (水溶液)",
            "推奨追加レッスン": "chemistry_solution_identification (水溶液の識別実験)",
            "問題内容": "複数の水溶液を識別する実験方法"
        },
        {
            "問題項目": "中和",
            "正答率": 30.7,
            "思考力": "B1",
            "関連レッスン": "chemistry_neutralization (中和)",
            "推奨追加レッスン": "chemistry_neutralization_calculation (中和の計算)",
            "問題内容": "中和反応の計算問題"
        }
    ],
    "生物": [
        {
            "問題項目": "変温動物",
            "正答率": 7.3,
            "思考力": "A2",
            "関連レッスン": "biology_animal_classification (動物の分類)",
            "推奨追加レッスン": "biology_animal_body_temperature (変温動物と恒温動物)",
            "問題内容": "変温動物と恒温動物の区別と具体例"
        },
        {
            "問題項目": "血液が1日で体内をめぐる数",
            "正答率": 11.0,
            "思考力": "B1",
            "関連レッスン": "biology_heart_blood_circulation (心臓と血液循環)",
            "推奨追加レッスン": "biology_blood_circulation_calculation (血液循環の計算)",
            "問題内容": "血液循環の速度と1日の循環回数の計算"
        },
        {
            "問題項目": "外骨格",
            "正答率": 19.1,
            "思考力": "A1",
            "関連レッスン": "biology_bones_muscles_senses (骨と筋肉と感覚)",
            "推奨追加レッスン": "biology_skeleton_types (内骨格と外骨格)",
            "問題内容": "内骨格と外骨格の違いと具体例"
        },
        {
            "問題項目": "陰性植物の例",
            "正答率": 25.8,
            "思考力": "B1",
            "関連レッスン": "biology_plants_growth_light (植物の成長)",
            "推奨追加レッスン": "biology_plant_light_requirement (陽性植物と陰性植物)",
            "問題内容": "光の強さに対する植物の分類"
        },
        {
            "問題項目": "二酸化炭素を多く含む血液",
            "正答率": 29.8,
            "思考力": "A2",
            "関連レッスン": "biology_heart_blood_circulation (心臓と血液循環)",
            "推奨追加レッスン": "biology_blood_component_change (血液成分の変化)",
            "問題内容": "血液循環による血液成分の変化"
        },
        {
            "問題項目": "血液循環と成分変化",
            "正答率": 35.3,
            "思考力": "A1",
            "関連レッスン": "biology_heart_blood_circulation (心臓と血液循環)",
            "推奨追加レッスン": "biology_blood_component_change (血液成分の変化)",
            "問題内容": "血液循環による酸素と二酸化炭素の量の変化"
        },
        {
            "問題項目": "食物連鎖と個体数の増減",
            "正答率": 38.3,
            "思考力": "B2",
            "関連レッスン": "biology_food_chain (食物連鎖)",
            "推奨追加レッスン": "biology_food_chain_population (食物連鎖と個体数変化)",
            "問題内容": "食物連鎖における個体数の増減の関係"
        }
    ],
    "地学": [
        {
            "問題項目": "月の模様が変わらない理由",
            "正答率": 1.0,
            "思考力": "B1",
            "関連レッスン": "earth_moon_movement (月の動き)",
            "推奨追加レッスン": "earth_moon_rotation_revolution (月の自転と公転)",
            "問題内容": "月の自転周期と公転周期が等しいことの説明"
        },
        {
            "問題項目": "地震波の計算",
            "正答率": 4.2,
            "思考力": "B2",
            "関連レッスン": "earth_earthquake_structure (地震のしくみ)",
            "推奨追加レッスン": "earth_earthquake_wave_calculation (地震波の計算)",
            "問題内容": "P波とS波の速度を使った震源距離や発生時刻の計算"
        },
        {
            "問題項目": "日の出の方角・季節",
            "正答率": 12.0,
            "思考力": "B1",
            "関連レッスン": "earth_sun_movement (太陽の動き)",
            "推奨追加レッスン": "earth_sun_seasonal_movement (季節による太陽の動き)",
            "問題内容": "季節による日の出・日の入りの方角の変化"
        },
        {
            "問題項目": "翌日の月の位置",
            "正答率": 14.0,
            "思考力": "A1",
            "関連レッスン": "earth_moon_movement (月の動き)",
            "推奨追加レッスン": "earth_moon_daily_movement (月の日々の動き)",
            "問題内容": "毎日同じ時刻に観察した月の位置の変化"
        },
        {
            "問題項目": "地軸の傾きと太陽の動き",
            "正答率": 16.6,
            "思考力": "B1",
            "関連レッスン": "earth_sun_movement (太陽の動き)",
            "推奨追加レッスン": "earth_earth_axis_sun_movement (地軸の傾きと太陽高度)",
            "問題内容": "地軸の傾きが太陽高度や季節に与える影響"
        },
        {
            "問題項目": "月の満ち欠け周期",
            "正答率": 18.1,
            "思考力": "B1",
            "関連レッスン": "earth_moon_movement (月の動き)",
            "推奨追加レッスン": "earth_moon_phase_period (月の満ち欠けの周期)",
            "問題内容": "月の満ち欠けの周期（約29.5日）と公転周期の違い"
        },
        {
            "問題項目": "地層を構成する岩石",
            "正答率": 23.1,
            "思考力": "A2",
            "関連レッスン": "earth_strata_formation (地層の形成)",
            "推奨追加レッスン": "earth_strata_rock_types (地層と岩石の種類)",
            "問題内容": "れき、砂、どろからできる岩石の種類"
        },
        {
            "問題項目": "地層の堆積順",
            "正答率": 23.1,
            "思考力": "A2",
            "関連レッスン": "earth_strata_formation (地層の形成)",
            "推奨追加レッスン": "earth_strata_deposition_order (地層の堆積順序)",
            "問題内容": "地層の新旧の判断方法"
        }
    ]
}

def generate_detailed_gap_report():
    """詳細な問題項目レポートを生成"""
    report = []
    report.append("=" * 120)
    report.append("教材でカバーできていない内容 - 具体的な問題項目リスト")
    report.append("=" * 120)
    report.append("")
    report.append("【凡例】")
    report.append("  関連レッスン: 現在の教材で関連するレッスン名")
    report.append("  推奨追加レッスン: 新たに追加すべきレッスン名（提案）")
    report.append("")
    
    total_items = 0
    for field in ["物理", "化学", "生物", "地学"]:
        items = GAP_ITEMS[field]
        total_items += len(items)
        
        report.append(f"\n{'=' * 120}")
        report.append(f"【{field}分野】 - {len(items)}項目")
        report.append(f"{'=' * 120}")
        report.append("")
        
        for i, item in enumerate(items, 1):
            report.append(f"■ 項目 {i}: {item['問題項目']}")
            report.append(f"  正答率: {item['正答率']}% | 思考力レベル: {item['思考力']}")
            report.append(f"  現在の関連レッスン: {item['関連レッスン']}")
            report.append(f"  推奨追加レッスン: {item['推奨追加レッスン']}")
            report.append(f"  問題内容: {item['問題内容']}")
            report.append("")
    
    report.append(f"\n{'=' * 120}")
    report.append(f"【全体サマリー】")
    report.append(f"{'=' * 120}")
    report.append(f"総問題項目数: {total_items}項目")
    report.append("")
    
    for field in ["物理", "化学", "生物", "地学"]:
        items = GAP_ITEMS[field]
        report.append(f"{field}: {len(items)}項目")
    
    # 推奨追加レッスンの一覧
    report.append(f"\n{'=' * 120}")
    report.append("【推奨追加レッスン一覧】")
    report.append(f"{'=' * 120}")
    
    recommended_lessons = defaultdict(list)
    for field in ["物理", "化学", "生物", "地学"]:
        for item in GAP_ITEMS[field]:
            lesson = item['推奨追加レッスン']
            recommended_lessons[field].append(lesson)
    
    for field in ["物理", "化学", "生物", "地学"]:
        report.append(f"\n■ {field}分野")
        unique_lessons = list(set(recommended_lessons[field]))
        for lesson in sorted(unique_lessons):
            report.append(f"  - {lesson}")
    
    return "\n".join(report)

def main():
    print("詳細な問題項目レポートを生成しています...")
    report = generate_detailed_gap_report()
    
    # 保存
    with open("detailed_gap_items.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n" + report)
    print("\n詳細な問題項目レポートを 'detailed_gap_items.txt' に保存しました。")

if __name__ == "__main__":
    main()

