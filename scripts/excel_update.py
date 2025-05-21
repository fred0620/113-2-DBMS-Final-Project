import sys
import json
from report import update_excel_table_with_chart, update_excel_table
from openpyxl import load_workbook

if __name__ == "__main__":
    args = json.loads(sys.argv[1])
    file_path = args["file_path"]
    output_path = args["output_path"]
    tasks = args["tasks"]

    wb = load_workbook(file_path)

    for task in tasks:
        sheet_name = task["sheet_name"]
        table_name = task["table_name"]
        data = task["data"]
        metadata = task.get("metadata", None)  # 有些表格可能沒有 metadata

        if sheet_name == "Social Interaction" and metadata:
            wb = update_excel_table_with_chart(wb, sheet_name, table_name, data, metadata)
        else:
            wb = update_excel_table(wb, sheet_name, table_name, data, start_col=3)

    wb.save(output_path)
    print(f"✅ Excel 多表格更新完成，輸出至 {output_path}")

