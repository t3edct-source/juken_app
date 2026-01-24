#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首都模試データと理科教材データの詳細比較分析スクリプト
"""

import json
import re
from collections import defaultdict, Counter
from pathlib import Path

def load_exam_data():
    """首都模試データを読み込む"""
    with open("fully_integrated_analysis_data.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_detailed_topics(answer_rates):
    """詳細なトピック分析"""
    topics_by_field = defaultdict(list)
    topics_by_thinking = defaultdict(list)
    topics_by_difficulty = defaultdict(list)
    
    for q in answer_rates:
        question_name = q.get("question_name", "")
        field = classify_question_field(question_name)
        thinking = q.get("thinking", "")
        correct_rate = q.get("correct_rate", 0)
        
        topics_by_field[field].append({
            "name": question_name,
            "thinking": thinking,
            "correct_rate": correct_rate
        })
        
        topics_by_thinking[thinking].append({
            "name": question_name,
            "field": field,
            "correct_rate": correct_rate
        })
        
        if correct_rate < 40:
            difficulty = "難"
        elif correct_rate < 60:
            difficulty = "中"
        elif correct_rate < 80:
            difficulty = "易"
        else:
            difficulty = "基礎"
        
        topics_by_difficulty[difficulty].append({
            "name": question_name,
            "field": field,
            "thinking": thinking,
            "correct_rate": correct_rate
        })
    
    return topics_by_field, topics_by_thinking, topics_by_difficulty

def classify_question_field(question_name):
    """問題名から分野を分類"""
    if any(kw in question_name for kw in ["電流", "電磁", "電熱", "てこ", "ばね", "ふりこ", "かっ車", "輪じく", 
                                         "光", "レンズ", "熱", "伝導", "対流", "電気", "回路", "電圧", "磁界"]):
        return "物理"
    elif any(kw in question_name for kw in ["燃焼", "空気", "酸素", "水溶液", "溶け", "濃さ", "溶解度", 
                                           "塩酸", "石灰", "アンモニア", "気体", "水素", "金属", "中和"]):
        return "化学"
    elif any(kw in question_name for kw in ["植物", "光合成", "動物", "体のつくり", "骨", "筋肉", "血液", 
                                          "消化", "呼吸", "心臓", "食物連鎖", "生態系", "ヒトの体"]):
        return "生物"
    elif any(kw in question_name for kw in ["気温", "地温", "太陽", "季節", "地層", "化石", "川", "地震", 
                                           "プレート", "月", "満ち欠け", "火山"]):
        return "地学"
    return "その他"

def analyze_textbook_topics():
    """教材のトピックを分析"""
    topics = defaultdict(list)
    
    # oboeruフォルダ
    for js_file in Path("oboeru").glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        filename = js_file.name.replace("_oboeru.js", "").replace(".js", "")
        field = classify_textbook_field(filename)
        topics[field].append({
            "file": js_file.name,
            "type": "oboeru",
            "topic": filename
        })
    
    # wakaruフォルダ
    for js_file in Path("wakaru").glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        filename = js_file.name.replace(".js", "")
        field = classify_textbook_field(filename)
        topics[field].append({
            "file": js_file.name,
            "type": "wakaru",
            "topic": filename
        })
    
    return topics

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

def generate_detailed_report(exam_data):
    """詳細レポートを生成"""
    answer_rates = exam_data.get("answer_rates", {}).get("science_questions", [])
    
    topics_by_field, topics_by_thinking, topics_by_difficulty = analyze_detailed_topics(answer_rates)
    textbook_topics = analyze_textbook_topics()
    
    report = []
    report.append("=" * 100)
    report.append("首都模試データと理科教材データの詳細比較分析レポート")
    report.append("=" * 100)
    report.append("")
    
    # 1. 分野別の詳細分析
    report.append("【1. 分野別の詳細分析】")
    report.append("-" * 100)
    
    for field in ["物理", "化学", "生物", "地学"]:
        exam_topics = topics_by_field.get(field, [])
        textbook_files = textbook_topics.get(field, [])
        
        report.append(f"\n■ {field}")
        report.append(f"  模試出題数: {len(exam_topics)}問")
        report.append(f"  教材ファイル数: {len(textbook_files)}ファイル")
        
        # 正答率別の分布
        correct_rates = [t["correct_rate"] for t in exam_topics]
        if correct_rates:
            avg_rate = sum(correct_rates) / len(correct_rates)
            report.append(f"  平均正答率: {avg_rate:.1f}%")
            
            low_rate = len([r for r in correct_rates if r < 50])
            high_rate = len([r for r in correct_rates if r >= 80])
            report.append(f"  正答率50%未満: {low_rate}問 ({low_rate/len(correct_rates)*100:.1f}%)")
            report.append(f"  正答率80%以上: {high_rate}問 ({high_rate/len(correct_rates)*100:.1f}%)")
        
        # 思考力レベル別
        thinking_counts = Counter([t["thinking"] for t in exam_topics])
        report.append(f"  思考力レベル分布:")
        for level, count in sorted(thinking_counts.items()):
            report.append(f"    {level}: {count}問")
    
    # 2. 思考力レベル別の分析
    report.append("\n\n【2. 思考力レベル別の分析】")
    report.append("-" * 100)
    
    for thinking in ["A1", "A2", "A3", "B1", "B2"]:
        topics = topics_by_thinking.get(thinking, [])
        if not topics:
            continue
        
        report.append(f"\n■ {thinking}レベル")
        report.append(f"  出題数: {len(topics)}問")
        
        correct_rates = [t["correct_rate"] for t in topics]
        if correct_rates:
            avg_rate = sum(correct_rates) / len(correct_rates)
            report.append(f"  平均正答率: {avg_rate:.1f}%")
        
        # 分野別分布
        field_counts = Counter([t["field"] for t in topics])
        report.append(f"  分野別分布:")
        for field, count in sorted(field_counts.items(), key=lambda x: -x[1]):
            report.append(f"    {field}: {count}問")
    
    # 3. 難易度別の分析
    report.append("\n\n【3. 難易度別の分析】")
    report.append("-" * 100)
    
    for difficulty in ["基礎", "易", "中", "難"]:
        topics = topics_by_difficulty.get(difficulty, [])
        if not topics:
            continue
        
        report.append(f"\n■ {difficulty}問題")
        report.append(f"  出題数: {len(topics)}問")
        
        # 分野別分布
        field_counts = Counter([t["field"] for t in topics])
        report.append(f"  分野別分布:")
        for field, count in sorted(field_counts.items(), key=lambda x: -x[1]):
            report.append(f"    {field}: {count}問")
        
        # 思考力レベル分布
        thinking_counts = Counter([t["thinking"] for t in topics])
        report.append(f"  思考力レベル分布:")
        for level, count in sorted(thinking_counts.items()):
            report.append(f"    {level}: {count}問")
    
    # 4. 主要な出題トピック（分野別）
    report.append("\n\n【4. 分野別の主要出題トピック】")
    report.append("-" * 100)
    
    for field in ["物理", "化学", "生物", "地学"]:
        topics = topics_by_field.get(field, [])
        if not topics:
            continue
        
        report.append(f"\n■ {field}の主要トピック")
        
        # 正答率が低いトピック（難易度が高い）
        low_rate_topics = sorted([t for t in topics if t["correct_rate"] < 50], 
                                 key=lambda x: x["correct_rate"])[:10]
        if low_rate_topics:
            report.append(f"  正答率50%未満のトピック（難易度が高い）:")
            for i, t in enumerate(low_rate_topics, 1):
                report.append(f"    {i}. {t['name']} - 正答率: {t['correct_rate']:.1f}% (思考力: {t['thinking']})")
        
        # 正答率が高いトピック（基礎的な問題）
        high_rate_topics = sorted([t for t in topics if t["correct_rate"] >= 80], 
                                  key=lambda x: -x["correct_rate"])[:10]
        if high_rate_topics:
            report.append(f"  正答率80%以上のトピック（基礎的な問題）:")
            for i, t in enumerate(high_rate_topics, 1):
                report.append(f"    {i}. {t['name']} - 正答率: {t['correct_rate']:.1f}% (思考力: {t['thinking']})")
    
    # 5. 教材との対応分析
    report.append("\n\n【5. 教材との対応分析】")
    report.append("-" * 100)
    
    # 教材でカバーされているトピック
    covered_topics = set()
    for field, files in textbook_topics.items():
        for file_info in files:
            topic = file_info["topic"]
            covered_topics.add(topic.lower())
    
    # 模試で出題されたが教材でカバーされていない可能性のあるトピック
    report.append("\n■ 教材で重点的にカバーすべきトピック（正答率が低い問題）")
    report.append("-" * 100)
    
    all_low_rate_topics = []
    for field in ["物理", "化学", "生物", "地学"]:
        topics = topics_by_field.get(field, [])
        low_rate = [t for t in topics if t["correct_rate"] < 50]
        all_low_rate_topics.extend(low_rate)
    
    all_low_rate_topics.sort(key=lambda x: x["correct_rate"])
    
    report.append("正答率が低い問題トップ20（教材で重点的にカバーすべき内容）:")
    for i, t in enumerate(all_low_rate_topics[:20], 1):
        report.append(f"  {i}. {t['name']} ({t.get('field', '不明')}) - 正答率: {t['correct_rate']:.1f}% (思考力: {t['thinking']})")
    
    # 6. 推奨事項
    report.append("\n\n【6. 分析結果に基づく推奨事項】")
    report.append("-" * 100)
    
    # 分野別の推奨
    for field in ["物理", "化学", "生物", "地学"]:
        topics = topics_by_field.get(field, [])
        textbook_count = len(textbook_topics.get(field, []))
        
        if topics:
            low_rate_count = len([t for t in topics if t["correct_rate"] < 50])
            low_rate_ratio = low_rate_count / len(topics) * 100
            
            report.append(f"\n■ {field}")
            report.append(f"  模試出題数: {len(topics)}問")
            report.append(f"  教材ファイル数: {textbook_count}ファイル")
            report.append(f"  正答率50%未満の問題: {low_rate_count}問 ({low_rate_ratio:.1f}%)")
            
            if low_rate_ratio > 40:
                report.append(f"  → 推奨: 難易度の高い問題の教材を追加検討")
            if textbook_count / len(topics) < 0.2:
                report.append(f"  → 推奨: 教材ファイル数の増加を検討")
    
    return "\n".join(report)

def main():
    print("詳細分析を実行しています...")
    exam_data = load_exam_data()
    
    report = generate_detailed_report(exam_data)
    
    # レポートを保存
    with open("detailed_comparison_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n" + report)
    print("\n詳細レポートを 'detailed_comparison_report.txt' に保存しました。")

if __name__ == "__main__":
    main()

