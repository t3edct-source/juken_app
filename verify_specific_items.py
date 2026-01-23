import sys
import json
import openpyxl

# catalog.jsonを読み込む
with open("catalog.json", "r", encoding="utf-8-sig") as f:
    catalog = json.load(f)

# 理科コンテンツのみを抽出（6年生の総合コンテンツを除外）
science_items = []
for item in catalog:
    if item.get("subject") == "sci" or item.get("subject") == "science_drill":
        # 6年生の総合コンテンツを除外
        if item.get("grade") == 6:
            id_str = item.get("id", "")
            title = item.get("title", "")
            if "comprehensive" in id_str.lower() or "総合" in title:
                continue
        science_items.append(item)

print("=" * 100)
print("指摘された項目の確認")
print("=" * 100)

# 1. 電気と回路
print("\n【1. 電気と回路】")
print("-" * 100)
electricity_circuit_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "電気" in title and ("回路" in title or "circuit" in id_str.lower()):
        electricity_circuit_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        print()

if not electricity_circuit_items:
    print("  見つかりませんでした")

# 2. ものの溶け方
print("\n【2. ものの溶け方】")
print("-" * 100)
dissolution_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "溶け" in title or "dissolution" in id_str.lower() or "solution" in id_str.lower():
        dissolution_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        print()

if not dissolution_items:
    print("  見つかりませんでした")

# 3. 乾電池と豆電球
print("\n【3. 乾電池と豆電球】")
print("-" * 100)
battery_bulb_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if ("乾電池" in title and "豆電球" in title) or ("乾電池" in title and "電気" in title):
        battery_bulb_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        print()

if not battery_bulb_items:
    print("  見つかりませんでした")

# より広範囲に検索
print("\n【補足：関連するコンテンツ】")
print("-" * 100)

# 電気関連全般
print("\n電気関連のコンテンツ:")
electricity_all = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "電気" in title or "electricity" in id_str.lower():
        electricity_all.append(item)
        print(f"  {item.get('grade', '不明')}年: {title}")

# 溶け方関連全般
print("\n溶け方・溶解関連のコンテンツ:")
dissolution_all = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "溶け" in title or "溶解" in title or "溶液" in title or "dissolution" in id_str.lower():
        dissolution_all.append(item)
        print(f"  {item.get('grade', '不明')}年: {title}")

# まとめ
print("\n" + "=" * 100)
print("【まとめ】")
print("=" * 100)
print(f"1. 電気と回路: {len(electricity_circuit_items)}件")
print(f"2. ものの溶け方: {len(dissolution_items)}件")
print(f"3. 乾電池と豆電球: {len(battery_bulb_items)}件")
print(f"\n電気関連全般: {len(electricity_all)}件")
print(f"溶け方・溶解関連全般: {len(dissolution_all)}件")





