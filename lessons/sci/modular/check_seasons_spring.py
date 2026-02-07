# -*- coding: utf-8 -*-
"""季節と生物（春）単元の確認スクリプト"""

import re
import json

import os

# スクリプトのディレクトリを取得
script_dir = os.path.dirname(os.path.abspath(__file__))
js_file = os.path.join(script_dir, 'wakaru', 'seasons_living_things_spring.js')

# JavaScriptファイルを読み込む
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# window.questionsの部分を抽出
match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
if not match:
    print("エラー: window.questionsが見つかりません")
    exit(1)

# JavaScriptの配列をPythonのリストに変換（簡易版）
# 実際には、より安全な方法でパースする必要がありますが、ここでは簡易的に処理
exec('window = {}')
exec(content)

questions = window['questions']

print("=" * 80)
print("季節と生物（春）単元 - 確認レポート")
print("=" * 80)

# ステップ1: 基本情報
print(f"\n【ステップ1】基本情報")
print(f"問題数: {len(questions)}問")

choice_counts = {}
for q in questions:
    count = len(q['choices'])
    choice_counts[count] = choice_counts.get(count, 0) + 1
print(f"選択肢数: {dict(choice_counts)}")

# ステップ2: 正解番号の検証
print(f"\n【ステップ2】正解番号の検証")
issues = []
for q in questions:
    qnum = q['qnum']
    answer = q['answer']
    choices = q['choices']
    
    # 正解番号が範囲外かチェック
    if answer < 0 or answer >= len(choices):
        issues.append(f"問題{qnum}: 正解番号{answer}が範囲外（選択肢数: {len(choices)}）")
        continue
    
    # 解説と正解選択肢の整合性を簡易チェック
    source = q['source']
    correct_choice = choices[answer]
    
    # 解説に正解選択肢のキーワードが含まれているかチェック（簡易版）
    # より詳細なチェックが必要な場合は、手動確認が必要
    
print(f"正解番号の範囲チェック: {'問題なし' if not issues else f'{len(issues)}件の問題あり'}")
if issues:
    for issue in issues[:10]:
        print(f"  - {issue}")

# ステップ3: 重複問題の特定
print(f"\n【ステップ3】重複問題の特定")
duplicates = []
for i, q1 in enumerate(questions):
    for j, q2 in enumerate(questions[i+1:], start=i+1):
        # 問題文が同じか類似
        if q1['text'] == q2['text']:
            duplicates.append((q1['qnum'], q2['qnum'], '問題文が同じ'))
        # 選択肢が同じ組み合わせ
        elif sorted(q1['choices']) == sorted(q2['choices']):
            duplicates.append((q1['qnum'], q2['qnum'], '選択肢が同じ組み合わせ'))

if duplicates:
    print(f"重複問題: {len(duplicates)}組")
    for q1_num, q2_num, reason in duplicates[:10]:
        print(f"  - 問題{q1_num}と問題{q2_num}: {reason}")
else:
    print("重複問題: 見つかりませんでした")

# ステップ4: 選択肢数の統一確認
print(f"\n【ステップ4】選択肢数の統一確認")
if len(choice_counts) == 1:
    print(f"✓ すべて{list(choice_counts.keys())[0]}択に統一されています")
else:
    print(f"⚠ 選択肢数が統一されていません: {choice_counts}")

# ステップ5: 選択肢の質の確認（サンプル）
print(f"\n【ステップ5】選択肢の質の確認（サンプル）")
print("最初の5問の選択肢を確認:")
for q in questions[:5]:
    print(f"\n問題{q['qnum']}: {q['text']}")
    print(f"  選択肢: {q['choices']}")
    print(f"  正解: {q['answer']} ({q['choices'][q['answer']]})")

print("\n" + "=" * 80)
print("確認完了")

