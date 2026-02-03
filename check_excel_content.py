import openpyxl
import json

# Excelファイルを読み込む
excel_path = r"C:\Users\admin\Downloads\理科項目洗い出し.xlsx"
wb = openpyxl.load_workbook(excel_path)
ws = wb.active

# Excelの全データを読み込む
excel_all_items = []
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
            excel_all_items.append(item)

print("=" * 120)
print("Excelファイルの全項目")
print("=" * 120)

# 指摘項目のキーワードで検索
pointed_keywords = {
    "月": ["月", "満ち欠け", "動き", "公転"],
    "地層": ["地層"],
    "酸・アルカリ・中和": ["酸", "アルカリ", "中和"],
    "速さ": ["速さ", "速度", "距離", "時間", "グラフ"],
    "植物の分類": ["分類", "被子", "裸子", "単子葉", "双子葉"]
}

print("\n【指摘項目に関連するExcel項目の検索結果】")
print("-" * 120)

for key, keywords in pointed_keywords.items():
    print(f"\n{key}:")
    found = []
    for item in excel_all_items:
        unit = item["単元"]
        if any(kw in unit for kw in keywords):
            found.append(item)
            print(f"  見つかった: [{item['分野']}] {item['単元']} (学年: {item['学年']})")
    
    if not found:
        print(f"  Excelファイル内に見つかりませんでした")

print("\n" + "=" * 120)
print("Excelファイルの全項目一覧")
print("=" * 120)

# 学年別に整理
from collections import defaultdict
excel_by_grade = defaultdict(list)
month_to_grade = {
    "4月": 4, "5月": 4, "6月": 4,
    "7月": 4, "8月": 4, "9月": 4,
    "10月": 5, "11月": 5, "12月": 5,
    "1月": 5, "2月": 5, "3月": 5
}

for item in excel_all_items:
    month = item["学年"]
    if month in month_to_grade:
        grade = month_to_grade[month]
        excel_by_grade[grade].append(item)
    elif "年" in month:
        try:
            grade = int(month.replace("年", ""))
            excel_by_grade[grade].append(item)
        except:
            pass

for grade in sorted(excel_by_grade.keys()):
    print(f"\n【{grade}年生】")
    for item in excel_by_grade[grade]:
        print(f"  [{item['分野']}] {item['単元']}")

print(f"\n総項目数: {len(excel_all_items)}")








