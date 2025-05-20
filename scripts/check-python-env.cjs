const { execSync } = require('child_process');

let pythonCmd = 'python3';

try {
  // 檢查 Python 是否存在
  execSync(`${pythonCmd} --version`, { stdio: 'inherit' });
} catch {
  console.error('❌ 沒有找到 python3，請先安裝 Python 3 並加入 PATH。');
  process.exit(1);
}

try {
  // 檢查 openpyxl 是否已安裝
  execSync(`${pythonCmd} -c "import openpyxl"`, { stdio: 'ignore' });
  console.log('✅ openpyxl 已安裝');
} catch {
  console.error('❌ 尚未安裝 openpyxl');
  console.log(`📎 請執行：${pythonCmd} -m pip install openpyxl`);
}
