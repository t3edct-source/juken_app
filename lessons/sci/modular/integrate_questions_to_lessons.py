#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
具体的な問題項目を既存のレッスンファイルに組み込む
"""

import json
import os
from pathlib import Path

# 問題項目とレッスンのマッピング
QUESTION_TO_LESSON = {
    "物理": {
        "電流計の針": {
            "oboeru": "physics_current_voltage_circuit_oboeru.js",
            "wakaru": "physics_current_voltage_circuit.js"
        },
        "加熱中の水が動く理由": {
            "oboeru": "physics_heat_properties_oboeru.js",
            "wakaru": "physics_heat_properties.js"
        }
    },
    "化学": {
        "アルカリ性の水溶液": {
            "wakaru": "chemistry_solution_integrated.js"
        },
        "水溶液の性質・識別": {
            "wakaru": "chemistry_solution_integrated.js"
        }
    },
    "生物": {
        "変温動物": {
            "wakaru": "biology_animal_classification.js"
        },
        "外骨格": {
            "wakaru": "biology_bones_muscles_senses.js"
        },
        "陰性植物の例": {
            "wakaru": "biology_plants_growth_light.js"
        },
        "二酸化炭素を多く含む血液": {
            "wakaru": "biology_heart_blood_circulation.js"
        },
        "血液循環と成分変化": {
            "wakaru": "biology_heart_blood_circulation.js"
        }
    },
    "地学": {
        "月の模様が変わらない理由": {
            "wakaru": "earth_moon_movement.js"
        },
        "日の出の方角・季節": {
            "wakaru": "earth_sun_movement.js"
        },
        "翌日の月の位置": {
            "wakaru": "earth_moon_movement.js"
        },
        "地軸の傾きと太陽の動き": {
            "wakaru": "earth_sun_movement.js"
        },
        "月の満ち欠け周期": {
            "wakaru": "earth_moon_movement.js"
        },
        "地層を構成する岩石": {
            "wakaru": "earth_strata_formation.js"
        },
        "地層の堆積順": {
            "wakaru": "earth_strata_formation.js"
        }
    }
}

# 問題データ（specific_question_items.txtから抽出した内容）
QUESTIONS_DATA = {
    "物理": {
        "電流計の針": [
            {
                "text": "電流計の針が右に振れるほど、電流の大きさはどうなりますか？",
                "choices": [
                    "大きくなる",
                    "小さくなる",
                    "変わらない",
                    "針の動きと電流は関係ない"
                ],
                "answer": 0,
                "explanation": "電流計の針は、電流が大きいほど右に大きく振れる"
            },
            {
                "text": "電流計の針が0の位置にあるとき、電流の大きさはどうなりますか？",
                "choices": [
                    "電流が流れていない",
                    "電流が流れているが測定できない",
                    "電流の向きが逆",
                    "電流計が故障している"
                ],
                "answer": 0,
                "explanation": "電流計の針が0の位置にあるときは、電流が流れていないことを示す"
            },
            {
                "text": "電流計の針の読み方として正しいのはどれですか？",
                "choices": [
                    "針の先端の位置を読む",
                    "針の中央の位置を読む",
                    "針の根元の位置を読む",
                    "針の動きを見るだけでよい"
                ],
                "answer": 0,
                "explanation": "電流計の値は、針の先端が指している目盛りを読む"
            }
        ],
        "加熱中の水が動く理由": [
            {
                "text": "水を加熱すると、水が動く理由として正しいのはどれですか？",
                "choices": [
                    "あたためられた水が上に移動し、冷たい水が下に移動する",
                    "あたためられた水が下に移動し、冷たい水が上に移動する",
                    "水は動かず、温度だけが上がる",
                    "水の重さが変わるため"
                ],
                "answer": 0,
                "explanation": "あたためられた水は体積が大きくなり軽くなるため上に移動し、冷たい水が下に移動する。これを対流という"
            },
            {
                "text": "水を加熱したときの水の動きを何といいますか？",
                "choices": [
                    "対流",
                    "伝導",
                    "放射",
                    "拡散"
                ],
                "answer": 0,
                "explanation": "液体や気体を加熱したときに起こる、あたためられた部分が上に移動し、冷たい部分が下に移動する現象を対流という"
            },
            {
                "text": "対流が起こる理由として正しいのはどれですか？",
                "choices": [
                    "あたためられた水は体積が大きくなり、重さが同じでも軽くなるため",
                    "あたためられた水は重さが重くなるため",
                    "あたためられた水は体積が小さくなるため",
                    "水の色が変わるため"
                ],
                "answer": 0,
                "explanation": "あたためられた水は体積が大きくなるが、重さは変わらないため、同じ体積あたりの重さが軽くなり、上に移動する"
            }
        ]
    },
    "化学": {
        "アルカリ性の水溶液": [
            {
                "text": "アルカリ性の水溶液の性質として正しいのはどれですか？",
                "choices": [
                    "赤色リトマス紙を青色に変える",
                    "青色リトマス紙を赤色に変える",
                    "リトマス紙の色を変えない",
                    "リトマス紙を溶かす"
                ],
                "answer": 0,
                "explanation": "アルカリ性の水溶液は、赤色リトマス紙を青色に変える性質がある"
            },
            {
                "text": "アルカリ性の水溶液の例として正しいのはどれですか？",
                "choices": [
                    "アンモニア水、石灰水、水酸化ナトリウム水溶液",
                    "塩酸、酢、レモン汁",
                    "食塩水、砂糖水",
                    "アルコール、ガソリン"
                ],
                "answer": 0,
                "explanation": "アンモニア水、石灰水、水酸化ナトリウム水溶液はアルカリ性の水溶液である"
            },
            {
                "text": "アルカリ性の水溶液にBTB液を加えると、何色になりますか？",
                "choices": [
                    "青色",
                    "黄色",
                    "緑色",
                    "赤色"
                ],
                "answer": 0,
                "explanation": "アルカリ性の水溶液にBTB液を加えると青色になる。中性は緑色、酸性は黄色になる"
            }
        ],
        "水溶液の性質・識別": [
            {
                "text": "複数の水溶液を識別するために使う実験方法として正しいのはどれですか？",
                "choices": [
                    "リトマス紙、におい、蒸発後の残り、BTB液など",
                    "温度だけを測る",
                    "色だけを見る",
                    "重さだけを測る"
                ],
                "answer": 0,
                "explanation": "水溶液を識別するには、リトマス紙による液性の確認、においの確認、蒸発後の残りの確認、BTB液による確認など、複数の方法を組み合わせる"
            },
            {
                "text": "水溶液の識別で、蒸発皿に入れて加熱する理由は何ですか？",
                "choices": [
                    "水を蒸発させて、溶けていた物質を確認するため",
                    "水溶液の温度を上げるため",
                    "水溶液の色を変えるため",
                    "水溶液のにおいを強くするため"
                ],
                "answer": 0,
                "explanation": "水溶液を加熱して水を蒸発させると、溶けていた物質が残る。この残りを見ることで、水溶液の種類を識別できる"
            },
            {
                "text": "アンモニア水と食塩水を見分ける方法として最も適切なのはどれですか？",
                "choices": [
                    "においをかぐ（アンモニア水は特有のにおいがある）",
                    "色を見る",
                    "温度を測る",
                    "重さを測る"
                ],
                "answer": 0,
                "explanation": "アンモニア水は特有の刺激臭があり、食塩水はにおいがない。ただし、においをかぐときは手であおいでかぐ"
            }
        ]
    },
    "生物": {
        "変温動物": [
            {
                "text": "変温動物とはどのような動物ですか？",
                "choices": [
                    "気温によって体温が変わる動物",
                    "体温がほぼ一定の動物",
                    "体温が常に高い動物",
                    "体温がない動物"
                ],
                "answer": 0,
                "explanation": "変温動物は、気温によって体温が変わる動物。魚類、両生類、は虫類などが該当する"
            },
            {
                "text": "変温動物の例として正しいのはどれですか？",
                "choices": [
                    "カエル、トカゲ、メダカ",
                    "イヌ、ネコ、ウマ",
                    "ニワトリ、ペンギン",
                    "クジラ、イルカ"
                ],
                "answer": 0,
                "explanation": "変温動物には、カエル（両生類）、トカゲ（は虫類）、メダカ（魚類）などが含まれる"
            },
            {
                "text": "恒温動物とはどのような動物ですか？",
                "choices": [
                    "体温がほぼ一定に保たれる動物",
                    "気温によって体温が変わる動物",
                    "体温が常に低い動物",
                    "体温がない動物"
                ],
                "answer": 0,
                "explanation": "恒温動物は、体温がほぼ一定に保たれる動物。鳥類とほ乳類が該当する"
            }
        ],
        "外骨格": [
            {
                "text": "外骨格とはどのような体のつくりですか？",
                "choices": [
                    "体の表面がかたいからでおおわれ、その内側に筋肉があるつくり",
                    "体の内部に骨があり、その外側に筋肉があるつくり",
                    "骨がないつくり",
                    "筋肉だけのつくり"
                ],
                "answer": 0,
                "explanation": "外骨格は、体の表面がかたいからでおおわれ、その内側に筋肉があるつくり。こん虫、クモ、エビ、カニなどが該当する"
            },
            {
                "text": "外骨格を持つ動物の例として正しいのはどれですか？",
                "choices": [
                    "こん虫、クモ、エビ、カニ",
                    "ヒト、イヌ、ネコ",
                    "メダカ、フナ",
                    "カエル、イモリ"
                ],
                "answer": 0,
                "explanation": "外骨格を持つ動物には、こん虫、クモ、エビ、カニなどの節足動物が含まれる"
            },
            {
                "text": "内骨格とはどのような体のつくりですか？",
                "choices": [
                    "体の内部に骨があり、その外側に筋肉があるつくり",
                    "体の表面がかたいからでおおわれたつくり",
                    "骨がないつくり",
                    "筋肉だけのつくり"
                ],
                "answer": 0,
                "explanation": "内骨格は、体の内部に骨があり、その外側に筋肉があるつくり。ヒト、イヌ、メダカ、カエルなどのせきつい動物が該当する"
            }
        ],
        "陰性植物の例": [
            {
                "text": "陰性植物とはどのような植物ですか？",
                "choices": [
                    "光が弱いところでも生育できる植物",
                    "光が強いところでないと生育できない植物",
                    "光がなくても生育できる植物",
                    "光を必要としない植物"
                ],
                "answer": 0,
                "explanation": "陰性植物は、光が弱いところでも生育できる植物。シイ、カシ、シダなどが該当する"
            },
            {
                "text": "陰性植物の例として正しいのはどれですか？",
                "choices": [
                    "シイ、カシ、シダ",
                    "ススキ、アカマツ",
                    "ヒマワリ、トウモロコシ",
                    "イネ、コムギ"
                ],
                "answer": 0,
                "explanation": "陰性植物には、シイ、カシ、シダなど、森林の下など光が弱いところで生育する植物が含まれる"
            },
            {
                "text": "陽性植物とはどのような植物ですか？",
                "choices": [
                    "光が強いところでないと生育できない植物",
                    "光が弱いところでも生育できる植物",
                    "光がなくても生育できる植物",
                    "光を必要としない植物"
                ],
                "answer": 0,
                "explanation": "陽性植物は、光が強いところでないと生育できない植物。ススキ、アカマツ、ヒマワリなどが該当する"
            }
        ],
        "二酸化炭素を多く含む血液": [
            {
                "text": "二酸化炭素を多く含む血液は、体のどの部分を通る血液ですか？",
                "choices": [
                    "全身の組織から心臓に戻る血液（静脈血）",
                    "心臓から全身に送られる血液（動脈血）",
                    "肺から心臓に戻る血液",
                    "心臓から肺に送られる血液"
                ],
                "answer": 0,
                "explanation": "全身の組織で酸素を使い、二酸化炭素を受け取った血液は、静脈を通って心臓に戻る。この血液は二酸化炭素を多く含む"
            },
            {
                "text": "酸素を多く含む血液は、体のどの部分を通る血液ですか？",
                "choices": [
                    "心臓から全身に送られる血液（動脈血）",
                    "全身の組織から心臓に戻る血液（静脈血）",
                    "心臓から肺に送られる血液",
                    "肺から心臓に戻る血液"
                ],
                "answer": 0,
                "explanation": "肺で酸素を受け取った血液は、動脈を通って心臓から全身に送られる。この血液は酸素を多く含む"
            },
            {
                "text": "血液循環によって、血液中の酸素と二酸化炭素の量はどのように変化しますか？",
                "choices": [
                    "肺で酸素が増え二酸化炭素が減り、全身の組織で酸素が減り二酸化炭素が増える",
                    "常に一定",
                    "酸素だけが変化する",
                    "二酸化炭素だけが変化する"
                ],
                "answer": 0,
                "explanation": "肺では酸素を取り込み二酸化炭素を放出し、全身の組織では酸素を放出し二酸化炭素を受け取る"
            }
        ],
        "血液循環と成分変化": [
            {
                "text": "血液が肺を通るとき、血液中の成分はどのように変化しますか？",
                "choices": [
                    "酸素が増え、二酸化炭素が減る",
                    "酸素が減り、二酸化炭素が増える",
                    "変化しない",
                    "酸素も二酸化炭素も増える"
                ],
                "answer": 0,
                "explanation": "肺では、空気中の酸素を血液に取り込み、血液中の二酸化炭素を空気中に放出する"
            },
            {
                "text": "血液が全身の組織を通るとき、血液中の成分はどのように変化しますか？",
                "choices": [
                    "酸素が減り、二酸化炭素が増える",
                    "酸素が増え、二酸化炭素が減る",
                    "変化しない",
                    "酸素も二酸化炭素も減る"
                ],
                "answer": 0,
                "explanation": "全身の組織では、血液から酸素を受け取り、二酸化炭素を血液に渡す"
            },
            {
                "text": "動脈血と静脈血の違いとして正しいのはどれですか？",
                "choices": [
                    "動脈血は酸素を多く含み、静脈血は二酸化炭素を多く含む",
                    "動脈血は二酸化炭素を多く含み、静脈血は酸素を多く含む",
                    "動脈血と静脈血に違いはない",
                    "動脈血は赤く、静脈血は青い"
                ],
                "answer": 0,
                "explanation": "動脈血は酸素を多く含み鮮やかな赤色、静脈血は二酸化炭素を多く含み暗い赤色"
            }
        ]
    },
    "地学": {
        "月の模様が変わらない理由": [
            {
                "text": "地球から月を見たとき、月の表面の模様が常に同じに見える理由は何ですか？",
                "choices": [
                    "月の自転周期と公転周期が等しく、自転と公転の向きも同じだから",
                    "月が自転していないから",
                    "月が公転していないから",
                    "月の模様が実際に変わらないから"
                ],
                "answer": 0,
                "explanation": "月の自転周期（約27.3日）と公転周期（約27.3日）が等しく、自転と公転の向きも同じ（反時計回り）であるため、常に同じ面を地球に向けている"
            },
            {
                "text": "月の自転周期と公転周期の関係として正しいのはどれですか？",
                "choices": [
                    "ほぼ等しい（約27.3日）",
                    "自転周期の方が長い",
                    "公転周期の方が長い",
                    "関係がない"
                ],
                "answer": 0,
                "explanation": "月の自転周期と公転周期はほぼ等しく、約27.3日である"
            },
            {
                "text": "月が常に同じ面を地球に向けていることを何といいますか？",
                "choices": [
                    "同期自転",
                    "公転",
                    "自転",
                    "満ち欠け"
                ],
                "answer": 0,
                "explanation": "月が常に同じ面を地球に向けていることを同期自転という"
            }
        ],
        "日の出の方角・季節": [
            {
                "text": "夏至の日の日の出の方角として正しいのはどれですか？",
                "choices": [
                    "東よりやや北寄り",
                    "東よりやや南寄り",
                    "真東",
                    "北"
                ],
                "answer": 0,
                "explanation": "夏至の日は、日の出が東よりやや北寄り、日の入りが西よりやや北寄りになる"
            },
            {
                "text": "冬至の日の日の出の方角として正しいのはどれですか？",
                "choices": [
                    "東よりやや南寄り",
                    "東よりやや北寄り",
                    "真東",
                    "南"
                ],
                "answer": 0,
                "explanation": "冬至の日は、日の出が東よりやや南寄り、日の入りが西よりやや南寄りになる"
            },
            {
                "text": "春分・秋分の日の日の出の方角として正しいのはどれですか？",
                "choices": [
                    "真東",
                    "東よりやや北寄り",
                    "東よりやや南寄り",
                    "北"
                ],
                "answer": 0,
                "explanation": "春分・秋分の日は、日の出が真東、日の入りが真西になる"
            }
        ],
        "翌日の月の位置": [
            {
                "text": "毎日同じ時刻に月を観察すると、月の位置はどのように変化しますか？",
                "choices": [
                    "1日に約12度ずつ西から東へ移動する",
                    "1日に約12度ずつ東から西へ移動する",
                    "位置は変わらない",
                    "1日に約15度ずつ移動する"
                ],
                "answer": 0,
                "explanation": "月は地球の周りを公転しているため、毎日同じ時刻に観察すると、1日に約12度ずつ西から東へ移動する"
            },
            {
                "text": "月の南中時刻は、1日にどのくらいずれますか？",
                "choices": [
                    "約48分ずつおそくなる",
                    "約48分ずつおそくなる",
                    "変わらない",
                    "約1時間ずつおそくなる"
                ],
                "answer": 0,
                "explanation": "月の南中時刻は、1日に約48分ずつおそくなる。これは月が地球の周りを公転しているため"
            },
            {
                "text": "月が1日に移動する角度（約12度）は、月の何に関係していますか？",
                "choices": [
                    "月の公転",
                    "月の自転",
                    "地球の自転",
                    "太陽の動き"
                ],
                "answer": 0,
                "explanation": "月が1日に約12度移動するのは、月が地球の周りを公転しているため"
            }
        ],
        "地軸の傾きと太陽の動き": [
            {
                "text": "地軸の傾きは約何度ですか？",
                "choices": [
                    "約23.4度",
                    "約30度",
                    "約45度",
                    "約90度"
                ],
                "answer": 0,
                "explanation": "地軸は公転面に垂直な線に対して約23.4度かたむいている"
            },
            {
                "text": "地軸がかたむいていることで起こる現象として正しいのはどれですか？",
                "choices": [
                    "季節の変化、太陽高度の変化、昼の長さの変化",
                    "月の満ち欠け",
                    "地震",
                    "台風"
                ],
                "answer": 0,
                "explanation": "地軸がかたむいていることで、季節の変化、太陽高度の変化、昼の長さの変化が起こる"
            },
            {
                "text": "夏至の日の太陽の南中高度が最も高くなる理由として正しいのはどれですか？",
                "choices": [
                    "地軸が太陽の方向に最もかたむいているから",
                    "地球が太陽に最も近いから",
                    "太陽が大きいから",
                    "昼の長さが長いから"
                ],
                "answer": 0,
                "explanation": "夏至の日は、地軸が太陽の方向に最もかたむいているため、北半球では太陽の南中高度が最も高くなる"
            }
        ],
        "月の満ち欠け周期": [
            {
                "text": "月の満ち欠けの周期は約何日ですか？",
                "choices": [
                    "約29.5日",
                    "約27.3日",
                    "約30日",
                    "約28日"
                ],
                "answer": 0,
                "explanation": "月の満ち欠けの周期は約29.5日である"
            },
            {
                "text": "月の満ち欠けの周期が公転周期（約27.3日）より長い理由として正しいのはどれですか？",
                "choices": [
                    "地球も太陽の周りを公転しているため",
                    "月が自転しているため",
                    "月の大きさが変わるため",
                    "観測する場所が変わるため"
                ],
                "answer": 0,
                "explanation": "月の満ち欠けの周期が公転周期より約2日長いのは、月が公転する間に地球も太陽の周りを公転しているため"
            },
            {
                "text": "月の公転周期は約何日ですか？",
                "choices": [
                    "約27.3日",
                    "約29.5日",
                    "約30日",
                    "約28日"
                ],
                "answer": 0,
                "explanation": "月の公転周期は約27.3日である"
            }
        ],
        "地層を構成する岩石": [
            {
                "text": "れきが固まってできる岩石を何といいますか？",
                "choices": [
                    "れき岩",
                    "砂岩",
                    "泥岩",
                    "石灰岩"
                ],
                "answer": 0,
                "explanation": "れきが固まってできる岩石をれき岩という"
            },
            {
                "text": "砂が固まってできる岩石を何といいますか？",
                "choices": [
                    "砂岩",
                    "れき岩",
                    "泥岩",
                    "石灰岩"
                ],
                "answer": 0,
                "explanation": "砂が固まってできる岩石を砂岩という"
            },
            {
                "text": "どろが固まってできる岩石を何といいますか？",
                "choices": [
                    "泥岩",
                    "れき岩",
                    "砂岩",
                    "石灰岩"
                ],
                "answer": 0,
                "explanation": "どろが固まってできる岩石を泥岩という"
            }
        ],
        "地層の堆積順": [
            {
                "text": "地層の新旧を判断する方法として正しいのはどれですか？",
                "choices": [
                    "下にある層ほど古く、上にある層ほど新しい",
                    "上にある層ほど古く、下にある層ほど新しい",
                    "左右で判断する",
                    "色で判断する"
                ],
                "answer": 0,
                "explanation": "地層は下から上に積み重なっていくため、下にある層ほど古く、上にある層ほど新しい"
            },
            {
                "text": "地層のつながりを調べる手がかりとなる層を何といいますか？",
                "choices": [
                    "かぎ層",
                    "基準層",
                    "標準層",
                    "特徴層"
                ],
                "answer": 0,
                "explanation": "火山灰の層など、限られた時期に広い範囲に降り積もった層をかぎ層といい、地層のつながりを調べる手がかりになる"
            },
            {
                "text": "かぎ層として使われるものの例として正しいのはどれですか？",
                "choices": [
                    "火山灰の層",
                    "れきの層",
                    "砂の層",
                    "どろの層"
                ],
                "answer": 0,
                "explanation": "火山灰の層は、限られた時期に広い範囲に降り積もるため、かぎ層として使われる"
            }
        ]
    }
}

def read_lesson_file(filepath):
    """レッスンファイルを読み込む"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        # window.questions = [...] の部分を抽出
        if 'window.questions' in content:
            # JavaScriptの実行コンテキストをシミュレート
            exec(content, {'window': {'questions': []}})
        return content
    except FileNotFoundError:
        return None

def parse_questions_from_js(content):
    """JavaScriptファイルから問題を抽出"""
    import re
    # window.questions = [...] の部分を抽出
    match = re.search(r'window\.questions\s*=\s*(\[[\s\S]*?\])', content)
    if match:
        js_array = match.group(1)
        # JavaScriptの配列をPythonのリストに変換（簡易版）
        # 実際にはより堅牢なパーサーが必要
        try:
            # JSONとしてパースできるように修正
            js_array = js_array.replace("'", '"')  # 簡易的な変換
            questions = json.loads(js_array)
            return questions
        except:
            pass
    return []

def add_questions_to_lesson(filepath, new_questions, is_wakaru=False):
    """レッスンファイルに問題を追加"""
    if not os.path.exists(filepath):
        print(f"ファイルが見つかりません: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 既存の問題を抽出
    import re
    match = re.search(r'window\.questions\s*=\s*(\[[\s\S]*?\])', content)
    if not match:
        print(f"window.questionsが見つかりません: {filepath}")
        return False
    
    # 既存の問題をパース（簡易版）
    # 実際にはより堅牢なパーサーが必要
    try:
        # 既存のqnumの最大値を取得
        existing_qnums = re.findall(r'"qnum":\s*(\d+)', content)
        max_qnum = max([int(n) for n in existing_qnums]) if existing_qnums else 0
        
        # 新しい問題を追加
        new_qnum = max_qnum + 1
        questions_to_add = []
        
        for q in new_questions:
            question_obj = {
                "qnum": new_qnum,
                "text": q["text"],
                "choices": q["choices"],
                "answer": q["answer"],
                "source": q["explanation"] if is_wakaru else "",
                "tags": [],
                "difficulty": 1,
                "asof": "2025-01-27"
            }
            questions_to_add.append(question_obj)
            new_qnum += 1
        
        # 配列の最後に追加
        # ] の前に追加
        insert_pos = content.rfind(']')
        if insert_pos == -1:
            print(f"配列の終了が見つかりません: {filepath}")
            return False
        
        # 新しい問題のJSONを生成
        import json
        questions_json = ',\n  '.join([json.dumps(q, ensure_ascii=False, indent=2) for q in questions_to_add])
        questions_json = '  ' + questions_json.replace('\n', '\n  ')
        
        # 挿入
        if max_qnum > 0:
            # 既存の問題がある場合、カンマを追加
            new_content = content[:insert_pos] + ',\n' + questions_json + '\n' + content[insert_pos:]
        else:
            # 最初の問題の場合
            new_content = content[:insert_pos] + '\n' + questions_json + '\n' + content[insert_pos:]
        
        # ファイルに書き込み
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ {len(new_questions)}問を追加しました: {filepath}")
        return True
        
    except Exception as e:
        print(f"エラー: {filepath} - {e}")
        return False

def main():
    """メイン処理"""
    base_dir = Path(__file__).parent
    
    for field, items in QUESTION_TO_LESSON.items():
        for item_name, lesson_map in items.items():
            questions = QUESTIONS_DATA.get(field, {}).get(item_name, [])
            if not questions:
                print(f"問題データが見つかりません: {field} - {item_name}")
                continue
            
            # oboeru版
            if "oboeru" in lesson_map:
                oboeru_file = base_dir / "oboeru" / lesson_map["oboeru"]
                if oboeru_file.exists():
                    add_questions_to_lesson(str(oboeru_file), questions, is_wakaru=False)
            
            # wakaru版
            if "wakaru" in lesson_map:
                wakaru_file = base_dir / "wakaru" / lesson_map["wakaru"]
                if wakaru_file.exists():
                    add_questions_to_lesson(str(wakaru_file), questions, is_wakaru=True)
                else:
                    print(f"ファイルが見つかりません: {wakaru_file}")

if __name__ == "__main__":
    main()

