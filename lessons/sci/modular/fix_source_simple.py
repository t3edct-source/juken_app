# -*- coding: utf-8 -*-
"""
ばねと力・ばねと浮力統合版のsourceフィールド内の改行を\nに変換（シンプル版）
"""

def fix_source_newlines(filepath):
    """sourceフィールド内の改行を\nに変換"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # より直接的な方法：sourceフィールドの開始から終了までを抽出して修正
    result = []
    i = 0
    while i < len(content):
        # "source": " を探す
        if content[i:i+10] == '"source": ':
            result.append('"source": ')
            i += 10
            
            # 次の " を探す（値の開始）
            if i < len(content) and content[i] == '"':
                result.append('"')
                i += 1
                
                # 値の内容を取得（次の ", まで）
                value_start = i
                in_escape = False
                while i < len(content):
                    if in_escape:
                        in_escape = False
                        result.append(content[i])
                        i += 1
                        continue
                    
                    if content[i] == '\\':
                        in_escape = True
                        result.append('\\')
                        i += 1
                        continue
                    
                    if content[i] == '"':
                        # 次の文字を確認
                        if i + 1 < len(content) and content[i+1] == ',':
                            # 値の終了
                            result.append('"')
                            result.append(',')
                            i += 2
                            break
                        elif i + 1 < len(content) and content[i+1] == '\n' and i + 2 < len(content) and content[i+2:i+5].strip() == ',':
                            # 値の終了（次の行にカンマ）
                            result.append('"')
                            i += 1
                            # 次の行のカンマまでスキップ
                            while i < len(content) and content[i] != ',':
                                if content[i] == '\n':
                                    result.append('\\n')
                                else:
                                    result.append(content[i])
                                i += 1
                            if i < len(content):
                                result.append(',')
                                i += 1
                            break
                    
                    # 改行を\nに変換
                    if content[i] == '\n':
                        result.append('\\n')
                    else:
                        result.append(content[i])
                    i += 1
            else:
                result.append(content[i])
                i += 1
        else:
            result.append(content[i])
            i += 1
    
    # ファイルに書き込み
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(''.join(result))
    
    print(f"sourceフィールドの改行を修正しました: {filepath}")

if __name__ == '__main__':
    fix_source_newlines('wakaru/physics_spring_force_buoyancy_integrated.js')

