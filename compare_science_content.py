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

# 比較結果を出力
print("=" * 80)
print("Excelファイルの項目数:", len(excel_items))
print("現在の理科コンテンツ数:", len(science_items))
print("=" * 80)
print("\n【Excelファイルの項目一覧】")
print("-" * 80)
for item in excel_items:
    print(f"分野: {item['分野']}, 学年: {item['学年']}, 単元: {item['単元']}")

print("\n【現在の理科コンテンツ一覧】")
print("-" * 80)
for item in science_items:
    grade = item.get("grade", "不明")
    title = item.get("title", "不明")
    subject_type = item.get("subject", "不明")
    print(f"学年: {grade}年, タイトル: {title}, タイプ: {subject_type}")

# 単元名のマッピング（簡易的な比較のため）
print("\n【比較結果】")
print("-" * 80)

# Excelの単元名をキーワードとして抽出
excel_keywords = []
for item in excel_items:
    keywords = item["単元"].replace("（", "(").replace("）", ")").replace("①", "").replace("②", "").replace("1", "").replace("2", "").strip()
    excel_keywords.append(keywords)

# 現在のコンテンツのタイトルからキーワードを抽出
current_keywords = []
for item in science_items:
    title = item.get("title", "")
    # 覚える編などのサフィックスを除去
    title_clean = title.replace("〈覚える編〉", "").replace("〈わかる編〉", "").strip()
    current_keywords.append(title_clean)

print(f"\nExcel項目数: {len(excel_items)}")
print(f"現在のコンテンツ数: {len(science_items)}")

# 詳細な比較レポートを作成
print("\n【詳細比較レポート】")
print("=" * 80)

# 学年別に分類
excel_by_grade = {}
for item in excel_items:
    grade = item["学年"]
    if grade not in excel_by_grade:
        excel_by_grade[grade] = []
    excel_by_grade[grade].append(item)

current_by_grade = {}
for item in science_items:
    grade = f"{item.get('grade', '不明')}年"
    if grade not in current_by_grade:
        current_by_grade[grade] = []
    current_by_grade[grade].append(item)

print("\n【学年別比較】")
for grade in sorted(set(list(excel_by_grade.keys()) + list(current_by_grade.keys()))):
    excel_count = len(excel_by_grade.get(grade, []))
    current_count = len(current_by_grade.get(grade, []))
    print(f"{grade}: Excel={excel_count}項目, 現在={current_count}コンテンツ")

# 分野別に分類
excel_by_field = {}
for item in excel_items:
    field = item["分野"]
    if field not in excel_by_field:
        excel_by_field[field] = []
    excel_by_field[field].append(item)

current_by_field = {}
for item in science_items:
    title = item.get("title", "")
    # タイトルから分野を推測（簡易的）
    if "生物" in title or "植物" in title or "動物" in title or "人体" in title or "季節" in title:
        field = "生物"
    elif "電気" in title or "電流" in title or "光" in title or "音" in title or "力" in title or "てこ" in title or "ばね" in title:
        field = "物理"
    elif "水" in title or "空気" in title or "燃焼" in title or "溶液" in title or "酸" in title or "アルカリ" in title:
        field = "化学"
    elif "天気" in title or "星" in title or "太陽" in title or "地震" in title or "火山" in title or "地層" in title or "川" in title:
        field = "地学"
    else:
        field = "その他"
    
    if field not in current_by_field:
        current_by_field[field] = []
    current_by_field[field].append(item)

print("\n【分野別比較】")
for field in sorted(set(list(excel_by_field.keys()) + list(current_by_field.keys()))):
    excel_count = len(excel_by_field.get(field, []))
    current_count = len(current_by_field.get(field, []))
    print(f"{field}: Excel={excel_count}項目, 現在={current_count}コンテンツ")

