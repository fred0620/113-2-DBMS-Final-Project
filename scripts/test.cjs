const path = require("path");
const { generateExcelReport } = require("./generateExcelReport.cjs");

(async () => {
  const args = {
    file_path: path.resolve("scripts/ReportTemplate.xlsx"),
    output_path: path.resolve("scripts/output.xlsx"),
    tasks: [
      {
        sheet_name: "Social Interaction",
        table_name: "Table3",
        data: [
          ["sop001", "yen", 10, 20],
          ["sop002", "yen", 10, 20]
        ],
        metadata: {
          Department: "科技部",
          Manager: "Yen",
          "Start Time": "2025/05/16",
          "End Time": "2025/06/12"
        }
      },
      {
        sheet_name: "New SOP",
        table_name: "Table1",
        data: [
          ['SOP001', '建立流程', '2025-04-26 16:44:18', 'v1.0'],
          ['SOP002', '審核流程', '2025-04-26 16:44:18', 'v1.1']
        ]
      },
      {
        sheet_name: "Update SOP",
        table_name: "Table2",
        data: [
          ['S001', 'John Smith', 'VirtualLink VR Headset', 'Update', '2025/05/03 18:27', 'John Smith'],
          ['S002', 'Emily Johnson', 'QuantumSync Cloud Storage', 'Update', '2025/05/04 18:27', 'Emily Johnson']
        ]
      }
    ]
  };

  try {
    const result = await generateExcelReport(args);
    console.log(result); // ✅ 若成功，會印出：Excel 報表產出成功
  } catch (err) {
    console.error("❌ 測試失敗：", err.message);
  }
})();
