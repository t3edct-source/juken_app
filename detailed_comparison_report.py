import sys
import json
import openpyxl
from collections import defaultdict

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

# より詳細な比較レポートを作成
print("=" * 100)
print("理科コンテンツ比較レポート")
print("=" * 100)

print(f"\n【概要】")
print(f"Excelファイルの項目数: {len(excel_items)}")
print(f"現在の理科コンテンツ数: {len(science_items)}")
print(f"  - わかる編: {len([i for i in science_items if i.get('subject') == 'sci'])}")
print(f"  - 覚える編: {len([i for i in science_items if i.get('subject') == 'science_drill'])}")

# Excelの学年を正規化（月→年への変換マッピング）
month_to_grade = {
    "4月": 4, "5月": 4, "6月": 4,
    "7月": 4, "8月": 4, "9月": 4,
    "10月": 5, "11月": 5, "12月": 5,
    "1月": 5, "2月": 5, "3月": 5
}

# Excel項目を学年別に整理
excel_by_grade = defaultdict(list)
for item in excel_items:
    month = item["学年"]
    if month in month_to_grade:
        grade = month_to_grade[month]
        excel_by_grade[grade].append(item)
    else:
        # 既に学年表記の場合
        if "年" in month:
            try:
                grade = int(month.replace("年", ""))
                excel_by_grade[grade].append(item)
            except:
                pass

# 現在のコンテンツを学年別に整理
current_by_grade = defaultdict(list)
for item in science_items:
    grade = item.get("grade")
    if grade:
        current_by_grade[grade].append(item)

print(f"\n【学年別比較】")
print("-" * 100)
for grade in sorted(set(list(excel_by_grade.keys()) + list(current_by_grade.keys()))):
    excel_count = len(excel_by_grade.get(grade, []))
    current_wakaru = len([i for i in current_by_grade.get(grade, []) if i.get('subject') == 'sci'])
    current_oboeru = len([i for i in current_by_grade.get(grade, []) if i.get('subject') == 'science_drill'])
    current_total = len(current_by_grade.get(grade, []))
    print(f"{grade}年生: Excel={excel_count}項目, 現在={current_total}コンテンツ (わかる:{current_wakaru}, 覚える:{current_oboeru})")

# 分野別に整理
print(f"\n【分野別比較】")
print("-" * 100)

excel_by_field = defaultdict(list)
for item in excel_items:
    field = item["分野"]
    excel_by_field[field].append(item)

current_by_field = defaultdict(list)
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    
    # IDから分野を判定
    if "biology" in id_str or "生物" in title or "植物" in title or "動物" in title or "人体" in title or "季節" in title:
        field = "生物"
    elif "physics" in id_str or "電気" in title or "電流" in title or "光" in title or "音" in title or "力" in title or "てこ" in title or "ばね" in title or "つり合い" in title:
        field = "物理"
    elif "chemistry" in id_str or "水" in title or "空気" in title or "燃焼" in title or "溶液" in title or "酸" in title or "アルカリ" in title or "溶解度" in title:
        field = "化学"
    elif "earth" in id_str or "天気" in title or "星" in title or "太陽" in title or "地震" in title or "火山" in title or "地層" in title or "川" in title or "星座" in title:
        field = "地学"
    elif "comprehensive" in id_str:
        field = "総合"
    else:
        field = "その他"
    
    current_by_field[field].append(item)

for field in sorted(set(list(excel_by_field.keys()) + list(current_by_field.keys()))):
    excel_count = len(excel_by_field.get(field, []))
    current_count = len(current_by_field.get(field, []))
    print(f"{field}: Excel={excel_count}項目, 現在={current_count}コンテンツ")

# Excelの各項目と現在のコンテンツの対応関係を確認
print(f"\n【Excel項目の詳細】")
print("-" * 100)
for grade in sorted(excel_by_grade.keys()):
    print(f"\n【{grade}年生】")
    for item in excel_by_grade[grade]:
        print(f"  分野: {item['分野']}, 単元: {item['単元']}")

print(f"\n【現在のコンテンツの詳細（学年別）】")
print("-" * 100)
for grade in sorted(current_by_grade.keys()):
    print(f"\n【{grade}年生】")
    wakaru_items = [i for i in current_by_grade[grade] if i.get('subject') == 'sci']
    oboeru_items = [i for i in current_by_grade[grade] if i.get('subject') == 'science_drill']
    
    if wakaru_items:
        print(f"  【わかる編】")
        for item in wakaru_items:
            print(f"    - {item.get('title', '不明')}")
    
    if oboeru_items:
        print(f"  【覚える編】")
        for item in oboeru_items:
            print(f"    - {item.get('title', '不明')}")

# 不足している項目を特定
print(f"\n【不足している可能性のある項目の分析】")
print("-" * 100)
print("Excelにはあるが、現在のコンテンツに明確に対応するものが見つからない項目:")
print()

for grade in sorted(excel_by_grade.keys()):
    excel_units = [item["単元"] for item in excel_by_grade[grade]]
    current_titles = [item.get("title", "").replace("〈覚える編〉", "").replace("〈わかる編〉", "").strip() 
                     for item in current_by_grade[grade]]
    
    for excel_unit in excel_units:
        # 簡易的なマッチング
        unit_clean = excel_unit.replace("（", "(").replace("）", ")").replace("①", "").replace("②", "").replace("1", "").replace("2", "").strip()
        matched = False
        for title in current_titles:
            if unit_clean in title or title in unit_clean:
                matched = True
                break
        
        if not matched:
            print(f"  {grade}年生: {excel_unit}")










