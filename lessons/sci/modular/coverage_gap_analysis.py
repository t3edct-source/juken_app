#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教材でカバーできていない内容の特定分析
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def load_exam_data():
    """首都模試データを読み込む"""
    with open("fully_integrated_analysis_data.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_exam_topics(answer_rates):
    """模試の出題トピックを抽出"""
    topics = []
    for q in answer_rates:
        question_name = q.get("question_name", "")
        thinking = q.get("thinking", "")
        correct_rate = q.get("correct_rate", 0)
        field = classify_field(question_name)
        
        # キーワードを抽出
        keywords = extract_keywords(question_name)
        
        topics.append({
            "name": question_name,
            "field": field,
            "thinking": thinking,
            "correct_rate": correct_rate,
            "keywords": keywords
        })
    
    return topics

def classify_field(text):
    """分野を分類"""
    if any(kw in text for kw in ["電流", "電磁", "電熱", "てこ", "ばね", "ふりこ", "かっ車", "輪じく", 
                                "光", "レンズ", "熱", "伝導", "対流", "電気", "回路", "電圧", "磁界", 
                                "発熱", "電熱線", "力", "つり合い", "上昇温度", "湿度", "像", "雨量"]):
        return "物理"
    elif any(kw in text for kw in ["燃焼", "空気", "酸素", "水溶液", "溶け", "濃さ", "溶解度", 
                                  "塩酸", "石灰", "アンモニア", "気体", "水素", "金属", "中和",
                                  "硝酸", "飽和", "マグネシウム", "炭酸カルシウム", "塩化水素"]):
        return "化学"
    elif any(kw in text for kw in ["植物", "光合成", "動物", "体のつくり", "骨", "筋肉", "血液", 
                                  "消化", "呼吸", "心臓", "食物連鎖", "生態系", "ヒトの体",
                                  "変温", "恒温", "分類"]):
        return "生物"
    elif any(kw in text for kw in ["気温", "地温", "太陽", "季節", "地層", "化石", "川", "地震", 
                                  "プレート", "月", "満ち欠け", "火山", "地震波", "模様"]):
        return "地学"
    return "その他"

def extract_keywords(text):
    """キーワードを抽出"""
    keywords = []
    
    # 物理のキーワード
    physics_keywords = ["電流", "電磁石", "電熱線", "発熱", "てこ", "ばね", "ふりこ", "かっ車", 
                       "輪じく", "光", "レンズ", "直進", "屈折", "熱", "伝導", "対流", "回路",
                       "電圧", "磁界", "磁力", "上昇温度", "湿度", "像", "雨量", "複雑な回路",
                       "電流値", "寿命", "熱量", "計算"]
    
    # 化学のキーワード
    chemistry_keywords = ["燃焼", "空気", "酸素", "水溶液", "溶解度", "飽和", "濃さ", "塩酸",
                         "石灰", "アンモニア", "気体", "水素", "金属", "中和", "硝酸", 
                         "マグネシウム", "炭酸カルシウム", "塩化水素", "発生量", "計算"]
    
    # 生物のキーワード
    biology_keywords = ["植物", "光合成", "動物", "体のつくり", "骨", "筋肉", "血液", "消化",
                       "呼吸", "心臓", "食物連鎖", "生態系", "分類", "変温", "恒温"]
    
    # 地学のキーワード
    earth_keywords = ["気温", "地温", "太陽", "季節", "地層", "化石", "川", "地震", "プレート",
                     "月", "満ち欠け", "地震波", "模様", "計算"]
    
    all_keywords = physics_keywords + chemistry_keywords + biology_keywords + earth_keywords
    
    for kw in all_keywords:
        if kw in text:
            keywords.append(kw)
    
    return keywords

def analyze_textbook_content():
    """教材の内容を分析"""
    textbook_topics = defaultdict(list)
    
    # oboeruフォルダ
    for js_file in Path("oboeru").glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                filename = js_file.name
                field = classify_textbook_field(filename)
                
                # ファイル名からトピックを推測
                topic = extract_topic_from_filename(filename)
                
                textbook_topics[field].append({
                    "file": filename,
                    "type": "oboeru",
                    "topic": topic,
                    "content_preview": content[:1000]  # 最初の1000文字
                })
        except Exception as e:
            print(f"Error reading {js_file}: {e}")
    
    # wakaruフォルダ
    for js_file in Path("wakaru").glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                filename = js_file.name
                field = classify_textbook_field(filename)
                
                topic = extract_topic_from_filename(filename)
                
                textbook_topics[field].append({
                    "file": filename,
                    "type": "wakaru",
                    "topic": topic,
                    "content_preview": content[:1000]
                })
        except Exception as e:
            print(f"Error reading {js_file}: {e}")
    
    return textbook_topics

def classify_textbook_field(filename):
    """ファイル名から分野を分類"""
    filename_lower = filename.lower()
    if any(kw in filename_lower for kw in ["physics", "current", "voltage", "circuit", "magnetic", 
                                          "heating", "lever", "spring", "light", "heat", "force", 
                                          "motion", "pulley", "pendulum", "denki", "tenbin"]):
        return "物理"
    elif any(kw in filename_lower for kw in ["chemistry", "combustion", "air", "water", "solution", 
                                            "dissolution", "solubility", "neutralization", "gas"]):
        return "化学"
    elif any(kw in filename_lower for kw in ["biology", "plant", "animal", "human", "body", 
                                            "digestion", "respiration", "photosynthesis", "food", 
                                            "seeds", "germination", "growth"]):
        return "生物"
    elif any(kw in filename_lower for kw in ["earth", "weather", "sun", "moon", "earthquake", 
                                            "strata", "fossil", "river", "volcano", "constellation", 
                                            "season", "temperature"]):
        return "地学"
    return "その他"

def extract_topic_from_filename(filename):
    """ファイル名からトピックを抽出"""
    # ファイル名からトピックを推測
    filename_clean = filename.replace("_oboeru.js", "").replace(".js", "").replace("_", " ")
    
    # 主要なトピックマッピング
    topic_map = {
        "current_voltage_circuit": "電流と電圧・回路",
        "current_effect_heating": "電流の発熱作用",
        "current_effect_magnetic": "電流の磁界作用",
        "lever_weight": "てこのつり合い",
        "spring_force": "ばねと力",
        "light_properties": "光の性質",
        "heat_properties": "熱の性質",
        "combustion_air": "燃焼と空気",
        "water_three_states": "水の三態",
        "solubility_temperature": "溶解度と温度",
        "dissolution_solution": "溶解と水溶液",
        "plants_growth": "植物の成長",
        "human_body_digestion": "人体の消化",
        "earthquake_structure": "地震のしくみ",
        "sun_movement": "太陽の動き",
        "moon_movement": "月の動き"
    }
    
    for key, topic in topic_map.items():
        if key in filename.lower():
            return topic
    
    return filename_clean

def find_coverage_gaps(exam_topics, textbook_topics):
    """カバーされていない内容を特定"""
    gaps = defaultdict(list)
    
    # 分野別に分析
    for field in ["物理", "化学", "生物", "地学"]:
        field_exam_topics = [t for t in exam_topics if t["field"] == field]
        field_textbook_topics = textbook_topics.get(field, [])
        
        # 正答率が低い問題（50%未満）に焦点
        low_rate_topics = [t for t in field_exam_topics if t["correct_rate"] < 50]
        
        for exam_topic in low_rate_topics:
            # 教材でカバーされているかチェック
            covered = False
            matching_textbook = None
            
            for textbook in field_textbook_topics:
                # キーワードマッチング
                topic_keywords = exam_topic["keywords"]
                textbook_topic = textbook["topic"].lower()
                textbook_content = textbook["content_preview"].lower()
                
                # キーワードが教材に含まれているかチェック
                match_count = sum(1 for kw in topic_keywords if kw in textbook_topic or kw in textbook_content)
                
                if match_count >= 2:  # 2つ以上のキーワードが一致
                    covered = True
                    matching_textbook = textbook
                    break
            
            if not covered:
                gaps[field].append({
                    "topic": exam_topic["name"],
                    "correct_rate": exam_topic["correct_rate"],
                    "thinking": exam_topic["thinking"],
                    "keywords": exam_topic["keywords"]
                })
    
    return gaps

def generate_gap_report(gaps, exam_topics):
    """ギャップレポートを生成"""
    report = []
    report.append("=" * 100)
    report.append("教材でカバーできていない内容の分析レポート")
    report.append("=" * 100)
    report.append("")
    
    total_gaps = sum(len(topics) for topics in gaps.values())
    report.append(f"【概要】")
    report.append(f"正答率50%未満の問題のうち、教材でカバーされていない可能性が高い問題: {total_gaps}問")
    report.append("")
    
    for field in ["物理", "化学", "生物", "地学"]:
        field_gaps = gaps.get(field, [])
        if not field_gaps:
            continue
        
        report.append(f"\n【{field}分野】")
        report.append("-" * 100)
        report.append(f"カバーされていない可能性が高い問題数: {len(field_gaps)}問")
        report.append("")
        
        # 正答率順にソート
        field_gaps_sorted = sorted(field_gaps, key=lambda x: x["correct_rate"])
        
        report.append("主な未カバー内容（正答率が低い順）:")
        for i, gap in enumerate(field_gaps_sorted[:15], 1):
            report.append(f"  {i}. {gap['topic']}")
            report.append(f"     正答率: {gap['correct_rate']:.1f}% | 思考力: {gap['thinking']}")
            report.append(f"     キーワード: {', '.join(gap['keywords'][:5])}")
            report.append("")
    
    # 分野別の統計
    report.append("\n【分野別の統計】")
    report.append("-" * 100)
    for field in ["物理", "化学", "生物", "地学"]:
        field_exam_topics = [t for t in exam_topics if t["field"] == field]
        low_rate_count = len([t for t in field_exam_topics if t["correct_rate"] < 50])
        gap_count = len(gaps.get(field, []))
        
        if low_rate_count > 0:
            gap_ratio = gap_count / low_rate_count * 100
            report.append(f"{field}: {gap_count}/{low_rate_count}問 ({gap_ratio:.1f}%)")
    
    # 推奨事項
    report.append("\n\n【推奨事項】")
    report.append("-" * 100)
    
    for field in ["物理", "化学", "生物", "地学"]:
        field_gaps = gaps.get(field, [])
        if len(field_gaps) > 10:
            report.append(f"\n■ {field}分野")
            report.append(f"  未カバー問題が{len(field_gaps)}問と多いため、以下の内容の教材追加を推奨:")
            
            # キーワードの頻度を分析
            all_keywords = []
            for gap in field_gaps:
                all_keywords.extend(gap["keywords"])
            
            keyword_counts = {}
            for kw in all_keywords:
                keyword_counts[kw] = keyword_counts.get(kw, 0) + 1
            
            top_keywords = sorted(keyword_counts.items(), key=lambda x: -x[1])[:5]
            report.append(f"  頻出キーワード: {', '.join([kw for kw, _ in top_keywords])}")
    
    return "\n".join(report)

def main():
    print("カバーギャップ分析を実行しています...")
    
    # データ読み込み
    exam_data = load_exam_data()
    answer_rates = exam_data.get("answer_rates", {}).get("science_questions", [])
    
    # 分析
    print("模試のトピックを抽出しています...")
    exam_topics = extract_exam_topics(answer_rates)
    
    print("教材の内容を分析しています...")
    textbook_topics = analyze_textbook_content()
    
    print("カバーギャップを特定しています...")
    gaps = find_coverage_gaps(exam_topics, textbook_topics)
    
    # レポート生成
    print("レポートを生成しています...")
    report = generate_gap_report(gaps, exam_topics)
    
    # 保存
    with open("coverage_gap_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n" + report)
    print("\nカバーギャップレポートを 'coverage_gap_report.txt' に保存しました。")

if __name__ == "__main__":
    main()

