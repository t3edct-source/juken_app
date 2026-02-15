#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
わかる編からおぼえる編を生成するスクリプト
- わかる編の text, choices, answer, qnum, tags, difficulty, asof をそのまま使用
- source は空文字列 "" にする
"""
import os
import json
import re
from pathlib import Path

# ディレクトリパス
WAKARU_DIR = Path(__file__).parent / 'wakaru'
OBOERU_DIR = Path(__file__).parent / 'oboeru'

# 除外するファイル
EXCLUDE_FILES = {
    'loader.js', 'script.js', 'index_modular.html', 'style.css',
    '*.html', '*.css', '*.md', '*.zip', '*sim.html', '*.backup*'
}

def get_wakaru_files():
    """わかる編の全ファイルを取得"""
    files = []
    for file in WAKARU_DIR.glob('*.js'):
        if file.name not in EXCLUDE_FILES and not any(
            file.name.endswith(ext) for ext in ['.backup', '.backup2', '.backup_final', '.backup_indent']
        ):
            files.append(file)
    return sorted(files)

def get_oboeru_filename_mapping():
    """既存のおぼえる編ファイル名のマッピングを作成"""
    mapping = {}
    
    # 既存のおぼえる編ファイルを確認
    for oboeru_file in OBOERU_DIR.glob('*.js'):
        if oboeru_file.name in ['loader.js', 'script.js']:
            continue
        
        name = oboeru_file.stem  # 拡張子なし
        
        # _oboeru サフィックスを削除してわかる編のファイル名を推測
        if name.endswith('_oboeru'):
            wakaru_name = name[:-7]  # '_oboeru' を削除
            mapping[wakaru_name] = name
        else:
            # サフィックスがない場合は同じ名前
            mapping[name] = name
    
    return mapping

def determine_oboeru_filename(wakaru_filename, mapping):
    """おぼえる編のファイル名を決定"""
    wakaru_name = wakaru_filename.stem
    
    if wakaru_name in mapping:
        return mapping[wakaru_name] + '.js'
    else:
        # マッピングがない場合は _oboeru サフィックスを追加
        return wakaru_name + '_oboeru.js'

def create_oboeru_from_wakaru(wakaru_file, oboeru_file):
    """わかる編からおぼえる編を作成"""
    try:
        # わかる編を読み込む
        with open(wakaru_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # window.questions を抽出
        # 簡易的な方法: eval を使わずに JSON を抽出
        match = re.search(r'window\.questions\s*=\s*(\[[\s\S]*\]);', content)
        if not match:
            print(f"[警告] {wakaru_file.name}: window.questions が見つかりません")
            return False
        
        questions_json = match.group(1)
        questions = json.loads(questions_json)
        
        # おぼえる編用に変換（source を空文字列に）
        oboeru_questions = []
        for q in questions:
            oboeru_q = {
                'qnum': q.get('qnum'),
                'text': q.get('text'),
                'choices': q.get('choices'),
                'answer': q.get('answer'),
                'source': '',  # 空文字列
                'tags': q.get('tags', []),
                'difficulty': q.get('difficulty', 1),
                'asof': q.get('asof', '2025-01-27')
            }
            oboeru_questions.append(oboeru_q)
        
        # おぼえる編ファイルを生成
        oboeru_content = 'window.questions = [\n'
        for i, q in enumerate(oboeru_questions):
            oboeru_content += '  {\n'
            oboeru_content += f'    "qnum": {json.dumps(q["qnum"], ensure_ascii=False)},\n'
            oboeru_content += f'    "text": {json.dumps(q["text"], ensure_ascii=False)},\n'
            oboeru_content += f'    "choices": {json.dumps(q["choices"], ensure_ascii=False)},\n'
            oboeru_content += f'    "answer": {q["answer"]},\n'
            oboeru_content += f'    "source": "",\n'
            oboeru_content += f'    "tags": {json.dumps(q["tags"], ensure_ascii=False)},\n'
            oboeru_content += f'    "difficulty": {q["difficulty"]},\n'
            oboeru_content += f'    "asof": {json.dumps(q["asof"], ensure_ascii=False)}\n'
            oboeru_content += '  }'
            if i < len(oboeru_questions) - 1:
                oboeru_content += ','
            oboeru_content += '\n'
        oboeru_content += '];\n'
        
        # ファイルを書き込む
        with open(oboeru_file, 'w', encoding='utf-8') as f:
            f.write(oboeru_content)
        
        return True
        
    except Exception as e:
        print(f"[エラー] ({wakaru_file.name}): {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("わかる編からおぼえる編を生成します...\n")
    
    # わかる編の全ファイルを取得
    wakaru_files = get_wakaru_files()
    print(f"わかる編ファイル数: {len(wakaru_files)}")
    
    # おぼえる編のファイル名マッピングを取得
    mapping = get_oboeru_filename_mapping()
    print(f"既存のおぼえる編マッピング: {len(mapping)}個\n")
    
    # 各ファイルを処理
    created = 0
    updated = 0
    errors = 0
    
    for wakaru_file in wakaru_files:
        oboeru_filename = determine_oboeru_filename(wakaru_file, mapping)
        oboeru_file = OBOERU_DIR / oboeru_filename
        
        existed = oboeru_file.exists()
        
        if create_oboeru_from_wakaru(wakaru_file, oboeru_file):
            if existed:
                print(f"[更新] {oboeru_filename} (元: {wakaru_file.name})")
                updated += 1
            else:
                print(f"[作成] {oboeru_filename} (元: {wakaru_file.name})")
                created += 1
        else:
            errors += 1
    
    print(f"\n完了!")
    print(f"  新規作成: {created}個")
    print(f"  更新: {updated}個")
    if errors > 0:
        print(f"  エラー: {errors}個")

if __name__ == '__main__':
    main()

