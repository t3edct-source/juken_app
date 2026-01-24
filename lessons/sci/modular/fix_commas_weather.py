# -*- coding: utf-8 -*-
"""
earth_weather_observation_pressure_wind.jsのカンマを修正
choices配列内の要素にカンマを追加
"""

import re

filepath = 'wakaru/earth_weather_observation_pressure_wind.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# choices配列内の要素にカンマを追加
# "選択肢" の後にカンマがない場合（ただし、配列の最後の要素は除く）
lines = content.split('\n')
new_lines = []
in_choices = False
choices_count = 0

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # choices配列の開始を検出
    if '"choices":' in line and '[' in line:
        in_choices = True
        choices_count = 0
        new_lines.append(line)
        continue
    
    # choices配列の終了を検出
    if in_choices and stripped == ']':
        in_choices = False
        # 最後の要素の後にカンマがない場合は追加
        if i > 0 and not lines[i-1].rstrip().endswith(','):
            # 前の行にカンマを追加
            if new_lines:
                new_lines[-1] = new_lines[-1].rstrip() + ','
        new_lines.append(line)
        continue
    
    if in_choices:
        # choices配列内の要素
        if stripped.startswith('"') and stripped.endswith('"'):
            # 次の行が ] でない場合はカンマを追加
            if i + 1 < len(lines):
                next_stripped = lines[i + 1].strip()
                if next_stripped != ']' and not line.rstrip().endswith(','):
                    new_lines.append(line.rstrip() + ',')
                    continue
        
        new_lines.append(line)
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

# 正規表現でより確実に修正
# choices配列内の要素にカンマを追加
# "選択肢" の後に ] でない場合はカンマを追加
pattern = r'("choices":\s*\[)(.*?)(\])'
def fix_choices(match):
    prefix = match.group(1)
    choices_content = match.group(2)
    suffix = match.group(3)
    
    # 各行を処理
    lines = choices_content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('"') and stripped.endswith('"'):
            # 次の行が ] でない場合はカンマを追加
            if i + 1 < len(lines):
                next_stripped = lines[i + 1].strip()
                if next_stripped != ']' and not line.rstrip().endswith(','):
                    fixed_lines.append(line.rstrip() + ',')
                else:
                    fixed_lines.append(line)
            else:
                # 最後の行
                if not line.rstrip().endswith(','):
                    fixed_lines.append(line.rstrip() + ',')
                else:
                    fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    
    return prefix + '\n'.join(fixed_lines) + suffix

content = re.sub(pattern, fix_choices, content, flags=re.DOTALL)

# より簡単な方法：choices配列内の各行を確認
lines = content.split('\n')
new_lines = []
in_choices = False

for i, line in enumerate(lines):
    stripped = line.strip()
    
    if '"choices":' in line:
        in_choices = True
        new_lines.append(line)
        continue
    
    if in_choices:
        if stripped == ']':
            in_choices = False
            new_lines.append(line)
            continue
        
        # choices配列内の要素
        if stripped.startswith('"') and stripped.endswith('"'):
            # 次の行が ] でない場合はカンマを追加
            if i + 1 < len(lines):
                next_stripped = lines[i + 1].strip()
                if next_stripped != ']' and not line.rstrip().endswith(','):
                    new_lines.append(line.rstrip() + ',')
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

# choices配列の後にカンマがない場合を修正
content = re.sub(r'("choices":\s*\[.*?\])(\s*)(\n\s*"answer")', r'\1,\2\3', content, flags=re.DOTALL)

# answerの後にカンマがない場合を修正
content = re.sub(r'("answer":\s*\d+)(\s*)(\n\s*"source")', r'\1,\2\3', content)

# tagsの後にカンマがない場合を修正
content = re.sub(r'("tags":\s*\[.*?\])(\s*)(\n\s*"difficulty")', r'\1,\2\3', content, flags=re.DOTALL)

# difficultyの後にカンマがない場合を修正（最後の問題でない限り）
content = re.sub(r'("difficulty":\s*\d+)(\s*)(\n\s*"asof")', r'\1,\2\3', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("修正完了: earth_weather_observation_pressure_wind.js")

