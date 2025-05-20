const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { execFile } = require("child_process");

const PYTHON_PATH = process.env.PYTHON_PATH || "python3";
const args = {
  file_path: path.resolve("scripts/ReportTemplate.xlsx"),
  output_path: path.resolve("scripts/output.xlsx"),
  sheet_name: "Social Interaction",
  table_name: "Table3",
  data: [
    ["sop001", "yen", 10, 20],
    ["sop002", "yen", 10, 20]
  ],
  metadata: {
    Department: "IT",
    Manager: "Yen",
    "Start Time": "2025-05-21 09:00",
    "End Time": "2025-05-21 18:00"
  }
};

execFile(
  PYTHON_PATH,
  ["scripts/excel_update.py", JSON.stringify(args)],
  { stdio: "inherit" }, // 正確指定 options，這裡是讓輸出顯示在終端機
  (error, stdout, stderr) => {
    if (error) {
      console.error("❌ 執行錯誤：", error);
    } else {
      console.log("✅ 執行成功");
    }
  }
);
