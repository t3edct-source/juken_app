#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首都模試データと理科教材データの比較分析スクリプト
"""

import json
import re
import os
from collections import defaultdict, Counter
from pathlib import Path

# 分野のキーワードマッピング
FIELD_KEYWORDS = {
    "物理": {
        "keywords": ["電流", "電磁石", "電熱線", "発熱", "てこ", "ばね", "ふりこ", "かっ車", "輪じく", 
                   "光", "レンズ", "直進", "屈折", "熱", "伝導", "対流", "力", "つり合い", "電気", 
                   "回路", "電圧", "豆電球", "かん電池", "磁界", "磁力", "電磁石", "発熱", "電熱線"],
        "files": ["physics", "denki", "current", "voltage", "circuit", "magnetic", "heating", 
                 "lever", "spring", "light", "heat", "force", "motion", "pulley", "pendulum"]
    },
    "化学": {
        "keywords": ["燃焼", "空気", "酸素", "二酸化炭素", "水溶液", "溶け方", "濃さ", "溶解度", 
                   "塩酸", "石灰水", "アンモニア", "水酸化ナトリウム", "気体", "水素", "金属", 
                   "さび", "酸化", "中和", "リトマス紙", "BTB液", "石灰石", "炭酸カルシウム"],
        "files": ["chemistry", "combustion", "air", "water", "solution", "dissolution", 
                 "solubility", "neutralization", "gas"]
    },
    "生物": {
        "keywords": ["植物", "光合成", "呼吸", "蒸散", "種子", "発芽", "成長", "花", "受粉", 
                   "動物", "体のつくり", "骨", "筋肉", "血液", "消化", "呼吸", "心臓", "肺", 
                   "食物連鎖", "生態系", "骨格", "内骨格", "外骨格", "関節", "臓器", "ヒトの体",
                   "消化液", "だ液", "胃液", "すい液", "タンパク質", "でんぷん", "脂肪"],
        "files": ["biology", "plant", "animal", "human", "body", "digestion", "respiration", 
                 "photosynthesis", "food", "chain", "seeds", "germination", "growth"]
    },
    "地学": {
        "keywords": ["気温", "地温", "太陽", "季節", "南中", "日の出", "日の入り", "地層", "化石", 
                   "川", "流れ", "しん食", "運ぱん", "たい積", "せん状地", "地震", "プレート", 
                   "断層", "月", "満ち欠け", "公転", "自転", "月食", "衛星", "火山", "火山灰",
                   "ボーリング", "かぎ層", "百葉箱", "太陽高度", "地じく", "夏至", "冬至"],
        "files": ["earth", "weather", "sun", "moon", "earthquake", "strata", "fossil", 
                 "river", "volcano", "constellation", "season", "temperature"]
    }
}

def load_exam_data(json_path):
    """首都模試データを読み込む"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def extract_questions_from_exam(data):
    """首都模試データから問題を抽出"""
    questions = []
    
    # PDFデータから問題を抽出
    for file_data in data.get("pdf_data", {}).get("files", []):
        for page in file_data.get("pages", []):
            text = page.get("text", "")
            # 問題番号で分割
            question_pattern = r'(\d+)\s+[^（]*'
            matches = re.finditer(question_pattern, text)
            for match in matches:
                questions.append({
                    "text": text[match.start():match.end()],
                    "file": file_data.get("file_name", ""),
                    "page": page.get("page", 0)
                })
    
    # 正答率データから問題情報を抽出
    answer_rates = data.get("answer_rates", {}).get("science_questions", [])
    
    return questions, answer_rates

def load_textbook_data(oboeru_dir, wakaru_dir):
    """教材データを読み込む"""
    textbook_questions = []
    
    # oboeruフォルダから読み込み
    for js_file in Path(oboeru_dir).glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # window.questions配列を抽出
                if "window.questions" in content:
                    # 簡易的な抽出（実際にはより詳細なパースが必要）
                    textbook_questions.append({
                        "file": js_file.name,
                        "type": "oboeru",
                        "content": content[:500]  # 最初の500文字をサンプルとして
                    })
        except Exception as e:
            print(f"Error reading {js_file}: {e}")
    
    # wakaruフォルダから読み込み
    for js_file in Path(wakaru_dir).glob("*.js"):
        if js_file.name in ["loader.js", "script.js"]:
            continue
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if "window.questions" in content:
                    textbook_questions.append({
                        "file": js_file.name,
                        "type": "wakaru",
                        "content": content[:500]
                    })
        except Exception as e:
            print(f"Error reading {js_file}: {e}")
    
    return textbook_questions

def classify_field(text, field_keywords):
    """テキストを分野に分類"""
    scores = {}
    for field, data in field_keywords.items():
        score = sum(1 for keyword in data["keywords"] if keyword in text)
        scores[field] = score
    return scores

def analyze_exam_questions(answer_rates):
    """首都模試の問題を分析"""
    field_counts = defaultdict(int)
    thinking_levels = defaultdict(int)
    correct_rate_ranges = defaultdict(int)
    question_topics = []
    
    for q in answer_rates:
        # 分野分類
        question_text = q.get("question_name", "")
        field_scores = classify_field(question_text, FIELD_KEYWORDS)
        if field_scores:
            main_field = max(field_scores.items(), key=lambda x: x[1])[0]
            field_counts[main_field] += 1
        
        # 思考力レベル
        thinking = q.get("thinking", "")
        if thinking:
            thinking_levels[thinking] += 1
        
        # 正答率範囲
        correct_rate = q.get("correct_rate", 0)
        if correct_rate >= 80:
            correct_rate_ranges["80%以上"] += 1
        elif correct_rate >= 60:
            correct_rate_ranges["60-80%"] += 1
        elif correct_rate >= 40:
            correct_rate_ranges["40-60%"] += 1
        else:
            correct_rate_ranges["40%未満"] += 1
        
        question_topics.append({
            "name": question_text,
            "field": main_field if field_scores else "不明",
            "thinking": thinking,
            "correct_rate": correct_rate
        })
    
    return {
        "field_counts": dict(field_counts),
        "thinking_levels": dict(thinking_levels),
        "correct_rate_ranges": dict(correct_rate_ranges),
        "question_topics": question_topics
    }

def analyze_textbook_coverage(textbook_questions):
    """教材データのカバー範囲を分析"""
    field_counts = defaultdict(int)
    file_types = defaultdict(int)
    
    for q in textbook_questions:
        filename = q["file"]
        content = q["content"]
        
        # ファイル名から分野を推測
        for field, data in FIELD_KEYWORDS.items():
            if any(keyword in filename.lower() for keyword in data["files"]):
                field_counts[field] += 1
                break
        
        file_types[q["type"]] += 1
    
    return {
        "field_counts": dict(field_counts),
        "file_types": dict(file_types),
        "total_files": len(textbook_questions)
    }

def generate_comparison_report(exam_analysis, textbook_analysis):
    """比較レポートを生成"""
    report = []
    report.append("=" * 80)
    report.append("首都模試データと理科教材データの比較分析レポート")
    report.append("=" * 80)
    report.append("")
    
    # 1. 首都模試の出題分析
    report.append("【1. 首都模試の出題分析】")
    report.append("-" * 80)
    report.append(f"総問題数: {sum(exam_analysis['field_counts'].values())}")
    report.append("")
    report.append("分野別出題数:")
    for field, count in sorted(exam_analysis['field_counts'].items(), key=lambda x: -x[1]):
        report.append(f"  {field}: {count}問")
    report.append("")
    
    report.append("思考力レベル別出題数:")
    for level, count in sorted(exam_analysis['thinking_levels'].items()):
        report.append(f"  {level}: {count}問")
    report.append("")
    
    report.append("正答率分布:")
    for range_name, count in sorted(exam_analysis['correct_rate_ranges'].items()):
        report.append(f"  {range_name}: {count}問")
    report.append("")
    
    # 2. 教材データのカバー範囲
    report.append("【2. 教材データのカバー範囲】")
    report.append("-" * 80)
    report.append(f"総ファイル数: {textbook_analysis['total_files']}")
    report.append("")
    report.append("ファイルタイプ別:")
    for file_type, count in textbook_analysis['file_types'].items():
        report.append(f"  {file_type}: {count}ファイル")
    report.append("")
    
    report.append("分野別ファイル数:")
    for field, count in sorted(textbook_analysis['field_counts'].items(), key=lambda x: -x[1]):
        report.append(f"  {field}: {count}ファイル")
    report.append("")
    
    # 3. 比較分析
    report.append("【3. 比較分析】")
    report.append("-" * 80)
    
    # 分野別の比較
    all_fields = set(exam_analysis['field_counts'].keys()) | set(textbook_analysis['field_counts'].keys())
    
    report.append("分野別の出題数と教材ファイル数の比較:")
    for field in sorted(all_fields):
        exam_count = exam_analysis['field_counts'].get(field, 0)
        textbook_count = textbook_analysis['field_counts'].get(field, 0)
        report.append(f"  {field}:")
        report.append(f"    模試出題数: {exam_count}問")
        report.append(f"    教材ファイル数: {textbook_count}ファイル")
        if exam_count > 0 and textbook_count > 0:
            ratio = textbook_count / exam_count
            report.append(f"    比率: {ratio:.2f}ファイル/問")
        report.append("")
    
    # 4. 主要な出題トピック
    report.append("【4. 首都模試の主要出題トピック（正答率順）】")
    report.append("-" * 80)
    
    # 正答率が低い問題（難易度が高い）
    low_correct_rate = [q for q in exam_analysis['question_topics'] if q['correct_rate'] < 50]
    low_correct_rate.sort(key=lambda x: x['correct_rate'])
    
    report.append("正答率50%未満の問題（難易度が高い）:")
    for i, q in enumerate(low_correct_rate[:20], 1):
        report.append(f"  {i}. {q['name']} ({q['field']}) - 正答率: {q['correct_rate']:.1f}% (思考力: {q['thinking']})")
    report.append("")
    
    # 正答率が高い問題（基礎的な問題）
    high_correct_rate = [q for q in exam_analysis['question_topics'] if q['correct_rate'] >= 80]
    high_correct_rate.sort(key=lambda x: -x['correct_rate'])
    
    report.append("正答率80%以上の問題（基礎的な問題）:")
    for i, q in enumerate(high_correct_rate[:20], 1):
        report.append(f"  {i}. {q['name']} ({q['field']}) - 正答率: {q['correct_rate']:.1f}% (思考力: {q['thinking']})")
    report.append("")
    
    return "\n".join(report)

def main():
    # データの読み込み
    print("データを読み込んでいます...")
    exam_data = load_exam_data("fully_integrated_analysis_data.json")
    questions, answer_rates = extract_questions_from_exam(exam_data)
    
    print("教材データを読み込んでいます...")
    textbook_questions = load_textbook_data("oboeru", "wakaru")
    
    # 分析
    print("分析を実行しています...")
    exam_analysis = analyze_exam_questions(answer_rates)
    textbook_analysis = analyze_textbook_coverage(textbook_questions)
    
    # レポート生成
    print("レポートを生成しています...")
    report = generate_comparison_report(exam_analysis, textbook_analysis)
    
    # レポートを保存
    with open("comparison_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n" + report)
    print("\nレポートを 'comparison_report.txt' に保存しました。")

if __name__ == "__main__":
    main()

