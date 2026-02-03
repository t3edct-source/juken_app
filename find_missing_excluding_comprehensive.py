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
            # 総合コンテンツを除外
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

# キーワード抽出関数
def extract_keywords(text):
    """テキストからキーワードを抽出"""
    if not text:
        return []
    
    # 括弧内の数字や記号を除去
    text = text.replace("（", "(").replace("）", ")")
    # 数字や記号を除去
    import re
    text = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]', '', text)
    text = re.sub(r'[0-9]', '', text)
    text = re.sub(r'[()（）]', '', text)
    
    # キーワードを抽出
    keywords = []
    common_keywords = [
        "季節", "生物", "植物", "動物", "人体", "花", "受粉",
        "電気", "電流", "乾電池", "豆電球", "回路", "発熱", "磁界",
        "光", "音", "力", "てこ", "ばね", "つり合い", "浮力",
        "水", "空気", "燃焼", "溶液", "酸", "アルカリ", "溶解度",
        "天気", "星", "太陽", "影", "星座", "地震", "火山", "地層", "川",
        "温度", "状態変化", "氷", "水蒸気", "蒸発", "沸騰", "月"
    ]
    
    for kw in common_keywords:
        if kw in text:
            keywords.append(kw)
    
    return keywords

# マッチング関数（より詳細に）
def find_match(excel_unit, current_items):
    """Excelの単元名と現在のコンテンツをマッチング"""
    excel_keywords = extract_keywords(excel_unit)
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
        
        # キーワードマッチング
        title_keywords = extract_keywords(title_clean)
        if excel_keywords and any(kw in title_keywords for kw in excel_keywords):
            matches.append(item)
            continue
        
        # より詳細なマッチング
        # 季節と生物
        if "季節" in excel_unit and "季節" in title_clean:
            if "春" in excel_unit and "春" in title_clean:
                matches.append(item)
            elif "夏" in excel_unit and "夏" in title_clean:
                matches.append(item)
            elif "秋" in excel_unit and "秋" in title_clean:
                matches.append(item)
            elif "冬" in excel_unit and "冬" in title_clean:
                matches.append(item)
            elif "まとめ" in excel_unit and "まとめ" in title_clean:
                matches.append(item)
            continue
        
        # 電気関連
        if "電気" in excel_unit and "電気" in title_clean:
            if "乾電池" in excel_unit and "乾電池" in title_clean:
                matches.append(item)
            elif "回路" in excel_unit and "回路" in title_clean:
                matches.append(item)
            elif "豆電球" in excel_unit and "豆電球" in title_clean:
                matches.append(item)
            continue
        
        # 植物関連
        if "植物" in excel_unit or "花" in excel_unit:
            if "植物" in title_clean or "花" in title_clean:
                matches.append(item)
            continue
        
        # 人体関連
        if "人体" in excel_unit or "体" in excel_unit:
            if "人体" in title_clean or "体" in title_clean:
                matches.append(item)
            continue
        
        # 水関連
        if "水" in excel_unit and "水" in title_clean:
            matches.append(item)
            continue
        
        # 天気関連
        if "天気" in excel_unit and "天気" in title_clean:
            matches.append(item)
            continue
        
        # 星関連
        if "星" in excel_unit and "星" in title_clean:
            matches.append(item)
            continue
        
        # 月関連
        if "月" in excel_unit and "月" in title_clean:
            matches.append(item)
            continue
        
        # 気温関連
        if "気温" in excel_unit and "気温" in title_clean:
            matches.append(item)
            continue
        
        # 溶け方関連
        if "溶け" in excel_unit and "溶け" in title_clean:
            matches.append(item)
            continue
        
        # ものの性質関連
        if "性質" in excel_unit and "性質" in title_clean:
            matches.append(item)
            continue
    
    return matches

# 不足項目を特定
print("=" * 100)
print("Excelにはあるが、現在のコンテンツに対応が見つからない項目")
print("（6年生の総合コンテンツは除外）")
print("=" * 100)

missing_items = []
found_items = []

for grade in sorted(excel_by_grade.keys()):
    print(f"\n【{grade}年生】")
    print("-" * 100)
    
    for excel_item in excel_by_grade[grade]:
        excel_unit = excel_item["単元"]
        current_items = current_by_grade.get(grade, [])
        
        matches = find_match(excel_unit, current_items)
        
        if not matches:
            missing_items.append({
                "grade": grade,
                "field": excel_item["分野"],
                "unit": excel_unit
            })
            print(f"  [不足] 分野: {excel_item['分野']}")
            print(f"     単元: {excel_unit}")
        else:
            found_items.append({
                "grade": grade,
                "field": excel_item["分野"],
                "unit": excel_unit,
                "matches": matches
            })
            print(f"  [対応あり] 分野: {excel_item['分野']}")
            print(f"     単元: {excel_unit}")
            print(f"     対応コンテンツ:")
            for match in matches[:2]:  # 最大2つまで表示
                print(f"       - {match.get('title', '不明')}")

# まとめ
print("\n" + "=" * 100)
print("【まとめ】")
print("=" * 100)
print(f"不足している可能性のある項目数: {len(missing_items)}")
print(f"対応が見つかった項目数: {len(found_items)}")
print("\n不足項目の詳細:")
print("-" * 100)

# 学年別に整理
missing_by_grade = defaultdict(list)
for item in missing_items:
    missing_by_grade[item['grade']].append(item)

for grade in sorted(missing_by_grade.keys()):
    print(f"\n【{grade}年生】")
    for item in missing_by_grade[grade]:
        print(f"  [{item['field']}] {item['unit']}")

# 学年別の不足項目数
print("\n学年別の不足項目数:")
for grade in sorted(missing_by_grade.keys()):
    print(f"  {grade}年生: {len(missing_by_grade[grade])}項目")








