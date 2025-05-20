# excel_update.py
import sys
import json
from report import update_excel_table_with_chart
from report import update_excel_table# ← 你定義的函式檔案

if __name__ == "__main__":
    # 從命令列接收 JSON 字串參數
    args = json.loads(sys.argv[1])
    file_path = args["file_path"]
    output_path = args["output_path"]
    sheet_name = args["sheet_name"]
    table_name = args["table_name"]
    data = args["data"]
    metadata = args["metadata"]
    
    
    if sheet_name == 'Social Interaction':
        update_excel_table_with_chart(file_path, output_path, sheet_name, table_name, data, metadata)
    else:
        update_excel_table(file_path, output_path, sheet_name, table_name, data, start_col = 3)
