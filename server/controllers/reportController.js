const { generateExcelReport } = require("../../scripts/generateExcelReport.cjs");
//const { UpdateOverview } = require("../services/updateOverview");
const {
  getSocialInteraction,
  getNewSOP,
  getSOPLogs
} = require("../models/reportModel");
const path = require("path");
const fs = require("fs");

function formatTime(dt) {
  return new Date(dt).toISOString().slice(0, 19).replace("T", " ");
}

const exportReportHandler = async (req, res) => {
  const start = req.query.start_time;
  const end = req.query.end_time;
  const team_name = req.query.teamName;

  try {
    // ① 從 model / service 中撈資料
    const rows1 = await getSocialInteraction(team_name, start, end);
    const rows2 = await getNewSOP(team_name, start, end);
    const rows3 = await getSOPLogs(team_name, start, end);

    // ② 整理成報表輸出格式
    const templatePath = path.resolve(__dirname, "../../scripts/ReportTemplate.xlsx");
    const outputPath = path.resolve(__dirname, "../../scripts/output.xlsx");
    if (!fs.existsSync(templatePath)) {
        throw new Error(`❌ Excel 模板不存在：${templatePath}`);
    }

    const args = {
      file_path: templatePath,
      output_path: outputPath,
      tasks: [
        {
          sheet_name: "Social Interaction",
          table_name: "Table3",
          data: rows1.length > 0
            ? rows1.map(row => [row.SOP_ID, row.SOP_Name, row.view, row.save])
            : [["", "", "", ""]],
          metadata: {
            Team: team_name,
            Manager: "Yen",
            "Start Time": start,
            "End Time": end
          }
        },
        {
          sheet_name: "New SOP",
          table_name: "Table1",
          data: rows2.length > 0
            ? rows2.map(row => [row.SOP_ID, row.SOP_Name, formatTime(row.Create_Time)])
            : [["", "", ""]]
        },
        {
          sheet_name: "Update SOP",
          table_name: "Table2",
          data: rows3.length > 0
            ? rows3.map(row => [row.SOP_ID, row.SOP_Name, row.log, formatTime(row.Update_time), row.User_Name])
            : [["", "", ""]]
        }
      ]
    };

    // ③ 呼叫 Python 產出報表
    await generateExcelReport(args);

    // ④ 將檔案下載給前端（✅ 這行最關鍵）
    res.download(outputPath, `SOP_Report_${team_name}.xlsx`);

  } catch (error) {
    console.error("❌ 報表匯出錯誤：", error);
    res.status(500).json({ error: "報表匯出失敗", details: error.message });
  }
};

module.exports = { exportReportHandler };
