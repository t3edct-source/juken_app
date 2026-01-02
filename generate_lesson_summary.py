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
    subject_type = item.get("subject", "")
    
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

# 各レッスンのファイルを読み込んで概要を取得
def get_lesson_summary(item):
    """レッスンの概要を取得"""
    path = item.get("path", "")
    id_str = item.get("id", "")
    title = item.get("title", "")
    
    summary = {
        "title": title,
        "id": id_str,
        "grade": item.get("grade", 0),
        "duration": item.get("duration_min", 0),
        "format": item.get("format", ""),
        "topics": [],
        "description": "",
        "question_count": 0,
        "key_concepts": []
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
        elif path.endswith(".html") and "sim" in path:
            # シミュレーションファイルの場合はスキップ
            pass
        elif path.endswith(".html"):
            # 通常のHTMLファイルの場合
            js_path = path.replace(".html", ".js")
    
    # JSファイルを読み込んで概要を取得
    if js_path and os.path.exists(js_path):
        try:
            with open(js_path, "r", encoding="utf-8") as f:
                content = f.read()
                
                # 問題数をカウント
                qnum_matches = re.findall(r'["\']?qnum["\']?\s*[:=]\s*(\d+)', content)
                if qnum_matches:
                    summary["question_count"] = len(set([int(m) for m in qnum_matches]))
                
                # 主要な概念を抽出（sourceフィールドから）
                source_matches = re.findall(r'"source"\s*:\s*"([^"]+)"', content)
                if source_matches:
                    # 最初のsourceから主要な概念を抽出
                    first_source = source_matches[0][:200]  # 最初の200文字
                    # 重要なキーワードを抽出
                    keywords = re.findall(r'[【]([^】]+)[】]', first_source)
                    if keywords:
                        summary["key_concepts"] = keywords[:5]  # 最大5つ
                
                # トピックを抽出
                if "季節" in content:
                    summary["topics"].append("季節")
                if "植物" in content:
                    summary["topics"].append("植物")
                if "動物" in content:
                    summary["topics"].append("動物")
                if "電気" in content:
                    summary["topics"].append("電気")
                if "回路" in content:
                    summary["topics"].append("回路")
                if "水" in content and "水溶液" not in content:
                    summary["topics"].append("水")
                if "空気" in content:
                    summary["topics"].append("空気")
                if "天気" in content:
                    summary["topics"].append("天気")
                if "星" in content or "星座" in content:
                    summary["topics"].append("星・星座")
                if "地震" in content:
                    summary["topics"].append("地震")
                if "火山" in content:
                    summary["topics"].append("火山")
                if "川" in content:
                    summary["topics"].append("川")
                if "人体" in content or "体" in content:
                    summary["topics"].append("人体")
                
                summary["topics"] = list(set(summary["topics"]))
        except Exception as e:
            pass
    
    # タイトルから概要を生成
    if "季節" in title and "生物" in title:
        if "春" in title:
            summary["description"] = "春の季節と生物の活動の関係を学習。植物の発芽、動物の活動開始など"
        elif "夏" in title or "summer" in id_str.lower():
            summary["description"] = "夏から冬にかけての季節と生物の活動の関係を学習。植物の成長、動物の繁殖など"
        elif "sim" in id_str.lower() or "シミュレーション" in title:
            summary["description"] = "季節の変化と生物の活動をシミュレーションで学習。気温・日照時間と生物の関係"
        else:
            summary["description"] = "季節の変化と生物の活動の関係を学習"
    elif "植物" in title:
        if "成長" in title:
            summary["description"] = "植物の成長と光の関係を学習。光合成、発芽、成長の条件など"
        elif "花" in title:
            summary["description"] = "花の構造と受粉のしくみを学習。雄しべ、雌しべ、受粉の方法など"
        else:
            summary["description"] = "植物の構造と成長について学習"
    elif "電気" in title:
        if "乾電池" in title and "豆電球" in title:
            summary["description"] = "乾電池と豆電球の基本的なつなぎ方と回路を学習。電流、導体・不導体など"
        elif "基礎" in title or "circuit" in id_str.lower():
            summary["description"] = "電気の基礎と回路について学習。直列・並列回路、電流の流れなど"
        elif "発熱" in title:
            summary["description"] = "電流による発熱について学習。電熱線、発熱のしくみなど"
        elif "磁界" in title:
            summary["description"] = "電流による磁界の発生について学習。電磁石、コイルなど"
        else:
            summary["description"] = "電気の性質と利用について学習"
    elif "水" in title:
        if "状態変化" in title or "変化" in title:
            summary["description"] = "水の状態変化（氷・水・水蒸気）を学習。温度と状態の関係、蒸発・凝固など"
        elif "溶液" in title:
            summary["description"] = "水溶液と溶解度について学習。溶質・溶媒、飽和溶液、再結晶など"
        elif "酸" in title or "アルカリ" in title:
            summary["description"] = "酸性・アルカリ性の水溶液について学習。リトマス紙、中和反応など"
        else:
            summary["description"] = "水の性質について学習"
    elif "空気" in title:
        summary["description"] = "空気の性質について学習。空気の成分、圧力、体積変化など"
    elif "燃焼" in title:
        summary["description"] = "燃焼と空気の関係を学習。燃焼の条件、酸素の役割など"
    elif "天気" in title:
        summary["description"] = "天気の変化について学習。雲、雨、風、気圧、前線など"
    elif "星" in title or "星座" in title:
        summary["description"] = "星と星座について学習。星座の見え方、季節による変化、北極星など"
    elif "太陽" in title or "影" in title:
        summary["description"] = "太陽の動きと影について学習。太陽の位置、影の長さと方向の変化など"
    elif "川" in title:
        summary["description"] = "川のはたらきについて学習。侵食・運搬・堆積、上流・中流・下流の特徴など"
    elif "地震" in title:
        summary["description"] = "地震のしくみについて学習。震源、震度、地震波、プレートなど"
    elif "火山" in title:
        summary["description"] = "火山のしくみについて学習。マグマ、噴火、火山の形など"
    elif "人体" in title or "体" in title:
        if "消化" in title or "呼吸" in title:
            summary["description"] = "人体の消化・呼吸・血液循環について学習。消化器官、呼吸器官、心臓など"
        elif "神経" in title or "運動" in title:
            summary["description"] = "人体の神経と運動について学習。感覚器官、筋肉、骨など"
        else:
            summary["description"] = "人体の構造と機能について学習"
    elif "総合" in title:
        summary["description"] = "複数の分野を統合した総合問題。応用力を養う"
    else:
        summary["description"] = "理科の基礎を学習"
    
    return summary

# レッスン一覧を生成
output_lines = []
output_lines.append("=" * 120)
output_lines.append("理科レッスン一覧（学習項目と概要）")
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
                summary = get_lesson_summary(item)
                
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
                if summary['topics']:
                    output_lines.append(f"  トピック: {', '.join(summary['topics'])}")
                if summary['key_concepts']:
                    output_lines.append(f"  主要概念: {', '.join(summary['key_concepts'])}")
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
with open("lesson_summary.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("レッスン一覧を lesson_summary.txt に出力しました。")
