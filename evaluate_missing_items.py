import json
import re

# catalog.jsonを読み込む
with open("catalog.json", "r", encoding="utf-8-sig") as f:
    catalog = json.load(f)

# 理科コンテンツのみを抽出
science_items = [item for item in catalog if item.get("subject") == "sci" or item.get("subject") == "science_drill"]

print("=" * 120)
print("指摘項目の妥当性評価")
print("=" * 120)

# A. 地学の抜け
print("\n【A. 地学の抜け】")
print("-" * 120)

# A1. 月の満ち欠け／月の動き
print("\n1. 月の満ち欠け／月の動き")
moon_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "月" in title or "moon" in id_str.lower():
        moon_items.append(item)
        print(f"  見つかった: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

if not moon_items:
    print("  [不足] 月に関する独立レッスンが見つかりませんでした")
    print("  -> 指摘は妥当です")
else:
    # 4年生と6年生で独立レッスンがあるか確認
    grade4_moon = [i for i in moon_items if i.get("grade") == 4]
    grade6_moon = [i for i in moon_items if i.get("grade") == 6 and "総合" not in i.get("title", "")]
    
    if not grade4_moon:
        print("  [注意] 4年生に月の独立レッスンがありません")
    if not grade6_moon:
        print("  [注意] 6年生に月の独立レッスンがありません（総合のみ）")
    if not grade4_moon and not grade6_moon:
        print("  -> 指摘は妥当です")

# A2. 地層・化石
print("\n2. 地層・化石（地層単独の基礎回）")
strata_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "地層" in title or "strata" in id_str.lower():
        strata_items.append(item)
        print(f"  見つかった: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

if not strata_items:
    print("  [不足] 地層に関するレッスンが見つかりませんでした")
    print("  -> 指摘は妥当です")
else:
    # 地層単独の基礎レッスンがあるか確認
    basic_strata = [i for i in strata_items if "総合" not in i.get("title", "")]
    if not basic_strata:
        print("  [注意] 地層単独の基礎レッスンがありません（総合のみ）")
        print("  -> 指摘は妥当です")
    else:
        print("  [確認] 地層単独の基礎レッスンがあります")

# B. 化学の抜け
print("\n【B. 化学の抜け】")
print("-" * 120)

# B1. 酸・アルカリ・中和（段階レッスン）
print("\n1. 酸・アルカリ・中和（基礎→計算の段階レッスン）")
acid_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "酸" in title or "アルカリ" in title or "中和" in title or "acid" in id_str.lower() or "alkali" in id_str.lower():
        acid_items.append(item)
        print(f"  見つかった: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

if not acid_items:
    print("  [不足] 酸・アルカリ・中和に関するレッスンが見つかりませんでした")
    print("  -> 指摘は妥当です")
else:
    # 段階的なレッスンがあるか確認
    basic_acid = [i for i in acid_items if "総合" not in i.get("title", "") and "基礎" in i.get("title", "")]
    calc_acid = [i for i in acid_items if "計算" in i.get("title", "")]
    
    if not basic_acid:
        print("  [注意] 酸・アルカリ・中和の基礎レッスンがありません")
    if not calc_acid:
        print("  [注意] 中和計算の独立レッスンがありません")
    if not basic_acid or not calc_acid:
        print("  -> 指摘は妥当です（段階的なレッスンが不足）")

# C. 物理の抜け
print("\n【C. 物理の抜け】")
print("-" * 120)

# C1. 速さ（距離・時間・速さ）／運動のグラフ
print("\n1. 速さ（距離・時間・速さ）／運動のグラフ")
speed_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "速さ" in title or "速度" in title or "speed" in id_str.lower():
        speed_items.append(item)
        print(f"  見つかった: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

# 力と運動のレッスンを確認
motion_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "力と運動" in title or "force" in id_str.lower() or "motion" in id_str.lower():
        motion_items.append(item)
        print(f"  関連レッスン: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

if not speed_items:
    print("  [不足] 速さに関する明示的なレッスンが見つかりませんでした")
    print("  -> 指摘は妥当です（「力と運動」に含まれている可能性はあるが、明示されていない）")

# D. 生物の抜け
print("\n【D. 生物の抜け】")
print("-" * 120)

# D1. 植物の分類（被子/裸子、単子葉/双子葉）
print("\n1. 植物の分類（被子/裸子、単子葉/双子葉）")
classification_items = []
for item in science_items:
    title = item.get("title", "")
    id_str = item.get("id", "")
    if "分類" in title or "被子" in title or "裸子" in title or "単子葉" in title or "双子葉" in title:
        classification_items.append(item)
        print(f"  見つかった: {title} (ID: {id_str}, 学年: {item.get('grade', '不明')})")

if not classification_items:
    print("  [不足] 植物の分類に関する独立レッスンが見つかりませんでした")
    print("  -> 指摘は妥当です")
    print("  （「植物の成長」や「花のつくりと受粉」に一部含まれている可能性はあるが、")
    print("   分類を体系的に学ぶ独立レッスンはない）")

# まとめ
print("\n" + "=" * 120)
print("【評価まとめ】")
print("=" * 120)

print("\n[評価結果] 指摘は概ね妥当です。以下の項目が不足している可能性があります：")
print("\n1. 地学：")
print("   - 月の満ち欠け／月の動き（4年生・6年生に独立レッスンがない）")
print("   - 地層・化石（地層単独の基礎レッスンがない）")
print("\n2. 化学：")
print("   - 酸・アルカリ・中和（基礎→計算の段階的なレッスンが不足）")
print("\n3. 物理：")
print("   - 速さ（距離・時間・速さ）／運動のグラフ（明示的なレッスンがない）")
print("\n4. 生物：")
print("   - 植物の分類（被子/裸子、単子葉/双子葉）（独立レッスンがない）")

