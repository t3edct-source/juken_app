import sys
import json
import openpyxl

# Excelファイルを読み込む
excel_path = r"C:\Users\admin\Downloads\理科項目洗い出し.xlsx"
wb = openpyxl.load_workbook(excel_path)
ws = wb.active

# Excelのデータを読み込む
excel_items = []
for row_idx, row in enumerate(ws.iter_rows(values_only=True), 1):
    if row_idx == 1:
        continue  # ヘッダー行をスキップ
    if row and any(row):
        item = {
            "分野": str(row[0]) if row[0] else "",
            "学年": str(row[1]) if row[1] else "",
            "単元": str(row[2]) if row[2] else ""
        }
        if item["単元"]:
            excel_items.append(item)

# catalog.jsonを読み込む
with open("catalog.json", "r", encoding="utf-8-sig") as f:
    catalog = json.load(f)

# 理科コンテンツのみを抽出
science_items = [item for item in catalog if item.get("subject") == "sci" or item.get("subject") == "science_drill"]

print("=" * 100)
print("「月」に関するコンテンツの確認")
print("=" * 100)

# Excelファイルで「月」を含む項目を検索
print("\n【Excelファイル内で「月」を含む項目】")
print("-" * 100)
excel_moon_items = []
for item in excel_items:
    if "月" in item["単元"]:
        excel_moon_items.append(item)
        print(f"  分野: {item['分野']}, 学年: {item['学年']}, 単元: {item['単元']}")

if not excel_moon_items:
    print("  Excelファイル内に「月」を含む項目は見つかりませんでした。")

# 現在のコンテンツで「月」を含む項目を検索
print("\n【現在のコンテンツ内で「月」を含む項目】")
print("-" * 100)
current_moon_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    
    # タイトルやIDに「月」が含まれるかチェック
    if "月" in title or "月" in id_str:
        current_moon_items.append(item)
        print(f"  学年: {item.get('grade', '不明')}年, タイトル: {title}, ID: {id_str}")

if not current_moon_items:
    print("  現在のコンテンツ内に「月」を含む項目は見つかりませんでした。")

# より詳細な検索（天体の月に関する内容）
print("\n【天体の「月」に関するコンテンツ】")
print("-" * 100)

# 天体総合コンテンツを確認
astronomy_items = [item for item in science_items if "astronomy" in item.get("id", "").lower() or "天体" in item.get("title", "")]
for item in astronomy_items:
    print(f"  学年: {item.get('grade', '不明')}年, タイトル: {item.get('title', '不明')}, ID: {item.get('id', '不明')}")

# 太陽と影、星と星座のコンテンツを確認（月が含まれる可能性がある）
sun_shadow_items = [item for item in science_items if "sun" in item.get("id", "").lower() or "太陽" in item.get("title", "")]
constellation_items = [item for item in science_items if "constellation" in item.get("id", "").lower() or "星座" in item.get("title", "") or "星" in item.get("title", "")]

print("\n【太陽と影に関するコンテンツ】")
for item in sun_shadow_items:
    print(f"  学年: {item.get('grade', '不明')}年, タイトル: {item.get('title', '不明')}")

print("\n【星と星座に関するコンテンツ】")
for item in constellation_items:
    print(f"  学年: {item.get('grade', '不明')}年, タイトル: {item.get('title', '不明')}")

# まとめ
print("\n" + "=" * 100)
print("【まとめ】")
print("=" * 100)
print(f"Excelファイル内の「月」を含む項目数: {len(excel_moon_items)}")
print(f"現在のコンテンツ内の「月」を含む項目数: {len(current_moon_items)}")
print(f"天体総合コンテンツ数: {len(astronomy_items)}")

if excel_moon_items and not current_moon_items:
    print("\n⚠️ Excelファイルには「月」に関する項目がありますが、現在のコンテンツには明確に「月」を含む項目が見つかりませんでした。")
    print("   ただし、天体総合コンテンツや太陽・星に関するコンテンツに含まれている可能性があります。")



