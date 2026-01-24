#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
太陽と影（基礎）の単元の問題を推奨順序に再配置
"""

import re
import os
from pathlib import Path

# 推奨される新しい順序（元のqnum）
NEW_ORDER = [
    1,   # Q1: 影ができるのは光が何の性質をもつため？
    21,  # Q21: 光がまっすぐ進む性質を何という？
    9,   # Q9: 太陽の光が当たらない部分が影になる理由は？
    24,  # Q24: 影が太陽の反対側にできる理由となる光の性質を何という？
    7,   # Q7: 太陽の見かけの動きは実際には何が回転しているため？
    8,   # Q8: 地球はどちら向きに自転している？
    19,  # Q19: 太陽の動きが東→南→西に見えるのは何のため？
    23,  # Q23: 太陽が東から西へ動くように見える理由となる地球の動きを何という？
    25,  # Q25: 地球が1日に1回回ることを何という？
    2,   # Q2: 太陽の位置が低い朝や夕方の影はどうなる？
    3,   # Q3: 太陽が高くなる正午ごろの影はどうなる？
    4,   # Q4: 太陽の動きに伴い影の向きはどう変わる？
    5,   # Q5: 太陽が東に見えるとき影はどの方角にできる？
    6,   # Q6: 太陽が西に見えるとき影はどの方角にできる？
    16,  # Q16: 影の長さは太陽の高さとどんな関係がある？
    30,  # Q30: 太陽の高さが高いほど影が短くなる関係を何という？
    17,  # Q17: 棒の影が短くなると太陽の高さはどうなる？
    18,  # Q18: 棒の影が長くなると太陽の高さはどうなる？
    14,  # Q14: 太陽の南中とは太陽が1日の中でどうなる瞬間？
    22,  # Q22: 太陽が最も高くなる時刻を何という？
    15,  # Q15: 南中時の影はどの方向にできる？
    26,  # Q26: 南中時に影が最も短くなる現象を何という？
    29,  # Q29: 影の向きから方角を知るための目印となる線を何という？
    20,  # Q20: 正午の影の向きを調べるとわかる方角は何？
    10,  # Q10: 影の長さを調べるときに大切なことは？
    27,  # Q27: 影の向きと長さを調べる簡単な方法を何という？
    11,  # Q11: 季節によって正午の影の長さが違うのは太陽の何が変わるから？
    12,  # Q12: 夏の正午の影が短いのは太陽がどうなっているため？
    13,  # Q13: 冬の正午の影が長いのは太陽がどうなっているため？
    28   # Q28: 季節で太陽の高さが変わる現象の総称を何という？
]

def extract_questions(content):
    """問題オブジェクトを抽出（より確実な方法）"""
    questions = {}
    
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        return questions
    
    array_content = match.group(1)
    lines = array_content.split('\n')
    
    # 各問題の開始位置（qnumを含む行）を探す
    qnum_positions = []
    for i, line in enumerate(lines):
        if '"qnum":' in line:
            qnum_match = re.search(r'"qnum":\s*(\d+)', line)
            if qnum_match:
                qnum_positions.append((i, int(qnum_match.group(1))))
    
    # 各問題オブジェクトを抽出
    for idx, (line_idx, qnum) in enumerate(qnum_positions):
        # 問題オブジェクトの開始位置を探す（直前の { を含む行）
        start_line = line_idx
        while start_line > 0 and '{' not in lines[start_line]:
            start_line -= 1
        
        # 問題オブジェクトの終了位置を探す
        if idx + 1 < len(qnum_positions):
            # 次の問題の直前まで
            end_line = qnum_positions[idx + 1][0]
            while end_line > 0 and '{' not in lines[end_line]:
                end_line -= 1
        else:
            # 最後の問題の場合、配列の終了まで
            end_line = len(lines)
        
        # 問題オブジェクトを抽出
        question_lines = lines[start_line:end_line]
        question_block = '\n'.join(question_lines).rstrip()
        # 末尾のカンマを除去
        question_block = question_block.rstrip(',').rstrip()
        
        questions[qnum] = question_block
    
    return questions

def reorder_questions(filepath, new_order):
    """問題を新しい順序に再配置"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] ファイル読み込みエラー: {filepath} - {e}")
        return False
    
    # 問題オブジェクトを抽出
    questions = extract_questions(content)
    
    if len(questions) != len(new_order):
        print(f"[WARN] 問題数が一致しません: {len(questions)}問 vs {len(new_order)}問")
    
    # 新しい順序で問題を並べ替え
    reordered_blocks = []
    missing = []
    for new_qnum, old_qnum in enumerate(new_order, 1):
        if old_qnum in questions:
            question_block = questions[old_qnum]
            # qnumを新しい番号に変更
            updated_block = re.sub(r'"qnum":\s*\d+', f'"qnum": {new_qnum}', question_block, count=1)
            reordered_blocks.append(updated_block)
        else:
            missing.append(old_qnum)
            print(f"[WARN] 元のQ{old_qnum}が見つかりません")
    
    if missing:
        print(f"[ERROR] 見つからない問題: {missing}")
        return False
    
    # 新しい配列を作成
    new_array_content = ',\n'.join(reordered_blocks)
    
    # 元のwindow.questions = [...] を置き換え
    pattern = r'window\.questions\s*=\s*\[[\s\S]*?\];'
    new_content = re.sub(pattern, f'window.questions = [\n{new_array_content}\n];', content, flags=re.DOTALL)
    
    # ファイルに書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] {len(reordered_blocks)}問を再配置しました: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"[ERROR] ファイル書き込みエラー: {filepath} - {e}")
        return False

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    # 対象ファイル
    target_files = [
        base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        base_dir / 'oboeru' / 'earth_sun_movement_shadow_oboeru.js'
    ]
    
    print("=" * 80)
    print("太陽と影（基礎）の単元 - 問題の再配置")
    print("=" * 80)
    print()
    print(f"新しい順序: {len(NEW_ORDER)}問")
    print()
    
    for filepath in target_files:
        if filepath.exists():
            reorder_questions(str(filepath), NEW_ORDER)
            print()
        else:
            print(f"[ERROR] ファイルが見つかりません: {filepath}")
            print()
    
    print("=" * 80)
    print("再配置完了")
    print("=" * 80)

if __name__ == "__main__":
    main()

