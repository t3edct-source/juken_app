#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
太陽と影（基礎）の単元で重複している問題をチェック
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def extract_questions_from_js(filepath):
    """JavaScriptファイルから問題を抽出"""
    questions = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # window.questions = [...] の部分を抽出
        # 簡易的なパース（実際のJSONパースは複雑なので、正規表現で抽出）
        pattern = r'\{\s*"qnum":\s*(\d+),\s*"text":\s*"([^"]+)"'
        matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            qnum = int(match.group(1))
            text = match.group(2)
            # エスケープされた文字を処理
            text = text.replace('\\"', '"').replace('\\n', '\n')
            
            # 選択肢と正答も抽出
            choices_pattern = r'"choices":\s*\[(.*?)\]'
            choices_match = re.search(choices_pattern, content[match.end():match.end()+2000], re.DOTALL)
            choices = []
            if choices_match:
                choices_text = choices_match.group(1)
                choice_pattern = r'"([^"]+)"'
                choices = re.findall(choice_pattern, choices_text)
                # エスケープ処理
                choices = [c.replace('\\"', '"').replace('\\n', '\n') for c in choices]
            
            # 正答を抽出
            answer_pattern = r'"answer":\s*(\d+)'
            answer_match = re.search(answer_pattern, content[match.end():match.end()+500])
            answer = int(answer_match.group(1)) if answer_match else -1
            
            questions.append({
                'qnum': qnum,
                'text': text,
                'choices': choices,
                'answer': answer
            })
    except Exception as e:
        print(f"エラー: {filepath} - {e}")
    
    return questions

def normalize_text(text):
    """テキストを正規化（比較用）"""
    # 句読点、空白、改行を除去
    text = re.sub(r'[。、\s\n]', '', text)
    # 全角・半角を統一（簡易版）
    return text.lower()

def find_duplicates_in_file(questions, filename):
    """同じファイル内での重複を検出"""
    duplicates = []
    text_to_qnums = defaultdict(list)
    
    for q in questions:
        normalized = normalize_text(q['text'])
        text_to_qnums[normalized].append(q['qnum'])
    
    for normalized_text, qnums in text_to_qnums.items():
        if len(qnums) > 1:
            duplicates.append({
                'type': 'same_file',
                'file': filename,
                'qnums': qnums,
                'text': questions[qnums[0]-1]['text'] if qnums[0] <= len(questions) else 'N/A'
            })
    
    return duplicates

def find_duplicates_between_files(questions1, filename1, questions2, filename2):
    """2つのファイル間での重複を検出"""
    duplicates = []
    
    # 正規化されたテキストのマップを作成
    text_map1 = {}
    for q in questions1:
        normalized = normalize_text(q['text'])
        if normalized not in text_map1:
            text_map1[normalized] = []
        text_map1[normalized].append({
            'qnum': q['qnum'],
            'text': q['text'],
            'choices': q['choices'],
            'answer': q['answer']
        })
    
    text_map2 = {}
    for q in questions2:
        normalized = normalize_text(q['text'])
        if normalized not in text_map2:
            text_map2[normalized] = []
        text_map2[normalized].append({
            'qnum': q['qnum'],
            'text': q['text'],
            'choices': q['choices'],
            'answer': q['answer']
        })
    
    # 重複を検出
    for normalized_text in text_map1:
        if normalized_text in text_map2:
            for q1 in text_map1[normalized_text]:
                for q2 in text_map2[normalized_text]:
                    # 選択肢と正答も比較
                    choices_match = q1['choices'] == q2['choices']
                    answer_match = q1['answer'] == q2['answer']
                    
                    duplicates.append({
                        'type': 'between_files',
                        'file1': filename1,
                        'qnum1': q1['qnum'],
                        'file2': filename2,
                        'qnum2': q2['qnum'],
                        'text': q1['text'],
                        'choices_match': choices_match,
                        'answer_match': answer_match
                    })
    
    return duplicates

def find_similar_questions(questions, filename):
    """似たような内容の問題を検出（部分一致）"""
    similar = []
    
    for i, q1 in enumerate(questions):
        for j, q2 in enumerate(questions[i+1:], start=i+1):
            text1 = normalize_text(q1['text'])
            text2 = normalize_text(q2['text'])
            
            # 一方が他方に含まれる、または共通部分が長い場合
            if len(text1) > 10 and len(text2) > 10:
                if text1 in text2 or text2 in text1:
                    # 完全一致でない場合のみ
                    if text1 != text2:
                        similar.append({
                            'type': 'similar',
                            'file': filename,
                            'qnum1': q1['qnum'],
                            'qnum2': q2['qnum'],
                            'text1': q1['text'],
                            'text2': q2['text']
                        })
    
    return similar

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    # 対象ファイル
    target_files = {
        '太陽と影（基礎）- wakaru': base_dir / 'wakaru' / 'earth_sun_movement_shadow.js',
        '太陽と影（基礎）- oboeru': base_dir / 'oboeru' / 'earth_sun_movement_shadow_oboeru.js',
        '太陽の動き - wakaru': base_dir / 'wakaru' / 'earth_sun_movement.js'
    }
    
    all_questions = {}
    all_duplicates = []
    
    print("=" * 80)
    print("太陽と影（基礎）の単元 - 重複チェック")
    print("=" * 80)
    print()
    
    # 各ファイルから問題を抽出
    for name, filepath in target_files.items():
        if filepath.exists():
            questions = extract_questions_from_js(str(filepath))
            all_questions[name] = questions
            print(f"[OK] {name}: {len(questions)}問を抽出")
        else:
            print(f"[ERROR] {name}: ファイルが見つかりません")
    
    print()
    
    # 1. 同じファイル内での重複をチェック
    print("=" * 80)
    print("【1】同じファイル内での重複")
    print("=" * 80)
    print()
    
    same_file_duplicates = []
    for name, questions in all_questions.items():
        duplicates = find_duplicates_in_file(questions, name)
        if duplicates:
            same_file_duplicates.extend(duplicates)
            for dup in duplicates:
                print(f"■ {name}")
                print(f"  重複している問題番号: {dup['qnums']}")
                print(f"  問題文: {dup['text'][:60]}...")
                print()
        else:
            print(f"[OK] {name}: 重複なし")
            print()
    
    # 2. ファイル間での重複をチェック
    print("=" * 80)
    print("【2】ファイル間での重複")
    print("=" * 80)
    print()
    
    between_files_duplicates = []
    file_names = list(all_questions.keys())
    for i in range(len(file_names)):
        for j in range(i+1, len(file_names)):
            name1 = file_names[i]
            name2 = file_names[j]
            questions1 = all_questions[name1]
            questions2 = all_questions[name2]
            
            duplicates = find_duplicates_between_files(questions1, name1, questions2, name2)
            if duplicates:
                between_files_duplicates.extend(duplicates)
                print(f"■ {name1} <-> {name2}")
                for dup in duplicates:
                    print(f"  {name1} Q{dup['qnum1']} <-> {name2} Q{dup['qnum2']}")
                    print(f"  問題文: {dup['text'][:60]}...")
                    print(f"  選択肢一致: {dup['choices_match']}, 正答一致: {dup['answer_match']}")
                    print()
            else:
                print(f"[OK] {name1} <-> {name2}: 重複なし")
                print()
    
    # 3. 似たような内容の問題をチェック
    print("=" * 80)
    print("【3】似たような内容の問題（部分一致）")
    print("=" * 80)
    print()
    
    similar_questions = []
    for name, questions in all_questions.items():
        similar = find_similar_questions(questions, name)
        if similar:
            similar_questions.extend(similar)
            print(f"■ {name}")
            for sim in similar:
                print(f"  Q{sim['qnum1']} <-> Q{sim['qnum2']}")
                print(f"  問題1: {sim['text1'][:50]}...")
                print(f"  問題2: {sim['text2'][:50]}...")
                print()
        else:
            print(f"[OK] {name}: 類似問題なし")
            print()
    
    # サマリー
    print("=" * 80)
    print("【検証結果サマリー】")
    print("=" * 80)
    print()
    print(f"同じファイル内での重複: {len(same_file_duplicates)}件")
    print(f"ファイル間での重複: {len(between_files_duplicates)}件")
    print(f"類似問題: {len(similar_questions)}件")
    print()
    
    if len(same_file_duplicates) == 0 and len(between_files_duplicates) == 0:
        print("[OK] 完全な重複は見つかりませんでした")
    else:
        print("[WARN] 重複が見つかりました。上記の詳細を確認してください。")

if __name__ == "__main__":
    main()

