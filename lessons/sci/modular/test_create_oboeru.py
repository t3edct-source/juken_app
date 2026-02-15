#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""テスト用スクリプト"""
import json
import re
from pathlib import Path

# テストファイル
wakaru_file = Path(__file__).parent / 'wakaru' / 'seasons_living_things_spring.js'

with open(wakaru_file, 'r', encoding='utf-8') as f:
    content = f.read()

# window.questions を抽出
match = re.search(r'window\.questions\s*=\s*(\[[\s\S]*\]);', content)
if match:
    questions_json = match.group(1)
    try:
        questions = json.loads(questions_json)
        print(f"問題数: {len(questions)}")
        print(f"最初の問題: {questions[0]['text'][:50]}...")
        print("OK: JSONパース成功")
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
else:
    print("window.questions が見つかりません")

