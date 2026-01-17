import sys
import json

try:
    import openpyxl
except ImportError:
    print("openpyxlがインストールされていません。インストール中...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl"])
    import openpyxl

# Excelファイルを読み込む
excel_path = r"C:\Users\admin\Downloads\理科項目洗い出し.xlsx"
wb = openpyxl.load_workbook(excel_path)

# 最初のシートを取得
ws = wb.active

# データを読み込む
data = []
headers = []

# 最初の行をヘッダーとして取得
for row_idx, row in enumerate(ws.iter_rows(values_only=True), 1):
    if row_idx == 1:
        headers = [str(cell) if cell is not None else "" for cell in row]
    else:
        row_data = {}
        for col_idx, cell in enumerate(row):
            header = headers[col_idx] if col_idx < len(headers) else f"Column{col_idx+1}"
            row_data[header] = str(cell) if cell is not None else ""
        if any(row_data.values()):  # 空行でない場合のみ追加
            data.append(row_data)

# JSON形式で出力
print(json.dumps(data, ensure_ascii=False, indent=2))



