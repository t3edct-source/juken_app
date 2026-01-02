import sys
import json

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
print("指摘された追加項目の確認")
print("=" * 100)

# 1. 季節と生物（秋）
print("\n【1. 季節と生物（秋）】")
print("-" * 100)
autumn_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "季節" in title and "生物" in title:
        autumn_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        # 秋が含まれているか確認
        if "秋" in title or "夏" in title or "summer" in id_str.lower():
            print(f"  → 秋の内容を含む可能性あり")
        print()

if not autumn_items:
    print("  見つかりませんでした")

# 2. 季節と生物（まとめ）
print("\n【2. 季節と生物（まとめ）】")
print("-" * 100)
summary_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if ("季節" in title and "生物" in title) or "kisetsu" in id_str.lower():
        summary_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        # まとめ的な内容か確認
        if "まとめ" in title or "sim" in id_str.lower() or "annual" in id_str.lower():
            print(f"  → まとめ的な内容の可能性あり")
        print()

if not summary_items:
    print("  見つかりませんでした")

# 3. 川・石・土
print("\n【3. 川・石・土】")
print("-" * 100)
river_stone_soil_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "川" in title or "river" in id_str.lower() or "erosion" in id_str.lower():
        river_stone_soil_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年")
        print(f"  タイトル: {title}")
        print(f"  ID: {id_str}")
        # 石や土が含まれているか確認
        if "石" in title or "土" in title or "土砂" in title:
            print(f"  → 石・土の内容を含む")
        print()

if not river_stone_soil_items:
    print("  見つかりませんでした")

# より詳細な確認
print("\n【詳細確認】")
print("-" * 100)

# 季節と生物の全コンテンツ
print("\n季節と生物に関する全コンテンツ:")
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "季節" in title and "生物" in title:
        print(f"  {item.get('grade', '不明')}年: {title} (ID: {id_str})")

# 川に関する全コンテンツ
print("\n川に関する全コンテンツ:")
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "川" in title or "river" in id_str.lower():
        print(f"  {item.get('grade', '不明')}年: {title} (ID: {id_str})")

# まとめ
print("\n" + "=" * 100)
print("【まとめ】")
print("=" * 100)
print(f"1. 季節と生物（秋）関連: {len(autumn_items)}件")
print(f"2. 季節と生物（まとめ）関連: {len(summary_items)}件")
print(f"3. 川・石・土関連: {len(river_stone_soil_items)}件")

