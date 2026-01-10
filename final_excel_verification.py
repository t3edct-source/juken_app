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

# 指摘された不足項目（提案追加項目）
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

# 指摘された項目がExcelに含まれているか確認
print("=" * 120)
print("指摘された不足項目がExcelに含まれているかの確認")
print("=" * 120)

# 指摘項目のキーワード
pointed_items = {
    "月": ["月", "満ち欠け", "動き", "公転"],
    "地層": ["地層"],
    "酸・アルカリ・中和": ["酸", "アルカリ", "中和"],
    "速さ": ["速さ", "距離", "時間", "グラフ"],
    "植物の分類": ["分類", "被子", "裸子", "単子葉", "双子葉"]
}

found_in_excel = {}
for key, keywords in pointed_items.items():
    found = []
    for excel_item in excel_items:
        unit = excel_item["単元"]
        if any(kw in unit for kw in keywords):
            found.append({
                "grade": excel_item["学年"],
                "field": excel_item["分野"],
                "unit": unit
            })
    found_in_excel[key] = found

print("\n【Excelファイル内での確認結果】")
print("-" * 120)

for key, found in found_in_excel.items():
    print(f"\n{key}:")
    if found:
        for item in found:
            print(f"  見つかった: [{item['field']}] {item['unit']} (学年: {item['grade']})")
    else:
        print(f"  Excelファイル内に見つかりませんでした")

# マッチング関数
def find_match(excel_unit, current_items, proposed_additions_for_grade=None):
    """Excelの単元名と現在のコンテンツをマッチング"""
    excel_clean = excel_unit.replace("（", "(").replace("）", ")")
    excel_clean = excel_clean.replace("①", "").replace("②", "").replace("1", "").replace("2", "").replace("(", "").replace(")", "")
    
    matches = []
    
    # 現在のコンテンツをチェック
    for item in current_items:
        title = item.get("title", "")
        title_clean = title.replace("〈覚える編〉", "").replace("〈わかる編〉", "").strip()
        
        # 総合コンテンツを除外
        if "総合" in title_clean:
            continue
        
        # 完全一致または部分一致
        if excel_clean in title_clean or title_clean in excel_clean:
            matches.append(item)
            continue
        
        # キーワードマッチング
        if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit):
            if "月" in title_clean or "moon" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        if "地層" in excel_unit:
            if "地層" in title_clean or "strata" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        if "酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit:
            if "酸" in title_clean or "アルカリ" in title_clean or "中和" in title_clean:
                matches.append(item)
                continue
        
        if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
            if "速さ" in title_clean or "速度" in title_clean:
                matches.append(item)
                continue
        
        if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit:
            if "分類" in title_clean:
                matches.append(item)
                continue
    
    # 提案された追加項目をチェック
    if proposed_additions_for_grade:
        for proposed in proposed_additions_for_grade:
            proposed_title = proposed["title"]
            
            # 月の満ち欠け
            if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit):
                if "月" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            # 地層
            if "地層" in excel_unit:
                if "地層" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            # 酸・アルカリ・中和（基礎）
            if ("酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit) and "計算" not in excel_unit:
                if "酸" in proposed_title or "中和" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            # 中和計算
            if "中和" in excel_unit and "計算" in excel_unit:
                if "計算" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            # 速さ
            if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
                if "速さ" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
            
            # 植物の分類
            if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit:
                if "分類" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    break
    
    return matches

# 指摘項目がExcelに含まれている場合の対応状況
print("\n" + "=" * 120)
print("指摘項目を追加した場合のExcel項目との一致度")
print("=" * 120)

# 指摘項目に関連するExcel項目を特定
pointed_related_items = []
for excel_item in excel_items:
    unit = excel_item["単元"]
    for key, keywords in pointed_items.items():
        if any(kw in unit for kw in keywords):
            pointed_related_items.append(excel_item)
            break

print(f"\n指摘項目に関連するExcel項目数: {len(pointed_related_items)}")

# 現在の対応状況
current_matched = 0
for item in pointed_related_items:
    grade = month_to_grade.get(item["学年"], None)
    if not grade and "年" in item["学年"]:
        try:
            grade = int(item["学年"].replace("年", ""))
        except:
            continue
    
    if grade:
        current_items = current_by_grade.get(grade, [])
        matches = find_match(item["単元"], current_items)
        if matches:
            current_matched += 1

# 提案追加後の対応状況
proposed_matched = 0
for item in pointed_related_items:
    grade = month_to_grade.get(item["学年"], None)
    if not grade and "年" in item["学年"]:
        try:
            grade = int(item["学年"].replace("年", ""))
        except:
            continue
    
    if grade:
        current_items = current_by_grade.get(grade, [])
        proposed = proposed_additions.get(grade, [])
        matches = find_match(item["単元"], current_items, proposed)
        if matches:
            proposed_matched += 1

print(f"現在の対応数: {current_matched}/{len(pointed_related_items)}")
print(f"提案追加後の対応数: {proposed_matched}/{len(pointed_related_items)}")
print(f"改善数: {proposed_matched - current_matched}項目")

if proposed_matched == len(pointed_related_items):
    print("\n[結果] 指摘項目を追加すると、Excel内の指摘項目に関連する項目と完全に一致します！")
else:
    print(f"\n[結果] 指摘項目を追加すると、{proposed_matched - current_matched}項目の不足が解消されます。")
    print(f"      残り: {len(pointed_related_items) - proposed_matched}項目")

# 全体的な一致度
print("\n" + "=" * 120)
print("全体的な一致度")
print("=" * 120)

total_excel = len(excel_items)
current_total_matched = 0
proposed_total_matched = 0

for grade in sorted(excel_by_grade.keys()):
    for excel_item in excel_by_grade[grade]:
        current_items = current_by_grade.get(grade, [])
        proposed = proposed_additions.get(grade, [])
        
        matches_current = find_match(excel_item["単元"], current_items)
        matches_proposed = find_match(excel_item["単元"], current_items, proposed)
        
        if matches_current:
            current_total_matched += 1
        if matches_proposed:
            proposed_total_matched += 1

print(f"Excelの総項目数: {total_excel}")
print(f"現在の対応数: {current_total_matched}/{total_excel} ({current_total_matched/total_excel*100:.1f}%)")
print(f"提案追加後の対応数: {proposed_total_matched}/{total_excel} ({proposed_total_matched/total_excel*100:.1f}%)")
print(f"改善数: {proposed_total_matched - current_total_matched}項目")


