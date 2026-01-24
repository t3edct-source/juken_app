#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
太陽と影（基礎）の単元の学習順序を点検
概念理解の順番になっているか確認
"""

import json
import re
from pathlib import Path

def extract_questions_from_js(filepath):
    """JavaScriptファイルから問題を抽出"""
    questions = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # より正確な抽出のために、問題オブジェクト全体を抽出
        # { "qnum": ..., "text": ..., ... } のパターン
        pattern = r'\{\s*"qnum":\s*(\d+),\s*"text":\s*"([^"]+(?:\\.[^"]*)*)"'
        matches = list(re.finditer(pattern, content, re.MULTILINE | re.DOTALL))
        
        for match in matches:
            qnum = int(match.group(1))
            text = match.group(2)
            # エスケープされた文字を処理
            text = text.replace('\\"', '"').replace('\\n', '\n').replace('\\/', '/')
            
            questions.append({
                'qnum': qnum,
                'text': text
            })
    except Exception as e:
        print(f"エラー: {filepath} - {e}")
    
    return questions

def categorize_question(text):
    """問題を概念カテゴリに分類"""
    text_lower = text.lower()
    
    # カテゴリ分類
    if '影ができる' in text or '光が' in text and ('直進' in text or '性質' in text):
        return '基礎概念_光の直進と影のでき方'
    elif '朝' in text or '夕方' in text or '位置が低い' in text:
        return '時間帯_朝夕方の影'
    elif '正午' in text or '高くなる' in text:
        return '時間帯_正午の影'
    elif '影の向き' in text or '方角' in text or '東' in text or '西' in text or '北' in text or '南' in text:
        return '概念_影の向きと方角'
    elif '地球' in text and ('自転' in text or '回転' in text):
        return '概念_地球の自転と太陽の見かけの動き'
    elif '季節' in text or '夏' in text or '冬' in text:
        return '応用_季節による影の変化'
    elif '影の長さ' in text or '長くなる' in text or '短くなる' in text:
        if '太陽の高さ' in text or '高さ' in text:
            return '概念_太陽高度と影の長さの関係'
        else:
            return '観察_影の長さの変化'
    elif '南中' in text:
        return '概念_南中と太陽高度'
    elif '観察' in text or '調べる' in text or '測る' in text:
        return '観察方法_測定と観察'
    elif '棒の影' in text or '実験' in text:
        return '観察方法_棒の影実験'
    else:
        return 'その他'

def analyze_learning_order(questions):
    """学習順序を分析"""
    analysis = {
        'categories': [],
        'order_issues': [],
        'recommendations': []
    }
    
    # 各問題をカテゴリに分類
    categorized = []
    for q in questions:
        category = categorize_question(q['text'])
        categorized.append({
            'qnum': q['qnum'],
            'text': q['text'],
            'category': category
        })
    
    # カテゴリの出現順序を記録
    category_order = []
    for item in categorized:
        if item['category'] not in category_order:
            category_order.append(item['category'])
    
    analysis['categories'] = category_order
    
    # 理想的な学習順序
    ideal_order = [
        '基礎概念_光の直進と影のでき方',
        '概念_地球の自転と太陽の見かけの動き',
        '時間帯_朝夕方の影',
        '時間帯_正午の影',
        '概念_影の向きと方角',
        '概念_太陽高度と影の長さの関係',
        '観察_影の長さの変化',
        '概念_南中と太陽高度',
        '観察方法_測定と観察',
        '観察方法_棒の影実験',
        '応用_季節による影の変化',
        'その他'
    ]
    
    # 順序の問題を検出
    for i, item in enumerate(categorized):
        current_category = item['category']
        current_index = ideal_order.index(current_category) if current_category in ideal_order else len(ideal_order)
        
        # 前の問題との順序関係をチェック
        if i > 0:
            prev_category = categorized[i-1]['category']
            prev_index = ideal_order.index(prev_category) if prev_category in ideal_order else len(ideal_order)
            
            # 後ろの概念が前に来ている場合
            if current_index < prev_index:
                analysis['order_issues'].append({
                    'qnum': item['qnum'],
                    'issue': f'Q{item["qnum"]} ({current_category}) が Q{categorized[i-1]["qnum"]} ({prev_category}) より前に来ている',
                    'current': current_category,
                    'previous': prev_category
                })
    
    # 推奨事項
    if analysis['order_issues']:
        analysis['recommendations'].append('一部の問題の順序を調整することを推奨します')
    
    return analysis, categorized

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    filepath = base_dir / 'wakaru' / 'earth_sun_movement_shadow.js'
    
    print("=" * 80)
    print("太陽と影（基礎）の単元 - 学習順序の点検")
    print("=" * 80)
    print()
    
    if not filepath.exists():
        print(f"[ERROR] ファイルが見つかりません: {filepath}")
        return
    
    questions = extract_questions_from_js(str(filepath))
    print(f"問題数: {len(questions)}問")
    print()
    
    # 学習順序を分析
    analysis, categorized = analyze_learning_order(questions)
    
    # 結果を表示
    print("=" * 80)
    print("【現在の学習順序】")
    print("=" * 80)
    print()
    
    current_category = None
    for item in categorized:
        if item['category'] != current_category:
            if current_category is not None:
                print()
            print(f"■ {item['category']}")
            current_category = item['category']
        print(f"  Q{item['qnum']:2d}: {item['text'][:60]}...")
    
    print()
    print("=" * 80)
    print("【理想的な学習順序】")
    print("=" * 80)
    print()
    
    ideal_order = [
        ('基礎概念_光の直進と影のでき方', '光が直進する性質と影のでき方の基本'),
        ('概念_地球の自転と太陽の見かけの動き', '地球の自転が太陽の動きに見える理由'),
        ('時間帯_朝夕方の影', '朝・夕方の影の特徴'),
        ('時間帯_正午の影', '正午の影の特徴'),
        ('概念_影の向きと方角', '影の向きと太陽の位置の関係'),
        ('概念_太陽高度と影の長さの関係', '太陽の高さと影の長さの関係'),
        ('観察_影の長さの変化', '影の長さの変化の観察'),
        ('概念_南中と太陽高度', '南中と太陽高度の概念'),
        ('観察方法_測定と観察', '観察方法と測定のポイント'),
        ('観察方法_棒の影実験', '棒の影を使った実験方法'),
        ('応用_季節による影の変化', '季節による影の変化（応用）'),
        ('その他', 'その他の概念')
    ]
    
    for category, description in ideal_order:
        matching = [item for item in categorized if item['category'] == category]
        if matching:
            print(f"■ {category}")
            print(f"  {description}")
            print(f"  該当問題: Q{', Q'.join([str(item['qnum']) for item in matching])}")
            print()
    
    print("=" * 80)
    print("【順序の問題点】")
    print("=" * 80)
    print()
    
    if analysis['order_issues']:
        for issue in analysis['order_issues']:
            print(f"[WARN] Q{issue['qnum']}: {issue['issue']}")
            print(f"   問題文: {[q['text'] for q in questions if q['qnum'] == issue['qnum']][0][:60]}...")
            print()
    else:
        print("[OK] 順序に問題は見つかりませんでした")
        print()
    
    print("=" * 80)
    print("【推奨事項】")
    print("=" * 80)
    print()
    
    if analysis['recommendations']:
        for rec in analysis['recommendations']:
            print(f"  - {rec}")
    else:
        print("  - 現在の順序は適切です")
    
    print()
    
    # 詳細な分析レポート
    print("=" * 80)
    print("【詳細分析】")
    print("=" * 80)
    print()
    
    # カテゴリごとの問題数
    category_count = {}
    for item in categorized:
        cat = item['category']
        category_count[cat] = category_count.get(cat, 0) + 1
    
    print("カテゴリごとの問題数:")
    for cat, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}問")

if __name__ == "__main__":
    main()

