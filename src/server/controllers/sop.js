const sopModel = require('../models/sopsModel');



// 查詢符合條件的 SOP（多筆）
const searchSops = async (req, res) => {
  let keyword = (req.query.keyword || '').trim();
  
  // 解碼 URL 中的關鍵字參數，確保編碼正確
  
  console.log('Received keyword:',keyword);

  const department = req.query.department || '';
  const team = req.query.team || '';

  console.log('Search Parameters:', { keyword, department, team });

  try {
    const sops = await sopModel.searchSops(keyword, department, team);
    res.json(sops);
  } catch (err) {
    console.error('[SOP_ERROR] Failed to search SOPs:', err.message);
    res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
};


const getSopPage = (req, res) => {
    res.send(`Flowchart page for SOP ID: ${req.params.sop_id}`);
  };
  module.exports = { getSopPage, searchSops };
