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

# マッチング関数（改善版）
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
        keywords = {
            "月": ["月", "moon"],
            "地層": ["地層", "strata"],
            "化石": ["化石", "fossil"],
            "酸": ["酸", "acid"],
            "アルカリ": ["アルカリ", "alkali"],
            "中和": ["中和", "neutral"],
            "速さ": ["速さ", "速度", "speed"],
            "分類": ["分類", "classification"],
            "被子": ["被子"],
            "裸子": ["裸子"],
            "単子葉": ["単子葉"],
            "双子葉": ["双子葉"],
            "電気": ["電気", "electric"],
            "回路": ["回路", "circuit"],
            "溶け": ["溶け", "溶解", "dissolution"],
            "乾電池": ["乾電池", "battery"],
            "豆電球": ["豆電球", "bulb"],
            "季節": ["季節", "season"],
            "生物": ["生物", "biology"],
            "川": ["川", "river"],
            "石": ["石", "stone"],
            "土": ["土", "soil"],
            "植物": ["植物", "plant"],
            "花": ["花", "flower"],
            "空気": ["空気", "air"],
            "天気": ["天気", "weather"],
            "星": ["星", "star", "星座"],
            "気温": ["気温", "temperature"],
            "性質": ["性質", "property"],
            "燃え": ["燃え", "燃焼", "combustion"]
        }
        
        # キーワードマッチング
        for keyword, search_terms in keywords.items():
            if keyword in excel_unit:
                for term in search_terms:
                    if term in title_clean.lower() or term in item.get("id", "").lower():
                        matches.append(item)
                        break
                if matches:
                    break
    
    # 提案された追加項目をチェック
    if proposed_additions_for_grade:
        for proposed in proposed_additions_for_grade:
            proposed_title = proposed["title"]
            
            # 月の満ち欠け
            if "月" in excel_unit and ("満ち欠け" in excel_unit or "動き" in excel_unit or "公転" in excel_unit):
                if "月" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
            
            # 地層
            if "地層" in excel_unit:
                if "地層" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
            
            # 酸・アルカリ・中和
            if ("酸" in excel_unit or "アルカリ" in excel_unit or "中和" in excel_unit) and "計算" not in excel_unit:
                if "酸" in proposed_title or "中和" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
            
            # 中和計算
            if "中和" in excel_unit and "計算" in excel_unit:
                if "計算" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
            
            # 速さ
            if "速さ" in excel_unit or ("距離" in excel_unit and "時間" in excel_unit):
                if "速さ" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
            
            # 植物の分類
            if "分類" in excel_unit or "被子" in excel_unit or "裸子" in excel_unit or "単子葉" in excel_unit or "双子葉" in excel_unit:
                if "分類" in proposed_title:
                    matches.append({"title": proposed_title, "proposed": True, "field": proposed["field"]})
                    break
    
    return matches

# 不足項目を特定（提案された追加項目を含む場合）
print("=" * 120)
print("Excel項目とコンテンツの詳細比較")
print("（提案された追加項目を含む）")
print("=" * 120)

missing_with_proposals = []
matched_items = []

for grade in sorted(excel_by_grade.keys()):
    print(f"\n【{grade}年生】")
    print("-" * 120)
    
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
            print(f"  [不足] 分野: {excel_item['分野']}")
            print(f"     単元: {excel_unit}")
        else:
            matched_items.append({
                "grade": grade,
                "field": excel_item["分野"],
                "unit": excel_unit,
                "matches": matches
            })
            print(f"  [対応] 分野: {excel_item['分野']}")
            print(f"     単元: {excel_unit}")
            for match in matches[:1]:  # 最初の1つだけ表示
                if isinstance(match, dict) and match.get("proposed"):
                    print(f"     対応: {match['title']} (提案追加)")
                else:
                    print(f"     対応: {match.get('title', '不明')}")

# まとめ
print("\n" + "=" * 120)
print("【まとめ】")
print("=" * 120)

total_excel = sum(len(excel_by_grade[g]) for g in excel_by_grade.keys())
matched_count = len(matched_items)
missing_count = len(missing_with_proposals)

print(f"Excelの総項目数: {total_excel}")
print(f"対応済み項目数: {matched_count}")
print(f"不足項目数: {missing_count}")
print(f"対応率: {matched_count/total_excel*100:.1f}%")

if missing_with_proposals:
    print(f"\n残りの不足項目（{missing_count}項目）:")
    print("-" * 120)
    for grade in sorted(set([m["grade"] for m in missing_with_proposals])):
        print(f"\n【{grade}年生】")
        for item in [m for m in missing_with_proposals if m["grade"] == grade]:
            print(f"  [{item['field']}] {item['unit']}")



