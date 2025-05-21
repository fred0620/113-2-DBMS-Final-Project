const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { execFile } = require("child_process");

/**
 * 執行 Excel 報表產生器 Python 腳本
 * @param {Object} args - 包含 Excel 所需參數的物件
 * @returns {Promise<string>} 執行成功或錯誤訊息
 */
function generateExcelReport(args) {
  return new Promise((resolve, reject) => {
    const PYTHON_PATH = process.env.PYTHON_PATH || "python3";
    const scriptPath = path.resolve(__dirname, '../scripts/excel_update.py');

    execFile(
      PYTHON_PATH,
      [scriptPath, JSON.stringify(args)],
      { stdio: "inherit" },
      (error) => {
        if (error) {
          reject(new Error("❌ Python 執行錯誤：" + error.message));
        } else {
          resolve("✅ Excel 報表產出成功");
        }
      }
    );
  });
}

module.exports = { generateExcelReport };