import ExcelJS from 'exceljs';

const updateExcelTable = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('/Users/yen/NCCU/大四（二）/DBMS/113-2-DBMS-Final-Project/src/assets/ReportTemplate.xlsx');

  const worksheet = workbook.getWorksheet('New SOP');
  const table = worksheet.getTable('Table1');

  // ❗切記：不要改 table.headerRow、ref、columns 等結構屬性
  // ✅ 只補上 worksheet 關聯，讓 ExcelJS 內部 function 正常
  if (!table.worksheet) table.worksheet = worksheet;

  // ✅ 安全清空資料（保留樣式、範圍、結構）
  while (table.rowCount > 0) {
    table.removeRow(0); // ⚠️ 注意這裡是 row index，相對於表格資料列，不含表頭
  }

  // ✅ 寫入資料（Excel 會套用樣式，自動延伸範圍）
  const newRows = [
    ['SOP001', '建立流程', '2025-04-26 16:44:18', 'v1.0'],
    ['SOP002', '審核流程', '2025-04-26 16:44:18', 'v1.1'],
  ];
  newRows.forEach(row => table.addRow(row)); // ✅ 安全加入資料

  // ❌ 不需要 table.commit()（已內建）
  await workbook.xlsx.writeFile('output.xlsx');
  console.log('✅ 資料已寫入 Table1，範圍與格式保留');
};

updateExcelTable().catch(console.error);
