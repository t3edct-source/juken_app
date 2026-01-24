#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
電気の基礎と回路を流れる電流の大きさ（統合）の再配置を修正
- インデントを正しく設定（2スペース）
- 分類ロジックを改善
"""

import re
from pathlib import Path

def extract_questions(content):
    """問題オブジェクトを抽出"""
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        return []
    
    array_content = match.group(1)
    
    # 各問題オブジェクトを抽出
    questions = []
    brace_count = 0
    obj_start = -1
    obj_lines = []
    
    lines = array_content.split('\n')
    for line in lines:
        stripped = line.strip()
        
        # { を見つけたら開始
        if '{' in stripped and obj_start == -1:
            obj_start = len(questions)
            brace_count = stripped.count('{') - stripped.count('}')
            obj_lines = [stripped]
        elif obj_start >= 0:
            obj_lines.append(stripped)
            brace_count += stripped.count('{') - stripped.count('}')
            
            # } で終了
            if brace_count == 0:
                questions.append('\n'.join(obj_lines))
                obj_start = -1
                obj_lines = []
    
    return questions

def get_question_text(question_obj):
    """問題文を抽出"""
    match = re.search(r'"text":\s*"([^"]*(?:\\.[^"]*)*)"', question_obj, re.DOTALL)
    if match:
        text = match.group(1).replace('\\"', '"').replace('\\n', '\n')
        return text
    return ""

def categorize_question(text):
    """問題を分類（改善版）"""
    # 基礎概念（優先度0-2）
    if '回路' in text and ('何という' in text or 'どのような' in text or 'とは' in text):
        if '直列' in text:
            return (1, '基礎概念_直列回路')
        elif '並列' in text:
            return (2, '基礎概念_並列回路')
        else:
            return (0, '基礎概念_回路の基本構造')
    
    if '電源' in text and '何という' in text:
        return (0, '基礎概念_回路の基本構造')
    
    if '必要なもの' in text or '組み合わせ' in text:
        return (0, '基礎概念_回路の基本構造')
    
    if '切れる' in text or '切れた' in text:
        if '直列' in text:
            return (1, '基礎概念_直列回路')
        elif '並列' in text:
            return (2, '基礎概念_並列回路')
    
    # 応用（明るさと電流の関係）
    if '電流' in text and '大きい' in text and ('明る' in text or 'どうなる' in text):
        return (9, '応用_明るさと電流の関係')
    
    # 概念（優先度3-6）
    if '電流' in text and ('直列' in text or '並列' in text):
        if '直列' in text:
            return (3, '概念_直列回路の電流')
        else:
            return (4, '概念_並列回路の電流')
    
    if '電流' in text and ('何という' in text or 'はかる' in text or '大きさ' in text):
        return (5, '概念_電流の大きさ')
    
    if '電圧' in text and ('何という' in text or 'はかる' in text or 'どうなる' in text):
        return (6, '概念_電圧')
    
    # 観察方法（優先度7-8）
    if '電流計' in text or ('電流' in text and '調べる' in text):
        return (7, '観察方法_電流の測定')
    
    if '電圧計' in text or ('電圧' in text and '調べる' in text):
        return (8, '観察方法_電圧の測定')
    
    # 応用（優先度9-11）
    if '明るさ' in text or ('電球' in text and ('明る' in text or '暗' in text)):
        return (9, '応用_明るさと電流の関係')
    
    if '電池' in text and ('つなぐ' in text or 'もち' in text):
        return (10, '応用_電池のつなぎ方')
    
    if '電流' in text and '大きい' in text and '明る' in text:
        return (11, '応用_抵抗と電流の関係')
    
    return (12, 'その他')

def format_question_object(question_obj, new_qnum, is_last=False):
    """問題オブジェクトをフォーマット"""
    # qnumを更新
    formatted = re.sub(r'"qnum":\s*\d+', f'"qnum": {new_qnum}', question_obj)
    
    # 各行を処理
    lines = formatted.split('\n')
    formatted_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped:
            # 2スペースのインデントを追加
            formatted_lines.append('  ' + stripped)
        else:
            formatted_lines.append('')
    
    # 最後にカンマを追加（最後の問題でない場合）
    if not is_last and formatted_lines:
        last_line = formatted_lines[-1]
        if last_line.endswith('}'):
            formatted_lines[-1] = last_line + ','
    
    return '\n'.join(formatted_lines)

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    target_file = base_dir / 'wakaru' / 'physics_current_circuit_integrated.js'
    
    if not target_file.exists():
        print(f"エラー: ファイルが見つかりません: {target_file}")
        return
    
    # ファイルを読み込み
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 問題を抽出
    questions = extract_questions(content)
    print(f"抽出された問題数: {len(questions)}")
    
    # 分類
    categorized = []
    for q_obj in questions:
        text = get_question_text(q_obj)
        priority, category = categorize_question(text)
        categorized.append({
            'content': q_obj,
            'category': category,
            'priority': priority,
            'text': text[:50]
        })
    
    # ソート
    categorized.sort(key=lambda x: (x['priority'], x['text']))
    
    # 新しい配列を構築
    new_questions = []
    for i, item in enumerate(categorized, 1):
        is_last = (i == len(categorized))
        formatted = format_question_object(item['content'], i, is_last)
        new_questions.append(formatted)
    
    # ファイルを再構築
    header = content[:content.find('window.questions')]
    footer = content[content.rfind('];'):]
    
    new_array = '\n'.join(new_questions)
    new_content = header + 'window.questions = [\n' + new_array + '\n];' + footer
    
    # バックアップ
    backup_path = target_file.with_suffix('.js.backup2')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"バックアップを作成: {backup_path}")
    
    # 書き込み
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"再配置完了: {target_file}")
    
    # 結果を表示
    print("\n再配置後の順序:")
    for i, item in enumerate(categorized, 1):
        print(f"  Q{i} ({item['category']}): {item['text']}...")

if __name__ == "__main__":
    main()

