#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
電気の基礎と回路を流れる電流の大きさ（統合）の学習順序を再配置
前回のエラーに注意：
- sourceフィールドは単一行の文字列として保持（\nで改行をエスケープ）
- インデントを一貫して保つ
- カンマの位置を正しく配置
- qnumの連番を維持
"""

import re
from pathlib import Path

def extract_questions(content):
    """JavaScriptファイルから問題を抽出"""
    questions = []
    
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        return questions
    
    array_content = match.group(1)
    
    # 各問題のqnumを探す
    qnum_pattern = r'"qnum":\s*(\d+)'
    qnum_matches = list(re.finditer(qnum_pattern, array_content))
    
    for i, qnum_match in enumerate(qnum_matches):
        qnum = int(qnum_match.group(1))
        start_pos = qnum_match.start()
        
        # 次の問題の開始位置を探す
        if i + 1 < len(qnum_matches):
            end_pos = qnum_matches[i + 1].start()
        else:
            end_pos = len(array_content)
        
        # この問題全体を抽出
        question_block = array_content[start_pos:end_pos]
        
        # 問題オブジェクト全体を抽出（{から}まで）
        brace_count = 0
        obj_start = question_block.find('{')
        obj_end = -1
        
        for j, char in enumerate(question_block[obj_start:], start=obj_start):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    obj_end = j + 1
                    break
        
        if obj_end > 0:
            question_obj = question_block[obj_start:obj_end]
            questions.append({
                'qnum': qnum,
                'content': question_obj
            })
    
    return questions

def categorize_question(text):
    """問題をカテゴリに分類"""
    text_lower = text.lower()
    
    # 基礎概念
    if '回路' in text and ('基本' in text or 'つなぎ' in text or '構造' in text or '何という' in text):
        if '直列' in text:
            return (1, '基礎概念_直列回路')
        elif '並列' in text:
            return (2, '基礎概念_並列回路')
        else:
            return (0, '基礎概念_回路の基本構造')
    
    # 概念（電流・電圧）
    if '電流' in text and ('大きさ' in text or '流れる' in text or '何という' in text or 'はかる' in text):
        if '直列' in text:
            return (3, '概念_直列回路の電流')
        elif '並列' in text:
            return (4, '概念_並列回路の電流')
        else:
            return (5, '概念_電流の大きさ')
    
    if '電圧' in text and ('何という' in text or 'はかる' in text or 'どうなる' in text):
        return (6, '概念_電圧')
    
    # 観察方法
    if '電流計' in text or ('電流' in text and '調べる' in text):
        return (7, '観察方法_電流の測定')
    
    if '電圧計' in text or ('電圧' in text and '調べる' in text):
        return (8, '観察方法_電圧の測定')
    
    # 応用
    if '明るさ' in text or ('電球' in text and ('明る' in text or '暗' in text)):
        return (9, '応用_明るさと電流の関係')
    
    if '電池' in text and ('つなぐ' in text or 'もち' in text or 'どうなる' in text):
        return (10, '応用_電池のつなぎ方')
    
    if '抵抗' in text or ('電流' in text and '大きい' in text and '明る' in text):
        return (11, '応用_抵抗と電流の関係')
    
    # その他（用語の定義など）
    return (12, 'その他')

def reorder_questions(filepath):
    """問題を学習順序に従って再配置"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"エラー: ファイル読み込み失敗 - {e}")
        return False
    
    # 問題を抽出
    questions = extract_questions(content)
    
    if not questions:
        print("エラー: 問題が見つかりません")
        return False
    
    print(f"抽出された問題数: {len(questions)}")
    
    # 各問題のtextを抽出してカテゴリを決定
    categorized = []
    for q in questions:
        text_match = re.search(r'"text":\s*"([^"]*(?:\\.[^"]*)*)"', q['content'], re.DOTALL)
        if text_match:
            text = text_match.group(1).replace('\\"', '"').replace('\\n', '\n')
            priority, category = categorize_question(text)
            categorized.append({
                'qnum': q['qnum'],
                'content': q['content'],
                'category': category,
                'priority': priority,
                'text': text[:50]  # デバッグ用
            })
        else:
            categorized.append({
                'qnum': q['qnum'],
                'content': q['content'],
                'category': 'その他',
                'priority': 999,
                'text': ''
            })
    
    # 優先度とqnumでソート
    categorized.sort(key=lambda x: (x['priority'], x['qnum']))
    
    # 新しい順序で問題を再構築
    new_questions = []
    for i, item in enumerate(categorized, 1):
        # qnumを更新
        new_content = re.sub(
            r'"qnum":\s*\d+',
            f'"qnum": {i}',
            item['content']
        )
        new_questions.append(new_content)
    
    # 新しい配列を構築
    new_array = ',\n'.join(new_questions)
    
    # ファイル全体を再構築
    header = content[:content.find('window.questions')]
    footer = content[content.rfind('];'):]
    
    new_content = header + 'window.questions = [\n' + new_array + '\n];' + footer
    
    # バックアップを作成
    backup_path = filepath.with_suffix('.js.backup')
    try:
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"バックアップを作成: {backup_path}")
    except Exception as e:
        print(f"警告: バックアップ作成失敗 - {e}")
    
    # 新しい内容を書き込み
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"再配置完了: {filepath}")
        
        # カテゴリごとの配置を表示
        print("\n再配置後の順序:")
        for i, item in enumerate(categorized, 1):
            print(f"  Q{i} ({item['category']}): {item['text']}...")
        
        return True
    except Exception as e:
        print(f"エラー: ファイル書き込み失敗 - {e}")
        return False

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    target_file = base_dir / 'wakaru' / 'physics_current_circuit_integrated.js'
    
    if not target_file.exists():
        print(f"エラー: ファイルが見つかりません: {target_file}")
        return
    
    print("=" * 80)
    print("学習順序の再配置を開始")
    print("=" * 80)
    print()
    
    success = reorder_questions(target_file)
    
    if success:
        print()
        print("=" * 80)
        print("再配置が完了しました")
        print("=" * 80)
    else:
        print()
        print("=" * 80)
        print("再配置に失敗しました")
        print("=" * 80)

if __name__ == "__main__":
    main()

