import sys
import json
import os
import re
from collections import defaultdict

# catalog.jsonを読み込む
with open("catalog.json", "r", encoding="utf-8-sig") as f:
    catalog = json.load(f)

# 理科コンテンツのみを抽出
science_items = [item for item in catalog if item.get("subject") == "sci" or item.get("subject") == "science_drill"]

# 学年別・分野別に整理
lessons_by_grade = defaultdict(lambda: defaultdict(list))
for item in science_items:
    grade = item.get("grade", 0)
    
    # 分野を判定
    id_str = item.get("id", "")
    title = item.get("title", "")
    
    if "biology" in id_str or "生物" in title or "植物" in title or "動物" in title or "人体" in title or "季節" in title:
        field = "生物"
    elif "physics" in id_str or "電気" in title or "電流" in title or "光" in title or "音" in title or "力" in title or "てこ" in title or "ばね" in title or "つり合い" in title:
        field = "物理"
    elif "chemistry" in id_str or "水" in title or "空気" in title or "燃焼" in title or "溶液" in title or "酸" in title or "アルカリ" in title or "溶解度" in title:
        field = "化学"
    elif "earth" in id_str or "天気" in title or "星" in title or "太陽" in title or "地震" in title or "火山" in title or "地層" in title or "川" in title or "星座" in title:
        field = "地学"
    elif "comprehensive" in id_str or "総合" in title:
        field = "総合"
    else:
        field = "その他"
    
    lessons_by_grade[grade][field].append(item)

# 各レッスンの詳細な概要を取得
def get_detailed_summary(item):
    """レッスンの詳細な概要を取得"""
    path = item.get("path", "")
    id_str = item.get("id", "")
    title = item.get("title", "")
    
    summary = {
        "title": title,
        "id": id_str,
        "grade": item.get("grade", 0),
        "duration": item.get("duration_min", 0),
        "format": item.get("format", ""),
        "question_count": 0,
        "learning_points": [],
        "description": ""
    }
    
    # ファイルパスから実際のファイルを読み込む
    js_path = None
    if path:
        # modular形式の場合
        if "modular" in path and "era=" in path:
            era_id = path.split("era=")[1].split("&")[0]
            # JSファイル名を生成
            if "wakaru" in path:
                js_file = era_id.replace("sci.", "").replace(".", "_") + ".js"
                js_path = f"lessons/sci/modular/wakaru/{js_file}"
            elif "oboeru" in path:
                js_file = era_id.replace("sci.", "").replace(".", "_") + "_oboeru.js"
                js_path = f"lessons/sci/modular/oboeru/{js_file}"
        elif path.endswith(".html") and not "sim" in path:
            # 通常のHTMLファイルの場合
            js_path = path.replace(".html", ".js")
    
    # JSファイルを読み込んで詳細な概要を取得
    if js_path and os.path.exists(js_path):
        try:
            with open(js_path, "r", encoding="utf-8") as f:
                content = f.read()
                
                # 問題数をカウント
                qnum_matches = re.findall(r'["\']?qnum["\']?\s*[:=]\s*(\d+)', content)
                if qnum_matches:
                    summary["question_count"] = len(set([int(m) for m in qnum_matches]))
                
                # 学習ポイントを抽出（問題文や説明から）
                # 問題文から主要な概念を抽出
                text_matches = re.findall(r'"text"\s*:\s*"([^"]+)"', content)
                if text_matches:
                    # 最初の10問から主要な概念を抽出
                    for text in text_matches[:10]:
                        # 重要なキーワードを抽出
                        if "何" in text or "なぜ" in text or "どの" in text:
                            # 質問の内容から学習ポイントを推測
                            if "季節" in text:
                                summary["learning_points"].append("季節と生物の関係")
                            if "植物" in text:
                                summary["learning_points"].append("植物の構造・成長")
                            if "電気" in text or "電流" in text:
                                summary["learning_points"].append("電気の基礎")
                            if "回路" in text:
                                summary["learning_points"].append("回路のしくみ")
                            if "水" in text and "水溶液" not in text:
                                summary["learning_points"].append("水の性質・状態変化")
                            if "空気" in text:
                                summary["learning_points"].append("空気の性質")
                            if "天気" in text:
                                summary["learning_points"].append("天気の変化")
                            if "星" in text or "星座" in text:
                                summary["learning_points"].append("星と星座")
                            if "川" in text:
                                summary["learning_points"].append("川のはたらき")
                            if "地震" in text:
                                summary["learning_points"].append("地震のしくみ")
                            if "火山" in text:
                                summary["learning_points"].append("火山のしくみ")
                            if "人体" in text or "体" in text:
                                summary["learning_points"].append("人体の構造")
                
                summary["learning_points"] = list(set(summary["learning_points"]))
        except Exception as e:
            pass
    
    # タイトルとIDから詳細な説明を生成
    if "季節" in title and "生物" in title:
        if "春" in title:
            summary["description"] = "春の季節と生物の活動の関係を学習。植物の発芽、動物の活動開始、気温の上昇と生物の変化など"
        elif "夏" in title or "summer" in id_str.lower():
            summary["description"] = "夏から冬にかけての季節と生物の活動の関係を学習。植物の成長・開花・実の成熟、動物の繁殖・冬ごもりなど"
        elif "sim" in id_str.lower() or "シミュレーション" in title:
            summary["description"] = "季節の変化と生物の活動をシミュレーションで学習。月ごとの気温・日照時間の変化と、それに伴う植物・動物の活動の変化を視覚的に理解"
        else:
            summary["description"] = "季節の変化と生物の活動の関係を学習"
    elif "植物" in title:
        if "成長" in title:
            summary["description"] = "植物の成長と光の関係を学習。光合成、発芽、成長の条件、葉のつくりなど"
        elif "花" in title:
            summary["description"] = "花の構造と受粉のしくみを学習。雄しべ・雌しべの構造、受粉の方法、種子のでき方など"
        else:
            summary["description"] = "植物の構造と成長について学習"
    elif "電気" in title:
        if "乾電池" in title and "豆電球" in title:
            summary["description"] = "乾電池と豆電球の基本的なつなぎ方と回路を学習。電流の流れ、導体・不導体、回路のしくみなど"
        elif "基礎" in title or "circuit" in id_str.lower():
            summary["description"] = "電気の基礎と回路について学習。直列・並列回路、電流の流れ、電圧、豆電球の明るさなど"
        elif "発熱" in title:
            summary["description"] = "電流による発熱について学習。電熱線、発熱のしくみ、電流と発熱の関係など"
        elif "磁界" in title:
            summary["description"] = "電流による磁界の発生について学習。電磁石、コイル、電流と磁界の関係など"
        else:
            summary["description"] = "電気の性質と利用について学習"
    elif "水" in title:
        if "状態変化" in title or "変化" in title:
            summary["description"] = "水の状態変化（氷・水・水蒸気）を学習。温度と状態の関係、蒸発・凝固・融解、状態変化のしくみなど"
        elif "溶液" in title:
            summary["description"] = "水溶液と溶解度について学習。溶質・溶媒、飽和溶液、溶解度と温度の関係、再結晶など"
        elif "酸" in title or "アルカリ" in title:
            summary["description"] = "酸性・アルカリ性の水溶液について学習。リトマス紙、BTB溶液、中和反応など"
        elif "溶け" in title:
            summary["description"] = "物の溶け方について学習。溶解、水溶液、飽和、溶質・溶媒など"
        else:
            summary["description"] = "水の性質について学習"
    elif "空気" in title:
        summary["description"] = "空気の性質について学習。空気の成分、圧力、体積変化、空気の重さなど"
    elif "燃焼" in title:
        summary["description"] = "燃焼と空気の関係を学習。燃焼の条件、酸素の役割、燃焼後の変化など"
    elif "天気" in title:
        summary["description"] = "天気の変化について学習。雲、雨、風、気圧、前線、天気図の読み方など"
    elif "星" in title or "星座" in title:
        summary["description"] = "星と星座について学習。星座の見え方、季節による変化、北極星、星の明るさなど"
    elif "太陽" in title or "影" in title:
        summary["description"] = "太陽の動きと影について学習。太陽の位置、影の長さと方向の変化、時刻による変化など"
    elif "川" in title:
        summary["description"] = "川のはたらきについて学習。侵食・運搬・堆積、上流・中流・下流の特徴、地形の変化など"
    elif "地震" in title:
        summary["description"] = "地震のしくみについて学習。震源、震度、地震波、プレート、断層など"
    elif "火山" in title:
        summary["description"] = "火山のしくみについて学習。マグマ、噴火、火山の形、火山灰、溶岩など"
    elif "人体" in title or "体" in title:
        if "消化" in title or "呼吸" in title:
            summary["description"] = "人体の消化・呼吸・血液循環について学習。消化器官、呼吸器官、心臓、血液の流れなど"
        elif "神経" in title or "運動" in title:
            summary["description"] = "人体の神経と運動について学習。感覚器官、筋肉、骨、反射など"
        else:
            summary["description"] = "人体の構造と機能について学習"
    elif "総合" in title:
        summary["description"] = "複数の分野を統合した総合問題。応用力を養う"
    elif "つり合い" in title or "てんびん" in title:
        summary["description"] = "つり合いとてんびんについて学習。重さと距離の関係、てんびんのしくみなど"
    elif "熱" in title:
        summary["description"] = "熱の性質とものの変化について学習。熱の伝わり方、温度変化、ものの変化など"
    elif "光" in title:
        summary["description"] = "光の性質について学習。光の進み方、反射、屈折、影など"
    elif "音" in title:
        summary["description"] = "音の性質について学習。音の伝わり方、音の大きさ・高さ、振動など"
    elif "力" in title:
        summary["description"] = "力と運動について学習。浮力、滑車、輪軸など"
    elif "てこ" in title:
        summary["description"] = "てこのつり合いについて学習。支点・力点・作用点、てこのしくみなど"
    elif "ばね" in title:
        summary["description"] = "ばねと力について学習。ばねののび、力の大きさなど"
    else:
        summary["description"] = "理科の基礎を学習"
    
    return summary

# レッスン一覧を生成
output_lines = []
output_lines.append("=" * 120)
output_lines.append("理科レッスン一覧（学習項目と詳細概要）")
output_lines.append("=" * 120)

for grade in sorted(lessons_by_grade.keys()):
    output_lines.append("")
    output_lines.append("=" * 120)
    output_lines.append(f"【{grade}年生】")
    output_lines.append("=" * 120)
    
    for field in ["生物", "物理", "化学", "地学", "総合", "その他"]:
        if field in lessons_by_grade[grade]:
            output_lines.append("")
            output_lines.append(f"■ {field}")
            output_lines.append("-" * 120)
            
            for item in lessons_by_grade[grade][field]:
                summary = get_detailed_summary(item)
                
                # わかる編/覚える編の表示
                mode = ""
                if "覚える" in summary["title"]:
                    mode = "【覚える編】"
                elif "wakaru" in summary["id"] or "わかる" in summary["title"]:
                    mode = "【わかる編】"
                
                output_lines.append("")
                output_lines.append(f"レッスン名: {summary['title']} {mode}")
                output_lines.append(f"  ID: {summary['id']}")
                output_lines.append(f"  概要: {summary['description']}")
                if summary.get('question_count'):
                    output_lines.append(f"  問題数: {summary['question_count']}問")
                if summary['learning_points']:
                    output_lines.append(f"  学習ポイント: {', '.join(summary['learning_points'])}")
                output_lines.append(f"  学習時間: 約{summary['duration']}分")
                output_lines.append(f"  形式: {summary['format']}")

# 統計情報
output_lines.append("")
output_lines.append("=" * 120)
output_lines.append("【統計情報】")
output_lines.append("=" * 120)

total_lessons = len(science_items)
wakaru_count = len([i for i in science_items if i.get('subject') == 'sci'])
oboeru_count = len([i for i in science_items if i.get('subject') == 'science_drill'])

output_lines.append(f"総レッスン数: {total_lessons}")
output_lines.append(f"  わかる編: {wakaru_count}")
output_lines.append(f"  覚える編: {oboeru_count}")

for grade in sorted(lessons_by_grade.keys()):
    count = sum(len(lessons_by_grade[grade][field]) for field in lessons_by_grade[grade])
    output_lines.append(f"{grade}年生: {count}レッスン")

# ファイルに出力
with open("lesson_summary_detailed.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("詳細なレッスン一覧を lesson_summary_detailed.txt に出力しました。")






