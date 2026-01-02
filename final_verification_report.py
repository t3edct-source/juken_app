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
        continue
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

# 理科コンテンツのみを抽出（6年生の総合コンテンツを除外）
science_items = []
for item in catalog:
    if item.get("subject") == "sci" or item.get("subject") == "science_drill":
        if item.get("grade") == 6:
            id_str = item.get("id", "")
            title = item.get("title", "")
            if "comprehensive" in id_str.lower() or "総合" in title:
                continue
        science_items.append(item)

# 月→学年のマッピング
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
    elif "年" in month:
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

# 提案された追加項目
proposed_additions = {
    4: [
        {"title": "月の満ち欠け／月の動き", "field": "地学"},
        {"title": "植物の分類（被子/裸子、単子葉/双子葉）", "field": "生物"}
    ],
    5: [
        {"title": "地層の基礎", "field": "地学"},
        {"title": "酸・アルカリ・中和（基礎）", "field": "化学"},
        {"title": "速さ（距離・時間・速さ）／運動のグラフ", "field": "物理"}
    ],
    6: [
        {"title": "月の満ち欠け（応用）", "field": "地学"},
        {"title": "中和計算", "field": "化学"}
    ]
}

# マッチング関数（既存のロジックを使用）
def find_match(excel_unit, current_items, proposed_additions_for_grade=None):
    excel_clean = excel_unit.replace("（", "(").replace("）", ")")
    excel_clean = excel_clean.replace("①", "").replace("②", "").replace("1", "").replace("2", "").replace("(", "").replace(")", "")
    
    matches = []
    for item in current_items:
        title = item.get("title", "")
        title_clean = title.replace("〈覚える編〉", "").replace("〈わかる編〉", "").strip()
        
        if "総合" in title_clean:
            continue
        
        if excel_clean in title_clean or title_clean in excel_clean:
            matches.append(item)
            continue
        
        # キーワードマッチング
        if "電気" in excel_unit and "回路" in excel_unit:
            if "電気" in title_clean and ("回路" in title_clean or "基礎" in title_clean):
                matches.append(item)
                continue
        
        if "溶け" in excel_unit:
            if "溶け" in title_clean or "溶解" in title_clean:
                matches.append(item)
                continue
        
        if "乾電池" in excel_unit and "豆電球" in excel_unit:
            if ("乾電池" in title_clean and "豆電球" in title_clean) or ("電気" in title_clean and "乾電池" in title_clean):
                matches.append(item)
                continue
        
        if "季節" in excel_unit and "生物" in excel_unit:
            if "季節" in title_clean and "生物" in title_clean:
                matches.append(item)
                continue
        
        if "川" in excel_unit:
            if "川" in title_clean or "river" in item.get("id", "").lower():
                matches.append(item)
                continue
    
    # 提案された追加項目をチェック
    if proposed_additions_for_grade:
        for proposed in proposed_additions_for_grade:
            proposed_title = proposed["title"]
            
            if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit):
                if "月" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            if "地層" in excel_unit:
                if "地層" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            if ("酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit) and "計算" not in excel_unit:
                if "酸" in proposed_title or "中和" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            if "中和" in excel_unit and "計算" in excel_unit:
                if "計算" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
                if "速さ" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit:
                if "分類" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
    
    return matches

# 結果を出力
print("=" * 120)
print("指摘項目を追加した場合のExcel項目との一致度")
print("=" * 120)

total_excel = len(excel_items)
current_matched = 0
proposed_matched = 0

for grade in sorted(excel_by_grade.keys()):
    for excel_item in excel_by_grade[grade]:
        current_items = current_by_grade.get(grade, [])
        proposed = proposed_additions.get(grade, [])
        
        matches_current = find_match(excel_item["単元"], current_items)
        matches_proposed = find_match(excel_item["単元"], current_items, proposed)
        
        if matches_current:
            current_matched += 1
        if matches_proposed:
            proposed_matched += 1

print(f"\nExcelの総項目数: {total_excel}")
print(f"現在の対応数: {current_matched}/{total_excel} ({current_matched/total_excel*100:.1f}%)")
print(f"提案追加後の対応数: {proposed_matched}/{total_excel} ({proposed_matched/total_excel*100:.1f}%)")
print(f"改善数: {proposed_matched - current_matched}項目")

print("\n" + "=" * 120)
print("【結論】")
print("=" * 120)

if proposed_matched == total_excel:
    print("[結果] 指摘項目を追加すると、Excelファイルの全項目と完全に一致します！")
elif proposed_matched > current_matched:
    print(f"[結果] 指摘項目を追加すると、{proposed_matched - current_matched}項目の不足が解消されます。")
    print(f"   対応率: {current_matched/total_excel*100:.1f}% -> {proposed_matched/total_excel*100:.1f}%")
    print(f"   残りの不足項目数: {total_excel - proposed_matched}項目")
else:
    print("[結果] 指摘項目を追加しても、Excelファイルとの一致度は変わりません。")
    print("   これは、指摘項目がExcelファイルに直接記載されていないためです。")
    print("   ただし、指摘項目は「頻出項目」として追加すべき項目です。")

print("\n【重要なポイント】")
print("-" * 120)
print("1. 指摘項目（月、地層、酸・アルカリ・中和、速さ、植物の分類）は")
print("   「頻出項目」として追加すべき項目です。")
print("2. Excelファイルに直接記載されていなくても、入試対策として重要です。")
print("3. 指摘項目を追加することで、入試対策の網羅性が向上します。")

