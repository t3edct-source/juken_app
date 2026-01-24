#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
電気の基礎と回路を流れる電流の大きさ（統合）の学習順序を再配置（修正版）
前回のエラーに注意：
- sourceフィールドは単一行の文字列として保持（\nで改行をエスケープ）
- インデントを一貫して保つ（2スペース）
- カンマの位置を正しく配置
- qnumの連番を維持
"""

import re
import json
from pathlib import Path

def extract_question_objects(content):
    """JavaScriptファイルから問題オブジェクトを抽出"""
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        return []
    
    array_content = match.group(1)
    
    # 各問題オブジェクトを抽出（{から}まで）
    questions = []
    brace_count = 0
    obj_start = -1
    obj_content = []
    
    i = 0
    while i < len(array_content):
        char = array_content[i]
        
        if char == '{':
            if brace_count == 0:
                obj_start = i
                obj_content = []
            brace_count += 1
            obj_content.append(char)
        elif char == '}':
            obj_content.append(char)
            brace_count -= 1
            if brace_count == 0:
                # 問題オブジェクトが完成
                question_str = ''.join(obj_content)
                questions.append(question_str)
                obj_start = -1
                obj_content = []
        elif obj_start >= 0:
            obj_content.append(char)
        
        i += 1
    
    return questions

def get_question_text(question_obj):
    """問題オブジェクトからtextを抽出"""
    match = re.search(r'"text":\s*"([^"]*(?:\\.[^"]*)*)"', question_obj, re.DOTALL)
    if match:
        text = match.group(1)
        # エスケープを処理
        text = text.replace('\\"', '"').replace('\\n', '\n')
        return text
    return ""

def categorize_question(text):
    """問題をカテゴリに分類して優先度を返す"""
    text_lower = text.lower()
    
    # 基礎概念（優先度0-2）
    if '回路' in text and ('基本' in text or 'つなぎ' in text or '構造' in text or '何という' in text):
        if '直列' in text:
            return (1, '基礎概念_直列回路')
        elif '並列' in text:
            return (2, '基礎概念_並列回路')
        else:
            return (0, '基礎概念_回路の基本構造')
    
    # 概念（優先度3-6）
    if '電流' in text and ('大きさ' in text or '流れる' in text or '何という' in text or 'はかる' in text):
        if '直列' in text:
            return (3, '概念_直列回路の電流')
        elif '並列' in text:
            return (4, '概念_並列回路の電流')
        else:
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
    
    if '電池' in text and ('つなぐ' in text or 'もち' in text or 'どうなる' in text):
        return (10, '応用_電池のつなぎ方')
    
    if '電流' in text and '大きい' in text and '明る' in text:
        return (11, '応用_抵抗と電流の関係')
    
    # その他（優先度12）
    return (12, 'その他')

def update_qnum(question_obj, new_qnum):
    """問題オブジェクトのqnumを更新"""
    return re.sub(
        r'"qnum":\s*\d+',
        f'"qnum": {new_qnum}',
        question_obj
    )

def format_question(question_obj, is_last=False):
    """問題オブジェクトをフォーマット（インデントとカンマ）"""
    # 各行を取得
    lines = question_obj.split('\n')
    
    # 先頭と末尾の空行を削除
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop(-1)
    
    # 各行にインデントを追加（2スペース）
    formatted_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped:
            # 既存のインデントを削除して2スペースに統一
            formatted_lines.append('  ' + stripped)
        else:
            formatted_lines.append('')
    
    # 最後の行にカンマを追加（最後の問題でない場合）
    if not is_last:
        if formatted_lines and formatted_lines[-1].endswith('}'):
            formatted_lines[-1] = formatted_lines[-1] + ','
    
    return '\n'.join(formatted_lines)

def reorder_questions(filepath):
    """問題を学習順序に従って再配置"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"エラー: ファイル読み込み失敗 - {e}")
        return False
    
    # 問題を抽出
    questions = extract_question_objects(content)
    
    if not questions:
        print("エラー: 問題が見つかりません")
        return False
    
    print(f"抽出された問題数: {len(questions)}")
    
    # 各問題のtextを抽出してカテゴリを決定
    categorized = []
    for q_obj in questions:
        text = get_question_text(q_obj)
        if text:
            priority, category = categorize_question(text)
            categorized.append({
                'content': q_obj,
                'category': category,
                'priority': priority,
                'text': text[:50]  # デバッグ用
            })
        else:
            categorized.append({
                'content': q_obj,
                'category': 'その他',
                'priority': 999,
                'text': ''
            })
    
    # 優先度でソート
    categorized.sort(key=lambda x: x['priority'])
    
    # 新しい順序で問題を再構築
    new_questions = []
    for i, item in enumerate(categorized, 1):
        # qnumを更新
        updated_content = update_qnum(item['content'], i)
        # フォーマット（最後の問題でない場合）
        is_last = (i == len(categorized))
        formatted = format_question(updated_content, is_last)
        new_questions.append(formatted)
    
    # 新しい配列を構築
    new_array = '\n'.join(new_questions)
    
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

