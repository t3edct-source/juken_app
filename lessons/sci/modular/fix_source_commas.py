# -*- coding: utf-8 -*-
"""
sourceフィールドの後にカンマがない場合を修正
"""

import re

filepath = 'wakaru/earth_weather_observation_pressure_wind.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# sourceフィールドの後にカンマがない場合を修正
# "source": "..." の後に "tags" が来る場合はカンマを追加
content = re.sub(
    r'("source":\s*"[^"]*")\s*(\n\s*"tags")',
    r'\1,\2',
    content
)

# sourceフィールドの後にカンマがない場合を修正（その他の場合）
content = re.sub(
    r'("source":\s*"[^"]*")\s*(\n\s*"[^"]+":)',
    r'\1,\2',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("修正完了: earth_weather_observation_pressure_wind.js")

