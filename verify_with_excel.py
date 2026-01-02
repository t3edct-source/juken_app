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

# 指摘された不足項目を追加した場合の想定コンテンツ
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

# より詳細なマッチング関数（指摘項目を反映）
def find_match(excel_unit, current_items, proposed_additions_for_grade=None):
    """Excelの単元名と現在のコンテンツをマッチング"""
    excel_clean = excel_unit.replace("（", "(").replace("）", ")")
    excel_clean = excel_clean.replace("①", "").replace("②", "").replace("1", "").replace("2", "").replace("(", "").replace(")", "")
    
    matches = []
    for item in current_items:
        title = item.get("title", "")
        title_clean = title.replace("〈覚える編〉", "").replace("〈わかる編〉", "").strip()
        
        # 総合コンテンツを除外
        if "総合" in title_clean:
            continue
        
        # 完全一致または部分一致をチェック
        if excel_clean in title_clean or title_clean in excel_clean:
            matches.append(item)
            continue
        
        # より詳細なマッチング
        # 電気と回路
        if "電気" in excel_unit and "回路" in excel_unit:
            if "電気" in title_clean and ("回路" in title_clean or "基礎" in title_clean):
                matches.append(item)
                continue
        
        # ものの溶け方
        if "溶け" in excel_unit:
            if "溶け" in title_clean or "溶解" in title_clean:
                matches.append(item)
                continue
        
        # 乾電池と豆電球
        if "乾電池" in excel_unit and "豆電球" in excel_unit:
            if ("乾電池" in title_clean and "豆電球" in title_clean) or ("電気" in title_clean and "乾電池" in title_clean):
                matches.append(item)
                continue
        
        # 季節と生物（秋）
        if "季節" in excel_unit and "生物" in excel_unit and "秋" in excel_unit:
            if "季節" in title_clean and "生物" in title_clean and ("夏" in title_clean or "summer" in item.get("id", "").lower()):
                matches.append(item)
                continue
        
        # 季節と生物（まとめ）
        if "季節" in excel_unit and "生物" in excel_unit and "まとめ" in excel_unit:
            if "季節" in title_clean and "生物" in title_clean and ("sim" in item.get("id", "").lower() or "annual" in item.get("id", "").lower()):
                matches.append(item)
                continue
        
        # 川・石・土
        if "川" in excel_unit and ("石" in excel_unit or "土" in excel_unit):
            if "川" in title_clean or "river" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        # 月の満ち欠け
        if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit or "公転" in excel_unit):
            if "月" in title_clean or "moon" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        # 地層
        if "地層" in excel_unit:
            if "地層" in title_clean or "strata" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        # 酸・アルカリ・中和
        if "酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit:
            if "酸" in title_clean or "アルカリ" in title_clean or "中和" in title_clean:
                matches.append(item)
                continue
        
        # 速さ
        if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
            if "速さ" in title_clean or "速度" in title_clean or "speed" in item.get("id", "").lower():
                matches.append(item)
                continue
        
        # 植物の分類
        if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit or "単子葉" in excel_unit or "双子葉" in excel_unit:
            if "分類" in title_clean or "被子" in title_clean or "裸子" in title_clean:
                matches.append(item)
                continue
        
        # 季節と生物（一般的）
        if "季節" in excel_unit and "生物" in excel_unit:
            if "季節" in title_clean and "生物" in title_clean:
                matches.append(item)
                continue
        
        # 植物関連
        if "植物" in excel_unit:
            if "植物" in title_clean:
                matches.append(item)
                continue
        
        # 花関連
        if "花" in excel_unit:
            if "花" in title_clean:
                matches.append(item)
                continue
        
        # 空気関連
        if "空気" in excel_unit:
            if "空気" in title_clean:
                matches.append(item)
                continue
        
        # 天気関連
        if "天気" in excel_unit:
            if "天気" in title_clean:
                matches.append(item)
                continue
        
        # 星関連
        if "星" in excel_unit:
            if "星" in title_clean or "星座" in title_clean:
                matches.append(item)
                continue
        
        # 気温関連
        if "気温" in excel_unit:
            if "気温" in title_clean or "天気" in title_clean:
                matches.append(item)
                continue
        
        # ものの性質
        if "性質" in excel_unit:
            if "性質" in title_clean:
                matches.append(item)
                continue
        
        # 燃え方
        if "燃え" in excel_unit:
            if "燃焼" in title_clean or "燃え" in title_clean:
                matches.append(item)
                continue
    
    # 提案された追加項目もチェック
    if proposed_additions_for_grade:
        for proposed in proposed_additions_for_grade:
            proposed_title = proposed["title"]
            # 月の満ち欠け
            if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit):
                if "月" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    continue
            # 地層
            if "地層" in excel_unit:
                if "地層" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    continue
            # 酸・アルカリ・中和
            if "酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit:
                if "酸" in proposed_title or "中和" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    continue
            # 速さ
            if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
                if "速さ" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    continue
            # 植物の分類
            if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit:
                if "分類" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True})
                    continue
    
    return matches

# 不足項目を特定（現在のコンテンツのみ）
print("=" * 120)
print("現在のコンテンツでの不足項目")
print("=" * 120)

missing_current = []

for grade in sorted(excel_by_grade.keys()):
    for excel_item in excel_by_grade[grade]:
        excel_unit = excel_item["単元"]
        current_items = current_by_grade.get(grade, [])
        
        matches = find_match(excel_unit, current_items)
        
        if not matches:
            missing_current.append({
                "grade": grade,
                "field": excel_item["分野"],
                "unit": excel_unit
            })

print(f"現在の不足項目数: {len(missing_current)}")

# 不足項目を特定（提案された追加項目を含む場合）
print("\n" + "=" * 120)
print("提案された追加項目を含む場合の不足項目")
print("=" * 120)

missing_with_proposals = []

for grade in sorted(excel_by_grade.keys()):
    for excel_item in excel_by_grade[grade]:
        excel_unit = excel_item["単元"]
        current_items = current_by_grade.get(grade, [])
        proposed = proposed_additions.get(grade, [])
        
        matches = find_match(excel_unit, current_items, proposed)
        
        if not matches:
            missing_with_proposals.append({
                "grade": grade,
                "field": excel_item["分野"],
                "unit": excel_unit
            })

print(f"提案追加後の不足項目数: {len(missing_with_proposals)}")

# 比較結果
print("\n" + "=" * 120)
print("比較結果")
print("=" * 120)

improvement = len(missing_current) - len(missing_with_proposals)
print(f"現在の不足項目数: {len(missing_current)}")
print(f"提案追加後の不足項目数: {len(missing_with_proposals)}")
print(f"改善数: {improvement}項目")

if len(missing_with_proposals) == 0:
    print("\n[結果] 提案された追加項目を含めると、Excelの全項目と一致します！")
elif len(missing_with_proposals) < len(missing_current):
    print(f"\n[結果] 提案された追加項目を含めると、{improvement}項目の不足が解消されます。")
    print(f"      残りの不足項目数: {len(missing_with_proposals)}項目")
    
    if missing_with_proposals:
        print("\n残りの不足項目:")
        print("-" * 120)
        for grade in sorted(set([m["grade"] for m in missing_with_proposals])):
            print(f"\n【{grade}年生】")
            for item in [m for m in missing_with_proposals if m["grade"] == grade]:
                print(f"  [{item['field']}] {item['unit']}")
else:
    print("\n[結果] 提案された追加項目を含めても、不足項目数に変化はありません。")

