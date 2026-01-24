# -*- coding: utf-8 -*-
"""
重複問題を削除し、qnumを再振り当てするスクリプト
"""

import re

def remove_duplicates_and_renumber(filepath, duplicate_qnums):
    """重複問題を削除し、qnumを再振り当て"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 重複問題を削除
    for qnum in sorted(duplicate_qnums, reverse=True):
        # qnumのオブジェクト全体を削除
        pattern = r'  \{\s*"qnum":\s*' + str(qnum) + r'.*?\},\s*'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # qnumを再振り当て
    qnum_pattern = r'"qnum":\s*(\d+)'
    qnums = []
    for match in re.finditer(qnum_pattern, content):
        qnums.append(int(match.group(1)))
    
    # qnumを1から順に再振り当て
    current_qnum = 1
    for old_qnum in sorted(set(qnums)):
        if old_qnum not in duplicate_qnums:
            content = re.sub(
                r'"qnum":\s*' + str(old_qnum) + r'(?=\D)',
                f'"qnum": {current_qnum}',
                content
            )
            current_qnum += 1
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"重複問題を削除し、qnumを再振り当てしました: {filepath}")

def main():
    """メイン処理"""
    # レッスン18: Q22, Q24を削除
    remove_duplicates_and_renumber('wakaru/earth_earthquake_structure.js', [22, 24])
    
    # レッスン30: Q23, Q29を確認（問題文のみ重複のため、内容を変更するか削除するか要確認）
    # まずは確認のみ
    print("\nレッスン30の重複問題（Q5とQ23、Q9とQ29）は問題文のみ重複のため、")
    print("内容を確認してから修正してください。")

if __name__ == '__main__':
    main()

